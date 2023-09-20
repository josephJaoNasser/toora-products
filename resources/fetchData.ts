import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { products as sampleProduct } from "./products";
import outputCsv, { combineCsvs } from "./toptextToEcwidCsv";
import credentials from "../credentials";
import params from "../params";
import { deleteAll } from "./fsUtils";

const apiUrl = "https://api.toptex.io/v3";
const config: AxiosRequestConfig = {
  headers: {
    "x-api-key": credentials.apiKey,
  },
  timeout: 120000,
};

/**
 * authenticate the user to get the token for fetching
 */
async function authenticate() {
  console.log("Authenticating");
  const payload = {
    username: credentials.username,
    password: credentials.password,
  };

  const res = await axios.post(`${apiUrl}/authenticate`, payload, config);
  config.headers["x-toptex-authorization"] = res.data.token;
}

/**
 * Get single product
 * @param pageSize
 * @param pageNumber
 * @returns
 */
async function getProduct(
  pageSize: number,
  pageNumber: number,
  totalPages?: number
) {
  console.log("getting page " + pageNumber + " of " + totalPages);
  const fetchFn: () => Promise<AxiosResponse<typeof sampleProduct>> = () => {
    return axios.get(
      `${apiUrl}/products/all?usage_right=b2b_b2c&page_size=${pageSize}&page_number=${pageNumber}`,
      config
    );
  };

  try {
    if (!config.headers["x-toptex-authorization"]?.length) {
      await authenticate();
    }

    const response = await fetchFn();

    if (!response.data.items?.length) {
      console.log(response);
      throw new Error("Response has no items");
    }

    return response.data;
  } catch (e) {
    const err = e as AxiosError;
    if (err.status === 401) {
      await authenticate();

      const response = await fetchFn();
      return response.data;
    }

    console.log(e);
  }
}

/**
 * Get all products and output as csv
 */
export default async function getAndOutputAllProducts(startPage: number = 1) {
  const PAGE_SIZE = params.PAGE_SIZE;
  const START_PAGE = startPage;

  let totalPages = 1;

  try {
    deleteAll();
    const firstResponse = await getProduct(PAGE_SIZE, START_PAGE);
    console.log("outputting csv for page " + START_PAGE);
    outputCsv(firstResponse, START_PAGE);

    totalPages = Math.ceil(firstResponse.total_count / PAGE_SIZE);

    for (let i = START_PAGE + 1; i <= totalPages; i++) {
      await getProduct(PAGE_SIZE, i, totalPages).then((res) => {
        console.log("outputting csv for page " + i);
        outputCsv(res, i);
      });
    }
  } catch (e) {
    console.log(e);
  }
}
