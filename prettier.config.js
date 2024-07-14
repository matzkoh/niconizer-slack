/** @type {import('prettier').Options} */
export default {
  arrowParens: 'avoid',
  printWidth: 120,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',

  plugins: ['prettier-plugin-packagejson'],

  overrides: [
    {
      files: '*.{md,yaml,yml}',
      options: {
        printWidth: 80,
        semi: true,
        singleQuote: false,
        trailingComma: 'none',
      },
    },
  ],
}
