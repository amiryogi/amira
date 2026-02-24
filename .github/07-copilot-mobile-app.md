# 📱 MOBILE APP CONTROL FILE
## React Native (Expo) + TypeScript
## Nepal Woolen eCommerce

You are GitHub Copilot Pro acting as a Senior Mobile Architect.

Build a production-grade mobile application
supporting both:

- USER interface
- ADMIN interface

Use Expo (latest) + TypeScript strictly.

---

# 1️⃣ TECH STACK (STRICT)

- Expo SDK latest
- React Native latest
- TypeScript (strict true)
- NativeWind (Tailwind for RN)
- React Navigation (Stack + Tabs)
- Axios
- TanStack Query
- Expo SecureStore
- Zod (from @amira/shared)
- React Hook Form
- react-native-webview (for eSewa)
- expo-image-picker (for admin product images)

IMPORTANT: Verify NativeWind compatibility with Tailwind v4.
NativeWind v4 may have specific requirements for Tailwind v4's
CSS-first config. If incompatible, use NativeWind v2/v3
with Tailwind v3. Prototype early.

---

# 2️⃣ PROJECT STRUCTURE (MANDATORY)

src/
  main.tsx
  navigation/
  screens/
  features/
  components/
  hooks/
  services/
  store/
  utils/
  types/

Use feature-based grouping:

features/
  auth/
  product/
  cart/
  order/
  payment/
  admin/

---

# 3️⃣ ROLE-BASED UI SYSTEM

After login:

If role === USER:
    Load UserTabs

If role === ADMIN:
    Load AdminTabs

Never mix user & admin screens.

Protect all screens using AuthGuard.

---

# 4️⃣ AUTH STRATEGY (MOBILE)

Access token:
- Store in memory

Refresh token:
- Store in Expo SecureStore

Use Axios interceptor to:

- Auto refresh expired token
- Retry failed request
- Logout if refresh invalid

Never store tokens in AsyncStorage.

---

# 5️⃣ NAVIGATION STRUCTURE

Unauthenticated:

- Login
- Register

Authenticated USER:

Bottom Tabs:
- Home
- Categories
- Cart
- Orders
- Profile

Authenticated ADMIN:

Bottom Tabs:
- Dashboard
- Orders
- Products
- Payments
- Users

---

# 6️⃣ PRODUCT LIST (USER)

Must support:

- Pagination
- Category filter
- Search
- Pull-to-refresh
- Skeleton loading
- Infinite scroll (optional)

Use TanStack Query with caching.

---

# 7️⃣ PRODUCT DETAIL (USER)

Must include:

- Image carousel
- Variant selector
- Stock indicator
- Add to cart
- Rating display
- Related products

Use NativeWind responsive styling.

---

# 8️⃣ CART SYSTEM

Use lightweight state store (Zustand or Context).

Cart must:

- Add item
- Remove item
- Update quantity
- Calculate total
- Persist in AsyncStorage (cart only)

Never persist auth token in AsyncStorage.

---

# 9️⃣ CHECKOUT FLOW (USER)

Step 1:
- Validate login

Step 2:
- Select saved address or enter new one
- Address form (React Hook Form + Zod from @amira/shared)

Step 3:
- Select payment method:
    - COD
    - ESEWA

Step 4:
- Call backend create order

If COD:
    → Navigate to OrderSuccess screen

If ESEWA:
    → Open WebView with eSewa URL

---

# 🔟 ESEWA WEBVIEW FLOW

Use react-native-webview.

Flow:

- Open WebView with eSewa payment URL
- Detect redirect to success/failure URL
- Close WebView
- Call backend verify endpoint
- Navigate to success or failure screen

Never trust WebView redirect alone.

Always call backend verification.

---

# 1️⃣1️⃣ ORDER SCREEN (USER)

User must see:

- Order list
- Order status
- Payment status
- Order details
- Pull-to-refresh

---

# 1️⃣2️⃣ ADMIN MOBILE FEATURES

Admin mobile app must support:

Dashboard:
- Total revenue
- Orders today
- Failed payments

Orders:
- View list
- Filter by status
- Update orderStatus
- Update COD paymentStatus

Products:
- Add product
- Edit product
- Upload image (using expo-image-picker + multipart upload)
- Manage stock

Payments:
- View payment logs
- Filter failed
- Search transactionId

Users:
- View users
- Change role (ADMIN only)
- Revoke session

All actions must call backend APIs.

---

# 1️⃣3️⃣ UI DESIGN REQUIREMENTS

Use NativeWind.

Design must be:

- Clean
- Modern
- Nepal woolen aesthetic
- Smooth animations
- Dark mode support
- Accessible

Test on:

- Small Android device
- iPhone screen size
- Tablet layout

---

# 1️⃣4️⃣ PERFORMANCE RULES

- Use FlatList for large lists
- Avoid unnecessary re-renders
- Memoize heavy components
- Lazy load screens
- Use query caching

---

# 1️⃣5️⃣ ERROR HANDLING

- Toast messages
- Pull-to-refresh fallback
- Retry button for failed requests
- Graceful empty state

Never expose backend internal errors.

---

# 1️⃣6️⃣ PUSH NOTIFICATION READY STRUCTURE

Prepare for:

- Order confirmation
- Shipping update
- Admin alert

Use Expo Notifications (future-ready structure).

---

# 1️⃣7️⃣ SECURITY RULES

- Protect admin screens strictly
- Auto logout if token invalid
- Handle token reuse detection
- Clear SecureStore on logout
- Prevent screen access via deep linking

---

# 1️⃣8️⃣ PROHIBITED

- No business logic inside UI
- No localStorage
- No storing token in AsyncStorage
- No client-side payment confirmation
- No skipping backend verification
- No duplicating types (import from @amira/shared)
- No hardcoded API paths (import from @amira/shared)

---

# 1️⃣9️⃣ ADDRESS MANAGEMENT (USER)

Profile tab must include address management:

- List saved addresses
- Add new address
- Edit address
- Delete address
- Set default address

At checkout, user selects from saved addresses
or enters a new one.

Use address validation schema from @amira/shared.

---

# END GOAL

Build a secure,
responsive,
role-based,
Nepal-ready mobile application
supporting:

- Woolen product shopping
- COD + eSewa
- Admin management
- Secure authentication
- Production scalability