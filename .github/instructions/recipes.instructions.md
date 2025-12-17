---
applyTo: '**'
---
This website is to log grandma's family recipes.

## Project Structure

The frontend is in "client" and uses:
- React 19
- React Router 7
- Mantine 8 (UI component library)
- TypeScript
- Vite (build tool)

The backend is in "server" and uses:
- Express.js
- PostgreSQL database
- TypeScript

## Features

### Public Features
- View all recipes
- Search recipes by ingredient, theme, or tag
- Browse recipe categories
- View detailed recipe instructions with ingredients and steps

### Authenticated Features
- Add new recipes
- Edit existing recipes
- Manage recipe ingredients, steps, and tags

## Database Schema

### Recipes Table
- id (primary key)
- title
- description
- prep_time
- cook_time
- servings
- created_by (user_id)
- created_at
- updated_at

### Ingredients Table
- id (primary key)
- name
- created_at

### Recipe_Ingredients Table
- id (primary key)
- recipe_id (foreign key)
- ingredient_id (foreign key)
- amount
- unit
- order_index
- created_at

### Steps Table
- id (primary key)
- recipe_id (foreign key)
- instruction
- order_index
- created_at

### Tags Table
- id (primary key)
- name
- created_at

### Recipe_Tags Table (junction)
- recipe_id
- tag_id
- created_at

### Users Table
- id (primary key)
- username
- email
- password_hash
- created_at
- avatar_url

## Coding Conventions

- Use TypeScript for type safety
- Use Mantine components for consistent UI/UX
- Follow React Router 7 conventions for routing and data loading
- Use async/await for database operations
- Validate user input on both client and server
- Use prepared statements to prevent SQL injection