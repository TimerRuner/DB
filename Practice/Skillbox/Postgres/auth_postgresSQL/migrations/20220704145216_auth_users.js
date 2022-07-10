/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("auth_users", (table) => {
        table.increments("id")
        table.string("username", 255).notNullable().unique()
        table.string("password", 255).notNullable()
        table.integer("books").notNullable().defaultTo(0)
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("auth_users")
}
