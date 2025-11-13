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
    // Allow console.log in development
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Disable some React warnings for development
    'react-hooks/exhaustive-deps': 'warn',
    
    // Allow empty catch blocks
    'no-empty': ['error', { allowEmptyCatch: true }],
    
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Disable prop-types validation for now
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};