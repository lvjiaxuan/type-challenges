import { Octokit } from '@octokit/rest'
import { execSync } from 'node:child_process'
import core from '@actions/core'
import fsp from 'node:fs'

const octokit = new Octokit({ auth: process.env['TOKEN'] })

const main = async () => {

  const res = await octokit.rest.repos.getReadme({
    owner: 'type-challenges',
    repo: 'type-challenges',
    ref: 'main',
  })


  fsp.writeFileSync(
    'README.md',
    Buffer
      .from(res.data.content, 'base64')
      .toString()
      .replaceAll('./questions', 'https://github.com/type-challenges/type-challenges/blob/main/questions'),
    { encoding: 'utf-8' },
  )

  execSync('git add .')
  const gitStatus = execSync('git status').toString()
  if (!gitStatus.includes('working tree clean')) {
    execSync('git commit -m "docs: sync from org."')
    execSync('git push')
    core.notice('README.md updated.')
  } else {
    core.notice('README.md not updated.')
  }

  process.exit(0)
}

void main()
