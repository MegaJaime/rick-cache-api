import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface CharacterAttributes {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
}

export class Character extends Model<CharacterAttributes, CharacterAttributes> implements CharacterAttributes {
  declare id: number;
  declare name: string;
  declare status: string;
  declare species: string;
  declare gender: string;
  declare origin: string;
}

Character.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'characters',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  }
);
