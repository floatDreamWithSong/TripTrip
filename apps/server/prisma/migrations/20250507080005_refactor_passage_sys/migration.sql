/*
  Warnings:

  - You are about to drop the `passage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passageimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passagetotag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_passagetotag` DROP FOREIGN KEY `_PassageToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_passagetotag` DROP FOREIGN KEY `_PassageToTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `passage` DROP FOREIGN KEY `Passage_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `passageimage` DROP FOREIGN KEY `PassageImage_pid_fkey`;

-- DropForeignKey
ALTER TABLE `passagetotag` DROP FOREIGN KEY `PassageToTag_passageId_fkey`;

-- DropForeignKey
ALTER TABLE `passagetotag` DROP FOREIGN KEY `PassageToTag_tagId_fkey`;

-- DropTable
DROP TABLE `passage`;

-- DropTable
DROP TABLE `passageimage`;

-- DropTable
DROP TABLE `passagetotag`;

-- DropTable
DROP TABLE `tag`;

-- CreateTable
CREATE TABLE `passages` (
    `pid` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorId` INTEGER NOT NULL,
    `last_edit_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publish_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `video_url` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `reason` VARCHAR(191) NULL,
    `views` INTEGER NOT NULL DEFAULT 0,

    INDEX `passages_publish_time_idx`(`publish_time`),
    INDEX `passages_last_edit_time_idx`(`last_edit_time`),
    PRIMARY KEY (`pid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passage_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tid` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`tid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passage_tags` (
    `passageId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    PRIMARY KEY (`passageId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `cid` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `passageId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comments_created_at_idx`(`created_at`),
    PRIMARY KEY (`cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passage_likes` (
    `userId` INTEGER NOT NULL,
    `passageId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `passageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_likes` (
    `userId` INTEGER NOT NULL,
    `commentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `userId` INTEGER NOT NULL,
    `passageId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `passageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_follows` (
    `followerId` INTEGER NOT NULL,
    `followingId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`followerId`, `followingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `passages` ADD CONSTRAINT `passages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passage_images` ADD CONSTRAINT `passage_images_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `passages`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passage_tags` ADD CONSTRAINT `passage_tags_passageId_fkey` FOREIGN KEY (`passageId`) REFERENCES `passages`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passage_tags` ADD CONSTRAINT `passage_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`tid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_passageId_fkey` FOREIGN KEY (`passageId`) REFERENCES `passages`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments`(`cid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passage_likes` ADD CONSTRAINT `passage_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passage_likes` ADD CONSTRAINT `passage_likes_passageId_fkey` FOREIGN KEY (`passageId`) REFERENCES `passages`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`cid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_passageId_fkey` FOREIGN KEY (`passageId`) REFERENCES `passages`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PassageToTag` ADD CONSTRAINT `_PassageToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `passages`(`pid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PassageToTag` ADD CONSTRAINT `_PassageToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`tid`) ON DELETE CASCADE ON UPDATE CASCADE;
