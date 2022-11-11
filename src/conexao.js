const knex = require('knex')({
    client: 'pg',
    connection: {
        user: "doadmin",
        host: "market-cubos-do-user-12862024-0.b.db.ondigitalocean.com",
        database: "defaultdb",
        password: "AVNS_Ne2rqHEgkZtxvindX1s",
    }
});

module.exports = knex;