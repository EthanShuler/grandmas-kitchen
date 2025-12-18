import { Container, Title, Text, Card, SimpleGrid } from '@mantine/core';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/favorites';
import { api } from '@/lib/api';
import type { Recipe } from '@/types';
import { RecipeCard, useAuth } from '@/components';

export async function clientLoader(): Promise<{ recipes: Recipe[] }> {
  try {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    if (!token) {
      return { recipes: [] };
    }
    const recipes = await api.getFavorites();
    console.log('Favorites loaded:', recipes);
    return { recipes: Array.isArray(recipes) ? recipes : [] };
  } catch (error) {
    console.error('Error loading favorites:', error);
    return { recipes: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Favorites - Grandma's Kitchen" },
    { name: "description", content: "Your favorite family recipes" },
  ];
}

export default function Favorites() {
  const { recipes } = useLoaderData<typeof clientLoader>();
  const { isAuthenticated, isLoading } = useAuth();

  console.log('Favorites component - recipes:', recipes, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container size="xl" py="md">
        <Title order={2} mb="md">My Favorites</Title>
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            Please log in to view your favorite recipes.
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="xs">My Favorites</Title>
      <Text c="dimmed" mb="xl">Recipes you've saved</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            linkTo={`/recipes/${recipe.id}`} 
          />
        ))}
      </SimpleGrid>

      {recipes.length === 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            You haven't favorited any recipes yet. Start exploring and save your favorites!
          </Text>
        </Card>
      )}
    </Container>
  );
}
