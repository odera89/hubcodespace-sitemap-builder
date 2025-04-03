import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import pagesXml from "../jobs/pagesXml.js";

const pagesXmlQueue = new Queue("pageXmlQueue", redisCredentials());

pagesXmlQueue.process(pagesXml);

export default pagesXmlQueue;
