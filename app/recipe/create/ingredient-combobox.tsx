"use client";

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import { createClient } from "@/utils/supabase/client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Database } from '@/database.types';

type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];

interface IngredeintsComboboxProps {
  value: string | null; //uuid
  onChange: (id: string) => void;
}

export default function IngredientCombobox ({ value, onChange }: IngredeintsComboboxProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data: fetchedIngredients, error } = await supabase.from('ingredients').select("*");
      if (error) {
        console.log('error fetching ingredients', error);
        return <p>error loading ingredients</p>
      } else {
        setIngredients(fetchedIngredients);
      }
    };
    fetchIngredients();
  }, [supabase]);

  const selectedIngredient = ingredients.find((ingredient) => ingredient.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedIngredient ? selectedIngredient.name : "Select Ingredient..." }
          <ChevronsUpDown className="ml02 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Ingredient..." />
          <CommandGroup>
            {ingredients.map((ingredient) => (
              <CommandItem
                key={ingredient.id}
                value={ingredient.name}
                onSelect={() => {
                  onChange(ingredient.id); // Update form
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === ingredient.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {ingredient.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
