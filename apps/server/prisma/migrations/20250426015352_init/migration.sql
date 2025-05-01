-- CreateTable
CREATE TABLE `users` (
    `uid` INTEGER NOT NULL AUTO_INCREMENT,
    `openId` VARCHAR(191) NOT NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `phone` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `userType` INTEGER NOT NULL DEFAULT 0,
    `email` VARCHAR(191) NULL,
    `private_id` VARCHAR(191) NULL,
    `register_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
