-- CreateTable
CREATE TABLE `users` (
    `uid` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `avatar` VARCHAR(191) NOT NULL,
    `userType` INTEGER NOT NULL DEFAULT 0,
    `register_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Passage` (
    `pid` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `last_edit_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publish_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `video_url` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`pid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PassageImage` (
    `pid` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`pid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `tid` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`tid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PassageToTag` (
    `passageId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    PRIMARY KEY (`passageId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PassageToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PassageToTag_AB_unique`(`A`, `B`),
    INDEX `_PassageToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Passage` ADD CONSTRAINT `Passage_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PassageImage` ADD CONSTRAINT `PassageImage_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `Passage`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PassageToTag` ADD CONSTRAINT `PassageToTag_passageId_fkey` FOREIGN KEY (`passageId`) REFERENCES `Passage`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PassageToTag` ADD CONSTRAINT `PassageToTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`tid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PassageToTag` ADD CONSTRAINT `_PassageToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Passage`(`pid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PassageToTag` ADD CONSTRAINT `_PassageToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`tid`) ON DELETE CASCADE ON UPDATE CASCADE;
