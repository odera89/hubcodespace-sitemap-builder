import queryBuilder from "../../db.js";

const getSettings = async (req, res) => {
  try {
    const settings = await queryBuilder("settings").limit(1);
    const settingsData = settings?.[0];

    res.status(200).send({
      data: settingsData,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Get settings failed." });
  }
};

export default getSettings;
