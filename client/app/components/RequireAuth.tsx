import type { ReactNode } from 'react';
import { Container, Text, Title, Button, Card } from '@mantine/core';
import { Link } from 'react-router';
import { useAuth } from '@/lib/auth-context';

interface RequireAuthProps {
  children: ReactNode;
  /** Custom message shown when the user is not authenticated */
  message?: string;
}

export function RequireAuth({ children, message = 'You must be logged in to view this page.' }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Title order={2} mb="sm">Authentication Required</Title>
          <Text c="dimmed" mb="lg">{message}</Text>
          <Button component={Link} to="/" variant="light">
            ← Back to recipes
          </Button>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
}
