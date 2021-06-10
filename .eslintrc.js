module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'prettier/prettier': 'error',
    'no-undef': 'warn',
    'no-unused-vars': 'warn',
    'no-unreachable': 'warn'
  }
};
