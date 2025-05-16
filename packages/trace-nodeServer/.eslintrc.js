module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // 关闭require警告
    '@typescript-eslint/no-var-requires': 'off',
    'global-require': 'off',
  },
};
