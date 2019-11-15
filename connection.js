var mysql = require('mysql');

var con = mysql.createPool({
    connectionLimit : 5,
    host : process.env.DB_HOST,
    user : process.env.DB_NAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});

module.exports = con;