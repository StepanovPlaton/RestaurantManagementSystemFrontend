import { defineConfig, globalIgnores } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**/*" },
        { type: "views", pattern: "src/views/**/*" },
        { type: "widgets", pattern: "src/widgets/**/*" },
        { type: "features", pattern: "src/features/**/*" },
        { type: "entities", pattern: "src/entities/**/*" },
        { type: "shared", pattern: "src/shared/**/*" },
        { type: "application", pattern: "src/application/**/*" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["views", "application", "shared"] },
            { from: "views", allow: ["widgets", "features", "entities", "shared"] },
            {
              from: "widgets",
              allow: ["features", "entities", "shared"],
            },
            { from: "features", allow: ["entities", "shared"] },
            { from: "entities", allow: ["shared"] },
            { from: "application", allow: ["shared", "entities", "features"] },
            { from: "shared", allow: ["shared"] },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
