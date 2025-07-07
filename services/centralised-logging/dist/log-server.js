"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/log', (req, res) => {
    console.log('Received log:', req.body);
    res.sendStatus(200);
});
app.listen(4000, () => console.log('Log server listening on port 4000'));
