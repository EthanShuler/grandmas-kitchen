import { Container, Title, Text, Card, SimpleGrid, Group, Button, Badge, CloseButton, MultiSelect } from '@mantine/core';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import type { Route } from './+types/home';
import { api } from '@/lib/api';
import type { Recipe, Tag } from '@/types';
import { RecipeCard, useAuth } from '@/components';

interface LoaderData {
  recipes: Recipe[];
  allTags: Tag[];
  search: string | null;
  selectedTags: string[];
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const tagParam = url.searchParams.get('tags');
  const selectedTags = tagParam ? tagParam.split(',') : [];
  
  try {
    const [recipes, allTags] = await Promise.all([
      api.getRecipes(search || undefined),
      api.getTags()
    ]);
    
    return { 
      recipes: Array.isArray(recipes) ? recipes : [], 
      allTags: Array.isArray(allTags) ? allTags : [],
      search,
      selectedTags
    };
  } catch (error) {
    console.error('Error loading home page data:', error);
    // Return empty data if API fails
    return {
      recipes: [],
      allTags: [],
      search,
      selectedTags
    };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grandma's Kitchen - Family Recipes" },
    { name: "description", content: "Browse our collection of family recipes" },
  ];
}

export default function Home() {
  const { recipes, allTags, search, selectedTags } = useLoaderData<typeof loader>();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const clearSearch = () => {
    setSearchParams({});
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

  // Filter recipes by selected tags
  const filteredRecipes = selectedTags.length > 0
    ? recipes.filter(recipe => 
        recipe.tags && recipe.tags.some(tag => selectedTags.includes(tag.name))
      )
    : recipes;

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
          <Text size="sm" c="dimmed">({filteredRecipes.length} result{filteredRecipes.length !== 1 ? 's' : ''})</Text>
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
        {filteredRecipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            linkTo={`/recipes/${recipe.id}`} 
          />
        ))}
      </SimpleGrid>

      {filteredRecipes.length === 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            {selectedTags.length > 0
              ? `No recipes found with the selected tags.`
              : search 
              ? `No recipes found matching "${search}". Try a different search term.`
              : 'No recipes yet. Be the first to add one!'
            }
          </Text>
        </Card>
      )}
    </Container>
  );
}
