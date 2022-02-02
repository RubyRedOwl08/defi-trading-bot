## Introduction

This is a mini DeFi trading Bot project on decentralized exchange operating on BSC chain.

Here is the article of why I set this up and steps of how to use it. [Article](https://)

---

## Stack architecture

I use Nest.js framework for Node.js server to connect to BSC chain by using library nestjs-ethers and using aws kms to manage wallet private key. You can use it easily by using the private key of the server directly (but I don’t recommend this way.) Please use PostgreSQL for collecting data, and use WardenSwap SDK for getting the token price via WardenSwap router contract for swapping token.

Please note that I’ll not demonstrate the AWS CLI, AWS KMS, PostgreSQL setting up process in this document.

## Prerequisites

Please make sure that Node.js >V14.0 is installed on your operating system.

## Installation

1. Install node module

```bash
$ yarn install
```

2. Create a `.env` file and use config file from`.env.sample`

3. Manage wallet private key<br>
   - **Option 1** <br>
   Use AWS KMS (Recommend)<br>
   I use kms (Key Management Service) for encrypting wallet private key and store cipher text base64<br>`WALLET_ENCRYPT_BASE64` in `.env` file
   when the server starts, the system uses cipher text base64 to decrypt the private key.<br><br>
   Ref.
   [https://medium.com/hackernoon/managing-encryption-keys-with-aws-kms-in-node-js-c320c860019a](https://medium.com/hackernoon/managing-encryption-keys-with-aws-kms-in-node-js-c320c860019a)
     - Step 1<br>
      Open `.env` file to set `USE_WALLET_TYPE=ENCRYPT_BASE64`, `AWS_KMS_KEY_ID`,`AWS_CREDENTIAL_PROFILE_NAME`, `WALLET_PRIVATE_KEY_FOR_ENCRYPTION`<br>
      For running script encryption, temporarily put wallet private key in this process.
     - Step 2<br>
         run `yarn encryptionPrivateKey` script. When encryption is done, search for `resultFromScripts/encryptData.txt` path folder. Input data with .env template. The key is  `WALLET_ENCRYPT_BASE64`<br>
     - Step 3<br>
         Remove key and value `WALLET_PRIVATE_KEY_FOR_ENCRYPTION`
   - **Option2**<br>
     Set `USE_WALLET_TYPE=PRIVATE_KEY` and WALLET_PRIVATE_KEY for instant use.


4. Create PostgreSQL database name `defi-trading-bot-manager`

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```
## ENV File

| Name                        | Description                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| USE_WALLET_TYPE             | Access wallet with private key or encryption data, You can choose to enter 2 values. `ENCRYPT_BASE64` or `PRIVATE_KEY` |
| WALLET_PRIVATE_KEY          | Private key of wallet                                                                                                  |
| WALLET_ENCRYPT_BASE64       | Encryption private key from aws kms                                                                                    |
| POSTGRES_HOST               |                                                                                                                        |
| POSTGRES_PORT               |                                                                                                                        |
| POSTGRES_USERNAME           |                                                                                                                        |
| POSTGRES_PASSWORD           |                                                                                                                        |
| POSTGRES_DATABASE           |                                                                                                                        |
| POSTGRES_AUTO_LOAD_ENTITIES |                                                                                                                        |
| POSTGRES_SYNCHRONIZE        |                                                                                                                        |
| AWS_CREDENTIAL_PROFILE_NAME | AWS CLI profile name                                                                                                   |
| AWS_KMS_KEY_ID              | AWS KMS keyid for encryption and decryption                                                                            |





## `POST` /orderbook

Create order book

| Name             | Type   | In   | Description                          |
| ---------------- | ------ | ---- | ------------------------------------ |
| srcTokenAddress  | string | body | Source token address to swap         |
| destTokenAddress | string | body | Destination token address to receive |
| srcAmount        | string | body | Amount of source token to swap       |
| orderType        | string | body | Order type you want open, You can choose to enter `MARKET`, `STOP_LIMIT`                                    |
| stopPrice        | string | body | The price in a stop order that triggers the creation of a market order                                     |

## `GET` /orderbook

| Name        | Type   | In    | Description |
| ----------- | ------ | ----- | ----------- |
| orderStatus | string | query |             |

## `GET` /orderbook/{orderId}

| Name    | Type   | In   | Description                     |
| ------- | ------ | ---- | ------------------------------- |
| orderId | string | path | Get orderbook data from orderId |

## `GET` /wardenswap/price-swap

| Name             | Type   | In    | Description                          |
| ---------------- | ------ | ----- | ------------------------------------ |
| srcTokenAddress  | string | query | Source token address to swap         |
| destTokenAddress | string | query | Destination token address to receive |
| srcAmount        | string | query | Amount of source token to swap       |

## `PATCH` /orderbook/{orderId}/cancel

| Name    | Type   | In   | Description               |
| ------- | ------ | ---- | ------------------------- |
| orderId | string | path | Cancle order form orderId |


## Security Vulnerabilities

If you discover a security vulnerability, please send us an e-mail at <ruby.red.owl.08@gmail.com>

## Special thanks

Pseudonym<br>
* [MagicDream](https://github.com/MagicDream01), article editor

## License

