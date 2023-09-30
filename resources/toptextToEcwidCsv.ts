import params from "../params";
import { products as productSample } from "./products";
const path = require("path");
const fs = require("fs");

enum ProductTypes {
  PRODUCT = "product",
  PRODUCT_VARIATION = "product_variation",
  PRODUCT_OPTION = "product_option",
}

type ProductInternalId = string | number;

type ProductOption = {
  type: ProductTypes;
  product_internal_id: ProductInternalId;
  product_option_name: string;
  product_option_value: string;
  product_option_type: string;
  product_option_is_required: string;
};

type ProductVariation = {
  type: ProductTypes;
  product_internal_id: ProductInternalId;
  product_variation_sku: string;
  product_price: string;
};

export type EcwidProduct = {
  type: ProductTypes;
  product_options: ProductOption[];
  product_variations: ProductVariation[];
  product_internal_id: ProductInternalId;
  product_name: string;
  product_description: string;
  product_media_main_image_url: string;
  product_brand: string;
  product_category_1?: string;
  product_category_2?: string;
};

/**
 * Convert toptext products to ecwid format
 * @returns
 */
function convertToEcwid(
  products: typeof productSample,
  page: number
): EcwidProduct[] {
  const LANG = params.LANG;
  if (!products.items) return [];

  const { items } = products;
  const ecwidProducts = items.map((item, index) => {
    const internal_id = (page - 1) * params.PAGE_SIZE + index + 1;

    const product = {
      type: ProductTypes.PRODUCT,
      product_internal_id: internal_id.toString(),
      product_price: item.colors[0].sizes[0].publicUnitPrice
        .replace(",", ".")
        .replace(/[^\d.,]/g, ""),
      product_name: item.designation[LANG],
      product_description: `${item.description[LANG]}`,
      product_media_main_image_url: item.images[0]?.url
        ? item.images[0]?.url
        : "",
      product_brand: item.brand,
      product_category_1: item.family[LANG],
      product_category_2: item.sub_family[LANG],
    };

    item.images.forEach((image, index) => {
      product[`product_media_gallery_image_url_${index + 1}`] = image?.url
        ? image.url
        : "";
    });

    return {
      ...product,
      ...createOptionsAndVariations(item, product.product_internal_id),
    };
  });

  return ecwidProducts;
}

/**
 * Creates product options and variants for each product
 * @param item
 * @returns
 */
function createOptionsAndVariations(
  item: (typeof productSample.items)[number],
  product_internal_id: ProductInternalId
) {
  const LANG = params.LANG;
  const product_variations: ProductVariation[] = [];
  const product_options: ProductOption[] = [];
  const COLOR_OPTION_NAME = "Color";
  const SIZE_OPTION_NAME = "Size";

  for (const color of item.colors) {
    const productColorOption = {
      type: ProductTypes.PRODUCT_OPTION,
      product_internal_id,
      product_option_name: COLOR_OPTION_NAME,
      product_option_value: color.colors[LANG],
      product_option_type: "RADIOBUTTONS",
      product_option_is_required: "TRUE",
    };

    product_options.push(productColorOption);

    color.sizes.forEach((size) => {
      const duplicateSizeOption = product_options.find(
        (option) => option.product_option_value === size.sizeCountry[LANG]
      );

      const productVariation = {
        type: ProductTypes.PRODUCT_VARIATION,
        product_internal_id,
        product_variation_sku: size.sku,
        product_price: size.publicUnitPrice
          .replace(/[^\d.,]/g, "")
          .replace(",", "."),
      };

      productVariation[`product_variation_option_${COLOR_OPTION_NAME}`] =
        productColorOption.product_option_value;

      productVariation[`product_variation_option_${SIZE_OPTION_NAME}`] =
        size.sizeCountry[LANG];

      product_variations.push(productVariation);

      if (!duplicateSizeOption) {
        const colorSizeOption = {
          type: ProductTypes.PRODUCT_OPTION,
          product_internal_id,
          product_option_name: SIZE_OPTION_NAME,
          product_option_value: size.sizeCountry[LANG],
          product_option_type: "RADIOBUTTONS",
          product_option_is_required: "TRUE",
        };

        product_options.push(colorSizeOption);
      }
    });
  }

  return {
    product_variations,
    product_options,
  };
}

/**
 * Converts the ecwid json into csv
 */
export function convertToCsv(convertedProducts: EcwidProduct[]): string {
  let keys: string[] = ["type"];

  // get all keys
  for (const product of convertedProducts) {
    const productRootKeys = Object.keys(product).filter(
      (key) =>
        key !== "product_options" &&
        key !== "product_variations" &&
        !keys.includes(key)
    );

    keys = [...keys, ...productRootKeys];

    let productOptionKeys;
    let productVariationKeys = [];
    for (const option of product.product_options) {
      productOptionKeys = Object.keys(option).filter(
        (key) => !keys.includes(key)
      );
    }

    for (const variant of product.product_variations) {
      productVariationKeys = Object.keys(variant).filter(
        (key) => !keys.includes(key)
      );
    }

    keys = [...keys, ...productVariationKeys, ...productOptionKeys];
  }

  let csv = keys.join(",") + "\n";

  const rows: string[] = [];

  for (const product of convertedProducts) {
    let row: string;

    // get product row
    const products: string[] = keys.map((key) => {
      if (!product[key]?.length) return "";

      if (product[key].includes(","))
        return `"${product[key].replace('"', "")}"`;

      return product[key].replace('"', "");
    });

    row = products.join(",");
    rows.push(row);

    // get product option row
    for (const option of product.product_options) {
      option["product_internal_id"] = product.product_internal_id;
      const product_options = keys.map((key) => {
        if (!option[key]?.length) return "";

        if (option[key].includes(","))
          return `"${option[key].replace('"', "")}"`;

        return option[key].replace('"', "");
      });

      row = product_options.join(",");
      rows.push(row);
    }

    // get product variant row
    for (const variant of product.product_variations) {
      variant["product_internal_id"] = product.product_internal_id;
      const product_variations = keys.map((key) => {
        if (!variant[key]?.length) return "";

        if (variant[key].includes(","))
          return `"${variant[key].replace('"', "")}"`;

        return variant[key].replace('"', "");
      });

      row = product_variations.join(",");
      rows.push(row);
    }
  }

  return (csv += rows.join("\n"));
}

/**
 * Save csv and json into a folder
 */
function outputData(products: typeof productSample, page: number = 1) {
  const OUTPUT_FOLDER = params.OUTPUT_DIR;

  const convertedProducts = convertToEcwid(products, page);
  const csvData = convertToCsv(convertedProducts);
  const rootPath = path.resolve(__dirname, "../../");
  const outputFolder = path.join(rootPath, OUTPUT_FOLDER);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const pagesFolder = path.join(outputFolder, "/pages");

  if (!fs.existsSync(pagesFolder)) {
    fs.mkdirSync(pagesFolder);
  }

  const outputPathCsv = path.join(pagesFolder, `data-page-${page}.csv`);
  const outputPathJson = path.join(pagesFolder, `data-page-${page}.json`);

  fs.writeFileSync(outputPathCsv, csvData, { encoding: "utf8" });
  fs.writeFileSync(outputPathJson, JSON.stringify(convertedProducts, null, 2), {
    encoding: "utf8",
  });
}

export default outputData;
