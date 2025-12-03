-- 1.1 Country Lookup (ISO Standard)
CREATE TABLE Country (
    iso_code_2 CHAR(2) PRIMARY KEY,         -- e.g., 'US', 'GB' (ISO 3166-1 alpha-2)
    country_name VARCHAR(100) NOT NULL
);

-- Insert standard country codes and names
INSERT INTO Country (iso_code_2, country_name) VALUES
('AF', 'Afghanistan'),
('AX', 'Åland Islands'),
('AL', 'Albania'),
('DZ', 'Algeria'),
('AS', 'American Samoa'),
('AD', 'Andorra'),
('AO', 'Angola'),
('AI', 'Anguilla'),
('AQ', 'Antarctica'),
('AG', 'Antigua and Barbuda'),
('AR', 'Argentina'),
('AM', 'Armenia'),
('AW', 'Aruba'),
('AU', 'Australia'),
('AT', 'Austria'),
('AZ', 'Azerbaijan'),
('BS', 'Bahamas'),
('BH', 'Bahrain'),
('BD', 'Bangladesh'),
('BB', 'Barbados'),
('BY', 'Belarus'),
('BE', 'Belgium'),
('BZ', 'Belize'),
('BJ', 'Benin'),
('BM', 'Bermuda'),
('BT', 'Bhutan'),
('BO', 'Bolivia, Plurinational State of'),
('BQ', 'Bonaire, Sint Eustatius and Saba'),
('BA', 'Bosnia and Herzegovina'),
('BW', 'Botswana'),
('BV', 'Bouvet Island'),
('BR', 'Brazil'),
('IO', 'British Indian Ocean Territory'),
('BN', 'Brunei Darussalam'),
('BG', 'Bulgaria'),
('BF', 'Burkina Faso'),
('BI', 'Burundi'),
('CV', 'Cabo Verde'),
('KH', 'Cambodia'),
('CM', 'Cameroon'),
('CA', 'Canada'),
('KY', 'Cayman Islands'),
('CF', 'Central African Republic'),
('TD', 'Chad'),
('CL', 'Chile'),
('CN', 'China'),
('CX', 'Christmas Island'),
('CC', 'Cocos (Keeling) Islands'),
('CO', 'Colombia'),
('KM', 'Comoros'),
('CG', 'Congo'),
('CD', 'Congo, The Democratic Republic of the'),
('CK', 'Cook Islands'),
('CR', 'Costa Rica'),
('CI', 'Côte d''Ivoire'),
('HR', 'Croatia'),
('CU', 'Cuba'),
('CW', 'Curaçao'),
('CY', 'Cyprus'),
('CZ', 'Czechia'),
('DK', 'Denmark'),
('DJ', 'Djibouti'),
('DM', 'Dominica'),
('DO', 'Dominican Republic'),
('EC', 'Ecuador'),
('EG', 'Egypt'),
('SV', 'El Salvador'),
('GQ', 'Equatorial Guinea'),
('ER', 'Eritrea'),
('EE', 'Estonia'),
('SZ', 'Eswatini'),
('ET', 'Ethiopia'),
('FK', 'Falkland Islands (Malvinas)'),
('FO', 'Faroe Islands'),
('FJ', 'Fiji'),
('FI', 'Finland'),
('FR', 'France'),
('GF', 'French Guiana'),
('PF', 'French Polynesia'),
('TF', 'French Southern Territories'),
('GA', 'Gabon'),
('GM', 'Gambia'),
('GE', 'Georgia'),
('DE', 'Germany'),
('GH', 'Ghana'),
('GI', 'Gibraltar'),
('GR', 'Greece'),
('GL', 'Greenland'),
('GD', 'Grenada'),
('GP', 'Guadeloupe'),
('GU', 'Guam'),
('GT', 'Guatemala'),
('GG', 'Guernsey'),
('GN', 'Guinea'),
('GW', 'Guinea-Bissau'),
('GY', 'Guyana'),
('HT', 'Haiti'),
('HM', 'Heard Island and McDonald Islands'),
('VA', 'Holy See (Vatican City State)'),
('HN', 'Honduras'),
('HK', 'Hong Kong'),
('HU', 'Hungary'),
('IS', 'Iceland'),
('IN', 'India'),
('ID', 'Indonesia'),
('IR', 'Iran, Islamic Republic of'),
('IQ', 'Iraq'),
('IE', 'Ireland'),
('IM', 'Isle of Man'),
('IL', 'Israel'),
('IT', 'Italy'),
('JM', 'Jamaica'),
('JP', 'Japan'),
('JE', 'Jersey'),
('JO', 'Jordan'),
('KZ', 'Kazakhstan'),
('KE', 'Kenya'),
('KI', 'Kiribati'),
('KP', 'Korea, Democratic People''s Republic of'),
('KR', 'Korea, Republic of'),
('KW', 'Kuwait'),
('KG', 'Kyrgyzstan'),
('LA', 'Lao People''s Democratic Republic'),
('LV', 'Latvia'),
('LB', 'Lebanon'),
('LS', 'Lesotho'),
('LR', 'Liberia'),
('LY', 'Libya'),
('LI', 'Liechtenstein'),
('LT', 'Lithuania'),
('LU', 'Luxembourg'),
('MO', 'Macao'),
('MG', 'Madagascar'),
('MW', 'Malawi'),
('MY', 'Malaysia'),
('MV', 'Maldives'),
('ML', 'Mali'),
('MT', 'Malta'),
('MH', 'Marshall Islands'),
('MQ', 'Martinique'),
('MR', 'Mauritania'),
('MU', 'Mauritius'),
('YT', 'Mayotte'),
('MX', 'Mexico'),
('FM', 'Micronesia, Federated States of'),
('MD', 'Moldova, Republic of'),
('MC', 'Monaco'),
('MN', 'Mongolia'),
('ME', 'Montenegro'),
('MS', 'Montserrat'),
('MA', 'Morocco'),
('MZ', 'Mozambique'),
('MM', 'Myanmar'),
('NA', 'Namibia'),
('NR', 'Nauru'),
('NP', 'Nepal'),
('NL', 'Netherlands'),
('NC', 'New Caledonia'),
('NZ', 'New Zealand'),
('NI', 'Nicaragua'),
('NE', 'Niger'),
('NG', 'Nigeria'),
('NU', 'Niue'),
('NF', 'Norfolk Island'),
('MK', 'North Macedonia'),
('MP', 'Northern Mariana Islands'),
('NO', 'Norway'),
('OM', 'Oman'),
('PK', 'Pakistan'),
('PW', 'Palau'),
('PS', 'Palestine, State of'),
('PA', 'Panama'),
('PG', 'Papua New Guinea'),
('PY', 'Paraguay'),
('PE', 'Peru'),
('PH', 'Philippines'),
('PN', 'Pitcairn'),
('PL', 'Poland'),
('PT', 'Portugal'),
('PR', 'Puerto Rico'),
('QA', 'Qatar'),
('RE', 'Réunion'),
('RO', 'Romania'),
('RU', 'Russian Federation'),
('RW', 'Rwanda'),
('BL', 'Saint Barthélemy'),
('SH', 'Saint Helena, Ascension and Tristan da Cunha'),
('KN', 'Saint Kitts and Nevis'),
('LC', 'Saint Lucia'),
('MF', 'Saint Martin (French part)'),
('PM', 'Saint Pierre and Miquelon'),
('VC', 'Saint Vincent and the Grenadines'),
('WS', 'Samoa'),
('SM', 'San Marino'),
('ST', 'Sao Tome and Principe'),
('SA', 'Saudi Arabia'),
('SN', 'Senegal'),
('RS', 'Serbia'),
('SC', 'Seychelles'),
('SL', 'Sierra Leone'),
('SG', 'Singapore'),
('SX', 'Sint Maarten (Dutch part)'),
('SK', 'Slovakia'),
('SI', 'Slovenia'),
('SB', 'Solomon Islands'),
('SO', 'Somalia'),
('ZA', 'South Africa'),
('GS', 'South Georgia and the South Sandwich Islands'),
('SS', 'South Sudan'),
('ES', 'Spain'),
('LK', 'Sri Lanka'),
('SD', 'Sudan'),
('SR', 'Suriname'),
('SJ', 'Svalbard and Jan Mayen'),
('SE', 'Sweden'),
('CH', 'Switzerland'),
('SY', 'Syrian Arab Republic'),
('TW', 'Taiwan, Province of China'),
('TJ', 'Tajikistan'),
('TZ', 'Tanzania, United Republic of'),
('TH', 'Thailand'),
('TL', 'Timor-Leste'),
('TG', 'Togo'),
('TK', 'Tokelau'),
('TO', 'Tonga'),
('TT', 'Trinidad and Tobago'),
('TN', 'Tunisia'),
('TR', 'Türkiye'),
('TM', 'Turkmenistan'),
('TC', 'Turks and Caicos Islands'),
('TV', 'Tuvalu'),
('UG', 'Uganda'),
('UA', 'Ukraine'),
('AE', 'United Arab Emirates'),
('GB', 'United Kingdom of Great Britain and Northern Ireland'),
('US', 'United States of America'),
('UM', 'United States Minor Outlying Islands'),
('UY', 'Uruguay'),
('UZ', 'Uzbekistan'),
('VU', 'Vanuatu'),
('VE', 'Venezuela, Bolivarian Republic of'),
('VN', 'Viet Nam'),
('VG', 'Virgin Islands, British'),
('VI', 'Virgin Islands, U.S.'),
('WF', 'Wallis and Futuna'),
('EH', 'Western Sahara'),
('YE', 'Yemen'),
('ZM', 'Zambia'),
('ZW', 'Zimbabwe');


-- 1.2 Role Lookup
CREATE TABLE Role (
    role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL      -- e.g., 'Primary Contact', 'CEO'
);

INSERT INTO Role (role_name) VALUES
('CEO'),
('Owner'),
('President'),
('Vice President'),
('Director'),
('Manager'),
('Supervisor'),
('Team Lead'),
('Employee'),
('Primary Contact'),          -- A key business contact (may not be a specific title)
('Billing Administrator'),
('Technical Lead'),
('Sales Representative'),
('Marketing Coordinator');


-- 1.3 RelationshipType Lookup
CREATE TABLE RelationshipType (
    relationship_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,           -- e.g., 'Spouse', 'Child', 'Partner'
    is_symmetrical BOOLEAN NOT NULL DEFAULT FALSE -- e.g., Spouse is symmetrical, Parent/Child is not
);

INSERT INTO RelationshipType (name, is_symmetrical) VALUES
('Spouse', TRUE),
('Partner', TRUE),
('Child', FALSE),
('Parent', FALSE),
('Sibling', TRUE);

-- For keeping track of states, regions, provinces internationally
CREATE TABLE Region (
    country_iso_code CHAR(2) NOT NULL,
    region_code VARCHAR(10) NOT NULL,             -- e.g., 'CA' (for US), 'ON' (for Canada)
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    
    -- 🔑 Composite Primary Key: Guarantees uniqueness across countries (e.g., 'US' + 'CA')
    PRIMARY KEY (country_iso_code, region_code),
    
    -- Foreign Key: Links to the Country table
    CONSTRAINT fk_region_country FOREIGN KEY (country_iso_code) 
        REFERENCES Country(iso_code_2)
);

INSERT INTO Region (country_iso_code, region_code, name, type) VALUES
('US', 'AL', 'Alabama', 'State'),
('US', 'AK', 'Alaska', 'State'),
('US', 'AZ', 'Arizona', 'State'),
('US', 'AR', 'Arkansas', 'State'),
('US', 'CA', 'California', 'State'),
('US', 'CO', 'Colorado', 'State'),
('US', 'CT', 'Connecticut', 'State'),
('US', 'DE', 'Delaware', 'State'),
('US', 'DC', 'District of Columbia', 'District'),
('US', 'FL', 'Florida', 'State'),
('US', 'GA', 'Georgia', 'State'),
('US', 'HI', 'Hawaii', 'State'),
('US', 'ID', 'Idaho', 'State'),
('US', 'IL', 'Illinois', 'State'),
('US', 'IN', 'Indiana', 'State'),
('US', 'IA', 'Iowa', 'State'),
('US', 'KS', 'Kansas', 'State'),
('US', 'KY', 'Kentucky', 'State'),
('US', 'LA', 'Louisiana', 'State'),
('US', 'ME', 'Maine', 'State'),
('US', 'MD', 'Maryland', 'State'),
('US', 'MA', 'Massachusetts', 'State'),
('US', 'MI', 'Michigan', 'State'),
('US', 'MN', 'Minnesota', 'State'),
('US', 'MS', 'Mississippi', 'State'),
('US', 'MO', 'Missouri', 'State'),
('US', 'MT', 'Montana', 'State'),
('US', 'NE', 'Nebraska', 'State'),
('US', 'NV', 'Nevada', 'State'),
('US', 'NH', 'New Hampshire', 'State'),
('US', 'NJ', 'New Jersey', 'State'),
('US', 'NM', 'New Mexico', 'State'),
('US', 'NY', 'New York', 'State'),
('US', 'NC', 'North Carolina', 'State'),
('US', 'ND', 'North Dakota', 'State'),
('US', 'OH', 'Ohio', 'State'),
('US', 'OK', 'Oklahoma', 'State'),
('US', 'OR', 'Oregon', 'State'),
('US', 'PA', 'Pennsylvania', 'State'),
('US', 'RI', 'Rhode Island', 'State'),
('US', 'SC', 'South Carolina', 'State'),
('US', 'SD', 'South Dakota', 'State'),
('US', 'TN', 'Tennessee', 'State'),
('US', 'TX', 'Texas', 'State'),
('US', 'UT', 'Utah', 'State'),
('US', 'VT', 'Vermont', 'State'),
('US', 'VA', 'Virginia', 'State'),
('US', 'WA', 'Washington', 'State'),
('US', 'WV', 'West Virginia', 'State'),
('US', 'WI', 'Wisconsin', 'State'),
('US', 'WY', 'Wyoming', 'State');

INSERT INTO Region (country_iso_code, region_code, name, type) VALUES
('CA', 'AB', 'Alberta', 'Province'),
('CA', 'BC', 'British Columbia', 'Province'),
('CA', 'MB', 'Manitoba', 'Province'),
('CA', 'NB', 'New Brunswick', 'Province'),
('CA', 'NL', 'Newfoundland and Labrador', 'Province'),
('CA', 'NS', 'Nova Scotia', 'Province'),
('CA', 'NT', 'Northwest Territories', 'Territory'),
('CA', 'NU', 'Nunavut', 'Territory'),
('CA', 'ON', 'Ontario', 'Province'),
('CA', 'PE', 'Prince Edward Island', 'Province'),
('CA', 'QC', 'Quebec', 'Province'),
('CA', 'SK', 'Saskatchewan', 'Province'),
('CA', 'YT', 'Yukon', 'Territory');


-- 2.1 Address Table (International Address Details)
CREATE TABLE Address (
    address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    address_line_3 VARCHAR(255),
    city_locality VARCHAR(100) NOT NULL,
    region_code VARCHAR(10),         -- State/Province/Region
    postal_code VARCHAR(20),
    country_iso_code CHAR(2) NOT NULL, 
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_address_region_composite 
    FOREIGN KEY (country_iso_code, region_code) 
    REFERENCES Region(country_iso_code, region_code)
);
CREATE INDEX idx_address_postal_code ON Address (postal_code);


-- 2.2 Household Table
CREATE TABLE Household (
    household_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_name VARCHAR(100) NOT NULL,       -- e.g., 'The Smith Family'
    primary_address_id INT,
    
    CONSTRAINT fk_primary_address FOREIGN KEY (primary_address_id) REFERENCES Address(address_id)
);

-- 3.1 Person Table
CREATE TABLE Person (
    person_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    birth_year SMALLINT,                        -- Year of birth (for age tracking)
    birth_month SMALLINT,                       -- Month of birth (1-12)
    birth_day SMALLINT,                         -- Day of birth (1-31)
    preferred_language VARCHAR(5),              -- e.g., 'en', 'fr'
    household_id INT,
    
    CONSTRAINT fk_household FOREIGN KEY (household_id) REFERENCES Household(household_id)
);
CREATE INDEX idx_person_last_name ON Person (last_name);


-- 3.2 Organization Table (Supports Hierarchy)
CREATE TABLE Organization (
    organization_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    website VARCHAR(255),
    parent_organization_id INT,                 -- Self-referencing FK for hierarchy
    
    CONSTRAINT fk_parent_org FOREIGN KEY (parent_organization_id) REFERENCES Organization(organization_id)
);
CREATE INDEX idx_organization_name ON Organization (name);


-- Create the Email Type ENUM
CREATE TYPE email_type_enum AS ENUM ('WORK', 'PERSONAL', 'BILLING', 'OTHER');

-- Create the Phone Type ENUM
CREATE TYPE phone_type_enum AS ENUM ('MOBILE', 'OFFICE', 'HOME', 'FAX', 'OTHER');

-- 3.3 Email Table
CREATE TABLE Email (
    email_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    email_type email_type_enum NOT NULL                  
);
CREATE INDEX idx_email_address ON Email (email_address);


-- 3.4 Phone Table
CREATE TABLE Phone (
    phone_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_code VARCHAR(10),                   -- e.g., '+1'
    area_code VARCHAR(10),
    local_number VARCHAR(20) NOT NULL,
    phone_type phone_type_enum  NOT NULL,
    extension VARCHAR(10)
);
CREATE UNIQUE INDEX idx_phone_full ON Phone (country_code, local_number);

-- 4.1 PersonRelationship (Spouse/Child/Partner Connections)
CREATE TABLE PersonRelationship (
    person_relationship_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id_1 INT NOT NULL,                   -- The originating person
    person_id_2 INT NOT NULL,                   -- The related person
    relationship_type_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,                -- e.g., 'CURRENT', 'SEPARATED', 'DIVORCED'
    start_date DATE,
    end_date DATE,
    
    CONSTRAINT fk_person_1 FOREIGN KEY (person_id_1) REFERENCES Person(person_id),
    CONSTRAINT fk_person_2 FOREIGN KEY (person_id_2) REFERENCES Person(person_id),
    CONSTRAINT fk_relationship_type FOREIGN KEY (relationship_type_id) REFERENCES RelationshipType(relationship_type_id)
);
-- Index for quickly finding all relationships for a single person
CREATE INDEX idx_relationship_person_1 ON PersonRelationship (person_id_1);
CREATE INDEX idx_relationship_person_2 ON PersonRelationship (person_id_2);


-- 4.2 PersonOrganizationRole (Historical Roles)
CREATE TABLE PersonOrganizationRole (
    person_org_role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id INT NOT NULL,
    organization_id INT NOT NULL,
    role_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,                              -- NULL if the role is current
    
    CONSTRAINT fk_por_person FOREIGN KEY (person_id) REFERENCES Person(person_id),
    CONSTRAINT fk_por_org FOREIGN KEY (organization_id) REFERENCES Organization(organization_id),
    CONSTRAINT fk_por_role FOREIGN KEY (role_id) REFERENCES Role(role_id)
);
-- Index for quickly finding a person's current or past roles
CREATE INDEX idx_por_person_org ON PersonOrganizationRole (person_id, organization_id);


-- 4.3 ContactEmail (Polymorphic Link: Used for both Person and Organization emails)
CREATE TABLE ContactEmail (
    contact_email_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id INT NOT NULL,                    -- ID of the linked entity (Person or Organization)
    email_id INT NOT NULL,
    contact_entity_type VARCHAR(20) NOT NULL,   -- 'PERSON' or 'ORGANIZATION'
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_ce_email FOREIGN KEY (email_id) REFERENCES Email(email_id),
    -- No direct FK on contact_id due to polymorphism (links two different tables)
    CONSTRAINT uq_contact_email UNIQUE (contact_id, contact_entity_type, email_id)
);
-- Index for quickly finding all emails for a specific contact type
CREATE INDEX idx_ce_contact_type ON ContactEmail (contact_id, contact_entity_type);


-- 4.4 ContactPhone (Polymorphic Link: Used for both Person and Organization phones)
CREATE TABLE ContactPhone (
    contact_phone_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id INT NOT NULL,                    -- ID of the linked entity (Person or Organization)
    phone_id INT NOT NULL,
    contact_entity_type VARCHAR(20) NOT NULL,   -- 'PERSON' or 'ORGANIZATION'
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_cp_phone FOREIGN KEY (phone_id) REFERENCES Phone(phone_id),
    -- No direct FK on contact_id due to polymorphism (links two different tables)
    CONSTRAINT uq_contact_phone UNIQUE (contact_id, contact_entity_type, phone_id)
);
-- Index for quickly finding all phones for a specific contact type
CREATE INDEX idx_cp_contact_type ON ContactPhone (contact_id, contact_entity_type);


-- 4.5 ContactAddress (Polymorphic Link: Used for both Person and Organization addresses)
-- NOTE: This requires application-level logic to ensure contact_id refers to a valid Person OR Organization.
CREATE TABLE ContactAddress (
    contact_address_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id INT NOT NULL,                    -- ID of the linked entity (Person or Organization)
    address_id INT NOT NULL,
    address_type VARCHAR(20) NOT NULL,          -- e.g., 'SHIPPING', 'BILLING', 'HOME'
    contact_entity_type VARCHAR(20) NOT NULL,   -- 'PERSON' or 'ORGANIZATION'
    
    CONSTRAINT fk_ca_address FOREIGN KEY (address_id) REFERENCES Address(address_id),
    -- No direct FK on contact_id due to polymorphism (links two different tables)
    CONSTRAINT uq_contact_address UNIQUE (contact_id, contact_entity_type, address_id)
);
-- Index for quickly finding all addresses for a specific contact type
CREATE INDEX idx_ca_contact_type ON ContactAddress (contact_id, contact_entity_type);