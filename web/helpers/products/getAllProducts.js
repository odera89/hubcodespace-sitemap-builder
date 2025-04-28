import { getSleepTime, sleep } from "../index.js";
import { getProducts } from "../../graphql/queries/products/getProducts.js";

export const fetchAllProducts = async (client, cursor, products = []) => {
  const variables = {};
  if (cursor) {
    variables.after = cursor;
  }

  const allProducts = await client.query({
    data: {
      query: getProducts,
      variables,
    },
  });

  const checkQueryCostProduct = allProducts?.body?.extensions?.cost;

  const checkLastResponseTimeProduct = new Date().getTime();
  let sleepTimeProduct = await getSleepTime(
    checkQueryCostProduct,
    checkLastResponseTimeProduct
  );

  if ((sleepTimeProduct = !0)) {
    await sleep(sleepTimeProduct);
  }

  if (!allProducts?.body?.data?.products?.pageInfo?.hasNextPage) {
    products = [...products, ...allProducts?.body?.data?.products?.edges];

    return products;
  }

  products = [...products, ...allProducts?.body?.data?.products?.edges];
  return fetchAllProducts(
    client,
    allProducts?.body?.data?.products?.pageInfo?.endCursor,
    products
  );
};
