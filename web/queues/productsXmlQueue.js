import Queue from "bull";
import { redisCredentials, redisOptions } from "./config/config.js";
import productsXml from "../jobs/productsXml.js";

const productsXmlQueue = new Queue(
  "productsXmlQueue",
  redisCredentials(),
  redisOptions
);

productsXmlQueue.process(productsXml);

export default productsXmlQueue;
