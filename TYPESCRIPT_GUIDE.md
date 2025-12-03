# TypeScript & Node.js Learning Guide

This guide explains the key concepts used in this Contact Service API project. Perfect for developers new to TypeScript!

## Table of Contents
1. [TypeScript Basics](#typescript-basics)
2. [Important Concepts](#important-concepts)
3. [Project Architecture](#project-architecture)
4. [Common Patterns](#common-patterns)
5. [Tips for Reading the Code](#tips-for-reading-the-code)

---

## TypeScript Basics

### What is TypeScript?
TypeScript is JavaScript with **types**. It helps catch errors before you run your code.

```typescript
// JavaScript - no type checking
let name = "John";
name = 123;  // JavaScript allows this - can cause bugs!

// TypeScript - catches errors
let name: string = "John";
name = 123;  // ❌ Error: Type 'number' is not assignable to type 'string'
```

### Core Type Annotations

```typescript
// Basic types
let age: number = 25;
let name: string = "John";
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: string[] = ["John", "Jane"];

// Optional properties (can be undefined)
let middleName?: string;  // Same as: string | undefined
middleName = "Michael";   // OK
middleName = undefined;   // OK
```

### Interfaces
Interfaces define the **shape** of objects (what properties they have):

```typescript
// Define the structure
interface Person {
  first_name: string;     // Required property
  last_name: string;      // Required property
  age?: number;           // Optional property (?)
  emails?: string[];      // Optional array
}

// Use it
const john: Person = {
  first_name: "John",
  last_name: "Doe",
  age: 30
  // emails can be omitted (it's optional)
};
```

### Enums
Enums are a set of **named constants**:

```typescript
// Define allowed values
enum EmailType {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  BILLING = 'BILLING'
}

// Use it
let emailType: EmailType = EmailType.WORK;  // ✅ OK
let emailType2: EmailType = "INVALID";      // ❌ Error!
```

---

## Important Concepts

### 1. async/await - Handling Asynchronous Operations

**Problem**: Database calls take time. We can't freeze the whole server waiting!

**Solution**: `async/await` lets us write asynchronous code that looks synchronous.

```typescript
// ❌ This DOESN'T work - can't pause regular functions
function getUser(id: number) {
  const user = database.query("SELECT * FROM Person WHERE id = ?", [id]);
  // user is a Promise, not the actual data!
  return user;
}

// ✅ This WORKS - async function can use 'await'
async function getUser(id: number) {
  const user = await database.query("SELECT * FROM Person WHERE id = ?", [id]);
  // await pauses until query completes, user is actual data
  return user;
}
```

**Key Rules**:
- Use `async` keyword before function to make it asynchronous
- Use `await` keyword before operations that return Promises
- `await` can only be used inside `async` functions

### 2. Promises - Representing Future Values

A **Promise** is a placeholder for a value that will be available later:

```typescript
// Promise states:
// 1. Pending - operation still running
// 2. Fulfilled - operation succeeded, value available
// 3. Rejected - operation failed, error available

// Old way (callback hell):
database.query("SELECT ...", (error, result) => {
  if (error) {
    // handle error
  } else {
    // use result
  }
});

// Modern way (Promise with await):
try {
  const result = await database.query("SELECT ...");
  // use result
} catch (error) {
  // handle error
}
```

### 3. Arrow Functions

Arrow functions are a shorter syntax for writing functions:

```typescript
// Traditional function
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const add = (a: number, b: number): number => {
  return a + b;
};

// Shorter arrow function (implicit return)
const add = (a: number, b: number): number => a + b;

// Single parameter (no parentheses needed)
const double = (x: number) => x * 2;
```

**When to use arrow functions**:
- Callbacks: `array.map(x => x * 2)`
- Short inline functions
- When you need to preserve `this` context

### 4. Destructuring & Spread Operator

**Destructuring** - Extract values from objects/arrays:

```typescript
// Object destructuring
const person = { first_name: "John", last_name: "Doe", age: 30 };
const { first_name, last_name } = person;
// first_name = "John", last_name = "Doe"

// Array destructuring
const numbers = [1, 2, 3];
const [first, second] = numbers;
// first = 1, second = 2
```

**Spread operator (...)** - Expand objects/arrays:

```typescript
// Spread object properties
const result = { data: persons, total: 100 };
const response = {
  success: true,
  ...result  // Expands to: data: persons, total: 100
};
// response = { success: true, data: persons, total: 100 }

// Spread array elements
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4]
```

### 5. Modules - import/export

**Exporting** makes code available to other files:

```typescript
// types/index.ts
export interface Person { ... }      // Named export
export enum EmailType { ... }        // Named export
export default pool;                 // Default export

// Importing
import pool from './config/database';            // Import default export
import { Person, EmailType } from './types';     // Import named exports
import * as types from './types';                // Import everything as 'types'
```

### 6. Type Assertions (Type Casting)

Sometimes you know more about a type than TypeScript does:

```typescript
// 'as' keyword - tells TypeScript "trust me, I know the type"
const validatedData = CreatePersonSchema.parse(req.body);
const person = await personService.create(validatedData as any);

// 'any' - special type that disables type checking (use sparingly!)
```

**When to use type assertions**:
- When working with Zod validation (validated data is safe)
- When TypeScript's type inference is too strict
- **Avoid**: Using `as any` everywhere (defeats purpose of TypeScript!)

---

## Project Architecture

### Request Flow

Here's how a request flows through the application:

```
1. HTTP Request arrives
   ↓
2. Express Middleware (cors, json parser, logging)
   ↓
3. Route Matching (/api/persons/:id → getPersonById)
   ↓
4. Controller (person.controller.ts)
   - Validates input (Zod schemas)
   - Calls service layer
   ↓
5. Service (person.service.ts)
   - Contains business logic
   - Executes database queries
   - Returns data
   ↓
6. Controller sends HTTP Response
```

### Folder Structure Explained

```
src/
├── config/           # Configuration (database connection)
├── types/            # TypeScript interfaces and enums
├── services/         # Business logic (talks to database)
├── controllers/      # Handle HTTP requests/responses
├── routes/           # Define URL patterns → controller mapping
├── middleware/       # Functions that run before controllers
└── server.ts         # Main entry point (starts Express)
```

### Separation of Concerns

**Why separate Controllers and Services?**

```typescript
// ❌ BAD - Everything in controller
export const createPerson = async (req, res) => {
  // Database code directly in controller
  const result = await pool.query("INSERT INTO Person...");
  // Business logic mixed with HTTP handling
  res.json({ data: result });
};

// ✅ GOOD - Separated
// Controller - handles HTTP only
export const createPerson = async (req, res) => {
  const person = await personService.create(req.body);
  res.json({ success: true, data: person });
};

// Service - handles business logic
class PersonService {
  async create(data) {
    // All database and business logic here
    await pool.query("INSERT INTO Person...");
    // ...
  }
}
```

**Benefits**:
- **Testability**: Can test business logic without HTTP
- **Reusability**: Services can be used by multiple controllers
- **Maintainability**: Changes to database don't affect HTTP handling
- **Clarity**: Each file has one responsibility

---

## Common Patterns

### Pattern 1: Database Transactions

Used when multiple operations must succeed or fail together:

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');           // Start transaction

  // Operation 1
  await client.query("INSERT INTO Person...");

  // Operation 2
  await client.query("INSERT INTO Email...");

  await client.query('COMMIT');          // Save changes
} catch (error) {
  await client.query('ROLLBACK');        // Undo all changes
  throw error;
} finally {
  client.release();                      // Return connection to pool
}
```

### Pattern 2: Error Handling with asyncHandler

Wraps async route handlers to catch errors automatically:

```typescript
// Without asyncHandler - must manually catch errors
export const getPersonById = async (req, res) => {
  try {
    const person = await personService.getById(req.params.id);
    res.json({ data: person });
  } catch (error) {
    // Must handle error here
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// With asyncHandler - errors caught automatically
export const getPersonById = asyncHandler(async (req, res) => {
  const person = await personService.getById(req.params.id);
  res.json({ data: person });
  // If error occurs, asyncHandler catches it and passes to errorHandler middleware
});
```

### Pattern 3: Pagination

Return large datasets in smaller "pages":

```typescript
// Request: GET /api/persons?page=2&limit=20

const page = 2;      // Which page (1-indexed)
const limit = 20;    // Items per page
const offset = (page - 1) * limit;  // Skip first 20 items

// SQL: Get items 21-40
await client.query(
  'SELECT * FROM Person LIMIT $1 OFFSET $2',
  [limit, offset]
);

// Response:
{
  data: [...],      // 20 persons
  total: 245,       // Total persons in database
  page: 2,          // Current page
  limit: 20         // Items per page
}
```

---

## Tips for Reading the Code

### 1. Start with Types (types/index.ts)
Understand the data structures first. Types are like a "dictionary" for the codebase.

### 2. Follow the Request Flow
Pick an endpoint (like `GET /api/persons/:id`) and trace it:
- Route definition in `routes/person.routes.ts`
- Controller function in `controllers/person.controller.ts`
- Service method in `services/person.service.ts`

### 3. Read Comments Top-Down
The comments explain:
- **What** the code does (at the top)
- **How** it works (inline comments)
- **Why** decisions were made (design comments)

### 4. Use TypeScript's Intelligence
In VS Code, hover over:
- Variables to see their types
- Functions to see parameters and return types
- Use Ctrl+Click (Cmd+Click on Mac) to jump to definitions

### 5. Don't Panic About `any`
`as any` is used in a few places to work around type system limitations. The data is still validated by Zod schemas, so it's safe.

### 6. Understand Key Files

**Must understand**:
- `src/server.ts` - How Express app is set up
- `src/types/index.ts` - All data structures
- `src/controllers/person.controller.ts` - How requests are handled
- `src/config/database.ts` - How database connects

**Can learn later**:
- `src/services/*.service.ts` - Complex database logic
- `src/middleware/validator.ts` - Zod schemas (validation details)

---

## Common TypeScript Errors & Solutions

### Error: "Cannot find module"
**Problem**: Import path is wrong or module not installed
```typescript
// ❌ Wrong
import pool from './database';

// ✅ Correct
import pool from './config/database';
```

### Error: "Property does not exist on type"
**Problem**: TypeScript doesn't know about a property
```typescript
// ❌ TypeScript doesn't know 'name' exists
const obj: any = getUser();
obj.name;

// ✅ Define proper type
interface User {
  name: string;
}
const obj: User = getUser();
obj.name;  // OK
```

### Error: "Type X is not assignable to type Y"
**Problem**: Trying to assign incompatible types
```typescript
// ❌ String can't be assigned to number
let age: number = "30";

// ✅ Convert to correct type
let age: number = parseInt("30");
```

---

## Next Steps

1. **Run the application**: `npm run dev`
2. **Make a test request**: `curl http://localhost:3000/api/persons/1`
3. **Read the controller**: Start with `person.controller.ts`
4. **Modify something small**: Add a console.log to see when code runs
5. **Experiment**: Change a route, add a field, try breaking things!

## Learning Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Express.js Guide**: https://expressjs.com/en/guide/routing.html
- **Node.js + TypeScript Tutorial**: https://nodejs.dev/learn/nodejs-with-typescript
- **Async/Await Explained**: https://javascript.info/async-await

---

**Remember**: The best way to learn is by doing. Read the code, make small changes, see what happens!
