import { useUser } from "@/UserContext";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => {
    const { email } = useUser();
    return (
      <>
        <nav>
          <Link to="/">Home</Link> | <Link to="/admin">Admin</Link> |{" "}
          {email ? (
            <span>Welcome, {email}</span>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
        <Outlet />
      </>
    );
  },
});
