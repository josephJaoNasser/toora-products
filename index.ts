import compileData from "./resources/compileData";
import getAndOutputAllProducts from "./resources/fetchData";

getAndOutputAllProducts().then(() => {
  compileData();
});
