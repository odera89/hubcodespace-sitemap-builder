import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import productsXml from "../jobs/productsXml.js";

const productsXmlQueue = new Queue("productsXmlQueue", redisCredentials());

productsXmlQueue.process(productsXml);

export default productsXmlQueue;
