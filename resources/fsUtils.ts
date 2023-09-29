import params from "../params";
const path = require("path");
const fs = require("fs");

export function deleteAll() {
  const OUTPUT_FOLDER = params.OUTPUT_DIR;
  const START_PAGE = params.START_PAGE;
  const rootPath = path.resolve(__dirname, "../../");
  const outputFolder = path.join(rootPath, OUTPUT_FOLDER);
  const pagesFolder = path.join(outputFolder, "/pages");

  try {
    // Read the list of files in the directory
    const pagesFiles = fs.readdirSync(pagesFolder);
    const compiledFiles = fs.readdirSync(outputFolder);

    // Delete files in the pages folder
    for (const file of pagesFiles) {
      const filePath = path.join(pagesFolder, file);
      const ext = path.extname(filePath);
      const filename = path.basename(filePath, ext);

      if (fs.statSync(filePath).isFile()) {
        const pageCount = +filename.split("-")[2];

        if (pageCount < START_PAGE) {
          console.log(`Skipped deleting file: ${filename}`);
          continue;
        }

        fs.unlinkSync(filePath); // Delete the file synchronously
        console.log(`Deleted file: ${filePath}`);
      }
    }

    // delete compiled
    for (const file of compiledFiles) {
      const filePath = path.join(outputFolder, file);

      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    }

    console.log("All files deleted successfully.");
  } catch (err) {
    console.error("Error deleting files:", err);
  }
}
