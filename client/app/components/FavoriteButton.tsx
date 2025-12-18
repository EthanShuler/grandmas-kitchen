import { ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components';

interface FavoriteButtonProps {
  recipeId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'filled' | 'light' | 'default';
}

export function FavoriteButton({ recipeId, size = 'md', variant = 'subtle' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.checkFavorite(recipeId)
        .then((result: any) => setIsFavorited(result.is_favorited))
        .catch(() => setIsFavorited(false));
    }
  }, [recipeId, isAuthenticated]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFavorited) {
        await api.removeFavorite(recipeId);
        setIsFavorited(false);
      } else {
        await api.addFavorite(recipeId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
