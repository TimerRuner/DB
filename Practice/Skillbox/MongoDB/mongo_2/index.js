require("dotenv").config()
const router = require("./users")

const epxress = require("express")
const port = process.env.PORT || 3000

const app = epxress()
app.use(epxress.json())

app.use("/api/users", require("./users"))

app.use((err, req, res, next) => {
    res.status(500).send(err.message)
})
app.use(router)

app.listen(port, () => {
    console.log(` Listening on http://localhost:${port}`)
})
