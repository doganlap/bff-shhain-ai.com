module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-undef': 'off',
  },
  overrides: [
    {
      files: [
        'src/pages/tasks/**/*.jsx',
        'src/pages/assessments/**/*.jsx',
        'src/components/Regulatory/**/*.jsx',
        'src/pages/organizations/**/*.jsx',
        'src/components/auth/**/*.jsx',
        'src/components/layout/**/*.jsx'
      ],
      rules: {
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-undef': 'error'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};