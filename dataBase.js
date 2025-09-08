require('dotenv').config();
const mysql = require('mysql2/promise');
const { DatabaseError } = require('./centralUnits/errorUnit.js');

const dataBase =  mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: '',
  database: process.env.DATABASE,
  supportBigNumbers: true,
  bigNumberStrings: true
});

class Management{

    static async selectManager(columns, table, where, value){
        //NOTE: EXPECTING ARRAY ON COLUMNS
        try {
            const query = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${where} = ?`;
            const [row] = await dataBase.query(query, [value]);
            return row;
        } catch (error) {
            throw new DatabaseError(error.message);
        }
    }

    static async insertManager(columns, table, values){
        try{
            const valueClause = values.map(val => `?`);
            const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${valueClause.join(', ')})`;
            await dataBase.query(query, [...values]);
            return;
        } catch (error) {
            throw new DatabaseError(error.message);
        }
    }

    static async deleteManager(table, columns, value){
        try {
            const columnsClause = columns.map(col => `${col}= ?`).join('AND');
            const query = `DELETE FROM ${table} WHERE ${columnsClause}`;
            const [row] = await dataBase.query(query, value);
            console.log(row);
            return;
        } catch (error) {
            throw new DatabaseError(error.message);
        }
    }

}

module.exports = { Management };