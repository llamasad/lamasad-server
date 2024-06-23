import { Sequelize } from 'sequelize';
// const sequelize = new Sequelize(
//     process.env.DATABASE_NAME,
//     process.env.DATABASE_USERNAME,
//     process.env.DATABASE_PASSWORD,
//     {
//         host: process.env.DATABASE_HOST || 'localhost',
//         dialect: 'postgres',
//         port: process.env.DATABASE_PORT || 5432,
//         dialectOptions: {
//             ssl: {
//                 require: true,
//                 rejectUnauthorized: false, // This allows self-signed certificates; set to true for production if using trusted certificates
//             },
//         },
//     },
// );
const sequelize = new Sequelize('lamasad_db', 'postgres', 'emchua18', {
    host: 'localhost',
    dialect: 'postgres',
});
export default sequelize;
