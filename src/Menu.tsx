import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { foodSchema, foodTags, type FoodTag } from "./food";
import { FieldLabel, FieldSet } from "./components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import type { MenuSearch } from "./routes/index";

const route = getRouteApi("/");

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 25;

export default function Menu() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const q = search.q ?? "";
  const selectedTag = search.tag;
  const minPrice = search.minPrice ?? DEFAULT_MIN_PRICE;
  const maxPrice = search.maxPrice ?? DEFAULT_MAX_PRICE;

  const updateSearch = (next: Partial<MenuSearch>) => {
    navigate({
      search: (prev) => {
        const merged: MenuSearch = { ...prev, ...next };
        if (!merged.q) delete merged.q;
        if (!merged.tag) delete merged.tag;
        if (merged.minPrice === DEFAULT_MIN_PRICE) delete merged.minPrice;
        if (merged.maxPrice === DEFAULT_MAX_PRICE) delete merged.maxPrice;
        return merged;
      },
      replace: true,
    });
  };

  const {
    data: foods = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["foods"],
    throwOnError: true,
    queryFn: async () => {
      const resp = await fetch("http://localhost:3001/foods");
      if (!resp.ok) {
        throw new Error("Failed to fetch foods");
      }
      const data = await resp.json();
      return foodSchema.array().parse(data); // runtime validation
    },
  });

  if (isError) {
    return <div className="p-6">Oops!</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const matchingFoods = foods.filter(
    (food) =>
      (!selectedTag || food.tags.includes(selectedTag)) &&
      food.name.toLowerCase().includes(q.toLowerCase()) &&
      food.price >= minPrice &&
      food.price <= maxPrice,
  );

  return (
    <div className="p-6">
      <h1>Menu</h1>

      <section className="flex flex-wrap items-start gap-4 pb-6">
        <FieldSet>
          <FieldLabel>Search</FieldLabel>
          <input
            type="search"
            placeholder="Search for food..."
            value={q}
            onChange={(e) => updateSearch({ q: e.target.value })}
            className="w-full max-w-64 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </FieldSet>

        <FieldSet>
          <FieldLabel>Filter by tag</FieldLabel>
          <Select
            value={selectedTag ?? "all"}
            onValueChange={(value) =>
              updateSearch({
                tag: value === "all" ? undefined : (value as FoodTag),
              })
            }
          >
            <SelectTrigger className="data-[size=default]:h-[42px] w-full max-w-48">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tags</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                {foodTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldSet>

        <FieldSet>
          <FieldLabel>Price</FieldLabel>
          <div className="mx-auto grid w-full max-w-xs gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[minPrice, maxPrice]}
              max={25}
              step={1}
              onValueChange={([min, max]) =>
                updateSearch({ minPrice: min, maxPrice: max })
              }
              className="mx-auto w-full max-w-xs"
            />
          </div>
        </FieldSet>
      </section>

      <section className="flex flex-wrap gap-6">
        {matchingFoods.length === 0 ? (
          <div className="pt-6">
            <p>No matching foods found.</p>
          </div>
        ) : (
          matchingFoods.map((food) => (
            <div
              key={food.id}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <img
                src={"/images/" + food.image}
                alt={food.name}
                className="h-48 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <h2>{food.name}</h2>
                <p className="mb-3 flex-1">{food.description}</p>
                <p className="mb-2 text-lg font-semibold">
                  ${food.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Tags: {food.tags.join(", ")}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
