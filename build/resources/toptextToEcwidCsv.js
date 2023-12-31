"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCsv = void 0;
var params_1 = require("../params");
var path = require("path");
var fs = require("fs");
var ProductTypes;
(function (ProductTypes) {
    ProductTypes["PRODUCT"] = "product";
    ProductTypes["PRODUCT_VARIATION"] = "product_variation";
    ProductTypes["PRODUCT_OPTION"] = "product_option";
})(ProductTypes || (ProductTypes = {}));
/**
 * Convert toptext products to ecwid format
 * @returns
 */
function convertToEcwid(products, page) {
    var LANG = params_1.default.LANG;
    if (!products.items)
        return [];
    var items = products.items;
    var ecwidProducts = items.map(function (item, index) {
        var _a, _b;
        var internal_id = (page - 1) * params_1.default.PAGE_SIZE + index + 1;
        var product = {
            type: ProductTypes.PRODUCT,
            product_internal_id: internal_id.toString(),
            product_price: item.colors[0].sizes[0].publicUnitPrice
                .replace(",", ".")
                .replace(/[^\d.,]/g, ""),
            product_name: item.designation[LANG],
            product_description: "".concat(item.description[LANG]),
            product_media_main_image_url: ((_a = item.images[0]) === null || _a === void 0 ? void 0 : _a.url)
                ? (_b = item.images[0]) === null || _b === void 0 ? void 0 : _b.url
                : "",
            product_brand: item.brand,
            product_category_1: item.family[LANG].split("/").join("\\") +
                "/" +
                item.sub_family[LANG].split("/").join("\\"),
        };
        item.images.forEach(function (image, index) {
            product["product_media_gallery_image_url_".concat(index + 1)] = (image === null || image === void 0 ? void 0 : image.url)
                ? image.url
                : "";
        });
        return __assign(__assign({}, product), createOptionsAndVariations(item, product.product_internal_id));
    });
    return ecwidProducts;
}
/**
 * Creates product options and variants for each product
 * @param item
 * @returns
 */
function createOptionsAndVariations(item, product_internal_id) {
    var LANG = params_1.default.LANG;
    var product_variations = [];
    var product_options = [];
    var COLOR_OPTION_NAME = "Color";
    var SIZE_OPTION_NAME = "Size";
    var _loop_1 = function (color) {
        var productColorOption = {
            type: ProductTypes.PRODUCT_OPTION,
            product_internal_id: product_internal_id,
            product_option_name: COLOR_OPTION_NAME,
            product_option_value: color.colors[LANG],
            product_option_type: "RADIOBUTTONS",
            product_option_is_required: "TRUE",
        };
        product_options.push(productColorOption);
        color.sizes.forEach(function (size) {
            var duplicateSizeOption = product_options.find(function (option) { return option.product_option_value === size.sizeCountry[LANG]; });
            var productVariation = {
                type: ProductTypes.PRODUCT_VARIATION,
                product_internal_id: product_internal_id,
                product_variation_sku: size.sku,
                product_price: size.publicUnitPrice
                    .replace(/[^\d.,]/g, "")
                    .replace(",", "."),
            };
            productVariation["product_variation_option_".concat(COLOR_OPTION_NAME)] =
                productColorOption.product_option_value;
            productVariation["product_variation_option_".concat(SIZE_OPTION_NAME)] =
                size.sizeCountry[LANG];
            product_variations.push(productVariation);
            if (!duplicateSizeOption) {
                var colorSizeOption = {
                    type: ProductTypes.PRODUCT_OPTION,
                    product_internal_id: product_internal_id,
                    product_option_name: SIZE_OPTION_NAME,
                    product_option_value: size.sizeCountry[LANG],
                    product_option_type: "RADIOBUTTONS",
                    product_option_is_required: "TRUE",
                };
                product_options.push(colorSizeOption);
            }
        });
    };
    for (var _i = 0, _a = item.colors; _i < _a.length; _i++) {
        var color = _a[_i];
        _loop_1(color);
    }
    return {
        product_variations: product_variations,
        product_options: product_options,
    };
}
/**
 * Converts the ecwid json into csv
 */
function convertToCsv(convertedProducts) {
    var keys = ["type"];
    // get all keys
    for (var _i = 0, convertedProducts_1 = convertedProducts; _i < convertedProducts_1.length; _i++) {
        var product = convertedProducts_1[_i];
        var productRootKeys = Object.keys(product).filter(function (key) {
            return key !== "product_options" &&
                key !== "product_variations" &&
                !keys.includes(key);
        });
        keys = __spreadArray(__spreadArray([], keys, true), productRootKeys, true);
        var productOptionKeys = void 0;
        var productVariationKeys = [];
        for (var _a = 0, _b = product.product_options; _a < _b.length; _a++) {
            var option = _b[_a];
            productOptionKeys = Object.keys(option).filter(function (key) { return !keys.includes(key); });
        }
        for (var _c = 0, _d = product.product_variations; _c < _d.length; _c++) {
            var variant = _d[_c];
            productVariationKeys = Object.keys(variant).filter(function (key) { return !keys.includes(key); });
        }
        keys = __spreadArray(__spreadArray(__spreadArray([], keys, true), productVariationKeys, true), productOptionKeys, true);
    }
    var csv = keys.join(",") + "\n";
    var rows = [];
    var _loop_2 = function (product) {
        var row = void 0;
        // get product row
        var products = keys.map(function (key) {
            var _a;
            if (!((_a = product[key]) === null || _a === void 0 ? void 0 : _a.length))
                return "";
            var val = product[key].replaceAll('"', '""');
            if (key === "product_description") {
                return "\"".concat(val, "\"");
            }
            if (product[key].includes(","))
                return "\"".concat(val, "\"");
            return val;
        });
        row = products.join(",");
        rows.push(row);
        var _loop_3 = function (option) {
            option["product_internal_id"] = product.product_internal_id;
            var product_options = keys.map(function (key) {
                var _a;
                if (!((_a = option[key]) === null || _a === void 0 ? void 0 : _a.length))
                    return "";
                var val = option[key].replaceAll('"', '""');
                if (option[key].includes(",")) {
                    return "\"".concat(val, "\"");
                }
                if (option[key].includes("\""))
                    return "".concat(val);
                return val;
            });
            row = product_options.join(",");
            rows.push(row);
        };
        // get product option row
        for (var _f = 0, _g = product.product_options; _f < _g.length; _f++) {
            var option = _g[_f];
            _loop_3(option);
        }
        var _loop_4 = function (variant) {
            variant["product_internal_id"] = product.product_internal_id;
            var product_variations = keys.map(function (key) {
                var _a;
                if (!((_a = variant[key]) === null || _a === void 0 ? void 0 : _a.length))
                    return "";
                var val = variant[key].replaceAll('"', '""');
                if (variant[key].includes(",")) {
                    return "\"".concat(val, "\"");
                }
                return val;
            });
            row = product_variations.join(",");
            rows.push(row);
        };
        // get product variant row
        for (var _h = 0, _j = product.product_variations; _h < _j.length; _h++) {
            var variant = _j[_h];
            _loop_4(variant);
        }
    };
    for (var _e = 0, convertedProducts_2 = convertedProducts; _e < convertedProducts_2.length; _e++) {
        var product = convertedProducts_2[_e];
        _loop_2(product);
    }
    return (csv += rows.join("\n"));
}
exports.convertToCsv = convertToCsv;
/**
 * Save csv and json into a folder
 */
function outputData(products, page) {
    if (page === void 0) { page = 1; }
    var OUTPUT_FOLDER = params_1.default.OUTPUT_DIR;
    var convertedProducts = convertToEcwid(products, page);
    var csvData = convertToCsv(convertedProducts);
    var rootPath = path.resolve(__dirname, "../../");
    var outputFolder = path.join(rootPath, OUTPUT_FOLDER);
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }
    var pagesFolder = path.join(outputFolder, "/pages");
    if (!fs.existsSync(pagesFolder)) {
        fs.mkdirSync(pagesFolder);
    }
    var outputPathCsv = path.join(pagesFolder, "data-page-".concat(page, ".csv"));
    var outputPathJson = path.join(pagesFolder, "data-page-".concat(page, ".json"));
    fs.writeFileSync(outputPathCsv, csvData, { encoding: "utf8" });
    fs.writeFileSync(outputPathJson, JSON.stringify(convertedProducts, null, 2), {
        encoding: "utf8",
    });
}
exports.default = outputData;
//# sourceMappingURL=toptextToEcwidCsv.js.map