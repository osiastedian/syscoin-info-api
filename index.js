require("dotenv").config();
const SyscoinRpcClient = require("@syscoin/syscoin-js").SyscoinRpcClient;
const rpcServices = require("@syscoin/syscoin-js").rpcServices;

const client = new SyscoinRpcClient({
  host: process.env.SYSCOIN_CORE_RPC_HOST,
  rpcPort: process.env.SYSCOIN_CORE_RPC_PORT,
  password: process.env.SYSCOIN_CORE_RPC_PASSWORD,
  username: process.env.SYSCOIN_CORE_RPC_USERNAME,
});

const fetch = require("node-fetch");
const express = require("express");
const app = express();
const port = 3000;

const getSupply = async () => {
  const [supplyInfo, explorerData, nevmAdd] = await Promise.all([
    rpcServices(client.callRpc).getTxOutSetInfo().call(),
    fetch(
      "https://explorer.syscoin.org/api?module=stats&action=coinsupply"
    ).then((resp) => resp.json()),
    fetch(
      "https://explorer.syscoin.org/api?module=account&action=balance&address=0xA738a563F9ecb55e0b2245D1e9E380f0fE455ea1"
    ).then((resp) => resp.json()),
  ]);
  const utxoSupply = supplyInfo.total_amount;
  const nevmSupply = explorerData;
  const nevmAddContractSupply = nevmAdd.result;
  const largeNumber = 1000000000000000000;
  const nevmContract = nevmAddContractSupply / largeNumber;

  console.log({ utxoSupply, nevmSupply, nevmContract });
  const cmcSupply = nevmSupply - nevmContract + utxoSupply;
  return cmcSupply;
};

app.get("/totalsupply", async (req, res) => {
  try {
    const totalSupply = await getSupply();
    res.set("Content-Type", "text/html");
    res.status(200).send(`${totalSupply}`);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get("/health", async (req, res) => {
  console.log("Health check", new Date());
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Syscoin Info app listening on port ${port}`);
});
