import { createFileRoute } from "@tanstack/react-router";
import Admin from "../../Admin";

export const Route = createFileRoute("/admin/")({
  component: Admin,
});
