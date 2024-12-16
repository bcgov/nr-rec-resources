import typescriptEslint from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/.git/",
      "**/.github/",
      "**/migrations/",
      "**/node_modules/",
      "**/.happo.js",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"],
      },
    },

    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      "no-unused-vars": "off",

      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],

      "no-undef": "off",
      "no-use-before-define": "off",
      semi: ["error", "always"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
        { usePrettierrc: true },
      ],

      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          functions: false,
        },
      ],

      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/explicit-function-return-type": "off",

      "@typescript-eslint/consistent-type-imports": [
        "off",
        {
          prefer: "type-imports",
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
];
