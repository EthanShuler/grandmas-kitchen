import { createClient } from "@/utils/supabase/server";

import { RecipeCard } from '@/components/Recipe/recipe-card';

import Hero from "@/components/hero";

export default async function Index() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <Recipes />
      </main>
    </>
  );
}


async function Recipes() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `*,
    recipe_steps(*),
    recipe_tags(tags(*)),
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
            <RecipeCard key={recipe.id} recipe={recipe} />
          )
        })}
      </div>
    </div>
  )
}
