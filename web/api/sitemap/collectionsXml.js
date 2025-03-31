import queues from "../../queues/config/index.js";

const collectionsXml = async (req, res) => {
  try {
    const job = await queues?.collectionsXmlQueue?.add({
      session: res?.locals?.shopify?.session,
    });
    await job?.finished();
    res.status(200).send({
      data: job,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get collections failed." });
  }
};

export default collectionsXml;
