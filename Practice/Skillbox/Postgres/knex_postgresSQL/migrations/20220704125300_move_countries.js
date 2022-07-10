//! переносимо дані про країни із users в user_countrie
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(`
    INSERT INTO user_countries (user_id, country)
    SELECT id, country FROM users WHERE country IS NOT NULL 
  `)
}

//! при відкаті, ми в countrie заносимо останню додану користувачеві країну
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw(`
        UPDATE users SET country=(
            SELECT country FROM user_countries
            WHERE user_countries.user_id=users.id
            ORDER BY id DESC
            LIMIT 1
        )
    `)
}
