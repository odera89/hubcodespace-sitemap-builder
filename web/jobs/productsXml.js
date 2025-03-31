import { GraphqlQueryError } from "@shopify/shopify-api";
import { getProducts } from "../graphql/queries/products/getProducts.js";
import shopify from "../shopify.js";
import { getSleepTime, sleep } from "../helpers/index.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { handleReadFile } from "../helpers/readFile.js";
import { handleWriteFile } from "../helpers/writeFile.js";

const productsXml = async (job, done) => {
  try {
    const session = job?.data?.session;
    const shop = session?.shop;
    const client = await new shopify.api.clients.Graphql({
      session,
    });
    const fetchProducts = async (cursor, products = []) => {
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
      return fetchProducts(
        allProducts?.body?.data?.products?.pageInfo?.endCursor,
        products
      );
    };
    const options = {
      format: true,
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    };
    const allProductsData = await fetchProducts();
    const sitemap = await handleReadFile(`${process?.cwd()}/sitemap.xml`);
    const parser = new XMLParser(options);
    const xmlObj = parser.parse(sitemap);

    const productsArr = allProductsData?.map((item) => {
      return {
        loc: `https://${shop}/products/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    let productsXml = { ...xmlObj };
    if (!productsXml?.urlset?.["@xmlns"]) {
      productsXml.urlset = {};
      productsXml.urlset["@xmlns"] =
        "http://www.sitemaps.org/schemas/sitemap/0.9";
      productsXml.urlset.sitemap = [];
    }
    if (productsXml?.urlset?.sitemap?.length > 0) {
      productsXml.urlset.sitemap = productsXml?.urlset?.sitemap?.filter(
        (item) => !item?.loc?.includes("/products/")
      );
    } else {
      productsXml.urlset.sitemap = [];
    }

    productsXml.urlset.sitemap = [
      ...productsXml?.urlset?.sitemap,
      ...productsArr,
    ];

    done(null, { done: true });

    const builder = new XMLBuilder(options);
    const xmlDataStr = builder.build(productsXml);

    const writeFileContent = await handleWriteFile(
      `${process?.cwd()}/sitemap.xml`,
      xmlDataStr
    );

    done(null, { done: true });
  } catch (error) {
    console.log(error, "error");
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error?.message}\n${JSON.stringify(error?.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
};

export default productsXml;
