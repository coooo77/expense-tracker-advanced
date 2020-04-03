'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    merchant: DataTypes.STRING,
    date: DataTypes.DATE,
    home: DataTypes.BOOLEAN,
    transport: DataTypes.BOOLEAN,
    entertain: DataTypes.BOOLEAN,
    food: DataTypes.BOOLEAN,
    other: DataTypes.BOOLEAN
  }, {});
  Record.associate = function (models) {
    Record.belongsTo(models.User)
  };
  return Record;
};