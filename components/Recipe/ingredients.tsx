import { Database } from '@/database.types';
import React from 'react';

type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"] & {
  ingredients: Database["public"]["Tables"]["ingredients"]["Row"] | null;
}

interface IngredientsProps {
  ingredients: Ingredient[];
}

export const Ingredients: React.FC<IngredientsProps> = ({ ingredients }) => {
  return (
    <section>
      <h3 className="font-bold text-lg">Ingredients</h3>
      <ul>
        {ingredients.map(ingredient => (
          <li key={ingredient.ingredient_id} className="flex justify-between">
            <span>{ingredient.ingredients?.name || "Ingredient Missing"}</span>
            <span>{ingredient.quantity} {ingredient.unit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
