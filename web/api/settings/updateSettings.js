import queryBuilder from "../../db.js";

const updateSettings = async (req, res) => {
  try {
    const { fieldsToAdd } = req?.body;

    if (fieldsToAdd?.length <= 0) {
      res.status(200).send({ error: "Update settings failed." });
      return;
    }

    await queryBuilder("schedule").del();

    await queryBuilder("schedule").insert(fieldsToAdd);

    res.status(200).send({
      data: true,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({ error: e?.message || "Update settings failed." });
  }
};

export default updateSettings;
