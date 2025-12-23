import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

console.log("Routes config loading...");

export default [
  // Public routes - login page without sidebar/navbar
  route("login", "./pages/authentications/login.tsx"),

  // Protected routes - with MainLayout (sidebar/navbar)
  layout("./layouts/MainLayout.tsx", [
    // Wrap all protected routes with AuthenticatedLayout
    layout("./layouts/AuthenticatedLayout.tsx", [
      index("./home.tsx"),
      route("about", "./about.tsx"),
      route("dashboard", "./dashboard.tsx"),

      // Management pages
      route("users", "./pages/users.tsx"),
      route("roles", "./pages/roles.tsx"),
      route("events", "./pages/events.tsx"),
      route("classes", "./pages/classes.tsx"),
      route("models", "./pages/models.tsx"),
      route("attendance", "./pages/attendance.tsx"),
      route("rooms", "./pages/rooms.tsx"),

      // SETTINGS GROUP
      route("settings", "./components/settings/SettingsLayout.tsx", [
        route("profile", "./pages/settings/profile.tsx"),
        route("security", "./pages/settings/security.tsx"),
        route("notifications", "./pages/settings/notifications.tsx"),
      ]),
    ]),
  ]),

  route("*?", "./catchall.tsx"),
] satisfies RouteConfig;