module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  plugins: [
    'stylelint-config-tailwindcss'
  ],
  rules: {
    // Allow Tailwind CSS directives
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ],
    
    // Allow CSS custom properties
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          'scrollbar-width',
          'scrollbar-color',
          'text-wrap'
        ]
      }
    ],
    
    // Allow modern CSS features
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          'theme',
          'screen'
        ]
      }
    ],
    
    // Disable some strict rules for development
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null
  }
};
