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
Object.defineProperty(exports, "__esModule", { value: true });
exports.areEnvCorrect = void 0;
const areEnvCorrect = () => __awaiter(void 0, void 0, void 0, function* () {
    let correct = true;
    if (!process.env.NUM) {
        console.log("The number of teams is not defined.");
        correct = false;
        throw new Error("NUM env is missing");
    }
    for (let i = 1; i < Number(process.env.NUM) + 1; i++) {
        if (!process.env[`XTB_USER_ID_${i}`] ||
            !process.env[`XTB_USER_PASSWORD_${i}`]) {
            throw new Error(`ENVS for user with id ${i} are missing.`);
        }
    }
});
exports.areEnvCorrect = areEnvCorrect;
