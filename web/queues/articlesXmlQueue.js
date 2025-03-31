import Queue from "bull";
import { redisCredentials, redisOptions } from "./config/config.js";
import articlesXml from "../jobs/articlesXml.js";

const articlesXmlQueue = new Queue(
  "articlesXmlQueue",
  redisCredentials(),
  redisOptions
);

articlesXmlQueue.process(articlesXml);

export default articlesXmlQueue;
