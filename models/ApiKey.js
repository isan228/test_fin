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

