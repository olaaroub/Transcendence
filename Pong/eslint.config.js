import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Global Ignores
  { ignores: ["**/dist", "**/node_modules", "**/build"] },

  // 2. Base Configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Universal Rules (Browser + Node)
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // We enable BOTH because 'Shared' might be used anywhere,
        // and 'Online' might have server code.
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Common game dev patterns often use 'any', so we keep it as warning
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow empty functions (common in game stubs/interfaces)
      "@typescript-eslint/no-empty-function": "off",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    },
  }
);