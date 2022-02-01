## Introduction

This is simple project bot for swap cryptocurrency on decentralized exchange on binance smart chain

You can read my article for reason [Aricle](https://)

## Prerequisites

Please make sure that Node.js >V14.0 is installed on your operating system.
And TODO:

## Installation

1. Install node module

```bash
$ yarn install
```

2. Create a `.env` file and use config file from `.env.sample`

| Key Name                          | Description |
| --------------------------------- | ----------- |
| USE_WALLET_TYPE                   |
WALLET_PRIVATE_KEY
WALLET_ENCRYPT_BASE64
| WALLET_PRIVATE_KEY_FOR_ENCRYPTION |
| AWS_CREDENTIAL_PROFILE_NAME
|AWS_KMS_KEY_ID
|POSTGRES_HOST
|POSTGRES_PORT
|POSTGRES_USERNAME
|POSTGRES_PASSWORD
|POSTGRES_DATABASE
|POSTGRES_AUTO_LOAD_ENTITIES
|POSTGRES_SYNCHRONIZE
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

| Name                        | Description                                 |
| --------------------------- | ------------------------------------------- |
| USE_WALLET_TYPE             |                                             |
| WALLET_PRIVATE_KEY          | Private key of wallet                       |
| WALLET_ENCRYPT_BASE64       | Encryption private key from aws kms         |
| POSTGRES_HOST               |                                             |
| POSTGRES_PORT               |                                             |
| POSTGRES_USERNAME           |                                             |
| POSTGRES_PASSWORD           |                                             |
| POSTGRES_DATABASE           |                                             |
| POSTGRES_AUTO_LOAD_ENTITIES |                                             |
| POSTGRES_SYNCHRONIZE        |                                             |
| AWS_CREDENTIAL_PROFILE_NAME | AWS CLI profile name                        |
| AWS_KMS_KEY_ID              | AWS KMS keyid for encryption and decryption |

## POST /orderbook

Crarte order book

| Name             | Type   | In   | Description                          |
| ---------------- | ------ | ---- | ------------------------------------ |
| srcTokenAddress  | string | body | Source token address to swap         |
| destTokenAddress | string | body | Destination token address to receive |
| srcAmount        | string | body | Amount of source token to swap       |
| orderType        | string | body |                                      |
| stopPrice        | string | body |                                      |

## GET /orderbook

| Name        | Type   | In    | Description |
| ----------- | ------ | ----- | ----------- |
| orderStatus | string | query |             |

## GET /orderbook/{orderId}

| Name    | Type   | In   | Description                     |
| ------- | ------ | ---- | ------------------------------- |
| orderId | string | path | Get orderbook data from orderId |

## GET /wardenswap/price-swap

| Name             | Type   | In    | Description                          |
| ---------------- | ------ | ----- | ------------------------------------ |
| srcTokenAddress  | string | query | Source token address to swap         |
| destTokenAddress | string | query | Destination token address to receive |
| srcAmount        | string | query | Amount of source token to swap       |

## PATCH /orderbook/{orderId}/cancel

| Name    | Type   | In   | Description               |
| ------- | ------ | ---- | ------------------------- |
| orderId | string | path | Cancle order form orderId |

```diff
- test
+ test2
```

## License

Nest is [MIT licensed](LICENSE).
