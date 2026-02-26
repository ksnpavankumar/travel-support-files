# Flight Booking System - MongoDB Database Schema

## 📊 **Overview**

This database is designed for a **production-ready flight booking system** that supports both **B2C (Business-to-Consumer)** and **B2B (Business-to-Business)** models with integration to **Amadeus Travel API**.

---

## 🏗️ **Architecture**

```
┌──────────────────────────────────────────────────────────────┐
│                   MICROSERVICES ARCHITECTURE                  │
└──────────────────────────────────────────────────────────────┘

     ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
     │    USER     │        │   FLIGHT    │        │   BOOKING   │
     │   SERVICE   │        │   SERVICE   │        │   SERVICE   │
     │  Port 8082  │        │  Port 8081  │        │  Port 8083  │
     └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
            │                      │                       │
            └──────────────────────┴───────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   MONGODB DATABASE          │
                    │   flight_booking_db         │
                    │   26 Collections            │
                    └─────────────────────────────┘
```

---

## 📦 **Collection Categories**

### **1. CORE COLLECTIONS (6)**

These are the main business entities accessed frequently across services.

| # | Collection | Purpose | Size | Microservice |
|---|-----------|---------|------|-------------|
| 1 | `users` | User authentication & profiles | 5-10 KB | User Service |
| 2 | `companies` | B2B company information | 8-12 KB | User Service |
| 3 | `flight_searches` | Search cache & analytics | 2-5 KB | Flight Service |
| 4 | `bookings` | Core booking data | 5-8 KB | Booking Service |
| 5 | `payments` | Payment transactions | 3-5 KB | Booking Service |
| 6 | `invoices` | B2B invoices | 5-10 KB | Booking Service |

---

### **2. USER-RELATED COLLECTIONS (6)**

Extended user data split into separate collections to avoid large documents.

| # | Collection | Purpose | Why Separate |
|---|-----------|---------|-------------|
| 7 | `user_payment_methods` | Saved cards/UPI | Can grow (multiple cards) |
| 8 | `user_sessions` | Active login sessions | Frequently updated |
| 9 | `user_saved_travelers` | Frequent travelers | Can grow (5-10 travelers) |
| 10 | `user_kyc_documents` | KYC verification | Large metadata, compliance |
| 11 | `user_preferences` | User settings | Complex object, rarely accessed |
| 12 | `user_loyalty_transactions` | Points history | High volume, grows over time |

---

### **3. COMPANY-RELATED COLLECTIONS (4)**

B2B-specific data for managing travel agencies and corporate clients.

| # | Collection | Purpose | Why Separate |
|---|-----------|---------|-------------|
| 13 | `company_branches` | Branch offices | Can grow (multiple branches) |
| 14 | `company_documents` | Legal documents | Large files (S3 URLs) |
| 15 | `company_commission_rules` | Pricing rules | Complex, version controlled |
| 16 | `company_users` | Company employees | Many-to-many relationship |

---

### **4. FLIGHT-RELATED COLLECTIONS (3)**

Flight search, Amadeus API responses, and price tracking.

| # | Collection | Purpose | Why Separate |
|---|-----------|---------|-------------|
| 17 | `amadeus_responses` | Raw API responses | Very large JSON (500KB+) |
| 18 | `flight_offers` | Parsed flight details | Individual flights from search |
| 19 | `flight_price_history` | Price tracking | Analytics, high volume |

---

### **5. BOOKING-RELATED COLLECTIONS (5)**

Detailed booking data split for scalability and clarity.

| # | Collection | Purpose | Why Separate |
|---|-----------|---------|-------------|
| 20 | `booking_passengers` | Passenger details | Multiple per booking |
| 21 | `booking_flights` | Flight segments | Multiple per booking |
| 22 | `booking_addons` | Extra services | Can grow, optional |
| 23 | `booking_status_history` | Audit trail | Grows over time |
| 24 | `booking_cancellations` | Cancellation records | Complete audit trail |

---

### **6. REFERENCE DATA COLLECTIONS (2)**

Master data rarely changes, shared across system.

| # | Collection | Purpose | Update Frequency |
|---|-----------|---------|-----------------|
| 25 | `airports` | Airport master data | Monthly |
| 26 | `airlines` | Airline information | Monthly |

---

## 🔗 **Collection Relationships**

### **Core Relationships Diagram**

```
users (1) ──────────── (M) user_payment_methods
  │                          user_sessions
  │                          user_saved_travelers
  │                          user_kyc_documents
  │                          user_preferences
  │                          user_loyalty_transactions
  │
  ├─── (1:M) ───────────── bookings
  │                          │
  │                          ├── (1:M) ── booking_passengers
  │                          ├── (1:M) ── booking_flights
  │                          ├── (1:M) ── booking_addons
  │                          ├── (1:M) ── booking_status_history
  │                          └── (1:1) ── booking_cancellations
  │
  └─── (M:1) ───────────── companies
                             │
                             ├── (1:M) ── company_branches
                             ├── (1:M) ── company_documents
                             ├── (1:M) ── company_commission_rules
                             └── (M:M) ── company_users

flight_searches (1) ──── (1) ── amadeus_responses
  │
  └─── (1:M) ───────────── flight_offers

bookings (1) ───────────── (M) ── payments
  │
  └─── (M) ───────────── (1) ── invoices (B2B only)
```

---

## 📋 **Detailed Collection Purposes**

### **1. users**
**What it does:** Central authentication and user profile management

**Stores:**
- Login credentials (email, password hash)
- Basic profile (name, DOB, gender, nationality)
- User type discriminator (B2C vs B2B)
- Quick access metrics (loyalty points, credit limit)
- Security settings (2FA, last login)

**Why separate:** Core identity, accessed on every request, must be fast

**Relationships:**
- Has many: payment_methods, sessions, saved_travelers
- Belongs to (B2B): company

---

### **2. companies**
**What it does:** B2B company/agency master data

**Stores:**
- Legal information (GST, PAN, registration)
- Contact details (primary, billing, support)
- Financial settings (credit limit, payment terms)
- Subscription plan details
- Commission & markup configuration

**Why separate:** B2B-specific, shared by multiple agents

**Relationships:**
- Has many: branches, documents, users, bookings, invoices

---

### **3. flight_searches**
**What it does:** Cache search queries and track user behavior

**Stores:**
- Search criteria (route, dates, passengers)
- Cache key for deduplication
- Summary statistics (price range, flight count)
- User interactions (views, compares, time spent)
- Conversion tracking (booked or abandoned)

**Why separate:** High volume, temporary (30-min TTL), analytics

**Relationships:**
- Belongs to: user
- Has one: amadeus_response
- Has many: flight_offers
- Referenced by: bookings (optional)

**TTL:** Auto-deleted after 30 minutes

---

### **4. bookings**
**What it does:** Core booking records (B2C + B2B unified)

**Stores:**
- Booking ID & PNR (airline confirmation)
- Flight summary (denormalized for quick display)
- Final pricing (B2C or B2B structure)
- Payment status
- Booking status (pending, confirmed, ticketed, cancelled)
- Optional search reference for analytics

**Why separate:** Core business entity, frequently accessed

**Relationships:**
- Belongs to: user, company (B2B only)
- References: flight_search (optional), flight_offer (optional)
- Has many: passengers, flight segments, addons, status history, payments
- Has one: cancellation (if cancelled)
- Referenced by: invoices (B2B)

**Design Decision:** B2C and B2B in ONE table with conditional fields

---

### **5. payments**
**What it does:** Financial transaction records

**Stores:**
- Payment gateway transaction details
- Amount, currency, payment method
- Status (pending, success, failed, refunded)
- Gateway response (raw)
- Refund information

**Why separate:** Financial audit trail, reconciliation, can have multiple payments per booking (partial payments)

**Relationships:**
- Belongs to: booking, user
- References booking (NOT a SQL join, just ObjectId)

---

### **6. invoices**
**What it does:** B2B periodic billing (monthly/quarterly)

**Stores:**
- Billing period
- List of bookings (summary)
- Total amounts (commission, taxes, TDS)
- Payment status & due date
- Invoice PDF URL

**Why separate:** B2B-only, periodic generation, different lifecycle

**Relationships:**
- Belongs to: company
- References many: bookings

---

### **7. user_payment_methods**
**What it does:** Saved payment methods for quick checkout

**Stores:**
- Tokenized card details (last 4 digits only)
- UPI VPA
- Default payment method flag
- Billing address

**Why separate:** Can grow (user may have 5+ cards), security isolation

**Relationships:**
- Belongs to: user

---

### **8. user_sessions**
**What it does:** Track active login sessions

**Stores:**
- Session ID & JWT tokens
- Device info (OS, browser, IP)
- Login time & expiry
- Last activity timestamp

**Why separate:** Frequently updated, security, can grow (multiple devices)

**Relationships:**
- Belongs to: user

**TTL:** Auto-deleted when expired

---

### **9. user_saved_travelers**
**What it does:** Frequently booked travelers (family, colleagues)

**Stores:**
- Personal details (name, DOB, gender, nationality)
- Passport information
- Travel preferences (seat, meal)
- Relationship to user

**Why separate:** Can grow (5-10 travelers per user)

**Relationships:**
- Belongs to: user

---

### **10. user_kyc_documents**
**What it does:** KYC/verification documents

**Stores:**
- Document type (passport, Aadhaar, PAN)
- Document number & expiry
- S3/CDN URLs (not actual files)
- Verification status & timestamp

**Why separate:** Compliance, large metadata, sensitive data isolation

**Relationships:**
- Belongs to: user

---

### **11. user_preferences**
**What it does:** Detailed user settings

**Stores:**
- Flight preferences (seat, meal, frequent flyer)
- Display settings (language, currency, timezone)
- Notification preferences (email, SMS, push, WhatsApp)
- Search preferences
- Privacy settings

**Why separate:** Complex object, not accessed frequently, reduces core user document size

**Relationships:**
- One-to-one with: user

---

### **12. user_loyalty_transactions**
**What it does:** Loyalty points earn/redeem history

**Stores:**
- Transaction type (earned, redeemed, expired)
- Points amount
- Reference to booking/referral
- Balance after transaction

**Why separate:** High volume, grows over time, analytics

**Relationships:**
- Belongs to: user
- References: booking (optional)

---

### **13. company_branches**
**What it does:** Company branch offices

**Stores:**
- Branch name, code, address
- Contact information
- Is head office flag
- Employee count

**Why separate:** Can grow (companies may have 10+ branches)

**Relationships:**
- Belongs to: company

---

### **14. company_documents**
**What it does:** Company legal documents

**Stores:**
- Document type (GST, incorporation, IATA)
- Document number & expiry
- S3/CDN URLs
- Verification status

**Why separate:** Can grow, large file metadata, compliance

**Relationships:**
- Belongs to: company

---

### **15. company_commission_rules**
**What it does:** Complex commission/markup rules

**Stores:**
- Tiered commission structure
- Domestic vs international rates
- Airline-specific rules
- Effective date range

**Why separate:** Complex logic, version controlled, historical tracking

**Relationships:**
- Belongs to: company

---

### **16. company_users**
**What it does:** Link users to companies (many-to-many)

**Stores:**
- Company-user relationship
- Role & permissions
- Department, employee ID
- Join date

**Why separate:** Many-to-many relationship (user can work for multiple companies)

**Relationships:**
- Links: company ↔ user

---

### **17. amadeus_responses**
**What it does:** Store raw Amadeus API responses

**Stores:**
- Complete API response JSON
- Request parameters
- Response size & time
- Expiry timestamp

**Why separate:** Very large (500KB+), temporary cache, reduces search document size

**Relationships:**
- One-to-one with: flight_search

**TTL:** Auto-deleted after 30 minutes

---

### **18. flight_offers**
**What it does:** Individual parsed flight options

**Stores:**
- Single flight details
- Outbound & inbound segments
- Pricing breakdown
- Fare rules (baggage, cancellation)
- Availability

**Why separate:** Multiple offers per search, enables efficient querying/filtering

**Relationships:**
- Belongs to: flight_search
- Referenced by: bookings

**TTL:** Auto-deleted after 30 minutes

---

### **19. flight_price_history**
**What it does:** Track price changes over time

**Stores:**
- Route, date, airline
- Price captured at timestamp
- Analytics data

**Why separate:** High volume, analytics/reporting, grows continuously

**Relationships:**
- None (standalone analytics)

---

### **20. booking_passengers**
**What it does:** Detailed passenger information

**Stores:**
- Personal details (name, DOB, gender, nationality)
- Passport information
- Seat assignments per segment
- Meal preferences
- Ticket numbers & e-ticket URLs

**Why separate:** Multiple per booking (1-9 passengers), reduces booking document size

**Relationships:**
- Belongs to: booking

---

### **21. booking_flights**
**What it does:** Detailed flight segments

**Stores:**
- Departure & arrival details
- Carrier information
- Aircraft type
- Cabin class & fare basis
- Segment status

**Why separate:** Multiple segments per booking (connecting flights), detailed technical data

**Relationships:**
- Belongs to: booking

---

### **22. booking_addons**
**What it does:** Extra services purchased

**Stores:**
- Addon type (baggage, meal, seat, insurance)
- Price & quantity
- Associated passenger & segments
- Status

**Why separate:** Optional, can grow, not always present

**Relationships:**
- Belongs to: booking, passenger

---

### **23. booking_status_history**
**What it does:** Audit trail of status changes

**Stores:**
- Previous & new status
- Changed by (user/agent/system)
- Timestamp & reason
- Metadata (payment ID, notes)

**Why separate:** Audit/compliance, grows over time, historical record

**Relationships:**
- Belongs to: booking

---

### **24. booking_cancellations**
**What it does:** Cancellation details

**Stores:**
- Cancellation type (full/partial)
- Reason & category
- Charges breakdown
- Refund status & amount
- Processing timeline

**Why separate:** Not always present, complex structure, complete audit trail

**Relationships:**
- One-to-one with: booking (if cancelled)

---

### **25. airports**
**What it does:** Airport master data

**Stores:**
- IATA/ICAO codes
- Airport name, city, country
- Geographic coordinates
- Terminals, timezone

**Why separate:** Reference data, rarely changes, shared globally

**Relationships:**
- Referenced by: flight_searches, bookings, flight_offers

---

### **26. airlines**
**What it does:** Airline master data

**Stores:**
- IATA/ICAO codes
- Airline name, country
- Logo URL
- Is low-cost carrier flag

**Why separate:** Reference data, rarely changes, shared globally

**Relationships:**
- Referenced by: flight_searches, bookings, flight_offers

---

## 🔑 **Key Design Decisions**

### **1. Why NOT embed everything?**

**Problem:** Large documents are slow to read/write

```javascript
// ❌ BAD: Everything embedded (1MB+ document)
{
  userId: "USR-001",
  profile: { ... },
  paymentMethods: [ ... 10 cards ... ],
  sessions: [ ... 5 active sessions ... ],
  savedTravelers: [ ... 8 travelers ... ],
  bookings: [ ... 50 bookings with full details ... ]
}

// ✅ GOOD: Small core document, references to others
{
  userId: "USR-001",
  profile: { ... },
  quickAccess: { loyaltyPoints: 5420 }
}
// paymentMethods → user_payment_methods collection
// sessions → user_sessions collection
// bookings → bookings collection
```

---

### **2. Why searchId & selectedFlightOfferId in bookings?**

**Purpose:** Analytics and traceability

```javascript
{
  bookingId: "BKG-001",
  searchReference: {
    searchId: ObjectId("..."),           // Link to original search
    selectedFlightOfferId: "FL-001",     // Which flight user picked
    searchPrice: 18500,                  // Price at search time
    bookingPrice: 19112.50,              // Actual booking price
    priceDifference: 612.50,             // Price increased
    timeTakenToBook: 245                 // User took 4 minutes
  }
}
```

**Benefits:**
- Conversion tracking (search → booking ratio)
- Price variation analysis
- User behavior insights
- Debugging (trace back to search)

**Optional:** Not all bookings have searches (direct bookings, modifications)

---

### **3. Why ONE bookings table for B2C + B2B?**

**Reason:** Same business entity with conditional fields

```javascript
// B2C Booking
{
  userType: "B2C",
  b2bDetails: null,  // ← null for B2C
  pricing: {
    serviceFee: 462.50,
    convenienceFee: 150,
    loyaltyDiscount: 0,
    markup: null,      // ← null for B2C
    commission: null
  }
}

// B2B Booking
{
  userType: "B2B",
  b2bDetails: {       // ← populated for B2B
    companyId: ObjectId("..."),
    agentCode: "AGT-001"
  },
  pricing: {
    serviceFee: 100,
    convenienceFee: null,
    loyaltyDiscount: null,
    markup: 4250,     // ← populated for B2B
    commission: 3500
  }
}
```

**Indexes support both:**
```javascript
// B2C queries
db.bookings.find({ userType: "B2C", userId: ObjectId("...") })

// B2B queries
db.bookings.find({ userType: "B2B", "b2bDetails.companyId": ObjectId("...") })
```

---

### **4. Are payment references JOINs?**

**No** - MongoDB uses **references** (manual two-query pattern)

```javascript
// Step 1: Get booking
const booking = await db.bookings.findOne({ bookingId: "BKG-001" });

// Step 2: Get payment (separate query)
const payment = await db.payments.findOne({ 
  bookingId: booking._id 
});

// NOT a SQL JOIN - application handles lookup
```

**When to use $lookup (rare):**
```javascript
// If you MUST have data together (slow, avoid in high-traffic APIs)
db.bookings.aggregate([
  { $match: { bookingId: "BKG-001" } },
  { 
    $lookup: {
      from: "payments",
      localField: "_id",
      foreignField: "bookingId",
      as: "paymentDetails"
    }
  }
])
```

---

## 📊 **Performance Optimizations**

### **1. Indexing Strategy**

**Users:**
- Unique: email, userId, phone
- Compound: userType + accountStatus + createdAt
- Geospatial: Not needed

**Bookings:**
- Unique: bookingId, pnr
- Compound: userId + createdAt, companyId + createdAt
- Date: departureDate (for date-range queries)

**Flight Searches:**
- TTL: expiresAt (auto-delete after 30 min)
- Compound: origin + destination + departureDate
- Cache: cacheKey (for deduplication)

### **2. TTL (Time-To-Live) Indexes**

Auto-delete temporary data:

```javascript
// Flight searches expire after 30 minutes
db.flight_searches.createIndex(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 }
);

// User sessions expire when token expires
db.user_sessions.createIndex(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 }
);
```

### **3. Denormalization**

Copy frequently accessed data to avoid lookups:

```javascript
// Booking stores flight summary (denormalized)
{
  bookingId: "BKG-001",
  flightSummary: {          // ← Copied from flight_offer
    airline: "IndiGo",
    flightNumber: "6E-2345",
    route: "BLR-DEL-BLR"
  }
}
// Benefit: Display booking without querying flight_offers
```

---

## 🚀 **Setup Instructions**

### **1. Execute Setup Script**

```bash
# Using mongosh
mongosh < mongodb_setup_complete.js

# Or connect first
mongosh
> load('mongodb_setup_complete.js')
```

### **2. Verify Collections**

```javascript
use flight_booking_db

// List all collections
db.getCollectionNames()

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()

// View indexes
db.users.getIndexes()
```

### **3. Test Queries**

```javascript
// Find B2C user
db.users.findOne({ userType: "B2C" })

// Find B2B bookings for a company
db.bookings.find({ 
  userType: "B2B", 
  "b2bDetails.companyId": ObjectId("...")
})

// Get user with all related data
const user = db.users.findOne({ userId: "USR-2024-000001" });
const payments = db.user_payment_methods.find({ userId: user._id }).toArray();
const bookings = db.bookings.find({ userId: user._id }).sort({ createdAt: -1 }).toArray();
```

---

## 🔒 **Security Considerations**

### **1. Sensitive Data**
- Passwords: Bcrypt hashed (never plain text)
- Cards: Tokenized by payment gateway (only last 4 digits stored)
- KYC docs: Store S3 URLs, not actual files

### **2. Access Control**
```javascript
// Create read-only user for analytics
db.createUser({
  user: "analytics_user",
  pwd: "secure_password",
  roles: [{ role: "read", db: "flight_booking_db" }]
})

// Create app user with read/write
db.createUser({
  user: "app_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "flight_booking_db" }]
})
```

### **3. Audit Trail**
- `booking_status_history`: Track all changes
- `user_sessions`: Track login activity
- `metadata.createdBy`: Track who created records

---

## 📈 **Scaling Strategy**

### **Phase 1: Single Database (Current)**
- All collections in one database
- Suitable for 0-100K bookings/month
- Vertical scaling (increase server RAM/CPU)

### **Phase 2: Sharding (Future)**
- Shard key: `userId` for users, bookings
- Shard key: `companyId` for B2B collections
- Horizontal scaling (add more servers)

### **Phase 3: Separate Databases (Future)**
- User DB: users, sessions, preferences
- Booking DB: bookings, passengers, flights
- Analytics DB: searches, price_history

---

## 📞 **Support**

For questions or issues:
- Email: dev@travelease.com
- Docs: https://docs.travelease.com
- GitHub: https://github.com/travelease/flight-booking

---

## 📝 **License**

Copyright © 2024 TravelEase. All rights reserved.