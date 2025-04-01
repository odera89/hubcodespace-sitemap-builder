import queryBuilder from "../../db.js";

const checkSitemap = async (req, res) => {
  try {
    const result = await queryBuilder("jobs-status").distinct("type").limit(4);

    res.status(200).send({
      data: result,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get sitemap failed." });
  }
};

export default checkSitemap;
