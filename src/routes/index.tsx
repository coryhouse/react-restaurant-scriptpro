import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { foodTags } from "../food";
import Menu from "../Menu";

export const menuSearchSchema = z.object({
  q: z.string().optional(),
  tag: z.enum(foodTags).optional(),
  minPrice: z.number().min(0).max(25).optional(),
  maxPrice: z.number().min(0).max(25).optional(),
});

export type MenuSearch = z.infer<typeof menuSearchSchema>;

export const Route = createFileRoute("/")({
  component: Menu,
  validateSearch: menuSearchSchema,
});
