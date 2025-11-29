module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:security/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'jsx-a11y',
    'security',
    'import'
  ],
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-unused-prop-types': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-constant-condition': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-unreachable': 'error',

    // Best practices
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-caller': 'error',
    'no-else-return': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-magic-numbers': ['warn', { 
      ignore: [0, 1, -1, 2],
      ignoreArrayIndexes: true
    }],
    'prefer-const': 'error',
    'prefer-destructuring': ['error', {
      object: true,
      array: false
    }],

    // Variables
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',

    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'error',

    // Import/Export rules
    'import/no-unresolved': 'off',
    'import/no-absolute-path': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/export': 'error',

    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/label-has-associated-control': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'coverage',
    '*.min.js',
    'public'
  ]
};