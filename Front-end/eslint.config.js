import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Global Ignores
  { ignores: ["dist", "node_modules", "coverage"] },

  // 2. Base Configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Frontend Specific Rules
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser, // <--- Key: Allows 'window', 'document', 'fetch'
      },
    },
    rules: {
      // Vite often uses "any" for imported assets, so we downgrade this to a warning
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-unused-vars": "warn", // Use TS rule
    },
  }
);