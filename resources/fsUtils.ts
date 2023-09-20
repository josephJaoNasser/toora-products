import params from "../params";
const path = require("path");
const fs = require("fs");

export function deleteAll() {
  const OUTPUT_FOLDER = params.OUTPUT_DIR;
  const rootPath = path.resolve(__dirname, "../../");
  const outputFolder = path.join(rootPath, OUTPUT_FOLDER);
  const pagesFolder = path.join(outputFolder, "/pages");

  try {
    // Read the list of files in the directory
    const pagesFiles = fs.readdirSync(pagesFolder);
    const compiledFiles = fs.readdirSync(outputFolder);

    // Loop through the files and delete each one
    for (const file of pagesFiles) {
      const filePath = path.join(pagesFolder, file);

      // Check if it's a file (not a subdirectory)
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Delete the file synchronously
        console.log(`Deleted file: ${filePath}`);
      }
    }

    for (const file of compiledFiles) {
      const filePath = path.join(outputFolder, file);

      // Check if it's a file (not a subdirectory)
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Delete the file synchronously
        console.log(`Deleted file: ${filePath}`);
      }
    }

    console.log("All files deleted successfully.");
  } catch (err) {
    console.error("Error deleting files:", err);
  }
}
