import dotenv from 'dotenv'
import aws, { SharedIniFileCredentials } from 'aws-sdk'
import path from 'path'
import fs from 'fs'

const envPath = path.join(__dirname, `../.env`)
dotenv.config({ path: envPath })

const kms = new aws.KMS({
  region: 'ap-southeast-1',
  credentials: new SharedIniFileCredentials({
    profile: 'defi-trading-bot'
  })
})

function encrypt(buffer) {
  return new Promise((resolve, reject) => {
    const params = {
      KeyId: process.env.AWS_KMS_KEY_ID,
      Plaintext: buffer
    }
    kms.encrypt(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.CiphertextBlob)
      }
    })
  })
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

;(async () => {
  console.log('Start process encryption private key')
  const data = await encrypt(process.env.WALLET_PRIVATE_KEY)
  const dataHex = (data as Buffer).toString('base64')

  const exportDataFilePath = path.join(__dirname, '../resultFromScripts/encryptData.txt')
  ensureDirectoryExistence(exportDataFilePath)
  fs.writeFileSync(path.join(__dirname, '../resultFromScripts/encryptData.txt'), dataHex)
  console.log('End process encrypt private key')
})()
