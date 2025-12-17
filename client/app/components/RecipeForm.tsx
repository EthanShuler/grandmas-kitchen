import { TextInput, Textarea, NumberInput, Button, Paper, Stack, Group, ActionIcon, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { CreateRecipeInput, Recipe } from '@/types';

interface RecipeFormProps {
  initialValues?: Partial<CreateRecipeInput>;
  onSubmit: (values: CreateRecipeInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function RecipeForm({ 
  initialValues, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Save Recipe',
  isLoading = false 
}: RecipeFormProps) {
  const form = useForm<CreateRecipeInput>({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      prep_time: initialValues?.prep_time,
      cook_time: initialValues?.cook_time,
      servings: initialValues?.servings,
      source: initialValues?.source || '',
      notes: initialValues?.notes || '',
      image_url: initialValues?.image_url || '',
      instructions: initialValues?.instructions || '',
      ingredients: initialValues?.ingredients?.length 
        ? initialValues.ingredients 
        : [{ name: '', amount: undefined, unit: '' }],
      steps: initialValues?.steps?.length 
        ? initialValues.steps 
        : [''],
      tags: initialValues?.tags || [],
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Title is required' : null),
    },
  });

  const handleSubmit = async (values: CreateRecipeInput) => {
    // Filter out empty ingredients and steps
    const cleanedValues = {
      ...values,
      ingredients: values.ingredients.filter(ing => ing.name.trim() !== ''),
      steps: values.steps.filter(step => step.trim() !== ''),
    };
    await onSubmit(cleanedValues);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Basic Info */}
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

            <TextInput
              label="Source"
              placeholder="Grandma, Mom, Uncle Joe, etc."
              {...form.getInputProps('source')}
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

        {/* Ingredients */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Ingredients</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              size="sm"
              onClick={() => form.insertListItem('ingredients', { name: '', amount: undefined, unit: '' })}
            >
              Add Ingredient
            </Button>
          </Group>

          <Stack gap="sm">
            {form.values.ingredients.map((_, index) => (
              <Group key={index} align="flex-start" wrap="nowrap">
                <NumberInput
                  placeholder="2"
                  style={{ width: 80 }}
                  min={0}
                  step={0.25}
                  decimalScale={2}
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

        {/* Steps */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Steps</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              size="sm"
              onClick={() => form.insertListItem('steps', '')}
            >
              Add Step
            </Button>
          </Group>

          <Stack gap="sm">
            {form.values.steps.map((_, index) => (
              <Group key={index} align="flex-start" wrap="nowrap">
                <Text fw={500} style={{ minWidth: 30, paddingTop: 8 }}>{index + 1}.</Text>
                <Textarea
                  placeholder="Preheat oven to 350°F..."
                  style={{ flex: 1 }}
                  minRows={2}
                  autosize
                  {...form.getInputProps(`steps.${index}`)}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => form.removeListItem('steps', index)}
                  disabled={form.values.steps.length === 1}
                  style={{ marginTop: 8 }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Paper>

        {/* Notes */}
        <Paper shadow="xs" p="md" withBorder>
          <Textarea
            label="Notes"
            placeholder="Additional notes about the recipe"
            minRows={3}
            {...form.getInputProps('notes')}
          />
        </Paper>

        {/* Image URL */}
        <Paper shadow="xs" p="md" withBorder>
          <TextInput
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            {...form.getInputProps('image_url')}
          />
        </Paper>

        {/* Instructions */}
        <Paper shadow="xs" p="md" withBorder>
          <Textarea
            label="Instructions"
            placeholder="Step-by-step instructions for the recipe"
            minRows={3}
            {...form.getInputProps('instructions')}
          />
        </Paper>

        {/* Tags */}
        <Paper shadow="xs" p="md" withBorder>
          <TextInput
            label="Tags"
            placeholder="dessert, cookies, chocolate (comma-separated)"
            description="Add tags to help others find your recipe"
            defaultValue={form.values.tags.join(', ')}
            onChange={(event) => {
              const tags = event.currentTarget.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
              form.setFieldValue('tags', tags);
            }}
          />
        </Paper>

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// Helper function to convert Recipe to CreateRecipeInput for editing
export function recipeToFormValues(recipe: Recipe): CreateRecipeInput {
  return {
    title: recipe.title,
    description: recipe.description || '',
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    source: recipe.source || '',
    notes: recipe.notes || '',
    image_url: recipe.image_url || '',
    instructions: recipe.instructions || '',
    ingredients: recipe.ingredients?.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || '',
    })) || [{ name: '', amount: undefined, unit: '' }],
    steps: recipe.steps?.map(step => step.instruction) || [''],
    tags: recipe.tags?.map(tag => tag.name) || [],
  };
}
