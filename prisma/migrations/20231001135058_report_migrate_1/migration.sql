-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `gst` INTEGER NOT NULL,
    `spl` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `add` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `discount` INTEGER NOT NULL,
    `mrp` INTEGER NOT NULL,
    `netRate` INTEGER NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `saleRate` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
