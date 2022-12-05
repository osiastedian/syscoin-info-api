require("dotenv").config();
const SyscoinRpcClient = require("@syscoin/syscoin-js").SyscoinRpcClient;
const rpcServices = require("@syscoin/syscoin-js").rpcServices;
const WebsocketClient = require("websocket").client;
const wsClient = new WebsocketClient({});

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

const SUBSCRIBE_BLOCK_MESSAGE_ID = "2";

let lastRecordedTotalSupply = {
  value: undefined,
  recordedAt: undefined,
};

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

const recordTotalSupply = () => {
  return getSupply().then((supply) => {
    lastRecordedTotalSupply.value = supply;
    lastRecordedTotalSupply.recordedAt = new Date().toUTCString();
    return lastRecordedTotalSupply;
  });
};

app.get("/totalsupply", async (req, res) => {
  try {
    res.set("Content-Type", "text/html");
    res.status(200).send(`${lastRecordedTotalSupply.value ?? 0}`);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get("/triggerRecordSupply", async (req, res) => {
  const newRecordedSupply = await recordTotalSupply();
  res.status(200).send(JSON.stringify(newRecordedSupply));
});

app.get("/health", async (req, res) => {
  console.log("Health check", new Date());
  res.send("OK");
});

const handleSocketMessage = (message) => {
  console.log("Websocket Message", { message });
  switch (message.id) {
    case SUBSCRIBE_BLOCK_MESSAGE_ID:
      {
        recordTotalSupply().then((newTotalSupply) => {
          console.log({ newTotalSupply, ...message.data });
        });
      }
      break;
  }
};

const runNewBlockSubscription = () => {
  wsClient.on("connectFailed", () => {
    console.log("Websocket connection failed");
  });

  wsClient.on("connect", (connection) => {
    console.log("Websocket connection established");

    connection.on("message", (message) => {
      if (message.type === "utf8") {
        const messageJson = JSON.parse(message.utf8Data);
        handleSocketMessage(messageJson);
      }
      return false;
    });
    connection.on("close", (close) => {
      console.log("Websocket connection closed", close);
    });

    connection.on("error", (error) => {
      console.log("Websocket connection error", { error });
    });

    setTimeout(() => {
      connection.send(
        JSON.stringify({ id: "1", method: "getInfo", params: {} })
      );

      connection.send(
        JSON.stringify({ id: "2", method: "subscribeNewBlock", params: {} })
      );
      let pingCount = 0;
      setInterval(() => {
        connection.send(
          JSON.stringify({
            id: `${3 + pingCount++}`,
            method: "ping",
            params: {},
          })
        );
      }, 1000);
    }, 3000);
  });
  wsClient.connect("wss://blockbook.elint.services/websocket");
};

app.listen(port, () => {
  console.log(`Syscoin Info app listening on port ${port}`);
  runNewBlockSubscription();
  recordTotalSupply();
});

process.on("SIGTERM", () => {
  rpcServices(client.callRpc)
    .stop()
    .then(() => {
      console.log("Syscoin Server Stopped");
    });
});
