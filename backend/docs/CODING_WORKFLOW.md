# EDUVERSE Backend — Coding Workflow & Architecture Guide

This project follows a **Domain-Driven Design (DDD)** and **Layered Architecture**. This means we organize code by *feature* (e.g., Auth, Profile) rather than by *technical role* (e.g., a giant folder full of all controllers).

When jumping into a new feature or endpoint, use this **"Inside-Out"** 6-step workflow. You will start closest to the Database, move outward through the Business Logic, and end at the HTTP API.

---

## 🏗️ The 6-Step Workflow

### 🟢 Step 1: Write the Database Queries (`[module].repository.js`)
*Always start closest to your data.*
* **Goal**: Determine what data you need to read from or write to the database to complete the feature.
* **Action**: Open the module's repository file and write granular, parameterized SQL queries.
* **Rules**: 
  * Only execute SQL here, using the database pool.
  * Do not put any business logic (like hashing passwords) or Express logic (like `req`/`res`) in this layer.
* **Example**: `findUserByEmail(email)` or `createSession(data)`.

### 🟡 Step 2: Define Request Validation (`[module].validation.js`)
*Before any logic runs, assume the client is sending bad data.*
* **Goal**: Defend your API against invalid or malicious data.
* **Action**: Open the module's validation file and use `express-validator` rules.
* **Example**: Check that `body("email").isEmail()` or `body("password").isLength({ min: 6 })`.

### 🟠 Step 3: Write the Business Logic (`[module].service.js`)
*This is the brain of your feature.*
* **Goal**: Enforce business rules, process data, and orchestrate repository calls.
* **Action**: Open the module's service file. This layer receives clean data (validated by step 2), performs logic (e.g., hashing passwords, generating JWTs), and calls the functions you made in Step 1.
* **Rules**:
  * This layer should have zero knowledge of HTTP, Express `req`, or `res` objects.
  * If something fails (e.g., "User not found" or "Incorrect password"), you **throw an ApiError** here.
* **Example**: `loginUser({ email, password })` -> returns user data and tokens.

### 🔵 Step 4: Handle the HTTP Request (`[module].controller.js`)
*Act as the traffic cop connecting the internet to your app.*
* **Goal**: Receive the HTTP request, pass data to the service, and handle the response.
* **Action**: Open the module's controller file and create an `asyncHandler` wrapper. Extract data from `req.body`, `req.params`, or `req.query`, and pass it to the **Service** (Step 3). Finally, return an HTTP response utilizing the `sendSuccess` / `sendCreated` utility functions.
* **Rules**: Never put business logic, validation, or SQL in the controller.

### 🟣 Step 5: Wire the Route & Middlewares (`[module].routes.js`)
*Connect the outside world to your code.*
* **Goal**: Expose an endpoint that triggers everything you just built.
* **Action**: Open the module's route file.
* **Flow**: Define the URL endpoint, attach your security middlewares (like rate limiters), attach the **Validation array** (from Step 2), and finally attach the **Controller** (from Step 4).
* **Example**: `router.post('/login', authLimiter, loginValidation, loginController)`

### 🏁 Step 6: Test & Commit
* **Action**:
  1. Fire up a REST client (Postman, ThunderClient, Insomnia).
  2. Test the "Sad Path": Send intentionally bad data to ensure `[module].validation.js` blocks it gracefully.
  3. Test the "Happy Path": Send good data and verify the service works, DB updates, and correct JSON is returned.
  4. Ensure your server console has no unhandled errors.
  5. Commit your feature module and move on.

---

## 🧠 Why Build It Like This?

The **Repository ➡️ Validation ➡️ Service ➡️ Controller ➡️ Route** flow ensures complete decoupling.

If tomorrow the company decides to create a CLI tool, a background worker, or a WebSockets server that also needs to "Login a User", you can simply import the **Service**. Your logic is safe, isolated, and highly testable, rather than being trapped forever inside an Express HTTP Controller!
