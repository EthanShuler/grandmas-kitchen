import { Container, Title, Text, Card, SimpleGrid, Avatar, Group, Stack } from '@mantine/core';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/profiles.$username';
import { RecipeCard } from '@/components';
import { api } from '@/lib/api';
import type { Recipe, User } from '@/types';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const user = await api.getUserByUsername(params.username) as User;
    const userRecipes = await api.getUserRecipes(user.id) as Recipe[];
    return { user, userRecipes };
  } catch (error) {
    return { user: null, userRecipes: [] };
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.user ? `${data.user.username} - Grandma's Kitchen` : "User Not Found - Grandma's Kitchen" },
    { name: "description", content: "View this user's profile and recipes" },
  ];
}

export default function UserProfile() {
  const { user, userRecipes } = useLoaderData<typeof loader>();

  if (!user) {
    return (
      <Container size="xl" py="md">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            User not found.
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
            <Text c="dimmed">{user.email}</Text>
            <Text size="sm" c="dimmed">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Title order={3} mb="md">{user.username}'s Recipes ({userRecipes.length})</Title>

      {userRecipes.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {userRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              linkTo={`/recipes/${recipe.id}`} 
            />
          ))}
        </SimpleGrid>
      ) : (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            This user hasn't created any recipes yet.
          </Text>
        </Card>
      )}
    </Container>
  );
}