export function up(knex) {
  return knex.schema.createTable("jobs-status", (tbl) => {
    tbl.increments();
    tbl.text("type").nullable();
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("jobs-status");
}
