# 📦 SHARED PACKAGE CONTROL FILE
## packages/shared
## Nepal Woolen eCommerce (MERN + TS Monorepo)

You are GitHub Copilot Pro acting as a Senior Full Stack Architect.

Design a shared types and utilities package that is consumed
by all apps: Backend API, Web, Admin, and Mobile.

This package prevents type duplication and ensures
type safety across the entire monorepo.

---

# 1️⃣ PURPOSE

The shared package is the single source of truth for:

- TypeScript types and interfaces
- Enums and constants
- Zod validation schemas (reusable)
- API response types
- Utility types

Every app imports from `@amira/shared` (or chosen scope name).

---

# 2️⃣ PACKAGE STRUCTURE (MANDATORY)

packages/
  shared/
    src/
      index.ts
      types/
        user.types.ts
        product.types.ts
        category.types.ts
        order.types.ts
        payment.types.ts
        review.types.ts
        auth.types.ts
        analytics.types.ts
        common.types.ts
      enums/
        index.ts
        role.enum.ts
        order-status.enum.ts
        payment-status.enum.ts
        payment-method.enum.ts
      constants/
        index.ts
        pagination.constants.ts
        token.constants.ts
      schemas/
        auth.schema.ts
        product.schema.ts
        category.schema.ts
        order.schema.ts
        review.schema.ts
        user.schema.ts
        address.schema.ts
      api/
        endpoints.ts
        response.types.ts
    package.json
    tsconfig.json

---

# 3️⃣ ENUMS (MANDATORY)

Define all enums here. Never redefine in individual apps.

UserRole:
- USER
- ADMIN

OrderStatus:
- PENDING
- CONFIRMED
- SHIPPED
- DELIVERED
- CANCELLED

PaymentStatus:
- PENDING
- PAID
- FAILED
- REFUNDED

PaymentMethod:
- COD
- ESEWA

---

# 4️⃣ COMMON TYPES

ApiResponse<T>:
- success: boolean
- message: string
- data?: T
- error?: string | Record<string, string[]>

PaginatedResponse<T>:
- success: boolean
- message: string
- data: T[]
- pagination:
    - page: number
    - limit: number
    - total: number
    - totalPages: number

PaginationParams:
- page?: number
- limit?: number
- sort?: string
- order?: 'asc' | 'desc'
- search?: string

---

# 5️⃣ ENTITY TYPES

Define base types for each entity.

Use:

- IUser (without password)
- IProduct
- ICategory
- IOrder
- IPayment
- IReview
- IAddress

These are the response-facing types (what API returns).
Backend models extend these with Mongoose-specific fields.

Example:

IProduct:
- _id: string
- name: string
- slug: string
- description: string
- price: number
- discountPrice?: number
- stock: number
- images: string[]
- categoryId: string
- variants: IProductVariant[]
- averageRating: number
- totalReviews: number
- isFeatured: boolean
- isActive: boolean
- createdAt: string
- updatedAt: string

---

# 6️⃣ REQUEST/INPUT TYPES

Define input types for mutations:

CreateProductInput:
- name: string
- description: string
- price: number
- discountPrice?: number
- stock: number
- categoryId: string
- variants?: IProductVariant[]
- isFeatured?: boolean

UpdateProductInput:
- Partial<CreateProductInput>

LoginInput:
- email: string
- password: string

RegisterInput:
- name: string
- email: string
- password: string
- phone?: string

CreateOrderInput:
- products: OrderItem[]
- deliveryAddress: IAddress
- paymentMethod: PaymentMethod

---

# 7️⃣ ZOD SCHEMAS (SHARED)

Reusable Zod schemas for validation on both
backend (request validation) and frontend (form validation).

Export schemas for:

- loginSchema
- registerSchema
- createProductSchema
- updateProductSchema
- createCategorySchema
- createOrderSchema
- createReviewSchema
- addressSchema
- paginationSchema

Each schema must match its corresponding TypeScript type.

Use z.infer<typeof schema> to derive types when appropriate.

---

# 8️⃣ API ENDPOINTS CONSTANTS

Define all API endpoint paths as constants:

API_ENDPOINTS:
  AUTH:
    LOGIN: '/api/v1/auth/login'
    REGISTER: '/api/v1/auth/register'
    REFRESH: '/api/v1/auth/refresh'
    LOGOUT: '/api/v1/auth/logout'
  PRODUCTS:
    LIST: '/api/v1/products'
    BY_SLUG: '/api/v1/products/:slug'
    CREATE: '/api/v1/products'
    UPDATE: '/api/v1/products/:id'
    DELETE: '/api/v1/products/:id'
  CATEGORIES:
    LIST: '/api/v1/categories'
    BY_SLUG: '/api/v1/categories/:slug'
  ORDERS:
    LIST: '/api/v1/orders'
    BY_ID: '/api/v1/orders/:id'
    CREATE: '/api/v1/orders'
    UPDATE_STATUS: '/api/v1/orders/:id/status'
  PAYMENTS:
    CREATE_ESEWA: '/api/v1/payments/esewa/create'
    VERIFY_ESEWA: '/api/v1/payments/esewa/verify'
    LIST: '/api/v1/payments'
  REVIEWS:
    LIST: '/api/v1/reviews'
    CREATE: '/api/v1/reviews'
  USERS:
    PROFILE: '/api/v1/users/profile'
    LIST: '/api/v1/users'
    ADDRESSES: '/api/v1/users/addresses'
  ANALYTICS:
    DASHBOARD: '/api/v1/analytics/dashboard'

All apps must import paths from here.
Never hardcode API paths in individual apps.

---

# 9️⃣ PAGINATION CONSTANTS

DEFAULT_PAGE: 1
DEFAULT_LIMIT: 12
MAX_LIMIT: 100

---

# 🔟 TOKEN CONSTANTS

ACCESS_TOKEN_EXPIRY: '15m'
REFRESH_TOKEN_EXPIRY: '7d'

---

# 1️⃣1️⃣ PACKAGE CONFIGURATION

package.json:
- name: @amira/shared
- main: dist/index.js
- types: dist/index.d.ts
- scripts:
    - build: tsc
    - dev: tsc --watch
- dependencies:
    - zod
- devDependencies:
    - typescript

tsconfig.json:
- extends: ../../tsconfig.base.json
- compilerOptions:
    - outDir: dist
    - declaration: true
    - declarationMap: true
- include: ["src"]

---

# 1️⃣2️⃣ IMPORT CONVENTION

All apps must import like:

import { IProduct, OrderStatus, ApiResponse } from '@amira/shared'
import { createProductSchema } from '@amira/shared/schemas'
import { API_ENDPOINTS } from '@amira/shared/api'

---

# 1️⃣3️⃣ PROHIBITED

- No app-specific logic in shared package
- No Mongoose or React imports in shared package
- No runtime dependencies except Zod
- No duplicating types across apps
- No using `any` in type definitions
- No default exports (use named exports only)

---

# END GOAL

Create a single source of truth for types,
enums, constants, and validation schemas
shared across all apps in the monorepo.
Eliminate type duplication and ensure
cross-app type safety.
