import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { getSleepTime, sleep } from "../helpers/index.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { handleWriteFile } from "../helpers/writeFile.js";
import { handleReadFile } from "../helpers/readFile.js";
import { getArticles } from "../graphql/queries/articles/getArticles.js";
import queryBuilder from "../db.js";

const articlesXml = async (job, done) => {
  try {
    const session = job?.data?.session;
    const shop = session?.shop;
    const client = await new shopify.api.clients.Graphql({
      session,
    });
    await queryBuilder("jobs-status").insert({ type: "articles" });
    const fetchArticles = async (cursor, articles = []) => {
      const variables = {};
      if (cursor) {
        variables.after = cursor;
      }

      const allArticles = await client.query({
        data: {
          query: getArticles,
          variables,
        },
      });

      const checkQueryCostArticles = allArticles?.body?.extensions?.cost;

      const checkLastResponseTimeArticles = new Date().getTime();
      let sleepTimeArticles = await getSleepTime(
        checkQueryCostArticles,
        checkLastResponseTimeArticles
      );

      if ((sleepTimeArticles = !0)) {
        await sleep(sleepTimeArticles);
      }

      if (!allArticles?.body?.data?.articles?.pageInfo?.hasNextPage) {
        articles = [...articles, ...allArticles?.body?.data?.articles?.edges];

        return articles;
      }

      articles = [...articles, ...allArticles?.body?.data?.collection?.edges];
      return fetchArticles(
        allArticles?.body?.data?.articles?.pageInfo?.endCursor,
        articles
      );
    };
    const allArticlesData = await fetchArticles();
    const options = {
      format: true,
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    };
    const sitemap = await handleReadFile(`${process?.cwd()}/sitemap.xml`);
    const parser = new XMLParser(options);
    const xmlObj = parser.parse(sitemap);

    const articlesArr = allArticlesData?.map((item) => {
      const blog = item?.node?.blog?.handle;

      return {
        loc: `https://${shop}/blogs/${blog}/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    let articlesXml = { ...xmlObj };
    if (!articlesXml?.urlset?.["@xmlns"]) {
      articlesXml.urlset = {};
      articlesXml.urlset["@xmlns"] =
        "http://www.sitemaps.org/schemas/sitemap/0.9";
      articlesXml.urlset.sitemap = [];
    }
    if (articlesXml?.urlset?.sitemap?.length > 0) {
      articlesXml.urlset.sitemap = articlesXml?.urlset?.sitemap?.filter(
        (item) => !item?.loc?.includes("/blogs/")
      );
    } else {
      articlesXml.urlset.sitemap = [];
    }

    articlesXml.urlset.sitemap = [
      ...articlesXml?.urlset?.sitemap,
      ...articlesArr,
    ];

    const builder = new XMLBuilder(options);
    const xmlDataStr = builder.build(articlesXml);
    const writeFileContent = await handleWriteFile(
      `${process?.cwd()}/sitemap.xml`,
      xmlDataStr
    );
    await queryBuilder("history").insert({
      type: "articles",
      number_of_items: articlesArr?.length,
      last_updated: new Date(),
    });
    await queryBuilder("jobs-status").where({ type: "articles" }).del();
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

export default articlesXml;
