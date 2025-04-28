import queryBuilder from "../../db.js";

const checkSitemap = async (req, res) => {
  try {
    const shopId = res?.locals?.shopify?.session?.id;
    const result = await queryBuilder("jobs-status as t")
      .select("t.*")
      .whereIn("t.id", function () {
        this.select(queryBuilder.raw("MAX(id)"))
          .from("jobs-status")
          .where("shop_id", shopId)
          .groupBy("type");
      });

    res.status(200).send({
      data: result,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get sitemap failed." });
  }
};

export default checkSitemap;
