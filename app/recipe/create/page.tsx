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
import { TagMultiSelect } from './tag-multiselect';
import { Trash2Icon } from 'lucide-react';
// import { StepsInputs } from './steps-form';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Recipe Title must be at least 2 characters.",
  }).max(50, {
    message: "Recipe Title muste be less than 50 characters"
  }),
  notes: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  steps: z.array(z.string().min(1))
})

export default function RecipeForm() {
  const supabase = createClient();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      notes: "",
      description: "",
      tags: [""],
      steps: [""],
    },
  })

  // 2. Define a submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with form values
    // This will be type-safe and validated
    console.log(values);
  }

  return (
    <div>
      <h1 className="text-xl font-bold">
        Add a new Recipe
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-lg shadow-md
        hover:border-gray-400 focus-within:border-gray-500"
        >
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
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="pr-4">Tag(s)</FormLabel>
                <FormControl>
                  <TagMultiSelect
                    selectedTags={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="steps"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="pr-4">Steps</FormLabel>
                <FormControl>
                  <div>
                    {field.value.map((step, index) => (
                      <div className="flex gap-4 mt-1" key={index}>
                        <div className="self-center w-5">
                          <p className="self-start text-sm text-gray-500">{index+1}.</p>
                        </div>
                        <Input
                          type="text"
                          placeholder={`Step ${index + 1}`}
                          className="w-full"
                          value={step}
                          onChange={(e) => {
                            const updatedSteps = [...field.value];
                            updatedSteps[index] = e.target.value;
                            field.onChange(updatedSteps);
                            form.trigger("steps");
                          }}
                        />
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const updatedSteps = field.value.filter(
                              (_, stepIndex) => stepIndex !== index
                            );
                            field.onChange(updatedSteps);
                            form.trigger("steps");
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <Button
                  className="self-center"
                  onClick={(e) => {
                    e.preventDefault();
                    const updatedSteps = [...form.getValues("steps"), ""];
                    form.setValue("steps", updatedSteps);
                    form.trigger("steps");
                  }}
                >
                  Add Step
                </Button>
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>

  )
}
