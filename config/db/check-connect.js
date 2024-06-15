var sequelize = require('.');
let connectStatus = 'notConnected';
(async function () {
    try {
        connectStatus = 'connecting';
        await sequelize.authenticate();

        console.log('Connection has been established successfully.');
        connectStatus = 'successfully';
    } catch (error) {
        connectStatus = 'error';
        console.error('Unable to connect to the database:', error);
    }
})();
module.exports = connectStatus;
