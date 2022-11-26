module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
		"jest/globals": true, // https://stackoverflow.com/a/40265356
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
		"no-use-before-define": ["error", {"functions": false }],
  },
};
