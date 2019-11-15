require('dotenv').config();

const fastify = require('fastify')({
    logger:true//for logg request
});

fastify.register(require('fastify-formbody'));

//routes yang dipisah dari root file

fastify.register(require('./routes'));

const start = async () => {
    try{
        await fastify.listen(process.env.APP_PORT || 3000);

        fastify.log.info('Server running on ' + fastify.server.address().port)
    } catch (err){
        fastify.log.error(err);
        process.exit(1);
    }
};

start();