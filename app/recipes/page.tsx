import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";

export default async function Recipes() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `id, title, description, notes,
    recipe_steps(id, description, step_order),
    recipe_tags(tags(name)),
    recipe_ingredients(quantity, unit, ingredient_id, ingredients(id, name))`
    );

  console.log(recipes);
  return (
    <div className="flex flex-col gap-6">
      {/* <pre>{JSON.stringify(recipes, null, 2)}</pre> */}
      {recipes?.map(recipe => {
        return (
          <Card key={recipe.id}>
            <h2 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">{recipe.title}</h2>
            <h3 className="italic">
              {recipe?.description}
            </h3>
            <h3 className="font-bold">Ingredients</h3>
            <ul>
              {recipe.recipe_ingredients.map(recipe_ingredient => (
                <li key={recipe_ingredient.ingredient_id} className="list-disc">
                  {recipe_ingredient.ingredients?.name || "Ingredient Missing"} -
                  {recipe_ingredient.unit} -
                  {recipe_ingredient.quantity}
                </li>
              ))}
            </ul>

            <h3 className="font-bold">Steps</h3>
            <ol>
              {recipe.recipe_steps.toSorted((a, b) => a.step_order - b.step_order).
              map(recipe_step => (
                <li key={recipe_step.id} className="list-decimal">
                  {recipe_step.description}
                </li>
              ))}
            </ol>
            <h3 className="font-bold">Notes</h3>
            <p>{recipe?.notes}</p>
          </Card>
        )
      })}
    </div>
  )
}
