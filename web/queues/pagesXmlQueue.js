import Queue from "bull";
import { redisCredentials, redisOptions } from "./config/config.js";
import pagesXml from "../jobs/pagesXml.js";

const pagesXmlQueue = new Queue(
  "pagesXmlQueue",
  redisCredentials(),
  redisOptions
);

pagesXmlQueue.process(pagesXml);

export default pagesXmlQueue;
