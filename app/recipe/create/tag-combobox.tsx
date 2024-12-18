"use client"

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react"
import { createClient } from '@/utils/supabase/client';

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

type Tag = Database["public"]["Tables"]["tags"]["Row"];

interface TagComboboxProps {
  value: string | null;
  onChange: (value: string| null) => void;
}

export const TagCombobox: React.FC<TagComboboxProps> = ({ value, onChange }) => {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data: fetchedTags, error } = await supabase.from("tags").select('*');
      if (error) {
        console.error(error);
      } else {
        setTags(fetchedTags || []);
      }
    };

    fetchTags();
  }, [supabase]);

  const selectedTag = tags.find((tag) => tag.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          { selectedTag?.name ||  "Select Tag..." }
          <ChevronsUpDown className="ml02 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tag..." />
          <CommandGroup>
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => {
                  onChange(tag.id === value ? null : tag.id); // Update form
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === tag.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
