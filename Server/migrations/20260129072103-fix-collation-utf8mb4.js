'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Change table collation
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    );

    // 2. Change specific columns just in case
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_settings MODIFY `key` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_settings MODIFY `value` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;'
    );

    // 3. Do the same for CMS Banners as they often have titles/text that might contain emojis
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_banners CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    );

    // 4. CMS Testimonials (definitely can have emojis/special chars)
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_testimonials CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    );

    // 5. CMS FAQs
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_faqs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting is optional but good practice, though usually we want to stay on utf8mb4
    await queryInterface.sequelize.query(
      'ALTER TABLE cms_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;'
    );
  }
};
