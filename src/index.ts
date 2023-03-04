import express, { Request, Response } from "express";

console.log("eloelo");
const app = express();
app.get("/", (req: Request, res: Response) => {
  console.log("siemanko");
  res.send({ message: "siemanko" });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
