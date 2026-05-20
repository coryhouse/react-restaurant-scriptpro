import { Button } from "@/components/ui/button";
import { useUser } from "@/UserContext";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        <Toaster richColors position="top-right" />
      </>
    );
  },
});
