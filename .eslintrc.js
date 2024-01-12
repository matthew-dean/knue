const jsRules = {
  /**
   * Okay tryyyying not to bikeshed here but I've never seen Standard JS's
   * formatting preference for space before in use before using StandardJS
   */
  'space-before-function-paren': ['error', {
    anonymous: 'never',
    named: 'never',
    asyncArrow: 'always'
  }],
  /** Cloudinary props are returned in snake_case  */
  camelcase: ['error', {
    properties: 'never',
    ignoreDestructuring: true,
    ignoreImports: true
  }],
  /** Tweak for better readability */
  'operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
  /**
   * We need this off to leave env.js imports left as-is
   */
  'import/no-absolute-path': 0
}
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  ignorePatterns: ['**/dist/**', '**/node_modules/**'],

  overrides: [
    {
      files: ['*.js'],
      extends: ['standard'],
      parser: 'vue-eslint-parser',
      rules: {
        ...jsRules
      }
    },
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:vue/vue3-strongly-recommended',
        'standard-with-typescript'
      ],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue']
      },
      rules: {
        ...jsRules,
        'func-call-spacing': 0,
        'import/no-absolute-path': 0,

        '@typescript-eslint/func-call-spacing': 'error',

        /** conflicts with https://typescript-eslint.io/rules/no-floating-promises/ */
        'no-void': 0,
        '@typescript-eslint/space-before-function-paren': ['error', {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always'
        }],
        /**
         * Some methods return a promise as a convenience, like the router,
         * but it's not necessary to always prepend "void"
         */
        '@typescript-eslint/no-floating-promises': ['warn', {
          ignoreVoid: true
        }],
        /** Added in @typescript-eslint in 5.60.1, which we need to fix in code */
        '@typescript-eslint/promise-function-async': 'off',
        /**
         * This needs to be a warning because it's in conflict with TypeScript's
         * decorator behavior.
         *
         * @see: https://github.com/typescript-eslint/typescript-eslint/issues/546
         */
        '@typescript-eslint/consistent-type-imports': ['warn', {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        }],
        /**
         * This is a dangerous one to change based on an error,
         * because it's unclear what the original intent was.
         * However, we should warn so we avoid in the future.
         */
        '@typescript-eslint/prefer-nullish-coalescing': 'warn',
        /**
         * Loosen some rules to not force as much code refactoring
         * See individual rules for what issues these can cause.
         */
        '@typescript-eslint/strict-boolean-expressions': 0,
        '@typescript-eslint/restrict-template-expressions': 0,
        '@typescript-eslint/method-signature-style': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/consistent-type-assertions': 0,

        /**
         * @note Vue rules need to be applied to `.ts` I think because Volar generates
         * virtual .ts files.
         */
        /**
         * I wanted to turn this on, but it appears this rule only works with SFCs,
         * and most of this codebase doesn't use SFCs.
         */
        // 'vue/no-undef-components': ['error', {
        //   ignorePatterns: ['RouterLink', 'RouterView']
        // }],
        /**
         * Aligns with the Vue style guide.
         * @see https://v2.vuejs.org/v2/style-guide/?redirect=true#Component-name-casing-in-templates-strongly-recommended
         */
        // 'vue/component-name-in-template-casing': [
        //   'error',
        //   'PascalCase',
        //   {
        //     registeredComponentsOnly: false
        //   }
        // ],
        'vue/component-name-in-template-casing': 'error',

        /**
         * This is a good guard for JavaScript, but with TypeScript, we can allow
         * optional properties and use optional chaining to narrow values.
         */
        'vue/require-default-prop': 0,

        /**
         * Existing components don't conform to this,
         * and, in this case, it seems reasonable to turn off
         * since components are in PascalCase.
         */
        'vue/multi-word-component-names': 0,

        /** Sensible rules for HTML vs custom components */
        'vue/html-self-closing': ['error', {
          html: {
            void: 'any',
            // Setting to 'any' because <slot /> makes more sense
            normal: 'any',
            component: 'always'
          }
        }],
        /**
         * This doesn't seem to apply right now because of a bug
         */
        'vue/component-tags-order': ['error', {
          order: [
            ['script', 'script[setup]', 'template', 'style'],
            ['template', 'script:not([setup])', 'style']
          ]
        }],
        /**
         * Added to normalize this rule after updating the plugin
         */
        'vue/no-reserved-component-names': 0,

        'vue/multiline-html-element-content-newline': ['warn', {
          ignoreWhenEmpty: true,
          allowEmptyLines: true
        }],

        'vue/no-mutating-props': ['error', {
          shallowOnly: true
        }]
      }
    },
    {
      files: ['*.vue'],
      globals: {
        defineModel: 'readonly',
        defineOptions: 'readonly',
        $defineProps: 'readonly',
        $$: 'readonly'
      },
      rules: {
        /** This is mis-reported with multiple <script> blocks */
        'import/first': 0
      }
    },
    /** Test eslinting rules */
    {
      files: [
        'test/**/*.{js,ts,tsx}',
        '**/__tests__/*.{js,ts,tsx}',
        '**/*.test.{js,ts,tsx}'
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
        /** Address in the future */
        '@typescript-eslint/no-unused-vars': 0,
        'vue/one-component-per-file': 0
      }
    },
    /** .d.ts files need inline imports */
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/consistent-type-imports': 0
      }
    },
    {
      files: ['*.mjs'],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ]
}
