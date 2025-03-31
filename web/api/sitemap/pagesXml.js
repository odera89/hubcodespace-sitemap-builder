import queues from "../../queues/config/index.js";

const pagesXml = async (req, res) => {
  try {
    const job = await queues?.pagesXmlQueue?.add({
      session: res?.locals?.shopify?.session,
    });
    await job?.finished();
    res.status(200).send({
      data: job,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get pages failed." });
  }
};

export default pagesXml;
