# 🔐 AUTHENTICATION & SECURITY CONTROL FILE
## Project: Nepal Woolen eCommerce (MERN + TypeScript)

You are GitHub Copilot Pro acting as a Senior Security Architect.

Design a secure, scalable authentication system
for Web + Admin + Mobile applications.

Follow zero-trust architecture principles.

---

# 1️⃣ AUTH STRATEGY OVERVIEW

Use:

- Access Token (JWT)
- Refresh Token (JWT)
- Token rotation
- Role-based access control (RBAC)
- Secure token storage per platform

---

# 2️⃣ TOKEN CONFIGURATION (STRICT)

Access Token:
- Expiry: 15 minutes
- Contains:
    - userId
    - role
    - tokenVersion
- Signed with ACCESS_SECRET

Refresh Token:
- Expiry: 7 days
- Stored in database
- Signed with REFRESH_SECRET
- Rotated on every refresh

Never use same secret for both tokens.

---

# 3️⃣ WEB TOKEN STORAGE STRATEGY

Web (React):

- Access token → memory only
- Refresh token → HTTP-only cookie
- SameSite: strict
- Secure: true (production)

Never store tokens in localStorage.

---

# 4️⃣ MOBILE TOKEN STORAGE STRATEGY

Mobile (React Native):

- Access token → memory
- Refresh token → SecureStore
- Implement automatic refresh interceptor

Never store token in AsyncStorage.

---

# 5️⃣ REFRESH TOKEN ROTATION FLOW

1. User logs in
2. Access + Refresh issued
3. Refresh stored in DB
4. When access expires:
    - Client calls /refresh
5. Server:
    - Verify refresh token
    - Check DB
    - Issue new access
    - Issue new refresh
    - Revoke old refresh

If refresh reused → invalidate all sessions.

---

# 6️⃣ LOGOUT STRATEGY

On logout:

- Revoke refresh token in DB
- Clear cookie (web)
- Delete SecureStore token (mobile)

---

# 6️⃣.1 PASSWORD RESET FLOW

1. User submits email to POST /api/v1/auth/forgot-password
2. Backend generates a time-limited reset token (1 hour expiry)
3. Token is hashed and stored in DB
4. Email sent via Nodemailer with reset link containing raw token
5. User clicks link → frontend reset password form
6. Frontend calls POST /api/v1/auth/reset-password with token + new password
7. Backend verifies token hash, checks expiry
8. Updates password, increments tokenVersion
9. All existing refresh tokens for user are revoked
10. User must log in again

Security:
- Rate limit forgot-password endpoint
- Never reveal whether email exists (generic success message)
- Invalidate reset token after use (single-use)

---

# 7️⃣ ROLE-BASED ACCESS CONTROL (RBAC)

Roles:

- USER
- ADMIN

Implement:

authMiddleware:
- verifies access token
- attaches user to req

roleMiddleware:
- checks required role
- denies unauthorized access

Admin routes must always use:
authMiddleware + roleMiddleware("ADMIN")

---

# 8️⃣ PASSWORD SECURITY

- Use bcrypt
- Salt rounds: 12+
- Validate strong password
- Never log password
- Never return password in response

---

# 9️⃣ RATE LIMITING

Apply rate limit on:

- login
- register
- refresh
- payment verify

Use express-rate-limit.

---

# 🔟 INPUT VALIDATION

- Use Zod schemas from @amira/shared package
- Validate before controller
- Reject malformed ObjectId
- Sanitize input to prevent NoSQL injection
- Import validation schemas: @amira/shared/schemas

---

# 1️⃣1️⃣ CORS POLICY

Configure:

- Allow web domain
- Allow admin domain
- Allow mobile origin
- Credentials: true

Never allow wildcard origin in production.

---

# 1️⃣2️⃣ PROTECTION AGAINST COMMON ATTACKS

Implement:

- Helmet
- XSS protection
- CSRF protection (web) — see below
- Prevent JWT tampering
- Prevent replay attack in payment verification
- Check tokenVersion for forced logout

CSRF Implementation Strategy:

Since refresh tokens are stored in HTTP-only cookies,
CSRF is a real attack vector.

Use double-submit cookie pattern:
1. On login, generate a random CSRF token
2. Send it as a non-HttpOnly cookie AND in the response body
3. Frontend stores it in memory and sends it as X-CSRF-Token header
4. Backend middleware validates header matches cookie
5. Rotate CSRF token on each refresh

Alternative: Use SameSite=Strict on all cookies
(sufficient for modern browsers, but add CSRF tokens for defense-in-depth).

---

# 1️⃣3️⃣ TOKEN VERSION STRATEGY

Add to User schema:

tokenVersion: number

When:
- password changed
- suspicious activity
- admin forces logout

Increment tokenVersion.
Reject tokens with old version.

---

# 1️⃣4️⃣ SESSION MANAGEMENT

Support:

- Multiple device login
- Refresh token per device
- Device info stored in DB

Allow admin to:
- View active sessions
- Revoke sessions

---

# 1️⃣5️⃣ ADMIN SECURITY HARDENING

Admin routes:

- Log all admin actions in auditLogs
- Enforce stricter rate limiting
- Optional: 2FA-ready structure

Never allow:
- Role change without admin check
- Self role escalation

---

# 1️⃣6️⃣ PAYMENT SECURITY

For eSewa:

- Always verify server-to-server
- Validate signature
- Match:
    - transactionId
    - amount
    - orderId
- Use DB transaction when updating order + payment

Never trust frontend success redirect.

---

# 1️⃣7️⃣ ERROR HANDLING SECURITY

Do NOT expose:

- stack traces
- internal DB errors
- JWT secret details

Return generic message in production.

---

# 1️⃣8️⃣ ENVIRONMENT SECURITY

Use:

- dotenv-safe
- Validate required env variables
- Separate:
    - dev
    - staging
    - production configs

Never commit .env file.

---

# 1️⃣9️⃣ MONITORING & LOGGING

Log:

- failed login attempts
- payment verification
- suspicious token reuse
- admin actions

Use Winston or Pino.

---

# 2️⃣0️⃣ PROHIBITED

- No localStorage token storage
- No plaintext password
- No long-lived access tokens
- No skipping token rotation
- No exposing internal error details

---

# END GOAL

Create a secure,
scalable,
production-grade authentication system
for Nepal woolen eCommerce
supporting:

- Web
- Admin
- Mobile
- COD
- eSewa