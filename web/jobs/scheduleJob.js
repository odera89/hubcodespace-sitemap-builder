import queryBuilder from "../db.js";
import queues from "../queues/config/index.js";
import { getMinutes, getHours } from "date-fns";

const DAYS_DATA = [
  { value: 1, day: "monday" },
  { value: 2, day: "tuesday" },
  { value: 3, day: "wednesday" },
  { value: 4, day: "thursday" },
  { value: 5, day: "friday" },
  { value: 6, day: "saturday" },
  { value: 0, day: "sunday" },
];

const buildCron = (minute, hour, day, dayOfWeek, frequency) => {
  if (frequency === "weekly" || frequency === "daily") {
    return `${minute} ${hour} * * ${dayOfWeek}`;
  }
  return `${minute} ${hour} ${day} * *`;
};

const scheduleJob = async (job, done) => {
  try {
    const scheduleJobs = await queryBuilder("schedule");
    const repeatableJobs =
      await queues?.updateSitemapQueue?.getRepeatableJobs();
    const scheduleJobsArr = repeatableJobs?.filter((item) =>
      item?.id?.includes("schedule-")
    );

    if (scheduleJobsArr?.length > 0) {
      for (const job of scheduleJobsArr) {
        const jobExists = scheduleJobs?.find(
          (item) => +item?.id === +job?.id?.replace("schedule-", "")
        );

        if (!jobExists && job?.key) {
          await queues?.updateSitemapQueue.removeRepeatableByKey(job?.key);
        }
      }
    }

    if (scheduleJobs?.length > 0) {
      for (const job of scheduleJobs) {
        const jobId = `schedule-${job?.id}`;
        const jobDate = job?.hour ? new Date(job?.hour) : new Date() || 0;
        const minutes = getMinutes(jobDate);
        const hours = getHours(jobDate) || 0;
        const day = job?.day;
        const frequency = job?.frequency;
        const dayOfWeek = DAYS_DATA?.find(
          (item) => item?.day === job?.on
        )?.value;

        const cron = buildCron(minutes, hours, day, dayOfWeek, frequency);

        const jobExists = repeatableJobs.find((j) => j?.id === jobId);

        if (frequency === "never" && jobExists?.key) {
          await queues?.updateSitemapQueue.removeRepeatableByKey(
            jobExists?.key
          );
        }

        if (!jobExists) {
          if (frequency !== "never") {
            await queues?.updateSitemapQueue.add(
              { job },
              {
                repeat: { cron },
                jobId,
              }
            );
          }
        }
      }
    }
    done(null, { done: true });
  } catch (e) {
    console.log(e);
  }
};

export default scheduleJob;
