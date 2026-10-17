export const repos = ['acme/awesome-cli', 'acme/web-app', 'acme/docs-site']

export const prs = [
  {
    id: 214, title: 'Speed up install with setup helper', author: 'newdev42', level: 'High', score: 82, files: 4, age: '2d',
    explanation: 'This change touches an install hook and adds a network call to a fixed address. Both are worth a closer look before merging.',
    findings: [
      { file: 'package.json', lines: '12-14', reason: 'Install hook (postinstall) was added', weight: 30 },
      { file: 'src/utils/sync.js', lines: '8-9', reason: 'New outbound network call to a hard-coded IP address', weight: 25 },
      { file: 'src/utils/sync.js', lines: '15', reason: 'Reads environment variables (process.env)', weight: 15 },
    ],
    trust: ['Account age: 6 days', 'PR description partly matches the change'],
  },
  {
    id: 209, title: 'Add telemetry for usage stats', author: 'codefox', level: 'Medium', score: 54, files: 2, age: '3d',
    explanation: 'A new dependency and a new URL were added. This may be intentional, so a quick check of the package and endpoint is suggested.',
    findings: [
      { file: 'package.json', lines: '22', reason: 'New dependency added: stats-lite', weight: 20 },
      { file: 'src/telemetry.js', lines: '5', reason: 'Hard-coded URL added', weight: 15 },
    ],
    trust: ['Account age: 8 months', 'Public activity: 14 repos'],
  },
  {
    id: 212, title: 'Minified helper added to assets', author: 'jsmith', level: 'Medium', score: 48, files: 1, age: '1d',
    explanation: 'A minified file was added, which is hard to review by eye. Worth checking where it came from.',
    findings: [{ file: 'assets/helper.min.js', lines: '1-1', reason: 'Minified file added to the repository', weight: 25 }],
    trust: ['Account age: 2 years'],
  },
  {
    id: 217, title: 'Fix typo in README', author: 'mira_k', level: 'Low', score: 6, files: 1, age: '5h',
    explanation: 'Small documentation change with no code findings.',
    findings: [],
    trust: ['Account age: 3 days (context only)', 'PR description matches the change'],
  },
  {
    id: 216, title: 'Add dark mode toggle', author: 'priya_dev', level: 'Low', score: 12, files: 3, age: '1d',
    explanation: 'UI changes that match the PR description. No risky patterns found.',
    findings: [],
    trust: ['Account age: 1 year', 'Has opened an issue in this project before'],
  },
  {
    id: 218, title: 'Update contributing guide', author: 'sam_writes', level: 'Low', score: 4, files: 1, age: '2h',
    explanation: 'Documentation only. Nothing to flag.',
    findings: [],
    trust: ['Account age: 5 months'],
  },
]
