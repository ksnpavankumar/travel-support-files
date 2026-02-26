// ============================================
// FLIGHT BOOKING SYSTEM - MONGODB SETUP
// Complete Database Schema with Indexes
// Execute: mongosh < mongodb_setup_complete.js
// ============================================

// Use database
use flight_booking_db;

print("🚀 Starting MongoDB setup for Flight Booking System...\n");

// ============================================
// PART 1: CORE COLLECTIONS
// ============================================

print("📦 Creating Core Collections...");

// ============================================
// 1. USERS
// ============================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "email", "userType", "accountStatus"],
      properties: {
        userId: { bsonType: "string", pattern: "^USR-[0-9]{4}-[0-9]{6}$" },
        email: { bsonType: "string" },
        userType: { enum: ["B2C", "B2B"] },
        accountStatus: { enum: ["ACTIVE", "SUSPENDED", "INACTIVE", "DELETED"] }
      }
    }
  }
});

// Sample B2C User
db.users.insertOne({
  userId: "USR-2024-000001",
  email: "john.doe@example.com",
  phone: "+919876543210",
  phoneCountryCode: "+91",
  passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  isEmailVerified: true,
  isPhoneVerified: true,
  twoFactorEnabled: false,
  userType: "B2C",
  accountStatus: "ACTIVE",
  profile: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: ISODate("1990-05-15T00:00:00Z"),
    gender: "MALE",
    nationality: "IN",
    avatar: "https://cdn.example.com/avatars/user001.jpg"
  },
  b2bProfile: null,
  quickAccess: {
    loyaltyPoints: 5420,
    loyaltyTier: "SILVER",
    availableCredit: 0,
    totalBookings: 23,
    totalSpent: 456700,
    isVerified: true,
    isPremium: false
  },
  security: {
    lastPasswordChange: ISODate("2024-01-15T10:30:00Z"),
    failedLoginAttempts: 0,
    lastFailedLogin: null,
    accountLockedUntil: null,
    lastLogin: ISODate("2024-02-20T08:00:00Z")
  },
  notificationPreferences: {
    email: { bookingConfirmation: true, paymentReceipt: true, promotions: false },
    sms: { bookingConfirmation: true, offers: false },
    push: { bookingUpdates: true, offers: true }
  },
  analytics: {
    lastBookingDate: ISODate("2024-02-15T10:30:00Z"),
    favoriteRoutes: ["BLR-DEL", "BLR-BOM"],
    preferredAirlines: ["6E", "AI"],
    averageBookingValue: 19857,
    rfmScore: 8
  },
  metadata: {
    referralCode: "REF-JOHN-000001",
    referredBy: null,
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "summer-sale-2024",
    tags: ["HIGH_VALUE", "FREQUENT_TRAVELER"],
    version: 1,
    createdAt: ISODate("2024-01-15T10:30:00Z"),
    updatedAt: ISODate("2024-02-20T15:30:00Z"),
    createdBy: "SYSTEM"
  }
});

// Sample B2B User
db.users.insertOne({
  userId: "USR-2024-000002",
  email: "agent@abctravels.com",
  phone: "+919876543211",
  phoneCountryCode: "+91",
  passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  isEmailVerified: true,
  isPhoneVerified: true,
  twoFactorEnabled: true,
  userType: "B2B",
  accountStatus: "ACTIVE",
  profile: {
    firstName: "Rajesh",
    lastName: "Kumar",
    dateOfBirth: ISODate("1985-08-20T00:00:00Z"),
    gender: "MALE",
    nationality: "IN",
    avatar: null
  },
  b2bProfile: {
    companyId: ObjectId(),
    role: "AGENT",
    agentCode: "AGT-000001",
    department: "SALES",
    employeeId: "EMP-001",
    permissions: {
      canCreateBooking: true,
      canCancelBooking: true,
      canViewReports: true,
      canManageCredit: false,
      maxBookingValue: 500000,
      dailyBookingLimit: 10
    },
    commissionPercentage: 3.5,
    markupPercentage: 5.0
  },
  quickAccess: {
    loyaltyPoints: 0,
    loyaltyTier: null,
    availableCredit: 650000,
    totalBookings: 156,
    totalSpent: 2340000,
    isVerified: true,
    isPremium: false
  },
  security: {
    lastPasswordChange: ISODate("2024-01-15T10:30:00Z"),
    failedLoginAttempts: 0,
    lastFailedLogin: null,
    accountLockedUntil: null,
    lastLogin: ISODate("2024-02-20T08:00:00Z")
  },
  notificationPreferences: {
    email: { bookingConfirmation: true, paymentReceipt: true, promotions: true },
    sms: { bookingConfirmation: true, offers: true },
    push: { bookingUpdates: true, offers: true }
  },
  analytics: {
    lastBookingDate: ISODate("2024-02-18T10:30:00Z"),
    monthlyBookings: 23,
    monthlyRevenue: 345600,
    averageBookingValue: 15025
  },
  metadata: {
    referralCode: null,
    referredBy: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    tags: ["B2B_AGENT", "HIGH_PERFORMER"],
    version: 1,
    createdAt: ISODate("2024-01-15T10:30:00Z"),
    updatedAt: ISODate("2024-02-20T15:30:00Z"),
    createdBy: "SYSTEM"
  }
});

// Indexes for users
db.users.createIndex({ email: 1 }, { unique: true, name: "idx_email_unique" });
db.users.createIndex({ userId: 1 }, { unique: true, name: "idx_userId_unique" });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true, name: "idx_phone_unique" });
db.users.createIndex({ "b2bProfile.agentCode": 1 }, { unique: true, sparse: true, name: "idx_agentCode_unique" });
db.users.createIndex({ userType: 1, accountStatus: 1 }, { name: "idx_userType_accountStatus" });
db.users.createIndex({ "b2bProfile.companyId": 1 }, { sparse: true, name: "idx_b2b_companyId" });
db.users.createIndex({ "metadata.createdAt": 1 }, { name: "idx_createdAt" });
db.users.createIndex({ "security.lastLogin": 1 }, { name: "idx_lastLogin" });

print("✅ Users collection created");

// ============================================
// 2. COMPANIES
// ============================================
db.createCollection("companies", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "legalName", "businessType", "status"],
      properties: {
        companyId: { bsonType: "string", pattern: "^COMP-[0-9]{4}-[0-9]{6}$" },
        legalName: { bsonType: "string", minLength: 3 },
        businessType: { enum: ["TRAVEL_AGENCY", "CORPORATE", "DISTRIBUTOR", "AGGREGATOR"] },
        status: { enum: ["PENDING", "ACTIVE", "SUSPENDED", "BLOCKED", "CLOSED"] }
      }
    }
  }
});

db.companies.insertOne({
  companyId: "COMP-2024-000001",
  legalName: "ABC Travels Private Limited",
  tradeName: "ABC Travels",
  businessType: "TRAVEL_AGENCY",
  registrationType: "PRIVATE_LIMITED",
  registrationNumber: "U63040KA2020PTC123456",
  gstNumber: "29AABCU9603R1ZM",
  panNumber: "AABCU9603R",
  tanNumber: "BLRU12345F",
  establishedDate: ISODate("2020-05-15T00:00:00Z"),
  website: "https://www.abctravels.com",
  logo: "https://cdn.abctravels.com/logo.png",
  description: "Leading travel agency specializing in corporate bookings",
  primaryContact: {
    name: "Rajesh Kumar",
    designation: "CEO",
    email: "rajesh@abctravels.com",
    phone: "+919876543210",
    mobile: "+919876543210"
  },
  billingContact: {
    name: "Priya Sharma",
    designation: "Finance Manager",
    email: "billing@abctravels.com",
    phone: "+919876543211"
  },
  supportContact: {
    email: "support@abctravels.com",
    phone: "+919876543212"
  },
  address: {
    line1: "456 Brigade Road",
    line2: "5th Floor, Tower A",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    postalCode: "560025",
    latitude: 12.9716,
    longitude: 77.5946
  },
  agencyDetails: {
    iataNumber: "12345678",
    iataVerified: true,
    specialization: ["CORPORATE", "LEISURE", "MICE"],
    targetMarket: ["CORPORATE_B2B", "SME", "RETAIL"],
    servicesOffered: ["FLIGHTS", "HOTELS", "VISA", "INSURANCE", "PACKAGES"],
    employeeCount: 25,
    branchCount: 3
  },
  subscription: {
    planName: "ENTERPRISE",
    planType: "ENTERPRISE",
    features: {
      maxUsers: 50,
      maxBookingsPerMonth: 1000,
      apiAccess: true,
      whiteLabeling: true,
      dedicatedSupport: true
    },
    pricing: {
      setupFee: 50000,
      monthlyFee: 25000,
      transactionFeePercentage: 0.5,
      currency: "INR"
    },
    billingCycle: "MONTHLY",
    paymentMethod: "CREDIT",
    startDate: ISODate("2024-01-01T00:00:00Z"),
    endDate: ISODate("2025-01-01T00:00:00Z"),
    renewalDate: ISODate("2025-01-01T00:00:00Z"),
    status: "ACTIVE",
    autoRenew: true,
    currentMonthUsage: {
      bookings: 156,
      activeUsers: 23,
      apiCalls: 4567
    }
  },
  financial: {
    creditLimit: 5000000,
    availableCredit: 3200000,
    usedCredit: 1800000,
    blockedCredit: 0,
    paymentTerms: 30,
    gracePeriod: 7,
    interestRate: 2.5,
    creditScore: 750,
    creditRating: "A",
    lastCreditReview: ISODate("2024-01-15T00:00:00Z"),
    nextCreditReview: ISODate("2024-07-15T00:00:00Z"),
    billingCycle: "MONTHLY",
    billingDay: 1,
    paymentDueDay: 30,
    gstApplicable: true,
    tdsApplicable: true,
    tdsPercentage: 5.0,
    bankDetails: {
      accountHolderName: "ABC Travels Pvt Ltd",
      accountNumber: "1234567890",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      branchName: "MG Road Branch",
      accountType: "CURRENT",
      isPrimary: true,
      isVerified: true
    }
  },
  pricing: {
    defaultCommissionPercentage: 3.5,
    defaultMarkupPercentage: 5.0,
    domesticCommission: 3.0,
    internationalCommission: 4.0,
    domesticMarkup: 5.0,
    internationalMarkup: 7.5,
    serviceFee: {
      domestic: 50,
      international: 100,
      currency: "INR"
    },
    canCustomizeMarkup: true,
    maxMarkupPercentage: 15.0
  },
  performance: {
    lifetime: {
      totalBookings: 1456,
      totalRevenue: 12500000,
      totalCommission: 437500,
      averageBookingValue: 8583,
      cancellationRate: 3.2
    },
    currentMonth: {
      bookings: 156,
      revenue: 1340000,
      commission: 46900,
      cancellations: 5
    },
    ratings: {
      overall: 4.5,
      paymentHistory: 5.0,
      documentCompliance: 4.8,
      customerSupport: 4.2
    }
  },
  compliance: {
    kycStatus: "VERIFIED",
    kycCompletedDate: ISODate("2024-01-15T10:30:00Z"),
    agreementSigned: true,
    agreementDate: ISODate("2024-01-15T10:30:00Z"),
    agreementUrl: "https://cdn.abctravels.com/agreements/master.pdf",
    termsAccepted: true,
    termsVersion: "v2.0",
    termsAcceptedDate: ISODate("2024-01-15T10:30:00Z")
  },
  status: "ACTIVE",
  flags: {
    isVerified: true,
    isFeatured: false,
    isBlacklisted: false,
    requiresApproval: false,
    isPremium: true
  },
  metadata: {
    tags: ["PREMIUM", "CORPORATE", "HIGH_VOLUME"],
    notes: "Excellent payment record. Premium partner.",
    version: 1,
    createdAt: ISODate("2024-01-15T10:30:00Z"),
    updatedAt: ISODate("2024-02-20T15:30:00Z"),
    lastActivityDate: ISODate("2024-02-20T15:30:00Z")
  }
});

db.companies.createIndex({ companyId: 1 }, { unique: true, name: "idx_companyId_unique" });
db.companies.createIndex({ gstNumber: 1 }, { unique: true, sparse: true, name: "idx_gstNumber_unique" });
db.companies.createIndex({ panNumber: 1 }, { sparse: true, name: "idx_panNumber" });
db.companies.createIndex({ status: 1 }, { name: "idx_status" });
db.companies.createIndex({ businessType: 1 }, { name: "idx_businessType" });
db.companies.createIndex({ "subscription.status": 1 }, { name: "idx_subscription_status" });

print("✅ Companies collection created");

// ============================================
// 3. FLIGHT_SEARCHES
// ============================================
db.createCollection("flight_searches");

db.flight_searches.insertOne({
  searchId: "SRCH-2024-02-20-000001",
  userId: ObjectId(),
  userType: "B2C",
  companyId: null,
  sessionId: "sess_1234567890abcdef",
  criteria: {
    tripType: "ROUND_TRIP",
    origin: "BLR",
    destination: "DEL",
    departureDate: "2024-03-15",
    returnDate: "2024-03-20",
    passengers: {
      adults: 2,
      children: 1,
      infants: 0,
      total: 3
    },
    cabinClass: "ECONOMY",
    directFlightsOnly: false
  },
  cacheKey: "BLR-DEL-2024-03-15-2024-03-20-2-1-0-ECO",
  summary: {
    totalFlights: 45,
    priceRange: { min: 15200, max: 45000, currency: "INR" },
    cheapestFlightId: "FL-000001",
    fastestFlightId: "FL-000005",
    recommendedFlightId: "FL-000001",
    airlinesAvailable: ["6E", "AI", "SG", "UK"]
  },
  amadeusResponseId: ObjectId(),
  interactions: {
    viewedFlights: ["FL-000001", "FL-000005", "FL-000012"],
    comparedFlights: ["FL-000001", "FL-000005"],
    filteredBy: {
      priceRange: { min: 15000, max: 25000 },
      stops: [0],
      airlines: ["6E"]
    },
    sortedBy: "PRICE_LOW_TO_HIGH",
    timeSpent: 245
  },
  conversion: {
    isConverted: false,
    bookingId: null,
    selectedFlightId: null,
    convertedAt: null,
    abandonedReason: null
  },
  expiresAt: ISODate("2024-02-20T11:00:00Z"),
  createdAt: ISODate("2024-02-20T10:30:00Z"),
  device: {
    type: "DESKTOP",
    os: "Windows",
    browser: "Chrome",
    ipAddress: "103.21.124.45",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "IN"
    }
  }
});

db.flight_searches.createIndex({ searchId: 1 }, { unique: true, name: "idx_searchId_unique" });
db.flight_searches.createIndex({ cacheKey: 1 }, { name: "idx_cacheKey" });
db.flight_searches.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });
db.flight_searches.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.flight_searches.createIndex({ "criteria.origin": 1, "criteria.destination": 1 }, { name: "idx_route" });
db.flight_searches.createIndex({ "conversion.isConverted": 1 }, { name: "idx_conversion" });

print("✅ Flight Searches collection created");

// ============================================
// 4. BOOKINGS
// ============================================
db.createCollection("bookings");

// B2C Booking Example
db.bookings.insertOne({
  bookingId: "BKG-2024-000001",
  pnr: "ABC123",
  userId: ObjectId(),
  userType: "B2C",
  companyId: null,
  b2bDetails: null,
  searchReference: {
    searchId: ObjectId(),
    selectedFlightOfferId: "FL-000001",
    searchPrice: 18500,
    bookingPrice: 19112.50,
    priceDifference: 612.50,
    timeTakenToBook: 245
  },
  flightSummary: {
    airline: "IndiGo",
    airlineCode: "6E",
    flightNumber: "6E-2345",
    route: "BLR-DEL-BLR",
    departure: {
      airport: "BLR",
      city: "Bangalore",
      terminal: "1",
      dateTime: ISODate("2024-03-15T06:00:00Z")
    },
    return: {
      airport: "DEL",
      city: "Delhi",
      terminal: "3",
      dateTime: ISODate("2024-03-20T18:00:00Z")
    },
    totalPassengers: 3,
    cabinClass: "ECONOMY"
  },
  pricing: {
    basePrice: 15000,
    taxes: 3500,
    serviceFee: 462.50,
    convenienceFee: 150,
    discount: 0,
    loyaltyDiscount: 0,
    total: 19112.50,
    currency: "INR",
    markup: null,
    commission: null,
    agentProfit: null
  },
  payment: {
    status: "COMPLETED",
    method: "CREDIT_CARD",
    transactionId: "TXN-123456789",
    paymentGateway: "RAZORPAY",
    paidAt: ISODate("2024-02-20T10:45:00Z"),
    isCreditUsed: null,
    invoiceId: null,
    paymentDueDate: null
  },
  bookingStatus: "CONFIRMED",
  ticketingStatus: "TICKETED",
  isCancelled: false,
  cancelledAt: null,
  cancellationReason: null,
  refundAmount: 0,
  refundStatus: null,
  bookedAt: ISODate("2024-02-20T10:45:00Z"),
  confirmedAt: ISODate("2024-02-20T10:45:30Z"),
  ticketedAt: ISODate("2024-02-20T10:46:00Z"),
  contactInfo: {
    email: "john.doe@example.com",
    phone: "+919876543210"
  },
  source: "WEB",
  ipAddress: "103.21.124.45",
  createdAt: ISODate("2024-02-20T10:45:00Z"),
  updatedAt: ISODate("2024-02-20T10:46:00Z")
});

// B2B Booking Example
db.bookings.insertOne({
  bookingId: "BKG-2024-000002",
  pnr: "XYZ789",
  userId: ObjectId(),
  userType: "B2B",
  companyId: ObjectId(),
  b2bDetails: {
    companyName: "ABC Travels Pvt Ltd",
    companyGST: "29AABCU9603R1ZM",
    agentName: "Rajesh Kumar",
    agentCode: "AGT-000001",
    agentEmail: "rajesh@abctravels.com"
  },
  searchReference: {
    searchId: ObjectId(),
    selectedFlightOfferId: "FL-000015",
    searchPrice: 85000,
    bookingPrice: 100850,
    priceDifference: 15850,
    timeTakenToBook: 120
  },
  flightSummary: {
    airline: "Air India",
    airlineCode: "AI",
    flightNumber: "AI-505",
    route: "BLR-DEL-BLR",
    departure: {
      airport: "BLR",
      city: "Bangalore",
      terminal: "1",
      dateTime: ISODate("2024-03-15T10:00:00Z")
    },
    return: {
      airport: "DEL",
      city: "Delhi",
      terminal: "3",
      dateTime: ISODate("2024-03-20T20:00:00Z")
    },
    totalPassengers: 2,
    cabinClass: "BUSINESS"
  },
  pricing: {
    basePrice: 85000,
    taxes: 15000,
    serviceFee: 100,
    convenienceFee: null,
    discount: 0,
    loyaltyDiscount: null,
    markup: 4250,
    commission: 3500,
    agentProfit: 3500,
    customerPrice: 104350,
    companyEarning: 750,
    total: 100850,
    currency: "INR"
  },
  payment: {
    status: "PENDING",
    method: "CREDIT",
    transactionId: null,
    paymentGateway: null,
    paidAt: null,
    isCreditUsed: true,
    creditAmount: 100850,
    invoiceId: null,
    paymentDueDate: ISODate("2024-03-30T23:59:59Z")
  },
  bookingStatus: "CONFIRMED",
  ticketingStatus: "TICKETED",
  isCancelled: false,
  cancelledAt: null,
  cancellationReason: null,
  refundAmount: 0,
  refundStatus: null,
  bookedAt: ISODate("2024-02-20T11:15:00Z"),
  confirmedAt: ISODate("2024-02-20T11:15:30Z"),
  ticketedAt: ISODate("2024-02-20T11:16:00Z"),
  contactInfo: {
    email: "rajesh@abctravels.com",
    phone: "+919876543210"
  },
  source: "WEB",
  ipAddress: "103.21.124.45",
  createdAt: ISODate("2024-02-20T11:15:00Z"),
  updatedAt: ISODate("2024-02-20T11:16:00Z")
});

db.bookings.createIndex({ bookingId: 1 }, { unique: true, name: "idx_bookingId_unique" });
db.bookings.createIndex({ pnr: 1 }, { unique: true, name: "idx_pnr_unique" });
db.bookings.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.bookings.createIndex({ userType: 1, bookingStatus: 1, createdAt: -1 }, { name: "idx_userType_status_created" });
db.bookings.createIndex({ companyId: 1, createdAt: -1 }, { sparse: true, name: "idx_companyId_createdAt" });
db.bookings.createIndex({ "b2bDetails.companyId": 1, createdAt: -1 }, { sparse: true, name: "idx_b2b_company_created" });
db.bookings.createIndex({ bookingStatus: 1 }, { name: "idx_bookingStatus" });
db.bookings.createIndex({ "payment.status": 1 }, { name: "idx_paymentStatus" });
db.bookings.createIndex({ "flightSummary.departure.dateTime": 1 }, { name: "idx_departureDate" });
db.bookings.createIndex({ "searchReference.searchId": 1 }, { sparse: true, name: "idx_searchRef" });

print("✅ Bookings collection created");

// ============================================
// 5. PAYMENTS
// ============================================
db.createCollection("payments");

db.payments.insertOne({
  paymentId: "PAY-2024-000001",
  bookingId: ObjectId(),
  userId: ObjectId(),
  amount: 19112.50,
  currency: "INR",
  paymentMethod: "CREDIT_CARD",
  gateway: {
    name: "RAZORPAY",
    transactionId: "pay_123456789ABCDEF",
    orderId: "order_123456789ABCDEF",
    cardDetails: {
      last4: "4242",
      cardType: "VISA",
      cardNetwork: "VISA",
      issuer: "HDFC Bank"
    }
  },
  status: "SUCCESS",
  initiatedAt: ISODate("2024-02-20T10:44:30Z"),
  completedAt: ISODate("2024-02-20T10:45:00Z"),
  refund: {
    isRefunded: false,
    refundAmount: 0,
    refundTransactionId: null,
    refundedAt: null,
    refundReason: null
  },
  gatewayResponse: {
    status: "captured",
    method: "card",
    amount_refunded: 0,
    captured: true,
    description: "Flight Booking Payment",
    error_code: null,
    error_description: null
  },
  createdAt: ISODate("2024-02-20T10:44:30Z"),
  updatedAt: ISODate("2024-02-20T10:45:00Z")
});

db.payments.createIndex({ paymentId: 1 }, { unique: true, name: "idx_paymentId_unique" });
db.payments.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.payments.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.payments.createIndex({ status: 1 }, { name: "idx_status" });
db.payments.createIndex({ "gateway.transactionId": 1 }, { name: "idx_transactionId" });
db.payments.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });

print("✅ Payments collection created");

// ============================================
// 6. INVOICES
// ============================================
db.createCollection("invoices");

db.invoices.insertOne({
  invoiceId: "INV-2024-000001",
  invoiceNumber: "INV/24-25/000001",
  companyId: ObjectId(),
  companyName: "ABC Travels Pvt Ltd",
  companyGST: "29AABCU9603R1ZM",
  billingPeriod: {
    from: ISODate("2024-02-01T00:00:00Z"),
    to: ISODate("2024-02-29T23:59:59Z"),
    month: "February",
    year: 2024
  },
  bookings: [{
    bookingId: ObjectId(),
    bookingReference: "BKG-2024-000002",
    pnr: "XYZ789",
    passengerCount: 2,
    baseAmount: 85000,
    commission: 2975,
    bookingDate: ISODate("2024-02-20T11:15:00Z")
  }],
  totalBookings: 23,
  amounts: {
    subtotal: 1955000,
    commission: 68425,
    taxes: 12316.50,
    tds: 3421.25,
    adjustments: 0,
    totalAmount: 77320.25,
    currency: "INR"
  },
  payment: {
    status: "UNPAID",
    dueDate: ISODate("2024-03-30T23:59:59Z"),
    paidAmount: 0,
    balanceAmount: 77320.25,
    paidDate: null,
    paymentMethod: null,
    transactionId: null
  },
  status: "SENT",
  documents: {
    invoicePdfUrl: "https://cdn.example.com/invoices/INV-2024-000001.pdf",
    detailedReportUrl: "https://cdn.example.com/invoices/INV-2024-000001-detailed.xlsx"
  },
  generatedAt: ISODate("2024-03-01T00:00:00Z"),
  sentAt: ISODate("2024-03-01T10:00:00Z"),
  createdAt: ISODate("2024-03-01T00:00:00Z"),
  updatedAt: ISODate("2024-03-01T10:00:00Z")
});

db.invoices.createIndex({ invoiceId: 1 }, { unique: true, name: "idx_invoiceId_unique" });
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true, name: "idx_invoiceNumber_unique" });
db.invoices.createIndex({ companyId: 1, "billingPeriod.from": -1 }, { name: "idx_company_period" });
db.invoices.createIndex({ "payment.status": 1 }, { name: "idx_paymentStatus" });
db.invoices.createIndex({ "payment.dueDate": 1 }, { name: "idx_dueDate" });
db.invoices.createIndex({ status: 1 }, { name: "idx_status" });

print("✅ Invoices collection created");

// ============================================
// PART 2: USER-RELATED COLLECTIONS
// ============================================

print("\n📦 Creating User-Related Collections...");

// ============================================
// 7. USER_PAYMENT_METHODS
// ============================================
db.createCollection("user_payment_methods");

db.user_payment_methods.insertOne({
  paymentMethodId: "PM-000001",
  userId: ObjectId(),
  type: "CREDIT_CARD",
  isDefault: true,
  cardDetails: {
    cardHolderName: "JOHN DOE",
    last4Digits: "4242",
    cardBrand: "VISA",
    cardType: "CREDIT",
    expiryMonth: "12",
    expiryYear: "2027",
    paymentGatewayToken: "tok_1234567890abcdef",
    gateway: "RAZORPAY"
  },
  upiDetails: null,
  billingAddress: {
    line1: "123 MG Road",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    postalCode: "560001"
  },
  isActive: true,
  isVerified: true,
  lastUsedAt: ISODate("2024-02-20T10:45:00Z"),
  usageCount: 12,
  addedAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-20T10:45:00Z")
});

db.user_payment_methods.createIndex({ userId: 1 }, { name: "idx_userId" });
db.user_payment_methods.createIndex({ userId: 1, isDefault: 1 }, { name: "idx_userId_isDefault" });

print("✅ User Payment Methods collection created");

// ============================================
// 8. USER_SESSIONS
// ============================================
db.createCollection("user_sessions");

db.user_sessions.insertOne({
  sessionId: "sess_1234567890abcdef",
  userId: ObjectId(),
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  device: {
    type: "MOBILE",
    os: "iOS",
    osVersion: "17.2",
    browser: "Safari",
    browserVersion: "17.2",
    userAgent: "Mozilla/5.0..."
  },
  location: {
    ipAddress: "103.21.124.45",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN"
  },
  loginAt: ISODate("2024-02-20T08:00:00Z"),
  lastActivity: ISODate("2024-02-20T15:30:00Z"),
  expiresAt: ISODate("2024-02-21T08:00:00Z"),
  isActive: true,
  createdAt: ISODate("2024-02-20T08:00:00Z")
});

db.user_sessions.createIndex({ sessionId: 1 }, { unique: true, name: "idx_sessionId_unique" });
db.user_sessions.createIndex({ userId: 1, isActive: 1 }, { name: "idx_userId_isActive" });
db.user_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ User Sessions collection created");

// ============================================
// 9. USER_SAVED_TRAVELERS
// ============================================
db.createCollection("user_saved_travelers");

db.user_saved_travelers.insertOne({
  travelerId: "TRV-000001",
  userId: ObjectId(),
  relation: "SPOUSE",
  nickname: "Jane",
  title: "Mrs",
  firstName: "Jane",
  lastName: "Doe",
  dateOfBirth: ISODate("1992-08-20T00:00:00Z"),
  gender: "FEMALE",
  nationality: "IN",
  passport: {
    number: "N9876543",
    issuingCountry: "IN",
    expiryDate: ISODate("2029-08-20T00:00:00Z")
  },
  contact: {
    email: "jane.doe@example.com",
    phone: "+919876543211"
  },
  preferences: {
    seatPreference: "AISLE",
    mealPreference: "NON_VEGETARIAN",
    frequentFlyerNumber: "FF9876543210"
  },
  isDefault: false,
  isActive: true,
  bookingCount: 8,
  lastUsedAt: ISODate("2024-02-15T10:30:00Z"),
  addedAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-01T10:30:00Z")
});

db.user_saved_travelers.createIndex({ userId: 1 }, { name: "idx_userId" });
db.user_saved_travelers.createIndex({ userId: 1, isDefault: 1 }, { name: "idx_userId_isDefault" });

print("✅ User Saved Travelers collection created");

// ============================================
// 10. USER_KYC_DOCUMENTS
// ============================================
db.createCollection("user_kyc_documents");

db.user_kyc_documents.insertOne({
  documentId: "DOC-000001",
  userId: ObjectId(),
  documentType: "PASSPORT",
  documentNumber: "M1234567",
  issuingCountry: "IN",
  issuingAuthority: "Government of India",
  issueDate: ISODate("2020-05-15T00:00:00Z"),
  expiryDate: ISODate("2030-05-15T00:00:00Z"),
  files: {
    frontImageUrl: "https://s3.amazonaws.com/kyc/user123/passport-front.jpg",
    backImageUrl: "https://s3.amazonaws.com/kyc/user123/passport-back.jpg",
    fileSize: 2048576
  },
  verification: {
    status: "VERIFIED",
    verifiedAt: ISODate("2024-01-15T10:30:00Z"),
    verifiedBy: ObjectId(),
    rejectionReason: null,
    autoVerified: false,
    ocrData: {
      extractedName: "JOHN DOE",
      extractedNumber: "M1234567",
      confidence: 0.98
    }
  },
  isActive: true,
  isPrimary: true,
  uploadedAt: ISODate("2024-01-10T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
});

db.user_kyc_documents.createIndex({ userId: 1 }, { name: "idx_userId" });
db.user_kyc_documents.createIndex({ documentType: 1, userId: 1 }, { name: "idx_docType_userId" });
db.user_kyc_documents.createIndex({ "verification.status": 1 }, { name: "idx_verificationStatus" });

print("✅ User KYC Documents collection created");

// ============================================
// 11. USER_PREFERENCES
// ============================================
db.createCollection("user_preferences");

db.user_preferences.insertOne({
  userId: ObjectId(),
  flight: {
    seatPreference: "WINDOW",
    mealPreference: "VEGETARIAN",
    specialAssistance: ["WHEELCHAIR"],
    frequentFlyerNumbers: [{
      airline: "6E",
      airlineName: "IndiGo",
      number: "FF1234567890",
      tier: "BLUE"
    }]
  },
  display: {
    language: "en",
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24H"
  },
  notifications: {
    email: {
      bookingConfirmation: true,
      paymentReceipt: true,
      flightReminders: true,
      flightStatusUpdates: true,
      promotions: false,
      newsletter: false,
      priceAlerts: true
    },
    sms: {
      bookingConfirmation: true,
      flightReminders: true,
      flightStatusUpdates: true,
      offers: false
    },
    push: {
      bookingUpdates: true,
      checkInReminder: true,
      gateChanges: true,
      offers: true
    },
    whatsapp: {
      bookingConfirmation: true,
      flightUpdates: true,
      promotions: false
    }
  },
  search: {
    defaultTripType: "ROUND_TRIP",
    defaultCabinClass: "ECONOMY",
    preferDirectFlights: false,
    preferredAirlines: ["6E", "AI"],
    excludedAirlines: [],
    defaultPassengers: { adults: 1, children: 0, infants: 0 }
  },
  privacy: {
    shareDataForPersonalization: true,
    allowMarketingCommunication: false,
    showTravelHistory: true
  },
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-01T10:30:00Z")
});

db.user_preferences.createIndex({ userId: 1 }, { unique: true, name: "idx_userId_unique" });

print("✅ User Preferences collection created");

// ============================================
// 12. USER_LOYALTY_TRANSACTIONS
// ============================================
db.createCollection("user_loyalty_transactions");

db.user_loyalty_transactions.insertOne({
  transactionId: "LTX-000001",
  userId: ObjectId(),
  type: "EARNED",
  points: 450,
  description: "Points earned for booking BKG-2024-000001",
  referenceType: "BOOKING",
  referenceId: ObjectId(),
  balanceAfter: 5420,
  expiresAt: ISODate("2025-02-20T23:59:59Z"),
  createdAt: ISODate("2024-02-20T10:45:00Z"),
  createdBy: "SYSTEM"
});

db.user_loyalty_transactions.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_userId_createdAt" });
db.user_loyalty_transactions.createIndex({ type: 1 }, { name: "idx_type" });
db.user_loyalty_transactions.createIndex({ expiresAt: 1 }, { name: "idx_expiresAt" });

print("✅ User Loyalty Transactions collection created");

// ============================================
// PART 3: COMPANY-RELATED COLLECTIONS
// ============================================

print("\n📦 Creating Company-Related Collections...");

// ============================================
// 13. COMPANY_BRANCHES
// ============================================
db.createCollection("company_branches");

db.company_branches.insertOne({
  branchId: "BR-000001",
  companyId: ObjectId(),
  branchName: "Bangalore Main Office",
  branchCode: "BLR-001",
  isHeadOffice: true,
  address: {
    line1: "456 Brigade Road",
    line2: "5th Floor, Tower A",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    postalCode: "560025",
    latitude: 12.9716,
    longitude: 77.5946
  },
  contact: {
    email: "bangalore@abctravels.com",
    phone: "+919876543210",
    manager: "Rajesh Kumar",
    managerPhone: "+919876543210"
  },
  employeeCount: 15,
  isActive: true,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-01T10:30:00Z")
});

db.company_branches.createIndex({ companyId: 1 }, { name: "idx_companyId" });
db.company_branches.createIndex({ branchCode: 1 }, { unique: true, name: "idx_branchCode_unique" });
db.company_branches.createIndex({ isActive: 1 }, { name: "idx_isActive" });

print("✅ Company Branches collection created");

// ============================================
// 14. COMPANY_DOCUMENTS
// ============================================
db.createCollection("company_documents");

db.company_documents.insertOne({
  documentId: "CDOC-000001",
  companyId: ObjectId(),
  documentType: "GST_CERTIFICATE",
  documentNumber: "29AABCU9603R1ZM",
  documentName: "GST Certificate",
  fileUrl: "https://s3.amazonaws.com/company-docs/gst-cert.pdf",
  fileSize: 2048576,
  issuedDate: ISODate("2020-06-01T00:00:00Z"),
  expiryDate: null,
  verificationStatus: "VERIFIED",
  verifiedAt: ISODate("2024-01-15T10:30:00Z"),
  verifiedBy: ObjectId(),
  isActive: true,
  uploadedAt: ISODate("2024-01-10T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
});

db.company_documents.createIndex({ companyId: 1 }, { name: "idx_companyId" });
db.company_documents.createIndex({ documentType: 1, companyId: 1 }, { name: "idx_docType_companyId" });
db.company_documents.createIndex({ verificationStatus: 1 }, { name: "idx_verificationStatus" });

print("✅ Company Documents collection created");

// ============================================
// 15. COMPANY_COMMISSION_RULES
// ============================================
db.createCollection("company_commission_rules");

db.company_commission_rules.insertOne({
  ruleId: "RULE-000001",
  companyId: ObjectId(),
  ruleType: "TIERED",
  ruleName: "Standard Commission Structure",
  domesticTiers: [{
    minValue: 0,
    maxValue: 5000,
    percentage: 2.5
  }, {
    minValue: 5001,
    maxValue: 10000,
    percentage: 3.0
  }, {
    minValue: 10001,
    maxValue: null,
    percentage: 3.5
  }],
  internationalTiers: [{
    minValue: 0,
    maxValue: 50000,
    percentage: 3.5
  }, {
    minValue: 50001,
    maxValue: null,
    percentage: 4.0
  }],
  airlineSpecificRules: [{
    airlineCode: "6E",
    airlineName: "IndiGo",
    percentage: 4.0,
    applicableFor: "ALL"
  }],
  effectiveFrom: ISODate("2024-01-01T00:00:00Z"),
  effectiveTill: null,
  isActive: true,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
});

db.company_commission_rules.createIndex({ companyId: 1, isActive: 1 }, { name: "idx_companyId_isActive" });
db.company_commission_rules.createIndex({ effectiveFrom: 1, effectiveTill: 1 }, { name: "idx_effective_dates" });

print("✅ Company Commission Rules collection created");

// ============================================
// 16. COMPANY_USERS
// ============================================
db.createCollection("company_users");

db.company_users.insertOne({
  companyId: ObjectId(),
  userId: ObjectId(),
  role: "AGENT",
  department: "SALES",
  employeeId: "EMP-001",
  reportingTo: ObjectId(),
  joinedAt: ISODate("2024-01-15T10:30:00Z"),
  isActive: true,
  lastActiveAt: ISODate("2024-02-20T15:30:00Z"),
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-02-01T10:30:00Z")
});

db.company_users.createIndex({ companyId: 1, userId: 1 }, { unique: true, name: "idx_company_user_unique" });
db.company_users.createIndex({ companyId: 1, role: 1 }, { name: "idx_companyId_role" });
db.company_users.createIndex({ userId: 1 }, { name: "idx_userId" });

print("✅ Company Users collection created");

// ============================================
// PART 4: FLIGHT-RELATED COLLECTIONS
// ============================================

print("\n📦 Creating Flight-Related Collections...");

// ============================================
// 17. AMADEUS_RESPONSES
// ============================================
db.createCollection("amadeus_responses");

db.amadeus_responses.insertOne({
  responseId: "RESP-000001",
  searchId: ObjectId(),
  endpoint: "shopping/flight-offers",
  requestParams: {
    originLocationCode: "BLR",
    destinationLocationCode: "DEL",
    departureDate: "2024-03-15",
    returnDate: "2024-03-20",
    adults: 2,
    children: 1,
    travelClass: "ECONOMY"
  },
  responseData: {
    meta: { count: 45 },
    data: [], // Full Amadeus response array
    dictionaries: {
      locations: {},
      aircraft: {},
      carriers: {}
    }
  },
  responseSize: 524288,
  responseTime: 1245,
  expiresAt: ISODate("2024-02-20T11:00:00Z"),
  createdAt: ISODate("2024-02-20T10:30:00Z")
});

db.amadeus_responses.createIndex({ responseId: 1 }, { unique: true, name: "idx_responseId_unique" });
db.amadeus_responses.createIndex({ searchId: 1 }, { name: "idx_searchId" });
db.amadeus_responses.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ Amadeus Responses collection created");

// ============================================
// 18. FLIGHT_OFFERS
// ============================================
db.createCollection("flight_offers");

db.flight_offers.insertOne({
  flightOfferId: "FL-000001",
  searchId: ObjectId(),
  amadeusOfferId: "1",
  airline: "IndiGo",
  airlineCode: "6E",
  flightNumber: "6E-2345",
  outbound: {
    origin: "BLR",
    destination: "DEL",
    departureTime: ISODate("2024-03-15T06:00:00Z"),
    arrivalTime: ISODate("2024-03-15T08:30:00Z"),
    duration: 150,
    stops: 0,
    segments: [{
      departure: { iataCode: "BLR", terminal: "1", at: "2024-03-15T06:00:00" },
      arrival: { iataCode: "DEL", terminal: "3", at: "2024-03-15T08:30:00" },
      carrierCode: "6E",
      number: "2345",
      aircraft: "320",
      duration: "PT2H30M"
    }]
  },
  inbound: {
    origin: "DEL",
    destination: "BLR",
    departureTime: ISODate("2024-03-20T18:00:00Z"),
    arrivalTime: ISODate("2024-03-20T20:35:00Z"),
    duration: 155,
    stops: 0,
    segments: [{
      departure: { iataCode: "DEL", terminal: "3", at: "2024-03-20T18:00:00" },
      arrival: { iataCode: "BLR", terminal: "1", at: "2024-03-20T20:35:00" },
      carrierCode: "6E",
      number: "2346",
      aircraft: "320",
      duration: "PT2H35M"
    }]
  },
  pricing: {
    basePrice: 15000,
    taxes: 3500,
    total: 18500,
    currency: "INR",
    perPassengerBreakdown: [{
      type: "ADULT",
      count: 2,
      basePrice: 7500,
      taxes: 1750,
      total: 9250
    }]
  },
  fareDetails: {
    cabinClass: "ECONOMY",
    brandedFare: "LITE",
    fareBasis: "UIP",
    fareType: "PUBLISHED",
    baggage: {
      checkIn: { adults: "15 KG", children: "15 KG" },
      cabinBag: { adults: "7 KG", children: "7 KG" }
    },
    cancellationFee: 3500,
    dateChangeFee: 2500,
    refundable: false,
    changeable: true
  },
  seatsAvailable: 9,
  lastTicketingDate: ISODate("2024-03-14T23:59:59Z"),
  rankingScore: 8.25,
  expiresAt: ISODate("2024-02-20T11:00:00Z"),
  createdAt: ISODate("2024-02-20T10:30:00Z")
});

db.flight_offers.createIndex({ flightOfferId: 1 }, { unique: true, name: "idx_flightOfferId_unique" });
db.flight_offers.createIndex({ searchId: 1 }, { name: "idx_searchId" });
db.flight_offers.createIndex({ airlineCode: 1 }, { name: "idx_airlineCode" });
db.flight_offers.createIndex({ "pricing.total": 1 }, { name: "idx_price" });
db.flight_offers.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_ttl" });

print("✅ Flight Offers collection created");

// ============================================
// 19. FLIGHT_PRICE_HISTORY
// ============================================
db.createCollection("flight_price_history");

db.flight_price_history.insertOne({
  route: "BLR-DEL",
  date: "2024-03-15",
  airline: "6E",
  cabinClass: "ECONOMY",
  price: 18500,
  currency: "INR",
  pricePerPassenger: 6166.67,
  passengers: 3,
  capturedAt: ISODate("2024-02-20T10:30:00Z")
});

db.flight_price_history.createIndex({ route: 1, date: 1, capturedAt: -1 }, { name: "idx_route_date_captured" });
db.flight_price_history.createIndex({ airline: 1, route: 1 }, { name: "idx_airline_route" });
db.flight_price_history.createIndex({ capturedAt: -1 }, { name: "idx_capturedAt" });

print("✅ Flight Price History collection created");

// ============================================
// PART 5: BOOKING-RELATED COLLECTIONS
// ============================================

print("\n📦 Creating Booking-Related Collections...");

// ============================================
// 20. BOOKING_PASSENGERS
// ============================================
db.createCollection("booking_passengers");

db.booking_passengers.insertOne({
  passengerId: "PAX-000001",
  bookingId: ObjectId(),
  passengerNumber: 1,
  passengerType: "ADULT",
  title: "Mr",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: ISODate("1990-05-15T00:00:00Z"),
  gender: "MALE",
  nationality: "IN",
  passport: {
    number: "M1234567",
    expiryDate: ISODate("2030-05-15T00:00:00Z"),
    issuingCountry: "IN"
  },
  contactInfo: {
    email: "john.doe@example.com",
    phone: "+919876543210"
  },
  seatAssignments: [{
    segmentId: "SEG-001",
    seatNumber: "12A",
    seatType: "WINDOW"
  }],
  mealPreference: "VEGETARIAN",
  frequentFlyerNumber: "FF1234567890",
  specialRequests: [],
  ticketNumber: "1234567890123",
  ticketStatus: "ISSUED",
  eTicketUrl: "https://cdn.example.com/tickets/1234567890123.pdf",
  createdAt: ISODate("2024-02-20T10:45:00Z"),
  updatedAt: ISODate("2024-02-20T10:46:00Z")
});

db.booking_passengers.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.booking_passengers.createIndex({ passengerId: 1 }, { unique: true, name: "idx_passengerId_unique" });
db.booking_passengers.createIndex({ ticketNumber: 1 }, { unique: true, sparse: true, name: "idx_ticketNumber" });

print("✅ Booking Passengers collection created");

// ============================================
// 21. BOOKING_FLIGHTS
// ============================================
db.createCollection("booking_flights");

db.booking_flights.insertOne({
  segmentId: "SEG-000001",
  bookingId: ObjectId(),
  direction: "OUTBOUND",
  segmentNumber: 1,
  departure: {
    airport: "BLR",
    city: "Bangalore",
    terminal: "1",
    dateTime: ISODate("2024-03-15T06:00:00Z")
  },
  arrival: {
    airport: "DEL",
    city: "Delhi",
    terminal: "3",
    dateTime: ISODate("2024-03-15T08:30:00Z")
  },
  carrier: {
    airlineCode: "6E",
    airlineName: "IndiGo",
    flightNumber: "2345",
    operatingCarrier: "6E"
  },
  aircraft: "Airbus A320",
  aircraftCode: "320",
  duration: 150,
  cabinClass: "ECONOMY",
  bookingClass: "U",
  fareBasis: "UIP",
  status: "CONFIRMED",
  createdAt: ISODate("2024-02-20T10:45:00Z")
});

db.booking_flights.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.booking_flights.createIndex({ segmentId: 1 }, { unique: true, name: "idx_segmentId_unique" });
db.booking_flights.createIndex({ "departure.dateTime": 1 }, { name: "idx_departureDateTime" });

print("✅ Booking Flights collection created");

// ============================================
// 22. BOOKING_ADDONS
// ============================================
db.createCollection("booking_addons");

db.booking_addons.insertOne({
  addonId: "ADDON-000001",
  bookingId: ObjectId(),
  passengerId: ObjectId(),
  addonType: "BAGGAGE",
  description: "Extra 10kg baggage",
  quantity: 1,
  price: 1500,
  currency: "INR",
  status: "CONFIRMED",
  segmentIds: [ObjectId()],
  addedAt: ISODate("2024-02-20T10:50:00Z"),
  confirmedAt: ISODate("2024-02-20T10:50:30Z")
});

db.booking_addons.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.booking_addons.createIndex({ passengerId: 1 }, { name: "idx_passengerId" });
db.booking_addons.createIndex({ addonType: 1 }, { name: "idx_addonType" });

print("✅ Booking Addons collection created");

// ============================================
// 23. BOOKING_STATUS_HISTORY
// ============================================
db.createCollection("booking_status_history");

db.booking_status_history.insertOne({
  historyId: "HIST-000001",
  bookingId: ObjectId(),
  previousStatus: "PENDING",
  newStatus: "CONFIRMED",
  statusType: "BOOKING_STATUS",
  changedBy: ObjectId(),
  changedByType: "SYSTEM",
  reason: "Payment successful",
  metadata: {
    paymentId: "PAY-2024-000001",
    transactionId: "TXN-123456789",
    notes: "Auto-confirmed after payment"
  },
  changedAt: ISODate("2024-02-20T10:45:30Z")
});

db.booking_status_history.createIndex({ bookingId: 1, changedAt: -1 }, { name: "idx_bookingId_changedAt" });
db.booking_status_history.createIndex({ newStatus: 1 }, { name: "idx_newStatus" });

print("✅ Booking Status History collection created");

// ============================================
// 24. BOOKING_CANCELLATIONS
// ============================================
db.createCollection("booking_cancellations");

db.booking_cancellations.insertOne({
  cancellationId: "CXL-000001",
  bookingId: ObjectId(),
  bookingReference: "BKG-2024-000001",
  pnr: "ABC123",
  userId: ObjectId(),
  cancelledBy: ObjectId(),
  cancelledByType: "USER",
  cancellationType: "FULL",
  reason: "Change of plans",
  reasonCategory: "CUSTOMER_REQUEST",
  passengersCancelled: [ObjectId()],
  cancellationCharges: {
    airlineFee: 3500,
    serviceFee: 100,
    totalCharges: 3600,
    currency: "INR"
  },
  refund: {
    refundableAmount: 15512.50,
    refundMethod: "ORIGINAL_PAYMENT_METHOD",
    refundStatus: "PENDING",
    refundInitiatedAt: null,
    refundCompletedAt: null,
    refundTransactionId: null
  },
  requestedAt: ISODate("2024-02-25T10:00:00Z"),
  processedAt: ISODate("2024-02-25T10:05:00Z"),
  status: "PROCESSED",
  createdAt: ISODate("2024-02-25T10:00:00Z"),
  updatedAt: ISODate("2024-02-25T10:05:00Z")
});

db.booking_cancellations.createIndex({ cancellationId: 1 }, { unique: true, name: "idx_cancellationId_unique" });
db.booking_cancellations.createIndex({ bookingId: 1 }, { name: "idx_bookingId" });
db.booking_cancellations.createIndex({ status: 1 }, { name: "idx_status" });
db.booking_cancellations.createIndex({ "refund.refundStatus": 1 }, { name: "idx_refundStatus" });

print("✅ Booking Cancellations collection created");

// ============================================
// PART 6: REFERENCE DATA COLLECTIONS
// ============================================

print("\n📦 Creating Reference Data Collections...");

// ============================================
// 25. AIRPORTS
// ============================================
db.createCollection("airports");

db.airports.insertMany([
  {
    iataCode: "BLR",
    icaoCode: "VOBL",
    name: "Kempegowda International Airport",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    countryName: "India",
    timezone: "Asia/Kolkata",
    location: {
      type: "Point",
      coordinates: [77.7064, 13.1986]
    },
    terminals: ["1", "2"],
    isActive: true
  },
  {
    iataCode: "DEL",
    icaoCode: "VIDP",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    state: "Delhi",
    country: "IN",
    countryName: "India",
    timezone: "Asia/Kolkata",
    location: {
      type: "Point",
      coordinates: [77.0999, 28.5562]
    },
    terminals: ["1", "2", "3"],
    isActive: true
  },
  {
    iataCode: "BOM",
    icaoCode: "VABB",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    state: "Maharashtra",
    country: "IN",
    countryName: "India",
    timezone: "Asia/Kolkata",
    location: {
      type: "Point",
      coordinates: [72.8777, 19.0896]
    },
    terminals: ["1", "2"],
    isActive: true
  }
]);

db.airports.createIndex({ iataCode: 1 }, { unique: true, name: "idx_iataCode_unique" });
db.airports.createIndex({ icaoCode: 1 }, { unique: true, sparse: true, name: "idx_icaoCode_unique" });
db.airports.createIndex({ city: 1 }, { name: "idx_city" });
db.airports.createIndex({ country: 1 }, { name: "idx_country" });
db.airports.createIndex({ location: "2dsphere" }, { name: "idx_location_geo" });
db.airports.createIndex({ name: "text", city: "text" }, { name: "idx_text_search" });

print("✅ Airports collection created");

// ============================================
// 26. AIRLINES
// ============================================
db.createCollection("airlines");

db.airlines.insertMany([
  {
    iataCode: "6E",
    icaoCode: "IGO",
    name: "IndiGo",
    country: "IN",
    logo: "https://cdn.example.com/airlines/6E.png",
    isActive: true,
    isLowCost: true
  },
  {
    iataCode: "AI",
    icaoCode: "AIC",
    name: "Air India",
    country: "IN",
    logo: "https://cdn.example.com/airlines/AI.png",
    isActive: true,
    isLowCost: false
  },
  {
    iataCode: "SG",
    icaoCode: "SEJ",
    name: "SpiceJet",
    country: "IN",
    logo: "https://cdn.example.com/airlines/SG.png",
    isActive: true,
    isLowCost: true
  },
  {
    iataCode: "UK",
    icaoCode: "VTI",
    name: "Vistara",
    country: "IN",
    logo: "https://cdn.example.com/airlines/UK.png",
    isActive: true,
    isLowCost: false
  }
]);

db.airlines.createIndex({ iataCode: 1 }, { unique: true, name: "idx_iataCode_unique" });
db.airlines.createIndex({ icaoCode: 1 }, { unique: true, sparse: true, name: "idx_icaoCode_unique" });
db.airlines.createIndex({ name: "text" }, { name: "idx_text_search" });

print("✅ Airlines collection created");

// ============================================
// SUMMARY
// ============================================

print("\n" + "=".repeat(50));
print("🎉 DATABASE SETUP COMPLETE!");
print("=".repeat(50));
print("\n📊 Collections Created:");
print("   ✅ Core Collections: 6");
print("   ✅ User-Related: 6");
print("   ✅ Company-Related: 4");
print("   ✅ Flight-Related: 3");
print("   ✅ Booking-Related: 5");
print("   ✅ Reference Data: 2");
print("   ━━━━━━━━━━━━━━━━━━━");
print("   📦 Total: 26 collections");
print("\n🔍 Database: flight_booking_db");
print("📝 Run: db.getCollectionNames() to verify\n");