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
                defaultValue: 'user',
            },
        },
        {
            tableName: 'Users',
            timestamps: true,
            hooks: {
                beforeSave: async (user) => {
                    if (user.changed('password')) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
            },
        }
    );
    User.prototype.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    User.prototype.generateAccessToken = function () {
        return jwt.sign(
            {
                id: this.id,
                username: this.username,
                email: this.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    };

    User.prototype.generateRefreshToken = function () {
        return jwt.sign(
            { id: this.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    };

    return User;
};

export default UserModel;
