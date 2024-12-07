"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { createClient } from '@/utils/supabase/client';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { TagCombobox } from './tag-combobox';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Recipe Title must be at least 2 characters.",
  }).max(50, {
    message: "Recipe Title muste be less than 50 characters"
  }),
  notes: z.string(),
  description: z.string(),
  tag: z.string(),
})

export function RecipeForm() {
  const supabase = createClient();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      notes: "",
      description: "",
      tag: "",
    },
  })

  // 2. Define a submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with form values
    // This will be type-safe and validated
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                What do you call this recipe?
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="The best mid-afternoon snack!" {...field} />
              </FormControl>
              <FormDescription>
                A description of this recipe
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Don't be afraid to use lots of salt..." {...field} />
              </FormControl>
              <FormDescription>
                Notes that can help make the cooking process easier
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="pr-4">Tag(s)</FormLabel>
              <FormControl>
                <TagCombobox
                  value={field.value}
                  onChange={field.onChange}  
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
