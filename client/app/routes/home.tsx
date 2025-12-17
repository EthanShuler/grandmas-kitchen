import { Container, Title, Text, Card, SimpleGrid, Badge, Group, Button } from '@mantine/core';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/home';
import { api } from '../lib/api';
import type { Recipe } from '../types';

export async function loader(): Promise<{ recipes: Recipe[] }> {
  const recipes = await api.getRecipes();
  return { recipes: Array.isArray(recipes) ? recipes : [] };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grandma's Kitchen - Family Recipes" },
    { name: "description", content: "Browse our collection of family recipes" },
  ];
}

export default function Home() {
  const { recipes } = useLoaderData<typeof loader>();

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} mb="xs">Family Recipes</Title>
          <Text c="dimmed">Passed down through generations</Text>
        </div>
        <Button component={Link} to="/recipes/new" size="md">
          Add New Recipe
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            component={Link}
            to={`/recipes/${recipe.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="lg">{recipe.title}</Text>
            </Group>

            {recipe.description && (
              <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                {recipe.description}
              </Text>
            )}

            <Group gap="xs" mb="xs">
              {recipe.prep_time && (
                <Badge color="blue" variant="light">
                  Prep: {recipe.prep_time} min
                </Badge>
              )}
              {recipe.cook_time && (
                <Badge color="orange" variant="light">
                  Cook: {recipe.cook_time} min
                </Badge>
              )}
              {recipe.servings && (
                <Badge color="green" variant="light">
                  Serves {recipe.servings}
                </Badge>
              )}
            </Group>

            {recipe.author && (
              <Text size="xs" c="dimmed" mt="sm">
                By {recipe.author}
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>

      {recipes.length === 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            No recipes yet. Be the first to add one!
          </Text>
        </Card>
      )}
    </Container>
  );
}
