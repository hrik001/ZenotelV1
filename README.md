# Zenotel - Modern Property Management System

A multi-tenant, SaaS-style Property Management System (PMS) designed for boutique hoteliers. This application provides a unified operational dashboard to manage bookings, multi-property portfolios, guests, and finances.

## Features

- **Multi-Tenant Architecture**: Supports isolated organizations via PostgreSQL query-level enforcement.
- **Role-Based Access Control**: Implements strict `Owner`, `Manager`, and `Staff` hierarchies with property-level scoping.
- **Global Portfolio Switching**: Top-level navigation allows managers to seamlessly toggle between viewing "All Properties" or isolating operations to a single building.
- **Visual Calendar Timeline**: A horizontally scrolling 14-day timeline for visual occupancy tracking.
- **Centralized Financials**: Comprehensive tracking of base amounts, taxes, and payments.
- **Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Express, Drizzle ORM, Firebase Auth, and Cloud SQL (PostgreSQL).

## Project Structure

The application follows a modular, feature-based architecture pattern:
- `/src/components` - Global shared components (UI primitives, Layout Shells)
- `/src/features` - Domain-specific modules (`auth`, `bookings`, `calendar`, `guests`, `properties`, `payments`, etc.)
- `/src/lib` - Utility functions and API repository pattern.
- `/src/api` - Express backend API routes and middleware.
- `/src/db` - Database schema and drizzle configuration.

## Development

The application is built as a full-stack Express + Vite application. It uses a real Cloud SQL PostgreSQL database via Drizzle ORM and authenticates users via Firebase Auth.

To run locally:
1. `npm install`
2. `npm run dev`

All API requests are proxied internally and authenticated via Firebase JWTs.
