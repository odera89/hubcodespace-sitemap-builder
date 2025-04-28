import { getArticles } from "../../graphql/queries/articles/getArticles.js";
import { getSleepTime, sleep } from "../index.js";

export const fetchAllArticles = async (client, cursor, articles = []) => {
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
  return fetchAllArticles(
    client,
    allArticles?.body?.data?.articles?.pageInfo?.endCursor,
    articles
  );
};
