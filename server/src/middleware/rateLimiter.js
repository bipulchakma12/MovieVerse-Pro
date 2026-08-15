/**
 * Simple in-memory rate limiter to prevent API abuse, DDoS, and brute-force attacks
 */
const rateLimitMap = new Map();

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 200) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitMap.get(ip);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
      });
    }

    next();
  };
};
