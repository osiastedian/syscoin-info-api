#!/bin/sh

CURRENT=$(curl --data-binary '{"jsonrpc":"1.0","method":"getblockchaininfo", "params": []}' http://syscoin:bVPjjYNqV1lnK8NxoK-hiPHNQLU8bhJgEfQ-DjLVcdU%3D@ec2-34-221-218-122.us-west-2.compute.amazonaws.com:8370 | jq '.result.headers')
LATEST=$(curl https://blockbook.elint.services/api/ | jq '.backend.headers')

test $CURRENT -eq $LATEST
exit $?
