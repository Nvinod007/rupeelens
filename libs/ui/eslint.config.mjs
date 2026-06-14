import nx from "@nx/eslint-plugin";

import baseConfig from "../../eslint.config.mjs";

export default [
  ...nx.configs["flat/react"],
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          allow: [
            "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$",
            // Barrel aliases within this lib (apps still use @shared-ui from outside)
            "^@shared-ui(/.*)?$",
          ],
          depConstraints: [
            {
              onlyDependOnLibsWithTags: ["*"],
              sourceTag: "*",
            },
          ],
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },
];
