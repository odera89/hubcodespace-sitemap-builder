import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import collectionsXml from "../jobs/collectionsXml.js";

const collectionsXmlQueue = new Queue(
  "collectionsXmlQueue",
  redisCredentials()
);

collectionsXmlQueue.process(collectionsXml);

export default collectionsXmlQueue;
