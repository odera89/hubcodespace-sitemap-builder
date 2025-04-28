import queryBuilder from "../../db.js";

const updateSettings = async (req, res) => {
  try {
    const { fieldsToAdd } = req?.body;
    const shopId = res?.locals?.shopify?.session?.id;
    if (fieldsToAdd?.length <= 0) {
      res.status(200).send({ error: "Update settings failed." });
      return;
    }
    let fieldsArr = fieldsToAdd?.map((item) => {
      return { ...item, shop_id: shopId };
    });

    await queryBuilder("schedule").where({ shop_id: shopId }).del();

    await queryBuilder("schedule").insert(fieldsArr);

    res.status(200).send({
      data: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Update settings failed." });
  }
};

export default updateSettings;
