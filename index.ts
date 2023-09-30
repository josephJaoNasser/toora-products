import params from "./params";
import compileData from "./resources/compileData";
import getAndOutputAllProducts from "./resources/fetchData";

const { START_PAGE } = params;

getAndOutputAllProducts(START_PAGE).then(() => {
  compileData();
});
