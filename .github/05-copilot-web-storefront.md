# 🌐 WEB STOREFRONT CONTROL FILE
## React + Vite + TypeScript
## Nepal Woolen eCommerce

You are GitHub Copilot Pro acting as a Senior Frontend Architect.

Build a scalable, responsive, production-grade eCommerce storefront.

Do NOT use Next.js.
Use React 18 + Vite + TypeScript.

---

# 1️⃣ PROJECT SETUP (STRICT)

Use:

- React 18+
- Vite (latest)
- TypeScript (strict true)
- Tailwind CSS v4.2
- TanStack Query
- Zustand
- React Hook Form
- Axios
- React Router DOM

---

# 2️⃣ FOLDER STRUCTURE (MANDATORY)

src/
  main.tsx
  app/
  routes/
  features/
  components/
  hooks/
  services/
  store/
  layouts/
  utils/
  types/

Use feature-based architecture inside features:

features/
  auth/
  product/
  cart/
  order/
  payment/
  review/

---

# 3️⃣ STATE MANAGEMENT RULES

Server state:
- Use TanStack Query
- Use query caching
- Use invalidation after mutation

Client state:
- Use Zustand
- Cart must persist in localStorage
- Auth state stored in memory only

Never use Redux.

---

# 4️⃣ UI DESIGN SYSTEM

Use:

- Tailwind CSS v4.2
- CSS-first configuration (v4 uses @theme in CSS, NOT tailwind.config.js)
- Utility-first approach
- Reusable UI components
- Skeleton loaders
- Responsive breakpoints

Important: Tailwind v4 uses a CSS-based config approach.
There is no tailwind.config.js. Custom theme values are
defined in CSS using @theme directive.
Verify Tailwind v4 stable availability before starting.
If unstable, fall back to Tailwind v3 with tailwind.config.ts.

Design must be:

- Mobile-first
- Clean woolen Nepal aesthetic
- Warm color palette
- Minimalistic
- Fast-loading

---

# 5️⃣ ROUTES (MANDATORY)

Public:

- /
- /products
- /products/:slug
- /cart
- /checkout
- /order-success
- /order-failed
- /login
- /register
- /forgot-password
- /reset-password/:token

Private:

- /profile
- /profile/addresses
- /orders
- /orders/:id

Use ProtectedRoute wrapper.
Import API endpoint constants from @amira/shared.

---

# 6️⃣ PRODUCT LISTING PAGE

Must support:

- Pagination
- Category filter
- Price sorting
- Search
- Skeleton loading
- Empty state

Use TanStack Query with pagination params.

---

# 7️⃣ PRODUCT DETAIL PAGE

Must include:

- Image gallery
- Variant selection (size, color)
- Stock indicator
- Rating display
- Add to cart
- Related products

Use memoization to prevent re-rendering.

---

# 8️⃣ CART SYSTEM (ZUSTAND)

Cart must:

- Add item
- Remove item
- Update quantity
- Calculate total
- Persist in localStorage
- Validate stock before checkout

Never store cart in backend until checkout.

---

# 9️⃣ CHECKOUT FLOW

Step 1:
- Validate user logged in

Step 2:
- Address form (React Hook Form + Zod)

Step 3:
- Choose payment method:
    - COD
    - ESEWA

Step 4:
- Call backend create order API

If COD:
    → Redirect to success page

If ESEWA:
    → Redirect to eSewa URL from backend

Never generate payment data in frontend.

---

# 🔟 ESEWA REDIRECT HANDLING

After payment:

- User redirected to:
    /order-success
    /order-failed

Frontend must:

- Call backend verify endpoint
- Display verified result
- Clear cart after success

Never mark order paid on frontend only.

---

# 1️⃣1️⃣ AUTH FLOW (WEB)

Login:

- Call backend
- Access token stored in memory
- Refresh token stored in HttpOnly cookie

Use Axios interceptor:

- Auto refresh expired token
- Retry original request

Never use localStorage for tokens.

---

# 1️⃣2️⃣ PERFORMANCE OPTIMIZATION

Implement:

- Lazy loading routes
- React.memo
- Code splitting
- Image optimization
- Debounced search
- Query caching

---

# 1️⃣3️⃣ ERROR HANDLING

- Global error boundary
- Toast notifications
- Graceful fallback UI
- Show meaningful user messages

Never expose backend internal errors.

---

# 1️⃣4️⃣ RESPONSIVENESS RULES

Must look perfect on:

- Mobile (primary)
- Tablet
- Desktop

Use Tailwind responsive utilities.

Test:

- 360px width
- 768px
- 1280px

---

# 1️⃣5️⃣ ACCESSIBILITY

Include:

- Proper alt text
- Button roles
- Keyboard navigation
- Form labels

---

# 1️⃣6️⃣ SEO BASIC

Use:

- Meta tags
- Product structured data (basic JSON-LD ready structure)

---

# 1️⃣7️⃣ PROHIBITED

- No inline API calls in components
- No business logic in UI components
- No any type
- No Redux
- No Next.js
- No duplicating types (import from @amira/shared)
- No hardcoded API paths (import from @amira/shared)
- No storing tokens in localStorage

---

# 1️⃣8️⃣ ADDRESS MANAGEMENT

Profile page must include address management:

- List saved addresses
- Add new address
- Edit existing address
- Delete address
- Set default address
- Select saved address at checkout

Use React Hook Form + Zod (from @amira/shared) for address form.

---

# 1️⃣9️⃣ SEARCH EXPERIENCE

Implement search with:

- Debounced search input (300ms)
- Autocomplete suggestions dropdown
- Search results page with filters (category, price range)
- Empty state for no results
- Loading state during search

Call backend search endpoint: GET /api/v1/search

---

# END GOAL

Build a fast,
modern,
responsive,
Nepal-focused woolen eCommerce storefront
using React + Vite + TypeScript,
fully integrated with:

- COD
- eSewa
- Secure Auth
- Backend API