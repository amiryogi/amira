# 🧪 TESTING STRATEGY CONTROL FILE
## Nepal Woolen eCommerce (MERN + TS Monorepo)

You are GitHub Copilot Pro acting as a Senior QA Architect.

Design a comprehensive testing strategy across all apps
in the monorepo: Backend API, Web, Admin, and Mobile.

---

# 1️⃣ TESTING PHILOSOPHY

Follow:

- Test pyramid (unit > integration > E2E)
- Test behavior, not implementation
- Every module must have test coverage
- Tests must run in CI before deploy
- No deployment if tests fail

---

# 2️⃣ TESTING TOOLS (STRICT)

Backend (packages/api):
- Vitest (test runner)
- Supertest (HTTP integration tests)
- mongodb-memory-server (in-memory DB for tests)
- Factory pattern for test data

Web (apps/web):
- Vitest
- React Testing Library
- MSW (Mock Service Worker) for API mocking
- @testing-library/user-event

Admin (apps/admin):
- Vitest
- React Testing Library
- MSW

Mobile (apps/mobile):
- Jest (Expo default)
- React Native Testing Library
- MSW

E2E (future-ready):
- Playwright (web + admin)
- Detox (mobile, optional)

---

# 3️⃣ BACKEND TEST STRUCTURE

Each module test file lives alongside the module:

modules/
  product/
    product.controller.ts
    product.service.ts
    product.repository.ts
    __tests__/
      product.service.test.ts
      product.repository.test.ts
      product.integration.test.ts

---

# 4️⃣ BACKEND UNIT TESTS

Test services in isolation:

- Mock repository layer
- Test business logic
- Test edge cases
- Test validation failures
- Test error throwing

Example coverage per module:

auth:
- register (valid, duplicate email, weak password)
- login (valid, wrong password, non-existent user)
- refresh (valid, expired, revoked, reuse detection)
- logout (valid, already logged out)

product:
- create (valid, missing fields, duplicate slug)
- update (valid, not found, soft deleted)
- list (pagination, filters, search)
- getBySlug (found, not found, soft deleted)

order:
- create (valid, out of stock, invalid address)
- update status (valid transitions, invalid transitions)
- calculate total (correct math, discount handling)

payment:
- createEsewaPayment (valid order, already paid)
- verifyEsewaPayment (valid, signature mismatch, amount mismatch, duplicate)
- idempotency (multiple verify calls)

---

# 5️⃣ BACKEND INTEGRATION TESTS

Use Supertest + mongodb-memory-server.

Test full request → response cycle:

- HTTP method + route
- Request body validation
- Auth middleware (with/without token)
- Role middleware (USER vs ADMIN)
- Response format matches standard wrapper
- Database state changes
- Status codes

Must test:

- All CRUD endpoints per module
- Auth flow (register → login → refresh → logout)
- Order + payment flow (create order → pay → verify)
- Pagination parameters
- Error responses (400, 401, 403, 404, 500)

---

# 6️⃣ BACKEND TEST DATA FACTORY

Create test data factories:

utils/testing/
  factories/
    user.factory.ts
    product.factory.ts
    category.factory.ts
    order.factory.ts
    payment.factory.ts

Each factory must:

- Generate valid default data
- Allow overrides
- Use realistic Nepal-context data
- Support bulk creation

Example:

createTestUser({ role: 'ADMIN' })
createTestProduct({ stock: 0 })
createTestOrder({ paymentMethod: 'ESEWA' })

---

# 7️⃣ FRONTEND UNIT TESTS (WEB + ADMIN)

Test:

- Custom hooks (useCart, useAuth, useProducts)
- Zustand stores (cart store logic)
- Utility functions
- Form validation schemas

Do NOT test:
- Implementation details
- CSS/styling
- Third-party library internals

---

# 8️⃣ FRONTEND COMPONENT TESTS (WEB + ADMIN)

Use React Testing Library.

Test user-facing behavior:

- Renders correctly with given props
- User interactions (click, type, submit)
- Loading states (skeleton display)
- Error states (error boundary, toast)
- Empty states
- Conditional rendering (logged in vs anonymous)

Critical components to test:

Web:
- ProductCard
- CartDrawer / CartPage
- CheckoutForm
- LoginForm / RegisterForm
- ProtectedRoute

Admin:
- OrdersTable (filters, pagination, status update)
- ProductForm (create, edit, validation)
- AnalyticsDashboard (data rendering)

---

# 9️⃣ API MOCKING WITH MSW

Setup MSW handlers for all API endpoints:

src/mocks/
  handlers/
    auth.handlers.ts
    product.handlers.ts
    order.handlers.ts
  server.ts (for tests)
  browser.ts (for development)

MSW must:

- Return realistic response shapes
- Simulate error responses
- Simulate loading delays (for skeleton tests)
- Match the standard API response wrapper format

---

# 🔟 MOBILE TESTS

Test:

- Navigation flows (auth guard, role-based tabs)
- Cart operations
- Form submissions
- SecureStore token handling (mocked)
- WebView eSewa flow (mocked redirect detection)

Use React Native Testing Library.

---

# 1️⃣1️⃣ TEST CONFIGURATION

Vitest config (shared base):

- Coverage provider: v8
- Coverage threshold: 70% minimum
- Reporter: verbose + json (for CI)
- Globals: true
- Setup files for test utilities

Backend specific:
- Setup: connect mongodb-memory-server before all
- Teardown: disconnect + cleanup after all
- Each test file: clean collections beforeEach

Frontend specific:
- Setup: MSW server start
- Cleanup: MSW server reset after each

---

# 1️⃣2️⃣ CI INTEGRATION

Tests must run in GitHub Actions:

Steps:

1. Install dependencies
2. Run TypeScript check
3. Run ESLint
4. Run backend unit tests
5. Run backend integration tests
6. Run web tests
7. Run admin tests
8. Generate coverage report
9. Fail pipeline if coverage < threshold

---

# 1️⃣3️⃣ TEST NAMING CONVENTION

Use descriptive test names:

describe('ProductService')
  describe('create')
    it('should create product with valid data')
    it('should throw error for duplicate slug')
    it('should throw error when category not found')

Never use vague names like "should work" or "test 1".

---

# 1️⃣4️⃣ TEST ENVIRONMENT VARIABLES

Create:

.env.test

With:
- MONGO_URI=mongodb-memory-server (auto)
- ACCESS_SECRET=test-access-secret
- REFRESH_SECRET=test-refresh-secret
- NODE_ENV=test

Never use production secrets in tests.

---

# 1️⃣5️⃣ PROHIBITED

- No skipping tests in CI
- No testing implementation details
- No snapshot tests for dynamic content
- No tests that depend on external services
- No hardcoded ObjectIds in tests
- No tests without assertions

---

# END GOAL

Ensure every module is testable,
every critical flow is covered,
and CI prevents broken code from deploying.
