/*
  Warnings:

  - A unique constraint covering the columns `[openId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_openId_key` ON `users`(`openId`);

-- CreateIndex
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);
