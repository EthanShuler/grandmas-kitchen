import { Container, Title, Text, Card, SimpleGrid, Group, Button, Badge, CloseButton } from '@mantine/core';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Route } from './+types/home';
import { api } from '@/lib/api';
import type { Recipe } from '@/types';
import { RecipeCard, useAuth } from '@/components';

export async function loader({ request }: Route.LoaderArgs): Promise<{ recipes: Recipe[], search: string | null }> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const recipes = await api.getRecipes(search || undefined);
  return { recipes: Array.isArray(recipes) ? recipes : [], search };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grandma's Kitchen - Family Recipes" },
    { name: "description", content: "Browse our collection of family recipes" },
  ];
}

export default function Home() {
  const { recipes, search } = useLoaderData<typeof loader>();
  const { isAuthenticated } = useAuth();
  const [, setSearchParams] = useSearchParams();

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} mb="xs">Family Recipes</Title>
          <Text c="dimmed">Passed down through generations</Text>
        </div>
        {isAuthenticated && (
          <Button component={Link} to="/recipes/new" size="md">
            Add New Recipe
          </Button>
        )}
      </Group>

      {search && (
        <Group mb="lg">
          <Text size="sm">Searching for:</Text>
          <Badge 
            size="lg" 
            variant="light" 
            rightSection={<CloseButton size="xs" onClick={clearSearch} />}
          >
            {search}
          </Badge>
          <Text size="sm" c="dimmed">({recipes.length} result{recipes.length !== 1 ? 's' : ''})</Text>
        </Group>
      )}

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
            {search 
              ? `No recipes found matching "${search}". Try a different search term.`
              : 'No recipes yet. Be the first to add one!'
            }
          </Text>
        </Card>
      )}
    </Container>
  );
}
