"use client"

import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { TagMultiSelect } from './tag-multiselect';
import { Trash2Icon } from 'lucide-react';
import { User } from '@supabase/supabase-js';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Recipe Title must be at least 2 characters.",
  }).max(50, {
    message: "Recipe Title muste be less than 50 characters"
  }),
  notes: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  steps: z.array(z.string().min(1)),
  ingredients: z.array(z.object({
    ingredientName: z.string(),
    quantity: z.number(),
    unit: z.string(),
  }))
})

export default function RecipeForm() {
  const router = useRouter();
  const [user, setUser] = useState<User| null>(null);
  const [loading, setLoading] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      notes: "",
      description: "",
      tags: [],
      steps: [""],
      ingredients: [{ ingredientName: "", quantity: 0, unit: "" }]
    },
  });
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const { data, error} = await supabase.auth.getUser();
        if (error || !data.user) {
          setUser(null);
          throw error
        }
        setUser(data.user);
        // console.log('user');
      } catch (error) {
        console.error('error getting user', error)
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  if (loading) {
    return <p>loading...</p>
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }
  
  // 2. Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    //upsert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: values.title,
        notes: values.notes,
        description: values.description,
        user_id: user?.id,
      })
      .select().single();
    if (recipeError) {
      console.error("Error inserting recipe:", recipeError);
      return;
    }

    // upsert ingredients
    const { data: upsertedIngredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .upsert(values.ingredients.map((ingredient) => ({
        name: ingredient.ingredientName,
      })),
        { onConflict: 'name' } // prevent duplicates based on name column
      )
      .select();
    if (ingredientsError) {
      console.error("Error inserting ingredients:", ingredientsError);
      return;
    }

    // upsert recipe_ingredients
    const recipeIngredientsData = values.ingredients.map((ingredient) => {
      const matchingIngredient = upsertedIngredients.find((ing) => ing.name === ingredient.ingredientName);
      if (!matchingIngredient?.id) {
        console.error(`no ingredient for ${ingredient.ingredientName}`)
        return null
      }
      return {
        recipe_id: recipe.id,
        ingredient_id: matchingIngredient.id,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        notes: null
      }
    }).filter((data) => data !== null); // filter out null, where ingredient_id not found

    const { error: recipeIngredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(recipeIngredientsData);
    if (recipeIngredientsError) {
      console.error("Error inserting recipe ingredients:", recipeIngredientsError);
      return;
    }

    // upsert recipe_steps
    const { error: recipeStepsError } = await supabase
      .from('recipe_steps')
      .insert(values.steps.map((step, index) => ({
        recipe_id: recipe.id,
        step_order: index,
        description: step
      })));
    if (recipeStepsError) {
      console.error("error inserting steps", recipeStepsError);
      return;
    }

    // upsert recipe_tags
    const { error: recipeTagsError } = await supabase
      .from('recipe_tags')
      .insert(values.tags.map((t) => ({
        tag_id: t,
        recipe_id: recipe.id
      })));
    if (recipeTagsError) {
      console.error("Error inserting recipe tags:", recipeIngredientsError);
      return;
    }

    router.push('/');
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
            name="ingredients"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="pr-4">Ingredients</FormLabel>
                <FormControl>
                  <div>
                    {field.value.map((ingredient, index) => (
                      <div className="flex gap-4 mt-1" key={index}>
                        <div className="self-center w-5">
                          <p className="self-start text-sm text-gray-500">{index + 1}.</p>
                        </div>
                        <Input
                          type="text"
                          placeholder={`Ingredient ${index + 1}`}
                          className="w-full"
                          value={ingredient.ingredientName.toLowerCase()}
                          onChange={(e) => {
                            const updatedIngredients = [...field.value];
                            updatedIngredients[index].ingredientName = e.target.value;
                            field.onChange(updatedIngredients);
                            form.trigger("ingredients");
                          }}
                        />
                        <Input
                          type="number"
                          placeholder={'Quantity'}
                          className="w-full"
                          value={ingredient.quantity}
                          onChange={(e) => {
                            const updatedIngredients = [...field.value];
                            updatedIngredients[index].quantity = e.target.valueAsNumber;
                            field.onChange(updatedIngredients);
                            form.trigger("ingredients");
                          }}
                        />
                        <Input
                          type="text"
                          placeholder={'Unit'}
                          className="w-full"
                          value={ingredient.unit}
                          onChange={(e) => {
                            const updatedIngredients = [...field.value];
                            updatedIngredients[index].unit = e.target.value;
                            field.onChange(updatedIngredients);
                            form.trigger("ingredients");
                          }}
                        />
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const updatedIngredients = field.value.filter(
                              (_, stepIndex) => stepIndex !== index
                            );
                            field.onChange(updatedIngredients);
                            form.trigger("ingredients");
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
                    const updatedIngredients = [...form.getValues("ingredients"), {
                      ingredientName: "",
                      quantity: 0,
                      unit: ""
                    }];
                    form.setValue("ingredients", updatedIngredients);
                    form.trigger("ingredients");
                  }}
                >
                  Add Ingredient
                </Button>
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
                          <p className="self-start text-sm text-gray-500">{index + 1}.</p>
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
