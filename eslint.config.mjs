import typescriptEslint from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import prettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
import importPlugin from "eslint-plugin-import";
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
  pluginPromise.configs["flat/recommended"],
  importPlugin.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
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

      "import/named": "off",
      "import/no-named-as-default": "off",
      "import/no-unresolved": "off",
      "import/no-duplicates": "error",
      "import/no-relative-parent-imports": "error",

      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "error",
      "promise/no-native": "off",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/no-callback-in-promise": "warn",
      "promise/avoid-new": "warn",
      "promise/no-new-statics": "error",
      "promise/no-return-in-finally": "warn",
      "promise/valid-params": "warn",
      "promise/no-multiple-resolved": "error",

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
];
