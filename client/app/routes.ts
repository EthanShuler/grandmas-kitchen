import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("favorites", "routes/favorites.tsx"),
  route("recipes/:id", "routes/recipe.$id.tsx"),
  route("recipes/new", "routes/recipe.new.tsx"),
  route("recipe/:id/edit", "routes/recipe.$id.edit.tsx"),
] satisfies RouteConfig;
