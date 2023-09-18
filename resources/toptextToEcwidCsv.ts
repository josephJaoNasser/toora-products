import { products as productSample } from "./products";
const path = require("path");
const fs = require("fs");

enum ProductTypes {
  PRODUCT = "product",
  PRODUCT_VARIATION = "product_variation",
  PRODUCT_OPTION = "product_option",
}

type ProductOption = {
  type: ProductTypes;
  product_option_name: string;
  product_option_value: string;
  product_option_type: string;
  product_option_is_required: string;
};

type ProductVariation = {
  type: ProductTypes;
  product_variation_sku: string;
  product_price: string;
};

type EcwidProduct = {
  type: ProductTypes;
  product_options: ProductOption[];
  product_variations: ProductVariation[];
  product_internal_id: string;
  product_name: string;
  product_description: string;
  product_media_main_image_url: string;
  product_brand: string;
  product_category_1?: string;
  product_category_2?: string;
};

const LANG = "nl";

/**
 * Generates a random ID
 * @param length
 * @returns
 */
function generateRandomID(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    id += charset.charAt(randomIndex);
  }
  return id;
}

/**
 * Convert toptext products to ecwid format
 * @returns
 */
function convertToEcwid(products: typeof productSample): EcwidProduct[] {
  if (!products.items) return [];

  const { items } = products;
  const ecwidProducts = items.map((item) => {
    const product = {
      type: ProductTypes.PRODUCT,
      product_internal_id: generateRandomID(16),
      product_name: item.designation[LANG],
      product_description: item.description[LANG],
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
      ...createOptionsAndVariations(item),
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
  item: (typeof productSample.items)[number]
) {
  const product_variations: ProductVariation[] = [];
  const product_options: ProductOption[] = [];
  const COLOR_OPTION_NAME = "Color";
  const SIZE_OPTION_NAME = "Size";

  for (const color of item.colors) {
    const productColorOption = {
      type: ProductTypes.PRODUCT_OPTION,
      product_option_name: COLOR_OPTION_NAME,
      product_option_value: color.colors[LANG],
      product_option_type: "RADIOBUTTONS",
      product_option_is_required: "TRUE",
    };

    product_options.push(productColorOption);

    color.sizes.forEach((size) => {
      const colorSizeOption = {
        type: ProductTypes.PRODUCT_OPTION,
        product_option_name: SIZE_OPTION_NAME,
        product_option_value: size.sizeCountry[LANG],
        product_option_type: "RADIOBUTTONS",
        product_option_is_required: "TRUE",
      };

      const productVariation = {
        type: ProductTypes.PRODUCT_VARIATION,
        product_variation_sku: size.sku,
        product_price: size.publicUnitPrice
          .replace(/[^\d.,]/g, "")
          .replace(",", "."),
      };

      productVariation[`product_variation_option_${COLOR_OPTION_NAME}`] =
        productColorOption.product_option_value;

      productVariation[`product_variation_option_${SIZE_OPTION_NAME}`] =
        colorSizeOption.product_option_value;

      product_options.push(colorSizeOption);
      product_variations.push(productVariation);
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
function convertToCsv(convertedProducts: EcwidProduct[]): string {
  let keys: string[] = ["type"];

  // get all keys
  for (const product of convertedProducts) {
    const productRootKeys = Object.keys(product).filter(
      (key) =>
        key !== "product_options" &&
        key !== "product_variations" &&
        !keys.includes(key)
    );

    let productOptionKeys;
    let productVariationKeys;
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

    keys = [
      ...keys,
      ...productRootKeys,
      ...productVariationKeys,
      ...productOptionKeys,
    ];
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

      return product[key];
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

        return option[key];
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

        return variant[key];
      });

      row = product_variations.join(",");
      rows.push(row);
    }
  }

  return (csv += rows.join("\n"));
}

/**
 * Save csv into a folder
 */
function outputCsv(
  products: typeof productSample,
  page: number = 1,
  outputDir: string = "output"
) {
  const OUTPUT_FOLDER = outputDir;

  const convertedProducts = convertToEcwid(products);
  const csvData = convertToCsv(convertedProducts);
  const rootPath = path.resolve(__dirname, "../../");
  const outputFolder = path.join(rootPath, OUTPUT_FOLDER);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const outputPath = path.join(
    rootPath,
    OUTPUT_FOLDER,
    `data-page-${page}.csv`
  );
  fs.writeFileSync(outputPath, csvData, { encoding: "utf8" });
}

export default outputCsv;
