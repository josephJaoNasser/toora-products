"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetchData_1 = require("./resources/fetchData");
var START_PAGE = 1;
var PAGE_SIZE = 100;
var OUTPUT_DIR = "export";
(0, fetchData_1.default)(START_PAGE, PAGE_SIZE, OUTPUT_DIR);
//# sourceMappingURL=index.js.map