export function up(knex) {
  return knex.schema.createTable("jobs-status", (tbl) => {
    tbl.increments();
    tbl.text("type").nullable();
    tbl.text("shop_id").nullable();
    tbl.timestamp("created_at").nullable();
    tbl.timestamp("updated_at").nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("jobs-status");
}
