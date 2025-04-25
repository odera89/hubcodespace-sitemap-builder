export function up(knex) {
  return knex.schema.table("settings", (tbl) => {
    tbl.integer("update_interval");
  });
}

export function down(knex) {
  return knex.schema.table("settings", (tbl) => {
    tbl.dropColumn("update_interval");
  });
}
