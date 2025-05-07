/*
  Warnings:

  - Added the required column `coverImageUrl` to the `passages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `passages` ADD COLUMN `coverImageUrl` VARCHAR(191) NOT NULL;
