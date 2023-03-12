import express, { Request, Response } from "express";
import cron from "node-cron";
import { auth } from "./services/auth";
import WebSocket from "ws";
import NodeCache from "node-cache";
import { areEnvCorrect } from "./services/areEnvCorrect";
require("dotenv").config();

export const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    // origin: ["http://localhost:3000", "https://trading-bot-leauge.netlify.app"],
  })
);
areEnvCorrect();
const numberOfTeams = Number(process.env.NUM);

//Cron job
cron.schedule("0 */2 * * *", function () {
  console.log("---------------------");
  console.log("Running a cron job retrieving users");
});

//basic endpoint
app.get("/get-data", (req: Request, res: Response) => {
  const keys = myCache.keys();
  const values = [];
  for (const key of keys) {
    const value = myCache.get(key);
    values.push(value);
  }
  if (values.length == 0) {
    res.status(400).json({ message: "No values in cache yet." });
  }
  res.send(values);
});

app.get("/refresh-cache", async (req: Request, res: Response) => {
  await retrieveTeamsData();
  res.send({ message: "refreshing" });
});

app.get("/get-trades/:id", async (req: Request, res: Response) => {
  const socket = new WebSocket("wss://ws.xtb.com/demo");
  let accountExists = false;
  for (let i = 1; i <= numberOfTeams; i++) {
    if (req.params.id == process.env[`XTB_USER_ID_${i}`]) {
      accountExists = true;
      const ssid = await auth(
        process.env[`XTB_USER_ID_${i}`]!,
        process.env[`XTB_USER_PASSWORD_${i}`]!,
        socket
      );
      console.log(ssid);
      await waitForConnection(socket);
      console.log(Date.now());
      socket.send(
        JSON.stringify({
          command: "getTradesHistory",
          arguments: {
            end: 0,
            start: 0,
          },
        })
      );
      socket.addEventListener("message", ({ data }: { data: any }) => {
        const packet = JSON.parse(data);
        console.log(packet);
        res.send(packet.returnData);
        socket.close();
      });
    }
  }
  if (!accountExists) {
    res.send({ message: "invalid id" });
  }
});

app.listen(process.env.PORT, async () => {
  console.log(`Listening on port: ${process.env.PORT}`);
  await retrieveTeamsData();
});

const retrieveTeamsData = async () => {
  try {
    console.log("num of teams:", numberOfTeams);

    let balances: any = [];
    //sign in to all accounts
    for (let i = 1; i <= numberOfTeams; i++) {
      const socket = new WebSocket("wss://ws.xtb.com/demo");

      console.log(process.env[`XTB_USER_ID_${i}`]);

      //Loop through all users
      if (process.env[`XTB_USER_ID_${i}`] && process.env[`XTB_USER_ID_${i}`]) {
        //Retrieve sessionId
        const streamSessionId = await auth(
          process.env[`XTB_USER_ID_${i}`]!,
          process.env[`XTB_USER_PASSWORD_${i}`]!,
          socket
        );
        console.log(streamSessionId);
        //Wait for the stream socket to connect
        await waitForConnection(socket);
        socket.send(
          JSON.stringify({
            command: "getMarginLevel",
          })
        );
        socket.addEventListener("message", ({ data }: { data: any }) => {
          const packet = JSON.parse(data);
          console.log("packet", packet);
          const balanceEntry = {
            teamName: process.env[`TEAM_NAME_${i}`],
            id: process.env[`XTB_USER_ID_${i}`],
            returnData: packet.returnData,
            time: new Date(),
          };
          balances.push(balanceEntry);

          myCache.set(process.env[`TEAM_NAME_${i}`]!, balanceEntry);
          // socket.send(
          //   JSON.stringify({
          //     command: "stopBalance",
          //   })
          // );
          socket.close();
        });
      } else {
        console.log("Env credentials missing in iteration: ", i);
      }
    }
    setTimeout(() => {
      console.log(balances);
      console.log(myCache.keys());
    }, 6000);
    return;
  } catch (e) {
    console.log(e);
  }
};
function waitForConnection(webSocket: WebSocket) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (webSocket.readyState === WebSocket.OPEN) {
        clearInterval(timer);
        console.log("connected!");
        resolve(null);
      }
    }, 1000);
  });
}
