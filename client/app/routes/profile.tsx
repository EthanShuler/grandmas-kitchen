import { Container, Title, Text, Card, SimpleGrid, Avatar, Group, Stack } from '@mantine/core';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/profile';
import { RecipeCard } from '@/components';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Recipe } from '@/types';

function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.userId === 'number' ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function clientLoader(): Promise<{ recipes: Recipe[] }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { recipes: [] };
    const userId = getUserIdFromToken(token);
    if (!userId) return { recipes: [] };
    const recipes = await api.getUserRecipes(userId);
    return { recipes: Array.isArray(recipes) ? recipes : [] };
  } catch {
    return { recipes: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile - Grandma's Kitchen" },
    { name: "description", content: "View your profile and recipes" },
  ];
}

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { recipes } = useLoaderData<typeof clientLoader>();

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container size="xl" py="md">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            Please log in to view your profile.
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Card shadow="sm" padding="xl" radius="md" withBorder mb="xl">
        <Group>
          <Avatar
            src={user.avatar_url}
            size="xl"
            radius="xl"
            color="blue"
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap="xs">
            <Title order={2}>{user.username}</Title>
            {user.email && <Text c="dimmed">{user.email}</Text>}
            <Text size="sm" c="dimmed">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Title order={3} mb="md">My Recipes ({recipes.length})</Title>

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
            You haven't created any recipes yet. Start sharing your family recipes!
          </Text>
        </Card>
      )}
    </Container>
  );
}
