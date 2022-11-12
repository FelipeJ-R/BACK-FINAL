const knex = require('knex')({
    client: 'pg',
    connection: {
        user: "doadmin",
        host: "felipefinaldatabase-do-user-12862024-0.b.db.ondigitalocean.com",
        database: "defaultdb",
        password: "AVNS_H1R0eRnIirsB3UQOFU0",
        port: 25060,
        sslmode: "require",
        ssl: {
            rejectUnauthorized: false
        }
    }
});
AVNS_H1R0eRnIirsB3UQOFU0
module.exports = knex;