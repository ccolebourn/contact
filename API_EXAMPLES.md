# API Examples with Test Data

After loading the test data, you can try these API calls to explore your Contact Service.

## Load Test Data

First, load the test data into your database:

```bash
psql -d contact -f test_data.sql
```

This creates:
- **6 Households** with families
- **23 People** (20 in families, 3 singles)
- **30+ Email addresses**
- **25+ Phone numbers**
- **18+ Addresses**
- **5 Organizations**
- **Family relationships** (spouses, parents, children, siblings)
- **Work relationships** (5 people employed at organizations)

## Example API Calls

### 1. Get a Person with All Contact Info

```bash
# Get John Smith (person_id: 1) - includes emails, phones, addresses
curl http://localhost:3000/api/persons/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "person_id": 1,
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Smith",
    "birth_year": 1985,
    "birth_month": 3,
    "birth_day": 15,
    "preferred_language": "en",
    "household_id": 1,
    "emails": [
      {
        "email_id": 1,
        "email_address": "john.smith@techcorp.com",
        "email_type": "WORK",
        "is_primary": true
      },
      {
        "email_id": 2,
        "email_address": "john.smith.personal@gmail.com",
        "email_type": "PERSONAL",
        "is_primary": false
      }
    ],
    "phones": [
      {
        "phone_id": 1,
        "country_code": "+1",
        "area_code": "617",
        "local_number": "555-0101",
        "phone_type": "MOBILE",
        "is_primary": true
      }
    ],
    "addresses": [
      {
        "address_id": 1,
        "address_line_1": "123 Maple Street",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02101",
        "country_iso_code": "US",
        "address_type": "HOME"
      },
      {
        "address_id": 7,
        "address_line_1": "100 Tech Park Drive",
        "address_line_2": "Suite 200",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02110",
        "country_iso_code": "US",
        "address_type": "OFFICE"
      }
    ]
  }
}
```

### 2. Get an Organization with All Contact Info

```bash
# Get TechCorp Solutions (organization_id: 1)
curl http://localhost:3000/api/organizations/1
```

### 3. Search for People by Last Name

```bash
# Find all Smiths
curl "http://localhost:3000/api/persons/search?last_name=Smith"
```

### 4. Search for People by Email

```bash
# Find person with specific email
curl "http://localhost:3000/api/persons/search?email=john.smith@techcorp.com"
```

### 5. Search for People by Phone

```bash
# Find person by phone number
curl "http://localhost:3000/api/persons/search?phone=555-0101"
```

### 6. Get All People in a Household

```bash
# Get all members of household 1 (Smith Family)
curl "http://localhost:3000/api/persons/search?household_id=1"
```

Expected: John, Sarah, Emma, and Liam Smith

### 7. Get All Persons with Pagination

```bash
# Get first page (20 per page)
curl "http://localhost:3000/api/persons?page=1&limit=20"

# Get second page
curl "http://localhost:3000/api/persons?page=2&limit=20"

# Get 10 per page
curl "http://localhost:3000/api/persons?page=1&limit=10"
```

### 8. Search Organizations

```bash
# Find organizations by name
curl "http://localhost:3000/api/organizations/search?name=TechCorp"

# Get all organizations
curl http://localhost:3000/api/organizations
```

### 9. Get Specific People

```bash
# Sarah Smith (person_id: 2)
curl http://localhost:3000/api/persons/2

# Robert Johnson (person_id: 5)
curl http://localhost:3000/api/persons/5

# Maria Garcia (person_id: 22)
curl http://localhost:3000/api/persons/22
```

### 10. Create a New Person with Contacts

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Cooper",
    "birth_year": 1994,
    "emails": [
      {
        "email_address": "alice.cooper@example.com",
        "email_type": "WORK",
        "is_primary": true
      }
    ],
    "phones": [
      {
        "country_code": "+1",
        "area_code": "617",
        "local_number": "555-9999",
        "phone_type": "MOBILE",
        "is_primary": true
      }
    ],
    "addresses": [
      {
        "address_line_1": "999 New Street",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02101",
        "country_iso_code": "US",
        "address_type": "HOME"
      }
    ]
  }'
```

### 11. Update a Person

```bash
# Update John Smith's preferred language
curl -X PUT http://localhost:3000/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_language": "es"
  }'
```

### 12. Create a New Organization

```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Consulting Firm",
    "website": "https://newconsulting.com",
    "emails": [
      {
        "email_address": "info@newconsulting.com",
        "email_type": "WORK",
        "is_primary": true
      }
    ],
    "phones": [
      {
        "country_code": "+1",
        "area_code": "617",
        "local_number": "555-7777",
        "phone_type": "OFFICE",
        "is_primary": true
      }
    ],
    "addresses": [
      {
        "address_line_1": "888 Consulting Plaza",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02108",
        "country_iso_code": "US",
        "address_type": "OFFICE"
      }
    ]
  }'
```

## Test Data Quick Reference

### Households (IDs 1-6)
1. The Smith Family (4 members: John, Sarah, Emma, Liam)
2. The Johnson Family (3 members: Robert, Jennifer, Olivia)
3. The Williams Family (3 members: Michael, Jessica, Noah)
4. The Brown Family (4 members: David, Emily, Sophia, Mason)
5. The Davis Family (3 members: Christopher, Amanda, Ava)
6. The Miller Family (3 members: Daniel, Michelle, Isabella)

### Singles (No Household)
- James Anderson (person_id: 21)
- Maria Garcia (person_id: 22)
- Kevin O'Connor (person_id: 23)

### Organizations (IDs 1-5)
1. TechCorp Solutions - John Smith works here
2. Design Studio Inc - Sarah Smith works here
3. Boston Law Firm LLP - Robert Johnson works here
4. City Hospital - Jennifer Johnson works here
5. Startup Innovation Labs - Michael Williams is CEO

### Relationships in Test Data
- All families have spouse relationships (relationship_type_id: 1)
- Parents linked to children (relationship_type_id: 3)
- Siblings linked (relationship_type_id: 5)
- 5 people have employment relationships with organizations

## Using with Postman or Thunder Client

Import this as a collection:

1. **Base URL**: `http://localhost:3000`
2. **Headers**: `Content-Type: application/json`
3. Create requests for each endpoint above

## Verification Queries

Run these directly in PostgreSQL to verify the data:

```sql
-- Count people per household
SELECT h.household_name, COUNT(p.person_id) as member_count
FROM Household h
LEFT JOIN Person p ON p.household_id = h.household_id
GROUP BY h.household_id, h.household_name
ORDER BY h.household_name;

-- People with their email addresses
SELECT p.first_name, p.last_name, e.email_address, e.email_type
FROM Person p
JOIN ContactEmail ce ON ce.contact_id = p.person_id AND ce.contact_entity_type = 'PERSON'
JOIN Email e ON e.email_id = ce.email_id
ORDER BY p.last_name, p.first_name;

-- Organizations with their contact info
SELECT o.name, e.email_address, ph.local_number
FROM Organization o
LEFT JOIN ContactEmail ce ON ce.contact_id = o.organization_id AND ce.contact_entity_type = 'ORGANIZATION'
LEFT JOIN Email e ON e.email_id = ce.email_id
LEFT JOIN ContactPhone cp ON cp.contact_id = o.organization_id AND cp.contact_entity_type = 'ORGANIZATION'
LEFT JOIN Phone ph ON ph.phone_id = cp.phone_id
ORDER BY o.name;

-- Family relationships
SELECT
    p1.first_name || ' ' || p1.last_name as person_1,
    rt.name as relationship,
    p2.first_name || ' ' || p2.last_name as person_2
FROM PersonRelationship pr
JOIN Person p1 ON p1.person_id = pr.person_id_1
JOIN Person p2 ON p2.person_id = pr.person_id_2
JOIN RelationshipType rt ON rt.relationship_type_id = pr.relationship_type_id
ORDER BY p1.last_name, p1.first_name;
```

## Common Issues & Fixes

### Person Not Found
```json
{
  "success": false,
  "error": "Person not found"
}
```
- Check that the person_id exists in the database
- Person IDs start at 1 and go up to 23 in the test data

### Validation Errors
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "email_address",
      "message": "Invalid email address"
    }
  ]
}
```
- Check that email addresses are valid format
- Ensure required fields are provided
- Check enum values (email_type, phone_type, etc.)

## Next Steps

Try building queries to:
- Find all children in the database (birth_year > 2010)
- Find all people with @gmail.com email addresses
- List all households with 4+ members
- Find people working at TechCorp Solutions
