import express, { Request, Response } from "express";
import cron from "node-cron";
require("dotenv").config();
console.log("eloelo");
const app = express();
cron.schedule("*/15 * * * * *", function () {
  console.log("---------------------");
  console.log("Running a cron job retrieving users");
});

app.get("/get-data", (req: Request, res: Response) => {
  //Retrieve data from the server

  res.send({ message: "siemanko" });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
  main();
});

const main = async () => {
  const numberOfTeams = Number(process.env.NUM);
  console.log("num of teams:", numberOfTeams);

  //sign in to all accounts
  for (let i = 1; i < numberOfTeams + 1; i++) {
    console.log(process.env[`XTB_USER_ID_${i}`]);
    console.log(process.env[`XTB_USER_PASSWORD_${i}`]);
    //pass credentials to the auth functions

    //get socket from each one and ask for data

    //save handle data and save to db
  }
};
