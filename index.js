const SyscoinRpcClient = require("@syscoin/syscoin-js").SyscoinRpcClient;
const rpcServices = require("@syscoin/syscoin-js").rpcServices;

const client = new SyscoinRpcClient({
  host: process.env.SYSCOIN_CORE_RPC_HOST,
  rpcPort: process.env.SYSCOIN_CORE_RPC_PORT,
  password: process.env.SYSCOIN_CORE_RPC_PASSWORD,
  username: process.env.SYSCOIN_CORE_RPC_USERNAME,
  useSsl: true,
});
const axios = require("axios");

const express = require("express");
const app = express();
const port = 3000;

const getSupply = async () => {
  // Get UTXO Coin Supply
  let supplyInfo = await rpcServices(client.callRpc).getTxOutSetInfo().call();
  let utxoSupply = supplyInfo.total_amount;

  // Get SYSX Supply
  let sysAsset = `123456`;
  let assetInfo = await rpcServices(client.callRpc).assetInfo(sysAsset).call();
  let sysxSupply = assetInfo.total_supply;

  let explorerData = await axios
    .get("https://explorer.syscoin.org/api?module=stats&action=coinsupply")
    .catch((err) => console.log(err));
  let nevmSupply = explorerData.data;
  console.log({ nevmSupply, callRpc: client });

  // Get SYS NEVM Contract Supply
  let nevmAdd = await axios
    .get(
      "https://explorer.syscoin.org/api?module=account&action=balance&address=0xA738a563F9ecb55e0b2245D1e9E380f0fE455ea1"
    )
    .catch((err) => console.log(err));
  let nevmAddContractSupply = nevmAdd.data.result;
  let largeNumber = 1000000000000000000;
  let nevmAddContractFinal = nevmAddContractSupply / largeNumber;

  // Get total NEVM + UTXO Supply
  let cmcSupply = nevmSupply - nevmAddContractFinal + utxoSupply + sysxSupply;
  return cmcSupply;
};

app.get("/totalsupply", async (req, res) => {
  const totalSupply = await getSupply();
  res.send(totalSupply);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
