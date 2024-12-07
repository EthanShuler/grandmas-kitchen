import { Database } from '@/database.types';
import React from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Ingredients } from '@/components/Recipe/ingredients';
import { Steps } from '@/components/Recipe/steps';

type RecipeWithRelations = Database["public"]["Tables"]["recipes"]["Row"] & {
  recipe_steps: Database["public"]["Tables"]["recipe_steps"]["Row"][] | null;
  recipe_tags: { tags: Database["public"]["Tables"]["tags"]["Row"] | null }[] | null;
  recipe_ingredients: (Database["public"]["Tables"]["recipe_ingredients"]["Row"] & {
    ingredients: Database["public"]["Tables"]["ingredients"]["Row"] | null;
  })[];
};

type YourRecipeComponentProps = {
  recipe: RecipeWithRelations;
};

export const RecipeCard: React.FC<YourRecipeComponentProps> = ({ recipe }) => {
  return (
    <Link key={recipe.id} href={`/recipe/${recipe.id}`} passHref>
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
}
