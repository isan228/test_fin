module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название API ключа'
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Открытый ключ'
    },
    privateKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Закрытый ключ'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Активен ли ключ'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание ключа'
    },
    callbackUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL для callback от Финика'
    },
    finikApiKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'API ключ полученный от Финика'
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID корпоративного аккаунта от Финика'
    },
    environment: {
      type: DataTypes.STRING,
      defaultValue: 'production',
      comment: 'Окружение: production или beta'
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
    tableName: 'api_keys',
    timestamps: true
  });

  ApiKey.associate = function(models) {
    ApiKey.hasMany(models.Payment, {
      foreignKey: 'apiKeyId',
      as: 'payments'
    });
  };

  return ApiKey;
};

