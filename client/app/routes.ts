import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("recipes/:id", "routes/recipe.$id.tsx"),
  route("recipes/new", "routes/recipe.new.tsx"),
] satisfies RouteConfig;
