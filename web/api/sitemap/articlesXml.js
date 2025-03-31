import queues from "../../queues/config/index.js";

const articlesXml = async (req, res) => {
  try {
    const job = await queues?.articlesXmlQueue?.add({
      session: res?.locals?.shopify?.session,
    });

    await job?.finished();
    res.status(200).send({
      data: job,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get articles failed." });
  }
};

export default articlesXml;
