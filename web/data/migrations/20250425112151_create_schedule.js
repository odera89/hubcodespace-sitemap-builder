export function up(knex) {
  return knex.schema.createTable("schedule", (tbl) => {
    tbl.increments();
    tbl.text("frequency").nullable();
    tbl.text("on").nullable();
    tbl.integer("day").nullable();
    tbl.timestamp("hour").nullable();
    tbl.text("shop_id").nullable();
    tbl.timestamp("created_at").nullable();
    tbl.timestamp("updated_at").nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("schedule");
}
