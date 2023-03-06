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
exports.auth = void 0;
const ws_1 = __importDefault(require("ws"));
const auth = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    const socket = new ws_1.default("wss://ws.xtb.com/demoStream");
    console.log("inside auth");
    socket.addEventListener("open", () => {
        console.log("inside open", userId, password);
        // Log in to the API
        socket.send(JSON.stringify({
            command: "login",
            arguments: {
                userId,
                password,
            },
        }));
    });
    let authorized = false;
    socket.addEventListener("message", ({ data }) => {
        const packet = JSON.parse(data);
        if (packet.status == true && packet.streamSessionId && !authorized) {
            console.log("auth", packet);
            authorized = true;
            //Pass socket to the function to allow it retrieve data from API
        }
        else if (packet.status == false) {
            console.log("error", data);
        }
    });
});
exports.auth = auth;
