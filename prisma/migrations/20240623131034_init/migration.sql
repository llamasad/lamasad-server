-- CreateTable
CREATE TABLE "Account" (
    "_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "imgSrc" TEXT NOT NULL,
    "userTag" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ProjectUser" (
    "user_id" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "ProjectUser_pkey" PRIMARY KEY ("user_id","project_id")
);

-- CreateTable
CREATE TABLE "MicroTask" (
    "_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "project_id" INTEGER,
    "limits" TEXT,
    "dependent" TEXT[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT,
    "overview" TEXT,
    "activities_id" INTEGER[],
    "history_id" INTEGER NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "MicroTask_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "MacroTask" (
    "_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "project_id" INTEGER,
    "dependent" TEXT[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT,
    "overview" TEXT,
    "microTasks_id" INTEGER[],
    "activities_id" INTEGER[],
    "history_id" INTEGER NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "MacroTask_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "MicroTaskUser" (
    "user_id" TEXT NOT NULL,
    "microTask_id" INTEGER NOT NULL,
    "userPermision" TEXT NOT NULL,

    CONSTRAINT "MicroTaskUser_pkey" PRIMARY KEY ("user_id","microTask_id")
);

-- CreateTable
CREATE TABLE "MacroTaskUser" (
    "user_id" TEXT NOT NULL,
    "macroTask_id" INTEGER NOT NULL,
    "userPermision" TEXT NOT NULL,

    CONSTRAINT "MacroTaskUser_pkey" PRIMARY KEY ("user_id","macroTask_id")
);

-- CreateTable
CREATE TABLE "ActivityUser" (
    "user_id" TEXT NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "userPermision" TEXT NOT NULL,

    CONSTRAINT "ActivityUser_pkey" PRIMARY KEY ("user_id","activity_id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "_id" SERIAL NOT NULL,
    "microTask_id" INTEGER,
    "macroTask_id" INTEGER,
    "activity_id" INTEGER,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "_id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "imgSrc" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "limits" TEXT NOT NULL,
    "fileAttach_id" INTEGER[],
    "chat_id" INTEGER NOT NULL,
    "history_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "History" (
    "_id" SERIAL NOT NULL,
    "microTask_id" INTEGER,
    "macroTask_id" INTEGER,
    "activity_id" INTEGER,
    "historyTexts_id" INTEGER[],

    CONSTRAINT "History_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "HistoryText" (
    "_id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "history_id" INTEGER NOT NULL,
    "entity" TEXT[],

    CONSTRAINT "HistoryText_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "FileAttach" (
    "_id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "src" TEXT NOT NULL,

    CONSTRAINT "FileAttach_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "UserTagCount" (
    "count" TEXT NOT NULL,
    "uniqueKey" TEXT NOT NULL DEFAULT 'unique',

    CONSTRAINT "UserTagCount_pkey" PRIMARY KEY ("uniqueKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User__id_key" ON "User"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_account_id_key" ON "User"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_userTag_key" ON "User"("userTag");

-- CreateIndex
CREATE UNIQUE INDEX "MicroTask_history_id_key" ON "MicroTask"("history_id");

-- CreateIndex
CREATE UNIQUE INDEX "MicroTask_chat_id_key" ON "MicroTask"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "MacroTask_history_id_key" ON "MacroTask"("history_id");

-- CreateIndex
CREATE UNIQUE INDEX "MacroTask_chat_id_key" ON "MacroTask"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_microTask_id_key" ON "Chat"("microTask_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_macroTask_id_key" ON "Chat"("macroTask_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_activity_id_key" ON "Chat"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_key" ON "Project"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_chat_id_key" ON "Activity"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_history_id_key" ON "Activity"("history_id");

-- CreateIndex
CREATE UNIQUE INDEX "History_microTask_id_key" ON "History"("microTask_id");

-- CreateIndex
CREATE UNIQUE INDEX "History_macroTask_id_key" ON "History"("macroTask_id");

-- CreateIndex
CREATE UNIQUE INDEX "History_activity_id_key" ON "History"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserTagCount_uniqueKey_key" ON "UserTagCount"("uniqueKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroTask" ADD CONSTRAINT "MicroTask_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroTask" ADD CONSTRAINT "MacroTask_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroTaskUser" ADD CONSTRAINT "MicroTaskUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroTaskUser" ADD CONSTRAINT "MicroTaskUser_microTask_id_fkey" FOREIGN KEY ("microTask_id") REFERENCES "MicroTask"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroTaskUser" ADD CONSTRAINT "MacroTaskUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroTaskUser" ADD CONSTRAINT "MacroTaskUser_macroTask_id_fkey" FOREIGN KEY ("macroTask_id") REFERENCES "MacroTask"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityUser" ADD CONSTRAINT "ActivityUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityUser" ADD CONSTRAINT "ActivityUser_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_microTask_id_fkey" FOREIGN KEY ("microTask_id") REFERENCES "MicroTask"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_macroTask_id_fkey" FOREIGN KEY ("macroTask_id") REFERENCES "MacroTask"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_microTask_id_fkey" FOREIGN KEY ("microTask_id") REFERENCES "MicroTask"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_macroTask_id_fkey" FOREIGN KEY ("macroTask_id") REFERENCES "MacroTask"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryText" ADD CONSTRAINT "HistoryText_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "History"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttach" ADD CONSTRAINT "FileAttach_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
