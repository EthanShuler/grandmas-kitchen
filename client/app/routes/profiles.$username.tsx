import { Container, Title, Text, Card, SimpleGrid, Avatar, Group, Stack, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/profiles.$username';
import { RecipeCard, useAuth } from '@/components';
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
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleDeleteUser = async () => {
    if (!user || !currentUser?.is_admin) return;
    
    if (confirm(`Are you sure you want to delete user "${user.username}"? This will also delete all their recipes. This action cannot be undone.`)) {
      try {
        await api.deleteUser(user.id);
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully.',
          color: 'green',
        });
        navigate('/');
      } catch (error) {
        console.error('Error deleting user:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete user.',
          color: 'red',
        });
      }
    }
  };

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
        <Group justify="space-between" align="flex-start">
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
          {currentUser?.is_admin && currentUser.id !== user.id && (
            <Button
              color="red"
              variant="outline"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          )}
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