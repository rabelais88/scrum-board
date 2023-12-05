module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'react/button-has-type': 0,
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 1,
    '@typescript-eslint/no-unused-vars': 1,
    'prettier/prettier': 0,
    'import/prefer-default-export': 0,
    'react/function-component-definition': 0,
    'no-undef': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'consistent-return': 0,
    'jsx-a11y/control-has-associated-label': 1,
    'import/order': 1,
    'react-hooks/exhaustive-deps': 1,
    'jsx-a11y/label-has-associated-control': 1,
    'react/no-array-index-key': 1,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
