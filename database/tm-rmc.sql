--
-- Structure de la table `groups`
--

DROP TABLE IF EXISTS `groups`;
CREATE TABLE IF NOT EXISTS `groups` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isAdminGroup` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `groups`
--

INSERT INTO `groups` (`Id`, `name`, `isAdminGroup`) VALUES
(1, 'Administrator', 1),
(2, 'VIP', 0),
(3, 'Player', 0);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `accountId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clubTag` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSponsor` tinyint(1) NOT NULL DEFAULT 0,
  `groupId` int(11) NOT NULL DEFAULT 3,
  `sessionId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokenType` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`accountId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;