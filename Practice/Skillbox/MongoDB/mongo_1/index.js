require("dotenv").config()

const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.DB_URI, {
    useUnifiedTopology: true,
})
;(async () => {
    try {
        await client.connect()

        const db = client.db("users")

        const res = await db
            .collection("users")
            .find({
                name: "mary",
            })
            .toArray()

        console.log(res)
    } catch (error) {
        console.error(error)
    }

    await client.close()
})()
