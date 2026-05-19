import { createFileRoute } from "@tanstack/react-router";
import Menu from "../Menu";

export const Route = createFileRoute("/")({
  component: Menu,
});
