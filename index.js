const SyscoinRpcClient = require("@syscoin/syscoin-js").SyscoinRpcClient;
const rpcServices = require("@syscoin/syscoin-js").rpcServices;

const client = new SyscoinRpcClient({
  host: process.env.SYSCOIN_CORE_RPC_HOST,
  rpcPort: process.env.SYSCOIN_CORE_RPC_PORT,
  password: process.env.SYSCOIN_CORE_RPC_PASSWORD,
  username: process.env.SYSCOIN_CORE_RPC_USERNAME,
});
const axios = require("axios");

const express = require("express");
const app = express();
const port = 3000;

const getSupply = async () => {
  // Get UTXO Coin Supply
  let supplyInfo = await rpcServices(client.callRpc).getTxOutSetInfo().call();
  let utxoSupply = supplyInfo.total_amount;
  console.log({ utxoSupply });

  let explorerData = await axios
    .get("https://explorer.syscoin.org/api?module=stats&action=coinsupply")
    .catch((err) => console.log(err));
  let nevmSupply = explorerData.data;
  console.log({ nevmSupply });
  // Get SYS NEVM Contract Supply
  let nevmAdd = await axios
    .get(
      "https://explorer.syscoin.org/api?module=account&action=balance&address=0xA738a563F9ecb55e0b2245D1e9E380f0fE455ea1"
    )
    .catch((err) => console.log(err));

  let nevmAddContractSupply = nevmAdd.data.result;

  console.log({ nevmAddContractSupply });

  let largeNumber = 1000000000000000000;
  let nevmAddContractFinal = nevmAddContractSupply / largeNumber;

  // Get total NEVM + UTXO Supply
  let cmcSupply = nevmSupply - nevmAddContractFinal + utxoSupply;
  return cmcSupply;
};

app.get("/totalsupply", async (req, res) => {
  const totalSupply = await getSupply();
  res.send(totalSupply);
});

app.get("/health", async (req, res) => {
  console.log("Health check", new Date());
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
