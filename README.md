# Modern Property Management System

A multi-tenant, SaaS-style Property Management System (PMS) designed for boutique hoteliers. This application provides a unified operational dashboard to manage bookings, multi-property portfolios, guests, and finances.

## Features

- **Multi-Tenant Architecture**: Supports isolated organizations. Users authenticate and operate within a specific organization context.
- **Global Portfolio Switching**: Top-level navigation allows managers to seamlessly toggle between viewing "All Properties" or isolating operations to a single building.
- **Visual Calendar Timeline**: A horizontally scrolling 14-day timeline for visual occupancy tracking.
- **Centralized Financials**: Comprehensive tracking of base amounts, taxes, and payments with auto-calculation of nights stayed.
- **Guest Profiles & CRM**: Computes Lifetime Value (LTV) on the fly based on historical payments and bookings.
- **Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, and React Hook Form + Zod.

## Project Structure

The application follows a modular, feature-based architecture pattern:
- \`/src/components\` - Global shared components (UI primitives, Layout Shells)
- \`/src/features\` - Domain-specific modules (\`auth\`, \`bookings\`, \`calendar\`, \`guests\`, \`properties\`, \`payments\`, etc.)
- \`/src/lib\` - Utility functions, formatters, and the central data repository pattern.
- \`/src/types\` - Global TypeScript interfaces for the domain models.

## Development

The application is built using a local mock repository (\`LocalRepository.ts\`) that implements a unified \`IRepository\` interface. This ensures that all UI, routing, and form logic works seamlessly with realistic relational data (Organizations -> Properties -> Units -> Bookings -> Payments) without needing to configure a live backend during initial review.

To run locally:
1. \`npm install\`
2. \`npm run dev\`

## Honest Assessment (Limitations)

- **Authentication**: Uses a simulated \`useMockAuth\` hook. It requires entering an email but does not securely verify passwords or issue real JWTs.
- **Persistence**: Data is currently seeded locally in memory on startup. Changes made during a session (like creating a booking) will persist until the browser tab is refreshed.
- **Backend Migration**: The repository pattern (\`IRepository\`) was explicitly chosen so that moving to a real backend simply requires creating a new \`AppwriteRepository\` or \`SupabaseRepository\` class that implements the same interface, then swapping it in \`src/lib/repository/index.ts\`.

See \`APPWRITE_SETUP.md\` for notes on backend migration.
