import params from "../params";
import { deleteCompiled } from "./fsUtils";
import { EcwidProduct, convertToCsv } from "./toptextToEcwidCsv";
const path = require("path");
const fs = require("fs");

const OUTPUT_FOLDER = params.OUTPUT_DIR;
const rootPath = path.resolve(__dirname, "../../");
const outputFolder = path.join(rootPath, OUTPUT_FOLDER);
const pagesFolder = path.join(outputFolder, "/pages");

/**
 * @param pageNumber
 * @returns
 */
function getPageFilePath(pageNumber: number) {
  return path.join(pagesFolder, `data-page-${pageNumber}.json`);
}

/**
 *
 * @param start
 * @param end
 * @returns
 */
function getOutputBatchPath(start: number, end: number) {
  const outputPathJSON = path.join(
    outputFolder,
    `data-compiled-${start}-${end}.json`
  );
  const outputPathCsv = path.join(
    outputFolder,
    `data-compiled-${start}-${end}.csv`
  );

  return {
    json: outputPathJSON,
    csv: outputPathCsv,
  };
}

/**
 * @returns
 */
function getFileList() {
  let start = params.COMPILE_START_PAGE;
  const fileList = [];

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
  const fileList = getFileList();
  const outputBatchPath = getOutputBatchPath(
    params.COMPILE_START_PAGE,
    params.COMPILE_START_PAGE + fileList.length - 1
  );

  for (let i = params.COMPILE_START_PAGE - 1; i < fileList.length; i++) {
    console.log(`compiling data-page-${i + 1}.json`);
    const dataPageFile = fileList[i];
    const pageContent: string = fs.readFileSync(dataPageFile, "utf8");

    let content = i === params.COMPILE_START_PAGE - 1 ? "[" : "";
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
  const fileList = getFileList();
  const outputBatchPath = getOutputBatchPath(
    params.COMPILE_START_PAGE,
    params.COMPILE_START_PAGE + fileList.length - 1
  );

  if (!fs.existsSync(outputBatchPath.json))
    throw new Error("Compile into JSON first");

  const compiledJsonContent = fs.readFileSync(outputBatchPath.json, "utf8");
  const compiledJson: EcwidProduct[] = JSON.parse(compiledJsonContent);
  const convertedData = convertToCsv(compiledJson);
  fs.writeFileSync(outputBatchPath.csv, convertedData, { encoding: "utf8" });
}

function compileData() {
  deleteCompiled();
  compileToJSON();
  compiledJsonToCsv();

  console.log("data compiled");
}

compileData();
export default compileData;
