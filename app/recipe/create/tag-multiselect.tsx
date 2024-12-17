"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Tags, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Database } from "@/database.types";
import { Badge } from '@/components/ui/badge';

type Tag = Database["public"]["Tables"]["tags"]["Row"];

interface TagComboboxProps {
  selectedTags: string[]
  onChange: (ids: string[] | null) => void; // Callback to update form state
}

export function TagMultiSelect({ selectedTags, onChange }: TagComboboxProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data: fetchedTags, error } = await supabase.from("tags").select("*");
      if (error) {
        console.error(error);
      } else {
        setTags(fetchedTags || []);
      }
    };

    fetchTags();
  }, [supabase]);

  const togggleTag = (tagId: string) => {
    const updatedTags = selectedTags?.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onChange(updatedTags);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedTags.length > 0
            ? tags
              .filter((tag) => selectedTags.includes(tag.id))
              .map((tag) => tag.name)
              .join(", ")
            : "Select Tags..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name} // Use tag.name for search functionality
                onSelect={() => togggleTag(tag.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {selectedTags.length > 0 && (
        <div className="flex flex-warap gap-2 mt-2">
          {tags
            .filter((tag) => selectedTags.includes(tag.id))
            .map((tag) => (
              <Badge
                key={tag.id}
                className="flex items-center gap-1"
                onClick={() => togggleTag(tag.id)}
                variant="secondary"
              >
                {tag.name}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
        </div>
      )}
    </Popover>
  );
}
