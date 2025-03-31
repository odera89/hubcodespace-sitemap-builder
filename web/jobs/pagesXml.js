import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { getSleepTime, sleep } from "../helpers/index.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { handleWriteFile } from "../helpers/writeFile.js";
import { handleReadFile } from "../helpers/readFile.js";
import { getPages } from "../graphql/queries/pages/getPages.js";

const pagesXml = async (job, done) => {
  try {
    const session = job?.data?.session;
    const shop = session?.shop;
    const client = await new shopify.api.clients.Graphql({
      session,
    });
    const fetchPages = async (cursor, pages = []) => {
      const variables = {};
      if (cursor) {
        variables.after = cursor;
      }

      const allPages = await client.query({
        data: {
          query: getPages,
          variables,
        },
      });

      const checkQueryCostPages = allPages?.body?.extensions?.cost;

      const checkLastResponseTimePages = new Date().getTime();
      let sleepTimePages = await getSleepTime(
        checkQueryCostPages,
        checkLastResponseTimePages
      );

      if ((sleepTimePages = !0)) {
        await sleep(sleepTimePages);
      }

      if (!allPages?.body?.data?.pages?.pageInfo?.hasNextPage) {
        pages = [...pages, ...allPages?.body?.data?.pages?.edges];

        return pages;
      }

      pages = [...pages, ...allPages?.body?.data?.pages?.edges];
      return fetchPages(
        allPages?.body?.data?.pages?.pageInfo?.endCursor,
        pages
      );
    };
    const allPagesData = await fetchPages();
    const options = {
      format: true,
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    };
    const sitemap = await handleReadFile(`${process?.cwd()}/sitemap.xml`);
    const parser = new XMLParser(options);
    const xmlObj = parser.parse(sitemap);

    const pagesArr = allPagesData?.map((item) => {
      return {
        loc: `https://${shop}/pages/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    let pagesXml = { ...xmlObj };
    if (!pagesXml?.urlset?.["@xmlns"]) {
      pagesXml.urlset = {};
      pagesXml.urlset["@xmlns"] = "http://www.sitemaps.org/schemas/sitemap/0.9";
      pagesXml.urlset.sitemap = [];
    }
    if (pagesXml?.urlset?.sitemap?.length > 0) {
      pagesXml.urlset.sitemap = pagesXml?.urlset?.sitemap?.filter(
        (item) => !item?.loc?.includes("/pages/")
      );
    } else {
      pagesXml.urlset.sitemap = [];
    }

    pagesXml.urlset.sitemap = [...pagesXml?.urlset?.sitemap, ...pagesArr];

    const builder = new XMLBuilder(options);
    const xmlDataStr = builder.build(pagesXml);
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

export default pagesXml;
