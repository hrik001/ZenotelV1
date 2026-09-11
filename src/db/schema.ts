import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  numeric,
  jsonb,
  date
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Firebase Auth UID
  email: text("email").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  legal_name: text("legal_name"),
  owner_user_id: text("owner_user_id").references(() => users.id).notNull(),
  business_type: text("business_type").array().notNull(), // text array
  country: text("country").notNull(),
  timezone: text("timezone").notNull(),
  default_currency: text("default_currency").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  user_id: text("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'Owner' | 'Manager' | 'Staff'
  property_ids: text("property_ids").array(), // UUID strings, undefined/null for Owners
  invited_by: text("invited_by").references(() => users.id),
  status: text("status").notNull(), // 'Active' | 'Invited' | 'Removed'
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  property_type: text("property_type").notNull(),
  country: text("country").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  timezone: text("timezone").notNull(),
  currency: text("currency").notNull(),
  phone: text("phone"),
  email: text("email"),
  active: boolean("active").default(true).notNull(),
  archived_at: timestamp("archived_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  property_id: uuid("property_id").references(() => properties.id).notNull(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  unit_type: text("unit_type").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status").notNull(),
  active: boolean("active").default(true).notNull(),
  archived_at: timestamp("archived_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  archived_at: timestamp("archived_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  property_id: uuid("property_id").references(() => properties.id).notNull(),
  unit_id: uuid("unit_id").references(() => units.id).notNull(),
  guest_id: uuid("guest_id").references(() => guests.id).notNull(),
  check_in: date("check_in").notNull(),
  check_out: date("check_out").notNull(),
  guests_count: integer("guests_count").notNull(),
  status: text("status").notNull(), // Pending, Confirmed, Checked In, Checked Out, Cancelled, No Show
  base_amount: numeric("base_amount", { precision: 12, scale: 2 }).notNull(),
  tax_amount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  total_amount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paid_amount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull(),
  archived_at: timestamp("archived_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  booking_id: uuid("booking_id").references(() => bookings.id).notNull(),
  guest_id: uuid("guest_id").references(() => guests.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(), // Pending, Partial, Paid, Refunded
  date: timestamp("date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const organizationDocuments = pgTable("organization_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  file_ref: text("file_ref").notNull(),
  uploaded_by: text("uploaded_by").references(() => users.id).notNull(),
  file_size: integer("file_size").notNull(),
  mime_type: text("mime_type").notNull(),
  version: integer("version").notNull().default(1),
  replaced_document_id: uuid("replaced_document_id"),
  deleted_at: timestamp("deleted_at"),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

export const propertyDocuments = pgTable("property_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  property_id: uuid("property_id").references(() => properties.id).notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  file_ref: text("file_ref").notNull(),
  uploaded_by: text("uploaded_by").references(() => users.id).notNull(),
  file_size: integer("file_size").notNull(),
  mime_type: text("mime_type").notNull(),
  version: integer("version").notNull().default(1),
  replaced_document_id: uuid("replaced_document_id"),
  deleted_at: timestamp("deleted_at"),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

export const businessSettings = pgTable("business_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  property_id: uuid("property_id").references(() => properties.id),
  document_checklist: jsonb("document_checklist").default('[]').notNull(),
  tax_label: text("tax_label"),
  tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }),
  gst_number: text("gst_number"),
  pan_number: text("pan_number"),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").references(() => organizations.id).notNull(),
  property_id: uuid("property_id").references(() => properties.id),
  actor_user_id: text("actor_user_id").references(() => users.id).notNull(),
  actor_name: text("actor_name").notNull(),
  action: text("action").notNull(),
  entity_type: text("entity_type").notNull(),
  entity_id: text("entity_id").notNull(),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
