const fetch = require('node-fetch');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

// const STATIONS_OF_INTEREST = [
//   'L16N', 'L16S',
//   'R30N', 'R30S',
//   'A42N', 'A42S'
// ];

const STATIONS_OF_INTEREST = [
    'R30S'
  ];

const MTA_FEEDS = [
  'nyct%2Fgtfs-nqrw',
  'nyct%2Fgtfs-l',
  'nyct%2Fgtfs-ace'
];

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', { timeZone: 'America/New_York' });
}

function isWithinNext30Minutes(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyMinutesFromNow = now + (30 * 60);
  return timestamp >= now && timestamp <= thirtyMinutesFromNow;
}

async function fetchMtaFeed(feedId) {
  try {
    const response = await fetch(`https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/${feedId}`);
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    return feed;
  } catch (error) {
    console.log('error fetching feed', feedId, ':', error);
    return null;
  }
}

async function fetchMtaData() {
  try {
    const feedPromises = MTA_FEEDS.map(feedId => fetchMtaFeed(feedId));
    const feeds = await Promise.all(feedPromises);
    
    feeds.forEach(feed => {
      if (!feed) return;
      
      feed.entity.forEach(entity => {
        if (entity.tripUpdate && entity.tripUpdate.stopTimeUpdate) {
          const relevantStops = entity.tripUpdate.stopTimeUpdate.filter(update => {
            if (!STATIONS_OF_INTEREST.includes(update.stopId)) return false;
            
            const arrivalTime = update.arrival?.time?.low || update.arrival?.time;
            const departureTime = update.departure?.time?.low || update.departure?.time;
            
            return isWithinNext30Minutes(arrivalTime) || isWithinNext30Minutes(departureTime);
          });
          
          if (relevantStops.length > 0) {
            console.log('trip:', entity.tripUpdate.trip);
            const formattedStops = relevantStops.map(stop => ({
              stopId: stop.stopId,
              arrival: {
                epoch: stop.arrival?.time?.low || stop.arrival?.time,
                est: formatTime(stop.arrival?.time?.low || stop.arrival?.time)
              },
              departure: {
                epoch: stop.departure?.time?.low || stop.departure?.time,
                est: formatTime(stop.departure?.time?.low || stop.departure?.time)
              }
            }));
            console.log('relevant stops:', JSON.stringify(formattedStops, null, 2));
            console.log('---');
          }
        }
      });
    });
  } catch (error) {
    console.log('error fetching data:', error);
  }
}

fetchMtaData(); 