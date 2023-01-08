#!/usr/bin/env node
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var chalk_1 = require("chalk");
var configStore_1 = require("./configStore");
var oai = require("openai");
var child_process_1 = require("child_process");
var select_1 = require("@inquirer/select");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var configStore, oaiConfig, openAi, userInput, completion, command, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promptExample();
                    configStore = new configStore_1.ConfigStore();
                    oaiConfig = new oai.Configuration({
                        apiKey: configStore.useNextKey()
                    });
                    openAi = new oai.OpenAIApi(oaiConfig);
                    userInput = getCmdLineInput();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openAi.createCompletion({
                            model: "text-davinci-003",
                            prompt: "Write single bash command. Nothing else! ".concat(userInput)
                        })];
                case 2:
                    completion = _a.sent();
                    command = completion.data.choices[0].text.trim();
                    execute(command);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (error_1.response) {
                        console.log(error_1.response.status);
                        console.log(error_1.response.data);
                    }
                    else {
                        console.log(error_1.message);
                    }
                    return [3 /*break*/, 4];
                case 4:
                    configStore.save();
                    return [2 /*return*/];
            }
        });
    });
}
function getCmdLineInput() {
    var args = process.argv;
    args.shift(); // firts is path to nodejs
    args.shift(); // second is path to the script
    return args.join(' ');
}
function debug(text) {
    console.debug(text);
}
function execute(command) {
    debug(command);
    (0, child_process_1.exec)(command, function (err, stdout, stderr) {
        if (err) {
            console.log("> ".concat(command));
            console.log(chalk_1["default"].red.bold(stderr));
        }
        else {
            console.log(stdout);
        }
    });
}
function promptExample() {
    return __awaiter(this, void 0, void 0, function () {
        var answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, select_1["default"])({
                        message: 'Select a package manager',
                        choices: [
                            {
                                name: 'npm',
                                value: 'npm',
                                description: 'npm is the most popular package manager'
                            },
                            {
                                name: 'yarn',
                                value: 'yarn',
                                description: 'yarn is an awesome package manager'
                            },
                            {
                                name: 'jspm',
                                value: 'jspm',
                                disabled: true
                            },
                        ]
                    })];
                case 1:
                    answer = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run();
