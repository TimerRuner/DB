const express = require("express")
const userRouter = require("./routes/user.routes")
const postRouter = require("./routes/post.router")

const PORT = process.env.PORT || 8080

const app = express()

app.get("/", (req, res) => {
    res.send("Hello Node JS")
})

app.use(express.json())
//? реєструємо роутери
app.use("/api", userRouter)
app.use("/api", postRouter)

app.listen(PORT, () =>
    console.log(` Server started at http://localhost:${PORT}`)
)
