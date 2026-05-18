import { useEffect, useState } from "react";
import type { Food } from "./food";

export default function Menu() {
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/food")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setFoods(data);
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  if (error) {
    return <div className="p-6">Oops!</div>;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1>Menu</h1>
      <div className="flex flex-wrap gap-6">
        {foods.map((food) => (
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
        ))}
      </div>
    </div>
  );
}
