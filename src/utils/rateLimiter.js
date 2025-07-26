class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // Check if we can make a new request
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  async waitForSlot() {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const now = Date.now();
    return Math.max(0, this.timeWindow - (now - oldestRequest));
  }
}

// Create global rate limiters for different API endpoints
export const apiRateLimiters = {
  users: new RateLimiter(5, 2000), // 5 requests per 2 seconds
  profiles: new RateLimiter(5, 2000), // 5 requests per 2 seconds
  opportunities: new RateLimiter(5, 2000), // 5 requests per 2 seconds
  applications: new RateLimiter(3, 3000), // 3 requests per 3 seconds
  notifications: new RateLimiter(2, 5000), // 2 requests per 5 seconds
  stats: new RateLimiter(2, 10000), // 2 requests per 10 seconds
};

export default RateLimiter; 