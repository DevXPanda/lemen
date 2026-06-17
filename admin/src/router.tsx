import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/admin-layout";
import { AdminLogin } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { UsersPage } from "./pages/users";
import { ConversationsPage } from "./pages/conversations";
import { MessagesPage } from "./pages/messages";
import { SettingsPage } from "./pages/settings";
import CreatorRequests from "@/pages/CreatorRequests";
import BrandRequests from "@/pages/BrandRequests";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLogin />,
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/conversations",
        element: <ConversationsPage />,
      },
      {
        path: "/messages/:id",
        element: <MessagesPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
  path: "/verification-requests/creators",
  element: <CreatorRequests />,
},
{
  path: "/verification-requests/brands",
  element: <BrandRequests />,
},
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
