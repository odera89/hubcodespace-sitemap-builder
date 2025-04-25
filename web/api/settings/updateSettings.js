import queryBuilder from "../../db.js";

const updateSettings = async (req, res) => {
  try {
    const { updateInterval } = req?.body;
    const settings = await queryBuilder("settings").limit(1);
    const settingsData = settings?.[0];

    if (!updateInterval) {
      res.status(200).send({ error: "Update settings failed." });
      return;
    }

    if (settingsData?.id) {
      await queryBuilder("settings").where("id", settingsData?.id).update({
        update_interval: updateInterval,
        updated_at: new Date(),
      });
    } else {
      await queryBuilder("settings").insert({
        update_interval: updateInterval,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    res.status(200).send({
      data: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Update settings failed." });
  }
};

export default updateSettings;
