require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const nunjucks = require("nunjucks")
const cookieParser = require("cookie-parser")
const app = express()
const generatorId = () => (Math.random() * Date.now()).toString()

const { MongoClient, ObjectId } = require("mongodb")

const clientPromise = MongoClient.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
})

app.use(async (req, res, next) => {
    try {
        const client = await clientPromise
        req.db = client.db("auth")
        next()
    } catch (error) {
        next(error)
    }
})

//! методи для роботи із DB ==============
const findUserByUsername = async (db, username) => {
    return db.collection("auth").findOne({ username })
}

const findUserBySessionId = async (db, sessionId) => {
    const session = await db
        .collection("sessions")
        .findOne({ sessionId }, { projection: { userId: 1 } }) //? знайшли користувача в сесії
    if (!session) {
        return
    }
    return db.collection("auth").findOne({ _id: ObjectId(session.userId) })
}
const createSession = async (db, userId) => {
    const sessionId = generatorId()
    await db.collection("sessions").insertOne({
        userId,
        sessionId,
    })
    return sessionId
}

const deleteSession = async (db, sessionId) => {
    await db.collection("sessions").deleteOne({ sessionId })
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
    const user = await findUserBySessionId(req.db, req.cookies["sessionId"])
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

        const user = await findUserByUsername(req.db, username)

        //? якщо користувачів немає, або пароль неправильний то редіректимо на authError
        if (!user || user.password !== password) {
            return res.redirect("/?authError=true")
        }
        const sessionId = await createSession(req.db, user._id) //? створюємо сесію, якщо даний користувач існуєв бд

        res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/") //? записуємо дані сесії в кукі, які не доступні на клієнті
    }
)

//? для визначення користувача, якому потрібно змінити counter
app.post("/api/add-book", auth(), async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401)
    }

    const db = req.db

    const response = await db.collection("auth").findOneAndUpdate(
        {
            _id: ObjectId(req.user._id),
        },
        {
            $inc: { books: 1 },
        },
        {
            returnOriginal: false, //? повертаємо змінені дані
        }
    )

    res.json({ books: response.value.books })
})

//? також потребує auth, щоб знати кого розлогінити
app.get("/logout", auth(), async (req, res) => {
    //? якщо юреаз немає по даному посиланню
    if (!req.user) {
        return res.redirect("/")
    }
    await deleteSession(req.db, req.sessionId)
    res.clearCookie("sessionId").redirect("/")
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(` Listening http://localhost:${port}`))
