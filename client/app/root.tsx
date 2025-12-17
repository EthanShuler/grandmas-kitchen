import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";

import type { Route } from "./+types/root";
import '@mantine/core/styles.css';

import { 
  MantineProvider, 
  createTheme, 
  AppShell, 
  Group, 
  Button, 
  Title,
  Menu,
  Avatar,
  Text,
  UnstyledButton,
  Modal,
  TextInput,
  PasswordInput,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from './lib/api';
import type { User } from './types';
import "./app.css";

const theme = createTheme({
  primaryColor: 'orange',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [registerOpened, { open: openRegister, close: closeRegister }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const registerForm = useForm({
    initialValues: { username: '', email: '', password: '' },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getCurrentUser()
        .then((userData) => setUser(userData as User))
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(values.email, values.password) as { token: string; user: User };
      localStorage.setItem('token', response.token);
      setUser(response.user);
      closeLogin();
      loginForm.reset();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.register(values.username, values.email, values.password) as { token: string; user: User };
      localStorage.setItem('token', response.token);
      setUser(response.user);
      closeRegister();
      registerForm.reset();
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <UnstyledButton component={Link} to="/">
              <Title order={3} c="orange">🍳 Grandma's Kitchen</Title>
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
                      onClick={handleLogout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Group gap="xs">
                  <Button variant="subtle" onClick={openLogin}>Log in</Button>
                  <Button onClick={openRegister}>Sign up</Button>
                </Group>
              )}
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>

      {/* Login Modal */}
      <Modal opened={loginOpened} onClose={closeLogin} title="Log in" centered>
        <form onSubmit={loginForm.onSubmit(handleLogin)}>
          <Stack>
            {error && <Text c="red" size="sm">{error}</Text>}
            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...loginForm.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              {...loginForm.getInputProps('password')}
            />
            <Button type="submit" fullWidth loading={loading}>
              Log in
            </Button>
            <Text size="sm" ta="center">
              Don't have an account?{' '}
              <Text
                component="button"
                type="button"
                c="orange"
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => {
                  closeLogin();
                  openRegister();
                  setError(null);
                }}
              >
                Sign up
              </Text>
            </Text>
          </Stack>
        </form>
      </Modal>

      {/* Register Modal */}
      <Modal opened={registerOpened} onClose={closeRegister} title="Create an account" centered>
        <form onSubmit={registerForm.onSubmit(handleRegister)}>
          <Stack>
            {error && <Text c="red" size="sm">{error}</Text>}
            <TextInput
              label="Username"
              placeholder="Your username"
              {...registerForm.getInputProps('username')}
            />
            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...registerForm.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Choose a password"
              {...registerForm.getInputProps('password')}
            />
            <Button type="submit" fullWidth loading={loading}>
              Sign up
            </Button>
            <Text size="sm" ta="center">
              Already have an account?{' '}
              <Text
                component="button"
                type="button"
                c="orange"
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => {
                  closeRegister();
                  openLogin();
                  setError(null);
                }}
              >
                Log in
              </Text>
            </Text>
          </Stack>
        </form>
      </Modal>
    </MantineProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{ paddingTop: '4rem', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ width: '100%', padding: '1rem', overflowX: 'auto' }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
