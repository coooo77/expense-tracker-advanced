'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      merchant: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      home: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      transport: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      entertain: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      food: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      other: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Records');
  }
};