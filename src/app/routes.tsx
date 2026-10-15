import { createBrowserRouter } from "react-router";
import { StoreProvider } from "./store";
import { AppShell, PublicLayout } from "./ui";
import { AdminOverview, AdminRates, Generic, Home, Login, PortalOverview, Protected, QuoteWizard, RateDetail, RatesPage, RequestsPage, SavedRoutes, ServiceDetail, Services, Tracking } from "./pages";
import { RequestDetail } from "./requests";

function Root() {
  return <StoreProvider><PublicLayout /></StoreProvider>;
}
function StoreRoot({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "services", Component: Services },
      { path: "services/:type", Component: ServiceDetail },
      { path: "freight-rates", Component: RatesPage },
      { path: "freight-rates/:id", Component: RateDetail },
      { path: "tracking", Component: Tracking },
      { path: "request-quote", Component: QuoteWizard },
      { path: "about", element: <Generic title="About Arclane" /> },
      { path: "contact", element: <Generic title="Contact & Support" /> },
      { path: "privacy", element: <Generic title="Privacy Policy" /> },
      { path: "terms", element: <Generic title="Terms of Service" /> },
      { path: "signup", element: <Generic title="Create your account" /> },
      { path: "forgot-password", element: <Generic title="Reset your password" /> },
      { path: "reset-password", element: <Generic title="Choose a new password" /> },
      { path: "*", element: <Generic title="Page not found" /> },
    ],
  },
  { path: "/login", element: <StoreRoot><Login /></StoreRoot> },
  {
    path: "/portal",
    element: <StoreRoot><Protected><AppShell /></Protected></StoreRoot>,
    children: [
      { index: true, Component: PortalOverview },
      { path: "requests", element: <RequestsPage /> },
      { path: "requests/:id", element: <RequestDetail /> },
      { path: "shipments", element: <RequestsPage /> },
      { path: "shipments/:id", element: <RequestDetail /> },
      { path: "saved-routes", Component: SavedRoutes },
      { path: "notifications", element: <Generic title="Notifications" /> },
      { path: "settings", element: <Generic title="Profile & Settings" /> },
    ],
  },
  {
    path: "/admin",
    element: <StoreRoot><Protected admin><AppShell admin /></Protected></StoreRoot>,
    children: [
      { index: true, Component: AdminOverview },
      { path: "requests", element: <RequestsPage admin /> },
      { path: "requests/:id", element: <RequestDetail admin /> },
      { path: "shipments", element: <RequestsPage admin /> },
      { path: "rates", Component: AdminRates },
      { path: "routes", element: <AdminRates /> },
      { path: "customers", element: <Generic title="Customer Management" /> },
      { path: "reports", element: <Generic title="Revenue & Reports" /> },
      { path: "notifications", element: <Generic title="Operations Notifications" /> },
      { path: "audit-logs", element: <Generic title="Audit Logs" /> },
      { path: "settings", element: <Generic title="Admin Settings" /> },
    ],
  },
]);
