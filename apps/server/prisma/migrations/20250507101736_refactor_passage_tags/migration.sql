/*
  Warnings:

  - You are about to drop the `_passagetotag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_passagetotag` DROP FOREIGN KEY `_PassageToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_passagetotag` DROP FOREIGN KEY `_PassageToTag_B_fkey`;

-- DropTable
DROP TABLE `_passagetotag`;
