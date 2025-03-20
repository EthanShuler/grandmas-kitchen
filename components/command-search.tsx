"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/database.types'

export default function CommandSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<Database['public']['Tables']['recipes']['Row'][]>([]);
  const supabase = createClient();
  const router = useRouter();

  const handleValueChange = async (value: string) => {
    setSearchValue(value);
    if (!value) {
      setResults([]);
      return;
    }
    
    const { data, error } = await supabase.rpc('search_recipes_by_title', { prefix: value})
    if (error) {
      console.error('error searching', error);
    }
    if (data) {
      console.log(data.length)
      setResults(data);
    }
  }

  const handleSearch = (value: string) => {
    router.replace(`/recipe/${value}`)
    setSearchValue('')
    setResults([])
  }

  return (
    <Command>
      <CommandInput
        value={searchValue}
        onValueChange={handleValueChange}
        placeholder="Search..."
      />

      <CommandList>
        {results.map((recipe) => (
          <CommandItem key={recipe.id} onSelect={() => handleSearch(recipe.id)}>
            {recipe.title}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}
