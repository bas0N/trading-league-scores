import express, { Request, Response } from "express";
import cron from "node-cron";
import { auth } from "./services/auth";
import WebSocket from "ws";
import NodeCache from "node-cache";
require("dotenv").config();

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const app = express();
//Cron job
// cron.schedule("*/15 * * * * *", function () {
//   console.log("---------------------");
//   console.log("Running a cron job retrieving users");
// });

//basic endpoint
app.get("/get-data", (req: Request, res: Response) => {
  //Retrieve data from the server
  res.send({ message: "siemanko" });
});

app.listen(process.env.PORT, async () => {
  console.log(`Listening on port: ${process.env.PORT}`);
  await main();
});

const main = async () => {
  const numberOfTeams = Number(process.env.NUM);
  console.log("num of teams:", numberOfTeams);

  let balances: any = [];
  //sign in to all accounts
  for (let i = 1; i < numberOfTeams + 1; i++) {
    const socket = new WebSocket("wss://ws.xtb.com/demoStream");

    console.log(process.env[`XTB_USER_ID_${i}`]);

    //Loop through all users
    if (process.env[`XTB_USER_ID_${i}`] && process.env[`XTB_USER_ID_${i}`]) {
      //Retrieve sessionId
      const streamSessionId = await auth(
        process.env[`XTB_USER_ID_${i}`]!,
        process.env[`XTB_USER_PASSWORD_${i}`]!
      );
      console.log(streamSessionId);
      //Wait for the stream socket to connect
      await waitForConnection(socket);
      socket.send(
        JSON.stringify({
          command: "getBalance",
          streamSessionId,
        })
      );
      socket.addEventListener("message", ({ data }: { data: any }) => {
        const packet = JSON.parse(data);
        console.log(packet);
        const balanceEntry = {
          teamName: process.env[`TEAM_NAME_${i}`],
          id: process.env[`XTB_USER_ID_${i}`],
          balance: packet.data.balance,
          equity: packet.data.equity,
          time: new Date(),
        };
        balances.push(balanceEntry);

        myCache.set(process.env[`TEAM_NAME_${i}`]!, balanceEntry);
        socket.send(
          JSON.stringify({
            command: "stopBalance",
          })
        );
      });
    } else {
      console.log("Env credentials missing in iteration: ", i);
    }

    //pass credentials to the auth functions

    //get socket from each one and ask for data

    //save handle data and save to db
  }
  setTimeout(() => {
    console.log(balances);
    console.log(myCache.keys());
  }, 6000);
  return;
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
