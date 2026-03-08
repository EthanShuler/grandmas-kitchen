import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface FavoriteButtonProps {
  recipeId: number;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'filled' | 'light' | 'default';
}

export function FavoriteButton({ recipeId, initialFavorited, size = 'md', variant = 'subtle' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If initialFavorited was provided, skip the per-recipe API call
    if (initialFavorited !== undefined) return;
    if (isAuthenticated) {
      api.checkFavorite(recipeId)
        .then((result) => setIsFavorited(result.is_favorited))
        .catch(() => setIsFavorited(false));
    }
  }, [recipeId, isAuthenticated, initialFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || isLoading) return;

    const previous = isFavorited;
    setIsFavorited(!previous);
    setIsLoading(true);
    try {
      if (previous) {
        await api.removeFavorite(recipeId);
      } else {
        await api.addFavorite(recipeId);
      }
    } catch (error) {
      setIsFavorited(previous);
      notifications.show({
        title: 'Error',
        message: 'Failed to update favorites. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ActionIcon
      variant={variant}
      color={isFavorited ? 'red' : 'gray'}
      size={size}
      onClick={handleToggle}
      loading={isLoading}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
    </ActionIcon>
  );
}
