import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      prettier,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "off", // Desactiva errores de Prettier (comillas, formato)
      "prefer-destructuring": "off", // Permite no usar destructuring
      "import/no-default-export": "off", // Permite `export default`
      "func-style": "off", // Permite definir funciones con cualquier sintaxis
    }
  }
];
