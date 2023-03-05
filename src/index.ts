import express, { Request, Response } from "express";
import cron from "node-cron";
require("dotenv").config();
console.log("eloelo");
const app = express();
cron.schedule("*/15 * * * * *", function () {
  console.log("---------------------");
  console.log("running a task every 15 seconds");
});
app.get("/", (req: Request, res: Response) => {
  console.log("siemanko");
  res.send({ message: "siemanko" });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
});
