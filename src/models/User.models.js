import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';

const UserModel = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('admin', 'user'),
                allowNull: false,
            },
        },
        {
            tableName: 'Users',
            timestamps: true,
            hooks: {
                beforeCreate: async (user) => {
                    if (user.password) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
                beforeUpdate: async (user) => {
                    if (user.changed('password')) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
            },
        }
    );

    User.prototype.isPasswordCorrect = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    User.prototype.generateAccessToken = function () {
        try {
            return jwt.sign(
                {
                    id: this.id,
                    username: this.username,
                    role: this.role,
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
            );
        } catch (error) {
            throw new Error('Failed to generate access token');
        }
    };

    User.prototype.generateRefreshToken = function () {
        try {
            return jwt.sign(
                { id: this.id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
            );
        } catch (error) {
            throw new Error('Failed to generate refresh token');
        }
    };

    return User;
};

export { UserModel };
