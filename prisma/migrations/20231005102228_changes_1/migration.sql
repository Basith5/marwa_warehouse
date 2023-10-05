/*
  Warnings:

  - Added the required column `invoiceNumber` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reports` ADD COLUMN `invoiceNumber` INTEGER NOT NULL;
