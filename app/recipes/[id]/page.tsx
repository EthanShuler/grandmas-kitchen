import { Ingredients } from '@/components/Recipe/ingredients';
import { Steps } from '@/components/Recipe/steps';
import { createClient } from "@/utils/supabase/server"

export default async function Recipe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient();
  const id = (await params).id
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `id, title, description, notes,
    recipe_steps(*),
    recipe_tags(tags(name)),
    recipe_ingredients(*, ingredients(*))`
    )
    .eq("id", id);
  if (error || !recipes) {
    console.log("error", error)
    return <div>Error</div>
  }
  const recipe = recipes[0];
  return (
    <div className="container mx-auto, px-4, py-8">
      <h1 className="font-bold text-xl py-4">{recipe.title}</h1>
      <p className="italic text-gray-600 text-center">
        {recipe?.description || "No Description Available"}
      </p>
      <div className="py-4">
        <Ingredients ingredients={recipe.recipe_ingredients} />
      </div>
      <div className="py-4">
        <Steps steps={recipe.recipe_steps} />
      </div>
      {recipe.notes && (
        <section>
          <h3 className="font-bold tex-lg">Notes</h3>
          <p className="text-sm text-gray-700">{recipe.notes}</p>
        </section>
      )}
    </div>
  );
}
