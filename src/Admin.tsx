import { useState } from "react"
import type { Food } from "./food"
import Input from "./shared/Input"

const emptyFood: Food = {
    id: 0,
    name: "",
    description: "",
    price: 0,
    image: "",
    tags: []
}

export default function Admin() {
    const [food, setFood] = useState(emptyFood)

    return <>
        <h1>Admin</h1>
        <form>  
            <Input label="Name" name="name" value={food.name} onChange={value => setFood({ ...food, name: value })} />
            <Input label="Description" name="description" value={food.description} onChange={value => setFood({ ...food, description: value })} />
            <Input label="Price" name="price" value={food.price.toString()} onChange={value => setFood({ ...food, price: parseFloat(value) })} />
            <Input label="Image URL" name="image" value={food.image} onChange={value => setFood({ ...food, image: value })} />  
            <Input label="Tags" name="tags" value={food.tags.join(", ")} onChange={value => setFood({ ...food, tags: value.split(",").map(tag => tag.trim()) })} />
        </form >
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Food</button>
    </>
}