# mta_script

POC to retrieve MTA train times for select subway stops near downtown Brooklyn. Does not require an API key.

Uses [train stops](https://github.com/redSlug/weather-reporter/blob/master/server/client/train_data/stops.txt) to determine train stops.

## run
```
npm i
node fetch_mta.js
```

## example output
```
trip: TripDescriptor {
  tripId: '082950_Q..S36R',
  startTime: '13:49:30',
  startDate: '20250428',
  routeId: 'Q'
}
relevant stops: [
  {
    "stopId": "R30S",
    "arrival": {
      "epoch": 1745864127,
      "est": "4/28/2025, 2:15:27 PM"
    },
    "departure": {
      "epoch": 1745864127,
      "est": "4/28/2025, 2:15:27 PM"
    }
  }
]
```
