CREATE TABLE `crowdscribe`.`users` (
  `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `email` varchar(225)  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(225)  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `username` varchar(225)  CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `facebook_id` varchar(225)  CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM;

