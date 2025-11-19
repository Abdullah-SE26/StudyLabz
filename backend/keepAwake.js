let lastTraffic = Date.now();

// Call this on every real request
export function trafficHit() {
  lastTraffic = Date.now();
}

// Smart ping function
export function startKeepAwake() {
  const url = process.env.FRONTEND_URL || 'https://studylabz.onrender.com/ping';

  setInterval(() => {
    const idleTime = Date.now() - lastTraffic;

    // Only ping if idle for more than 5 minutes
    if (idleTime > 5 * 60 * 1000) {
      fetch(url)
        .then(res => console.log(`[Ping] Status: ${res.status}`))
        .catch(err => console.error('[Ping] Error:', err));
    }
  }, 5 * 60 * 1000); // check every 5 minutes
}
