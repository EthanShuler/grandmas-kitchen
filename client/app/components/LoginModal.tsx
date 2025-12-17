import { Modal, TextInput, PasswordInput, Button, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

interface LoginModalProps {
  opened: boolean;
  onClose: () => void;
  onLogin: (values: { email: string; password: string }) => Promise<void>;
  onSwitchToRegister: () => void;
  loading: boolean;
  error: string | null;
}

export function LoginModal({ 
  opened, 
  onClose, 
  onLogin, 
  onSwitchToRegister, 
  loading, 
  error 
}: LoginModalProps) {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    await onLogin(values);
    form.reset();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Log in" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && <Text c="red" size="sm">{error}</Text>}
          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
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
              onClick={onSwitchToRegister}
            >
              Sign up
            </Text>
          </Text>
        </Stack>
      </form>
    </Modal>
  );
}
