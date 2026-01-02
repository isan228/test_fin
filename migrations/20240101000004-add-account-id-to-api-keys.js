'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонок перед добавлением (идемпотентность)
    const tableDescription = await queryInterface.describeTable('api_keys');
    
    if (!tableDescription.accountId) {
      await queryInterface.addColumn('api_keys', 'accountId', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!tableDescription.environment) {
      await queryInterface.addColumn('api_keys', 'environment', {
        type: Sequelize.STRING,
        defaultValue: 'production',
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('api_keys');
    
    if (tableDescription.accountId) {
      await queryInterface.removeColumn('api_keys', 'accountId');
    }
    
    if (tableDescription.environment) {
      await queryInterface.removeColumn('api_keys', 'environment');
    }
  }
};



