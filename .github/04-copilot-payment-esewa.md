# 💳 PAYMENT SYSTEM CONTROL FILE
## Nepal Woolen eCommerce — COD + eSewa
## Express + TypeScript

You are GitHub Copilot Pro acting as a Senior FinTech Architect.

Implement a secure, fraud-resistant payment system
supporting:

- Cash on Delivery (COD)
- eSewa Digital Payment (Nepal)

Follow financial-grade backend authority principles.

---

# 1️⃣ PAYMENT ARCHITECTURE PRINCIPLE

Backend must always be source of truth.

Never:
- Trust frontend success redirect
- Mark order paid without verification
- Update payment without DB transaction

All payment updates must use MongoDB transaction session.

---

# 2️⃣ SUPPORTED PAYMENT METHODS

Enum:

paymentMethod:
- COD
- ESEWA

---

# 3️⃣ ORDER CREATION FLOW

When user places order:

Step 1:
Create order with:
- paymentStatus: PENDING
- orderStatus: PENDING

Step 2:
If paymentMethod === COD:
    - Return success
    - No external API call

If paymentMethod === ESEWA:
    - Generate signed payment request
    - Save temporary payment record
    - Return eSewa redirect data

---

# 4️⃣ ESEWA INTEGRATION FLOW (STRICT)

Flow:

1️⃣ User selects ESEWA  
2️⃣ Backend generates:
    - amount
    - transaction_uuid
    - product_code
    - success_url
    - failure_url
    - signed hash

3️⃣ User redirected to eSewa

4️⃣ eSewa redirects back

5️⃣ Backend verifies:
    - Signature
    - transactionId
    - amount
    - orderId

6️⃣ Backend:
    - Start DB transaction
    - Update payment status
    - Update order paymentStatus = PAID
    - Commit transaction

7️⃣ Log in auditLogs

---

# 5️⃣ ESEWA SIGNATURE VALIDATION

Must implement:

- HMAC SHA256
- Using secret key
- Verify signed fields

Never:
- Skip signature verification
- Trust query params blindly

---

# 6️⃣ PAYMENT SCHEMA RULES

Payment collection must include:

- orderId
- userId
- paymentMethod
- transactionId (unique)
- amount
- status
- rawResponse
- verifiedAt
- failureReason

transactionId must be unique indexed.

---

# 7️⃣ IDENTITY MATCHING RULE

When verifying eSewa response:

Match ALL:

- orderId
- transactionId
- amount
- userId

If mismatch → reject payment.

---

# 8️⃣ IDEMPOTENCY RULE

If verify endpoint is called multiple times:

- Do not duplicate payment
- Do not double update order
- Return already verified status

Use:

- Unique transactionId
- Check payment status before update

---

# 9️⃣ FAILURE HANDLING

If payment fails:

- Update payment status = FAILED
- Keep order as PENDING
- Allow user to retry payment

Never delete failed payment.

---

# 🔟 COD LOGIC

For COD:

- paymentStatus remains PENDING
- Admin manually updates:
    - paymentStatus → PAID
    - orderStatus → CONFIRMED

All manual updates must log audit record.

---

# 1️⃣1️⃣ SECURITY RULES

- Rate limit verify endpoint
- Validate order ownership
- Verify payment belongs to logged user
- Use DB transaction for order + payment update
- Log suspicious attempts

---

# 1️⃣2️⃣ PAYMENT STATUS ENUM

status:
- PENDING
- PAID
- FAILED
- REFUNDED (future ready)

---

# 1️⃣3️⃣ WEBHOOK READINESS

Design system to support:

Future:
- Webhook-based verification
- Stripe integration
- Khalti integration

Use provider-agnostic payment service pattern.

---

# 1️⃣4️⃣ ADMIN CONTROLS

Admin must be able to:

- View payment logs
- Filter by status
- Search by transactionId
- View raw eSewa response
- Refund manually (future ready)

---

# 1️⃣5️⃣ FRAUD PREVENTION

Reject payment if:

- Amount mismatch
- Duplicate transactionId
- Expired transaction
- Signature mismatch

Log fraud attempts.

---

# 1️⃣6️⃣ AUDIT LOGGING

Log:

- Payment created
- Payment verified
- Payment failed
- Admin payment override

---

# 1️⃣6️⃣.1 EMAIL NOTIFICATIONS ON PAYMENT EVENTS

Trigger transactional emails via notification service:

- Payment success → send order confirmation email to user
- Payment failure → send payment failed email to user
- COD order placed → send order received email to user
- Admin payment override → send status update email to user

All email sending must be async (non-blocking).
Future: use a job queue (Bull/BullMQ) for reliable delivery.

---

# 1️⃣7️⃣ ANALYTICS SUPPORT

Payment service must support aggregation:

- Total revenue
- Revenue by month
- Revenue by payment method
- Failed payment rate

---

# 1️⃣8️⃣ PROHIBITED

- No frontend payment confirmation logic
- No marking paid without verification
- No skipping signature validation
- No updating order without DB transaction
- No duplicate transactionId allowed
- No hardcoded API paths (use @amira/shared constants)
- No redefining payment enums (import from @amira/shared)

---

# END GOAL

Create a secure, Nepal-ready payment system
supporting:

- COD
- eSewa
- Audit logging
- Fraud prevention
- Future payment providers
- Admin analytics