export const getSleepTime = async (last_query_cost, last_response_time) => {
  if (!last_query_cost) return 0;

  let maximum_available = last_query_cost.throttleStatus.maximumAvailable;
  let actual_query_cost = last_query_cost.actualQueryCost;
  let currently_available = last_query_cost.throttleStatus.currentlyAvailable;
  let restore_rate = last_query_cost.throttleStatus.restoreRate;
  let target_rate = maximum_available / 2 + actual_query_cost;

  let delta = ((target_rate - currently_available) / restore_rate) * 1000;

  let result = new Date(last_response_time + delta) - new Date().getTime();

  if (result < 0) {
    return 0;
  }

  return result;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
