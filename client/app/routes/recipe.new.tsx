import { Container, Title, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, Link } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/recipe.new';
import { api } from '@/lib/api';
import type { CreateRecipeInput } from '@/types';
import { RecipeForm, RequireAuth } from '@/components';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add New Recipe - Grandma's Kitchen" },
    { name: "description", content: "Share a new family recipe" },
  ];
}

export default function NewRecipe() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: CreateRecipeInput) => {
    setIsLoading(true);
    try {
      const recipe = await api.createRecipe(values);
      navigate(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create recipe. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireAuth message="You must be logged in to add a new recipe.">
      <Container size="md" py="md">
        <Button component={Link} to="/" variant="subtle" mb="md">
          ← Back to recipes
        </Button>

        <Title order={1} mb="xl">Add New Recipe</Title>

        <RecipeForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          submitLabel="Create Recipe"
          isLoading={isLoading}
        />
      </Container>
    </RequireAuth>
  );
}
