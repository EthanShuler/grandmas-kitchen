import { createClient } from '@/utils/supabase/server';

export default async function Recipes() {
  const supabase = await createClient();
  const { data: recipes } = await supabase.from("recipe").select();

  return <pre>{JSON.stringify(recipes, null, 2)}</pre>
}
