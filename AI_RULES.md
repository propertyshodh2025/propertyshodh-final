# AI Development Rules for This Application

This document outlines the core technologies and best practices for developing features within this application.

## Tech Stack Overview

*   **Frontend Framework:** React.js for building dynamic user interfaces.
*   **Language:** TypeScript for type safety and improved code quality.
*   **Routing:** React Router DOM for client-side navigation and managing application routes.
*   **Backend & Database:** Supabase for all backend services, including authentication, database interactions, and serverless Edge Functions.
*   **Styling:** Tailwind CSS for a utility-first approach to styling, ensuring responsive and consistent designs.
*   **UI Components:** shadcn/ui (built on Radix UI) for a collection of accessible and customizable UI components.
*   **Icons:** lucide-react for a comprehensive set of vector icons.
*   **Global State Management:** React Context API for managing application-wide state, such as language preferences.
*   **Internationalization:** Custom `LanguageContext` and `TranslatableText` component for handling multi-language support.

## Library Usage Guidelines

*   **React & TypeScript:**
    *   Use for all new components, hooks, and application logic.
    *   Prioritize functional components and React Hooks.
    *   Ensure all new code is type-safe using TypeScript.
*   **React Router DOM:**
    *   Handle all client-side routing.
    *   Keep the main route definitions consolidated in `src/App.tsx`.
*   **Supabase:**
    *   All interactions with the backend (authentication, database queries, mutations, and serverless functions) must use the Supabase client.
    *   The Supabase client should be imported from `src/integrations/supabase/client.ts`.
    *   **Security:** Always enable Row Level Security (RLS) on new database tables and define appropriate policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations.
*   **Tailwind CSS:**
    *   Use Tailwind utility classes for all styling. Avoid writing custom CSS files unless absolutely necessary for complex, non-utility-based styles.
    *   Ensure designs are responsive by utilizing Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`).
*   **shadcn/ui & Radix UI:**
    *   Leverage existing shadcn/ui components whenever possible for UI elements (e.g., `Button`, `Card`, `Badge`).
    *   Do **not** directly modify the source files of shadcn/ui components. If a component needs significant customization, create a new component that wraps or extends the shadcn/ui component.
*   **lucide-react:**
    *   Use for all icon needs within the application.
*   **Context API:**
    *   Utilize for global state that needs to be accessible by many components without prop drilling (e.g., `LanguageContext`).
*   **Custom Utilities:**
    *   Place reusable, non-component logic (like `formatINRShort`, `translateEnum`, `formatNumberWithLocale`) in appropriate `src/lib` or `src/utils` files.