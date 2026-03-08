import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';

import {
  MantineProvider,
  createTheme,
  AppShell,
  Burger,
  Title,
  Group
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Navbar, LoginModal, RegisterModal } from '@/components';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import "./app.css";

const theme = createTheme({
  primaryColor: 'blue',
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
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MantineProvider>
  );
}

// AppContent lives inside AuthProvider so it can use useAuth() for login/register
function AppContent() {
  const { user, logout, login, register } = useAuth();
  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure(false);
  const [loginOpened, { open: openLogin, close: closeLogin }] = useDisclosure(false);
  const [registerOpened, { open: openRegister, close: closeRegister }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      closeLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await register(values.username, values.email, values.password);
      closeRegister();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    closeLogin();
    openRegister();
    setError(null);
  };

  const handleSwitchToLogin = () => {
    closeRegister();
    openLogin();
    setError(null);
  };

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        padding="md"
        navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !navbarOpened, desktop: false } }}
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={navbarOpened} onClick={toggleNavbar} hiddenFrom="sm" size="sm" />
            <Title size="h4">Grandma's Kitchen</Title>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <Navbar
            onLoginClick={openLogin}
            onRegisterClick={openRegister}
            onLogout={logout}
            onClose={toggleNavbar}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>

      <LoginModal
        opened={loginOpened}
        onClose={closeLogin}
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
        loading={loading}
        error={error}
      />

      <RegisterModal
        opened={registerOpened}
        onClose={closeRegister}
        onRegister={handleRegister}
        onSwitchToLogin={handleSwitchToLogin}
        loading={loading}
        error={error}
      />
    </>
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
