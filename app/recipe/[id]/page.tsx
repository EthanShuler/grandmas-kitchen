import { createClient } from "@/utils/supabase/server"
import { notFound } from 'next/navigation';
import { Clock, Bookmark, ChefHat, BookOpen, Tag } from 'lucide-react';

export default async function Recipe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient();
  const id = (await params).id
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      `id, title, description, notes,
    recipe_steps(*),
    recipe_tags(tags(name)),
    recipe_ingredients(*, ingredients(*))`
    )
    .eq("id", id)
    .single();
  if (error || !recipe) {
    console.log("error", error)
    return notFound();
  }
  return (
    <div className="max-w-4xl mx-auto bg-card shadow-lg rounded-lg overflow-hidden">
      {/* Recipe Header */}
      <div className="bg-primary/10 p-8 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">{recipe.title}</h1>
        <p className="italic text-foreground/80 text-lg">
          {recipe?.description || "No Description Available"}
        </p>
        {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center mr-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            {recipe.recipe_tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-secondary/30 text-secondary-foreground text-sm rounded-full border">
                {tag?.tags?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Ingredients Section */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-4">
              <ChefHat className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">Ingredients</h2>
            </div>
            <div className="space-y-2">
              <section>
                <h3 className="font-bold text-lg">Ingredients</h3>
                <ul>
                  {recipe.recipe_ingredients.map(ingredient => (
                    <li key={ingredient.ingredient_id} className="flex justify-between">
                      <span>{ingredient.ingredients?.name || "Ingredient Missing"}</span>
                      <span>{ingredient.quantity} {ingredient.unit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">Instructions</h2>
            </div>
            <div className="space-y-4">
              <section>
                <h3 className="font-bold text-lg">Steps</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  {recipe.recipe_steps?.toSorted((a, b) => a.step_order - b.step_order).
                    map(step => (
                      <li key={step.id}>
                        {step.description}
                      </li>
                    ))}
                </ol>
              </section>
            </div>
          </div>

          {/* Notes Section */}
          {recipe.notes && (
            <div className="mt-6 bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <Bookmark className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-foreground">Notes</h3>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">{recipe.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted/50 p-4 text-center border-t">
        <p className="text-muted-foreground text-sm">
          Enjoy your delicious meal!
        </p>
      </div>
      
    </div>
  );
}
