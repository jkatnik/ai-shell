"use strict";
exports.__esModule = true;
exports.ConfigStore = void 0;
var yaml = require("js-yaml");
var fs = require("fs");
var path = require("path");
var ConfigStore = /** @class */ (function () {
    function ConfigStore() {
        this.homeDir = path.resolve(process.env.HOME || process.env.USERPROFILE);
        var yamlString = fs.readFileSync("".concat(this.homeDir, "/.config/ai/config.yaml"), 'utf8');
        this.config = yaml.load(yamlString);
    }
    ConfigStore.prototype.useNextKey = function () {
        var index = this.config.apiKeys.indexOf(this.config.lastKeyUsed);
        var nextIndex = (index + 1) % this.config.apiKeys.length;
        this.config.lastKeyUsed = this.config.apiKeys[nextIndex];
        return this.config.apiKeys[nextIndex];
    };
    ConfigStore.prototype.save = function () {
        fs.writeFileSync("".concat(this.homeDir, "/.config/ai/config.yaml"), yaml.dump(this.config));
    };
    return ConfigStore;
}());
exports.ConfigStore = ConfigStore;
