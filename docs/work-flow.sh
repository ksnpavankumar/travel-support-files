#!/bin/bash

# Flight Offers Collection - cURL Commands
# Generated from Postman Collection: flight-offers
# Date: March 9, 2026

echo "=================================================="
echo "1. POST - Search Flight Offers"
echo "=================================================="
curl -X POST "http://localhost:8080/api/v1/booking/flight-offers" \
  -H "Content-Type: application/json" \
  -d '{
  "currencyCode": "INR",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "BLR",
      "destinationLocationCode": "DEL",
      "departureDateTimeRange": {
        "date": "2026-04-30",
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
}'

echo -e "\n\n=================================================="
echo "2. POST - Get Offer Price Details"
echo "=================================================="
curl -X POST "http://localhost:8080/api/v1/booking/offer-price" \
  -H "Content-Type: application/json" \
  -d '{
   "flightOffers":[
      {
         "type":"flight-offer",
         "id":"1",
         "source":"GDS",
         "instantTicketingRequired":false,
         "disablePricing":false,
         "nonHomogeneous":false,
         "oneWay":false,
         "paymentCardRequired":false,
         "lastTicketingDate":"2026-03-09",
         "numberOfBookableSeats":9,
         "itineraries":[
            {
               "duration":"PT2H40M",
               "segments":[
                  {
                     "departure":{
                        "iataCode":"BLR",
                        "terminal":"2",
                        "at":"2026-04-30T22:00:00"
                     },
                     "arrival":{
                        "iataCode":"DEL",
                        "terminal":"3",
                        "at":"2026-05-01T00:40:00"
                     },
                     "carrierCode":"AI",
                     "number":"2814",
                     "aircraft":{
                        "code":"32N"
                     },
                     "operating":{
                        "carrierCode":"AI"
                     },
                     "duration":"PT2H40M",
                     "id":"1",
                     "numberOfStops":0,
                     "blacklistedInEU":false
                  }
               ]
            }
         ],
         "price":{
            "currency":"INR",
            "total":"17682.00",
            "base":"14688.00",
            "fees":[
               {
                  "amount":"0.00",
                  "type":"SUPPLIER"
               },
               {
                  "amount":"0.00",
                  "type":"TICKETING"
               }
            ],
            "grandTotal":"17682.00"
         },
         "pricingOptions":{
            "includedCheckedBagsOnly":true,
            "fareType":[
               "PUBLISHED"
            ],
            "refundableFare":false,
            "noRestrictionFare":false,
            "noPenaltyFare":false
         },
         "validatingAirlineCodes":[
            "AI"
         ],
         "travelerPricings":[
            {
               "travelerId":"1",
               "fareOption":"STANDARD",
               "travelerType":"ADULT",
               "price":{
                  "currency":"INR",
                  "total":"8841.00",
                  "base":"7344.00"
               },
               "fareDetailsBySegment":[
                  {
                     "segmentId":"1",
                     "cabin":"ECONOMY",
                     "fareBasis":"UU1YXRII",
                     "brandedFare":"ECOVALU",
                     "class":"U",
                     "isAllotment":false,
                     "includedCheckedBags":{
                        "quantity":0,
                        "weight":15,
                        "weightUnit":"KG"
                     },
                     "amenities":[
                        {
                           "description":"PRE RESERVED SEAT ASSIGNMENT",
                           "isChargeable":false,
                           "amenityType":"PRE_RESERVED_SEAT"
                        },
                        {
                           "description":"ASIAN VEGITARIAN MEAL INDIA",
                           "isChargeable":false,
                           "amenityType":"MEAL"
                        },
                        {
                           "description":"REFUNDABLE TICKET",
                           "isChargeable":true,
                           "amenityType":"BRANDED_FARES"
                        },
                        {
                           "description":"CHANGEABLE TICKET",
                           "isChargeable":true,
                           "amenityType":"BRANDED_FARES"
                        },
                        {
                           "description":"UPGRADE",
                           "isChargeable":true,
                           "amenityType":"UPGRADES"
                        },
                        {
                           "description":"FREE CHECKED BAGGAGE ALLOWANCE",
                           "isChargeable":false,
                           "amenityType":"BRANDED_FARES"
                        }
                     ]
                  }
               ]
            },
            {
               "travelerId":"2",
               "fareOption":"STANDARD",
               "travelerType":"ADULT",
               "price":{
                  "currency":"INR",
                  "total":"8841.00",
                  "base":"7344.00"
               },
               "fareDetailsBySegment":[
                  {
                     "segmentId":"1",
                     "cabin":"ECONOMY",
                     "fareBasis":"UU1YXRII",
                     "brandedFare":"ECOVALU",
                     "class":"U",
                     "isAllotment":false,
                     "includedCheckedBags":{
                        "quantity":0,
                        "weight":15,
                        "weightUnit":"KG"
                     },
                     "amenities":[
                        {
                           "description":"PRE RESERVED SEAT ASSIGNMENT",
                           "isChargeable":false,
                           "amenityType":"PRE_RESERVED_SEAT"
                        },
                        {
                           "description":"ASIAN VEGITARIAN MEAL INDIA",
                           "isChargeable":false,
                           "amenityType":"MEAL"
                        },
                        {
                           "description":"REFUNDABLE TICKET",
                           "isChargeable":true,
                           "amenityType":"BRANDED_FARES"
                        },
                        {
                           "description":"CHANGEABLE TICKET",
                           "isChargeable":true,
                           "amenityType":"BRANDED_FARES"
                        },
                        {
                           "description":"UPGRADE",
                           "isChargeable":true,
                           "amenityType":"UPGRADES"
                        },
                        {
                           "description":"FREE CHECKED BAGGAGE ALLOWANCE",
                           "isChargeable":false,
                           "amenityType":"BRANDED_FARES"
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ],
   "include": "detailed-fare-rules",
   "forceClass":true
}'

echo -e "\n\n=================================================="
echo "3. POST - Create Flight Order/Booking"
echo "=================================================="
curl -X POST "http://localhost:8080/api/v1/booking/orders" \
  -H "Content-Type: application/json" \
  -d '{
  "flightPrice": {
    "type": "flight-offers-pricing",
    "flightOffers": [
      {
        "type": "flight-offer",
        "id": "1",
        "source": "GDS",
        "instantTicketingRequired": false,
        "disablePricing": false,
        "nonHomogeneous": false,
        "oneWay": false,
        "paymentCardRequired": false,
        "lastTicketingDate": "2026-03-09",
        "numberOfBookableSeats": 0,
        "itineraries": [
          {
            "segments": [
              {
                "departure": {
                  "iataCode": "BLR",
                  "terminal": "2",
                  "at": "2026-04-30T22:00:00"
                },
                "arrival": {
                  "iataCode": "DEL",
                  "terminal": "3",
                  "at": "2026-05-01T00:40:00"
                },
                "carrierCode": "AI",
                "number": "2814",
                "aircraft": {
                  "code": "32N"
                },
                "operating": {
                  "carrierCode": "AI"
                },
                "duration": "PT2H40M",
                "id": "1",
                "numberOfStops": 0,
                "blacklistedInEU": false,
                "co2Emissions": [
                  {
                    "weight": 105,
                    "weightUnit": "KG",
                    "cabin": "ECONOMY"
                  }
                ]
              }
            ]
          }
        ],
        "price": {
          "currency": "INR",
          "total": "17682.00",
          "base": "14688.00",
          "fees": [
            {
              "amount": "0.00",
              "type": "SUPPLIER"
            },
            {
              "amount": "0.00",
              "type": "TICKETING"
            },
            {
              "amount": "0.00",
              "type": "FORM_OF_PAYMENT"
            }
          ],
          "grandTotal": "17682.00",
          "billingCurrency": "INR"
        },
        "pricingOptions": {
          "includedCheckedBagsOnly": true,
          "fareType": [
            "PUBLISHED"
          ],
          "refundableFare": false,
          "noRestrictionFare": false,
          "noPenaltyFare": false
        },
        "validatingAirlineCodes": [
          "AI"
        ],
        "travelerPricings": [
          {
            "travelerId": "1",
            "fareOption": "STANDARD",
            "travelerType": "ADULT",
            "price": {
              "currency": "INR",
              "total": "8841",
              "base": "7344",
              "taxes": [
                {
                  "amount": "236.00",
                  "code": "P2"
                },
                {
                  "amount": "715.00",
                  "code": "IN"
                },
                {
                  "amount": "376.00",
                  "code": "K3"
                },
                {
                  "amount": "170.00",
                  "code": "YR"
                }
              ],
              "refundableTaxes": "1864"
            },
            "fareDetailsBySegment": [
              {
                "segmentId": "1",
                "cabin": "ECONOMY",
                "fareBasis": "UU1YXRII",
                "brandedFare": "ECOVALU",
                "class": "U",
                "isAllotment": false,
                "includedCheckedBags": {
                  "quantity": 0,
                  "weight": 15,
                  "weightUnit": "KG"
                }
              }
            ]
          },
          {
            "travelerId": "2",
            "fareOption": "STANDARD",
            "travelerType": "ADULT",
            "price": {
              "currency": "INR",
              "total": "8841",
              "base": "7344",
              "taxes": [
                {
                  "amount": "236.00",
                  "code": "P2"
                },
                {
                  "amount": "715.00",
                  "code": "IN"
                },
                {
                  "amount": "376.00",
                  "code": "K3"
                },
                {
                  "amount": "170.00",
                  "code": "YR"
                }
              ],
              "refundableTaxes": "1864"
            },
            "fareDetailsBySegment": [
              {
                "segmentId": "1",
                "cabin": "ECONOMY",
                "fareBasis": "UU1YXRII",
                "brandedFare": "ECOVALU",
                "class": "U",
                "isAllotment": false,
                "includedCheckedBags": {
                  "quantity": 0,
                  "weight": 15,
                  "weightUnit": "KG"
                }
              }
            ]
          }
        ]
      }
    ],
    "bookingRequirements": {
      "emailAddressRequired": true,
      "mobilePhoneNumberRequired": true
    }
  },
  "travelers": [
    {
      "id": "1",
      "dateOfBirth": "1992-02-06",
      "gender": "MALE",
      "name": {
        "firstName": "pavan",
        "lastName": "kunasani"
      },
      "contact": {
        "emailAddresses": [
          "kunasanipavan@gmail.com"
        ],
        "phones": [
          {
            "deviceType": "MOBILE",
            "countryCallingCode": "91",
            "number": "9550033113"
          }
        ]
      }
    },
    {
      "id": "2",
      "dateOfBirth": "1992-03-02",
      "gender": "MALE",
      "name": {
        "firstName": "hello",
        "lastName": "user"
      }
    }
  ],
  "remarks": "Optional special requests"
}'

echo -e "\n\n=================================================="
echo "4. GET - Retrieve Order by ID"
echo "=================================================="
curl -X GET "http://localhost:8080/api/v1/booking/orders/eJzTd9c39wtyN_ICAArMAkA"

echo -e "\n\n=================================================="
echo "5. GET - Cheapest Dates Inspiration Search"
echo "=================================================="
curl -X GET "http://localhost:8080/api/v1/inspiration/cheapest-dates?origin=BLR&destination=del&departureDate=2026-05-30"

echo -e "\n\n=================================================="
echo "All requests completed!"
echo "=================================================="
