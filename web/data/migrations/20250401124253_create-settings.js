export function up(knex) {
  return knex.schema.createTable("settings", (tbl) => {
    tbl.increments();
    tbl.timestamp("next_update").nullable();
    tbl.timestamp("created_at").nullable();
    tbl.timestamp("updated_at").nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("settings");
}
