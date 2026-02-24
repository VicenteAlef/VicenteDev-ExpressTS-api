/*
  Warnings:

  - You are about to drop the column `authorId` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_authorId_fkey`;

-- DropIndex
DROP INDEX `projects_authorId_fkey` ON `projects`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `authorId`;
