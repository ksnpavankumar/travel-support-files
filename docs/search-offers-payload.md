# Flight Offer Search - Sample Payloads

> **Endpoint**: `POST /api/v1/booking/flight-offers`  
> **Content-Type**: `application/json`

---

## 1️⃣ One-Way Search (Single Segment)

**Scenario**: Search for one-way flights from Bangalore (BLR) to Delhi (DEL) on April 15, 2026

```json
{
  "currencyCode": "INR",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "BLR",
      "destinationLocationCode": "DEL",
      "departureDateTimeRange": {
        "date": "2026-04-15",
        "time": "10:00:00"
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
    "maxFlightOffers": 10
  }
}
```

### One-Way with Multiple Travelers (2 Adults + 1 Child)

```json
{
  "currencyCode": "INR",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "BLR",
      "destinationLocationCode": "DEL",
      "departureDateTimeRange": {
        "date": "2026-04-15",
        "time": "10:00:00"
      }
    }
  ],
  "travelers": [
    {
      "id": "1",
      "travelerType": "ADULT"
    },
    {
      "id": "2",
      "travelerType": "ADULT"
    },
    {
      "id": "3",
      "travelerType": "CHILD"
    }
  ],
  "sources": ["GDS"],
  "searchCriteria": {
    "maxFlightOffers": 5
  }
}
```

---

## 2️⃣ Round-Trip Search (Two Segments)

**Scenario**: Round trip from Mumbai (BOM) to London (LHR) - Depart April 20, Return April 30, 2026

```json
{
  "currencyCode": "INR",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "BOM",
      "destinationLocationCode": "LHR",
      "departureDateTimeRange": {
        "date": "2026-04-20",
        "time": "08:00:00"
      }
    },
    {
      "id": "2",
      "originLocationCode": "LHR",
      "destinationLocationCode": "BOM",
      "departureDateTimeRange": {
        "date": "2026-04-30",
        "time": "14:00:00"
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
}
```

---

## 3️⃣ Multi-City Search (3+ Segments)

**Scenario**: Multi-city trip: Delhi → Dubai → London → Delhi

```json
{
  "currencyCode": "INR",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "DEL",
      "destinationLocationCode": "DXB",
      "departureDateTimeRange": {
        "date": "2026-04-15",
        "time": "06:00:00"
      }
    },
    {
      "id": "2",
      "originLocationCode": "DXB",
      "destinationLocationCode": "LHR",
      "departureDateTimeRange": {
        "date": "2026-04-18",
        "time": "10:00:00"
      }
    },
    {
      "id": "3",
      "originLocationCode": "LHR",
      "destinationLocationCode": "DEL",
      "departureDateTimeRange": {
        "date": "2026-04-25",
        "time": "20:00:00"
      }
    }
  ],
  "travelers": [
    {
      "id": "1",
      "travelerType": "ADULT"
    },
    {
      "id": "2",
      "travelerType": "ADULT"
    }
  ],
  "sources": ["GDS"],
  "searchCriteria": {
    "maxFlightOffers": 3
  }
}
```

### Multi-City Search (4 Cities - Business Trip)

**Scenario**: Bangalore → Singapore → Tokyo → Hong Kong → Bangalore

```json
{
  "currencyCode": "USD",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "BLR",
      "destinationLocationCode": "SIN",
      "departureDateTimeRange": {
        "date": "2026-05-01",
        "time": "08:00:00"
      }
    },
    {
      "id": "2",
      "originLocationCode": "SIN",
      "destinationLocationCode": "NRT",
      "departureDateTimeRange": {
        "date": "2026-05-05",
        "time": "09:00:00"
      }
    },
    {
      "id": "3",
      "originLocationCode": "NRT",
      "destinationLocationCode": "HKG",
      "departureDateTimeRange": {
        "date": "2026-05-10",
        "time": "11:00:00"
      }
    },
    {
      "id": "4",
      "originLocationCode": "HKG",
      "destinationLocationCode": "BLR",
      "departureDateTimeRange": {
        "date": "2026-05-15",
        "time": "22:00:00"
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
}
```

---

## 📋 Quick Reference

### Traveler Types
| Type | Description |
|------|-------------|
| `ADULT` | 12 years and above |
| `CHILD` | 2-11 years |
| `INFANT` | Under 2 years (not shown in your DTO but supported by Amadeus) |

### Common Airport Codes
| Code | City |
|------|------|
| BLR | Bangalore, India |
| DEL | Delhi, India |
| BOM | Mumbai, India |
| HYD | Hyderabad, India |
| MAA | Chennai, India |
| CCU | Kolkata, India |
| LHR | London Heathrow, UK |
| DXB | Dubai, UAE |
| SIN | Singapore |
| NRT | Tokyo Narita, Japan |
| HKG | Hong Kong |
| JFK | New York JFK, USA |
| LAX | Los Angeles, USA |
| CDG | Paris, France |
| FRA | Frankfurt, Germany |

### Currency Codes
| Code | Currency |
|------|----------|
| INR | Indian Rupee |
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| AED | UAE Dirham |

---

## 🧪 cURL Commands

### One-Way Search
```bash
curl -X POST 'http://localhost:8080/api/v1/booking/flight-offers' \
  -H 'Content-Type: application/json' \
  -d '{
    "currencyCode": "INR",
    "originDestinations": [
      {
        "id": "1",
        "originLocationCode": "BLR",
        "destinationLocationCode": "DEL",
        "departureDateTimeRange": {
          "date": "2026-04-15",
          "time": "10:00:00"
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

### Multi-City Search
```bash
curl -X POST 'http://localhost:8080/api/v1/booking/flight-offers' \
  -H 'Content-Type: application/json' \
  -d '{
    "currencyCode": "INR",
    "originDestinations": [
      {
        "id": "1",
        "originLocationCode": "DEL",
        "destinationLocationCode": "DXB",
        "departureDateTimeRange": {
          "date": "2026-04-15",
          "time": "06:00:00"
        }
      },
      {
        "id": "2",
        "originLocationCode": "DXB",
        "destinationLocationCode": "LHR",
        "departureDateTimeRange": {
          "date": "2026-04-18",
          "time": "10:00:00"
        }
      },
      {
        "id": "3",
        "originLocationCode": "LHR",
        "destinationLocationCode": "DEL",
        "departureDateTimeRange": {
          "date": "2026-04-25",
          "time": "20:00:00"
        }
      }
    ],
    "travelers": [
      {
        "id": "1",
        "travelerType": "ADULT"
      },
      {
        "id": "2",
        "travelerType": "ADULT"
      }
    ],
    "sources": ["GDS"],
    "searchCriteria": {
      "maxFlightOffers": 3
    }
  }'
```

---

## 📊 Request Structure Summary

```
FlightOffersSearchRequest
├── currencyCode: "INR" | "USD" | "EUR" | ...
├── originDestinations: [                      ◄── Array of segments
│   ├── [0] One-way / First leg
│   │   ├── id: "1"
│   │   ├── originLocationCode: "BLR"
│   │   ├── destinationLocationCode: "DEL"
│   │   └── departureDateTimeRange
│   │       ├── date: "2026-04-15"
│   │       └── time: "10:00:00" (optional)
│   ├── [1] Return / Second city (for round-trip/multi-city)
│   └── [N] Additional cities...
├── travelers: [
│   ├── { id: "1", travelerType: "ADULT" }
│   ├── { id: "2", travelerType: "ADULT" }
│   └── { id: "3", travelerType: "CHILD" }
├── sources: ["GDS"]
└── searchCriteria (optional)
    └── maxFlightOffers: 5
```

---

**Endpoint**: `POST /api/v1/booking/flight-offers`

