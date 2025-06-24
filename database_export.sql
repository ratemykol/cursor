-- RateMyKOL Database Export
-- Run this script in your new project to recreate the data

-- First, ensure tables exist by running: npm run db:push

-- Insert Users
INSERT INTO users (id, username, email, profile_image_url, bio, role, auth_type, created_at, updated_at) VALUES
('local_1750369664747_nw9qh8ufn', 'test', 'dddddddddddddddd@gmail.com', NULL, NULL, 'admin', 'local', '2025-06-19 21:47:44.756512', '2025-06-19 21:47:44.756512')
ON CONFLICT (id) DO NOTHING;

-- Insert Traders
INSERT INTO traders (id, name, wallet_address, bio, profile_image, specialty, verified, twitter_url, created_at, updated_at) VALUES
(4, 'Cupsey', 'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK', NULL, 'https://cdn.kolscan.io/profiles/suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK.png', 'GOAT', true, 'https://x.com/Cupseyy', '2025-06-19 16:17:23.498375', '2025-06-19 16:17:23.498375'),
(14, 'DV', 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd', NULL, 'https://unavatar.io/twitter/vibed333', NULL, true, 'https://x.com/vibed333', '2025-06-20 17:13:07.442504', '2025-06-20 17:13:07.442504'),
(15, 'Gake', 'DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm', NULL, 'https://unavatar.io/twitter/Ga__ke', NULL, true, 'https://x.com/Ga__ke', '2025-06-20 17:13:46.76616', '2025-06-20 17:13:46.76616'),
(16, 'Latuche', 'GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65', NULL, 'https://unavatar.io/twitter/Latuche95', NULL, true, 'https://x.com/Latuche95', '2025-06-20 18:20:29.737056', '2025-06-20 18:20:29.737056'),
(17, 'Jijo', '4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk', NULL, 'https://unavatar.io/twitter/jijo_exe', NULL, true, 'https://x.com/jijo_exe', '2025-06-20 18:20:30.71184', '2025-06-20 18:20:30.71184'),
(18, 'N''o', 'Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow', NULL, 'https://unavatar.io/twitter/Nosa1x', NULL, true, 'https://x.com/Nosa1x', '2025-06-20 18:20:31.743621', '2025-06-20 18:20:31.743621'),
(19, 'Kadenox', '3pZ59YENxDAcjaKa3sahZJBcgER4rGYi4v6BpPurmsGj', NULL, 'https://unavatar.io/twitter/kadenox', NULL, true, 'https://x.com/kadenox', '2025-06-20 18:20:31.906433', '2025-06-20 18:20:31.906433'),
(20, 'Pandora', 'UxuuMeyX2pZPHmGZ2w3Q8MysvExCAquMtvEfqp2etvm', NULL, 'https://unavatar.io/twitter/pandoraflips', NULL, true, 'https://x.com/pandoraflips', '2025-06-20 18:20:32.64668', '2025-06-20 18:20:32.64668'),
(21, 'Heyitsyolo', 'Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ', NULL, 'https://unavatar.io/twitter/Heyitsyolotv', NULL, true, 'https://x.com/Heyitsyolotv', '2025-06-20 18:20:33.600315', '2025-06-20 18:20:33.600315'),
(22, 'Beaver', 'GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN', NULL, 'https://unavatar.io/twitter/beaverd', NULL, true, 'https://x.com/beaverd', '2025-06-20 18:20:34.712481', '2025-06-20 18:20:34.712481'),
(23, 'Sebastian', '3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei', NULL, 'https://unavatar.io/twitter/Saint_pablo123', NULL, true, 'https://x.com/Saint_pablo123', '2025-06-20 18:20:35.64632', '2025-06-20 18:20:35.64632'),
(24, 'YOUNIZ', 'EKDDjxzJ39Bjkr47NiARGJDKFVxiiV9WNJ5XbtEhPEXP', NULL, 'https://unavatar.io/twitter/YOUNIZ_XLZ', NULL, true, 'https://x.com/YOUNIZ_XLZ', '2025-06-20 18:20:38.028', '2025-06-20 18:20:38.028'),
(25, 'West', 'JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN', NULL, 'https://unavatar.io/twitter/ratwizardx', NULL, true, 'https://x.com/ratwizardx', '2025-06-20 18:20:38.631152', '2025-06-20 18:20:38.631152'),
(26, '0xSevere', '9FNz4MjPUmnJqTf6yEDbL1D4SsHVh7uA8zRHhR5K138r', NULL, 'https://unavatar.io/twitter/0xSevere', NULL, true, 'https://x.com/0xSevere', '2025-06-20 18:20:38.714628', '2025-06-20 18:20:38.714628'),
(27, 'Letterbomb', 'BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr', NULL, 'https://unavatar.io/twitter/ihateoop', NULL, true, 'https://x.com/ihateoop', '2025-06-20 18:20:39.815735', '2025-06-20 18:20:39.815735'),
(28, 'The Doc', 'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt', NULL, 'https://unavatar.io/twitter/KayTheDoc', NULL, true, 'https://x.com/KayTheDoc', '2025-06-20 18:20:42.236262', '2025-06-20 18:20:42.236262'),
(29, 'Smokez', '5t9xBNuDdGTGpjaPTx6hKd7sdRJbvtKS8Mhq6qVbo8Qz', NULL, 'https://unavatar.io/twitter/SmokezXBT', NULL, true, 'https://x.com/SmokezXBT', '2025-06-20 18:20:43.660646', '2025-06-20 18:20:43.660646'),
(30, 'Boogie', '2m8Mc2ngJCmpbEEoYhwT9U929z6C4CPKLatWnR775u9a', NULL, 'https://unavatar.io/twitter/boogiepnl', NULL, true, 'https://x.com/boogiepnl', '2025-06-20 18:20:43.700993', '2025-06-20 18:20:43.700993'),
(31, 'Bandit', '5B79fMkcFeRTiwm7ehsZsFiKsC7m7n1Bgv9yLxPp9q2X', NULL, 'https://unavatar.io/twitter/bandeeeez', NULL, true, 'https://x.com/bandeeeez', '2025-06-20 18:20:44.352086', '2025-06-20 18:20:44.352086'),
(32, 'Ozark', 'DZAa55HwXgv5hStwaTEJGXZz1DhHejvpb7Yr762urXam', NULL, 'https://unavatar.io/twitter/ohzarke', NULL, true, 'https://x.com/ohzarke', '2025-06-20 18:20:44.638737', '2025-06-20 18:20:44.638737'),
(33, 'Groovy', '34ZEH778zL8ctkLwxxERLX5ZnUu6MuFyX9CWrs8kucMw', NULL, 'https://unavatar.io/twitter/0xGroovy', NULL, true, 'https://x.com/0xGroovy', '2025-06-20 18:20:46.290692', '2025-06-20 18:20:46.290692'),
(34, 'Mr Frog', '4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh', NULL, 'https://unavatar.io/twitter/TheMisterFrog', NULL, true, 'https://x.com/TheMisterFrog', '2025-06-20 18:20:46.70461', '2025-06-20 18:20:46.70461'),
(35, 'Classic', 'DsqRyTUh1R37asYcVf1KdX4CNnz5DKEFmnXvgT4NfTPE', NULL, 'https://unavatar.io/twitter/simplyclassic69', NULL, true, 'https://x.com/simplyclassic69', '2025-06-20 18:20:48.425504', '2025-06-20 18:20:48.425504'),
(36, 'Hail', 'HA1L7GhQfypSRdfBi3tCkkCVEdEcBVYqBSQCENCrwPuB', NULL, 'https://unavatar.io/twitter/ignHail', NULL, true, 'https://x.com/ignHail', '2025-06-20 18:20:51.997318', '2025-06-20 18:20:51.997318'),
(37, 'TIL', 'EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf', NULL, 'https://unavatar.io/twitter/tilcrypto', NULL, true, 'https://x.com/tilcrypto', '2025-06-20 18:20:52.739402', '2025-06-20 18:20:52.739402'),
(38, 'Goob', '9BkauJdFYUyBkNBZwV4mNNyfeVKhHvjULb7cL4gFQaLt', NULL, 'https://unavatar.io/twitter/ifullclipp', NULL, true, 'https://x.com/ifullclipp', '2025-06-20 18:20:53.703029', '2025-06-20 18:20:53.703029'),
(39, 'Fashr', '719sfKUjiMThumTt2u39VMGn612BZyCcwbM5Pe8SqFYz', NULL, 'https://unavatar.io/twitter/FASHRCrypto', NULL, true, 'https://x.com/FASHRCrypto', '2025-06-20 18:20:54.647268', '2025-06-20 18:20:54.647268'),
(40, 'Orange', '96sErVjEN7LNJ6Uvj63bdRWZxNuBngj56fnT9biHLKBf', NULL, 'https://unavatar.io/twitter/OrangeSBS', NULL, true, 'https://x.com/OrangeSBS', '2025-06-20 18:20:54.823245', '2025-06-20 18:20:54.823245'),
(41, 'Idontpaytaxes', '2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH', NULL, 'https://unavatar.io/twitter/untaxxable', NULL, true, 'https://x.com/untaxxable', '2025-06-20 18:20:55.649708', '2025-06-20 18:20:55.649708'),
(42, 'Mitch', '4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t', NULL, 'https://unavatar.io/twitter/idrawline', NULL, true, 'https://x.com/idrawline', '2025-06-20 18:20:55.90567', '2025-06-20 18:20:55.90567'),
(43, 'Meechie', 'EkdbN4v1v88Z8LjxhXWgLc8m1iZUqxUMS6vzNvEdTJkU', NULL, 'https://unavatar.io/twitter/973Meech', NULL, true, 'https://x.com/973Meech', '2025-06-20 18:20:56.086344', '2025-06-20 18:20:56.086344'),
(44, 'Xander', 'B3wagQZiZU2hKa5pUCj6rrdhWsX3Q6WfTTnki9PjwzMh', NULL, 'https://unavatar.io/twitter/xandereef', NULL, true, 'https://x.com/xandereef', '2025-06-20 18:20:56.835706', '2025-06-20 18:20:56.835706'),
(45, 'Qtdegen', '7tiRXPM4wwBMRMYzmywRAE6jveS3gDbNyxgRrEoU6RLA', NULL, 'https://unavatar.io/twitter/qtdegen', NULL, true, 'https://x.com/qtdegen', '2025-06-20 18:20:57.726586', '2025-06-20 18:20:57.726586'),
(46, 'Oura', '4WPTQA7BB4iRdrPhgNpJihGcxKh8T43gLjMn5PbEVfQw', NULL, 'https://unavatar.io/twitter/Oura456', NULL, true, 'https://x.com/Oura456', '2025-06-20 18:20:58.895208', '2025-06-20 18:20:58.895208'),
(47, 'Insentos', '7SDs3PjT2mswKQ7Zo4FTucn9gJdtuW4jaacPA65BseHS', NULL, 'https://unavatar.io/twitter/insentos', NULL, true, 'https://x.com/insentos', '2025-06-20 18:20:59.677846', '2025-06-20 18:20:59.677846'),
(48, 'Lynk', 'CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD', NULL, 'https://unavatar.io/twitter/lynk0x', NULL, true, 'https://x.com/lynk0x', '2025-06-20 18:21:00.693148', '2025-06-20 18:21:00.693148'),
(49, 'Issa', '2BU3NAzgRA2gg2MpzwwXpA8X4CCRaLgrf6TY1FKfJPX2', NULL, 'https://unavatar.io/twitter/issathecooker', NULL, true, 'https://x.com/issathecooker', '2025-06-20 18:21:01.875415', '2025-06-20 18:21:01.875415'),
(50, 'Leens', '7iabBMwmSvS4CFPcjW2XYZY53bUCHzXjCFEFhxeYP4CY', NULL, 'https://unavatar.io/twitter/leensx100', NULL, true, 'https://x.com/leensx100', '2025-06-20 18:21:03.687913', '2025-06-20 18:21:03.687913'),
(51, 'ShockedJS', '6m5sW6EAPAHncxnzapi1ZVJNRb9RZHQ3Bj7FD84X9rAF', NULL, 'https://unavatar.io/twitter/ShockedJS', NULL, true, 'https://x.com/ShockedJS', '2025-06-20 18:21:04.736905', '2025-06-20 18:21:04.736905'),
(52, 'Saif', 'BuhkHhM3j4viF71pMTd23ywxPhF35LUnc2QCLAvUxCdW', NULL, 'https://unavatar.io/twitter/degensaif', NULL, true, 'https://x.com/degensaif', '2025-06-20 18:21:05.688061', '2025-06-20 18:21:05.688061'),
(53, 'Henn100x', 'FRbUNvGxYNC1eFngpn7AD3f14aKKTJVC6zSMtvj2dyCS', NULL, 'https://unavatar.io/twitter/henn100x', NULL, true, 'https://x.com/henn100x', '2025-06-20 18:21:06.799286', '2025-06-20 18:21:06.799286'),
(54, 'CartiTheMenace', 'A6fVPXt9bqon1LQoJi4HQ5xkhavLKEo77N5CZef2jpmR', NULL, 'https://unavatar.io/twitter/CartiTheMenace', NULL, true, 'https://x.com/CartiTheMenace', '2025-06-20 18:21:07.945838', '2025-06-20 18:21:07.945838'),
(55, 'Red', '7ABz8qEFZTHPkovMDsmQkm64DZWN5wRtU7LEtD2ShkQ6', NULL, 'https://unavatar.io/twitter/redwithbag', NULL, true, 'https://x.com/redwithbag', '2025-06-20 18:21:08.66663', '2025-06-20 18:21:08.66663'),
(56, 'Cented', 'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o', NULL, 'https://unavatar.io/twitter/Cented7', NULL, true, 'https://x.com/Cented7', '2025-06-20 18:25:57.046782', '2025-06-20 18:25:57.046782'),
(59, 'Euris', 'N/A', NULL, 'https://unavatar.io/twitter/Euris_x', NULL, true, 'https://x.com/Euris_x', '2025-06-21 23:33:08.099805', '2025-06-21 23:33:08.099805')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to match the highest ID
SELECT setval('traders_id_seq', (SELECT MAX(id) FROM traders));

-- Note: No ratings data to import (table was empty)

-- Clean up: Remove these temporary export files after copying
-- rm database_export.sql copy_database_instructions.md