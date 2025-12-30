'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_keys', 'accountId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('api_keys', 'environment', {
      type: Sequelize.STRING,
      defaultValue: 'production',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('api_keys', 'accountId');
    await queryInterface.removeColumn('api_keys', 'environment');
  }
};

