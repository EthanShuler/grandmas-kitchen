import { Container, Title, TextInput, Textarea, NumberInput, Button, Paper, Stack, Group, ActionIcon, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router';
import type { Route } from './+types/recipe.new';
import { api } from '../lib/api';
import type { CreateRecipeInput } from '../types';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add New Recipe - Grandma's Kitchen" },
    { name: "description", content: "Share a new family recipe" },
  ];
}

export default function NewRecipe() {
  const navigate = useNavigate();

  const form = useForm<CreateRecipeInput>({
    initialValues: {
      title: '',
      description: '',
      prep_time: undefined,
      cook_time: undefined,
      servings: undefined,
      ingredients: [{ name: '', amount: undefined, unit: '' }],
      steps: [''],
      tags: [],
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Title is required' : null),
      ingredients: {
        name: (value) => (value.length < 1 ? 'Ingredient name is required' : null),
      },
      steps: (value) => (value.some(step => !step.trim()) ? 'All steps must have instructions' : null),
    },
  });

  const handleSubmit = async (values: CreateRecipeInput) => {
    try {
      const recipe = await api.createRecipe(values);
      navigate(`/recipes/${recipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please make sure you are logged in.');
    }
  };

  return (
    <Container size="md" py="xl">
      <Button component={Link} to="/" variant="subtle" mb="md">
        ← Back to recipes
      </Button>

      <Title order={1} mb="xl">Add New Recipe</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Paper shadow="xs" p="md" withBorder>
            <Stack gap="md">
              <TextInput
                label="Recipe Title"
                placeholder="Grandma's Chocolate Chip Cookies"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="A classic family recipe that everyone loves"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <NumberInput
                  label="Prep Time (minutes)"
                  placeholder="15"
                  min={0}
                  {...form.getInputProps('prep_time')}
                />
                <NumberInput
                  label="Cook Time (minutes)"
                  placeholder="30"
                  min={0}
                  {...form.getInputProps('cook_time')}
                />
                <NumberInput
                  label="Servings"
                  placeholder="4"
                  min={1}
                  {...form.getInputProps('servings')}
                />
              </Group>
            </Stack>
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Ingredients</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                variant="light"
                onClick={() => form.insertListItem('ingredients', { name: '', amount: undefined, unit: '' })}
              >
                Add Ingredient
              </Button>
            </Group>

            <Stack gap="md">
              {form.values.ingredients.map((_, index) => (
                <Group key={index} align="flex-start">
                  <NumberInput
                    placeholder="2"
                    style={{ width: 80 }}
                    min={0}
                    step={0.25}
                    {...form.getInputProps(`ingredients.${index}.amount`)}
                  />
                  <TextInput
                    placeholder="cups"
                    style={{ width: 100 }}
                    {...form.getInputProps(`ingredients.${index}.unit`)}
                  />
                  <TextInput
                    placeholder="flour"
                    style={{ flex: 1 }}
                    required
                    {...form.getInputProps(`ingredients.${index}.name`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => form.removeListItem('ingredients', index)}
                    disabled={form.values.ingredients.length === 1}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Instructions</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                variant="light"
                onClick={() => form.insertListItem('steps', '')}
              >
                Add Step
              </Button>
            </Group>

            <Stack gap="md">
              {form.values.steps.map((_, index) => (
                <Group key={index} align="flex-start">
                  <Text fw={500} style={{ minWidth: 30 }}>{index + 1}.</Text>
                  <Textarea
                    placeholder="Preheat oven to 350°F..."
                    style={{ flex: 1 }}
                    minRows={2}
                    required
                    {...form.getInputProps(`steps.${index}`)}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => form.removeListItem('steps', index)}
                    disabled={form.values.steps.length === 1}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Paper shadow="xs" p="md" withBorder>
            <TextInput
              label="Tags"
              placeholder="dessert, cookies, chocolate (comma-separated)"
              description="Add tags to help others find your recipe"
              onChange={(event) => {
                const tags = event.currentTarget.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                form.setFieldValue('tags', tags);
              }}
            />
          </Paper>

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" component={Link} to="/">
              Cancel
            </Button>
            <Button type="submit" size="md">
              Create Recipe
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
