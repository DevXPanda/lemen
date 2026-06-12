import { createBrowserRouter, useRouteError, Link } from "react-router-dom";
import { RootLayout, NotFoundComponent } from "./routes/__root";
import { Landing } from "./routes/index";
import { Browse } from "./routes/browse";
import { Login } from "./routes/login";
import { Register } from "./routes/register";
import { MessagesPage } from "./routes/messages";
import { Profile, loader as profileLoader } from "./routes/influencer.$id";
import { CustomerDash } from "./routes/dashboard.customer";
import { CreatorDash } from "./routes/dashboard.influencer";
import { ResetPassword } from "./routes/reset-password";

function DefaultErrorComponent() {
  const error = useRouteError() as Error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error?.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left font-mono text-xs text-destructive">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <DefaultErrorComponent />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/browse",
        element: <Browse />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/messages",
        element: <MessagesPage />,
      },
      {
        path: "/influencer/:id",
        element: <Profile />,
        loader: profileLoader,
      },
      {
        path: "/dashboard/customer",
        element: <CustomerDash />,
      },
      {
        path: "/dashboard/influencer",
        element: <CreatorDash />,
      },
      {
        path: "*",
        element: <NotFoundComponent />,
      },
    ],
  },
]);
