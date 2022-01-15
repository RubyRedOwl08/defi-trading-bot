module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    "@typescript-eslint/ban-ts-comment": "off",
    '@typescript-eslint/no-this-alias': ['off'],
    'generator-star-spacing': 'off',
    'semi': ["error", "never"],
    'no-prototype-builtins': 'off',
    'no-inferrable-types': 0,
    'no-fallthrough': 0,
    'no-useless-catch': 0,
    'no-unused-expressions': 0,
    'no-useless-return': 0,
    'no-irregular-whitespace': 0,
    'no-multi-str': 0
  },
};
