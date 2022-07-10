//! модуль взаємодії із postgress через SQL запити

const Pool = require("pg").Pool
const pool = new Pool({
    user: "postgres",
    password: "root1234",
    host: "localhost",
    port: 5432,
    database: "node_postgres",
})

module.exports = pool
