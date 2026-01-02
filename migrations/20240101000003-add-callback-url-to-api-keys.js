'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_keys', 'callbackUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('api_keys', 'finikApiKey', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('api_keys', 'callbackUrl');
    await queryInterface.removeColumn('api_keys', 'finikApiKey');
  }
};



