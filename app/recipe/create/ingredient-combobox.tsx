"use client";

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
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

export default function IngredientCombobox({ value, onChange }: IngredeintsComboboxProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const createNewIngredient = async () => {
    if (!searchValue.trim()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert({ name: searchValue.trim() })
        .select()
        .single();

      if (error) {
        console.error('Error creating ingredient:', error);
        return;
      }

      setIngredients(prev => [...prev, data]);
      onChange(data.id);
      setSearchValue("");
      setOpen(false);
    } catch (err) {
      console.error('Failed to create ingredient:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = searchValue.trim() !== "" &&
    !ingredients.some(i => i.name.toLowerCase() === searchValue.toLowerCase().trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedIngredient ? selectedIngredient.name : "Select Ingredient..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search Ingredient..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {showCreateOption && (
              <CommandItem
                onSelect={createNewIngredient}
                className="text-sm cursor-pointer"
                disabled={isCreating}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreating ? "Creating..." : `Create "${searchValue}"`}
              </CommandItem>
            )}
            <CommandGroup>
              {filteredIngredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.id}
                  value={ingredient.name}
                  onSelect={() => {
                    onChange(ingredient.id); // Update form
                    setSearchValue("");
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
