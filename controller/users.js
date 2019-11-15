let response = require('../respones');
let connection = require('../connection');
let sha1 = require('sha1');
let moment = require('moment');
let crypto = require('crypto');

async function register(request, reply) {

    let now = moment().format('YYYY-MM-DD HH:mm:ss').toString();
    let name = request.body.name;
    let email = request.body.email;
    let password = sha1(request.body.password);
    let token = crypto.randomBytes(32).toString('hex');
    let create_at = now;
    let update_at = now;

    let sql = `INSERT INTO users(name, email, password, remember_token, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?)`;

    let data = await new Promise((resolve) => connection.query(sql, [name, email, password, token, create_at, update_at], function (error, rows) {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return response.badRequest('', `Email ${email} telah digunakan!`, reply);
            } else {
                console.log(error);
                return response.badRequest('', `${error}`, reply);
            }
        }

        return resolve({
            name: name,
            email: email,
            token: token
        });
    }));

    return response.ok(data, `Berhasil registrasi pengguna baru - ${email}`, reply);
}

async function login(request, reply){
    let email = request.body.email;
    let password = request.body.password;
    let sql = `SELECT * FROM users WHERE email = ?`;

    let data = await new Promise((resolve) =>
        connection.query(sql, [email], function(error, rows){
            if(error){
                console.log(error);
                return response.badRequest('', `${error}`, reply);
            }

            if(rows.length > 0){
                let verify = sha1(password) === rows[0].password;

                let data = {
                    name : rows[0].name,
                    email : rows[0].email,
                    token : rows[0].remember_token
                };

                return verify ? resolve(data) : resolve(false);
            }
            else
            {
                return resolve(false);
            }
        })
    );

    if(!data){
        return response.badRequest('', 'Email atau password yang anda masukkan salah!', reply);
    }

    return response.ok(data, 'Berhasil login!', reply);
}

module.exports = {
    register, login
}