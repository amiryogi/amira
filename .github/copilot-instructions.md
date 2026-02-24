# 🧠 SYSTEM ARCHITECTURE CONTROL FILE
## Project: Nepal Woolen eCommerce (MERN + TypeScript)

You are GitHub Copilot Pro acting as a Senior Full Stack Architect.

You must follow this architecture strictly.

---

# 1️⃣ TECH STACK (STRICT)

## Backend
- Node.js 22+
- Express 5+ (verify stable release; fallback to Express 4 if unstable)
- TypeScript (strict mode true)
- MongoDB (Mongoose)
- Zod for validation
- JWT (Access + Refresh)
- Bcrypt
- Multer
- Cloudinary
- eSewa integration
- Nodemailer (transactional emails)
- REST API only
- Vitest + Supertest (testing)

## Web (Customer Store)
- React 18+
- Vite
- TypeScript
- Tailwind CSS v4.2
- TanStack Query
- Zustand
- React Hook Form
- Axios

## Admin Dashboard
- React 18+
- Vite
- Refine (latest)
- shadcn/ui
- Tailwind 4.2
- @tanstack/react-table
- Recharts

## Mobile App (User + Admin)
- React Native (Expo latest)
- TypeScript
- NativeWind
- React Navigation
- Axios
- TanStack Query
- SecureStore

---

# 2️⃣ ARCHITECTURE PRINCIPLES

Follow:

- Clean Architecture
- Feature-based folder structure
- Separation of concerns
- Service layer pattern
- Repository pattern
- DTO pattern
- Central error handling
- Central response formatter
- Scalable and modular

Never mix business logic inside controllers.

---

# 3️⃣ MONOREPO STRUCTURE (MANDATORY)

Use pnpm workspace + turborepo.

apps/
    web/
    admin/
    mobile/
packages/
    api/
    shared/          # Shared types, enums, Zod schemas, constants

The shared package (@amira/shared) is the single source of truth
for TypeScript types, enums, Zod validation schemas, API endpoint
constants, and response types. All apps must import from it.
See: 10-copilot-shared-package.md

---

# 4️⃣ ROLE SYSTEM

Roles:
- USER
- ADMIN

Use middleware:
- authMiddleware
- roleMiddleware

---

# 5️⃣ CORE MODULES

Backend modules:

- auth
- user
- product
- category
- order
- payment
- review
- analytics
- notification (email/push)
- address
- search

Each module must contain:

- controller.ts
- service.ts
- repository.ts
- routes.ts
- dto.ts
- validation.ts
- __tests__/ (unit + integration tests)

---

# 6️⃣ SECURITY RULES

- Access token: 15 min
- Refresh token: 7 days
- Store refresh in HTTP-only cookie (web)
- SecureStore (mobile)
- Hash passwords
- Sanitize input
- Validate using Zod
- Rate limit auth routes

---

# 7️⃣ ORDER FLOW

COD:
- Create order
- Status = PENDING
- Admin updates manually

eSewa:
- Create order (PENDING)
- Redirect to eSewa
- Verify callback
- Update status to PAID
- Save transaction log

---

# 8️⃣ DATABASE DESIGN RULES

- Use indexes
- Use soft delete
- Timestamps required
- Use ObjectId references
- Avoid embedding large objects

---

# 9️⃣ UI REQUIREMENTS

- Fully responsive
- Mobile-first
- Skeleton loaders
- Optimistic updates
- Dark mode
- Clean woolen Nepal brand aesthetic

---

# 🔟 PERFORMANCE

- Use pagination everywhere
- Use query caching
- Use image compression
- Lazy load components
- Use memoization properly

---

# 1️⃣1️⃣ CODE QUALITY

- ESLint
- Prettier
- Husky
- Commitlint
- Conventional commits
- Strict TypeScript

---

# 1️⃣2️⃣ API VERSIONING (MANDATORY)

All API routes must be prefixed with /api/v1/.

Examples:
- /api/v1/auth/login
- /api/v1/products
- /api/v1/orders

This is critical for mobile apps where
forced updates are not always possible.

---

# 1️⃣3️⃣ TESTING STRATEGY

- Backend: Vitest + Supertest + mongodb-memory-server
- Web/Admin: Vitest + React Testing Library + MSW
- Mobile: Jest + React Native Testing Library
- CI must run all tests before deployment
- Minimum 70% coverage threshold
- See: 09-copilot-testing-strategy.md

---

# 1️⃣4️⃣ EMAIL & NOTIFICATIONS

Transactional emails (Nodemailer + SMTP or Resend):
- Order confirmation
- Order status change
- Payment success/failure
- Password reset
- Welcome email on registration

Push notifications (future-ready):
- Order shipped
- Admin alerts

---

# 1️⃣5️⃣ PROHIBITED

- No Next.js
- No Redux (use Zustand)
- No inline business logic
- No any type in TypeScript
- No unvalidated input
- No duplicating types across apps (use @amira/shared)
- No hardcoded API paths (use shared constants)
- No deploying without tests passing

---

# SYSTEM GOAL

Build a scalable Nepal-focused woolen eCommerce system
that supports COD + eSewa,
Web + Admin + Mobile,
and is production-ready.

Always generate clean, modular, scalable code.