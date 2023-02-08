import fs from 'node:fs'
import lzstring from './vendor/lzstring.min'
import * as dotenv from 'dotenv'
import { Octokit } from '@octokit/rest'
import https from 'node:https'


const getNewChallenge = () => {

  const readmeContent = fs.readFileSync('./README.md', { encoding: 'utf-8' })
  const matches = readmeContent.match(/\d+-(easy|medium|hard|extreme){1}-[\w|-]+(?=\/README\.md)/g)!
  const originLevels = {
    easy: new Set<string>(),
    medium: new Set<string>(),
    hard: new Set<string>(),
    extreme: new Set<string>(),
  }
  matches.forEach(item =>
    originLevels[item.match(/easy|medium|hard|extreme/)![0] as keyof typeof originLevels]
      .add(item.match(/(easy|medium|hard|extreme){1}-[\w|-]+/)![0]),
  )


  const localLevels = {
    easy: fs.readdirSync('./src/easy').map(item => item.match(/(easy|medium|hard|extreme){1}-[\w|-]+/)![0]),
    medium: fs.readdirSync('./src/medium').map(item => item.match(/(easy|medium|hard|extreme){1}-[\w|-]+/)![0]),
    hard: fs.readdirSync('./src/hard').map(item => item.match(/(easy|medium|hard|extreme){1}-[\w|-]+/)![0]),
    extreme: fs.readdirSync('./src/extreme').map(item => item.match(/(easy|medium|hard|extreme){1}-[\w|-]+/)![0]),
  }

  const lacks = {
    easy: [ ...originLevels.easy ].filter(item => !localLevels.easy.includes(item)),
    medium: [ ...originLevels.medium ].filter(item => !localLevels.medium.includes(item)),
    hard: [ ...originLevels.hard ].filter(item => !localLevels.hard.includes(item)),
    extreme: [ ...originLevels.extreme ].filter(item => !localLevels.extreme.includes(item)),
  }


  console.log(
    'Total(origin): ', originLevels.easy.size + originLevels.medium.size + originLevels.hard.size + originLevels.extreme.size,
    ', Total(local): ', localLevels.easy.length + localLevels.medium.length + localLevels.hard.length + localLevels.extreme.length,
  )


  let writePath = ''
  let newChallengeWithoutNo = ''
  for (const key in lacks) {
    const challenges = lacks[key as keyof typeof originLevels]
    if (challenges.length) {
      const sorts = fs.readdirSync(`./src/${ key }`).sort((a, b) => +b.match(/\d+/)! - +a.match(/\d+/)!)
      const idx = sorts.length ? +sorts[0].match(/\d+/)! + 1 : 1
      // fs.writeFileSync(`./src/${ key }/${ idx }-${ challenges[0] }.ts`, '', { encoding: 'utf-8' })
      newChallengeWithoutNo = `${ challenges[0] }`
      writePath = `./src/${ key }/${ idx }-${ challenges[0] }.ts`
      console.log(`New ${ key } challenge`, challenges)
      console.log(`Successfully add ${ key } challenges: src/${ key }/${ idx }-${ challenges[0] }.ts`)
      break
    }
  }

  let originChallengeWithNo = ''
  matches.forEach(item => {
    if (item.includes(newChallengeWithoutNo)) {
      originChallengeWithNo = item
    }
  })
  return {
    writePath,
    originChallengeWithNo,
  }
}

const getTschUrl = (challenge: string) => {
  dotenv.config({ path: '.env.local' })
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  return octokit.repos.getReadmeInDirectory({
    owner: 'type-challenges',
    repo: 'type-challenges',
    dir: `questions/${ challenge }`,
  }).then(res => {
    const content = Buffer.from(res.data.content, 'base64').toString()
    return content.match(/https:\/\/tsch.js.org\/\d+\/play/)![0]
  })
}

const getTschUrlDecode = (url: string) =>
  new Promise<string>((resolve, reject) =>
    https.get(url, response => {
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

async function main() {
  const { writePath, originChallengeWithNo: challenge } = getNewChallenge()
  const tschUrl = await getTschUrl(challenge)
  const decode = await getTschUrlDecode(tschUrl)
  fs.writeFileSync(writePath, decode, { encoding: 'utf-8' })
}

try {
  void main()
} catch (error) {
  console.log(error)
}
