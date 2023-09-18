import getAndOutputAllProducts from "./resources/fetchData";

const START_PAGE = 1;
const PAGE_SIZE = 100;
const OUTPUT_DIR = "export";

getAndOutputAllProducts(START_PAGE, PAGE_SIZE, OUTPUT_DIR);
