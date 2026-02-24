# 🗄 DATABASE DESIGN CONTROL FILE
## MongoDB + Mongoose + TypeScript
## Project: Nepal Woolen eCommerce

You are GitHub Copilot Pro acting as a Senior Database Architect.

Design scalable MongoDB schemas using Mongoose.
Follow strict TypeScript typing.

---

# 1️⃣ DATABASE PRINCIPLES

Follow:

- Normalization with strategic referencing
- Avoid over-embedding
- Avoid deep population chains
- Index all searchable fields
- Use timestamps: true
- Use soft delete pattern
- Use lean queries by default
- Use aggregation for analytics

---

# 2️⃣ COLLECTION LIST (MANDATORY)

Create the following collections:

1. users
2. products
3. categories
4. orders
5. payments
6. reviews
7. refreshTokens
8. auditLogs
9. addresses
10. notifications

---

# 3️⃣ USER SCHEMA

Fields:

- _id
- name
- email (unique, indexed)
- password (select: false)
- role (USER | ADMIN)
- phone
- isVerified
- isDeleted
- tokenVersion (number, default: 0)
- createdAt
- updatedAt

Indexes:
- email (unique)
- role

Never expose password in response.

Note: Addresses are stored in a separate collection,
not embedded in the user document.

---

# 4️⃣ CATEGORY SCHEMA

Fields:

- _id
- name
- slug (unique, indexed)
- description
- isActive
- isDeleted
- createdAt
- updatedAt

Indexes:
- slug (unique)
- name

---

# 5️⃣ PRODUCT SCHEMA

Fields:

- _id
- name
- slug (unique)
- description
- price
- discountPrice (optional)
- stock
- images[]
- categoryId (ObjectId ref Category)
- variants[] (size, color)
- averageRating
- totalReviews
- isFeatured
- isActive
- isDeleted
- createdAt
- updatedAt

Indexes:
- slug (unique)
- categoryId
- price
- createdAt
- isFeatured
- text index on name + description

Never embed full category object.

---

# 6️⃣ ORDER SCHEMA

Fields:

- _id
- userId (ref User)
- products[]:
    - productId
    - name snapshot
    - price snapshot
    - quantity
- totalAmount
- deliveryAddress
- paymentMethod (COD | ESEWA)
- paymentStatus (PENDING | PAID | FAILED)
- orderStatus (PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED)
- transactionId (optional)
- isDeleted
- createdAt
- updatedAt

Indexes:
- userId
- paymentStatus
- orderStatus
- createdAt
- transactionId

Important:
Store product snapshot (name + price) to prevent historical change issues.

---

# 7️⃣ PAYMENT SCHEMA

Fields:

- _id
- orderId (ref Order)
- userId (ref User)
- paymentMethod
- transactionId
- amount
- status
- rawResponse (from eSewa)
- verifiedAt
- createdAt

Indexes:
- orderId
- transactionId (unique)
- status

Never trust frontend payment confirmation.

---

# 8️⃣ REVIEW SCHEMA

Fields:

- _id
- productId (ref Product)
- userId (ref User)
- rating (1–5)
- comment
- isApproved
- createdAt

Indexes:
- productId
- userId
- rating

One user can review product once (unique compound index).

---

# 9️⃣ REFRESH TOKEN SCHEMA

Fields:

- _id
- userId
- token
- expiresAt
- isRevoked
- createdAt

Indexes:
- userId
- token
- expiresAt (TTL index)

Use TTL for auto cleanup.

---

# 🔟 AUDIT LOG SCHEMA

Fields:

- _id
- userId
- action
- entityType
- entityId
- metadata
- ipAddress
- createdAt

Indexes:
- userId
- entityType
- createdAt

Log:
- Admin actions
- Payment verification
- Order updates

---

# 1️⃣1️⃣ DATA CONSISTENCY RULES

- Use transactions for:
  - Payment verification
  - Order creation
- Use session-based transactions
- Never partially update order + payment

---

# 1️⃣2️⃣ ANALYTICS STRATEGY

Use aggregation pipelines for:

- Revenue by month
- Top selling products
- User growth
- Order count by status

Never compute analytics on frontend.

---

# 1️⃣3️⃣ SOFT DELETE STRATEGY

Use:

isDeleted: boolean

Never permanently delete:
- Users
- Orders
- Payments

Implement a Mongoose plugin or query middleware
that automatically adds { isDeleted: false } to all
find/findOne/countDocuments queries.

This prevents accidental exposure of soft-deleted records
and removes the need to manually add the filter everywhere.

---

# 1️⃣4️⃣ ADDRESS SCHEMA

Fields:

- _id
- userId (ref User)
- label (e.g., Home, Office)
- fullName
- phone
- street
- city
- district
- province
- postalCode (optional)
- isDefault (boolean)
- isDeleted
- createdAt
- updatedAt

Indexes:
- userId
- userId + isDefault (compound)

Only one address per user can be isDefault: true.

---

# 1️⃣5️⃣ NOTIFICATION SCHEMA

Fields:

- _id
- userId (ref User)
- type (ORDER_CONFIRMATION | STATUS_UPDATE | PAYMENT_SUCCESS | PAYMENT_FAILURE | WELCOME | PASSWORD_RESET)
- title
- message
- channel (EMAIL | PUSH)
- status (PENDING | SENT | FAILED)
- metadata (orderId, transactionId, etc.)
- sentAt
- createdAt

Indexes:
- userId
- type
- status
- createdAt

---

# 1️⃣4️⃣ SCALABILITY PREPARATION

Prepare for:

- Sharding by createdAt if scale grows
- Add read replicas later
- Move analytics to separate DB if required

---

# 1️⃣5️⃣ PROHIBITED

- No deep nested objects
- No storing cart inside user
- No huge embedded arrays
- No missing indexes
- No dynamic schema without typing

---

# END GOAL

Design a production-grade MongoDB schema
optimized for:

- Nepal eSewa transactions
- COD orders
- Admin analytics
- High performance queries
- Future scaling