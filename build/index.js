"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const auth_1 = require("./services/auth");
const ws_1 = __importDefault(require("ws"));
require("dotenv").config();
const app = (0, express_1.default)();
//Cron job
node_cron_1.default.schedule("*/15 * * * * *", function () {
    console.log("---------------------");
    console.log("Running a cron job retrieving users");
});
//basic endpoint
app.get("/get-data", (req, res) => {
    //Retrieve data from the server
    res.send({ message: "siemanko" });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
    main();
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const numberOfTeams = Number(process.env.NUM);
    console.log("num of teams:", numberOfTeams);
    //sign in to all accounts
    for (let i = 1; i < numberOfTeams + 1; i++) {
        const socket = new ws_1.default("wss://ws.xtb.com/demoStream");
        console.log(process.env[`XTB_USER_ID_${i}`]);
        console.log(process.env[`XTB_USER_PASSWORD_${i}`]);
        if (process.env[`XTB_USER_ID_${i}`] && process.env[`XTB_USER_ID_${i}`]) {
            yield (0, auth_1.auth)(process.env[`XTB_USER_ID_${i}`], process.env[`XTB_USER_PASSWORD_${i}`], socket);
            console.log("after auth");
            // socket.send(
            //   JSON.stringify({
            //     command: "login",
            //     streamSessionId:
            //       "5cf3fcfffe781238-0000180c-0121cebf-8211b4b0416e2ae5-17f6e95f",
            //   })
            // );
        }
        else {
            console.log("Env credentials missing");
        }
        //pass credentials to the auth functions
        //get socket from each one and ask for data
        //save handle data and save to db
    }
});
