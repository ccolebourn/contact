-- Test Data for Contact Service
-- This script creates sample households, people, organizations, and their contact information

-- ============================================================
-- 1. Create Households
-- ============================================================

-- First, create some addresses that will be used as primary household addresses
INSERT INTO Address (address_line_1, address_line_2, city_locality, region_code, postal_code, country_iso_code) VALUES
('123 Maple Street', NULL, 'Boston', 'MA', '02101', 'US'),
('456 Oak Avenue', 'Apt 5B', 'Cambridge', 'MA', '02138', 'US'),
('789 Pine Road', NULL, 'Brookline', 'MA', '02446', 'US'),
('321 Elm Drive', NULL, 'Somerville', 'MA', '02143', 'US'),
('654 Birch Lane', NULL, 'Newton', 'MA', '02458', 'US'),
('987 Cedar Court', NULL, 'Quincy', 'MA', '02169', 'US');

-- Create households with primary addresses
INSERT INTO Household (household_name, primary_address_id) VALUES
('The Smith Family', 1),
('The Johnson Family', 2),
('The Williams Family', 3),
('The Brown Family', 4),
('The Davis Family', 5),
('The Miller Family', 6);

-- ============================================================
-- 2. Create People
-- ============================================================

INSERT INTO Person (first_name, middle_name, last_name, birth_year, birth_month, birth_day, preferred_language, household_id) VALUES
-- Smith Family
('John', 'Michael', 'Smith', 1985, 3, 15, 'en', 1),
('Sarah', 'Elizabeth', 'Smith', 1987, 7, 22, 'en', 1),
('Emma', 'Grace', 'Smith', 2015, 5, 10, 'en', 1),
('Liam', 'James', 'Smith', 2017, 11, 3, 'en', 1),

-- Johnson Family
('Robert', 'William', 'Johnson', 1982, 1, 8, 'en', 2),
('Jennifer', 'Marie', 'Johnson', 1984, 9, 14, 'en', 2),
('Olivia', 'Rose', 'Johnson', 2012, 4, 25, 'en', 2),

-- Williams Family
('Michael', 'Anthony', 'Williams', 1990, 6, 30, 'en', 3),
('Jessica', 'Lynn', 'Williams', 1991, 12, 5, 'en', 3),
('Noah', 'Alexander', 'Williams', 2018, 2, 18, 'en', 3),

-- Brown Family
('David', 'James', 'Brown', 1978, 8, 12, 'en', 4),
('Emily', 'Anne', 'Brown', 1980, 10, 20, 'en', 4),
('Sophia', 'Isabella', 'Brown', 2013, 7, 8, 'en', 4),
('Mason', 'Ethan', 'Brown', 2016, 3, 27, 'en', 4),

-- Davis Family
('Christopher', 'Lee', 'Davis', 1988, 4, 5, 'en', 5),
('Amanda', 'Nicole', 'Davis', 1989, 11, 16, 'en', 5),
('Ava', 'Charlotte', 'Davis', 2019, 9, 9, 'en', 5),

-- Miller Family
('Daniel', 'Thomas', 'Miller', 1975, 2, 28, 'en', 6),
('Michelle', 'Renee', 'Miller', 1977, 5, 15, 'en', 6),
('Isabella', 'Mia', 'Miller', 2010, 1, 22, 'en', 6),

-- Single individuals (no household)
('James', 'Robert', 'Anderson', 1995, 8, 10, 'en', NULL),
('Maria', 'Elena', 'Garcia', 1992, 3, 18, 'es', NULL),
('Kevin', 'Patrick', 'O''Connor', 1983, 12, 7, 'en', NULL);

-- ============================================================
-- 3. Create Email Addresses
-- ============================================================

INSERT INTO Email (email_address, email_type) VALUES
-- Smith Family
('john.smith@techcorp.com', 'WORK'),
('john.smith.personal@gmail.com', 'PERSONAL'),
('sarah.smith@designstudio.com', 'WORK'),
('sarah.smith@gmail.com', 'PERSONAL'),

-- Johnson Family
('robert.johnson@lawfirm.com', 'WORK'),
('rjohnson@gmail.com', 'PERSONAL'),
('jennifer.johnson@hospital.org', 'WORK'),
('jjohnson@yahoo.com', 'PERSONAL'),

-- Williams Family
('michael.williams@startup.io', 'WORK'),
('mwilliams@outlook.com', 'PERSONAL'),
('jessica.williams@university.edu', 'WORK'),
('jwilliams@gmail.com', 'PERSONAL'),

-- Brown Family
('david.brown@engineering.com', 'WORK'),
('dbrown@hotmail.com', 'PERSONAL'),
('emily.brown@school.edu', 'WORK'),
('ebrown@gmail.com', 'PERSONAL'),

-- Davis Family
('chris.davis@consulting.com', 'WORK'),
('cdavis@gmail.com', 'PERSONAL'),
('amanda.davis@marketing.com', 'WORK'),
('adavis@yahoo.com', 'PERSONAL'),

-- Miller Family
('daniel.miller@finance.com', 'WORK'),
('dmiller@gmail.com', 'PERSONAL'),
('michelle.miller@realty.com', 'WORK'),
('mmiller@outlook.com', 'PERSONAL'),

-- Singles
('james.anderson@freelance.com', 'WORK'),
('janderson@gmail.com', 'PERSONAL'),
('maria.garcia@translation.com', 'WORK'),
('mgarcia@gmail.com', 'PERSONAL'),
('kevin.oconnor@consulting.com', 'WORK'),
('koconnor@gmail.com', 'PERSONAL');

-- ============================================================
-- 4. Link Emails to People (ContactEmail)
-- ============================================================

INSERT INTO ContactEmail (contact_id, email_id, contact_entity_type, is_primary) VALUES
-- John Smith (person_id: 1)
(1, 1, 'PERSON', TRUE),
(1, 2, 'PERSON', FALSE),
-- Sarah Smith (person_id: 2)
(2, 3, 'PERSON', TRUE),
(2, 4, 'PERSON', FALSE),
-- Robert Johnson (person_id: 5)
(5, 5, 'PERSON', TRUE),
(5, 6, 'PERSON', FALSE),
-- Jennifer Johnson (person_id: 6)
(6, 7, 'PERSON', TRUE),
(6, 8, 'PERSON', FALSE),
-- Michael Williams (person_id: 8)
(8, 9, 'PERSON', TRUE),
(8, 10, 'PERSON', FALSE),
-- Jessica Williams (person_id: 9)
(9, 11, 'PERSON', TRUE),
(9, 12, 'PERSON', FALSE),
-- David Brown (person_id: 11)
(11, 13, 'PERSON', TRUE),
(11, 14, 'PERSON', FALSE),
-- Emily Brown (person_id: 12)
(12, 15, 'PERSON', TRUE),
(12, 16, 'PERSON', FALSE),
-- Christopher Davis (person_id: 15)
(15, 17, 'PERSON', TRUE),
(15, 18, 'PERSON', FALSE),
-- Amanda Davis (person_id: 16)
(16, 19, 'PERSON', TRUE),
(16, 20, 'PERSON', FALSE),
-- Daniel Miller (person_id: 18)
(18, 21, 'PERSON', TRUE),
(18, 22, 'PERSON', FALSE),
-- Michelle Miller (person_id: 19)
(19, 23, 'PERSON', TRUE),
(19, 24, 'PERSON', FALSE),
-- James Anderson (person_id: 21)
(21, 25, 'PERSON', TRUE),
(21, 26, 'PERSON', FALSE),
-- Maria Garcia (person_id: 22)
(22, 27, 'PERSON', TRUE),
(22, 28, 'PERSON', FALSE),
-- Kevin O'Connor (person_id: 23)
(23, 29, 'PERSON', TRUE),
(23, 30, 'PERSON', FALSE);

-- ============================================================
-- 5. Create Phone Numbers
-- ============================================================

INSERT INTO Phone (country_code, area_code, local_number, phone_type, extension) VALUES
-- Smith Family
('+1', '617', '555-0101', 'MOBILE', NULL),
('+1', '617', '555-0102', 'MOBILE', NULL),
-- Johnson Family
('+1', '617', '555-0201', 'MOBILE', NULL),
('+1', '617', '555-0202', 'OFFICE', '1234'),
('+1', '617', '555-0203', 'MOBILE', NULL),
-- Williams Family
('+1', '617', '555-0301', 'MOBILE', NULL),
('+1', '617', '555-0302', 'MOBILE', NULL),
-- Brown Family
('+1', '617', '555-0401', 'MOBILE', NULL),
('+1', '617', '555-0402', 'OFFICE', '5678'),
('+1', '617', '555-0403', 'MOBILE', NULL),
('+1', '617', '555-0404', 'HOME', NULL),
-- Davis Family
('+1', '617', '555-0501', 'MOBILE', NULL),
('+1', '617', '555-0502', 'MOBILE', NULL),
-- Miller Family
('+1', '617', '555-0601', 'MOBILE', NULL),
('+1', '617', '555-0602', 'OFFICE', '9999'),
('+1', '617', '555-0603', 'MOBILE', NULL),
-- Singles
('+1', '617', '555-0701', 'MOBILE', NULL),
('+1', '617', '555-0801', 'MOBILE', NULL),
('+1', '617', '555-0901', 'MOBILE', NULL),
('+1', '617', '555-0902', 'OFFICE', '2020');

-- ============================================================
-- 6. Link Phones to People (ContactPhone)
-- ============================================================

INSERT INTO ContactPhone (contact_id, phone_id, contact_entity_type, is_primary) VALUES
-- John Smith (person_id: 1)
(1, 1, 'PERSON', TRUE),
-- Sarah Smith (person_id: 2)
(2, 2, 'PERSON', TRUE),
-- Robert Johnson (person_id: 5)
(5, 3, 'PERSON', TRUE),
(5, 4, 'PERSON', FALSE),
-- Jennifer Johnson (person_id: 6)
(6, 5, 'PERSON', TRUE),
-- Michael Williams (person_id: 8)
(8, 6, 'PERSON', TRUE),
-- Jessica Williams (person_id: 9)
(9, 7, 'PERSON', TRUE),
-- David Brown (person_id: 11)
(11, 8, 'PERSON', TRUE),
(11, 9, 'PERSON', FALSE),
-- Emily Brown (person_id: 12)
(12, 10, 'PERSON', TRUE),
(12, 11, 'PERSON', FALSE),
-- Christopher Davis (person_id: 15)
(15, 12, 'PERSON', TRUE),
-- Amanda Davis (person_id: 16)
(16, 13, 'PERSON', TRUE),
-- Daniel Miller (person_id: 18)
(18, 14, 'PERSON', TRUE),
(18, 15, 'PERSON', FALSE),
-- Michelle Miller (person_id: 19)
(19, 16, 'PERSON', TRUE),
-- James Anderson (person_id: 21)
(21, 17, 'PERSON', TRUE),
-- Maria Garcia (person_id: 22)
(22, 18, 'PERSON', TRUE),
-- Kevin O'Connor (person_id: 23)
(23, 19, 'PERSON', TRUE),
(23, 20, 'PERSON', FALSE);

-- ============================================================
-- 7. Create Additional Addresses (for non-household members and work addresses)
-- ============================================================

INSERT INTO Address (address_line_1, address_line_2, city_locality, region_code, postal_code, country_iso_code) VALUES
-- Work addresses
('100 Tech Park Drive', 'Suite 200', 'Boston', 'MA', '02110', 'US'),
('200 Design Plaza', NULL, 'Cambridge', 'MA', '02139', 'US'),
('300 Legal Center', 'Floor 10', 'Boston', 'MA', '02108', 'US'),
('400 Medical Building', NULL, 'Boston', 'MA', '02115', 'US'),
-- Singles' addresses
('555 Bachelor Pad Lane', 'Apt 12', 'Boston', 'MA', '02116', 'US'),
('666 Independence Street', NULL, 'Cambridge', 'MA', '02140', 'US'),
('777 Solo Drive', 'Unit 5', 'Somerville', 'MA', '02144', 'US');

-- ============================================================
-- 8. Link Addresses to People (ContactAddress)
-- ============================================================

-- Link household addresses to people
INSERT INTO ContactAddress (contact_id, address_id, address_type, contact_entity_type) VALUES
-- Smith Family (address_id: 1)
(1, 1, 'HOME', 'PERSON'),
(2, 1, 'HOME', 'PERSON'),
(3, 1, 'HOME', 'PERSON'),
(4, 1, 'HOME', 'PERSON'),
-- Johnson Family (address_id: 2)
(5, 2, 'HOME', 'PERSON'),
(6, 2, 'HOME', 'PERSON'),
(7, 2, 'HOME', 'PERSON'),
-- Williams Family (address_id: 3)
(8, 3, 'HOME', 'PERSON'),
(9, 3, 'HOME', 'PERSON'),
(10, 3, 'HOME', 'PERSON'),
-- Brown Family (address_id: 4)
(11, 4, 'HOME', 'PERSON'),
(12, 4, 'HOME', 'PERSON'),
(13, 4, 'HOME', 'PERSON'),
(14, 4, 'HOME', 'PERSON'),
-- Davis Family (address_id: 5)
(15, 5, 'HOME', 'PERSON'),
(16, 5, 'HOME', 'PERSON'),
(17, 5, 'HOME', 'PERSON'),
-- Miller Family (address_id: 6)
(18, 6, 'HOME', 'PERSON'),
(19, 6, 'HOME', 'PERSON'),
(20, 6, 'HOME', 'PERSON'),

-- Add work addresses for employed adults
(1, 7, 'OFFICE', 'PERSON'),   -- John Smith work
(2, 8, 'OFFICE', 'PERSON'),   -- Sarah Smith work
(5, 9, 'OFFICE', 'PERSON'),   -- Robert Johnson work
(6, 10, 'OFFICE', 'PERSON'),  -- Jennifer Johnson work

-- Singles' home addresses
(21, 11, 'HOME', 'PERSON'),   -- James Anderson
(22, 12, 'HOME', 'PERSON'),   -- Maria Garcia
(23, 13, 'HOME', 'PERSON');   -- Kevin O'Connor

-- ============================================================
-- 9. Create Organizations
-- ============================================================

INSERT INTO Organization (name, website, parent_organization_id) VALUES
('TechCorp Solutions', 'https://www.techcorp.com', NULL),
('Design Studio Inc', 'https://www.designstudio.com', NULL),
('Boston Law Firm LLP', 'https://www.bostonlaw.com', NULL),
('City Hospital', 'https://www.cityhospital.org', NULL),
('Startup Innovation Labs', 'https://www.startup.io', NULL);

-- Create organization addresses
INSERT INTO Address (address_line_1, address_line_2, city_locality, region_code, postal_code, country_iso_code) VALUES
('1000 Innovation Way', NULL, 'Boston', 'MA', '02110', 'US'),
('2000 Creative Boulevard', 'Suite 500', 'Cambridge', 'MA', '02139', 'US'),
('3000 Justice Plaza', NULL, 'Boston', 'MA', '02108', 'US'),
('4000 Healthcare Drive', NULL, 'Boston', 'MA', '02115', 'US'),
('5000 Startup Street', NULL, 'Cambridge', 'MA', '02142', 'US');

-- Create organization emails
INSERT INTO Email (email_address, email_type) VALUES
('info@techcorp.com', 'WORK'),
('contact@designstudio.com', 'WORK'),
('reception@bostonlaw.com', 'WORK'),
('info@cityhospital.org', 'WORK'),
('hello@startup.io', 'WORK');

-- Create organization phones
INSERT INTO Phone (country_code, area_code, local_number, phone_type, extension) VALUES
('+1', '617', '555-1000', 'OFFICE', NULL),
('+1', '617', '555-2000', 'OFFICE', NULL),
('+1', '617', '555-3000', 'OFFICE', NULL),
('+1', '617', '555-4000', 'OFFICE', NULL),
('+1', '617', '555-5000', 'OFFICE', NULL);

-- Link organizations to their contact info
INSERT INTO ContactEmail (contact_id, email_id, contact_entity_type, is_primary) VALUES
(1, 31, 'ORGANIZATION', TRUE),  -- TechCorp
(2, 32, 'ORGANIZATION', TRUE),  -- Design Studio
(3, 33, 'ORGANIZATION', TRUE),  -- Boston Law
(4, 34, 'ORGANIZATION', TRUE),  -- City Hospital
(5, 35, 'ORGANIZATION', TRUE);  -- Startup Labs

INSERT INTO ContactPhone (contact_id, phone_id, contact_entity_type, is_primary) VALUES
(1, 21, 'ORGANIZATION', TRUE),  -- TechCorp
(2, 22, 'ORGANIZATION', TRUE),  -- Design Studio
(3, 23, 'ORGANIZATION', TRUE),  -- Boston Law
(4, 24, 'ORGANIZATION', TRUE),  -- City Hospital
(5, 25, 'ORGANIZATION', TRUE);  -- Startup Labs

INSERT INTO ContactAddress (contact_id, address_id, address_type, contact_entity_type) VALUES
(1, 14, 'OFFICE', 'ORGANIZATION'),  -- TechCorp
(2, 15, 'OFFICE', 'ORGANIZATION'),  -- Design Studio
(3, 16, 'OFFICE', 'ORGANIZATION'),  -- Boston Law
(4, 17, 'OFFICE', 'ORGANIZATION'),  -- City Hospital
(5, 18, 'OFFICE', 'ORGANIZATION');  -- Startup Labs

-- ============================================================
-- 10. Create Person-Organization Roles
-- ============================================================

INSERT INTO PersonOrganizationRole (person_id, organization_id, role_id, start_date, end_date) VALUES
-- Current roles
(1, 1, 12, '2020-01-15', NULL),      -- John Smith - Technical Lead at TechCorp
(2, 2, 6, '2019-03-01', NULL),       -- Sarah Smith - Manager at Design Studio
(5, 3, 5, '2015-06-01', NULL),       -- Robert Johnson - Director at Boston Law
(6, 4, 6, '2018-09-15', NULL),       -- Jennifer Johnson - Manager at City Hospital
(8, 5, 1, '2021-01-01', NULL);       -- Michael Williams - CEO at Startup Labs

-- ============================================================
-- 11. Create Person Relationships
-- ============================================================

INSERT INTO PersonRelationship (person_id_1, person_id_2, relationship_type_id, status, start_date) VALUES
-- Smith Family
(1, 2, 1, 'CURRENT', '2010-06-15'),  -- John & Sarah are spouses
(1, 3, 3, 'CURRENT', '2015-05-10'),  -- John is parent of Emma
(1, 4, 3, 'CURRENT', '2017-11-03'),  -- John is parent of Liam
(2, 3, 3, 'CURRENT', '2015-05-10'),  -- Sarah is parent of Emma
(2, 4, 3, 'CURRENT', '2017-11-03'),  -- Sarah is parent of Liam
(3, 4, 5, 'CURRENT', NULL),          -- Emma & Liam are siblings

-- Johnson Family
(5, 6, 1, 'CURRENT', '2008-08-20'),  -- Robert & Jennifer are spouses
(5, 7, 3, 'CURRENT', '2012-04-25'),  -- Robert is parent of Olivia
(6, 7, 3, 'CURRENT', '2012-04-25'),  -- Jennifer is parent of Olivia

-- Williams Family
(8, 9, 1, 'CURRENT', '2014-09-12'),  -- Michael & Jessica are spouses
(8, 10, 3, 'CURRENT', '2018-02-18'), -- Michael is parent of Noah
(9, 10, 3, 'CURRENT', '2018-02-18'), -- Jessica is parent of Noah

-- Brown Family
(11, 12, 1, 'CURRENT', '2005-07-04'), -- David & Emily are spouses
(11, 13, 3, 'CURRENT', '2013-07-08'), -- David is parent of Sophia
(11, 14, 3, 'CURRENT', '2016-03-27'), -- David is parent of Mason
(12, 13, 3, 'CURRENT', '2013-07-08'), -- Emily is parent of Sophia
(12, 14, 3, 'CURRENT', '2016-03-27'), -- Emily is parent of Mason
(13, 14, 5, 'CURRENT', NULL),         -- Sophia & Mason are siblings

-- Davis Family
(15, 16, 1, 'CURRENT', '2012-05-25'), -- Christopher & Amanda are spouses
(15, 17, 3, 'CURRENT', '2019-09-09'), -- Christopher is parent of Ava
(16, 17, 3, 'CURRENT', '2019-09-09'), -- Amanda is parent of Ava

-- Miller Family
(18, 19, 1, 'CURRENT', '2000-12-31'), -- Daniel & Michelle are spouses
(18, 20, 3, 'CURRENT', '2010-01-22'), -- Daniel is parent of Isabella
(19, 20, 3, 'CURRENT', '2010-01-22'); -- Michelle is parent of Isabella

-- ============================================================
-- Summary Statistics
-- ============================================================

-- Display summary
SELECT 'Test Data Summary' AS info;
SELECT COUNT(*) AS total_people FROM Person;
SELECT COUNT(*) AS total_households FROM Household;
SELECT COUNT(*) AS total_organizations FROM Organization;
SELECT COUNT(*) AS total_emails FROM Email;
SELECT COUNT(*) AS total_phones FROM Phone;
SELECT COUNT(*) AS total_addresses FROM Address;
SELECT COUNT(*) AS total_person_emails FROM ContactEmail WHERE contact_entity_type = 'PERSON';
SELECT COUNT(*) AS total_person_phones FROM ContactPhone WHERE contact_entity_type = 'PERSON';
SELECT COUNT(*) AS total_person_addresses FROM ContactAddress WHERE contact_entity_type = 'PERSON';
SELECT COUNT(*) AS total_relationships FROM PersonRelationship;
SELECT COUNT(*) AS total_person_org_roles FROM PersonOrganizationRole;

SELECT 'Test data loaded successfully!' AS status;
