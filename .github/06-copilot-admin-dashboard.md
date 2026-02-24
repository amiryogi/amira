# 🧑‍💼 ADMIN DASHBOARD CONTROL FILE
## Refine + shadcn/ui + TypeScript
## Nepal Woolen eCommerce

You are GitHub Copilot Pro acting as a Senior Admin Dashboard Architect.

Build a secure, scalable admin dashboard using:

- React 18 + Vite
- TypeScript (strict)
- Refine (latest, HEADLESS mode)
- shadcn/ui
- Tailwind CSS v4.2
- @tanstack/react-table
- Recharts

IMPORTANT: Refine must be used in HEADLESS mode.
Refine's default UI packages (Ant Design, Material UI, Chakra)
must NOT be used. Instead, use Refine's headless hooks
(@refinedev/core) combined with shadcn/ui components
for the UI layer.

This means:
- Use useTable, useForm, useShow, useList from @refinedev/core
- Build UI with shadcn/ui Card, Table, Dialog, Button, etc.
- Implement custom dataProvider that calls the backend REST API
- Implement custom authProvider that checks ADMIN role

Prototype this integration early to validate compatibility.

Tailwind v4 note: Same as web storefront — uses CSS-first config.
Verify v4 stability. Fall back to v3 if needed.

---

# 1️⃣ PROJECT STRUCTURE (MANDATORY)

src/
  main.tsx
  app/
  resources/
  components/
  hooks/
  services/
  types/
  layouts/
  utils/

Follow Refine resource-based architecture.

---

# 2️⃣ AUTH INTEGRATION

Admin login must:

- Use backend auth
- Verify role === ADMIN
- Redirect non-admin users

Protect all routes using Refine authProvider.

Never allow USER role inside admin panel.

---

# 3️⃣ CORE RESOURCES

Define Refine resources:

- products
- categories
- orders
- payments
- users
- reviews
- analytics

Each resource must support:

- list
- show
- edit
- create (where applicable)

---

# 4️⃣ PRODUCT MANAGEMENT

Admin must be able to:

- Create product
- Edit product
- Upload multiple images
- Manage stock
- Set featured product
- Soft delete product

Form requirements:

- React Hook Form
- Zod validation
- Image preview
- Proper error handling

---

# 5️⃣ CATEGORY MANAGEMENT

Admin must:

- Create category
- Edit slug
- Activate/deactivate
- Soft delete

Prevent duplicate slug.

---

# 6️⃣ ORDER MANAGEMENT (CRITICAL)

Use @tanstack/react-table for:

Orders table must support:

- Pagination
- Sorting
- Filtering by:
    - paymentStatus
    - orderStatus
    - date range
- Search by:
    - orderId
    - user email
    - transactionId

Columns:

- Order ID
- User
- Total
- Payment Method
- Payment Status
- Order Status
- Date
- Actions

---

# 7️⃣ ORDER DETAIL PAGE

Admin must see:

- Full product list snapshot
- Payment info
- Transaction ID
- Delivery address
- User info
- Order timeline

Admin must update:

- orderStatus
- paymentStatus (for COD)

All changes must log audit record.

---

# 8️⃣ PAYMENT MANAGEMENT

Payment list must include:

- transactionId
- orderId
- amount
- status
- verifiedAt

Allow:

- View raw eSewa response
- Filter failed payments
- Export CSV

Never allow manual payment verification without audit log.

---

# 9️⃣ USER MANAGEMENT

Admin must:

- View users
- Change role (ADMIN only)
- Soft delete
- View active sessions
- Revoke sessions

Prevent self-role downgrade or privilege escalation.

---

# 🔟 ANALYTICS DASHBOARD

Use Recharts.

Show:

- Total revenue
- Revenue by month
- Orders by status
- Top selling products
- Payment method distribution
- Failed payment rate

Fetch aggregated data from backend only.

Never compute analytics on frontend.

---

# 1️⃣1️⃣ UI REQUIREMENTS

Use shadcn/ui components:

- Card
- Table
- Dialog
- Badge
- Button
- DropdownMenu
- Tabs
- Form

Design must be:

- Clean
- Professional
- Dark mode supported
- Fully responsive

---

# 1️⃣2️⃣ RESPONSIVENESS

Admin must work on:

- Desktop
- Tablet
- Large mobile

Use Tailwind grid + flex properly.

---

# 1️⃣3️⃣ SECURITY HARDENING

- Use role middleware
- Log all admin actions
- Show warning for destructive actions
- Confirm delete dialog
- Prevent direct URL manipulation

---

# 1️⃣4️⃣ EXPORT FEATURES

Allow:

- Export orders to CSV
- Export payments to CSV
- Filtered export

---

# 1️⃣5️⃣ PERFORMANCE

- Server-side pagination
- Avoid large table rendering
- Lazy load heavy components
- Memoize table columns

---

# 1️⃣6️⃣ ERROR HANDLING

- Toast notifications
- Form validation errors
- Graceful fallback UI

Never expose raw backend error.

---

# 1️⃣7️⃣ PROHIBITED

- No business logic in UI
- No any type
- No client-side payment verification
- No access without ADMIN role
- No direct DB calls
- No duplicating types (import from @amira/shared)
- No hardcoded API paths (import from @amira/shared)
- No using Refine's built-in UI libraries (use headless + shadcn/ui)

---

# 1️⃣8️⃣ NOTIFICATION MANAGEMENT

Admin must be able to:

- View notification logs (emails sent)
- See delivery status (SENT, FAILED)
- Filter by type (ORDER, PAYMENT, AUTH)
- Resend failed notifications

---

# END GOAL

Build a powerful,
secure,
scalable,
Nepal-ready admin dashboard
that manages:

- Products
- Categories
- Orders
- Payments
- Users
- Analytics

Using Refine + shadcn/ui + TanStack Table.