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
- June 20, 2025. Fixed white bars issue when zooming out in Chrome by implementing full-width background coverage across all pages
- June 20, 2025. Implemented file upload system for profile pictures replacing URL inputs with proper file handling
- June 20, 2025. Added support for both PNG and JPEG file formats for profile picture uploads with 5MB size limit
- June 20, 2025. Removed orange/pink eclipse decorative element from search page for cleaner design
- June 20, 2025. Moved top traders section higher up the page by reducing top margin from 480px to 120px
- June 20, 2025. Updated rank 6 trader card to display green star matching the TrendingUp arrow color instead of yellow
- June 20, 2025. Changed homepage search bar placeholder text from "Search..." to "Search for a trader..."
- June 20, 2025. Updated search page search bar placeholder text to "Search for a trader..." for consistency
- June 20, 2025. Added comprehensive footer content with company info, quick links, support section, and social media links in black text
- June 20, 2025. Implemented comprehensive security measures including helmet middleware, CORS protection, rate limiting, input validation, secure session configuration, and file upload security
- June 20, 2025. Added advanced anti-doxxing protection including IP obfuscation, server fingerprinting prevention, reconnaissance blocking, honeypot systems, and comprehensive identity protection measures
- June 20, 2025. Added user search functionality to admin panel for filtering users by username or email with real-time results
- June 20, 2025. Implemented email uniqueness validation for user signup to prevent duplicate email accounts with proper error handling
- June 20, 2025. Added automatic Twitter profile image fetching for trader profiles using Twitter usernames extracted from URLs
- June 20, 2025. Created dual input system for trader profile images: manual URL input OR automatic Twitter profile image fetching
- June 20, 2025. Added refresh button in admin panel to manually update Twitter profile images for existing traders
- June 20, 2025. Fixed rating submission validation errors by aligning server field expectations with frontend data structure
- June 20, 2025. Implemented automatic page refresh after rating submission using query cache invalidation for real-time updates
- June 20, 2025. Successfully imported 56 KOL traders with automatic Twitter profile image fetching and validated rating system functionality
- June 20, 2025. Updated footer Twitter link to open https://x.com/RateMyKOLL in new tab with proper security attributes
- June 20, 2025. Implemented one-review-per-trader restriction with server-side validation preventing duplicate reviews
- June 20, 2025. Added comprehensive reviews management tab in user profile page with edit functionality
- June 20, 2025. Created review editing modal with sliders for all rating categories and comment modification
- June 20, 2025. Fixed review editing API endpoint issues and validation errors for proper functionality
- June 20, 2025. Generated 10 realistic reviews for each of the 53 trader profiles using authentic reviewer personas
- June 20, 2025. Added review count display to admin panel trader list showing total reviews per trader
- June 20, 2025. Implemented autorefresh functionality that invalidates all queries when users switch between pages for real-time data updates
- June 20, 2025. Customized duplicate review error message to display "Only one review is allowed per user!" with enhanced frontend error handling
- June 20, 2025. Extended autorefresh to trigger on logout events for complete data refresh
- June 20, 2025. Fixed admin button visibility issue by updating useAdmin hook to properly clear admin status when users log out
- June 20, 2025. Fixed critical security vulnerability CVE-2025-30208 by upgrading Vite from 5.4.14 to 5.4.19
- June 20, 2025. Fixed bio persistence issue by adding bio field to session data during user authentication
- June 20, 2025. Resolved Vite production deployment error by creating dedicated production server (server/production.ts) with zero Vite dependencies
- June 20, 2025. Implemented multi-stage Docker build separating build dependencies from production runtime for clean Render deployment
- June 20, 2025. Fixed rate limiting validation error causing white screen by reordering middleware and adding skip conditions for obfuscated IPs
- June 20, 2025. Completed production deployment preparation with all security features intact and database connectivity configured
- June 21, 2025. Reverted advanced security middleware and anti-doxxing measures from commit d61f092 while preserving all subsequent changes
- June 21, 2025. Implemented review helpfulness voting system with database schema, API endpoints, and frontend voting buttons
- June 21, 2025. Added purple hover effects to voting buttons matching site theme color (#AB9FF2)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```