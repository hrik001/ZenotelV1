import { Booking, Guest, Organization, OrganizationMember, Payment, Property, Unit, User } from '../../types';

export interface IRepository {
  // Auth
  login(email: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;

  // Organization
  createOrganization(data: Partial<Organization>, userId: string): Promise<Organization>;
  getOrganizations(userId: string): Promise<Organization[]>;
  getOrganizationMembers(orgId: string): Promise<OrganizationMember[]>;
  inviteOrganizationMember?(orgId: string, email: string, role: string, property_ids: string[]): Promise<OrganizationMember>;
  updateOrganizationMember?(orgId: string, id: string, data: Partial<OrganizationMember>): Promise<OrganizationMember>;

  // Properties
  getProperties(orgId: string): Promise<Property[]>;
  createProperty(data: Partial<Property>): Promise<Property>;
  updateProperty(orgId: string, id: string, data: Partial<Property>): Promise<Property>;

  // Units
  getUnits(propertyId: string): Promise<Unit[]>;
  createUnit(data: Partial<Unit>): Promise<Unit>;
  updateUnit(id: string, data: Partial<Unit>): Promise<Unit>;

  // Guests
  getGuests(orgId: string): Promise<Guest[]>;
  createGuest(data: Partial<Guest>): Promise<Guest>;
  updateGuest(id: string, data: Partial<Guest>): Promise<Guest>;

  // Bookings
  getBookings(orgId: string, propertyId?: string): Promise<Booking[]>;
  createBooking(data: Partial<Booking>): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;

  // Payments
  getPayments(orgId: string, bookingId?: string): Promise<Payment[]>;
  createPayment(data: Partial<Payment>): Promise<Payment>;

  // Documents
  getPropertyDocuments?(orgId: string, propertyId: string): Promise<any[]>;
  uploadPropertyDocument?(orgId: string, propertyId: string, file: File, category: string, label: string): Promise<any>;
  downloadPropertyDocument?(orgId: string, propertyId: string, docId: string): Promise<{ url: string }>;
}
