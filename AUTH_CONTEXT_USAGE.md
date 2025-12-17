# Authentication Context Usage

The auth context provides a centralized way to access authentication state throughout the application.

## Accessing Auth State

Import and use the `useAuth` hook in any component:

```tsx
import { useAuth } from '@/components';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Auth Context Properties

- **`user`**: The current user object (`User | null`)
  - `id`: number
  - `username`: string
  - `email`: string
  - `avatar_url`: string | null
  - `is_admin`: boolean
  - `created_at`: string

- **`isAuthenticated`**: Boolean indicating if user is logged in

- **`isLoading`**: Boolean indicating if auth state is being loaded (useful for initial page load)

- **`setUser(user)`**: Function to manually update the user (rarely needed)

- **`logout()`**: Function to log out the current user

## Examples

### Conditional Rendering Based on Auth

```tsx
import { useAuth } from '@/components';
import { Button } from '@mantine/core';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <Button component={Link} to="/recipes/new">
          Add New Recipe
        </Button>
      )}
    </div>
  );
}
```

### Protected Route

```tsx
import { useAuth } from '@/components';
import { Navigate } from 'react-router';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <div>Protected content</div>;
}
```

### Display User Info

```tsx
import { useAuth } from '@/components';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>{user?.username}</h1>
      <p>{user?.email}</p>
      {user?.is_admin && <p>Admin User</p>}
    </div>
  );
}
```

## Implementation Details

The auth context is set up in `root.tsx` and wraps the entire application, so any component can access it without prop drilling.

The context automatically:
- Loads user data from localStorage token on app start
- Provides loading state during initial load
- Handles logout by clearing localStorage and user state
- Refreshes user data after login/register

The login/register flows reload the page after successful authentication to trigger the auth context to load the new user data.
