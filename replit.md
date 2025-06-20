# RateMyKOL - Platform Documentation

## Overview

RateMyKOL is a full-stack web application designed as a platform for rating and reviewing KOLs (Key Opinion Leaders). The application uses a modern tech stack with React frontend, Express backend, and PostgreSQL database, featuring a shadcn/ui design system for a polished user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for fast bundling

### Database Layer
- **Database**: PostgreSQL (configured for production)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless driver for PostgreSQL

## Key Components

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Schema Definition**: Located in `shared/schema.ts` with Zod validation
- **Type Safety**: Auto-generated TypeScript types from Drizzle schema

### Authentication System
- **Storage Interface**: Abstracted storage layer with memory and database implementations
- **User Management**: CRUD operations for user entities
- **Session Handling**: Built-in session management capabilities

### UI Component System
- **Design System**: shadcn/ui "new-york" style variant
- **Component Library**: Comprehensive set of accessible components
- **Theming**: CSS custom properties with light/dark mode support
- **Icons**: Lucide React icon library

### Development Tools
- **Hot Reload**: Vite HMR for instant development feedback
- **Error Handling**: Runtime error overlay for development
- **Code Quality**: TypeScript strict mode for type safety

## Data Flow

### Client-Server Communication
1. **API Requests**: Client uses fetch with credentials for authenticated requests
2. **Query Management**: TanStack Query handles caching, refetching, and state
3. **Error Handling**: Centralized error handling with toast notifications
4. **Type Safety**: Shared TypeScript types between client and server

### State Management
1. **Server State**: Managed by TanStack Query with automatic caching
2. **UI State**: Local React state for component-specific data
3. **Form State**: React Hook Form for complex form management
4. **Global State**: Minimal global state, preferring server state

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **Routing**: Wouter for lightweight routing
- **Database**: Drizzle ORM with Neon Database driver
- **UI Components**: Radix UI primitives for accessibility

### Development Dependencies
- **Build Tools**: Vite, esbuild, tsx for development
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Type Checking**: TypeScript with strict configuration

### UI Enhancement Libraries
- **Animations**: Class Variance Authority for component variants
- **Utilities**: clsx, tailwind-merge for conditional styling
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for interactive components

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **Development**: Uses `tsx` for TypeScript execution with hot reload
- **Production**: Compiled JavaScript with Node.js execution
- **Database**: Environment variable `DATABASE_URL` for connection

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Port Mapping**: Internal port 5000 mapped to external port 80
- **Auto-scaling**: Configured for automatic scaling deployment

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
- June 19, 2025. Migrated from Figma to Replit environment
- June 19, 2025. Adjusted layout spacing and positioning per user requirements
- June 19, 2025. Added grey eclipse background element with custom positioning and rotation
- June 19, 2025. Adjusted z-index layering for proper element stacking order
- June 19, 2025. Applied consistent z-index layering to multiple background elements
- June 19, 2025. Implemented hierarchical z-index system for proper text-background layering
- June 19, 2025. Created consistent header component and applied across all pages
- June 19, 2025. Standardized navigation with Home, Search, and Admin buttons
- June 19, 2025. Added comprehensive admin editing functionality with trader list view
- June 19, 2025. Added search bar to search page with URL parameter handling
- June 19, 2025. Implemented profile image support across all pages with URL-based storage
- June 19, 2025. Implemented dropdown search functionality with instant results on homepage
- June 19, 2025. Redesigned trader profile page with clean card layout matching user reference
- June 19, 2025. Fixed rating submission database errors by updating schema and creating anonymous user
- June 19, 2025. Reformatted review display with user avatars, rating bars, and improved timestamp formatting
- June 19, 2025. Redesigned search page with empty state card and results view matching user specifications
- June 19, 2025. Fixed trader ranking algorithm with proper database sorting by average rating and five-star count tie-breaking
- June 19, 2025. Added blue diamond pattern background and shine animation for rank 1 trader card
- June 19, 2025. Implemented name-only search functionality for search page while preserving combined search on homepage
- June 19, 2025. Reduced home page purple footer height from 800px to 400px (halfway)
- June 19, 2025. Added CA button with slide-up overlay animation and clipboard copy functionality
- June 19, 2025. Implemented comprehensive user account system with username/password authentication
- June 19, 2025. Added sign-up, sign-in, and user profile pages with bcrypt password hashing
- June 19, 2025. Updated header to show user authentication status with dropdown menu
- June 19, 2025. Extended database schema with user authentication fields and session management
- June 19, 2025. Implemented admin-only access control system with role-based permissions
- June 19, 2025. Added role field to users table with admin/user designation
- June 19, 2025. Protected all admin routes with middleware requiring admin role
- June 19, 2025. Updated frontend to hide admin button for non-admin users
- June 19, 2025. Added access denied page for unauthorized admin panel access
- June 20, 2025. Rescaled entire website layout for optimal 1920x1080 resolution display
- June 20, 2025. Updated decorative eclipse element back to proper oval shape on homepage
- June 20, 2025. Added additional yellow eclipse decorative element with 15-degree rotation to homepage
- June 20, 2025. Removed decorative element from hero section to clean up homepage design
- June 20, 2025. Reduced yellow eclipse decorative element size by 20% for better visual balance
- June 20, 2025. Removed blue eclipse decorative element from hero section for cleaner design
- June 20, 2025. Added new blue eclipse element (91.7x71.2px, -15° rotation) to homepage hero section
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```