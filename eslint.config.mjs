import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";

const localRules = {
    rules: {
        "single-line-imports": {
            meta: {
                type: "layout",
                docs: {
                    description: "Enforce import declarations on a single line",
                },
                schema: [],
                fixable: "whitespace",
                messages: {
                    singleLineImport: "Import declarations must stay on a single line.",
                },
            },
            create(context)
            {
                const sourceCode = context.getSourceCode();

                return {
                    ImportDeclaration(node)
                    {
                        if (!node.loc || node.loc.start.line === node.loc.end.line) return;

                        context.report({
                            node,
                            messageId: "singleLineImport",
                            fix(fixer)
                            {
                                const text = sourceCode.getText(node);
                                const fixed = text.replace(/\s+/g, " ").trim();

                                return fixer.replaceText(node, fixed);
                            },
                        });
                    },
                };
            },
        },
    },
};

export default [
    {
        ignores: ["**/dist/**", "**/.next/**", "**/out/**", "**/node_modules/**", "**/coverage/**", "next-env.d.ts"],
    },
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "@stylistic": stylistic,
            "simple-import-sort": simpleImportSort,
            "local": localRules,
            "unicorn": eslintPluginUnicorn,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "no-undef": "off",
            "no-redeclare": "off",
            "@typescript-eslint/no-redeclare": "error",
            "curly": "warn",
            "eqeqeq": "warn",
            "no-dupe-keys": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/consistent-type-imports": ["error", {
                prefer: "type-imports",
                fixStyle: "separate-type-imports",
            }],
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            }],
            "@typescript-eslint/no-unused-expressions": ["error", {
                allowShortCircuit: true,
            }],
            "@typescript-eslint/naming-convention": ["warn", {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            }],
            "local/single-line-imports": "error",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            // Next's file conventions are fixed names the router reads; everything
            // else (including route groups and catch-all segments) stays kebab-case.
            "unicorn/filename-case": ["error", {
                case: "kebabCase",
                ignore: ["^\\[\\[?\\.*[a-zA-Z]+\\]\\]?$", "^_meta\\.js$"],
            }],
            "max-lines": ["warn", { max: 2000, skipBlankLines: true, skipComments: true }],
            "complexity": ["warn", { max: 15, variant: "classic" }],
            "@stylistic/brace-style": ["error", "allman", { allowSingleLine: true }],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "@stylistic/indent": ["error", 4],
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/jsx-quotes": ["error", "prefer-double"],
        },
    },
    {
        files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: reactHooks.configs["recommended-latest"].rules,
    },
    {
        files: ["**/*.mjs", "**/*.cjs", "**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
