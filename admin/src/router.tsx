import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/admin-layout";
import { AdminLogin } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { UsersPage } from "./pages/users";
import { ConversationsPage } from "./pages/conversations";
import { MessagesPage } from "./pages/messages";
import { SettingsPage } from "./pages/settings";

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
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
