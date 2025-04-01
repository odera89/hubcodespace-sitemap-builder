export function up(knex) {
  return knex.schema.createTable("history", (tbl) => {
    tbl.increments();
    tbl.text("type").nullable();
    tbl.integer("number_of_items").nullable();
    tbl.timestamp("created_at").nullable();
    tbl.timestamp("updated_at").nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("history");
}
