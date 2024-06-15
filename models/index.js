const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
var { init, userTagCount } = require('../service/user-tag-count');

class Account extends Model {}
class User extends Model {}
class UserTagCount extends Model {}
class MicroTask extends Model {}
class MacroTask extends Model {}
class Chat extends Model {}
class Message extends Model {}
class Activity extends Model {}
class FileAttach extends Model {}
class History extends Model {}
class Project extends Model {}
class ProjectUser extends Model {}
class HistoryText extends Model {}
class MicroTaskUser extends Model {}
class MacroTaskUser extends Model {}
class ActivityUser extends Model {}

// Define models
User.init(
    {
        _id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
        },
        account_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dateOfBirth: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imgSrc: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userTag: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'user',
    },
);

ProjectUser.init(
    {
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'users', // should match the table name
                key: '_id',
            },
            allowNull: false,
        },
        project_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'projects', // should match the table name
                key: '_id',
            },
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'projectUser',
        timestamps: false,
    },
);

MicroTask.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        project_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'projects',
                key: '_id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            allowNull: true,
        },
        limits: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dependent: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        overview: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        activities_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        history_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'microTask',
    },
);

MacroTask.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        project_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'projects',
                key: '_id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            allowNull: true,
        },
        dependent: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        overview: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        microTasks_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        activities_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        history_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'macroTask',
    },
);

MicroTaskUser.init(
    {
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: '_id',
            },
            allowNull: false,
        },
        microTask_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'microTasks',
                key: '_id',
            },
        },
        userPermision: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'microTaskUser',
        tableName: 'microTaskUsers',
    },
);

MacroTaskUser.init(
    {
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: '_id',
            },
            allowNull: false,
        },
        macroTask_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'macroTasks',
                key: '_id',
            },
            allowNull: false,
        },
        userPermision: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'macroTaskUsers',
        modelName: 'macroTaskUser',
    },
);

ActivityUser.init(
    {
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: '_id',
            },
            allowNull: false,
        },
        activity_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'activities',
                key: '_id',
            },
            allowNull: false,
        },
        userPermision: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'activityUser',
    },
);

Chat.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
            autoIncrement: true,
        },
        microTask_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'microTasks',
                key: '_id',
            },
        },
        macroTask_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'macroTasks',
                key: '_id',
            },
        },
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'activities',
                key: '_id',
            },
        },
    },
    {
        sequelize,
        modelName: 'chat',
    },
);

Message.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'chats',
                key: '_id',
            },
            allowNull: false,
        },
        imgSrc: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: '_id',
            },
            onDelete: 'SET NULL',
            allowNull: false,
        },
        messageText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'message',
        underscored: true,
    },
);

Project.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'project',
    },
);

Activity.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        request: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        limits: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileAttach_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        history_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'activities',
        modelName: 'activity',
    },
);

History.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
            autoIncrement: true,
        },
        microTask_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'microTasks',
                key: '_id',
            },
        },
        macroTask_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'macroTasks',
                key: '_id',
            },
        },
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'activities',
                key: '_id',
            },
        },
        historyTexts_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'history',
    },
);

HistoryText.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        history_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'histories', // should match the table name
                key: '_id',
            },
        },
        entity: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'historyText',
    },
);

FileAttach.init(
    {
        _id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
            autoIncrement: true,
        },
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'activities',
                key: '_id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        src: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'fileAttach',
    },
);

Account.init(
    {
        _id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'account',
    },
);

UserTagCount.init(
    {
        count: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '000000',
        },
        uniqueKey: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: 'unique',
            primaryKey: true,
        },
    },
    {
        sequelize,
        modelName: 'userTagCount',
    },
);

// Define relationships
User.belongsTo(Account, { foreignKey: 'account_id' });
Account.hasOne(User, { foreignKey: 'account_id' });

ProjectUser.belongsTo(User, { foreignKey: 'user_id' });
ProjectUser.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(ProjectUser, { foreignKey: 'user_id' });
Project.hasMany(ProjectUser, { foreignKey: 'project_id' });

MicroTask.belongsTo(Project, { foreignKey: 'project_id' });
Project.hasMany(MicroTask, { foreignKey: 'project_id' });

MacroTask.belongsTo(Project, { foreignKey: 'project_id' });
Project.hasMany(MacroTask, { foreignKey: 'project_id' });

MicroTaskUser.belongsTo(User, { foreignKey: 'user_id' });
MicroTaskUser.belongsTo(MicroTask, { foreignKey: 'microTask_id' });
User.hasMany(MicroTaskUser, { foreignKey: 'user_id' });
MicroTask.hasMany(MicroTaskUser, { foreignKey: 'microTask_id' });

MacroTaskUser.belongsTo(User, { foreignKey: 'user_id' });
MacroTaskUser.belongsTo(MacroTask, { foreignKey: 'macroTask_id' });
User.hasMany(MacroTaskUser, { foreignKey: 'user_id' });
MacroTask.hasMany(MacroTaskUser, { foreignKey: 'macroTask_id' });

ActivityUser.belongsTo(User, { foreignKey: 'user_id' });
ActivityUser.belongsTo(Activity, { foreignKey: 'activity_id' });
User.hasMany(ActivityUser, { foreignKey: 'user_id' });
Activity.hasMany(ActivityUser, { foreignKey: 'activity_id' });

Chat.belongsTo(MicroTask, { foreignKey: 'microTask_id' });
Chat.belongsTo(MacroTask, { foreignKey: 'macroTask_id' });
Chat.belongsTo(Activity, { foreignKey: 'activity_id' });
MicroTask.hasOne(Chat, { foreignKey: 'microTask_id' });
MacroTask.hasOne(Chat, { foreignKey: 'macroTask_id' });
Activity.hasOne(Chat, { foreignKey: 'activity_id' });

Message.belongsTo(Chat, { foreignKey: 'chat_id' });
Message.belongsTo(User, { foreignKey: 'user_id' });
Chat.hasMany(Message, { foreignKey: 'chat_id' });
User.hasMany(Message, { foreignKey: 'user_id' });

History.belongsTo(MicroTask, { foreignKey: 'microTask_id' });
History.belongsTo(MacroTask, { foreignKey: 'macroTask_id' });
History.belongsTo(Activity, { foreignKey: 'activity_id' });
MicroTask.hasOne(History, { foreignKey: 'microTask_id' });
MacroTask.hasOne(History, { foreignKey: 'macroTask_id' });
Activity.hasOne(History, { foreignKey: 'activity_id' });
Chat.belongsTo(History, { foreignKey: 'history_id' });
History.hasOne(Chat, { foreignKey: 'history_id' });

HistoryText.belongsTo(History, { foreignKey: 'history_id' });
History.hasMany(HistoryText, { foreignKey: 'history_id' });

FileAttach.belongsTo(Activity, { foreignKey: 'activity_id' });
Activity.hasMany(FileAttach, { foreignKey: 'activity_id' });

// Sync database
sequelize
    .sync({ alter: true })
    .then(() => {
        init(UserTagCount, User);
        console.log('Database & tables created!');
    })
    .catch((error) => console.error('Error creating database & tables:', error));

module.exports = {
    Account,
    User,
    UserTagCount,
    MicroTask,
    MacroTask,
    Chat,
    Message,
    Activity,
    FileAttach,
    History,
    Project,
    ProjectUser,
    HistoryText,
    MicroTaskUser,
    MacroTaskUser,
    ActivityUser,
};
