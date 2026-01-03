import { Container, Title, Tabs, Table, Text, Group, Avatar, Badge, Button, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, Link } from 'react-router';
import { IconUsers, IconTrash } from '@tabler/icons-react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { useAuth } from '@/components';
import { useState, useEffect } from 'react';

export function meta() {
  return [
    { title: "Admin Panel - Grandma's Kitchen" },
    { name: "description", content: "Admin panel for managing users and content" },
  ];
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }

    async function fetchUsers() {
      try {
        const data = await api.getAllUsers() as User[];
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load users',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [user, navigate]);

  const handleDeleteUser = async (userToDelete: User) => {
    if (!user || userToDelete.id === user.id) {
      notifications.show({
        title: 'Error',
        message: 'You cannot delete your own account.',
        color: 'red',
      });
      return;
    }

    if (confirm(`Are you sure you want to delete user "${userToDelete.username}"? This will also delete all their recipes. This action cannot be undone.`)) {
      try {
        await api.deleteUser(userToDelete.id);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully.',
          color: 'green',
        });
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

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Admin Panel</Title>

      <Tabs defaultValue="users">
        <Tabs.List>
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            Users
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="xl">
          <Title order={2} size="h3" mb="md">All Users ({users.length})</Title>
          
          {users.length > 0 ? (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Joined</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((userItem) => (
                  <Table.Tr key={userItem.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar 
                          src={userItem.avatar_url} 
                          size="sm" 
                          radius="xl"
                          color="blue"
                        >
                          {userItem.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text
                          component={Link}
                          to={`/profiles/${userItem.username}`}
                          fw={500}
                          style={{ textDecoration: 'none' }}
                        >
                          {userItem.username}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{userItem.email}</Table.Td>
                    <Table.Td>
                      {userItem.is_admin ? (
                        <Badge color="red" variant="light">Admin</Badge>
                      ) : (
                        <Badge color="gray" variant="light">User</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(userItem.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          component={Link}
                          to={`/profiles/${userItem.username}`}
                          size="xs"
                          variant="light"
                        >
                          View Profile
                        </Button>
                        {userItem.id !== user?.id && (
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleDeleteUser(userItem)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">No users found.</Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
