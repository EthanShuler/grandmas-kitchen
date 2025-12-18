import { Card, Text, Badge, Group, Image } from '@mantine/core';
import { Link } from 'react-router';
import type { Recipe } from '@/types';
import { FavoriteButton } from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe;
  linkTo?: string;
}

export function RecipeCard({ recipe, linkTo }: RecipeCardProps) {
  const cardContent = (
    <>
      {recipe.image_url && (
        <Card.Section>
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            height={160}
            fit="cover"
          />
        </Card.Section>
      )}
      
      <Group justify="space-between" mb="xs" mt="md">
        <Text fw={500} size="lg" lineClamp={1} style={{ flex: 1 }}>{recipe.title}</Text>
        <FavoriteButton recipeId={recipe.id} size="sm" />
      </Group>

      {recipe.description && (
        <Text size="sm" c="dimmed" lineClamp={2} mb="md">
          {recipe.description}
        </Text>
      )}

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Text size="sm" mb="md">
          Ingredients: {recipe.ingredients.length}
        </Text>
      )}

      <Group gap="xs" mb="xs">
        {recipe.prep_time && (
          <Badge color="blue" variant="light">
            Prep: {recipe.prep_time} min
          </Badge>
        )}
        {recipe.cook_time && (
          <Badge color="blue" variant="light">
            Cook: {recipe.cook_time} min
          </Badge>
        )}
        {recipe.servings && (
          <Badge color="blue" variant="light">
            Serves {recipe.servings}
          </Badge>
        )}
      </Group>

      {recipe.tags && recipe.tags.length > 0 && (
        <Group gap={4} mt="xs">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} size="xs" variant="outline" color="gray">
              {tag.name}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Text size="xs" c="dimmed">+{recipe.tags.length - 3} more</Text>
          )}
        </Group>
      )}

      {recipe.author && (
        <Text size="xs" c="dimmed" mt="sm">
          By {recipe.author}
        </Text>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        component={Link}
        to={linkTo}
        style={{ 
          textDecoration: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
        }}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {cardContent}
    </Card>
  );
}
