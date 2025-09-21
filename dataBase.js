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

    static async selectManager(columns, table, where, values){
        //NOTE: EXPECTING ARRAY ON COLUMNS, WHERE, VALUE
        try {
            const whereClause = where.map(w => `${w} = ?`).join(' AND ');
            const query = `SELECT ${columns.join(', ')} FROM ${table} WHERE ${whereClause}`;
            const [row] = await dataBase.query(query, values);
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
            const columnsClause = columns.map(col => `${col}= ?`).join(' AND ');
            const query = `DELETE FROM ${table} WHERE ${columnsClause}`;
            const [row] = await dataBase.query(query, value);
            return;
        } catch (error) {
            throw new DatabaseError(error.message);
        }
    }

    static async updateManager(columns, table, values, where, whereVal){
        try {
            const columnsClause = columns.map(col => `${col} = ?`).join(', ');
            const whereClause = where.map(w => `${w} = ?`).join(' AND ');
            const query = `UPDATE ${table} SET ${columnsClause} WHERE ${whereClause}`;
            const [row] = await dataBase.query(query, [...values, ...whereVal]);
            return
        } catch (error) {
            throw new DatabaseError(error.message);
        }
    }
}

module.exports = { Management };