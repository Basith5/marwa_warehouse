/*
  Warnings:

  - You are about to alter the column `discount` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `netRate` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `add` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `saleRate` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `mrp` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `add` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `discount` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `mrp` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `netRate` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `saleRate` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `discount` DOUBLE NOT NULL,
    MODIFY `netRate` DOUBLE NOT NULL,
    MODIFY `add` DOUBLE NOT NULL,
    MODIFY `saleRate` DOUBLE NOT NULL,
    MODIFY `mrp` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `reports` MODIFY `add` DOUBLE NOT NULL,
    MODIFY `discount` DOUBLE NOT NULL,
    MODIFY `mrp` DOUBLE NOT NULL,
    MODIFY `netRate` DOUBLE NOT NULL,
    MODIFY `saleRate` DOUBLE NOT NULL;
