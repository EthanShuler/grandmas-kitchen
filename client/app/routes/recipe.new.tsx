import { Container, Title, Button, Text } from '@mantine/core';
import { useNavigate, Link } from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/recipe.new';
import { api } from '@/lib/api';
import type { CreateRecipeInput } from '@/types';
import { RecipeForm, useAuth } from '@/components';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add New Recipe - Grandma's Kitchen" },
    { name: "description", content: "Share a new family recipe" },
  ];
}

export default function NewRecipe() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handleSubmit = async (values: CreateRecipeInput) => {
    setIsLoading(true);
    try {
      const recipe = await api.createRecipe(values) as { id: number };
      navigate(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please make sure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container size="md" py="md">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container size="md" py="md">
        <Title order={1} mb="md">Authentication Required</Title>
        <Text mb="lg">You must be logged in to add a new recipe.</Text>
        <Button component={Link} to="/">
          ← Back to recipes
        </Button>
      </Container>
    );
  }

  return (
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
  );
}
