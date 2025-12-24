const base = require('./index.js');

module.exports = {
  ...base,
  env: {
    ...base.env,
    browser: true,
  },
  extends: [...base.extends, 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  plugins: [...base.plugins, 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
