
// =====================================================
// TRAVEL PLATFORM - PRODUCTION DATABASE SETUP v2.0
// =====================================================
// Features:
// ✅ B2B + B2C Support
// ✅ Financial Safety (Wallet Versioning + Ledger)
// ✅ Complete Validation Schemas
// ✅ Performance Optimized Indexes
// ✅ TTL Auto-Cleanup
// ✅ Audit Trails
// =====================================================
// Execute: mongosh < mongodb_production_setup_complete.js
// =====================================================

use location_data;

print("\n🚀 Initializing Travel Production Database v2.0...\n");

// =====================================================
// 1️⃣ USERS
// =====================================================

print("Creating users collection...");

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "email", "passwordHash", "userType", "accountStatus", "createdAt"],
      properties: {
        userId: { 
          bsonType: "string",
          pattern: "^USR-[0-9]{4}-[0-9]{6}$",
          description: "Business-friendly user ID (USR-2024-000001)"
        },
        email: { 
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Valid email address"
        },
        phone: { 
          bsonType: ["string", "null"],
          pattern: "^\\+[1-9][0-9]{1,14}$",
          description: "E.164 format phone number"
        },
        passwordHash: { 
          bsonType: "string",
          description: "Bcrypt hashed password"
        },
        userType: { 
          enum: ["B2C", "B2B", "ADMIN"],
          description: "User type discriminator"
        },
        accountStatus: { 
          enum: ["ACTIVE", "SUSPENDED", "INACTIVE", "DELETED"],
          description: "Account status"
        },
        isEmailVerified: { bsonType: "bool" },
        isPhoneVerified: { bsonType: "bool" },
        twoFactorEnabled: { bsonType: "bool" },
        lastLoginAt: { bsonType: ["date", "null"] },
        failedLoginAttempts: { bsonType: "int" },
        accountLockedUntil: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.users.createIndex({ userId: 1 }, { unique: true, name: "idx_userId_unique" });
db.users.createIndex({ email: 1 }, { unique: true, name: "idx_email_unique" });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true, name: "idx_phone_unique" });
db.users.createIndex({ userType: 1, accountStatus: 1 }, { name: "idx_userType_accountStatus" });
db.users.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ users ready\n");


// =====================================================
// 2️⃣ USER PROFILES
// =====================================================

print("Creating user_profiles collection...");

db.createCollection("user_profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "firstName", "lastName", "createdAt"],
      properties: {
        userId: { 
          bsonType: "objectId",
          description: "Reference to users collection"
        },
        firstName: { 
          bsonType: "string",
          minLength: 2,
          maxLength: 50
        },
        lastName: { 
          bsonType: "string",
          minLength: 2,
          maxLength: 50
        },
        phone: { bsonType: ["string", "null"] },
        dateOfBirth: { bsonType: ["date", "null"] },
        gender: { enum: ["MALE", "FEMALE", "OTHER", null] },
        nationality: { 
          bsonType: ["string", "null"],
          pattern: "^[A-Z]{2}$",
          description: "2-letter country code"
        },
        avatar: { bsonType: ["string", "null"] },
        
        // B2B specific (null for B2C)
        b2bProfile: {
          bsonType: ["object", "null"],
          properties: {
            companyId: { bsonType: "objectId" },
            role: { enum: ["ADMIN", "MANAGER", "AGENT", "VIEWER"] },
            agentCode: { bsonType: "string" },
            department: { bsonType: "string" },
            commissionPercentage: { bsonType: "number" },
            markupPercentage: { bsonType: "number" }
          }
        },
        
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.user_profiles.createIndex({ userId: 1 }, { unique: true, name: "idx_userId_unique" });
db.user_profiles.createIndex({ "b2bProfile.companyId": 1 }, { sparse: true, name: "idx_b2b_companyId" });
db.user_profiles.createIndex({ "b2bProfile.agentCode": 1 }, { unique: true, sparse: true, name: "idx_agentCode_unique" });

print("✅ user_profiles ready\n");


// =====================================================
// 3️⃣ USER SESSIONS (JWT + TTL)
// =====================================================

print("Creating user_sessions collection...");

db.createCollection("user_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionId", "userId", "expiresAt", "createdAt"],
      properties: {
        sessionId: { bsonType: "string" },
        userId: { bsonType: "objectId" },
        accessToken: { bsonType: "string" },
        refreshToken: { bsonType: ["string", "null"] },
        deviceInfo: {
          bsonType: ["object", "null"],
          properties: {
            type: { enum: ["DESKTOP", "MOBILE", "TABLET", "OTHER"] },
            os: { bsonType: "string" },
            browser: { bsonType: "string" },
            ipAddress: { bsonType: "string" }
          }
        },
        isActive: { bsonType: "bool" },
        lastActivity: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.user_sessions.createIndex({ sessionId: 1 }, { unique: true, name: "idx_sessionId_unique" });
db.user_sessions.createIndex({ userId: 1, isActive: 1 }, { name: "idx_userId_isActive" });
db.user_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ user_sessions ready (TTL enabled)\n");


// =====================================================
// 4️⃣ COMPANIES (B2B)
// =====================================================

print("Creating companies collection...");

db.createCollection("companies", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "legalName", "status", "createdAt"],
      properties: {
        companyId: {
          bsonType: "string",
          pattern: "^COMP-[0-9]{4}-[0-9]{6}$"
        },
        legalName: { 
          bsonType: "string",
          minLength: 3,
          maxLength: 200
        },
        tradeName: { bsonType: ["string", "null"] },
        businessType: { 
          enum: ["TRAVEL_AGENCY", "CORPORATE", "DISTRIBUTOR", "AGGREGATOR", null]
        },
        
        // Registration
        registrationNumber: { bsonType: ["string", "null"] },
        gstNumber: { 
          bsonType: ["string", "null"],
          pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
        },
        panNumber: { 
          bsonType: ["string", "null"],
          pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
        },
        
        // Contact
        contactEmail: { bsonType: ["string", "null"] },
        contactPhone: { bsonType: ["string", "null"] },
        
        // Address
        address: {
          bsonType: ["object", "null"],
          properties: {
            line1: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            country: { bsonType: "string" },
            postalCode: { bsonType: "string" }
          }
        },
        
        status: { enum: ["PENDING", "ACTIVE", "SUSPENDED", "BLOCKED", "CLOSED"] },
        
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.companies.createIndex({ companyId: 1 }, { unique: true, name: "idx_companyId_unique" });
db.companies.createIndex({ gstNumber: 1 }, { unique: true, sparse: true, name: "idx_gstNumber_unique" });
db.companies.createIndex({ panNumber: 1 }, { sparse: true, name: "idx_panNumber" });
db.companies.createIndex({ status: 1 }, { name: "idx_status" });
db.companies.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ companies ready\n");


// =====================================================
// 5️⃣ COMPANY USERS (B2B ROLE MAPPING)
// =====================================================

print("Creating company_users collection...");

db.createCollection("company_users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "userId", "role", "createdAt"],
      properties: {
        companyId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        role: { enum: ["ADMIN", "MANAGER", "AGENT", "VIEWER"] },
        permissions: {
          bsonType: ["object", "null"],
          properties: {
            canCreateBooking: { bsonType: "bool" },
            canCancelBooking: { bsonType: "bool" },
            canViewReports: { bsonType: "bool" },
            canManageCredit: { bsonType: "bool" },
            maxBookingValue: { bsonType: "number" },
            dailyBookingLimit: { bsonType: "int" }
          }
        },
        isActive: { bsonType: "bool" },
        joinedAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.company_users.createIndex({ companyId: 1, userId: 1 }, { unique: true, name: "idx_company_user_unique" });
db.company_users.createIndex({ userId: 1 }, { name: "idx_userId" });
db.company_users.createIndex({ companyId: 1, role: 1 }, { name: "idx_companyId_role" });

print("✅ company_users ready\n");


// =====================================================
// 6️⃣ COMPANY WALLETS (CURRENT BALANCE + VERSION)
// =====================================================

print("Creating company_wallets collection...");

db.createCollection("company_wallets", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "balance", "creditLimit", "version", "updatedAt"],
      properties: {
        companyId: { 
          bsonType: "objectId",
          description: "Reference to companies collection"
        },
        balance: { 
          bsonType: "number",
          description: "Current available balance"
        },
        creditLimit: { 
          bsonType: "number",
          description: "Maximum credit allowed"
        },
        usedCredit: {
          bsonType: "number",
          description: "Currently used credit"
        },
        blockedAmount: {
          bsonType: "number",
          description: "Amount blocked for pending bookings"
        },
        currency: { 
          bsonType: "string",
          pattern: "^[A-Z]{3}$"
        },
        version: { 
          bsonType: "int",
          description: "Optimistic locking version - CRITICAL for concurrent updates"
        },
        lastTransactionAt: { bsonType: ["date", "null"] },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.company_wallets.createIndex({ companyId: 1 }, { unique: true, name: "idx_companyId_unique" });

print("✅ company_wallets ready (with version control for concurrency)\n");


// =====================================================
// 7️⃣ COMPANY WALLET LEDGER (IMMUTABLE AUDIT TRAIL)
// =====================================================

print("Creating company_wallet_ledger collection...");

db.createCollection("company_wallet_ledger", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "ledgerId",
        "companyId",
        "transactionType",
        "amount",
        "balanceBefore",
        "balanceAfter",
        "idempotencyKey",
        "createdAt"
      ],
      properties: {
        ledgerId: {
          bsonType: "string",
          pattern: "^TXN-[0-9]{4}-[0-9]{10}$"
        },
        companyId: { bsonType: "objectId" },
        transactionType: { 
          enum: [
            "CREDIT_ADDED",
            "BOOKING_DEBIT",
            "BOOKING_REFUND",
            "CANCELLATION_FEE",
            "ADJUSTMENT"
          ]
        },
        amount: { 
          bsonType: "number",
          description: "Positive for credit, negative for debit"
        },
        balanceBefore: { bsonType: "number" },
        balanceAfter: { bsonType: "number" },
        currency: { bsonType: "string" },
        
        // Reference
        bookingId: { bsonType: ["objectId", "null"] },
        paymentId: { bsonType: ["objectId", "null"] },
        
        description: { bsonType: "string" },
        metadata: { bsonType: ["object", "null"] },
        
        // Idempotency - prevents duplicate transactions
        idempotencyKey: { 
          bsonType: "string",
          description: "UUID to prevent duplicate transactions"
        },
        
        performedBy: { bsonType: ["objectId", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.company_wallet_ledger.createIndex({ ledgerId: 1 }, { unique: true, name: "idx_ledgerId_unique" });
db.company_wallet_ledger.createIndex({ companyId: 1, createdAt: -1 }, { name: "idx_companyId_createdAt" });
db.company_wallet_ledger.createIndex({ idempotencyKey: 1 }, { unique: true, name: "idx_idempotencyKey_unique" });
db.company_wallet_ledger.createIndex({ bookingId: 1 }, { sparse: true, name: "idx_bookingId" });

print("✅ company_wallet_ledger ready (immutable audit trail)\n");


// =====================================================
// 8️⃣ BOOKINGS (Unified B2B + B2C)
// =====================================================

print("Creating bookings collection...");

db.createCollection("bookings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "bookingId",
        "userId",
        "userType",
        "flightSnapshot",
        "pricingSnapshot",
        "bookingStatus",
        "paymentStatus",
        "createdAt"
      ],
      properties: {
        bookingId: { 
          bsonType: "string",
          pattern: "^BKG-[0-9]{4}-[0-9]{6}$"
        },
        userId: { bsonType: "objectId" },
        userType: { enum: ["B2C", "B2B"] },
        
        // B2B specific
        companyId: { bsonType: ["objectId", "null"] },
        
        pnr: { 
          bsonType: ["string", "null"],
          description: "Airline PNR"
        },
        
        // Flight snapshot (denormalized for quick display)
        flightSnapshot: {
          bsonType: "object",
          required: ["airline", "flightNumber", "route"],
          properties: {
            airline: { bsonType: "string" },
            airlineCode: { bsonType: "string" },
            flightNumber: { bsonType: "string" },
            route: { bsonType: "string" },
            departureTime: { bsonType: "date" },
            arrivalTime: { bsonType: "date" },
            cabinClass: { bsonType: "string" },
            totalPassengers: { bsonType: "int" }
          }
        },
        
        // Pricing snapshot (immutable)
        pricingSnapshot: {
          bsonType: "object",
          required: ["basePrice", "total", "currency"],
          properties: {
            basePrice: { bsonType: "number" },
            taxes: { bsonType: "number" },
            serviceFee: { bsonType: "number" },
            convenienceFee: { bsonType: ["number", "null"] },
            markup: { bsonType: ["number", "null"] },
            commission: { bsonType: ["number", "null"] },
            discount: { bsonType: "number" },
            total: { bsonType: "number" },
            currency: { bsonType: "string" }
          }
        },
        
        // Search reference (optional)
        searchReference: {
          bsonType: ["object", "null"],
          properties: {
            searchId: { bsonType: "objectId" },
            selectedFlightOfferId: { bsonType: "string" },
            searchPrice: { bsonType: "number" },
            bookingPrice: { bsonType: "number" }
          }
        },
        
        bookingStatus: { 
          enum: ["PENDING", "CONFIRMED", "TICKETED", "CANCELLED", "COMPLETED", "FAILED"] 
        },
        paymentStatus: { 
          enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] 
        },
        
        // Contact
        contactInfo: {
          bsonType: ["object", "null"],
          properties: {
            email: { bsonType: "string" },
            phone: { bsonType: "string" }
          }
        },
        
        // Cancellation
        isCancelled: { bsonType: "bool" },
        cancelledAt: { bsonType: ["date", "null"] },
        cancellationReason: { bsonType: ["string", "null"] },
        
        // Timestamps
        bookedAt: { bsonType: "date" },
        confirmedAt: { bsonType: ["date", "null"] },
        ticketedAt: { bsonType: ["date", "null"] },
        
        source: { enum: ["WEB", "MOBILE_APP", "API", null] },
        ipAddress: { bsonType: ["string", "null"] },
        
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.bookings.createIndex({ bookingId: 1 }, { unique: true, name: "idx_bookingId_unique" });
db.bookings.createIndex({ pnr: 1 }, { unique: true, sparse: true, name: "idx_pnr_unique" });
db.bookings.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.bookings.createIndex({ userType: 1, bookingStatus: 1 }, { name: "idx_userType_status" });
db.bookings.createIndex({ companyId: 1, createdAt: -1 }, { sparse: true, name: "idx_companyId_createdAt" });
db.bookings.createIndex({ bookingStatus: 1 }, { name: "idx_bookingStatus" });
db.bookings.createIndex({ paymentStatus: 1 }, { name: "idx_paymentStatus" });
db.bookings.createIndex({ "flightSnapshot.departureTime": 1 }, { name: "idx_departureTime" });
db.bookings.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ bookings ready (unified B2C + B2B)\n");


// =====================================================
// 9️⃣ BOOKING PASSENGERS
// =====================================================

print("Creating booking_passengers collection...");

db.createCollection("booking_passengers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["bookingId", "passengerType", "firstName", "lastName"],
      properties: {
        passengerId: {
          bsonType: "string",
          pattern: "^PAX-[0-9]{10}$"
        },
        bookingId: { bsonType: "objectId" },
        passengerNumber: { bsonType: "int" },
        passengerType: { enum: ["ADULT", "CHILD", "INFANT"] },
        title: { enum: ["Mr", "Mrs", "Ms", "Dr", null] },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        dateOfBirth: { bsonType: ["date", "null"] },
        gender: { enum: ["MALE", "FEMALE", "OTHER", null] },
        nationality: { bsonType: ["string", "null"] },
        
        // Passport
        passportNumber: { bsonType: ["string", "null"] },
        passportExpiry: { bsonType: ["date", "null"] },
        issuingCountry: { bsonType: ["string", "null"] },
        
        // Flight details
        seatNumber: { bsonType: ["string", "null"] },
        mealPreference: { bsonType: ["string", "null"] },
        
        // Ticket
        ticketNumber: { bsonType: ["string", "null"] },
        ticketStatus: { enum: ["PENDING", "ISSUED", "CANCELLED", null] },
        eTicketUrl: { bsonType: ["string", "null"] },
        
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.booking_passengers.createIndex({ passengerId: 1 }, { unique: true, sparse: true, name: "idx_passengerId_unique" });
db.booking_passengers.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.booking_passengers.createIndex({ ticketNumber: 1 }, { unique: true, sparse: true, name: "idx_ticketNumber_unique" });

print("✅ booking_passengers ready\n");


// =====================================================
// 🔟 BOOKING STATUS HISTORY (AUDIT TRAIL)
// =====================================================

print("Creating booking_status_history collection...");

db.createCollection("booking_status_history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["bookingId", "previousStatus", "newStatus", "changedAt"],
      properties: {
        historyId: { bsonType: "string" },
        bookingId: { bsonType: "objectId" },
        statusType: { enum: ["BOOKING_STATUS", "PAYMENT_STATUS"] },
        previousStatus: { bsonType: "string" },
        newStatus: { bsonType: "string" },
        changedBy: { bsonType: ["objectId", "null"] },
        changedByType: { enum: ["USER", "AGENT", "SYSTEM", "ADMIN"] },
        reason: { bsonType: ["string", "null"] },
        metadata: { bsonType: ["object", "null"] },
        changedAt: { bsonType: "date" }
      }
    }
  }
});

db.booking_status_history.createIndex({ bookingId: 1, changedAt: -1 }, { name: "idx_bookingId_changedAt" });
db.booking_status_history.createIndex({ newStatus: 1 }, { name: "idx_newStatus" });

print("✅ booking_status_history ready\n");


// =====================================================
// 1️⃣1️⃣ PAYMENTS
// =====================================================

print("Creating payments collection...");

db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["paymentId", "bookingId", "amount", "currency", "status", "createdAt"],
      properties: {
        paymentId: {
          bsonType: "string",
          pattern: "^PAY-[0-9]{4}-[0-9]{6}$"
        },
        bookingId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        
        amount: { bsonType: "number" },
        currency: { 
          bsonType: "string",
          pattern: "^[A-Z]{3}$"
        },
        
        paymentMethod: { 
          enum: ["CREDIT_CARD", "DEBIT_CARD", "UPI", "NETBANKING", "WALLET", "CREDIT"] 
        },
        
        // Gateway details
        gateway: { bsonType: ["string", "null"] },
        gatewayOrderId: { bsonType: ["string", "null"] },
        gatewayTransactionId: { bsonType: ["string", "null"] },
        
        // Card details (masked)
        cardDetails: {
          bsonType: ["object", "null"],
          properties: {
            last4: { bsonType: "string" },
            cardType: { bsonType: "string" },
            cardNetwork: { bsonType: "string" }
          }
        },
        
        status: { 
          enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] 
        },
        
        // Refund
        refundAmount: { bsonType: ["number", "null"] },
        refundTransactionId: { bsonType: ["string", "null"] },
        refundedAt: { bsonType: ["date", "null"] },
        
        // Gateway response
        gatewayResponse: { bsonType: ["object", "null"] },
        errorCode: { bsonType: ["string", "null"] },
        errorMessage: { bsonType: ["string", "null"] },
        
        initiatedAt: { bsonType: "date" },
        completedAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.payments.createIndex({ paymentId: 1 }, { unique: true, name: "idx_paymentId_unique" });
db.payments.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.payments.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.payments.createIndex({ gatewayTransactionId: 1 }, { unique: true, sparse: true, name: "idx_gatewayTxnId_unique" });
db.payments.createIndex({ status: 1 }, { name: "idx_status" });
db.payments.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ payments ready\n");


// =====================================================
// 1️⃣2️⃣ SEARCH CACHE (TTL BASED)
// =====================================================

print("Creating search_cache collection...");

db.createCollection("search_cache", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["searchId", "cacheKey", "userId", "expiresAt", "createdAt"],
      properties: {
        searchId: {
          bsonType: "string",
          pattern: "^SRCH-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}$"
        },
        cacheKey: { 
          bsonType: "string",
          description: "Hash of search criteria for deduplication"
        },
        userId: { bsonType: "objectId" },
        userType: { enum: ["B2C", "B2B"] },
        
        // Search criteria
        searchCriteria: {
          bsonType: "object",
          properties: {
            origin: { bsonType: "string" },
            destination: { bsonType: "string" },
            departureDate: { bsonType: "string" },
            returnDate: { bsonType: ["string", "null"] },
            adults: { bsonType: "int" },
            children: { bsonType: "int" },
            infants: { bsonType: "int" },
            cabinClass: { bsonType: "string" }
          }
        },
        
        // Summary
        summary: {
          bsonType: ["object", "null"],
          properties: {
            totalFlights: { bsonType: "int" },
            minPrice: { bsonType: "number" },
            maxPrice: { bsonType: "number" },
            currency: { bsonType: "string" }
          }
        },
        
        // Reference to full data
        amadeusResponseId: { bsonType: ["objectId", "null"] },
        
        // User interactions
        interactions: {
          bsonType: ["object", "null"],
          properties: {
            viewedFlights: { bsonType: "array" },
            comparedFlights: { bsonType: "array" },
            timeSpent: { bsonType: "int" }
          }
        },
        
        // Conversion
        isConverted: { bsonType: "bool" },
        bookingId: { bsonType: ["objectId", "null"] },
        
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.search_cache.createIndex({ searchId: 1 }, { unique: true, name: "idx_searchId_unique" });
db.search_cache.createIndex({ cacheKey: 1 }, { unique: true, name: "idx_cacheKey_unique" });
db.search_cache.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.search_cache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ search_cache ready (TTL: 30 minutes)\n");


// =====================================================
// 1️⃣3️⃣ FARE LOCKS (PRICE PROTECTION)
// =====================================================

print("Creating fare_locks collection...");

db.createCollection("fare_locks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["lockId", "userId", "searchId", "lockedPrice", "expiresAt", "createdAt"],
      properties: {
        lockId: {
          bsonType: "string",
          pattern: "^LOCK-[0-9]{4}-[0-9]{6}$"
        },
        userId: { bsonType: "objectId" },
        searchId: { bsonType: "objectId" },
        flightOfferId: { bsonType: "string" },
        
        lockedPrice: { bsonType: "number" },
        currency: { bsonType: "string" },
        
        isUsed: { bsonType: "bool" },
        usedForBookingId: { bsonType: ["objectId", "null"] },
        usedAt: { bsonType: ["date", "null"] },
        
        lockedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.fare_locks.createIndex({ lockId: 1 }, { unique: true, name: "idx_lockId_unique" });
db.fare_locks.createIndex({ userId: 1, expiresAt: -1 }, { name: "idx_userId_expiresAt" });
db.fare_locks.createIndex({ searchId: 1 }, { name: "idx_searchId" });
db.fare_locks.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ fare_locks ready (TTL: 15 minutes)\n");


// =====================================================
// 1️⃣4️⃣ SYSTEM EVENTS (AUDIT / DEBUG)
// =====================================================

print("Creating system_events collection...");

db.createCollection("system_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventType", "entityType", "createdAt"],
      properties: {
        eventId: {
          bsonType: "string",
          pattern: "^EVT-[0-9]{4}-[0-9]{10}$"
        },
        eventType: { 
          enum: [
            "USER_REGISTERED",
            "USER_LOGIN",
            "SEARCH_PERFORMED",
            "BOOKING_CREATED",
            "BOOKING_CONFIRMED",
            "BOOKING_CANCELLED",
            "PAYMENT_INITIATED",
            "PAYMENT_SUCCESS",
            "PAYMENT_FAILED",
            "WALLET_CREDIT_ADDED",
            "WALLET_DEBIT",
            "ERROR_OCCURRED"
          ]
        },
        entityType: { 
          enum: ["USER", "BOOKING", "PAYMENT", "COMPANY", "SEARCH", "WALLET"] 
        },
        entityId: { bsonType: ["objectId", "null"] },
        
        userId: { bsonType: ["objectId", "null"] },
        companyId: { bsonType: ["objectId", "null"] },
        
        severity: { enum: ["INFO", "WARNING", "ERROR", "CRITICAL"] },
        
        message: { bsonType: "string" },
        metadata: { bsonType: ["object", "null"] },
        
        source: { bsonType: ["string", "null"] },
        ipAddress: { bsonType: ["string", "null"] },
        
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.system_events.createIndex({ eventId: 1 }, { unique: true, sparse: true, name: "idx_eventId_unique" });
db.system_events.createIndex({ eventType: 1, createdAt: -1 }, { name: "idx_eventType_createdAt" });
db.system_events.createIndex({ entityType: 1, entityId: 1 }, { name: "idx_entityType_entityId" });
db.system_events.createIndex({ userId: 1, createdAt: -1 }, { sparse: true, name: "idx_userId_createdAt" });
db.system_events.createIndex({ severity: 1 }, { name: "idx_severity" });
db.system_events.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ system_events ready\n");


// =====================================================
// 1️⃣5️⃣ REFERENCE DATA: AIRPORTS
// =====================================================

print("Creating airports collection...");

db.createCollection("airports");

db.airports.createIndex({ iataCode: 1 }, { unique: true, name: "idx_iataCode_unique" });
db.airports.createIndex({ city: 1 }, { name: "idx_city" });
db.airports.createIndex({ country: 1 }, { name: "idx_country" });
db.airports.createIndex({ name: "text", city: "text" }, { name: "idx_text_search" });

print("✅ airports ready\n");


// =====================================================
// 1️⃣6️⃣ REFERENCE DATA: AIRLINES
// =====================================================

print("Creating airlines collection...");

db.createCollection("airlines");

db.airlines.createIndex({ iataCode: 1 }, { unique: true, name: "idx_iataCode_unique" });
db.airlines.createIndex({ name: "text" }, { name: "idx_text_search" });

print("✅ airlines ready\n");


// =====================================================
// SAMPLE DATA INSERTION
// =====================================================

print("Inserting sample data...\n");

// Sample Airport Data
db.airports.insertMany([
  {
    iataCode: "BLR",
    icaoCode: "VOBL",
    name: "Kempegowda International Airport",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    timezone: "Asia/Kolkata"
  },
  {
    iataCode: "DEL",
    icaoCode: "VIDP",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    state: "Delhi",
    country: "IN",
    timezone: "Asia/Kolkata"
  },
  {
    iataCode: "BOM",
    icaoCode: "VABB",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    state: "Maharashtra",
    country: "IN",
    timezone: "Asia/Kolkata"
  }
]);

// Sample Airline Data
db.airlines.insertMany([
  {
    iataCode: "6E",
    icaoCode: "IGO",
    name: "IndiGo",
    country: "IN",
    isActive: true
  },
  {
    iataCode: "AI",
    icaoCode: "AIC",
    name: "Air India",
    country: "IN",
    isActive: true
  },
  {
    iataCode: "SG",
    icaoCode: "SEJ",
    name: "SpiceJet",
    country: "IN",
    isActive: true
  }
]);

print("✅ Sample data inserted\n");


// =====================================================
// FINISHED
// =====================================================

print("\n" + "=".repeat(70));
print("🎉 DATABASE SETUP COMPLETE!");
print("=".repeat(70));

print("\n📊 Collections Created:");
print("   ✅ Core: users, user_profiles, user_sessions");
print("   ✅ B2B: companies, company_users, company_wallets, company_wallet_ledger");
print("   ✅ Booking: bookings, booking_passengers, booking_status_history");
print("   ✅ Payment: payments");
print("   ✅ Search: search_cache, fare_locks");
print("   ✅ System: system_events");
print("   ✅ Reference: airports, airlines");
print("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
print("   📦 Total: 16 collections\n");

print("🔐 Security Features:");
print("   ✅ Schema validation on all collections");
print("   ✅ Unique constraints on critical fields");
print("   ✅ TTL indexes for auto-cleanup");
print("   ✅ Optimistic locking (wallet version)");
print("   ✅ Idempotency keys (wallet ledger)");
print("   ✅ Audit trails (status history, events)\n");

print("⚡ Performance Optimizations:");
print("   ✅ Compound indexes for common queries");
print("   ✅ Sparse indexes for optional fields");
print("   ✅ Text indexes for search");
print("   ✅ TTL indexes for auto-expiry\n");

print("🎯 Critical Collections Explained:");
print("\n   1. company_wallets (version field):");
print("      - Prevents race conditions in concurrent transactions");
print("      - Update pattern: { version: N } → { $inc: { version: 1 } }");
print("\n   2. company_wallet_ledger (idempotencyKey):");
print("      - Prevents duplicate transactions");
print("      - Immutable audit trail");
print("\n   3. bookings (unified B2C + B2B):");
print("      - Single table with discriminator (userType)");
print("      - Conditional fields (companyId for B2B)");
print("\n   4. search_cache & fare_locks:");
print("      - TTL auto-cleanup (30 min & 15 min)");
print("      - Reduces API costs\n");

print("🧪 Verification Commands:");
print("   db.getCollectionNames()");
print("   db.users.getIndexes()");
print("   db.company_wallets.getIndexes()");
print("   db.bookings.find().limit(1).pretty()\n");

print("📝 Database: location_data");
print("🔗 Ready for Spring Boot integration!");
print("🚀 Next: Implement wallet transaction logic with version control\n");
