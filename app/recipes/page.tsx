import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

  if (error) {
    console.log("Error fetching recipes", error);
    return <p>Error loading recipes.</p>
  }
  return (
    <div className="container mx-auto, px-4, py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes?.map(recipe => {
          return (
            <Card key={recipe.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  {recipe.title}
                </CardTitle>
                <CardDescription className="italic text-gray-600 text-center">
                  {recipe?.description || "No Description Available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="font-bold text-lg">Ingredients</h3>
                  <ul>
                    {recipe.recipe_ingredients.map(recipe_ingredient => (
                      <li key={recipe_ingredient.ingredient_id} className="flex justify-between">
                        <span>{recipe_ingredient.ingredients?.name || "Ingredient Missing"}</span>
                        <span>{recipe_ingredient.quantity} {recipe_ingredient.unit}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-lg">Steps</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-sm">
                    {recipe.recipe_steps.toSorted((a, b) => a.step_order - b.step_order).
                      map(recipe_step => (
                        <li key={recipe_step.id}>
                          {recipe_step.description}
                        </li>
                      ))}
                  </ol>
                </section>

                {recipe.notes && (
                  <section>
                    <h3 className="font-bold tex-lg">Notes</h3>
                    <p className="text-sm text-gray-700">{recipe.notes}</p>
                  </section>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
