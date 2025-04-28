import queryBuilder from "../../db.js";
import { pagesCountQuery } from "../../graphql/queries/pagesCount.js";
import shopify from "../../shopify.js";

const pagesCount = async (req, res) => {
  try {
    const client = await new shopify.api.clients.Graphql({
      session: res?.locals?.shopify?.session,
    });

    const shopId = res?.locals?.shopify?.session?.id;

    const result = await client.query({
      data: {
        query: pagesCountQuery,
      },
    });
    const articlesCount = result?.body?.data?.blogs?.edges
      ?.map((item) => {
        return item?.node?.articlesCount?.count || 0;
      })
      ?.reduce((acc, curr) => {
        return acc + curr;
      }, 0);
    const historyData = await queryBuilder("history as t")
      .select("t.*")
      .whereIn("t.id", function () {
        this.select(queryBuilder.raw("MAX(id)"))
          .from("history")
          .where("shop_id", shopId)
          .groupBy("type");
      });

    const data = [
      {
        type: "products",
        count: result?.body?.data?.productsCount?.count || 0,
        id: 1,
        last_updated: historyData?.find((item) => item?.type === "products")
          ?.created_at,
      },
      {
        type: "collections",
        count: result?.body?.data?.collectionsCount?.count || 0,
        id: 2,
        last_updated: historyData?.find((item) => item?.type === "collections")
          ?.created_at,
      },
      {
        type: "pages",
        count: result?.body?.data?.pagesCount?.count || 0,
        id: 3,
        last_updated: historyData?.find((item) => item?.type === "pages")
          ?.created_at,
      },
      {
        type: "articles",
        count: articlesCount || 0,
        id: 4,
        last_updated: historyData?.find((item) => item?.type === "articles")
          ?.created_at,
      },
    ];

    res.status(200).send({
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get pages count failed." });
  }
};

export default pagesCount;
