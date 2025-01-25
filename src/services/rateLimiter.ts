export class RateLimiter {
  private remainingRequests: number;
  private resetTime: number;
  private waitingQueue: Array<() => void> = [];

  constructor() {
    this.remainingRequests = 20; // Default initial value
    this.resetTime = Date.now() + 1000; // 1 second window
  }

  updateLimits(headers: any) {
    if (headers['x-ratelimit-remaining']) {
      this.remainingRequests = parseInt(headers['x-ratelimit-remaining']);
    }
    if (headers['x-ratelimit-reset']) {
      this.resetTime = Date.now() + (parseInt(headers['x-ratelimit-reset']) * 1000);
    }
  }

  async waitForAvailableRequest(): Promise<void> {
    if (this.remainingRequests > 0) {
      this.remainingRequests--;
      return Promise.resolve();
    }

    const now = Date.now();
    if (now >= this.resetTime) {
      this.remainingRequests = 19; // Reset minus this request
      this.resetTime = now + 1000;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
      setTimeout(() => {
        const index = this.waitingQueue.indexOf(resolve);
        if (index > -1) {
          this.waitingQueue.splice(index, 1);
        }
        this.remainingRequests = 19;
        this.resetTime = Date.now() + 1000;
        resolve();
      }, this.resetTime - now);
    });
  }
}