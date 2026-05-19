import { Button } from "@/components/ui/button";
import { useUser } from "@/UserContext";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => {
    const { email, setEmail } = useUser();
    return (
      <>
        <nav>
          <Link to="/">Home</Link> |{" "}
          {email && (
            <>
              <Link to="/admin">Admin</Link> |
            </>
          )}{" "}
          {email ? (
            <>
              <span>Welcome, {email}</span>{" "}
              <Button onClick={() => setEmail("")}>Log out</Button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
        <Outlet />
      </>
    );
  },
});
