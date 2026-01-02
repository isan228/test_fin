'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонок перед добавлением (идемпотентность)
    const tableDescription = await queryInterface.describeTable('api_keys');
    
    if (!tableDescription.callbackUrl) {
      await queryInterface.addColumn('api_keys', 'callbackUrl', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!tableDescription.finikApiKey) {
      await queryInterface.addColumn('api_keys', 'finikApiKey', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('api_keys');
    
    if (tableDescription.callbackUrl) {
      await queryInterface.removeColumn('api_keys', 'callbackUrl');
    }
    
    if (tableDescription.finikApiKey) {
      await queryInterface.removeColumn('api_keys', 'finikApiKey');
    }
  }
};



