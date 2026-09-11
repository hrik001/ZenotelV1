import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { eq, and, inArray } from 'drizzle-orm';
import {
  users,
  organizations,
  organizationMembers,
  properties,
  units,
  guests,
  bookings,
  payments
} from '../db/schema';

export const apiRouter = Router();

apiRouter.use(requireAuth);

// Helper to check basic org access
const verifyOrgAccess = async (userId: string, orgId: string) => {
  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organization_id, orgId),
      eq(organizationMembers.user_id, userId),
      inArray(organizationMembers.status, ['Active', 'Invited'])
    )
  });
  if (!membership) throw new Error('Forbidden');
  return membership;
};

const verifyOwnerAccess = async (userId: string, orgId: string) => {
  const membership = await verifyOrgAccess(userId, orgId);
  if (membership.role !== 'Owner') {
    throw new Error('Forbidden: Requires Owner role');
  }
  return membership;
};

const verifyPropertyAccess = async (userId: string, orgId: string, propertyId: string) => {
  const membership = await verifyOrgAccess(userId, orgId);
  if (membership.role === 'Owner') return membership;
  if (!membership.property_ids || !membership.property_ids.includes(propertyId)) {
    throw new Error('Forbidden: No access to this property');
  }
  return membership;
};

apiRouter.post('/auth/sync', async (req: AuthRequest, res) => {
  try {
    const { uid, email, name } = req.user!;
    const [user] = await db.insert(users).values({
      id: uid,
      email: email || '',
      name: name || email?.split('@')[0] || 'User',
    }).onConflictDoUpdate({
      target: users.id,
      set: { email: email || '', name: name || email?.split('@')[0] || 'User' }
    }).returning();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Organizations
apiRouter.get('/organizations', async (req: AuthRequest, res) => {
  try {
    const memberships = await db.query.organizationMembers.findMany({
      where: eq(organizationMembers.user_id, req.user!.uid)
    });
    const orgIds = memberships.map(m => m.organization_id);
    if (orgIds.length === 0) return res.json([]);
    
    const orgs = await db.query.organizations.findMany({
      where: inArray(organizations.id, orgIds)
    });
    res.json(orgs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/organizations', async (req: AuthRequest, res) => {
  try {
    const [org] = await db.insert(organizations).values({
      name: req.body.name,
      owner_user_id: req.user!.uid,
      business_type: req.body.business_type || [],
      country: req.body.country || 'US',
      timezone: req.body.timezone || 'UTC',
      default_currency: req.body.default_currency || 'USD',
    }).returning();

    await db.insert(organizationMembers).values({
      organization_id: org.id,
      user_id: req.user!.uid,
      role: 'Owner',
      status: 'Active'
    });

    res.json(org);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Members
apiRouter.get('/organizations/:orgId/members', async (req: AuthRequest, res) => {
  try {
    const orgId = req.params.orgId as string;
    await verifyOrgAccess(req.user!.uid, orgId);
    
    // We should also join with users table to get the email and name
    // Since we only have user_id, let's do a join
    const members = await db.select({
      id: organizationMembers.id,
      organization_id: organizationMembers.organization_id,
      user_id: organizationMembers.user_id,
      role: organizationMembers.role,
      status: organizationMembers.status,
      property_ids: organizationMembers.property_ids,
      created_at: organizationMembers.created_at,
      user: {
        id: users.id,
        name: users.name,
        email: users.email
      }
    }).from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.user_id, users.id))
      .where(eq(organizationMembers.organization_id, orgId));

    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Invite a member (MVP: we assume they already logged in and exist in users table, or we just fail if not found)
// To make it easy for MVP, we allow inviting by email. If user doesn't exist, we return 404.
apiRouter.post('/organizations/:orgId/members', async (req: AuthRequest, res) => {
  try {
    const orgId = req.params.orgId as string;
    await verifyOwnerAccess(req.user!.uid, orgId);
    
    const { email, role, property_ids } = req.body;
    const userToInvite = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User with this email not found. They must sign in once first.' });
    }

    const [member] = await db.insert(organizationMembers).values({
      organization_id: orgId,
      user_id: userToInvite.id,
      role,
      property_ids: property_ids || [],
      status: 'Active'
    }).returning();
    
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/organizations/:orgId/members/:id', async (req: AuthRequest, res) => {
  try {
    const orgId = req.params.orgId as string;
    const id = req.params.id as string;
    await verifyOwnerAccess(req.user!.uid, orgId);
    
    const [member] = await db.update(organizationMembers)
      .set({
        role: req.body.role,
        property_ids: req.body.property_ids,
        status: req.body.status
      })
      .where(eq(organizationMembers.id, id))
      .returning();
      
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Properties
apiRouter.get('/properties', async (req: AuthRequest, res) => {
  try {
    const orgId = req.query.orgId as string;
    const membership = await verifyOrgAccess(req.user!.uid, orgId);
    
    let conditions = [eq(properties.organization_id, orgId)];
    if (membership.role !== 'Owner') {
      if (!membership.property_ids || membership.property_ids.length === 0) {
        return res.json([]);
      }
      conditions.push(inArray(properties.id, membership.property_ids));
    }
    
    const result = await db.query.properties.findMany({
      where: and(...conditions)
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/properties', async (req: AuthRequest, res) => {
  try {
    await verifyOwnerAccess(req.user!.uid, req.body.organization_id);
    const [property] = await db.insert(properties).values(req.body).returning();
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/properties/:id', async (req: AuthRequest, res) => {
  try {
    await verifyOwnerAccess(req.user!.uid, req.body.organization_id);
    const id = req.params.id as string;
    const [property] = await db.update(properties).set(req.body).where(eq(properties.id, id)).returning();
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Units
apiRouter.get('/units', async (req: AuthRequest, res) => {
  try {
    const propertyId = req.query.propertyId as string;
    const orgId = req.query.orgId as string;
    
    let conditions = [];
    if (propertyId) {
      // Get the property to check org access
      const property = await db.query.properties.findFirst({ where: eq(properties.id, propertyId) });
      if (!property) return res.status(404).json({ error: 'Property not found' });
      await verifyPropertyAccess(req.user!.uid, property.organization_id, propertyId);
      conditions.push(eq(units.property_id, propertyId));
    } else if (orgId) {
      const membership = await verifyOrgAccess(req.user!.uid, orgId);
      conditions.push(eq(units.organization_id, orgId));
      if (membership.role !== 'Owner') {
        if (!membership.property_ids || membership.property_ids.length === 0) {
          return res.json([]);
        }
        conditions.push(inArray(units.property_id, membership.property_ids));
      }
    } else {
      return res.status(400).json({ error: 'Must provide propertyId or orgId' });
    }

    const result = await db.query.units.findMany({ where: and(...conditions) });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/units', async (req: AuthRequest, res) => {
  try {
    await verifyPropertyAccess(req.user!.uid, req.body.organization_id, req.body.property_id);
    const [unit] = await db.insert(units).values(req.body).returning();
    res.json(unit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/units/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const unit = await db.query.units.findFirst({ where: eq(units.id, id) });
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    
    await verifyPropertyAccess(req.user!.uid, unit.organization_id, unit.property_id);
    const [updatedUnit] = await db.update(units).set(req.body).where(eq(units.id, id)).returning();
    res.json(updatedUnit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Guests
apiRouter.get('/guests', async (req: AuthRequest, res) => {
  try {
    const orgId = req.query.orgId as string;
    await verifyOrgAccess(req.user!.uid, orgId);
    const result = await db.query.guests.findMany({
      where: eq(guests.organization_id, orgId)
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/guests', async (req: AuthRequest, res) => {
  try {
    await verifyOrgAccess(req.user!.uid, req.body.organization_id);
    const [guest] = await db.insert(guests).values(req.body).returning();
    res.json(guest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/guests/:id', async (req: AuthRequest, res) => {
  try {
    await verifyOrgAccess(req.user!.uid, req.body.organization_id);
    const id = req.params.id as string;
    const [guest] = await db.update(guests).set(req.body).where(eq(guests.id, id)).returning();
    res.json(guest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bookings
apiRouter.get('/bookings', async (req: AuthRequest, res) => {
  try {
    const orgId = req.query.orgId as string;
    const propertyId = req.query.propertyId as string;
    const membership = await verifyOrgAccess(req.user!.uid, orgId);
    
    let conditions = [eq(bookings.organization_id, orgId)];
    if (propertyId) {
      await verifyPropertyAccess(req.user!.uid, orgId, propertyId);
      conditions.push(eq(bookings.property_id, propertyId));
    } else if (membership.role !== 'Owner') {
      if (!membership.property_ids || membership.property_ids.length === 0) {
        return res.json([]);
      }
      conditions.push(inArray(bookings.property_id, membership.property_ids));
    }
    
    const result = await db.query.bookings.findMany({
      where: and(...conditions)
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/bookings', async (req: AuthRequest, res) => {
  try {
    await verifyPropertyAccess(req.user!.uid, req.body.organization_id, req.body.property_id);
    const [booking] = await db.insert(bookings).values({
      ...req.body,
      check_in: req.body.check_in,
      check_out: req.body.check_out,
    }).returning();
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/bookings/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    await verifyPropertyAccess(req.user!.uid, booking.organization_id, booking.property_id);
    const [updatedBooking] = await db.update(bookings).set({
      ...req.body,
      check_in: req.body.check_in,
      check_out: req.body.check_out,
    }).where(eq(bookings.id, id)).returning();
    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments
apiRouter.get('/payments', async (req: AuthRequest, res) => {
  try {
    const orgId = req.query.orgId as string;
    const bookingId = req.query.bookingId as string;
    const membership = await verifyOrgAccess(req.user!.uid, orgId);
    
    let conditions = [eq(payments.organization_id, orgId)];
    if (bookingId) {
      const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, bookingId) });
      if (booking) {
        await verifyPropertyAccess(req.user!.uid, orgId, booking.property_id);
      }
      conditions.push(eq(payments.booking_id, bookingId));
    } else if (membership.role !== 'Owner') {
      // It's a bit complex to filter payments by property if we don't have property_id on payments
      // For now, let's just use org level access, or if they want to see all payments, they need to be an Owner?
      // Wait, payments belong to bookings, which belong to properties. If the user isn't Owner, we would need to join.
      // Since it's MVP, if no bookingId is provided and they aren't owner, return error or join. Let's return error to enforce they ask for specific booking.
      return res.status(403).json({ error: 'Must provide bookingId to view payments as non-Owner' });
    }
    
    const result = await db.query.payments.findMany({
      where: and(...conditions)
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/payments', async (req: AuthRequest, res) => {
  try {
    const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, req.body.booking_id) });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    await verifyPropertyAccess(req.user!.uid, req.body.organization_id, booking.property_id);
    const [payment] = await db.insert(payments).values({
      ...req.body,
      date: new Date(req.body.date)
    }).returning();
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
