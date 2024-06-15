const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('lamasad_db', 'postgres', 'emchua18', {
    host: 'localhost',
    dialect: 'postgres',
});

module.exports = sequelize;
