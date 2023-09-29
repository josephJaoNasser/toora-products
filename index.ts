import params from "./params";
import getAndOutputAllProducts from "./resources/fetchData";
import { combineCsvs } from "./resources/toptextToEcwidCsv";

const { START_PAGE } = params;

getAndOutputAllProducts(START_PAGE).then(() => {
  // combineCsvs();
});
