// This file is used to provide type definitions for Vite's `import.meta.env`
// object. By defining the shape of `ImportMetaEnv`, we get type safety and
// autocompletion for our environment variables.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Add other environment variables used in the app here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
