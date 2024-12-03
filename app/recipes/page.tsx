import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Ingredients } from '@/components/Recipe/ingredients';
import { Steps } from '@/components/Recipe/steps';

export default async function Recipes() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `id, title, description, notes,
    recipe_steps(*),
    recipe_tags(tags(name)),
    recipe_ingredients(*, ingredients(*))`
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
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} passHref>
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full min-h-[400px]">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-center">
                    {recipe.title}
                  </CardTitle>
                  <CardDescription className="italic text-gray-600 text-center">
                    {recipe?.description || "No Description Available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <Ingredients ingredients={recipe.recipe_ingredients} />
                  <Steps steps={recipe.recipe_steps} />
                  {recipe.notes && (
                    <section>
                      <h3 className="font-bold tex-lg">Notes</h3>
                      <p className="text-sm text-gray-700">{recipe.notes}</p>
                    </section>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
