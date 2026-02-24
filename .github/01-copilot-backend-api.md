# 🚀 BACKEND API ARCHITECTURE CONTROL FILE
## Location: packages/api

You are GitHub Copilot Pro acting as a Senior Backend Architect.

Generate a production-grade Express + TypeScript backend
following strict clean architecture.

Express 5+ is preferred. If Express 5 stable is not available,
fall back to Express 4 with @types/express.
Architectural patterns remain identical.

All routes must be versioned under /api/v1/.
All shared types, enums, and Zod schemas must come from @amira/shared.

---

# 1️⃣ PROJECT STRUCTURE (MANDATORY)

src/
  app.ts
  server.ts
  config/
  common/
  modules/
  routes/
  middlewares/
  utils/
  types/

---

# 2️⃣ FEATURE MODULE STRUCTURE (STRICT)

Each module must follow:

modules/
  product/
    product.controller.ts
    product.service.ts
    product.repository.ts
    product.routes.ts
    product.dto.ts
    product.validation.ts
    product.model.ts

Repeat same structure for:
- auth
- user
- category
- order
- payment
- review
- analytics
- notification
- address
- search

Never mix files.

---

# 3️⃣ LAYER RESPONSIBILITIES

Controller:
- Handles req/res only
- Calls service
- No business logic

Service:
- Business logic
- Calls repository
- Handles transaction logic

Repository:
- Only database logic
- Only Mongoose operations
- No business logic

DTO:
- Defines input/output types
- Strong TypeScript types

Validation:
- Use Zod
- Validate before controller logic

---

# 4️⃣ GLOBAL MIDDLEWARES

Implement:

- errorHandler.ts
- asyncHandler.ts
- auth.middleware.ts
- role.middleware.ts
- rateLimiter.ts
- validateRequest.ts

---

# 5️⃣ RESPONSE FORMAT (MANDATORY)

All API responses must follow:

{
  success: boolean,
  message: string,
  data?: T,
  error?: string | Record<string, string[]>
}

Use TypeScript generics for data field.
Never use `any` type in response wrapper.
Never return raw Mongo data.

---

# 6️⃣ ERROR HANDLING STRATEGY

- Custom ApiError class
- Centralized error handler
- No try/catch repetition
- Use asyncHandler wrapper

---

# 7️⃣ AUTH STRATEGY

Implement:

- register
- login
- refresh token
- logout

Use:

- JWT access (15 min)
- JWT refresh (7 days)
- HttpOnly cookies (web)
- Token rotation
- Blacklist invalidated tokens

---

# 8️⃣ DATABASE RULES

Use:

- Mongoose with strict schema
- Timestamps true
- Indexes for:
    - email
    - slug
    - orderId
    - createdAt
- Soft delete with:
    isDeleted: boolean

Never expose password field.

---

# 9️⃣ ORDER SYSTEM

Order must include:

- userId
- products[]
- paymentMethod (COD | ESEWA)
- paymentStatus
- orderStatus
- totalAmount
- deliveryAddress
- transactionId (optional)

Statuses:

paymentStatus:
- PENDING
- PAID
- FAILED

orderStatus:
- PENDING
- CONFIRMED
- SHIPPED
- DELIVERED
- CANCELLED

---

# 🔟 PAYMENT MODULE RULES

Must support:

- createEsewaPayment()
- verifyEsewaPayment()
- logTransaction()

Never trust frontend payment status.
Always verify with eSewa server response.

---

# 1️⃣1️⃣ PAGINATION SYSTEM

Implement reusable pagination utility:

- page
- limit
- sort
- filter
- search

All list endpoints must support pagination.

---

# 1️⃣2️⃣ SECURITY

- Helmet
- CORS config
- Rate limit auth routes
- Sanitize input
- Validate ObjectId
- Prevent NoSQL injection
- Use dotenv-safe

---

# 1️⃣3️⃣ LOGGING

Use:

- Winston or Pino
- Log:
  - errors
  - payment verification
  - login attempts
  - admin actions

---

# 1️⃣4️⃣ PERFORMANCE

- Lean queries
- Select fields
- Avoid unnecessary populate
- Use aggregation for analytics

---

# 1️⃣5️⃣ PROHIBITED

- No inline mongoose queries in controller
- No any type
- No large business logic inside route files
- No direct res.json without response wrapper
- No hardcoded API paths (use @amira/shared constants)
- No duplicating types already defined in @amira/shared

---

# 1️⃣6️⃣ API VERSIONING (MANDATORY)

All routes must be mounted under /api/v1/.

Route registration example:

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/search', searchRoutes)

---

# 1️⃣7️⃣ NOTIFICATION MODULE

Transactional email system using Nodemailer.

Triggers:
- Welcome email on registration
- Order confirmation
- Order status update
- Payment success/failure
- Password reset link

Implement:
- notification.service.ts (email sending logic)
- notification.templates.ts (HTML email templates)
- Queue-ready structure (future: Bull/BullMQ)

Use environment variables for SMTP config:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- FROM_EMAIL

---

# 1️⃣8️⃣ SEARCH MODULE

Implement search service for product discovery.

Endpoint: GET /api/v1/search?q=term&category=slug&minPrice=&maxPrice=

Requirements:
- Use MongoDB text index on product name + description
- Support category filtering
- Support price range filtering
- Debounced autocomplete endpoint (GET /api/v1/search/suggest?q=term)
- Return paginated results
- Relevance scoring via text search score

---

# 1️⃣9️⃣ ADDRESS MODULE

Users can save multiple delivery addresses.

Endpoints:
- GET /api/v1/users/addresses
- POST /api/v1/users/addresses
- PUT /api/v1/users/addresses/:id
- DELETE /api/v1/users/addresses/:id
- PUT /api/v1/users/addresses/:id/default

Address fields:
- label (Home, Office, etc.)
- fullName
- phone
- street
- city
- district
- province
- postalCode (optional)
- isDefault

At checkout, user selects a saved address or enters new one.

---

# 2️⃣0️⃣ TESTING

Every module must include __tests__/ directory.

See: 09-copilot-testing-strategy.md for full details.

Minimum:
- Unit tests for service layer
- Integration tests for routes
- Test data factories
- 70% coverage threshold

---

# END GOAL

Generate a scalable,
secure,
clean,
production-ready
Express API for Nepal woolen eCommerce
supporting COD + eSewa.