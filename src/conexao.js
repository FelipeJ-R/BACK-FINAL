const knex = require('knex')({
    client: 'pg',
    connection: {
        user: "doadmin",
        host: "felipe-cubos-marketplace-do-user-12862024-0.b.db.ondigitalocean.com",
        database: "defaultdb",
        password: "AVNS_Ne2rqHEgkZtxvindX1s",
        port: 25060,
        sslmode: require
    }
});

module.exports = knex;