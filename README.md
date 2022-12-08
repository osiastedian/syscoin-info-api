# Syscoin Info API

## Description

This is a simple NodsJS Express server to fetch information on Syscoin.

## Endpoints

Host: https://info.syscoin.org/

### `GET /totalsupply`

- This returns total supply calculated on both UTXO and NEVM blockchain in plaintext.

### `GET /triggerRecordSupply`

- Normally total supply is calculated and recorded when new block hash is detected.
- This endpoints acts as manual trigger in calculation.

### `GET /health`

- This is a health check endpoint. Useful for monitoring if API is running.

## Syscoin Core (`/syscoin-core`)

- Dockerized version of the Syscoin Daemon
- JSON RPC is used by the API in retrieving UTXO supply

## API Environment Variables (Required\*)

- `SYSCOIN_CORE_RPC_HOST` ex. `localhost`
- `SYSCOIN_CORE_RPC_PORT` ex. `8370`
- `SYSCOIN_CORE_RPC_PASSWORD` - password for auth to RPC
- `SYSCOIN_CORE_RPC_USERNAME` - username for auth to RPC

You can generate password and username:

```bash
curl -sSL https://raw.githubusercontent.com/syscoin/syscoin/master/share/rpcauth/rpcauth.py | python - <username>
```

For more information you can check it here: https://github.com/syscoin/docker-syscoin-core#usage
