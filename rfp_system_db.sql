-- =============================================
-- RFP System - MySQL Database with Seed Data
-- =============================================
-- Import this file into MySQL:
--   mysql -u root -p < rfp_system_db.sql
--
-- Or from MySQL prompt:
--   SOURCE /path/to/rfp_system_db.sql;
--
-- PASSWORD NOTE:
--   All seed users have password: 12345
--   The hash below is bcrypt ($2y$10$) of "12345".
--   If your framework generates a different hash format,
--   just register a fresh user via the API and it will work.
--   Or run this in PHP/tinker to get the hash:
--     echo password_hash('12345', PASSWORD_BCRYPT);
-- =============================================

-- =============================================
-- TABLE STRUCTURE
-- =============================================

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `name` VARCHAR(200) GENERATED ALWAYS AS (CONCAT(`firstname`, ' ', `lastname`)) STORED,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `type` ENUM('admin', 'vendor') NOT NULL DEFAULT 'vendor',
  `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  `otp` VARCHAR(10) DEFAULT NULL,
  `otp_expires_at` DATETIME DEFAULT NULL,
  `api_token` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vendor_details` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `no_of_employees` VARCHAR(50) NOT NULL,
  `revenue` VARCHAR(255) NOT NULL COMMENT 'Comma-separated: "year1,year2,year3"',
  `pancard_no` VARCHAR(20) NOT NULL,
  `gst_no` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_details_user_id_unique` (`user_id`),
  CONSTRAINT `vendor_details_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vendor_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_categories_unique` (`user_id`, `category_id`),
  CONSTRAINT `vc_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vc_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rfps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` BIGINT UNSIGNED NOT NULL,
  `rfp_no` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_description` TEXT DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `last_date` DATE NOT NULL,
  `minimum_price` DECIMAL(12, 2) NOT NULL,
  `maximum_price` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfps_rfp_no_unique` (`rfp_no`),
  CONSTRAINT `rfps_admin_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rfp_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rfp_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfp_categories_unique` (`rfp_id`, `category_id`),
  CONSTRAINT `rc_rfp_id_fk` FOREIGN KEY (`rfp_id`) REFERENCES `rfps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rc_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rfp_vendors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rfp_id` BIGINT UNSIGNED NOT NULL,
  `vendor_id` BIGINT UNSIGNED NOT NULL,
  `applied_status` ENUM('open', 'applied') NOT NULL DEFAULT 'open',
  `item_price` DECIMAL(12, 2) DEFAULT NULL,
  `total_cost` DECIMAL(12, 2) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `applied_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfp_vendors_unique` (`rfp_id`, `vendor_id`),
  CONSTRAINT `rv_rfp_id_fk` FOREIGN KEY (`rfp_id`) REFERENCES `rfps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rv_vendor_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================
-- SEED DATA
-- =============================================
-- bcrypt hash of "12345" — all users have this password
-- If this hash doesn't work with your framework, register
-- a new user through the app or generate your own hash.
-- =============================================

SET @pw = '$2y$10$xLShkiIBSq0g47Xn0J4VhOZrYfPH6LJL0sqDILqSdNU9Y7p0Fkqwm';


-- ----- ADMIN USERS (id: 1-2) -----

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`, `mobile`, `type`, `status`, `created_at`) VALUES
(1, 'Chandan', 'Pandey', 'chandan.pandey@velsof.com', @pw, '9876543210', 'admin', 'Approved', '2026-01-01 10:00:00'),
(2, 'Rahul',   'Sharma', 'rahul.sharma@velsof.com',   @pw, '9876543211', 'admin', 'Approved', '2026-01-02 10:00:00');


-- ----- VENDOR USERS (id: 3-12) -----
-- Mix of Approved, Pending, and Rejected

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`, `mobile`, `type`, `status`, `created_at`) VALUES
(3,  'Tarun',    'Goel',      'tarun.goel@velsof.com',       @pw, '9812345001', 'vendor', 'Approved', '2026-01-05 10:00:00'),
(4,  'Priya',    'Mehta',     'priya.mehta@techsupply.in',   @pw, '9812345002', 'vendor', 'Approved', '2026-01-06 10:00:00'),
(5,  'Amit',     'Verma',     'amit.verma@officemart.in',    @pw, '9812345003', 'vendor', 'Approved', '2026-01-07 10:00:00'),
(6,  'Sneha',    'Kapoor',    'sneha.kapoor@furnworld.in',   @pw, '9812345004', 'vendor', 'Approved', '2026-01-08 10:00:00'),
(7,  'Vikram',   'Singh',     'vikram.singh@eleczone.in',    @pw, '9812345005', 'vendor', 'Approved', '2026-01-09 10:00:00'),
(8,  'Neha',     'Agarwal',   'neha.agarwal@printpro.in',    @pw, '9812345006', 'vendor', 'Approved', '2026-01-10 10:00:00'),
(9,  'Rajesh',   'Kumar',     'rajesh.kumar@buildwell.in',   @pw, '9812345007', 'vendor', 'Pending',  '2026-01-12 10:00:00'),
(10, 'Anjali',   'Deshmukh',  'anjali.d@cleanserv.in',       @pw, '9812345008', 'vendor', 'Pending',  '2026-01-13 10:00:00'),
(11, 'Suresh',   'Reddy',     'suresh.reddy@packking.in',    @pw, '9812345009', 'vendor', 'Rejected', '2026-01-14 10:00:00'),
(12, 'Kavita',   'Joshi',     'kavita.joshi@safetyplus.in',  @pw, '9812345010', 'vendor', 'Approved', '2026-01-15 10:00:00');


-- ----- VENDOR DETAILS -----

INSERT INTO `vendor_details` (`user_id`, `no_of_employees`, `revenue`, `pancard_no`, `gst_no`) VALUES
(3,  '150', '5000000,6200000,7500000',   'ABCPG1234A', '07ABCPG1234A1Z5'),
(4,  '80',  '3200000,3800000,4100000',   'DEFPM5678B', '27DEFPM5678B1Z2'),
(5,  '45',  '1800000,2100000,2500000',   'GHIAV9012C', '09GHIAV9012C1Z8'),
(6,  '200', '8000000,9500000,11000000',  'JKLSK3456D', '29JKLSK3456D1Z4'),
(7,  '120', '4500000,5000000,5800000',   'MNOPV7890E', '06MNOPV7890E1Z1'),
(8,  '35',  '1200000,1500000,1800000',   'QRSNA2345F', '33QRSNA2345F1Z7'),
(9,  '60',  '2500000,2800000,3200000',   'TUVRK6789G', '19TUVRK6789G1Z3'),
(10, '25',  '900000,1100000,1300000',    'WXYAD1234H', '24WXYAD1234H1Z9'),
(11, '90',  '3500000,4000000,4800000',   'BCDER5678I', '32BCDER5678I1Z6'),
(12, '70',  '2800000,3200000,3900000',   'FGHKJ9012J', '08FGHKJ9012J1Z0');


-- ----- CATEGORIES (id: 1-12) -----

INSERT INTO `categories` (`id`, `name`, `status`, `created_at`) VALUES
(1,  'Hardware',           'Active',   '2026-01-01 10:00:00'),
(2,  'Software Services',  'Active',   '2026-01-01 10:00:00'),
(3,  'Electrical',         'Active',   '2026-01-01 10:00:00'),
(4,  'Stationery',         'Active',   '2026-01-01 10:00:00'),
(5,  'Furniture',          'Active',   '2026-01-01 10:00:00'),
(6,  'Computers',          'Active',   '2026-01-01 10:00:00'),
(7,  'Cleaning Supplies',  'Active',   '2026-01-01 10:00:00'),
(8,  'Safety Equipment',   'Active',   '2026-01-01 10:00:00'),
(9,  'Packaging',          'Active',   '2026-01-01 10:00:00'),
(10, 'Printing Services',  'Active',   '2026-01-01 10:00:00'),
(11, 'Construction',       'Inactive', '2026-01-01 10:00:00'),
(12, 'Catering',           'Inactive', '2026-01-01 10:00:00');


-- ----- VENDOR ↔ CATEGORY MAPPING -----
-- Each vendor belongs to 2-4 categories

INSERT INTO `vendor_categories` (`user_id`, `category_id`) VALUES
-- Tarun Goel: Hardware, Computers, Electrical
(3, 1), (3, 6), (3, 3),
-- Priya Mehta: Software Services, Computers
(4, 2), (4, 6),
-- Amit Verma: Stationery, Printing Services
(5, 4), (5, 10),
-- Sneha Kapoor: Furniture, Cleaning Supplies
(6, 5), (6, 7),
-- Vikram Singh: Electrical, Hardware, Safety Equipment
(7, 3), (7, 1), (7, 8),
-- Neha Agarwal: Printing Services, Stationery, Packaging
(8, 10), (8, 4), (8, 9),
-- Rajesh Kumar (Pending): Construction, Hardware
(9, 11), (9, 1),
-- Anjali Deshmukh (Pending): Cleaning Supplies
(10, 7),
-- Suresh Reddy (Rejected): Packaging, Safety Equipment
(11, 9), (11, 8),
-- Kavita Joshi: Safety Equipment, Electrical, Cleaning Supplies
(12, 8), (12, 3), (12, 7);


-- ----- RFPs (id: 1-10) -----
-- Created by admin id=1, mix of open/closed

INSERT INTO `rfps` (`id`, `admin_id`, `rfp_no`, `item_name`, `item_description`, `quantity`, `last_date`, `minimum_price`, `maximum_price`, `status`, `created_at`) VALUES
(1,  1, 'RFP-2026-001', 'Desktop Computers',       'Dell OptiPlex or equivalent desktop computers for new office setup. i5 processor, 16GB RAM, 512GB SSD minimum.',                 50,  '2026-03-15', 35000.00,  55000.00,  'open',   '2026-01-15 10:00:00'),
(2,  1, 'RFP-2026-002', 'Office Chairs',            'Ergonomic office chairs with lumbar support, adjustable height, and armrests. Black mesh back preferred.',                       100, '2026-03-20', 5000.00,   15000.00,  'open',   '2026-01-18 10:00:00'),
(3,  1, 'RFP-2026-003', 'LED Panel Lights',         '2x2 feet LED panel lights, 40W, cool white 6500K, for office ceiling grid installation.',                                       200, '2026-02-28', 800.00,    2000.00,   'open',   '2026-01-20 10:00:00'),
(4,  1, 'RFP-2026-004', 'A4 Copier Paper',          'A4 size 75 GSM copier paper, white, 500 sheets per ream. Need monthly supply for 6 months.',                                   500, '2026-03-01', 200.00,    400.00,    'open',   '2026-01-22 10:00:00'),
(5,  1, 'RFP-2026-005', 'Annual Software Licenses',  'Microsoft 365 Business Standard licenses for 200 users. Annual subscription with admin portal access.',                        200, '2026-04-01', 8000.00,   15000.00,  'open',   '2026-01-25 10:00:00'),
(6,  1, 'RFP-2026-006', 'Fire Extinguishers',       'ABC type fire extinguishers, 5kg capacity, ISI marked. For office and warehouse.',                                               30,  '2026-02-15', 1500.00,   3500.00,   'closed', '2026-01-10 10:00:00'),
(7,  1, 'RFP-2026-007', 'Office Cleaning Contract',  'Daily office cleaning services for 50,000 sq ft area. Includes restrooms, pantry, and common areas. 1 year contract.',          1,   '2026-02-10', 150000.00, 300000.00, 'closed', '2026-01-08 10:00:00'),
(8,  1, 'RFP-2026-008', 'Packaging Boxes',           'Corrugated cardboard boxes, 18x12x12 inches, 5-ply. For product shipping.',                                                   1000,'2026-03-10', 25.00,     60.00,     'open',   '2026-01-28 10:00:00'),
(9,  2, 'RFP-2026-009', 'Visitor ID Card Printing',  'PVC visitor ID cards with lanyard. Full color print, company logo. Batch of 2000.',                                            2000,'2026-03-05', 15.00,     40.00,     'open',   '2026-02-01 10:00:00'),
(10, 2, 'RFP-2026-010', 'Conference Table',           'Boardroom conference table, 12-seater, premium wood finish with cable management ports and power outlets.',                     2,   '2026-02-20', 40000.00,  80000.00,  'closed', '2026-01-05 10:00:00');


-- ----- RFP ↔ CATEGORY MAPPING -----

INSERT INTO `rfp_categories` (`rfp_id`, `category_id`) VALUES
-- RFP-001 Desktop Computers → Hardware, Computers
(1, 1), (1, 6),
-- RFP-002 Office Chairs → Furniture
(2, 5),
-- RFP-003 LED Panel Lights → Electrical
(3, 3),
-- RFP-004 A4 Copier Paper → Stationery
(4, 4),
-- RFP-005 Software Licenses → Software Services, Computers
(5, 2), (5, 6),
-- RFP-006 Fire Extinguishers → Safety Equipment
(6, 8),
-- RFP-007 Office Cleaning → Cleaning Supplies
(7, 7),
-- RFP-008 Packaging Boxes → Packaging
(8, 9),
-- RFP-009 ID Card Printing → Printing Services, Stationery
(9, 10), (9, 4),
-- RFP-010 Conference Table → Furniture
(10, 5);


-- ----- RFP ↔ VENDOR ASSIGNMENTS + QUOTES -----
-- Vendors are assigned to RFPs based on their categories.
-- Some have submitted quotes (applied_status = 'applied').

INSERT INTO `rfp_vendors` (`rfp_id`, `vendor_id`, `applied_status`, `item_price`, `total_cost`, `description`, `applied_at`, `created_at`) VALUES

-- RFP-001 Desktop Computers (open) → Tarun, Vikram
(1, 3, 'applied', 42000.00, 2100000.00, 'Dell OptiPlex 7010, i5-13500, 16GB DDR4, 512GB SSD. 3 year warranty included.', '2026-01-20 14:00:00', '2026-01-15 10:00:00'),
(1, 7, 'applied', 45500.00, 2275000.00, 'HP ProDesk 400 G9, i5-12500, 16GB RAM, 512GB SSD. On-site warranty 3 years.',  '2026-01-22 11:00:00', '2026-01-15 10:00:00'),

-- RFP-002 Office Chairs (open) → Sneha (applied), Kavita (pending)
-- Sneha has Furniture cat, Kavita has Cleaning (admin can assign related vendors)
(2, 6,  'applied', 8500.00, 850000.00, 'Featherlite Optima HB mesh chair. 3 year warranty, free installation.', '2026-01-25 15:00:00', '2026-01-18 10:00:00'),
(2, 12, 'open',    NULL,     NULL,      NULL, NULL, '2026-01-18 10:00:00'),

-- RFP-003 LED Panel Lights (open) → Vikram (applied), Tarun (pending)
(3, 7, 'applied', 1200.00, 240000.00, 'Philips 40W LED panel, 6500K, 4000 lumens. BIS certified.', '2026-01-28 10:00:00', '2026-01-20 10:00:00'),
(3, 3, 'open',    NULL,    NULL,       NULL, NULL, '2026-01-20 10:00:00'),

-- RFP-004 A4 Copier Paper (open) → Amit (applied), Neha (applied)
(4, 5, 'applied', 280.00, 140000.00, 'JK Copier 75 GSM A4 paper. Delivery within 3 days of each monthly order.', '2026-01-26 09:00:00', '2026-01-22 10:00:00'),
(4, 8, 'applied', 260.00, 130000.00, 'Century Pulp A4 paper 75 GSM. Free delivery above 100 reams.',            '2026-01-27 16:00:00', '2026-01-22 10:00:00'),

-- RFP-005 Software Licenses (open) → Priya (pending), Tarun (pending)
(5, 4, 'open', NULL, NULL, NULL, NULL, '2026-01-25 10:00:00'),
(5, 3, 'open', NULL, NULL, NULL, NULL, '2026-01-25 10:00:00'),

-- RFP-006 Fire Extinguishers (closed) → Vikram (applied), Kavita (applied)
(6, 7,  'applied', 2200.00, 66000.00, 'Cease Fire ABC 5kg, ISI mark IS:15683. Includes wall mount bracket.',  '2026-01-14 13:00:00', '2026-01-10 10:00:00'),
(6, 12, 'applied', 2500.00, 75000.00, 'Safex ABC 5kg, BIS certified. Free installation and first inspection.', '2026-01-15 10:00:00', '2026-01-10 10:00:00'),

-- RFP-007 Office Cleaning (closed) → Sneha (applied), Kavita (applied)
(7, 6,  'applied', 220000.00, 220000.00, '15 staff, daily cleaning Mon-Sat. Includes all cleaning supplies and equipment.', '2026-01-12 10:00:00', '2026-01-08 10:00:00'),
(7, 12, 'applied', 195000.00, 195000.00, '12 trained staff. Eco-friendly products. Quarterly deep cleaning included.',      '2026-01-13 14:00:00', '2026-01-08 10:00:00'),

-- RFP-008 Packaging Boxes (open) → Neha (applied), Suresh (pending)
-- Neha has Packaging cat, Suresh has Packaging cat (but is Rejected — still assigned for demo)
(8, 8,  'applied', 42.00, 42000.00, '5-ply corrugated, 18x12x12 inch. Custom print available at extra cost.', '2026-02-02 11:00:00', '2026-01-28 10:00:00'),
(8, 11, 'open',    NULL,  NULL,      NULL, NULL, '2026-01-28 10:00:00'),

-- RFP-009 ID Card Printing (open) → Neha (applied), Amit (pending)
(9, 8, 'applied', 22.00, 44000.00, 'PVC cards, full color both sides, with lanyard. 7 working day delivery.', '2026-02-05 16:00:00', '2026-02-01 10:00:00'),
(9, 5, 'open',    NULL,  NULL,      NULL, NULL, '2026-02-01 10:00:00'),

-- RFP-010 Conference Table (closed) → Sneha (applied)
(10, 6, 'applied', 62000.00, 124000.00, 'Solid wood with veneer finish, built-in cable trays, 6 power outlets. 4-6 week delivery.', '2026-01-10 14:00:00', '2026-01-05 10:00:00');


-- =============================================
-- EXPECTED DASHBOARD STATS WITH THIS DATA
-- =============================================
-- Admin Dashboard:
--   Total RFPs:       10
--   Open RFPs:         7
--   Total Vendors:    10
--   Total Categories: 12
--
-- Vendor Dashboard examples:
--   Tarun Goel (id=3): Assigned: 3 (RFP 1,3,5) | Submitted: 1 (RFP 1) | Pending: 2 (RFP 3,5)
--   Sneha Kapoor (id=6): Assigned: 3 (RFP 2,7,10) | Submitted: 3 (all applied)
--   Neha Agarwal (id=8): Assigned: 3 (RFP 4,8,9) | Submitted: 3 (all applied)
--   Amit Verma (id=5): Assigned: 2 (RFP 4,9) | Submitted: 1 (RFP 4) | Pending: 1 (RFP 9)
-- =============================================


-- =============================================
-- NOTES FOR API DEVELOPER
-- =============================================
--
-- LOGIN ACCOUNTS FOR TESTING:
--   Admin:  chandan.pandey@velsof.com / 12345
--   Admin:  rahul.sharma@velsof.com / 12345
--   Vendor: tarun.goel@velsof.com / 12345 (Approved)
--   Vendor: priya.mehta@techsupply.in / 12345 (Approved)
--   Vendor: rajesh.kumar@buildwell.in / 12345 (Pending - can't login)
--   Vendor: suresh.reddy@packking.in / 12345 (Rejected - can't login)
--
-- AUTHENTICATION:
--   POST /api/login
--     → Query users by email, verify bcrypt password
--     → Only status='Approved' users can login
--     → Generate random api_token, save to users.api_token, return it
--     → Response: { response, user_id, type, name, email, token }
--
--   POST /api/registeradmin
--     → Insert users with type='admin', status='Approved'
--
--   POST /api/registervendor
--     → 1. Insert users with type='vendor', status='Pending'
--     → 2. Insert vendor_details
--     → 3. Insert vendor_categories for each category ID
--
-- PASSWORD RESET:
--   POST /api/forgetPassword → Generate OTP, save to users.otp, send email
--   POST /api/resetPassword  → Verify old_password, generate OTP, send email
--   POST /api/confirmotpresetPassword → Verify OTP, update password, clear otp
--
-- VENDORS:
--   GET /api/vendorlist → All vendors with their category names
--   GET /api/vendorlist/:category_id → Vendors filtered by category
--   POST /api/approveVendor → status=1 → Approved, status=2 → Rejected
--
-- CATEGORIES:
--   GET  /api/categories         → All categories
--   GET  /api/categories/:id     → Single category
--   POST /api/categories         → Create (field: category_name)
--   POST /api/categories/:id     → Update (field: category_name, _method=put)
--   POST /api/categories/status/:id → Toggle Active/Inactive (_method=put)
--   DELETE /api/categories/delete/:id → Delete category
--
-- RFPs:
--   POST /api/createrfp    → Create RFP + insert rfp_categories + rfp_vendors
--   POST /api/rfp/:id      → Update RFP (_method=put)
--   GET  /api/rfp/all      → All RFPs (with categories/vendors as CSV)
--   GET  /api/rfp/:id      → Single RFP details
--   GET  /api/rfp/closerfp/:id → Close an RFP (set status='closed')
--   GET  /api/rfp/getrfp/:vendor_id → Vendor's assigned RFPs
--   POST /api/rfp/apply/:id → Vendor submits quote (_method=put)
--   GET  /api/rfp/quotes/:id → Admin: all quotes / Vendor: own quote
--
-- RESPONSE FORMAT:
--   All HTTP 200. Check "response" field for success/error.
--   Success: { "response": "success", ... }
--   Error:   { "response": "error", "error": "msg" | ["msg1","msg2"] }
--   All POST = multipart/form-data
--   PUT via POST with _method=put
--   Auth: Authorization: Bearer <token>
-- =============================================
