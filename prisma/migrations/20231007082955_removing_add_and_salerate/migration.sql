/*
  Warnings:

  - You are about to drop the column `add` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `saleRate` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `add` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `saleRate` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `add`,
    DROP COLUMN `saleRate`;

-- AlterTable
ALTER TABLE `reports` DROP COLUMN `add`,
    DROP COLUMN `saleRate`;
