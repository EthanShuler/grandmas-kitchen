import { Group, Button, Menu, Avatar, Text, UnstyledButton, Title } from '@mantine/core';
import { Link } from 'react-router';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import { useAuth } from '@/components';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export function Navbar({ onLoginClick, onRegisterClick, onLogout }: NavbarProps) {
  const { user } = useAuth();

  return (
    <Group h="100%" px="md" justify="space-between">
      <UnstyledButton component={Link} to="/">
        <Title order={3}>Grandma's Kitchen</Title>
      </UnstyledButton>

      <Group>
        {user ? (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar 
                    src={user.avatar_url} 
                    radius="xl" 
                    size="sm"
                    color="orange"
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500}>{user.username}</Text>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<IconLogout size={14} />} 
                color="red"
                onClick={onLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group gap="xs">
            <Button variant="subtle" onClick={onLoginClick}>Log in</Button>
            <Button onClick={onRegisterClick}>Sign up</Button>
          </Group>
        )}
      </Group>
    </Group>
  );
}
