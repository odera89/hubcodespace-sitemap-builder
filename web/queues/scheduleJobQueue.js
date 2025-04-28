import Queue from "bull";
import { redisCredentials } from "./config/config.js";
import scheduleJob from "../jobs/scheduleJob.js";

const scheduleJobQueue = new Queue("scheduleJobQueue", redisCredentials());

scheduleJobQueue.process(scheduleJob);

export default scheduleJobQueue;
