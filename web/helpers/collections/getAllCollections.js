import { getCollections } from "../../graphql/queries/collections/getCollections.js";
import { getSleepTime, sleep } from "../index.js";

export const fetchAllCollections = async (client, cursor, collections = []) => {
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
  return fetchAllCollections(
    client,
    allCollections?.body?.data?.collections?.pageInfo?.endCursor,
    collections
  );
};
