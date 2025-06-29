## ShipmentManagement Alpha Version

#### Release Objectives

- Able to signup and login
- Able to add shipments, and view them
- User authorization for seeing only the shipments that belong to user
- Setting up database for storing users and their shipments, and creating API endpoints for database queries. 

#### Dependencies

- Have the backend setup with requirements installed

- Setup an env file and download psql

- Have frontend setup with libraries installed

#### Release Scope

# Release Scope 

EpiReady Sprint 1

## Included Features

The following features and improvements are included in the Sprint 1 release:

### 1. User Authentication
- **Purpose**: Enables users to register and securely log in to the platform using Bearer token based authorization.
- **Details**: Includes form validation, password hashing, error handling for missing/invalid credentials, and secure token generation and verification.

### 2. Shipment Management
- **Purpose**: Allows authenticated users to manage their shipment.
- **Details**: Users can create, and view their shipments. Shipment cards present a summarized view, and shipment data is persisted in the PostgreSQL database.

---

## Excluded Features

The following features were not included in the Sprint 1 release:

### 1. Alert Rule Checker
- **Reason**: Couldn't connect with founder on time to set up OpenWeatherAPI for the stimulated data.

---

## Bug Fixes

None

## Non-Functional Requirements

| Requirement    | Description                                                         | Measurable Criteria                          |
|----------------|---------------------------------------------------------------------|----------------------------------------------|
| **Performance** | Backend should respond within 300ms under typical load             | 100% of API calls return in under 300ms       |
| **Security**    | Bearer auth, password hashing, protected routes                       | Bearer token required for shipment and alert actions  |
| **Usability**   | Clear errors, intuitive UI, minimal steps to create a shipment     | 100% of people were able to add a shipment when we did random sampling    |
| **Reliability** | Graceful handling of unexpected input and database failures        | Appropriate HTTP error codes and messages    |

---

## Dependencies and Limitations

### Dependencies
- **Frontend**: React + Vite  
- **Backend**: Flask  
- **Database**: PostgreSQL

### Known Limitations
- Dummy data is used for alerts and logs (no live feeds).
- No role-based access; all users have the same permissions.

