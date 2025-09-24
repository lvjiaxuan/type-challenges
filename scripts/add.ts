import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import https from 'node:https'
import process from 'node:process'
import core from '@actions/core'
import { Octokit } from '@octokit/rest'
import lzstring from './vendor/lzstring.min'

type ChallengeLevel = 'easy' | 'medium' | 'hard' | 'extreme'

export function getNewChallenges() {
  const orgReadme = fs.readFileSync('./README.org.md', { encoding: 'utf-8' })

  const orgMatches = [...orgReadme.matchAll(/questions\/(\d+)-(easy|medium|hard|extreme)-([\w-]+)/g)]

  const groupByLevel = Object.groupBy(orgMatches, item => item[2])

  const orgChallenges: Record<ChallengeLevel, Set<string>> = {
    easy: new Set<string>(),
    medium: new Set<string>(),
    hard: new Set<string>(),
    extreme: new Set<string>(),
  }

  for (const level in orgChallenges) {
    const typeLevel = level as ChallengeLevel
    orgChallenges[typeLevel] = new Set(groupByLevel[typeLevel]?.flatMap(item => item[3]))
  }

  const localChallenges: Record<ChallengeLevel, Set<string>> = {
    easy: new Set<string>(),
    medium: new Set<string>(),
    hard: new Set<string>(),
    extreme: new Set<string>(),
  }

  ;['easy', 'medium', 'hard', 'extreme'].forEach((level) => {
    const typeLevel = level as ChallengeLevel
    localChallenges[typeLevel] = new Set(fs.readdirSync(`./src/${level}`).map(item => item.match(new RegExp(`${level}-([\\w-]+)`))![1]))
  })

  core.notice(`Total: origin-${orgChallenges.easy.size + orgChallenges.medium.size + orgChallenges.hard.size + orgChallenges.extreme.size}, local-${localChallenges.easy.size + localChallenges.medium.size + localChallenges.hard.size + localChallenges.extreme.size}`)

  const newChallenges = {
    easy: [...orgChallenges.easy].filter(item => !localChallenges.easy.has(item)),
    medium: [...orgChallenges.medium].filter(item => !localChallenges.medium.has(item)),
    hard: [...orgChallenges.hard].filter(item => !localChallenges.hard.has(item)),
    extreme: [...orgChallenges.extreme].filter(item => !localChallenges.extreme.has(item)),
  }

  core.notice(`New challenges found:
- easy: ${newChallenges.easy},
- medium: ${newChallenges.medium},
- hard: ${newChallenges.hard},
- extreme: ${newChallenges.extreme}`)

  const result: { writePath: string, name4Tsch: string }[] = []

  for (const level in newChallenges) {
    const challenges = newChallenges[level as ChallengeLevel]

    if (challenges.length) {
      const sorted = fs.readdirSync(`./src/${level}`).sort((a, b) => +b.match(/\d+/)! - +a.match(/\d+/)!)
      let newIdx = sorted.length ? +sorted[0].match(/\d+/)! + 1 : 1

      challenges.forEach((name) => {
        const writePath = `./src/${level}/${newIdx}-${level}-${name}.ts`
        const findTheNo = orgMatches.find(i => i[3] === name)!
        result.push({ writePath, name4Tsch: `${findTheNo[1]}-${level}-${name}` })
        newIdx++
      })
    }
  }

  if (result.length === 0) {
    core.notice('No new challenge.')
    process.exit(0)
  }

  return result
}

function getTschUrl(challenge: string) {
  // @ts-expect-error honor eslint
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  return octokit.repos.getReadmeInDirectory({
    owner: 'type-challenges',
    repo: 'type-challenges',
    dir: `questions/${challenge}`,
  }).then((res) => {
    const content = Buffer.from(res.data.content, 'base64').toString()
    return content.match(/https:\/\/tsch.js.org\/\d+\/play/)![0]
  })
}

function getTschUrlDecode(url: string) {
  return new Promise<string>((resolve, reject) =>
    https.get(url, (response) => {
      let tspUrl = ''

      // called when a data chunk is received.
      response.on('data', chunk => tspUrl += chunk)

      // called when the complete response is received.
      response.on('end', () => {
        const encode = tspUrl.split('#code/')[1]
        resolve(lzstring.decompressFromEncodedURIComponent(encode) || lzstring.decompressFromEncodedURIComponent(decodeURIComponent(encode)))
      })

      response.on('error', reject)
    }))
}

function commit(writePath: string, decode: string) {
  fs.writeFileSync(writePath, decode, { encoding: 'utf-8' })
  execSync('git add .')
  execSync('git commit -m "chore: add new challenge(s)."')
  execSync('git push')
  core.notice(`Successfully added: ${writePath}`)
}

async function main() {
  const challenges = getNewChallenges()
  for (const { writePath, name4Tsch: challenge } of challenges) {
    const tschUrl = await getTschUrl(challenge)
    const decode = await getTschUrlDecode(tschUrl)
    commit(writePath, decode)
  }
}

try {
  void main()
}
catch (error: any) {
  core.error(error.message)
}
