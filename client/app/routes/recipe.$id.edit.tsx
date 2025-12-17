import { Container, Title, Text, Button } from '@mantine/core';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/recipe.$id.edit';
import { api } from '@/lib/api';
import type { Recipe, CreateRecipeInput } from '@/types';
import { RecipeForm, recipeToFormValues, useAuth } from '@/components';

export async function loader({ params }: Route.LoaderArgs): Promise<{ recipe: Recipe | null }> {
  const recipe = await api.getRecipe(Number(params.id)) as Recipe | null;
  return { recipe };
}

export function meta({ data }: Route.MetaArgs) {
  const recipe = data?.recipe as Recipe | undefined;
  return [
    { title: `Edit ${recipe?.title || 'Recipe'} - Grandma's Kitchen` },
    { name: "description", content: `Edit ${recipe?.title || 'recipe'}` },
  ];
}

export default function RecipeEdit() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { recipe } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <Container size="md" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container size="md" py="xl">
        <Title order={1}>Recipe not found</Title>
        <Button component={Link} to="/" variant="subtle" mt="md">
          ← Back to recipes
        </Button>
      </Container>
    );
  }

  if (!isAuthenticated || (user && user.username !== recipe.author)) {
    return (
      <Container size="md" py="xl">
        <Title order={1}>You cannot edit this recipe</Title>
        <Text c="dimmed" mt="sm">You must be logged in as the recipe author to edit it.</Text>
        <Button component={Link} to={`/recipes/${recipe.id}`} variant="subtle" mt="md">
          ← Back to recipe
        </Button>
      </Container>
    );
  }

  const handleSubmit = async (values: CreateRecipeInput) => {
    setIsLoading(true);
    try {
      await api.updateRecipe(recipe.id, values);
      navigate(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Button component={Link} to={`/recipes/${recipe.id}`} variant="subtle" mb="md">
        ← Back to recipe
      </Button>

      <Title order={1} mb="xl">Edit Recipe</Title>

      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/recipes/${recipe.id}`)}
        submitLabel="Save Changes"
        isLoading={isLoading}
        initialValues={recipeToFormValues(recipe)}
      />
    </Container>
  );
}
