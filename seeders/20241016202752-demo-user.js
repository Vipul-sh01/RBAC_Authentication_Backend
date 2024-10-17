'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

    // Hash passwords for the seeded users
    const password1 = await bcrypt.hash('admin123', saltRounds);
    const password2 = await bcrypt.hash('user123', saltRounds);

    // Insert seed data into the Users table
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          username: 'admin',
          email: 'admin@example.com',
          password: password1,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'user',
          email: 'user@example.com',
          password: password2,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Delete the seeded users by their emails
    await queryInterface.bulkDelete('Users', {
      email: { [Sequelize.Op.in]: ['admin@example.com', 'user@example.com'] },
    });
  },
};
