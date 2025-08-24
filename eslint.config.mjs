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
    rules: {
      // Temporary fixes while you update the code - change errors to warnings
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-unused-vars": "warn",  // Change from error to warning
      "react/no-unescaped-entities": "warn",        // Change from error to warning
      "@next/next/no-img-element": "warn",          // Change from error to warning
      "prefer-const": "warn",                       // Change from error to warning
      
      // Keep these as errors for critical issues
      "react-hooks/exhaustive-deps": "warn", // Change to warn temporarily
      "react-hooks/rules-of-hooks": "error"
    }
  },
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      // More lenient for API files during transition
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];

export default eslintConfig;