module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  proseWrap: 'always',
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
};
