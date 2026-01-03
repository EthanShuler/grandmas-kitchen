import { Container, Title, Text, Paper, Badge, Group, Stack, List, Divider, Button, Image, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link, useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/recipe.$id';
import { api } from '@/lib/api';
import { decimalToFraction } from '@/lib/fractions';
import type { Recipe } from '@/types';
import { useAuth, FavoriteButton } from '@/components';

export async function loader({ params }: Route.LoaderArgs): Promise<{ recipe: Recipe | null }> {
  const recipe = await api.getRecipe(Number(params.id)) as Recipe | null;
  return { recipe };
}

export function meta({ data }: Route.MetaArgs) {
  const recipe = data?.recipe as Recipe | undefined;
  return [
    { title: `${recipe?.title || 'Recipe'} - Grandma's Kitchen` },
    { name: "description", content: recipe?.description || 'View recipe details' },
  ];
}

export default function RecipeDetail() {
  const { user } = useAuth();
  const { recipe } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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

  return (
    <Container size="lg" py="xl">
      <Button component={Link} to="/" variant="subtle" mb="md">
        ← Back to recipes
      </Button>

      {recipe.image_url && (
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          radius="md"
          mb="xl"
          mah={400}
          fit="cover"
        />
      )}

      <Group justify="space-between" mb="md">
        {user && (user.username === recipe.author || user.is_admin) && (
          <Group>
            <Button
              component={Link}
              to={`/recipe/${recipe.id}/edit`}
              variant="outline"
            >
              Edit Recipe
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this recipe?')) {
                  try {
                    await api.deleteRecipe(recipe.id);
                    notifications.show({
                      title: 'Success',
                      message: 'Recipe deleted successfully.',
                      color: 'green',
                    });
                    // Delay navigation slightly to allow notification to show
                    setTimeout(() => {
                      navigate('/');
                    }, 500);
                  } catch (error) {
                    console.error('Error deleting recipe:', error);
                    notifications.show({
                      title: 'Error',
                      message: 'Failed to delete recipe.',
                      color: 'red',
                    });
                  }
                }
              }}
            >
              Delete Recipe
            </Button>
          </Group>
        )}
        <FavoriteButton recipeId={recipe.id} size="lg" variant="light" />
      </Group>

      <Title order={1} mb="sm">{recipe.title}</Title>

      {recipe.description && (
        <Text size="lg" c="dimmed" mb="md">
          {recipe.description}
        </Text>
      )}

      <Group gap="xs" mb="xl">
        {recipe.prep_time && (
          <Badge size="lg" variant="light">
            Prep: {recipe.prep_time} min
          </Badge>
        )}
        {recipe.cook_time && (
          <Badge size="lg" variant="light">
            Cook: {recipe.cook_time} min
          </Badge>
        )}
        {recipe.servings && (
          <Badge size="lg" variant="light">
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

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <Paper shadow="xs" p="md" withBorder>
              <Title order={2} size="h3" mb="md">Ingredients</Title>
              <List spacing="sm">
                {recipe.ingredients?.map((ingredient) => (
                  <List.Item key={ingredient.id}>
                    {ingredient.amount && ingredient.unit ? (
                      <Text>
                        <strong>{decimalToFraction(ingredient.amount)} {ingredient.unit}</strong> {ingredient.name}
                      </Text>
                    ) : ingredient.amount ? (
                      <Text>
                        <strong>{decimalToFraction(ingredient.amount)}</strong> {ingredient.name}
                      </Text>
                    ) : (
                      <Text>{ingredient.name}</Text>
                    )}
                  </List.Item>
                ))}
              </List>
            </Paper>

            {recipe.notes && (
              <Paper shadow="xs" p="md" withBorder bg="orange.0">
                <Title order={3} size="h4" mb="sm">Notes</Title>
                <div 
                  dangerouslySetInnerHTML={{ __html: recipe.notes }}
                  style={{ lineHeight: '1.6' }}
                  className="tiptap-content"
                />
              </Paper>
            )}

            {recipe.instructions && (
              <Paper shadow="xs" p="md" withBorder>
                <Title order={3} size="h4" mb="sm">Instructions</Title>
                <div 
                  dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                  style={{ lineHeight: '1.6' }}
                  className="tiptap-content"
                />
              </Paper>
            )}

            {recipe.markdown_content && (
              <Paper shadow="xs" p="md" withBorder>
                <Title order={3} size="h4" mb="sm">Recipe Story</Title>
                <div 
                  dangerouslySetInnerHTML={{ __html: recipe.markdown_content }}
                  style={{ 
                    lineHeight: '1.6',
                  }}
                  className="tiptap-content"
                />
              </Paper>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xl">
            <Paper shadow="xs" p="md" withBorder>
              <Title order={2} size="h3" mb="md">Steps</Title>
              <List spacing="md" type="ordered">
                {recipe.steps?.map((step) => (
                  <List.Item key={step.id}>
                    <Text>{step.instruction}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>

          </Stack>
        </Grid.Col>
      </Grid>

      {recipe.author && (
        <>
          <Divider my="xl" />
          <Text size="sm" c="dimmed">
            Recipe by <Text 
              component={Link} 
              to={`/profiles/${recipe.author}`}
              span
              c="blue"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              {recipe.author}
            </Text>
          </Text>
        </>
      )}

      {recipe.source && (
        <Text size="sm" c="dimmed" mt="xs">
          Origin: {recipe.source}
        </Text>
      )}
    </Container>
  );
}
