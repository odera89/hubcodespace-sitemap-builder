import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import updateSitemap from "../jobs/updateSitemap.js";

const updateSitemapQueue = new Queue("updateSitemapQueue", redisCredentials());

updateSitemapQueue.process(updateSitemap);

export default updateSitemapQueue;
