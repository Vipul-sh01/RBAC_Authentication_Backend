import { Sequelize } from 'sequelize';
import { DB_NAME } from '../constent.js'; 
import UserModel from '../models/User.models.js'; 

const sequelize = new Sequelize(DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: console.log, 
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`\nMySQL connected! DB HOST: ${process.env.MYSQL_HOST}`);
        await sequelize.sync({ force: false });
    } catch (error) {
        console.error("MySQL connection FAILED: ", error.message || error);
        process.exit(1);
    }
};


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = UserModel(sequelize, Sequelize.DataTypes); 

export { sequelize, connectDB, db };
