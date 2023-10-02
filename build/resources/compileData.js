"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var params_1 = require("../params");
var toptextToEcwidCsv_1 = require("./toptextToEcwidCsv");
var path = require("path");
var fs = require("fs");
var OUTPUT_FOLDER = params_1.default.OUTPUT_DIR;
var rootPath = path.resolve(__dirname, "../../");
var outputFolder = path.join(rootPath, OUTPUT_FOLDER);
var pagesFolder = path.join(outputFolder, "/pages");
/**
 * @param pageNumber
 * @returns
 */
function getPageFilePath(pageNumber) {
    return path.join(pagesFolder, "data-page-".concat(pageNumber, ".json"));
}
/**
 *
 * @param start
 * @param end
 * @returns
 */
function getOutputBatchPath(start, end) {
    var outputPathJSON = path.join(outputFolder, "data-compiled-".concat(start, "-").concat(end, ".json"));
    var outputPathCsv = path.join(outputFolder, "data-compiled-".concat(start, "-").concat(end, ".csv"));
    return {
        json: outputPathJSON,
        csv: outputPathCsv,
    };
}
/**
 * @returns
 */
function getFileList() {
    var start = params_1.default.COMPILE_START_PAGE;
    var fileList = [];
    while (fs.existsSync(getPageFilePath(start))) {
        fileList.push(getPageFilePath(start));
        start += 1;
    }
    return fileList;
}
/**
 * Output json file
 */
function compileToJSON() {
    var fileList = getFileList();
    var outputBatchPath = getOutputBatchPath(params_1.default.COMPILE_START_PAGE, params_1.default.COMPILE_START_PAGE + fileList.length - 1);
    for (var i = params_1.default.COMPILE_START_PAGE - 1; i < fileList.length; i++) {
        console.log("compiling data-page-".concat(i + 1, ".json"));
        var dataPageFile = fileList[i];
        var pageContent = fs.readFileSync(dataPageFile, "utf8");
        var content = i === params_1.default.COMPILE_START_PAGE - 1 ? "[" : "";
        content += pageContent.substring(1, pageContent.length - 1);
        if (i < fileList.length - 1) {
            content += ",";
        }
        if (fs.existsSync(outputBatchPath.json)) {
            fs.appendFileSync(outputBatchPath.json, content, "utf8");
            continue;
        }
        fs.writeFileSync(outputBatchPath.json, content, { encoding: "utf8" });
    }
    fs.appendFileSync(outputBatchPath.json, "]", "utf8");
}
/**
 * Get the compiled json data and convert into csv
 */
function compiledJsonToCsv() {
    var fileList = getFileList();
    var outputBatchPath = getOutputBatchPath(params_1.default.COMPILE_START_PAGE, params_1.default.COMPILE_START_PAGE + fileList.length - 1);
    if (!fs.existsSync(outputBatchPath.json))
        throw new Error("Compile into JSON first");
    var compiledJsonContent = fs.readFileSync(outputBatchPath.json, "utf8");
    var compiledJson = JSON.parse(compiledJsonContent);
    var convertedData = (0, toptextToEcwidCsv_1.convertToCsv)(compiledJson);
    fs.writeFileSync(outputBatchPath.csv, convertedData, { encoding: "utf8" });
}
function compileData() {
    try {
        compileToJSON();
        compiledJsonToCsv();
        console.log("data compiled");
    }
    catch (e) {
        console.log(e);
    }
}
exports.default = compileData;
//# sourceMappingURL=compileData.js.map