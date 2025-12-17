import { Container, Title, Text, Paper, Badge, Group, Stack, List, Divider, Button } from '@mantine/core';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/recipe.$id';
import { api } from '../lib/api';
import type { Recipe } from '../types';

export async function loader({ params }: Route.LoaderArgs) {
  const recipe = await api.getRecipe(Number(params.id));
  return { recipe };
}

export function meta({ data }: Route.MetaArgs) {
  const recipe = data?.recipe as Recipe;
  return [
    { title: `${recipe?.title || 'Recipe'} - Grandma's Kitchen` },
    { name: "description", content: recipe?.description || 'View recipe details' },
  ];
}

export default function RecipeDetail() {
  const { recipe } = useLoaderData<typeof loader>() as { recipe: Recipe };

  return (
    <Container size="md" py="xl">
      <Button component={Link} to="/" variant="subtle" mb="md">
        ← Back to recipes
      </Button>

      <Title order={1} mb="sm">{recipe.title}</Title>
      
      {recipe.description && (
        <Text size="lg" c="dimmed" mb="md">
          {recipe.description}
        </Text>
      )}

      <Group gap="xs" mb="xl">
        {recipe.prep_time && (
          <Badge size="lg" color="blue" variant="light">
            Prep: {recipe.prep_time} min
          </Badge>
        )}
        {recipe.cook_time && (
          <Badge size="lg" color="orange" variant="light">
            Cook: {recipe.cook_time} min
          </Badge>
        )}
        {recipe.servings && (
          <Badge size="lg" color="green" variant="light">
            Serves {recipe.servings}
          </Badge>
        )}
      </Group>

      {recipe.tags && recipe.tags.length > 0 && (
        <Group gap="xs" mb="xl">
          {recipe.tags.map((tag) => (
            <Badge key={tag.id} variant="outline" color="gray">
              {tag.name}
            </Badge>
          ))}
        </Group>
      )}

      <Stack gap="xl">
        <Paper shadow="xs" p="md" withBorder>
          <Title order={2} size="h3" mb="md">Ingredients</Title>
          <List spacing="sm">
            {recipe.ingredients?.map((ingredient) => (
              <List.Item key={ingredient.id}>
                {ingredient.amount && ingredient.unit ? (
                  <Text>
                    <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                  </Text>
                ) : (
                  <Text>{ingredient.name}</Text>
                )}
              </List.Item>
            ))}
          </List>
        </Paper>

        <Paper shadow="xs" p="md" withBorder>
          <Title order={2} size="h3" mb="md">Instructions</Title>
          <List spacing="md" type="ordered">
            {recipe.steps?.map((step) => (
              <List.Item key={step.id}>
                <Text>{step.instruction}</Text>
              </List.Item>
            ))}
          </List>
        </Paper>
      </Stack>

      {recipe.author && (
        <>
          <Divider my="xl" />
          <Text size="sm" c="dimmed">
            Recipe by {recipe.author}
          </Text>
        </>
      )}
    </Container>
  );
}
