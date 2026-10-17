import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["node_modules/", ".claude/", "allure-results/", "allure-report/", "logs/", "eslint.config.mjs", ".mocharc.js"] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      // same rules as @qa/eslint-config-mtu-typescript
      curly: "error",
      complexity: ["error", 13],
      "max-params": ["error", 7],
      "no-console": "error",
      "prefer-object-spread": "error",
      "no-underscore-dangle": ["error", { allow: ["_id"], allowAfterThis: true, allowAfterSuper: true }],
      "@typescript-eslint/return-await": ["error", "in-try-catch"],

      "import-x/extensions": ["error", "ignorePackages", { js: "never", ts: "never" }],
      // import-x/extensions treats "./file.js" as a valid alias of file.ts, so block it separately
      "no-restricted-imports": ["error", {
        patterns: [{ regex: "^\\.{1,2}/.*\\.js$", message: "Import local modules without extension" }],
      }],
      "import-x/no-unresolved": "error",
      "import-x/no-absolute-path": "error",
      "import-x/no-dynamic-require": "error",
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",
      "import-x/first": "error",
      "import-x/no-duplicates": "error",
      "import-x/newline-after-import": "error",
      "import-x/max-dependencies": ["error", { max: 20 }],
      "import-x/no-mutable-exports": "error",
      "import-x/order": "error",

      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/indent": ["error", 2, { MemberExpression: 1, SwitchCase: 1 }],
      "@stylistic/brace-style": ["error", "stroustrup"],
      "@stylistic/comma-dangle": ["error", {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        enums: "always-multiline",
        generics: "always-multiline",
        tuples: "always-multiline",
        functions: "never",
      }],
      "@stylistic/max-len": ["error", {
        code: 120,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      }],
      "@stylistic/type-annotation-spacing": "error",
      "@stylistic/no-tabs": "error",
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/quote-props": ["error", "as-needed"],
      "@stylistic/linebreak-style": ["error", "unix"],

      // airbnb basics the team config inherits
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/eol-last": "error",
      "@stylistic/comma-spacing": "error",
      "@stylistic/key-spacing": "error",
      "@stylistic/keyword-spacing": "error",
      "@stylistic/space-infix-ops": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 2, maxEOF: 0 }],
    },
  },
  {
    // command line scripts report to the console
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  }
);
