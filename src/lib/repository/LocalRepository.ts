import { Booking, Guest, Organization, OrganizationMember, Payment, Property, Unit, User } from '../../types';
import { generateId } from '../utils';
import { IRepository } from './IRepository';

const STORAGE_KEY = 'bookzee_db_v1';

interface DB {
  users: User[];
  organizations: Organization[];
  members: OrganizationMember[];
  properties: Property[];
  units: Unit[];
  guests: Guest[];
  bookings: Booking[];
  payments: Payment[];
}

const initialDb: DB = {
  users: [],
  organizations: [],
  members: [],
  properties: [],
  units: [],
  guests: [],
  bookings: [],
  payments: [],
};

// Seed with some demo data to make it easier to test
const seedDb = (db: DB) => {
  if (db.users.length > 0) return db;

  const userId = 'u_demo123';
  const orgId = 'org_demo123';
  const propId = 'prop_demo123';
  const unitId = 'unit_demo123';
  const guestId = 'guest_demo123';
  const bookingId = 'bk_demo123';

  db.users.push({ id: userId, email: 'demo@bookzee.com', name: 'Demo User', created_at: new Date().toISOString() });
  
  db.organizations.push({
    id: orgId,
    name: 'Valley View Hospitality',
    owner_user_id: userId,
    business_type: ['Hotel'],
    country: 'US',
    timezone: 'UTC',
    default_currency: 'USD',
    created_at: new Date().toISOString()
  });
  
  db.members.push({ id: generateId(), organization_id: orgId, user_id: userId, role: 'Owner', created_at: new Date().toISOString() });
  
  db.properties.push({
    id: propId,
    organization_id: orgId,
    name: 'Valley View Resort',
    property_type: 'Hotel',
    country: 'US',
    state: 'CA',
    city: 'San Francisco',
    address: '123 Valley Road',
    timezone: 'UTC',
    currency: 'USD',
    active: true,
    created_at: new Date().toISOString()
  });

  db.units.push({
    id: unitId,
    property_id: propId,
    organization_id: orgId,
    name: 'Room 204',
    unit_type: 'Deluxe King',
    capacity: 2,
    status: 'Available',
    active: true,
    created_at: new Date().toISOString()
  });

  db.guests.push({
    id: guestId,
    organization_id: orgId,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+1 555 123 4567',
    created_at: new Date().toISOString()
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);

  db.bookings.push({
    id: bookingId,
    organization_id: orgId,
    property_id: propId,
    unit_id: unitId,
    guest_id: guestId,
    check_in: today.toISOString().split('T')[0],
    check_out: tomorrow.toISOString().split('T')[0],
    guests_count: 2,
    status: 'Confirmed',
    base_amount: 300,
    tax_amount: 30,
    total_amount: 330,
    paid_amount: 100,
    created_at: new Date().toISOString()
  });

  db.payments.push({
    id: 'pay_demo123',
    organization_id: orgId,
    booking_id: bookingId,
    guest_id: guestId,
    amount: 100,
    method: 'Credit Card',
    status: 'Paid',
    date: new Date().toISOString(),
    created_at: new Date().toISOString()
  });

  return db;
};

export class LocalRepository implements IRepository {
  private db: DB;
  private currentUser: User | null = null;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.db = JSON.parse(stored);
    } else {
      this.db = seedDb(initialDb);
      this.save();
    }
    
    // Check session
    const session = localStorage.getItem(`${STORAGE_KEY}_session`);
    if (session) {
      this.currentUser = this.db.users.find(u => u.id === session) || null;
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  private async delay<T>(data: T, ms = 300): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), ms));
  }

  private requireAuth() {
    if (!this.currentUser) throw new Error("Unauthorized");
    return this.currentUser;
  }

  private checkOrgAccess(orgId: string) {
    const user = this.requireAuth();
    const isMember = this.db.members.some(m => m.organization_id === orgId && m.user_id === user.id);
    if (!isMember) throw new Error("Unauthorized access to organization");
  }

  // --- Auth ---
  async login(email: string): Promise<User> {
    let user = this.db.users.find(u => u.email === email);
    if (!user) {
      user = { id: generateId(), email, name: email.split('@')[0], created_at: new Date().toISOString() };
      this.db.users.push(user);
      this.save();
    }
    this.currentUser = user;
    localStorage.setItem(`${STORAGE_KEY}_session`, user.id);
    return this.delay(user);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.delay(this.currentUser);
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(`${STORAGE_KEY}_session`);
    await this.delay(undefined);
  }

  // --- Organization ---
  async createOrganization(data: Partial<Organization>, userId: string): Promise<Organization> {
    const org: Organization = {
      id: generateId(),
      name: data.name!,
      legal_name: data.legal_name,
      owner_user_id: userId,
      business_type: data.business_type || [],
      country: data.country!,
      timezone: data.timezone || 'UTC',
      default_currency: data.default_currency || 'USD',
      created_at: new Date().toISOString()
    };
    this.db.organizations.push(org);
    this.db.members.push({
      id: generateId(),
      organization_id: org.id,
      user_id: userId,
      role: 'Owner',
      created_at: new Date().toISOString()
    });
    this.save();
    return this.delay(org);
  }

  async getOrganizations(userId: string): Promise<Organization[]> {
    const memberOrgs = this.db.members.filter(m => m.user_id === userId).map(m => m.organization_id);
    return this.delay(this.db.organizations.filter(o => memberOrgs.includes(o.id)));
  }

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    this.checkOrgAccess(orgId);
    return this.delay(this.db.members.filter(m => m.organization_id === orgId));
  }

  // --- Properties ---
  async getProperties(orgId: string): Promise<Property[]> {
    this.checkOrgAccess(orgId);
    return this.delay(this.db.properties.filter(p => p.organization_id === orgId));
  }

  async createProperty(data: Partial<Property>): Promise<Property> {
    this.checkOrgAccess(data.organization_id!);
    const property: Property = {
      id: generateId(),
      organization_id: data.organization_id!,
      name: data.name!,
      property_type: data.property_type!,
      country: data.country!,
      state: data.state!,
      city: data.city!,
      address: data.address!,
      timezone: data.timezone || 'UTC',
      currency: data.currency || 'USD',
      phone: data.phone,
      email: data.email,
      active: true,
      created_at: new Date().toISOString()
    };
    this.db.properties.push(property);
    this.save();
    return this.delay(property);
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const idx = this.db.properties.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Not found");
    this.checkOrgAccess(this.db.properties[idx].organization_id);
    this.db.properties[idx] = { ...this.db.properties[idx], ...data };
    this.save();
    return this.delay(this.db.properties[idx]);
  }

  // --- Units ---
  async getUnits(propertyId: string): Promise<Unit[]> {
    const property = this.db.properties.find(p => p.id === propertyId);
    if (property) this.checkOrgAccess(property.organization_id);
    return this.delay(this.db.units.filter(u => u.property_id === propertyId));
  }

  async createUnit(data: Partial<Unit>): Promise<Unit> {
    this.checkOrgAccess(data.organization_id!);
    const unit: Unit = {
      id: generateId(),
      property_id: data.property_id!,
      organization_id: data.organization_id!,
      name: data.name!,
      unit_type: data.unit_type!,
      capacity: data.capacity || 2,
      status: data.status || 'Available',
      active: true,
      created_at: new Date().toISOString()
    };
    this.db.units.push(unit);
    this.save();
    return this.delay(unit);
  }

  async updateUnit(id: string, data: Partial<Unit>): Promise<Unit> {
    const idx = this.db.units.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("Not found");
    this.checkOrgAccess(this.db.units[idx].organization_id);
    this.db.units[idx] = { ...this.db.units[idx], ...data };
    this.save();
    return this.delay(this.db.units[idx]);
  }

  // --- Guests ---
  async getGuests(orgId: string): Promise<Guest[]> {
    this.checkOrgAccess(orgId);
    return this.delay(this.db.guests.filter(g => g.organization_id === orgId));
  }

  async createGuest(data: Partial<Guest>): Promise<Guest> {
    this.checkOrgAccess(data.organization_id!);
    const guest: Guest = {
      id: generateId(),
      organization_id: data.organization_id!,
      name: data.name!,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      created_at: new Date().toISOString()
    };
    this.db.guests.push(guest);
    this.save();
    return this.delay(guest);
  }

  async updateGuest(id: string, data: Partial<Guest>): Promise<Guest> {
    const idx = this.db.guests.findIndex(g => g.id === id);
    if (idx === -1) throw new Error("Not found");
    this.checkOrgAccess(this.db.guests[idx].organization_id);
    this.db.guests[idx] = { ...this.db.guests[idx], ...data };
    this.save();
    return this.delay(this.db.guests[idx]);
  }

  // --- Bookings ---
  async getBookings(orgId: string, propertyId?: string): Promise<Booking[]> {
    this.checkOrgAccess(orgId);
    let filter = this.db.bookings.filter(b => b.organization_id === orgId);
    if (propertyId) filter = filter.filter(b => b.property_id === propertyId);
    return this.delay(filter);
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    this.checkOrgAccess(data.organization_id!);
    const booking: Booking = {
      id: generateId(),
      organization_id: data.organization_id!,
      property_id: data.property_id!,
      unit_id: data.unit_id!,
      guest_id: data.guest_id!,
      check_in: data.check_in!,
      check_out: data.check_out!,
      guests_count: data.guests_count || 1,
      status: data.status || 'Pending',
      base_amount: data.base_amount || 0,
      tax_amount: data.tax_amount || 0,
      total_amount: data.total_amount || 0,
      paid_amount: data.paid_amount || 0,
      created_at: new Date().toISOString()
    };
    this.db.bookings.push(booking);
    this.save();
    return this.delay(booking);
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const idx = this.db.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error("Not found");
    this.checkOrgAccess(this.db.bookings[idx].organization_id);
    this.db.bookings[idx] = { ...this.db.bookings[idx], ...data };
    this.save();
    return this.delay(this.db.bookings[idx]);
  }

  // --- Payments ---
  async getPayments(orgId: string, bookingId?: string): Promise<Payment[]> {
    this.checkOrgAccess(orgId);
    let filter = this.db.payments.filter(p => p.organization_id === orgId);
    if (bookingId) filter = filter.filter(p => p.booking_id === bookingId);
    return this.delay(filter);
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    this.checkOrgAccess(data.organization_id!);
    const payment: Payment = {
      id: generateId(),
      organization_id: data.organization_id!,
      booking_id: data.booking_id!,
      guest_id: data.guest_id!,
      amount: data.amount!,
      method: data.method!,
      status: data.status || 'Paid',
      date: data.date || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    this.db.payments.push(payment);
    this.save();
    return this.delay(payment);
  }
}
