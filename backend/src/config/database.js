const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
    // ☁️ إعدادات السيرفر (Render - PostgreSQL)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // 💻 إعدادات جهازك (Local - SQLite/MySQL)
    // هذا الكود سيعمل عندك محلياً
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite', 
        logging: false
    });
}

module.exports = sequelize;
