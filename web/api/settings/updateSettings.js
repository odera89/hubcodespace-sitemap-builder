import queryBuilder from "../../db.js";

const updateSettings = async (req, res) => {
  try {
    const { nextUpdate } = req?.body;
    const settings = await queryBuilder("settings").limit(1);
    const settingsData = settings?.[0];
    if (!nextUpdate) {
      res.status(200).send({ error: "Update settings failed." });
      return;
    }

    if (settingsData?.id) {
      await queryBuilder("settings").where("id", settingsData?.id).update({
        next_update: nextUpdate,
        updated_at: new Date(),
      });
    } else {
      await queryBuilder("settings").insert({
        next_update: nextUpdate,
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
