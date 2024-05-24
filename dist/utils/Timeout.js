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
exports.withTimeout = void 0;
function withTimeout(transaction, timeoutMs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!timeoutMs)
            return transaction();
        return Promise.race([
            transaction(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), timeoutMs))
        ]);
    });
}
exports.withTimeout = withTimeout;
