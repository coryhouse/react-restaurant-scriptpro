import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "radix-ui";
import { Loader, Pencil, Plus, Trash, X } from "lucide-react";
import { toast } from "sonner";
import {
  foodSchema,
  foodTags,
  type Food,
  type FoodTag,
  type NewFood,
} from "./food";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Checkbox } from "./components/ui/checkbox";
import { FieldLabel, FieldSet } from "./components/ui/field";

const API = "http://localhost:3001/foods";

type DrawerMode =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; food: Food };

const EMPTY_FOOD: NewFood = {
  name: "",
  description: "",
  price: 1,
  image: "",
  tags: [],
};

export default function Admin() {
  const [drawer, setDrawer] = useState<DrawerMode>({ kind: "closed" });
  const qc = useQueryClient();

  const {
    data: foods = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const resp = await fetch(API);
      if (!resp.ok) throw new Error("Failed to fetch foods");
      return foodSchema.array().parse(await resp.json());
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["foods"] });

  const createFood = useMutation({
    mutationFn: async (food: NewFood) => {
      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(food),
      });
      if (!resp.ok) throw new Error("Failed to create item");
      return resp.json();
    },
    onSuccess: invalidate,
  });

  const updateFood = useMutation({
    mutationFn: async (food: Food) => {
      const resp = await fetch(`${API}/${food.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(food),
      });
      if (!resp.ok) throw new Error("Failed to update item");
      return resp.json();
    },
    onSuccess: invalidate,
  });

  const deleteFood = useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete item");
    },
    onSuccess: invalidate,
  });

  const handleSave = async (food: NewFood | Food) => {
    try {
      if ("id" in food) {
        await updateFood.mutateAsync(food);
        toast.success(`Updated "${food.name}"`);
      } else {
        await createFood.mutateAsync(food);
        toast.success(`Added "${food.name}"`);
      }
      setDrawer({ kind: "closed" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = (food: Food) => {
    if (!confirm(`Delete "${food.name}"? This can't be undone.`)) return;
    deleteFood.mutate(food.id, {
      onSuccess: () => toast.success(`Deleted "${food.name}"`),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  };

  if (isError) return <div className="p-6">Oops! Couldn't load menu.</div>;
  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1>Menu admin</h1>
          <p className="text-sm text-muted-foreground">
            {foods.length} item{foods.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="lg" onClick={() => setDrawer({ kind: "add" })}>
          <Plus /> Add menu item
        </Button>
      </header>

      {foods.length === 0 ? (
        <p>No menu items yet. Add your first one.</p>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <article
              key={food.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <img
                src={`/images/${food.image}`}
                alt={food.name}
                className="h-48 w-full object-cover"
              />
              <div className="absolute right-2 top-2 flex gap-1 rounded-md bg-background/90 p-1 shadow-sm backdrop-blur-sm">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Edit ${food.name}`}
                  onClick={() => setDrawer({ kind: "edit", food })}
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Delete ${food.name}`}
                  onClick={() => handleDelete(food)}
                  disabled={
                    deleteFood.isPending && deleteFood.variables === food.id
                  }
                  className="text-destructive hover:text-destructive"
                >
                  <Trash />
                </Button>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{food.name}</h2>
                  <span className="font-semibold">
                    ${food.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {food.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {food.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <FoodDrawer
        mode={drawer}
        onClose={() => setDrawer({ kind: "closed" })}
        onSave={handleSave}
        saving={createFood.isPending || updateFood.isPending}
      />
    </div>
  );
}

type FoodDrawerProps = {
  mode: DrawerMode;
  onClose: () => void;
  onSave: (food: NewFood | Food) => Promise<void> | void;
  saving: boolean;
};

function FoodDrawer(props: FoodDrawerProps) {
  const { mode, onClose, onSave, saving } = props;
  const isOpen = mode.kind !== "closed";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-30 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              {mode.kind === "edit"
                ? `Edit ${mode.food.name}`
                : "Add menu item"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button size="icon-sm" variant="ghost" aria-label="Close">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          {isOpen && (
            <FoodForm
              key={mode.kind === "edit" ? mode.food.id : "new"}
              initial={mode.kind === "edit" ? mode.food : EMPTY_FOOD}
              existingId={mode.kind === "edit" ? mode.food.id : undefined}
              saving={saving}
              onCancel={onClose}
              onSubmit={onSave}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FoodForm({
  initial,
  existingId,
  saving,
  onCancel,
  onSubmit,
}: {
  initial: NewFood;
  existingId?: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (food: NewFood | Food) => Promise<void> | void;
}) {
  const [form, setForm] = useState<NewFood>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof NewFood>(key: K, value: NewFood[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTag = (tag: FoodTag) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = existingId ? { ...form, id: existingId } : form;
    const schema = existingId ? foodSchema : foodSchema.omit({ id: true });
    const result = schema.safeParse(candidate);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        next[issue.path.join(".")] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    await onSubmit(result.data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <FieldSet>
          <FieldLabel htmlFor="food-name">Name</FieldLabel>
          <Input
            id="food-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </FieldSet>

        <FieldSet>
          <FieldLabel htmlFor="food-description">Description</FieldLabel>
          <Textarea
            id="food-description"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            aria-invalid={!!errors.description}
          />
        </FieldSet>

        <div className="grid grid-cols-2 gap-3">
          <FieldSet>
            <FieldLabel htmlFor="food-price">Price</FieldLabel>
            <Input
              id="food-price"
              type="number"
              step="0.01"
              min={1}
              value={form.price}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </FieldSet>

          <FieldSet>
            <FieldLabel htmlFor="food-image">Image filename</FieldLabel>
            <Input
              id="food-image"
              value={form.image}
              placeholder="burger.jpg"
              onChange={(e) => update("image", e.target.value)}
              aria-invalid={!!errors.image}
            />
            {errors.image && (
              <p className="text-xs text-destructive">{errors.image}</p>
            )}
          </FieldSet>
        </div>

        <FieldSet>
          <FieldLabel>Tags</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {foodTags.map((tag) => {
              const id = `tag-${tag}`;
              return (
                <label
                  key={tag}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                >
                  <Checkbox
                    id={id}
                    checked={form.tags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  {tag}
                </label>
              );
            })}
          </div>
        </FieldSet>

        {form.image && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Image preview
            </p>
            <img
              src={`/images/${form.image}`}
              alt=""
              className="h-32 w-full rounded-md border border-border object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader className="animate-spin" />}
          {existingId ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
