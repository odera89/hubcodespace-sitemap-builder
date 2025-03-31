import Queue from "bull";
import { redisCredentials, redisOptions } from "./config/config.js";
import collectionsXml from "../jobs/collectionsXml.js";

const collectionsXmlQueue = new Queue(
  "collectionsXmlQueue",
  redisCredentials(),
  redisOptions
);

collectionsXmlQueue.process(collectionsXml);

export default collectionsXmlQueue;
