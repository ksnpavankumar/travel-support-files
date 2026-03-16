# Login & Bookings API Documentation

**Base URL:** `http://localhost:8080`

**Version:** 1.0

**Last Updated:** March 16, 2026

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
   - [Register](#1-register)
   - [Login](#2-login)
2. [Bookings APIs](#bookings-apis)
   - [Get All Bookings](#1-get-all-bookings)
   - [Get Booking by ID](#2-get-booking-by-id)
   - [Get by Status](#3-get-bookings-by-status)
   - [Get by User ID](#4-get-bookings-by-user-id)
   - [Get by User & Status](#5-get-bookings-by-user-id-and-status)
   - [Get by Status Groups](#6-7-8-9-get-by-status-groups)
   - [Get by PNR](#10-get-booking-by-pnr)
   - [Get by Amadeus Order ID](#11-get-booking-by-amadeus-order-id)

---

# Authentication APIs

## Endpoint Base Path
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

---

## 1. Register

### Overview
Creates a new user account in the system. Returns user ID, email, phone, and user type.

### Endpoint
```
POST /api/v1/auth/register
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "phone": "+919876543210",
  "password": "securePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "B2C"
}
```

### Request Parameters

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| email | string | Yes | Valid email address | user@example.com |
| password | string | Yes | Password (min 8 chars recommended) | securePassword123! |
| firstName | string | Yes | User's first name | John |
| lastName | string | Yes | User's last name | Doe |
| phone | string | No | Phone number with country code | +919876543210 |
| userType | enum | Yes | User type: **B2C** (Consumer) or **B2B** (Business) | B2C |

### Success Response (200 OK)
```json
{
  "status": "SUCCESS",
  "data": {
    "userId": "USR-2026-000001",
    "email": "user@example.com",
    "phone": "+919876543210",
    "userType": "B2C"
  },
  "message": "User registered"
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "ERROR",
  "data": null,
  "message": "Email already exists"
}
```

### CURL Command

#### Basic Registration (B2C)
```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "B2C"
  }'
```

#### Business Registration (B2B)
```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business@company.com",
    "phone": "+919876543210",
    "password": "BusinessPass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "userType": "B2B"
  }'
```

#### Without Phone (Optional)
```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "Alice",
    "lastName": "Johnson",
    "userType": "B2C"
  }'
```

---

## 2. Login

### Overview
Authenticates user credentials and returns user details including userId, email, and user type.

### Endpoint
```
POST /api/v1/auth/login
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### Request Parameters

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| email | string | Yes | Registered email address | user@example.com |
| password | string | Yes | Account password | securePassword123! |

### Success Response (200 OK)
```json
{
  "status": "SUCCESS",
  "data": {
    "userId": "USR-2026-000001",
    "email": "user@example.com",
    "userType": "B2C",
    "lastLoginAt": "2026-03-16T07:30:45.123Z"
  },
  "message": "Login successful"
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "ERROR",
  "data": null,
  "message": "Invalid email or password"
}
```

### Error Response (400 Not Found)
```json
{
  "status": "ERROR",
  "data": null,
  "message": "User not found"
}
```

### CURL Command

#### Basic Login
```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

#### Using Environment Variables
```bash
EMAIL="john.doe@example.com"
PASSWORD="SecurePass123!"

curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }"
```

#### Save Response to Variable (for scripting)
```bash
RESPONSE=$(curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }')

echo $RESPONSE | jq .
```

---

# Bookings APIs

## Endpoint Base Path
```
GET /api/v1/booking/local/bookings
```

---

## 1. Get All Bookings

### Overview
Retrieves all bookings from the database with optional pagination.

### Endpoint
```
GET /api/v1/booking/local/bookings
```

### Request Headers
```
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | 0-indexed page number | 0 |
| size | integer | No | Records per page (max 100) | 10 |

### Success Response (200 OK)
```json
{
  "status": "SUCCESS",
  "data": {
    "bookings": [
      {
        "bookingId": "BKG-2026-000001",
        "pnr": "8PCH5I",
        "amadeusOrderId": "ORDER-123456",
        "bookingStatus": "COMPLETED",
        "paymentStatus": "PENDING",
        "userType": "B2C",
        "flight": {
          "airline": "EK",
          "airlineCode": "EK",
          "flightNumber": "EK-101",
          "route": "DXB-DEL",
          "origin": "DXB",
          "destination": "DEL",
          "departureTime": "2026-03-16T10:00:00Z",
          "arrivalTime": "2026-03-16T15:30:00Z",
          "cabinClass": "ECONOMY",
          "duration": "PT4H30M",
          "stops": 0
        },
        "pricing": {
          "basePrice": "14794.00",
          "taxes": "3838.00",
          "total": "18632.00",
          "currency": "USD"
        },
        "passengers": [
          {
            "passengerId": "PSG-001",
            "firstName": "John",
            "lastName": "Doe",
            "passengerType": "ADULT",
            "ticketNumber": null,
            "seatNumber": null
          }
        ],
        "createdAt": "2026-03-16T06:15:00Z",
        "confirmedAt": "2026-03-16T06:15:00Z"
      }
    ],
    "totalCount": 5,
    "page": 0,
    "size": 10
  },
  "message": "Retrieved 5 booking(s)"
}
```

### CURL Command

#### Get All (No Pagination)
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings" \
  -H "Content-Type: application/json"
```

#### Get with Pagination
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings?page=0&size=10" \
  -H "Content-Type: application/json"
```

#### Get Second Page
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings?page=1&size=20" \
  -H "Content-Type: application/json"
```

---

## 2. Get Booking by ID

### Overview
Retrieves a specific booking by its internal booking ID.

### Endpoint
```
GET /api/v1/booking/local/bookings/{bookingId}
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| bookingId | string | Yes | Booking ID (BKG-YYYY-NNNNNN format) | BKG-2026-000001 |

### Success Response (200 OK)
```json
{
  "status": "SUCCESS",
  "data": {
    "bookings": [
      {
        "bookingId": "BKG-2026-000001",
        "pnr": "8PCH5I",
        "amadeusOrderId": "ORDER-123456",
        "bookingStatus": "COMPLETED",
        "paymentStatus": "PENDING",
        "userType": "B2C",
        "flight": { },
        "pricing": { },
        "passengers": [ ],
        "createdAt": "2026-03-16T06:15:00Z",
        "confirmedAt": "2026-03-16T06:15:00Z"
      }
    ],
    "totalCount": 1,
    "page": null,
    "size": null
  },
  "message": "Booking retrieved successfully"
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "ERROR",
  "data": null,
  "message": "Booking not found: BKG-2026-999999"
}
```

### CURL Command

```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/BKG-2026-000001" \
  -H "Content-Type: application/json"
```

---

## 3. Get Bookings by Status

### Overview
Retrieves all bookings filtered by status.

### Endpoint
```
GET /api/v1/booking/local/bookings/status/{status}
```

### Path Parameters

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| status | string | Yes | Booking status | PENDING, CONFIRMED, TICKETED, CANCELLED, COMPLETED, FAILED |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | 0-indexed page number | 0 |
| size | integer | No | Records per page | 10 |

### CURL Command

#### Get Completed Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/status/COMPLETED" \
  -H "Content-Type: application/json"
```

#### Get Pending with Pagination
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/status/PENDING?page=0&size=20" \
  -H "Content-Type: application/json"
```

#### Get Cancelled Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/status/CANCELLED?page=0&size=10" \
  -H "Content-Type: application/json"
```

---

## 4. Get Bookings by User ID

### Overview
Retrieves all bookings for a specific user. Accepts both ObjectId (MongoDB) or business userId format.

### Endpoint
```
GET /api/v1/booking/local/bookings/user/{userId}
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| userId | string | Yes | User ID (ObjectId or USR-YYYY-NNNNNN) | USR-2026-000004 |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | 0-indexed page number | 0 |
| size | integer | No | Records per page | 10 |

### CURL Command

#### Using Business User ID
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/USR-2026-000004?page=0&size=10" \
  -H "Content-Type: application/json"
```

#### Using MongoDB ObjectId
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/60f7c2f8e13b1f3a2c123456" \
  -H "Content-Type: application/json"
```

#### With Authentication Headers
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/USR-2026-000004?page=0&size=10" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: USR-2026-000004" \
  -H "X-User-Email: guest@gmail.com"
```

---

## 5. Get Bookings by User ID and Status

### Overview
Retrieves bookings for a specific user filtered by booking status.

### Endpoint
```
GET /api/v1/booking/local/bookings/user/{userId}/status/{status}
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| userId | string | Yes | User ID (ObjectId or USR-YYYY-NNNNNN) | USR-2026-000004 |
| status | string | Yes | Booking status | PENDING, CONFIRMED, COMPLETED |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | 0-indexed page number | 0 |
| size | integer | No | Records per page | 10 |

### CURL Command

```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/USR-2026-000004/status/PENDING?page=0&size=10" \
  -H "Content-Type: application/json"
```

---

## 6-9. Get by Status Groups

### Quick Reference

#### Get All Pending Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/pending?page=0&size=10" \
  -H "Content-Type: application/json"
```

#### Get All Confirmed Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/confirmed?page=0&size=10" \
  -H "Content-Type: application/json"
```

#### Get All Cancelled Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/cancelled?page=0&size=10" \
  -H "Content-Type: application/json"
```

#### Get All Failed Bookings
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/failed?page=0&size=10" \
  -H "Content-Type: application/json"
```

---

## 10. Get Booking by PNR

### Overview
Retrieves a booking by its PNR (Passenger Name Record) code.

### Endpoint
```
GET /api/v1/booking/local/bookings/pnr/{pnr}
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| pnr | string | Yes | PNR code from airline | 8PCH5I |

### CURL Command

```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/pnr/8PCH5I" \
  -H "Content-Type: application/json"
```

---

## 11. Get Booking by Amadeus Order ID

### Overview
Retrieves a booking by its Amadeus order ID.

### Endpoint
```
GET /api/v1/booking/local/bookings/amadeus/{amadeusOrderId}
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| amadeusOrderId | string | Yes | Amadeus order ID | ORDER-123456 |

### CURL Command

```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/amadeus/ORDER-123456" \
  -H "Content-Type: application/json"
```

---

## Common Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input/parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Valid Values Reference

### User Types
- `B2C` - Business to Consumer (Individual)
- `B2B` - Business to Business

### Booking Statuses
- `PENDING` - Booking created but not confirmed
- `CONFIRMED` - Booking confirmed by system
- `TICKETED` - Tickets issued by airline
- `CANCELLED` - Booking cancelled
- `COMPLETED` - Booking successfully completed
- `FAILED` - Booking failed

### Payment Status
- `PENDING` - Payment pending
- `PAID` - Payment completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded
- `PARTIALLY_REFUNDED` - Partially refunded

### Passenger Types
- `ADULT` - Adult passenger
- `CHILD` - Child passenger
- `INFANT` - Infant passenger

---

## Pagination Guide

### How Pagination Works
- **page**: 0-indexed (0 = first page, 1 = second page, etc.)
- **size**: Number of records per page (max 100)
- **totalCount**: Total records matching the query

### Example Pagination Flow

**Request 1 - Get first 10 records:**
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings?page=0&size=10"
```

**Response includes:**
```json
{
  "totalCount": 45,
  "page": 0,
  "size": 10
}
```

**Request 2 - Get next 10 records (page 2):**
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings?page=1&size=10"
```

---

## Testing Workflow

### 1. Register New User
```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "userType": "B2C",
    "phone": "+919876543210"
  }'
```

**Save the userId from response for next steps**

### 2. Login with Registered User
```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

### 3. Get User Bookings
```bash
# Replace USR-2026-000004 with the userId from login response
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/USR-2026-000004?page=0&size=10" \
  -H "Content-Type: application/json"
```

### 4. Filter by Status
```bash
curl -X GET "http://localhost:8080/api/v1/booking/local/bookings/user/USR-2026-000004/status/PENDING?page=0&size=10" \
  -H "Content-Type: application/json"
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- User IDs can be either ObjectId (MongoDB) or business format (USR-...)
- Pagination is optional; omitting page/size returns all results
- Phone numbers should include country code (e.g., +91 for India)
- All requests are case-sensitive for userType, status, and email

---

## Support

For issues or questions:
- Check valid status values in the "Valid Values Reference" section
- Ensure all required fields are provided in request bodies
- Verify user authentication headers if applicable

