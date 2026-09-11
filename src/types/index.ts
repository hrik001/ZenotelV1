export type BusinessType = 'Hotel' | 'Hostel' | 'Dormitory' | 'Homestay' | 'Resort' | 'Boutique' | 'Guesthouse' | 'Other';
export type Role = 'Owner' | 'Manager' | 'Staff';
export type MemberStatus = 'Invited' | 'Active' | 'Removed';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'No Show';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Refunded';
export type UnitStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Inactive';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  owner_user_id: string;
  business_type: BusinessType[];
  country: string;
  timezone: string;
  default_currency: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  status: MemberStatus;
  property_ids: string[];
  created_at: string;
  user?: User; // added from JOIN
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  property_type: BusinessType;
  country: string;
  state: string;
  city: string;
  address: string;
  timezone: string;
  currency: string;
  phone?: string;
  email?: string;
  active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  organization_id: string;
  name: string;
  unit_type: string;
  capacity: number;
  status: UnitStatus;
  active: boolean;
  created_at: string;
}

export interface Guest {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  organization_id: string;
  property_id: string;
  unit_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  status: BookingStatus;
  base_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  booking_id: string;
  guest_id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
  created_at: string;
}
