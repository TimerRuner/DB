//! Модуль контроллерів - функціонал, який використовуватимуть роутери
const db = require("../db")

class UserContoller {
    async createUser(req, res) {
        const { name, surname } = req.body
        const newPerson = await db.query(
            //? вставить замість $1, $2 - name, surname і поверне дані значення
            `INSERT INTO person (name, surname) values ($1, $2) RETURNING *`,
            [name, surname]
        )
        res.json(newPerson.rows)
    }
    async getUsers(req, res) {
        const users = await db.query(`Select * FROM person`)
        res.json(users.rows)
    }
    async getOneUsers(req, res) {
        const id = req.params.id
        const user = await db.query(`SELECT * FROM person where id = $1`, [id])
        res.json(user.rows[0])
    }
    async updateUser(req, res) {
        const { id, name, surname } = req.body
        const user = await db.query(
            `Update person set name = $1, surname = $2 where id = $3 RETURNING *`,
            [name, surname, id]
        )
        res.json(user.rows[0])
    }
    async deleteUser(req, res) {
        const id = req.params.id
        const user = await db.query(
            `DELETE FROM person where id = $1 RETURNING *`,
            [id]
        )
        res.json(user.rows[0])
    }
}

module.exports = new UserContoller()
