import sequelize from './index';
let connectStatus = 'notConnected';
(async function () {
    try {
        connectStatus = 'connecting';
        await sequelize.authenticate();

        connectStatus = 'successfully';
    } catch (error) {
        connectStatus = 'error';
        console.error('Unable to connect to the database:', error);
    }
})();
export default connectStatus;
