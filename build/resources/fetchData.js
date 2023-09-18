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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var toptextToEcwidCsv_1 = require("./toptextToEcwidCsv");
var credentials_1 = require("../credentials");
var apiUrl = "https://api.toptex.io/v3";
var config = {
    headers: {
        "x-api-key": credentials_1.default.apiKey,
    },
    timeout: 120000,
};
/**
 * authenticate the user to get the token for fetching
 */
function authenticate() {
    return __awaiter(this, void 0, void 0, function () {
        var payload, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Authenticating");
                    payload = {
                        username: credentials_1.default.username,
                        password: credentials_1.default.password,
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(apiUrl, "/authenticate"), payload, config)];
                case 1:
                    res = _a.sent();
                    config.headers["x-toptex-authorization"] = res.data.token;
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get single product
 * @param pageSize
 * @param pageNumber
 * @returns
 */
function getProduct(pageSize, pageNumber, totalPages) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var fetchFn, response, e_1, err, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("getting page " + pageNumber + " of " + totalPages);
                    fetchFn = function () {
                        return axios_1.default.get("".concat(apiUrl, "/products/all?usage_right=b2b_b2c&page_size=").concat(pageSize, "&page_number=").concat(pageNumber), config);
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 9]);
                    if (!!((_a = config.headers["x-toptex-authorization"]) === null || _a === void 0 ? void 0 : _a.length)) return [3 /*break*/, 3];
                    return [4 /*yield*/, authenticate()];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [4 /*yield*/, fetchFn()];
                case 4:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 5:
                    e_1 = _b.sent();
                    err = e_1;
                    if (!(err.status === 401)) return [3 /*break*/, 8];
                    return [4 /*yield*/, authenticate()];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, fetchFn()];
                case 7:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 8:
                    console.log(e_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all products and output as csv
 */
function getAndOutputAllProducts(startPage, pageSize, outputDir) {
    if (startPage === void 0) { startPage = 1; }
    if (pageSize === void 0) { pageSize = 100; }
    if (outputDir === void 0) { outputDir = "output"; }
    return __awaiter(this, void 0, void 0, function () {
        var PAGE_SIZE, START_PAGE, totalPages, firstResponse, _loop_1, i, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    PAGE_SIZE = pageSize;
                    START_PAGE = startPage;
                    totalPages = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, getProduct(PAGE_SIZE, START_PAGE)];
                case 2:
                    firstResponse = _a.sent();
                    console.log("outputting csv for page " + START_PAGE);
                    (0, toptextToEcwidCsv_1.default)(firstResponse, START_PAGE, outputDir);
                    totalPages = Math.ceil(firstResponse.total_count / PAGE_SIZE);
                    _loop_1 = function (i) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, getProduct(PAGE_SIZE, i, totalPages).then(function (res) {
                                        console.log("outputting csv for page " + i);
                                        (0, toptextToEcwidCsv_1.default)(res, i, outputDir);
                                    })];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = START_PAGE + 1;
                    _a.label = 3;
                case 3:
                    if (!(i <= totalPages)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(i)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.default = getAndOutputAllProducts;
//# sourceMappingURL=fetchData.js.map