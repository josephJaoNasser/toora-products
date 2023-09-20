import params from "./params";
import getAndOutputAllProducts from "./resources/fetchData";

const { START_PAGE } = params;

getAndOutputAllProducts(START_PAGE);
