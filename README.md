# JulesFPV

Responsive FPV parts storefront with a Vite client and an Express API backed by Firebase Firestore.

## Run locally

1. Use Node.js 20 or newer.
2. Install dependencies: `npm install`.
3. Start the API and storefront: `npm run dev`.
4. Open `http://localhost:5173`.

The API runs on port 3000. It reads `.env` on startup. `npm run build` creates the production client and `npm start` serves it through the same Node server.

## Server features

- User registration and sign-in; passwords are hashed with bcrypt before they are written to Firestore.
- Signed, seven-day, HttpOnly session cookies; admin checks are enforced on the server using `ADMIN_EMAIL`.
- Firestore catalog and orders, with server-side price/stock checks and stock reduction when an admin verifies payment.
- Account-required checkout with delivery or customer pickup, plus private customer order history in the cart drawer.
- Cloudinary product image uploads and authenticated private payment-receipt uploads. Admins view receipts through the authenticated server, with no expiring browser link.
- Admin product create/edit/remove and payment verification/rejection.
- Firestore client rules deny direct browser access; requests go through the server API.
- Manual Mobile Money payment: customers submit a receipt screenshot; an admin verifies the payment before fulfillment.

## Configuration

The local `.env` is ignored by Git. `.env.example` lists supported variable names. The project currently reads the Firebase service account from the existing multiline `serviceAccountKey` value, `FIREBASE_SERVICE_ACCOUNT_JSON`, or Application Default Credentials. Never use a `VITE_` prefix for server credentials.

Required settings are `ADMIN_EMAIL`, `SESSION_SECRET` (at least 32 characters), `FIREBASE_PROJECT_ID`, Cloudinary credentials, `APP_ORIGIN`, and `PAYMENT_INSTRUCTIONS`. The local `.env` has been configured with the provided admin email and Mobile Money recipient. The first account registered using that exact admin email receives server-checked admin access.

## Vercel deployment

The repository includes `vercel.json` for the Vite build, static output in `dist`, direct page URLs, and API function routing. The existing root `index.html` is the storefront entry point; it should be served through SPA rewrites, not replaced with a redirect page. The API functions route requests through the Express app in `server/index.js`.

In the Vercel project settings, configure `ADMIN_EMAIL`, `SESSION_SECRET`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `APP_ORIGIN`, and `PAYMENT_INSTRUCTIONS`. Set `APP_ORIGIN` to the deployed HTTPS origin with no trailing slash. Store the service-account JSON as a protected environment variable; never prefix server secrets with `VITE_`.

The Firestore database is provisioned in `africa-south1`. Grant the service account Firestore access, and deploy `firestore.rules` with `firebase deploy --only firestore:rules` before accepting orders.

Any credential exposed outside its secret manager should be revoked and rotated before launch. The Firebase service account that was present in the original workspace was displayed during initial inspection, so rotate that key before publishing the site.
