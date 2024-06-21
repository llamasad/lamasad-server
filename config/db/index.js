const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.DATABASE_PORT || 5432,
    },
);

module.exports = sequelize;
