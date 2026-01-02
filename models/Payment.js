module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    apiKeyId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Разрешаем null для платежей, созданных через переменные окружения
      references: {
        model: 'api_keys',
        key: 'id'
      }
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true - убрано из-за проблем с alter: true в PostgreSQL
      // Уникальность будет добавлена через миграцию или отдельное ограничение
      comment: 'ID платежа от Финика'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Сумма платежа'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'RUB',
      comment: 'Валюта'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Статус платежа: pending, success, failed, cancelled'
    },
    callbackData: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Данные из callback'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'payments',
    timestamps: true
  });

  Payment.associate = function(models) {
    Payment.belongsTo(models.ApiKey, {
      foreignKey: 'apiKeyId',
      as: 'apiKey'
    });
  };

  return Payment;
};

