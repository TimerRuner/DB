require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const nunjucks = require("nunjucks")
const cookieParser = require("cookie-parser")

const app = express()
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.HOST,
        port: process.env.PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
})

const generatorId = () => (Math.random() * new Date()).toString()

//! методи для роботи із DB ==============
const findUserByUsername = async (username) =>
    knex("auth_users")
        .select()
        .where({ username })
        .limit(1)
        .then((results) => results[0])

const findUserBySessionId = async (sessionId) => {
    const session = await knex("sessions")
        .select("user_id")
        .where({ session_id: sessionId })
        .limit(1)
        .then((results) => results[0])

    if (!session) {
        return
    }

    return knex("auth_users")
        .select()
        .where({ id: session.user_id })
        .limit(1)
        .then((results) => results[0])
}

const createSession = async (userId) => {
    const sessionId = generatorId()

    await knex("sessions").insert({
        user_id: userId,
        session_id: sessionId,
    })

    return sessionId
}

const deleteSession = async (sessionId) => {
    await knex("sessions").where({ session_id: sessionId }).delete()
}
//! ==============
nunjucks.configure("views", {
    autoescape: true,
    express: app,
})
app.set("view engine", "njk")
app.use(cookieParser())

//? кастомний middleware для перевірки cookie
const auth = () => async (req, res, next) => {
    if (!req.cookies["sessionId"]) {
        return next()
    }
    const user = await findUserBySessionId(req.cookies["sessionId"])
    //? якщо ми знайшли в сесії передаємо дані в req
    req.user = user
    req.sessionId = req.cookies["sessionId"]
    next()
}
app.get("/", auth(), (req, res) => {
    res.render("index.njk", {
        user: req.user,
        authError: req.query.authError === "true",
    })
})
app.post(
    "/login",
    bodyParser.urlencoded({ extended: false }), //? middleware для роботи із даними
    async (req, res) => {
        const { username, password } = req.body

        const user = await findUserByUsername(username)

        //? якщо користувачів немає, або пароль неправильний то редіректимо на authError
        if (!user || user.password !== password) {
            return res.redirect("/?authError=true")
        }
        const sessionId = await createSession(user.id) //? створюємо сесію, якщо даний користувач існуєв бд

        res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/") //? записуємо дані сесії в кукі, які не доступні на клієнті
    }
)

//? для визначення користувача, якому потрібно змінити counter
app.post("/api/add-book", auth(), async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401)
    }

    const [books] = await knex("auth_users")
        .where({ id: req.user.id })
        .update({
            books: knex.raw("books + 1"),
        })
        .returning("books")

    res.json({ books })
})

//? також потребує auth, щоб знати кого розлогінити
app.get("/logout", auth(), async (req, res) => {
    //? якщо юреаз немає по даному посиланню
    if (!req.user) {
        return res.redirect("/")
    }
    await deleteSession(req.sessionId)
    res.clearCookie("sessionId").redirect("/")
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(` Listening http://localhost:${port}`))
