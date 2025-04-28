import queryBuilder from "../../db.js";

const getSettings = async (req, res) => {
  try {
    const shopId = res?.locals?.shopify?.session?.id;
    const settings = await queryBuilder("schedule").where({ shop_id: shopId });
    const settingsData = settings;

    if (settingsData?.length > 0) {
      res.status(200).send({
        data: settingsData,
      });
      return;
    }
    res.status(200).send({ error: "Get settings failed." });
    return;
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get settings failed." });
  }
};

export default getSettings;
