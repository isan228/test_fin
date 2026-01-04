'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Изменяем колонку apiKeyId, чтобы разрешить NULL значения
    await queryInterface.changeColumn('payments', 'apiKeyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'api_keys',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Откат: делаем колонку снова NOT NULL (но только если нет NULL значений)
    await queryInterface.changeColumn('payments', 'apiKeyId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'api_keys',
        key: 'id'
      }
    });
  }
};

