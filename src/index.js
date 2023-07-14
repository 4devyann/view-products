import { fileURLToPath } from 'url';
import { items } from './constants/items.js';
import { v4 as uuidV4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import uniqBy from 'lodash.uniqby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const products = [];
const allComplements = [];

items.forEach((item) =>
  item.items.forEach((product) => {
    products.push(product);
  })
);

const mappedProductsWithoutComplements = uniqBy(
  products.map((product) => {
    const {
      description,
      externalCode,
      name,
      imagePath: image,
      price: { value: price },
      status,
    } = product;
    const collection = [];

    product.optionGroups.forEach((og) => {
      og.options.forEach((op) => collection.push(op));
    });
    return {
      unitId: uuidV4(),
      brandId: uuidV4(),
      brandName: uuidV4(),
      name,
      externalCode,
      description,
      image,
      price,
      status,
    };
  }),
  'externalCode'
);

const mappedProducts = uniqBy(
  products.map((product) => {
    const collection = [];

    product.optionGroups.forEach((og) => {
      og.options.forEach((op) => collection.push(op));
    });
    return {
      ...product,
      complements: collection,
    };
  }),
  'externalCode'
);

const [complements] = mappedProducts.map((item) => {
  item.complements.forEach((complement) => {
    allComplements.push({
      unitId: uuidV4(),
      brandId: uuidV4(),
      brandName: uuidV4(),
      description: complement.description,
      productSideExternalCode: item.externalCode,
      name: complement.name,
      externalCodeApi: complement.externalCode,
      sideExternalCode: complement.externalCode.split('#')[2],
      price: complement.price.value,
      status: complement.status,
    });
  });
  return allComplements;
});

console.log('Products: ', mappedProductsWithoutComplements.length);
console.log('Complements: ', complements.length);

fs.writeFile(
  path.join(__dirname, '/assets/complements.json'),
  JSON.stringify(complements),
  function (err) {
    if (err) throw err;
    console.log('Complements Complete');
  }
);

fs.writeFile(
  path.join(__dirname, '/assets/products.json'),
  JSON.stringify(mappedProductsWithoutComplements),
  function (err) {
    if (err) throw err;
    console.log('Products Complete');
  }
);
