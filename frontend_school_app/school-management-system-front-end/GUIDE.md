# School Management System - Developer Guide

This project is built using **React Router v7** and **Vite**. This guide explains how the routing system works and how to add new pages to the application.

## Project Structure

*   **`src/routes.ts`**: The central configuration file for all application routes.
*   **`src/entry.client.tsx`**: The entry point for the React application (handles hydration).
*   **`src/root.tsx`**: The root layout component (contains `<html>`, `<head>`, and `<body>`).
*   **`src/`**: Directory where your page components (e.g., `home.tsx`, `about.tsx`) reside.

## How to Add a New Page

Follow these steps to add a new page (e.g., a "Contact" page).

### 1. Create the Component File
Create a new `.tsx` file in the `src/` directory.

**File:** `src/contact.tsx`
```tsx
import { Link } from "react-router";

export default function Contact() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Contact Us</h1>
      <p>Welcome to the contact page.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
```

### 2. Register the Route
Open `src/routes.ts` and register your new component.

*   Import the `route` helper (or `index` for the homepage).
*   Add a new entry to the array.
*   **Important:** Use relative paths (start with `./`) for your component files.

**File:** `src/routes.ts`
```typescript
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),                // Matches "/"
  route("about", "./about.tsx"),      // Matches "/about"
  route("contact", "./contact.tsx"),  // <--- YOUR NEW ROUTE
  route("dashboard", "./dashboard.tsx"),
  route("*?", "./catchall.tsx"),      // Fallback 404
] satisfies RouteConfig;
```

### 3. Verify
Start the development server (`npm run dev`) and visit `http://localhost:5173/contact`.

## Navigation

To navigate between pages without a full page reload, use the `<Link>` component from `react-router`.

```tsx
import { Link } from "react-router";

// ... inside your component
<Link to="/dashboard">Go to Dashboard</Link>
```

## Troubleshooting

### "Page is Blank / White Screen"
If you see a blank screen:
1.  **Check the Console:** Open Developer Tools (F12) -> Console. Look for red error messages.
2.  **Check `routes.ts`:** Ensure the file path in `route(...)` is correct and starts with `./` if it's in the same directory.
3.  **Restart Server:** Sometimes adding a new file requires restarting the dev server or saving `vite.config.ts` to trigger a reload.