"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = void 0;
var params_1 = require("../params");
var path = require("path");
var fs = require("fs");
function deleteAll() {
    var OUTPUT_FOLDER = params_1.default.OUTPUT_DIR;
    var START_PAGE = params_1.default.START_PAGE;
    var rootPath = path.resolve(__dirname, "../../");
    var outputFolder = path.join(rootPath, OUTPUT_FOLDER);
    var pagesFolder = path.join(outputFolder, "/pages");
    try {
        // Read the list of files in the directory
        var pagesFiles = fs.readdirSync(pagesFolder);
        var compiledFiles = fs.readdirSync(outputFolder);
        // Delete files in the pages folder
        for (var _i = 0, pagesFiles_1 = pagesFiles; _i < pagesFiles_1.length; _i++) {
            var file = pagesFiles_1[_i];
            var filePath = path.join(pagesFolder, file);
            var ext = path.extname(filePath);
            var filename = path.basename(filePath, ext);
            if (fs.statSync(filePath).isFile()) {
                var pageCount = +filename.split("-")[2];
                if (pageCount < START_PAGE) {
                    console.log("Skipped deleting file: ".concat(filename));
                    continue;
                }
                fs.unlinkSync(filePath); // Delete the file synchronously
                console.log("Deleted file: ".concat(filePath));
            }
        }
        // delete compiled
        for (var _a = 0, compiledFiles_1 = compiledFiles; _a < compiledFiles_1.length; _a++) {
            var file = compiledFiles_1[_a];
            var filePath = path.join(outputFolder, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                console.log("Deleted file: ".concat(filePath));
            }
        }
        console.log("All files deleted successfully.");
    }
    catch (err) {
        console.error("Error deleting files:", err);
    }
}
exports.deleteAll = deleteAll;
//# sourceMappingURL=fsUtils.js.map