import { pagesCountQuery } from "../../graphql/queries/pagesCount.js";
import shopify from "../../shopify.js";

const pagesCount = async (req, res) => {
  try {
    const client = await new shopify.api.clients.Graphql({
      session: res?.locals?.shopify?.session,
    });
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
    const data = [
      {
        type: "products",
        count: result?.body?.data?.productsCount?.count || 0,
        id: 1,
      },
      {
        type: "collections",
        count: result?.body?.data?.collectionsCount?.count || 0,
        id: 2,
      },
      {
        type: "pages",
        count: result?.body?.data?.pagesCount?.count || 0,
        id: 3,
      },
      { type: "articles", count: articlesCount || 0, id: 4 },
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
