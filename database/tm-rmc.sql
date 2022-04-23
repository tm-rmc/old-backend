--
-- Table structure for table `gamemodes`
--

DROP TABLE IF EXISTS `gamemodes`;
CREATE TABLE IF NOT EXISTS `gamemodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `isSponsorOnly` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gamemodes`
--

INSERT INTO `gamemodes` (`id`, `name`, `isEnabled`, `isSponsorOnly`) VALUES
(1, 'Race', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
CREATE TABLE IF NOT EXISTS `groups` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isAdminGroup` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`Id`, `name`, `isAdminGroup`) VALUES
(1, 'Administrator', 1),
(2, 'VIP', 0),
(3, 'Player', 0);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creatorId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gamemode` int(11) NOT NULL,
  `gamemodeSettings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}',
  `playersId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `accountId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clubTag` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSponsor` tinyint(1) NOT NULL DEFAULT 0,
  `groupId` int(11) NOT NULL DEFAULT 3,
  `sessionId` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`accountId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;