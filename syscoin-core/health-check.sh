#!/bin/sh
FETCH_URI="http://$RPC_AUTH@localhost:8370"
CURRENT=$(curl --data-binary '{"jsonrpc":"1.0","method":"getblockchaininfo", "params": []}' $FETCH_URI | jq '.result.headers')
LATEST=$(curl https://blockbook.elint.services/api/ | jq '.backend.headers')

test $CURRENT -eq $LATEST
exit $?
