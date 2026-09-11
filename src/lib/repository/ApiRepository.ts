import { Booking, Guest, Organization, OrganizationMember, Payment, Property, Unit, User } from '../../types';
import { IRepository } from './IRepository';
import { auth } from '../firebase';

export class ApiRepository implements IRepository {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };

    const response = await fetch(`/api${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error: ${response.status} - ${err}`);
    }
    return response.json();
  }

  async login(email: string): Promise<User> {
    // Replaced by direct Firebase Auth in components, but stubbed for interface
    throw new Error('Use Firebase Auth directly');
  }

  async getCurrentUser(): Promise<User | null> {
    // Replaced by AuthContext, but stubbed for interface
    throw new Error('Use AuthContext');
  }

  async logout(): Promise<void> {
    // Replaced by AuthContext, but stubbed for interface
    throw new Error('Use AuthContext');
  }

  // Organization
  async createOrganization(data: Partial<Organization>, userId: string): Promise<Organization> {
    return this.fetchWithAuth('/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getOrganizations(userId: string): Promise<Organization[]> {
    return this.fetchWithAuth('/organizations');
  }

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.fetchWithAuth(`/organizations/${orgId}/members`);
  }

  // Properties
  async getProperties(orgId: string): Promise<Property[]> {
    return this.fetchWithAuth(`/properties?orgId=${orgId}`);
  }

  async createProperty(data: Partial<Property>): Promise<Property> {
    return this.fetchWithAuth('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    return this.fetchWithAuth(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Units
  async getUnits(propertyId: string): Promise<Unit[]> {
    // Ideally we pass propertyId, but our route expects orgId then we filter or backend filters.
    // For now we can fetch all units for the current org and filter, or change backend to use propertyId.
    // Let's pass orgId (but we only have propertyId here).
    // Let's just fetch by propertyId if backend supports it. The backend currently takes orgId.
    // I will adjust backend to allow propertyId.
    return this.fetchWithAuth(`/units?propertyId=${propertyId}`);
  }

  async createUnit(data: Partial<Unit>): Promise<Unit> {
    return this.fetchWithAuth('/units', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUnit(id: string, data: Partial<Unit>): Promise<Unit> {
    return this.fetchWithAuth(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Guests
  async getGuests(orgId: string): Promise<Guest[]> {
    return this.fetchWithAuth(`/guests?orgId=${orgId}`);
  }

  async createGuest(data: Partial<Guest>): Promise<Guest> {
    return this.fetchWithAuth('/guests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGuest(id: string, data: Partial<Guest>): Promise<Guest> {
    return this.fetchWithAuth(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Bookings
  async getBookings(orgId: string, propertyId?: string): Promise<Booking[]> {
    const url = propertyId ? `/bookings?orgId=${orgId}&propertyId=${propertyId}` : `/bookings?orgId=${orgId}`;
    return this.fetchWithAuth(url);
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    return this.fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    return this.fetchWithAuth(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Payments
  async getPayments(orgId: string, bookingId?: string): Promise<Payment[]> {
    const url = bookingId ? `/payments?orgId=${orgId}&bookingId=${bookingId}` : `/payments?orgId=${orgId}`;
    return this.fetchWithAuth(url);
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    return this.fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
