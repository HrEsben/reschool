import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Warnings instead of errors for development
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      
      // Keep real errors as errors
      "react/no-unescaped-entities": "error",
      
      // Allow some common patterns
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      
      // Disable overly strict rules for rapid development
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
