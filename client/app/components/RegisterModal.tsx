import { Modal, TextInput, PasswordInput, Button, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

interface RegisterModalProps {
  opened: boolean;
  onClose: () => void;
  onRegister: (values: { username: string; email: string; password: string }) => Promise<void>;
  onSwitchToLogin: () => void;
  loading: boolean;
  error: string | null;
}

export function RegisterModal({ 
  opened, 
  onClose, 
  onRegister, 
  onSwitchToLogin, 
  loading, 
  error 
}: RegisterModalProps) {
  const form = useForm({
    initialValues: { username: '', email: '', password: '' },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: { username: string; email: string; password: string }) => {
    await onRegister(values);
    form.reset();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create an account" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && <Text c="red" size="sm">{error}</Text>}
          <TextInput
            label="Username"
            placeholder="Your username"
            {...form.getInputProps('username')}
          />
          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Choose a password"
            {...form.getInputProps('password')}
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
              onClick={onSwitchToLogin}
            >
              Log in
            </Text>
            </Text>
          </Stack>
        </form>
      </Modal>
  );
}
