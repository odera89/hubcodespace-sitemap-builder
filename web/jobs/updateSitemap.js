import { XMLBuilder } from "fast-xml-parser";
import queryBuilder from "../db.js";
import { fetchAllArticles } from "../helpers/articles/getAllArticles.js";
import { fetchAllCollections } from "../helpers/collections/getAllCollections.js";
import { fetchAllPages } from "../helpers/pages/getAllPages.js";
import { fetchAllProducts } from "../helpers/products/getAllProducts.js";
import shopify from "../shopify.js";
import { handleWriteFile } from "../helpers/writeFile.js";

const updateSitemap = async (job, done) => {
  try {
    const jobData = job?.data?.job;
    const shopId = jobData?.shop_id;

    const session = await queryBuilder("shopify_sessions")
      .select()
      .where({ id: shopId })
      .first();

    const shop = session?.shop;

    const client = await new shopify.api.clients.Graphql({
      session,
    });

    const allProductsData = await fetchAllProducts(client);
    const allPagesData = await fetchAllPages(client);
    const allCollectionsData = await fetchAllCollections(client);
    const allArticlesData = await fetchAllArticles(client);

    const pagesObj = {};
    pagesObj.products = allProductsData?.map((item) => {
      return {
        loc: `https://${shop}/products/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });
    pagesObj.pages = allPagesData?.map((item) => {
      return {
        loc: `https://${shop}/pages/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });
    pagesObj.collections = allCollectionsData?.map((item) => {
      return {
        loc: `https://${shop}/collections/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    pagesObj.articles = allArticlesData?.map((item) => {
      const blog = item?.node?.blog?.handle;

      return {
        loc: `https://${shop}/blogs/${blog}/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    const options = {
      format: true,
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    };

    const xmlData = {};

    xmlData.urlset = {};
    xmlData.urlset["@xmlns"] = "http://www.sitemaps.org/schemas/sitemap/0.9";
    xmlData.urlset.sitemap = [
      ...pagesObj?.products,
      ...pagesObj?.collections,
      ...pagesObj?.pages,
      ...pagesObj?.articles,
    ];

    const builder = new XMLBuilder(options);
    const xmlDataStr = builder.build(xmlData);
    const writeFileContent = await handleWriteFile(
      `${process?.cwd()}/sitemap.xml`,
      xmlDataStr
    );
    const pagesObjData = Object?.keys(pagesObj);
    for (const page of pagesObjData) {
      const history = await queryBuilder("history")
        .where({ shop_id: shopId, type: page })
        .first();

      if (history?.id) {
        await queryBuilder("history").where({ id: history?.id }).update({
          number_of_items: xmlData?.[page]?.length,
          updated_at: new Date(),
        });
      } else {
        await queryBuilder("history").insert({
          type: page,
          number_of_items: xmlData?.[page]?.length,
          created_at: new Date(),
          updated_at: new Date(),
          shop_id: shopId,
        });
      }
    }

    done(null, { done: true });
  } catch (error) {
    console.log(error, "error");
  }
};

export default updateSitemap;
