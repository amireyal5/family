# Therapeutic Center Management

This is a comprehensive, modern, and responsive platform for managing a therapeutic center, built with React, TypeScript, Material-UI, Zustand, and Supabase.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd therapeutic-center-management
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    -   Open `.env.local` and add your Supabase project URL and anon key. You can find these in your Supabase project dashboard under `Settings > API`.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Technology Stack

-   **Frontend:** React 18, TypeScript
-   **UI:** Material-UI v5
-   **Routing:** React Router v6
-   **State Management:** Zustand
-   **Backend & Database:** Supabase
-   **Deployment:** Netlify

## Folder Structure

The project follows a modular structure to keep the codebase organized and scalable:

-   `src/components`: Reusable UI components.
-   `src/pages`: Top-level page components.
-   `src/layouts`: Layout components like the main dashboard shell.
-   `src/hooks`: Custom React hooks.
-   `src/services`: API clients and services (e.g., Supabase client).
-   `src/store`: Zustand state management stores.
-   `src/styles`: Global styles and theme configuration.
-   `src/types`: TypeScript type definitions.
-   `src/utils`: Utility functions.
