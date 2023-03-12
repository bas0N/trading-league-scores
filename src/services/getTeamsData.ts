import { myCache } from "..";
import WebSocket from "ws";
import { waitForConnection } from "./waitForConnection";
import { auth } from "./auth";
export const retrieveTeamsData = async () => {
  const numberOfTeams = Number(process.env.NUM);

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
