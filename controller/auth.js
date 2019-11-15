let response = require('../respones');
let connection = require('../connection');
let moment = require('moment');
let crypto = require('crypto');

async function createToken(request, reply){

    let now = moment().format('YYYY-MM-DD HH:mm:ss').toString();
    let secret = request.body.secret;
    let token = request.body.token;
    let created_at = now;
    let updated_at = now;

    //get id
    let user_id = await getUser(token);

    //get secret key id
    let secret_id = await getSecret(secret);

    if(!secret_id || !user_id){
        return response.badRequest('', 'Token atau secret key anda salah!', reply);
    }

    //create random string > 20 character
    let id = crypto.randomBytes(25).toString('hex');

    //crate today + 30 days for expired time token
    let expires_at = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss').toString();

    //query
    let sql = `INSERT INTO authentication(id, user_id, secret_id, expires_at, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?)`;

    let data = await new Promise((resolve) =>
        connection.query(sql, [id, user_id, secret_id, expires_at, created_at, updated_at], function(error, rows){
            if(error){
                console.log(error);
                return response.badRequest('', `${error}`, reply);
            }

            let array = {
                token : id,
                expires_at: expires_at
            };

            return resolve(array);
        })
    );

    return response.ok(data, `Berhasil membuat authentikasi!`, reply);
}

async function checkToken(request, reply){
    let token = request.body.token.toString();
    let user_token = request.body.user_token.toString();
    let now = moment().format('YYYY-MM-DD HH:mm:ss').toString();

    let sql = 'SELECT authentication.*, users.remember_token FROM authentication INNER JOIN users ON users.id = authentication.user_id WHERE authentication.id = ? AND users.remember_token = ?';

    let data = await new Promise((resolve) => 
        connection.query(sql, [token, user_token], function(error, rows){
            if(error){
                console.log(error);
                return response.badRequest('', `${error}`, reply);
            }

            if(rows.length > 0){
                return rows[0].remember_token === user_token ? resolve(rows[0].expires_at) : resolve(false);
            } else {
                return response.badRequest('', 'Token yang anda masukkan salah!', reply);
            }
        })
    );

    let array = {expires_at: data};
    let message = moment(data).format('YYYY-MM-DD HH:mm:ss').toString() > now ? 'Token ini masih aktif' : 'Token sudah tidak aktif';

    return array ? response.ok(array, message, reply) : response.badRequest({}, message, reply);
}

async function getUser(token){
    return new Promise((resolve) => 
        connection.query('SELECT id FROM users WHERE remember_token = ?', [token], function(error, rows){
            if(error){
                console.log(error);
            }

            return rows.length > 0 ? resolve(rows[0].id) : resolve(false);
        })
    );
}

async function getSecret(secret){
    return new Promise((resolve) => 
        connection.query('SELECT id from secret WHERE secret = ?', [secret], function(error, rows){
            if(error){
                console.log(error);
            }

            return rows.length > 0 ? resolve(rows[0].id) : resolve(false);
        })
    );
}

module.exports = {
    createToken, checkToken
}