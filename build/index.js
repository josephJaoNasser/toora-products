"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var params_1 = require("./params");
var fetchData_1 = require("./resources/fetchData");
var toptextToEcwidCsv_1 = require("./resources/toptextToEcwidCsv");
var START_PAGE = params_1.default.START_PAGE;
(0, fetchData_1.default)(START_PAGE).then(function () {
    (0, toptextToEcwidCsv_1.combineCsvs)();
});
//# sourceMappingURL=index.js.map