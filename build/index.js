"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compileData_1 = require("./resources/compileData");
var fetchData_1 = require("./resources/fetchData");
(0, fetchData_1.default)().then(function () {
    (0, compileData_1.default)();
});
//# sourceMappingURL=index.js.map