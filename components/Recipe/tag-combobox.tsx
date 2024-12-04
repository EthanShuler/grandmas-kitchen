"use client"

import { useState, useEffect } from 'react';
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

export function TagCombobox() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? tags.find((tag) => tag.name === value)?.name
            : "Select Tag..."}
          <ChevronsUpDown className="ml02 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tag..." />
          <CommandGroup>
            {tags.map((tag) => (
              <CommandItem
                key={tag.name}
                value={tag.name}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === tag.name ? "opacity-100" : "opacity-0"
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
