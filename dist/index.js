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
        while (_) try {
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
exports.getProjectName = exports.planet9Proxy = void 0;
var path = require("path");
var fs_1 = require("fs");
function planet9Proxy() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, configPath, config, _a, _b, obj, _c, cookie, server;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    cwd = process.cwd();
                    configPath = path.join(cwd, ".planet9", "config.json");
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(configPath)];
                case 1:
                    config = _b.apply(_a, [(_d.sent()).toString()]);
                    obj = {};
                    return [4 /*yield*/, getSession()];
                case 2:
                    _c = _d.sent(), cookie = _c.cookie, server = _c.url;
                    config.routes.forEach(function (route) {
                        obj[route.path] = {
                            target: server,
                            secure: false,
                            changeOrigin: true,
                            onProxyReq: function onProxyReq(proxyReq, req, res) {
                                if (route.sendCookie) {
                                    proxyReq.setHeader('cookie', cookie);
                                }
                            },
                            onProxyRes: function onProxyRes(proxyRes, req, res) {
                            },
                            onError: function onError(err, req, res) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var route;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                route = config.routes.find(function (r) { return r.path === req.url; });
                                                console.log("error", err);
                                                if (!route) return [3 /*break*/, 2];
                                                return [4 /*yield*/, writeError(req.url, err)];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2: return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        };
                    });
                    return [2 /*return*/, obj];
            }
        });
    });
}
exports.planet9Proxy = planet9Proxy;
function getProjectName() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var cwd, packagePath, pkg, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = process.cwd();
                    packagePath = path.join(cwd, "package.json");
                    return [4 /*yield*/, fs_1.promises.readFile(packagePath)];
                case 1:
                    pkg = _b.sent();
                    json = JSON.parse(pkg.toString());
                    if (!((_a = json === null || json === void 0 ? void 0 : json.planet9) === null || _a === void 0 ? void 0 : _a.projectName))
                        throw Error('Unable to read planet9.projectName from package.json');
                    return [2 /*return*/, json.planet9.projectName];
            }
        });
    });
}
exports.getProjectName = getProjectName;
var errorFile = path.join(process.cwd(), ".planet9", "routeErrors.json");
var errorHandlePromise = fs_1.promises.open(errorFile, 'w');
function writeError(url, error) {
    return __awaiter(this, void 0, void 0, function () {
        var errorFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, errorHandlePromise];
                case 1:
                    errorFile = _a.sent();
                    return [4 /*yield*/, errorFile.appendFile("{\"url\": \"" + url + "\", \"error\": \"" + error.message + "\"},\n")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getSession() {
    return __awaiter(this, void 0, void 0, function () {
        var storagePath, b64;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storagePath = "/tmp/ns-temp-storage";
                    return [4 /*yield*/, fs_1.promises.readFile(storagePath)];
                case 1:
                    b64 = _a.sent();
                    return [2 /*return*/, JSON.parse(b64.toString('ascii'))];
            }
        });
    });
}
