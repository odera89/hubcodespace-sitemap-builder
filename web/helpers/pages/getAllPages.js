import { getPages } from "../../graphql/queries/pages/getPages.js";
import { getSleepTime, sleep } from "../index.js";

export const fetchAllPages = async (client, cursor, pages = []) => {
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
  return fetchAllPages(
    client,
    allPages?.body?.data?.pages?.pageInfo?.endCursor,
    pages
  );
};
