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
const node_cache_1 = __importDefault(require("node-cache"));
const areEnvCorrect_1 = require("./services/areEnvCorrect");
require("dotenv").config();
const myCache = new node_cache_1.default({ stdTTL: 100, checkperiod: 120 });
const app = (0, express_1.default)();
(0, areEnvCorrect_1.areEnvCorrect)();
const numberOfTeams = Number(process.env.NUM);
//Cron job
node_cron_1.default.schedule("*/20 * * * *", function () {
    console.log("---------------------");
    console.log("Running a cron job retrieving users");
});
//basic endpoint
app.get("/get-data", (req, res) => {
    const keys = myCache.keys();
    const values = [];
    for (const key of keys) {
        const value = myCache.get(key);
        values.push(value);
    }
    if (values.length == 0) {
        res.status(400).json({ message: "No values in cache yet." });
    }
    retrieveTeamsData();
    res.send(values);
});
app.get("/refresh-cache", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield retrieveTeamsData();
    res.send({ message: "refreshing" });
}));
app.get("/get-trades/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const socket = new ws_1.default("wss://ws.xtb.com/demo");
    let accountExists = false;
    for (let i = 1; i <= numberOfTeams; i++) {
        if (req.params.id == process.env[`XTB_USER_ID_${i}`]) {
            accountExists = true;
            const ssid = yield (0, auth_1.auth)(process.env[`XTB_USER_ID_${i}`], process.env[`XTB_USER_PASSWORD_${i}`], socket);
            console.log(ssid);
            yield waitForConnection(socket);
            console.log(Date.now());
            socket.send(JSON.stringify({
                command: "getTradesHistory",
                arguments: {
                    end: 0,
                    start: 0,
                },
            }));
            socket.addEventListener("message", ({ data }) => {
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
}));
app.listen(process.env.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Listening on port: ${process.env.PORT}`);
    yield retrieveTeamsData();
}));
const retrieveTeamsData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("num of teams:", numberOfTeams);
        let balances = [];
        //sign in to all accounts
        for (let i = 1; i <= numberOfTeams; i++) {
            const socket = new ws_1.default("wss://ws.xtb.com/demo");
            console.log(process.env[`XTB_USER_ID_${i}`]);
            //Loop through all users
            if (process.env[`XTB_USER_ID_${i}`] && process.env[`XTB_USER_ID_${i}`]) {
                //Retrieve sessionId
                const streamSessionId = yield (0, auth_1.auth)(process.env[`XTB_USER_ID_${i}`], process.env[`XTB_USER_PASSWORD_${i}`], socket);
                console.log(streamSessionId);
                //Wait for the stream socket to connect
                yield waitForConnection(socket);
                socket.send(JSON.stringify({
                    command: "getMarginLevel",
                }));
                socket.addEventListener("message", ({ data }) => {
                    const packet = JSON.parse(data);
                    console.log("packet", packet);
                    const balanceEntry = {
                        teamName: process.env[`TEAM_NAME_${i}`],
                        id: process.env[`XTB_USER_ID_${i}`],
                        returnData: packet.returnData,
                        time: new Date(),
                    };
                    balances.push(balanceEntry);
                    myCache.set(process.env[`TEAM_NAME_${i}`], balanceEntry);
                    // socket.send(
                    //   JSON.stringify({
                    //     command: "stopBalance",
                    //   })
                    // );
                    socket.close();
                });
            }
            else {
                console.log("Env credentials missing in iteration: ", i);
            }
        }
        setTimeout(() => {
            console.log(balances);
            console.log(myCache.keys());
        }, 6000);
        return;
    }
    catch (e) {
        console.log(e);
    }
});
function waitForConnection(webSocket) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            if (webSocket.readyState === ws_1.default.OPEN) {
                clearInterval(timer);
                console.log("connected!");
                resolve(null);
            }
        }, 1000);
    });
}
