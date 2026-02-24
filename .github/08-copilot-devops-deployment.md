# 🚀 DEVOPS & DEPLOYMENT CONTROL FILE
## Nepal Woolen eCommerce (MERN + TS Monorepo)

You are GitHub Copilot Pro acting as a Senior DevOps Architect.

Design a scalable, production-ready deployment architecture
for a MERN monorepo system containing:

- Web (React + Vite)
- Admin (Refine + Vite)
- Mobile (Expo)
- Backend API (Express)
- MongoDB (Atlas)

---

# 1️⃣ MONOREPO MANAGEMENT

Use:

- pnpm workspaces (preferred)
OR
- Turborepo

Root structure:

apps/
  web/
  admin/
  mobile/
packages/
  api/
  shared/          # @amira/shared — types, enums, Zod schemas

Root must contain:

- pnpm-workspace.yaml
- turbo.json (if using turborepo)
- shared tsconfig base
- shared eslint config

---

# 2️⃣ TYPESCRIPT SHARED CONFIG

Create:

tsconfig.base.json

All apps extend from it.

Enforce:

- strict: true
- noImplicitAny
- strictNullChecks
- exactOptionalPropertyTypes

---

# 3️⃣ ENVIRONMENT MANAGEMENT

Use:

- dotenv-safe
- Separate env files:

.env.development
.env.production

Never commit .env files.

Use:

- ACCESS_SECRET
- REFRESH_SECRET
- MONGO_URI
- ESEWA_SECRET
- ESEWA_PRODUCT_CODE
- FRONTEND_URL
- ADMIN_URL
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- FROM_EMAIL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Validate env at app startup.

---

# 4️⃣ BACKEND DEPLOYMENT

Recommended:

- Railway
OR
- Render
OR
- DigitalOcean App Platform

Requirements:

- Node 22
- Auto restart on crash
- HTTPS enabled
- CORS configured properly
- Environment variables set securely

Enable:

- Production logging
- Compression middleware
- Rate limiting

---

# 5️⃣ DATABASE DEPLOYMENT

Use:

MongoDB Atlas

Enable:

- IP whitelist
- Backup
- Monitoring
- Index review

Use separate clusters for:

- Development
- Production

Never use production DB in dev.

---

# 6️⃣ WEB & ADMIN DEPLOYMENT

Deploy separately:

- Vercel (recommended)
OR
- Netlify

Set:

- Production API URL
- Secure HTTPS
- Proper CORS

Enable:

- Build caching
- Compression
- CDN asset hosting

---

# 7️⃣ MOBILE DEPLOYMENT

Use:

- Expo EAS Build

Steps:

- Configure app.json
- Setup production API URL
- Configure push notifications
- Build Android & iOS production versions

Never hardcode API URLs.

Use environment config.

---

# 8️⃣ CI/CD PIPELINE

Use GitHub Actions.

Workflow:

On push to main:

1️⃣ Install dependencies  
2️⃣ Build shared package (@amira/shared)  
3️⃣ Run TypeScript check  
4️⃣ Run ESLint  
5️⃣ Run backend tests (unit + integration)  
6️⃣ Run web tests  
7️⃣ Run admin tests  
8️⃣ Generate coverage report  
9️⃣ Fail if coverage < 70%  
1️⃣0️⃣ Build web  
1️⃣1️⃣ Build admin  
1️⃣2️⃣ Build backend  
1️⃣3️⃣ Deploy if successful  

See: 09-copilot-testing-strategy.md for test details.

Prevent deployment if lint or tests fail.

---

# 9️⃣ DOCKER STRATEGY (OPTIONAL BUT READY)

Prepare Dockerfile for backend:

- Multi-stage build
- Production image small size
- Use node:22-alpine

Expose correct port.
Use non-root user.

---

# 🔟 PRODUCTION HARDENING

Enable:

- Helmet
- Compression
- Rate limit
- Secure cookies
- HTTPS only

Disable:

- Detailed error stack
- Debug logs

---

# 1️⃣1️⃣ LOGGING & MONITORING

Use:

- Winston / Pino
- Log to file or cloud logging
- Monitor:
    - Error rate
    - Payment failures
    - Login attempts
    - API latency

Future ready:

- Sentry integration
- Uptime monitoring

---

# 1️⃣2️⃣ PERFORMANCE OPTIMIZATION

Backend:

- Enable compression
- Use caching headers
- Optimize DB indexes

Frontend:

- Code splitting
- Lazy loading
- Minification
- Tree shaking

Mobile:

- Remove console logs in production
- Enable Hermes engine

---

# 1️⃣3️⃣ BACKUP STRATEGY

Database:

- Daily backup
- Weekly snapshot
- Test restore process

Never skip backup configuration.

---

# 1️⃣4️⃣ SCALABILITY STRATEGY

Future ready for:

- Load balancer
- Horizontal scaling
- Redis caching
- CDN for images
- Microservices separation

---

# 1️⃣5️⃣ DOMAIN STRUCTURE

Example:

api.yourdomain.com
admin.yourdomain.com
www.yourdomain.com

Use HTTPS with SSL certificate.

---

# 1️⃣6️⃣ SECURITY IN PRODUCTION

- Use secure cookies
- Restrict CORS origins
- Rotate secrets periodically
- Enable MongoDB network access restrictions
- Enforce strong admin passwords

---

# 1️⃣7️⃣ VERSIONING STRATEGY

Use semantic versioning:

v1.0.0

Tag releases.

Use conventional commits.

---

# 1️⃣8️⃣ PROHIBITED

- No deploying without HTTPS
- No exposing .env
- No using same secrets in dev & prod
- No skipping CI checks
- No direct DB access from frontend

---

# END GOAL

Deploy a secure,
scalable,
production-grade
Nepal woolen eCommerce system
supporting:

- Web
- Admin
- Mobile
- COD
- eSewa
- CI/CD
- Monitoring
- Backup