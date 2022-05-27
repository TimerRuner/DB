const { MongoClient, ObjectId } = require("mongodb")

const client = new MongoClient(
    "mongodb+srv://vadimas:root1234@cluster0.u3cyn.mongodb.net/test-mogo?retryWrites=true&w=majority"
)

const start = async () => {
    try {
        await client.connect()
        //! Basic
        // await client.db().createCollection("users") //? створюємо колекцію (раз)
        const users = client.db().collection("users") //? отримауємо доступ до колекції
        //?client.db().dropDatabase() - видалення бази даних
        //! ADD and FIND
        // await users.insertOne({ name: "ulbi tv", age: 21 }) //! додати 1 запис
        //?Додати декілька записів
        // await users.insertMany([
        //     { name: "vasya", age: 28 },
        //     { name: "petya", age: 23 },
        //     { name: "dima", age: 35 },
        //     { name: "anton", age: 24 },
        //     { name: "ulbi tv", age: 42 },
        // ])
        //! FIND
        //?Отримати 1 який відповідає даній умові
        // const user = await users.findOne({ name: "ulbi tv" })
        //? отримати усі
        // const userses = await users.find()
        //? вибрати елемент, який задовільняє якусь одну із умов
        const or = await users.find({ $or: [{ name: "vasya" }, { age: 35 }] })
        //? пошук в діапазоні певного значення lte (менше ніж) gte (більше ніж) ne(не рівне)
        const lt = await users.find({ age: { $gte: 28 } })
        //! SORT
        //? Відсортувати від меншого до більшого
        const sortMore = await users.find().sort({ age: 1 })
        //? Відсртувати від більшого до меншого
        const sortLess = await users.find().sort({ age: -1 })
        //? Ліміт виведення елементів
        const limit = await users.find().limit(2)
        //! FIND BY ID
        const id = await users.findOne({ _id: ObjectId("s3234..") })
        //!UPDATE
        //? Перший параметр це критерій пошуку, другий це зміни
        const update = await users.updateOne(
            { name: "pavel" },
            {
                $set: {
                    name: "lion mast",
                    age: 45,
                },
            }
        )
        //? Перейменування ключів наших об'єктів
        const rename = await users.updateOne(
            {},
            {
                $rename: {
                    name: "fullname", //? замінить ключі на fullname
                },
            }
        )
        //!DELETE
        const del = await users.deleteOne({ age: 24 })
        //! Паралельне виконання декількох операцій
        const paralel = await users.bulkWrite([
            {
                insertOne: {
                    document: { name: "lilia", age: 19 },
                },
            },
            {
                deleteOne: {
                    filter: { name: "petya" },
                },
            },
        ])
        //! ТИПИ ЗВ'ЯЗКІВ
        await users.findOne({ fullname: "petya", posts: 1 }) //? поверне лише масив постів даного об'єкта
        await users.findOne({
            //? поверне користувача із постом із заголовком 'js'
            posts: {
                $elemMatch: {
                    title: "js",
                },
            },
        })
        await users.find({ posts: { $exists: true } }) //? поверне об'єкт, що містить в собі конкретне поле
    } catch (error) {
        console.log(error)
    }
}

start()
