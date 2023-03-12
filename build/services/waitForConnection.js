"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForConnection = void 0;
const ws_1 = __importDefault(require("ws"));
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
exports.waitForConnection = waitForConnection;
