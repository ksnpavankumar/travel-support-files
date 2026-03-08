# Complete Flight Booking Transaction Guide

> **End-to-End booking flow from search to confirmed reservation**

---

## 🎯 Overview

This guide walks through the complete flight booking transaction using the TravelEase Flight Search Service APIs. The booking flow consists of 5 main steps:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. SEARCH      │────▶│  2. PRICE       │────▶│  3. CREATE      │
│  Flight Offers  │     │  Offer Price    │     │  Order          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. CANCEL      │◀────│  5. MANAGE      │◀────│  4. CONFIRM     │
│  (Optional)     │     │  Retrieve Order │     │  MongoDB Store  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📋 Quick Reference

| Step | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| 1 | `/api/v1/booking/flight-offers` | POST | Search available flights |
| 2 | `/api/v1/booking/offer-price` | POST | Confirm price & availability |
| 3 | `/api/v1/booking/orders` | POST | Create booking |
| 4 | `/api/v1/booking/orders/{id}` | GET | Retrieve booking |
| 5 | `/api/v1/booking/orders/{id}` | DELETE | Cancel booking |
| 6 | `/api/v1/booking/bookings` | GET | List all bookings |

---

## 🚀 Complete Transaction Flow

### Scenario: Round-Trip International Booking

**Route**: New York (JFK) → London (LHR) → New York (JFK)  
**Travelers**: 1 Adult  
**Class**: Economy  
**Dates**: April 15-22, 2026

---

## Step 1: Search Flight Offers

**Endpoint**: `POST /api/v1/booking/flight-offers`

### Request

```bash
curl -X POST 'http://localhost:8080/api/v1/booking/flight-offers' \
  -H 'Content-Type: application/json' \
  -d '{
    "currencyCode": "USD",
    "originDestinations": [
      {
        "id": "1",
        "originLocationCode": "JFK",
        "destinationLocationCode": "LHR",
        "departureDateTimeRange": {
          "date": "2026-04-15"
        }
      },
      {
        "id": "2",
        "originLocationCode": "LHR",
        "destinationLocationCode": "JFK",
        "departureDateTimeRange": {
          "date": "2026-04-22"
        }
      }
    ],
    "travelers": [
      {
        "id": "1",
        "travelerType": "ADULT"
      }
    ],
    "sources": ["GDS"],
    "searchCriteria": {
      "maxFlightOffers": 5
    }
  }'
```

### Response (Save the flight offer for next step)

```json
{
  "status": "SUCCESS",
  "data": {
    "flightOffers": [
      {
        "type": "flight-offer",
        "id": "1",
        "source": "GDS",
        "instantTicketingRequired": false,
        "nonHomogeneous": false,
        "oneWay": false,
        "lastTicketingDate": "2026-03-20",
        "numberOfBookableSeats": 9,
        "itineraries": [
          {
            "duration": "PT7H55M",
            "segments": [
              {
                "departure": {
                  "iataCode": "JFK",
                  "terminal": "7",
                  "at": "2026-04-15T19:00:00"
                },
                "arrival": {
                  "iataCode": "LHR",
                  "terminal": "5",
                  "at": "2026-04-16T06:55:00"
                },
                "carrierCode": "BA",
                "number": "178",
                "aircraft": { "code": "777" },
                "operating": { "carrierCode": "BA" },
                "duration": "PT7H55M",
                "id": "1",
                "numberOfStops": 0,
                "blacklistedInEU": false
              }
            ]
          },
          {
            "duration": "PT8H30M",
            "segments": [
              {
                "departure": {
                  "iataCode": "LHR",
                  "terminal": "5",
                  "at": "2026-04-22T10:30:00"
                },
                "arrival": {
                  "iataCode": "JFK",
                  "terminal": "7",
                  "at": "2026-04-22T14:00:00"
                },
                "carrierCode": "BA",
                "number": "177",
                "aircraft": { "code": "777" },
                "operating": { "carrierCode": "BA" },
                "duration": "PT8H30M",
                "id": "2",
                "numberOfStops": 0,
                "blacklistedInEU": false
              }
            ]
          }
        ],
        "price": {
          "currency": "USD",
          "total": "1256.50",
          "base": "1050.00",
          "fees": [
            { "amount": "0.00", "type": "SUPPLIER" },
            { "amount": "0.00", "type": "TICKETING" }
          ],
          "grandTotal": "1256.50"
        },
        "pricingOptions": {
          "fareType": ["PUBLISHED"],
          "includedCheckedBagsOnly": true
        },
        "validatingAirlineCodes": ["BA"],
        "travelerPricings": [
          {
            "travelerId": "1",
            "fareOption": "STANDARD",
            "travelerType": "ADULT",
            "price": {
              "currency": "USD",
              "total": "1256.50",
              "base": "1050.00"
            },
            "fareDetailsBySegment": [
              {
                "segmentId": "1",
                "cabin": "ECONOMY",
                "fareBasis": "YOWUS",
                "class": "Y",
                "includedCheckedBags": {
                  "weight": 23,
                  "weightUnit": "KG"
                }
              },
              {
                "segmentId": "2",
                "cabin": "ECONOMY",
                "fareBasis": "YOWUS",
                "class": "Y",
                "includedCheckedBags": {
                  "weight": 23,
                  "weightUnit": "KG"
                }
              }
            ]
          }
        ]
      }
    ],
    "error": null
  },
  "message": "Flight offers retrieved successfully"
}
```

**⏱️ Note**: Flight offers are valid for approximately 15-30 minutes. Proceed to pricing quickly.

---

## Step 2: Confirm Price

**Endpoint**: `POST /api/v1/booking/offer-price`

### Request (Use the flight offer from Step 1)

```bash
curl -X POST 'http://localhost:8080/api/v1/booking/offer-price' \
  -H 'Content-Type: application/json' \
  -d '{
    "flightOffers": [
      {
        "type": "flight-offer",
        "id": "1",
        "source": "GDS",
        "instantTicketingRequired": false,
        "lastTicketingDate": "2026-03-20",
        "numberOfBookableSeats": 9,
        "itineraries": [
          {
            "duration": "PT7H55M",
            "segments": [
              {
                "departure": {
                  "iataCode": "JFK",
                  "terminal": "7",
                  "at": "2026-04-15T19:00:00"
                },
                "arrival": {
                  "iataCode": "LHR",
                  "terminal": "5",
                  "at": "2026-04-16T06:55:00"
                },
                "carrierCode": "BA",
                "number": "178",
                "aircraft": { "code": "777" },
                "duration": "PT7H55M",
                "id": "1",
                "numberOfStops": 0
              }
            ]
          },
          {
            "duration": "PT8H30M",
            "segments": [
              {
                "departure": {
                  "iataCode": "LHR",
                  "terminal": "5",
                  "at": "2026-04-22T10:30:00"
                },
                "arrival": {
                  "iataCode": "JFK",
                  "terminal": "7",
                  "at": "2026-04-22T14:00:00"
                },
                "carrierCode": "BA",
                "number": "177",
                "aircraft": { "code": "777" },
                "duration": "PT8H30M",
                "id": "2",
                "numberOfStops": 0
              }
            ]
          }
        ],
        "price": {
          "currency": "USD",
          "total": "1256.50",
          "base": "1050.00",
          "grandTotal": "1256.50"
        },
        "validatingAirlineCodes": ["BA"],
        "travelerPricings": [
          {
            "travelerId": "1",
            "travelerType": "ADULT",
            "price": {
              "currency": "USD",
              "total": "1256.50",
              "base": "1050.00"
            },
            "fareDetailsBySegment": [
              {
                "segmentId": "1",
                "cabin": "ECONOMY",
                "fareBasis": "YOWUS",
                "class": "Y",
                "includedCheckedBags": { "weight": 23, "weightUnit": "KG" }
              },
              {
                "segmentId": "2",
                "cabin": "ECONOMY",
                "fareBasis": "YOWUS",
                "class": "Y",
                "includedCheckedBags": { "weight": 23, "weightUnit": "KG" }
              }
            ]
          }
        ]
      }
    ],
    "include": "detailed-fare-rules"
  }'
```

### Response (Save flightPrice for next step)

```json
{
  "status": "SUCCESS",
  "data": {
    "flightPrice": {
      "type": "flight-offers-pricing",
      "flightOffers": [
        {
          "type": "flight-offer",
          "id": "1",
          "source": "GDS",
          "lastTicketingDate": "2026-03-20",
          "itineraries": [...],
          "price": {
            "currency": "USD",
            "total": "1256.50",
            "base": "1050.00",
            "grandTotal": "1256.50",
            "billingCurrency": "USD"
          },
          "travelerPricings": [...]
        }
      ],
      "bookingRequirements": {
        "emailAddressRequired": true,
        "mobilePhoneNumberRequired": true,
        "travelerRequirements": [
          {
            "travelerId": "1",
            "dateOfBirthRequired": true,
            "genderRequired": false,
            "documentRequired": true,
            "documentIssuanceCityRequired": false,
            "redressRequiredIfAny": false
          }
        ]
      }
    },
    "error": null
  },
  "message": "Flight price confirmed successfully"
}
```

**✅ Important**: Check `bookingRequirements` to know what information is needed for booking.

---

## Step 3: Create Order (Booking)

**Endpoint**: `POST /api/v1/booking/orders`

### Request (Use flightPrice from Step 2 + Add traveler details)

```bash
curl -X POST 'http://localhost:8080/api/v1/booking/orders' \
  -H 'Content-Type: application/json' \
  -d '{
    "flightPrice": {
      "type": "flight-offers-pricing",
      "flightOffers": [
        {
          "type": "flight-offer",
          "id": "1",
          "source": "GDS",
          "lastTicketingDate": "2026-03-20",
          "numberOfBookableSeats": 9,
          "itineraries": [
            {
              "duration": "PT7H55M",
              "segments": [
                {
                  "departure": {
                    "iataCode": "JFK",
                    "terminal": "7",
                    "at": "2026-04-15T19:00:00"
                  },
                  "arrival": {
                    "iataCode": "LHR",
                    "terminal": "5",
                    "at": "2026-04-16T06:55:00"
                  },
                  "carrierCode": "BA",
                  "number": "178",
                  "aircraft": { "code": "777" },
                  "duration": "PT7H55M",
                  "id": "1",
                  "numberOfStops": 0
                }
              ]
            },
            {
              "duration": "PT8H30M",
              "segments": [
                {
                  "departure": {
                    "iataCode": "LHR",
                    "terminal": "5",
                    "at": "2026-04-22T10:30:00"
                  },
                  "arrival": {
                    "iataCode": "JFK",
                    "terminal": "7",
                    "at": "2026-04-22T14:00:00"
                  },
                  "carrierCode": "BA",
                  "number": "177",
                  "aircraft": { "code": "777" },
                  "duration": "PT8H30M",
                  "id": "2",
                  "numberOfStops": 0
                }
              ]
            }
          ],
          "price": {
            "currency": "USD",
            "total": "1256.50",
            "base": "1050.00",
            "grandTotal": "1256.50"
          },
          "validatingAirlineCodes": ["BA"],
          "travelerPricings": [
            {
              "travelerId": "1",
              "travelerType": "ADULT",
              "price": {
                "currency": "USD",
                "total": "1256.50",
                "base": "1050.00"
              },
              "fareDetailsBySegment": [
                {
                  "segmentId": "1",
                  "cabin": "ECONOMY",
                  "fareBasis": "YOWUS",
                  "class": "Y"
                },
                {
                  "segmentId": "2",
                  "cabin": "ECONOMY",
                  "fareBasis": "YOWUS",
                  "class": "Y"
                }
              ]
            }
          ]
        }
      ]
    },
    "travelers": [
      {
        "id": "1",
        "dateOfBirth": "1990-05-15",
        "gender": "MALE",
        "name": {
          "firstName": "JOHN",
          "lastName": "TRAVELER"
        },
        "contact": {
          "emailAddresses": ["john.traveler@email.com"],
          "phones": [
            {
              "deviceType": "MOBILE",
              "countryCallingCode": "1",
              "number": "2125551234"
            }
          ]
        },
        "documents": [
          {
            "documentType": "PASSPORT",
            "number": "US98765432",
            "expiryDate": "2030-12-31",
            "issuanceCountry": "US",
            "nationality": "US",
            "holder": true
          }
        ]
      }
    ],
    "remarks": "Window seat preferred. Vegetarian meal."
  }'
```

### Response (Save orderId)

```json
{
  "status": "SUCCESS",
  "data": {
    "flightOrder": {
      "type": "flight-order",
      "id": "eJzTd9f3NjIJCXYCAAtXAmE",
      "queuingOfficeId": "NCE1A0950",
      "associatedRecords": [
        {
          "reference": "XYZABC",
          "creationDate": "2026-03-07",
          "originSystemCode": "GDS",
          "flightOfferId": "1"
        }
      ],
      "travelers": [
        {
          "id": "1",
          "dateOfBirth": "1990-05-15",
          "gender": "MALE",
          "name": {
            "firstName": "JOHN",
            "lastName": "TRAVELER"
          }
        }
      ],
      "flightOffers": [...],
      "ticketingAgreement": {
        "option": "DELAY_TO_CANCEL",
        "dateTime": "2026-03-08T23:59:00"
      }
    },
    "orderId": "eJzTd9f3NjIJCXYCAAtXAmE",
    "pnr": "XYZABC",
    "bookingStatus": "CONFIRMED",
    "error": null
  },
  "message": "Flight order created successfully. Order ID: eJzTd9f3NjIJCXYCAAtXAmE"
}
```

**🎉 Booking Confirmed!**
- **Order ID**: `eJzTd9f3NjIJCXYCAAtXAmE`
- **PNR**: `XYZABC`

---

## Step 4: Retrieve Booking (Optional)

**Endpoint**: `GET /api/v1/booking/orders/{orderId}`

```bash
curl -X GET 'http://localhost:8080/api/v1/booking/orders/eJzTd9f3NjIJCXYCAAtXAmE'
```

### Response

```json
{
  "status": "SUCCESS",
  "data": {
    "flightOrder": {
      "type": "flight-order",
      "id": "eJzTd9f3NjIJCXYCAAtXAmE",
      "associatedRecords": [
        {
          "reference": "XYZABC",
          "creationDate": "2026-03-07"
        }
      ],
      "travelers": [...],
      "flightOffers": [...],
      "ticketingAgreement": {...}
    },
    "orderId": "eJzTd9f3NjIJCXYCAAtXAmE",
    "pnr": "XYZABC",
    "bookingStatus": "CONFIRMED",
    "error": null
  },
  "message": "Flight order retrieved successfully"
}
```

---

## Step 5: Cancel Booking (Optional)

**Endpoint**: `DELETE /api/v1/booking/orders/{orderId}`

```bash
curl -X DELETE 'http://localhost:8080/api/v1/booking/orders/eJzTd9f3NjIJCXYCAAtXAmE'
```

### Response

```json
{
  "status": "SUCCESS",
  "data": {
    "orderId": "eJzTd9f3NjIJCXYCAAtXAmE",
    "bookingStatus": "CANCELLED",
    "error": null
  },
  "message": "Flight order cancelled successfully"
}
```

---

## Step 6: View All Bookings

**Endpoint**: `GET /api/v1/booking/bookings`

```bash
# All bookings
curl -X GET 'http://localhost:8080/api/v1/booking/bookings'

# By user ID
curl -X GET 'http://localhost:8080/api/v1/booking/bookings?userId=USR-2026-000001'

# By status
curl -X GET 'http://localhost:8080/api/v1/booking/bookings?status=CONFIRMED'

# Cancelled bookings
curl -X GET 'http://localhost:8080/api/v1/booking/bookings?status=CANCELLED'
```

---

## 📊 MongoDB Data Flow

When a booking is created, data is stored in multiple collections:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CREATE ORDER                              │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    bookings     │  │booking_passengers│  │    payments     │
│                 │  │                 │  │                 │
│ - bookingId     │  │ - passengerId   │  │ - paymentId     │
│ - userId        │  │ - bookingId     │  │ - bookingId     │
│ - pnr           │  │ - name          │  │ - amount        │
│ - flightSnapshot│  │ - passport      │  │ - status        │
│ - pricingSnapshot│ │ - ticketNumber  │  │ - method        │
│ - status        │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                    
          │                    
          ▼                    
┌─────────────────┐  ┌─────────────────┐
│booking_status_  │  │  system_events  │
│    history      │  │                 │
│                 │  │ - eventType     │
│ - bookingId     │  │ - entityId      │
│ - previousStatus│  │ - timestamp     │
│ - newStatus     │  │ - severity      │
│ - changedAt     │  │                 │
└─────────────────┘  └─────────────────┘
```

---

## 🔄 Status Flow

```
PENDING ──▶ CONFIRMED ──▶ TICKETED ──▶ COMPLETED
    │           │
    │           └──▶ CANCELLED
    │
    └──▶ FAILED
```

---

## ⚠️ Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Flight offers are required" | Empty flightOffers array | Pass flight offer from search |
| "Flight price has expired" | Too much time between steps | Restart from search |
| "No seats available" | Flight sold out | Search for different flight |
| "Invalid passport" | Incorrect document details | Verify passport info |
| "Price has changed" | Dynamic pricing | Re-run offer-price step |

---

## ⏱️ Timing Considerations

| Step | Validity Period |
|------|-----------------|
| Search → Price | ~15-30 minutes |
| Price → Order | ~10-15 minutes |
| Order → Ticketing | Varies by airline (check `lastTicketingDate`) |

---

## 🔐 Best Practices

1. **Don't cache flight offers** for more than 10 minutes
2. **Always re-price** before showing final price to customer
3. **Validate passport expiry** (should be 6+ months from travel date)
4. **Use UPPERCASE** for names (as per passport)
5. **Store orderId and PNR** immediately after booking
6. **Implement retry logic** for network failures

---

## 📱 Complete Transaction Script

Here's a shell script to execute the complete flow:

```bash
#!/bin/bash
# complete_booking.sh

BASE_URL="http://localhost:8080/api/v1/booking"

echo "Step 1: Searching flights..."
SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/flight-offers" \
  -H 'Content-Type: application/json' \
  -d '{"currencyCode":"USD","originDestinations":[{"id":"1","originLocationCode":"JFK","destinationLocationCode":"LHR","departureDateTimeRange":{"date":"2026-04-15"}}],"travelers":[{"id":"1","travelerType":"ADULT"}],"sources":["GDS"],"searchCriteria":{"maxFlightOffers":1}}')

echo "Search complete. Extracting offer..."

# In real implementation, parse JSON and extract flight offer
FLIGHT_OFFER=$(echo $SEARCH_RESPONSE | jq '.data.flightOffers[0]')

echo "Step 2: Confirming price..."
PRICE_RESPONSE=$(curl -s -X POST "$BASE_URL/offer-price" \
  -H 'Content-Type: application/json' \
  -d "{\"flightOffers\":[$FLIGHT_OFFER]}")

echo "Price confirmed. Extracting pricing..."

FLIGHT_PRICE=$(echo $PRICE_RESPONSE | jq '.data.flightPrice')

echo "Step 3: Creating order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H 'Content-Type: application/json' \
  -d "{
    \"flightPrice\": $FLIGHT_PRICE,
    \"travelers\": [{
      \"id\": \"1\",
      \"dateOfBirth\": \"1990-05-15\",
      \"gender\": \"MALE\",
      \"name\": {\"firstName\": \"JOHN\", \"lastName\": \"DOE\"},
      \"contact\": {
        \"emailAddresses\": [\"john@email.com\"],
        \"phones\": [{\"deviceType\": \"MOBILE\", \"countryCallingCode\": \"1\", \"number\": \"5551234\"}]
      },
      \"documents\": [{
        \"documentType\": \"PASSPORT\",
        \"number\": \"US123456\",
        \"expiryDate\": \"2030-12-31\",
        \"issuanceCountry\": \"US\",
        \"nationality\": \"US\",
        \"holder\": true
      }]
    }]
  }")

echo "Booking complete!"
echo $ORDER_RESPONSE | jq '{orderId: .data.orderId, pnr: .data.pnr, status: .data.bookingStatus}'
```

---

## 📚 Related Documentation

- [OFFER_PRICE_README.md](./OFFER_PRICE_README.md) - Detailed offer price documentation
- [ORDER_CREATE_README.md](./ORDER_CREATE_README.md) - Detailed order creation documentation
- [SAMPLE_PAYLOADS.md](./SAMPLE_PAYLOADS.md) - Sample request/response payloads
- [DATABASE.md](./DATABASE.md) - MongoDB schema documentation
- [API_WORKFLOW.md](./API_WORKFLOW.md) - API workflow diagrams

---

*Last Updated: March 2026*

