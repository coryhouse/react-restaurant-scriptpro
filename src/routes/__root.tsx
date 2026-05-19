import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/admin">Admin</Link> |{" "}
        <Link to="/login">Login</Link>
      </nav>
      <Outlet />
    </>
  ),
});

const x = 1;
const y = 2;

const myArrow = () => {
  function myFunc() {
    return x === 1 ? "one" : "two";
  }

  return (
    <>
      <button>{myFunc()}</button>
    </>
  );
};
