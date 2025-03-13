"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/database.types'

interface SearchProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export default function Search({ placeholder = "Search..." }: SearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Database['public']['Tables']['recipes']['Row'][]>([])
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('recipes')
      .select()
      .textSearch('title', query)
    if (error) {
      console.error('error searching', error)
    }
    if (data) {
      setResults(data)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
      <div className="relative w-full">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Search
      </Button>
    </form>
  )
}
