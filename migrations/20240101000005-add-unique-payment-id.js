'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, существует ли уже уникальное ограничение
    const [results] = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'payments' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%paymentId%'
    `);

    // Если ограничение не существует, добавляем его
    if (results.length === 0) {
      await queryInterface.addConstraint('payments', {
        fields: ['paymentId'],
        type: 'unique',
        name: 'payments_paymentId_unique'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('payments', 'payments_paymentId_unique');
  }
};


