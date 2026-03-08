import { Container, Title, Text, Card, SimpleGrid, Group, Button, Badge, CloseButton, MultiSelect } from '@mantine/core';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Route } from './+types/home';
import { api } from '@/lib/api';
import type { Recipe, Tag } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { RecipeCard } from '@/components';

interface LoaderData {
  recipes: Recipe[];
  allTags: Tag[];
  search: string | null;
  selectedTags: string[];
  favoriteIds: number[];
}

export async function loader({ request }: Route.LoaderArgs): Promise<Omit<LoaderData, 'favoriteIds'>> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const tagParam = url.searchParams.get('tags');
  const selectedTags = tagParam ? tagParam.split(',') : [];

  try {
    const [recipes, allTags] = await Promise.all([
      api.getRecipes(search || undefined, selectedTags.length ? selectedTags : undefined),
      api.getTags(),
    ]);

    return {
      recipes: Array.isArray(recipes) ? recipes : [],
      allTags: Array.isArray(allTags) ? allTags : [],
      search,
      selectedTags,
    };
  } catch (error) {
    console.error('Error loading home page data:', error);
    return { recipes: [], allTags: [], search, selectedTags };
  }
}

// Runs on the client after the server loader to fetch the user's favorite IDs
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs): Promise<LoaderData> {
  const [serverData, favoriteIds] = await Promise.all([
    serverLoader(),
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return [];
      try {
        const result = await api.getFavoriteIds();
        return result.ids;
      } catch {
        return [];
      }
    })(),
  ]);
  return { ...serverData, favoriteIds };
}
clientLoader.hydrate = true;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grandma's Kitchen - Family Recipes" },
    { name: "description", content: "Browse our collection of family recipes" },
  ];
}

export default function Home() {
  const { recipes, allTags, search, selectedTags, favoriteIds = [] } = useLoaderData<typeof clientLoader>();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleTagChange = (tags: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (tags.length > 0) {
      newParams.set('tags', tags.join(','));
    } else {
      newParams.delete('tags');
    }
    setSearchParams(newParams);
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} mb="xs">Family Recipes</Title>
          <Text c="dimmed">Roggensacks and Brostroms</Text>
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

      <MultiSelect
        label="Filter by tags"
        placeholder="Select tags to filter"
        data={allTags.map(tag => ({ value: tag.name, label: tag.name }))}
        value={selectedTags}
        onChange={handleTagChange}
        mb="lg"
        clearable
        searchable
      />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            linkTo={`/recipes/${recipe.id}`}
            isFavorited={favoriteIds.includes(recipe.id)}
          />
        ))}
      </SimpleGrid>

      {recipes.length === 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            {selectedTags.length > 0
              ? 'No recipes found with the selected tags.'
              : search
              ? `No recipes found matching "${search}". Try a different search term.`
              : 'No recipes yet. Be the first to add one!'}
          </Text>
        </Card>
      )}
    </Container>
  );
}
