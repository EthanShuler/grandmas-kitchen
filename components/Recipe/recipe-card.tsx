import { Database } from '@/database.types';
import React from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChefHat, BookOpen, Tag } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  const ingredientsPreview = recipe.recipe_ingredients?.slice(0, 4) || [];
  const stepsPreview = recipe.recipe_steps?.slice(0, 2) || [];
  return (
    <Link key={recipe.id} href={`/recipe/${recipe.id}`} passHref className='block h-full'>
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full border-primary/10 hover:border-primary/30">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-xl font-semibold text-primary">
            {recipe.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-foreground/80">
            {recipe?.description || "No Description Available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 pt-4">
          
          {/* Ingredients Preview */}
          {ingredientsPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Ingredients</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {ingredientsPreview.map((item, i) => (
                  <li key={i} className="line-clamp-1">
                    • {item.quantity} {item.unit} {item.ingredients?.name}
                  </li>
                ))}
                {recipe.recipe_ingredients.length > 4 && (
                  <li className="text-xs text-primary italic">
                    +{recipe.recipe_ingredients.length - 4} more ingredients
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Steps Preview */}
          {stepsPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Steps</h3>
              </div>
              <ul className="text-sm text-muted-foreground">
                {stepsPreview.map((step, i) => (
                  <li key={i} className="line-clamp-1 mb-1">
                    {i + 1}. {step.description}
                  </li>
                ))}
                {(recipe.recipe_steps?.length || 0) > 2 && (
                  <li className="text-xs text-primary italic">
                    +{(recipe.recipe_steps?.length || 0) - 2} more steps
                  </li>
                )}
              </ul>
            </div>
          )}

        </CardContent>

        {/* Tags Footer */}
        <CardFooter className={cn(
          "flex flex-wrap gap-2 pt-2 border-t",
          recipe.recipe_tags && recipe.recipe_tags.length > 0 ? "mt-auto" : "hidden"
        )}>
          {recipe.recipe_tags?.map((tag) => (
            <Badge key={tag.tags?.id} variant="outline" className="bg-secondary/20">
              {tag.tags?.name}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  )
}
