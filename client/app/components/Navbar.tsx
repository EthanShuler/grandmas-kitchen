import { Stack, Button, Avatar, Text, TextInput, NavLink, Divider, Group, Box, Badge } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import { IconSearch, IconLogout, IconUser, IconHome, IconPlus, IconHeart, IconInfoCircle, IconShield } from '@tabler/icons-react';
import { useAuth } from '@/components';
import { useState } from 'react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
  onClose?: () => void;
}

export function Navbar({ onLoginClick, onRegisterClick, onLogout, onClose }: NavbarProps) {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
      onClose?.();
    }
  };

  return (
    <Stack h="100%" justify="space-between">
      <Stack gap="xs">
        <form onSubmit={handleSearch}>
          <TextInput
            placeholder="Search recipes..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb="md"
          />
        </form>

        <NavLink
          component={Link}
          to="/"
          label="Home"
          leftSection={<IconHome size={18} />}
          onClick={onClose}
        />
        
        {isAuthenticated && (
          <>
            <NavLink
              component={Link}
              to="/favorites"
              label="Favorites"
              leftSection={<IconHeart size={18} />}
              onClick={onClose}
            />
            <NavLink
              component={Link}
              to="/recipes/new"
              label="Add Recipe"
              leftSection={<IconPlus size={18} />}
              onClick={onClose}
            />
            {user?.is_admin && (
              <NavLink
                component={Link}
                to="/admin"
                label="Admin Panel"
                leftSection={<IconShield size={18} />}
                onClick={onClose}
              />
            )}
          </>
        )}
      </Stack>

      <Box>
        <NavLink
          component={Link}
          to="/about"
          label="About"
          leftSection={<IconInfoCircle size={18} />}
          onClick={onClose}
          mb="md"
        />
        <Divider mb="md" />
        {user ? (
          <Stack gap="xs">
            <Group gap="sm" px="sm" py="xs">
              <Avatar 
                src={user.avatar_url} 
                radius="xl" 
                size="sm"
                color="blue"
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>{user.username}</Text>
                {user.is_admin && (
                  <Badge size="xs" variant="light" color="red">Admin</Badge>
                )}
              </div>
            </Group>
            <NavLink
              component={Link}
              to="/profile"
              label="Profile"
              leftSection={<IconUser size={18} />}
              onClick={onClose}
            />
            <NavLink
              label="Logout"
              leftSection={<IconLogout size={18} />}
              color="red"
              onClick={() => {
                onLogout();
                onClose?.();
              }}
            />
          </Stack>
        ) : (
          <Stack gap="xs">
            <Button variant="light" fullWidth onClick={() => { onLoginClick(); onClose?.(); }}>
              Log in
            </Button>
            <Button fullWidth onClick={() => { onRegisterClick(); onClose?.(); }}>
              Sign up
            </Button>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
