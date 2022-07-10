//! створюємо таблицю для перенесення в неї країн усіх наших користувачів, в яких вони жили
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("user_countries", (table) => {
        table.increments("id")
        table.integer("user_id").notNullable()
        table.foreign("user_id").references("users.id") //? прив'язуємо user_id до id таблиці users
        table.string("country", 255)
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("user_countries")
}
