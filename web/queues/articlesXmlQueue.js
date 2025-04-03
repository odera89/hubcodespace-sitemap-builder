import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import articlesXml from "../jobs/articlesXml.js";

const articlesXmlQueue = new Queue("articlesXmlQueue", redisCredentials());

articlesXmlQueue.process(articlesXml);

export default articlesXmlQueue;
