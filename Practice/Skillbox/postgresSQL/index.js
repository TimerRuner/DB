require("dotenv").config()

const { Client } = require("pg")

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})
;(async () => {
    await client.connect()

    try {
        const res = await client.query("SELECT * FROM users")
        console.log(res.rows)
    } catch (error) {
        console.log(error)
    }
})()
