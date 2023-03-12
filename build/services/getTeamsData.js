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
exports.retrieveTeamsData = void 0;
const __1 = require("..");
const ws_1 = __importDefault(require("ws"));
const waitForConnection_1 = require("./waitForConnection");
const auth_1 = require("./auth");
const retrieveTeamsData = () => __awaiter(void 0, void 0, void 0, function* () {
    const numberOfTeams = Number(process.env.NUM);
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
                yield (0, waitForConnection_1.waitForConnection)(socket);
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
                    __1.myCache.set(process.env[`TEAM_NAME_${i}`], balanceEntry);
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
            console.log(__1.myCache.keys());
        }, 6000);
        return;
    }
    catch (e) {
        console.log(e);
    }
});
exports.retrieveTeamsData = retrieveTeamsData;
