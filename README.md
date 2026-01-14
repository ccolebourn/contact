# Contact Service API

A RESTful JSON API service built with Node.js, Express, TypeScript, and PostgreSQL for managing contacts, organizations, and relationships.

## Features

- **Person Management**: CRUD operations with nested emails, phones, and addresses
- **Organization Management**: CRUD operations with nested contact information
- **Household Support**: Group persons into households
- **International Address Support**: Region/state tracking for multiple countries
- **Relationship Tracking**: Person-to-person relationships and person-organization roles
- **Search & Filtering**: Advanced search with pagination
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error handling with meaningful messages
- **TypeScript**: Full type safety across the application

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create the PostgreSQL database:
psql -U postgres -d postgres
drop database if exists contact;
CREATE DATABASE contact OWNER postgres;
exit
psql -U postgres -d contact -f tables.sql

If testing load the test data
psql -U postgres -d contact -f test_data.sql

For RDS in AWS:
psql -h contact.cz7yg7u3mhbn.us-east-1.rds.amazonaws.com -U postgres -d contact -f .\tables.sql
psql -h contact.cz7yg7u3mhbn.us-east-1.rds.amazonaws.com -U postgres -d contact -f .\test_data.sql


### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=contact
DB_USER=postgres
DB_PASSWORD=your_password
DB_MAX_CONNECTIONS=20
```

For AWS RDS deployment, update:
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_SSL=true
```

### 4. Run the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /api/health
```

### Persons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/persons` | Get all persons (paginated) |
| GET | `/api/persons/:id` | Get person by ID |
| GET | `/api/persons/search` | Search persons |
| POST | `/api/persons` | Create new person |
| PUT | `/api/persons/:id` | Update person |
| DELETE | `/api/persons/:id` | Delete person |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get all organizations (paginated) |
| GET | `/api/organizations/:id` | Get organization by ID |
| GET | `/api/organizations/search` | Search organizations |
| POST | `/api/organizations` | Create new organization |
| PUT | `/api/organizations/:id` | Update organization |
| DELETE | `/api/organizations/:id` | Delete organization |

## API Examples

### Create a Person with Contacts

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "emails": [
      {
        "email_address": "john.doe@example.com",
        "email_type": "WORK",
        "is_primary": true
      },
      {
        "email_address": "jdoe@personal.com",
        "email_type": "PERSONAL"
      }
    ],
    "phones": [
      {
        "country_code": "+1",
        "area_code": "617",
        "local_number": "555-1234",
        "phone_type": "MOBILE",
        "is_primary": true
      }
    ],
    "addresses": [
      {
        "address_line_1": "123 Main Street",
        "address_line_2": "Apt 4B",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02101",
        "country_iso_code": "US",
        "address_type": "HOME",
        "is_primary": true
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "person_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "emails": [
      {
        "email_id": 1,
        "email_address": "john.doe@example.com",
        "email_type": "WORK",
        "is_primary": true
      }
    ],
    "phones": [...],
    "addresses": [...]
  }
}
```

### Get Person by ID

```bash
curl http://localhost:3000/api/persons/1
```

### Search Persons

```bash
# Search by last name
curl "http://localhost:3000/api/persons/search?last_name=Doe&page=1&limit=20"

# Search by email
curl "http://localhost:3000/api/persons/search?email=john.doe@example.com"
```

### Create an Organization

```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "website": "https://acme.example.com",
    "emails": [
      {
        "email_address": "info@acme.example.com",
        "email_type": "WORK",
        "is_primary": true
      }
    ],
    "phones": [
      {
        "country_code": "+1",
        "area_code": "617",
        "local_number": "555-9999",
        "phone_type": "OFFICE",
        "is_primary": true
      }
    ],
    "addresses": [
      {
        "address_line_1": "456 Business Ave",
        "city_locality": "Boston",
        "region_code": "MA",
        "postal_code": "02101",
        "country_iso_code": "US",
        "address_type": "OFFICE"
      }
    ]
  }'
```

### Update Person

```bash
curl -X PUT http://localhost:3000/api/persons/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jonathan",
    "preferred_language": "en"
  }'
```

### Pagination

All list endpoints support pagination:

```bash
curl "http://localhost:3000/api/persons?page=2&limit=50"
```

## Data Types

### Email Types
- `WORK`
- `PERSONAL`
- `BILLING`
- `OTHER`

### Phone Types
- `MOBILE`
- `OFFICE`
- `HOME`
- `FAX`
- `OTHER`

### Address Types
- `SHIPPING`
- `BILLING`
- `HOME`
- `OFFICE`
- `OTHER`

## Project Structure

```
contact-service/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection pool
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces & types
│   ├── models/                  # (future: data models)
│   ├── services/
│   │   ├── person.service.ts    # Person business logic
│   │   └── organization.service.ts
│   ├── controllers/
│   │   ├── person.controller.ts # Request handlers
│   │   └── organization.controller.ts
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── person.routes.ts
│   │   └── organization.routes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts      # Error handling
│   │   └── validator.ts         # Zod schemas
│   └── server.ts                # Express app entry point
├── tables.sql                   # Database schema
├── countries.sql                # Country data (legacy)
├── package.json
├── tsconfig.json
└── .env
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": [] // For validation errors
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error

## Database Schema Highlights

### Polymorphic Contact Links
- `ContactEmail` - Links both Person and Organization to emails
- `ContactPhone` - Links both Person and Organization to phones
- `ContactAddress` - Links both Person and Organization to addresses

### Nested Data
All GET endpoints return complete objects with nested:
- Emails (sorted by primary first)
- Phones (sorted by primary first)
- Addresses (sorted by primary first)

## AWS RDS Deployment

1. Create PostgreSQL RDS instance
2. Update `.env` with RDS endpoint
3. Set `DB_SSL=true`
4. Run migrations on RDS:

```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com -U your_user -d contact -f tables.sql
```

## Development

TypeScript is compiled to JavaScript in the `dist/` folder:

```bash
npm run build  # Compile TypeScript
npm start      # Run compiled code
npm run dev    # Development mode with auto-reload
```

## Future Enhancements

- Household CRUD endpoints
- Relationship management endpoints (PersonRelationship, PersonOrganizationRole)
- Bulk operations
- Data import/export
- Advanced filtering
- Soft deletes
- Audit logging
- Authentication/Authorization (if needed)

## License

ISC
