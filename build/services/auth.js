"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
// const auth = async (userId: string, password: string) => {
const auth = (userId, password, socket) => {
    return new Promise((resolve, reject) => {
        //const socket = new WebSocket("wss://ws.xtb.com/demo");
        socket.addEventListener("open", () => {
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
                resolve(packet.streamSessionId);
                //Pass socket to the function to allow it retrieve data from API
            }
            else if (packet.status == false) {
                console.log("error", data);
                resolve("error");
            }
        });
    });
};
exports.auth = auth;
