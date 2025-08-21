import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
    "prettier"
  ),

  // --- ADD THIS NEW OBJECT ---
  {
    settings: {
      tailwindcss: {
        // Tells the plugin where to find your config file
        config: "tailwind.config.js",
      },
    },
  },
];

export default eslintConfig;