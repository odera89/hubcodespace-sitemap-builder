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
    const data = {
      products: result?.body?.data?.productsCount?.count || 0,
      collections: result?.body?.data?.collectionsCount?.count || 0,
      pages: result?.body?.data?.pagesCount?.count || 0,
      articles: articlesCount || 0,
    };

    res.status(200).send({
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get pages count failed." });
  }
};

export default pagesCount;
