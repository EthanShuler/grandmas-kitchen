import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';

export default async function Recipes() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase.from("recipes").select(
    '*, recipe_steps(*)'
  );
  return (
    <Card>
      <pre>{JSON.stringify(recipes, null, 2)}</pre>
      {recipes?.map(recipe => {
        return (
          <div key={recipe.id}>
            <p>{recipe.title}</p>
            {recipe.recipe_steps.map(recipe_step => (
              <p key={recipe_step.id}>{recipe_step.description}</p>
            ))}
          </div>
        )
      })}
    </Card>
  )
}
