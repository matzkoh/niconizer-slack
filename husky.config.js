const autoInstall = 'git diff "HEAD@{1}" --name-only | grep -Eq "^package(-lock)?\\.json$" && npm install'

export default {
  hooks: {
    'pre-commit': 'lint-staged',
    'post-merge': autoInstall,
    'post-rebase': autoInstall,
  },
}
