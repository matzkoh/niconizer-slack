module.exports = {
  '*.{js,ts}': ['eslint --fix', 'git add'],
  '*.{json,md,yml}': ['prettier --write', 'git add'],
}
