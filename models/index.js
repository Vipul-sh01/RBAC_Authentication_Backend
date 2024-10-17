'use strict';

import fs from 'fs';
import path from 'path';
import process from 'process';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import configJSON from '../config/config.json' assert { type: 'json' };


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configJSON[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
  );

for (const file of modelFiles) {
  const { default: model } = await import(path.join(__dirname, file));
  db[model.name] = model(sequelize, Sequelize.DataTypes);
}


Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
