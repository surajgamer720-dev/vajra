const webpush = require("web-push");

// Run once: npm run generate:vapid
// Keep the private key only on the server.
console.log(webpush.generateVAPIDKeys());
