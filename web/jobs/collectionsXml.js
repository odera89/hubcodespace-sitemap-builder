import shopify from "../shopify.js";
import { getSleepTime, sleep } from "../helpers/index.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { handleWriteFile } from "../helpers/writeFile.js";
import { handleReadFile } from "../helpers/readFile.js";
import { getCollections } from "../graphql/queries/collections/getCollections.js";
import queryBuilder from "../db.js";

const collectionsXml = async (job, done) => {
  try {
    const session = job?.data?.session;
    const index = job?.data?.data?.index;
    const xmlArr = job?.data?.data?.xmlArr;
    const shop = session?.shop;
    const client = await new shopify.api.clients.Graphql({
      session,
    });
    await queryBuilder("jobs-status").insert({
      type: "collections",
      created_at: new Date(),
      updated_at: new Date(),
    });
    const fetchCollections = async (cursor, collections = []) => {
      const variables = {};
      if (cursor) {
        variables.after = cursor;
      }

      const allCollections = await client.query({
        data: {
          query: getCollections,
          variables,
        },
      });

      const checkQueryCostCollection = allCollections?.body?.extensions?.cost;

      const checkLastResponseTimeCollection = new Date().getTime();
      let sleepTimeCollection = await getSleepTime(
        checkQueryCostCollection,
        checkLastResponseTimeCollection
      );

      if ((sleepTimeCollection = !0)) {
        await sleep(sleepTimeCollection);
      }

      if (!allCollections?.body?.data?.collections?.pageInfo?.hasNextPage) {
        collections = [
          ...collections,
          ...allCollections?.body?.data?.collections?.edges,
        ];

        return collections;
      }

      collections = [
        ...collections,
        ...allCollections?.body?.data?.collection?.edges,
      ];
      return fetchCollections(
        allCollections?.body?.data?.collections?.pageInfo?.endCursor,
        collections
      );
    };
    const allCollectionsData = await fetchCollections();
    const options = {
      format: true,
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    };
    const sitemap = await handleReadFile(`${process?.cwd()}/sitemap.xml`);
    const parser = new XMLParser(options);
    const xmlObj = parser.parse(sitemap);

    const collectionsArr = allCollectionsData?.map((item) => {
      return {
        loc: `https://${shop}/collections/${item?.node?.handle}`,
        lastmod: new Date().toISOString(),
        priority: 1,
      };
    });

    let collectionsXml = { ...xmlObj };
    if (!collectionsXml?.urlset?.["@xmlns"]) {
      collectionsXml.urlset = {};
      collectionsXml.urlset["@xmlns"] =
        "http://www.sitemaps.org/schemas/sitemap/0.9";
      collectionsXml.urlset.sitemap = [];
    }
    if (collectionsXml?.urlset?.sitemap?.length > 0) {
      collectionsXml.urlset.sitemap = collectionsXml?.urlset?.sitemap?.filter(
        (item) => !item?.loc?.includes("/collections/")
      );
    } else {
      collectionsXml.urlset.sitemap = [];
    }

    const xmlNewArr = [...collectionsXml.urlset.sitemap];

    let newArr = [];

    xmlArr?.forEach((item) => {
      const firstIndex = xmlNewArr?.findIndex((i) =>
        i?.loc?.includes(item?.slug)
      );

      const lastIndex = xmlNewArr?.findLastIndex((i) =>
        i?.loc?.includes(item?.slug)
      );

      if (firstIndex >= 0 && lastIndex >= 0) {
        const sliceArr = xmlNewArr?.slice(firstIndex, lastIndex + 1);
        newArr = [
          ...newArr,
          { type: item?.type, arr: sliceArr, index: item?.index },
        ];
      }
    });
    newArr = [
      ...newArr,
      {
        type: xmlArr?.find((item) => item?.index === index)?.type,
        arr: collectionsArr,
        index: index,
      },
    ];

    let xmlData = [];

    newArr = newArr?.sort((a, b) => a?.index - b?.index);
    newArr?.forEach((item) => {
      xmlData.push(item?.arr);
    });

    xmlData = xmlData?.reduce((acc, el) => acc.concat(el), []);

    collectionsXml.urlset.sitemap = xmlData;

    const builder = new XMLBuilder(options);
    const xmlDataStr = builder.build(collectionsXml);
    const writeFileContent = await handleWriteFile(
      `${process?.cwd()}/sitemap.xml`,
      xmlDataStr
    );
    await queryBuilder("history").insert({
      type: "collections",
      number_of_items: collectionsArr?.length,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await queryBuilder("jobs-status").where({ type: "collections" }).del();
    done(null, { done: true });
  } catch (error) {
    console.log(error, "error");
    await queryBuilder("jobs-status").where({ type: "collections" }).del();
  }
};

export default collectionsXml;
