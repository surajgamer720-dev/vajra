# Web Push setup

This free setup uses the Web Push protocol and the web-push package. You only
need a place to host the small Node server.

1. In push-server, copy .env.example to .env.
2. Run npm install.
3. Run npm run generate:vapid and copy both generated values into .env.
4. Set VAPID_SUBJECT to a real contact such as mailto:you@example.com.
5. Set ALLOWED_ORIGINS to the deployed PWA origin and run npm run start.

Never expose VAPID_PRIVATE_KEY in the frontend or commit .env.

Set VITE_PUSH_API_URL=https://your-push-server.example.com for the frontend
build. Call enablePushNotifications() from a user-initiated button; it asks
permission, creates a PushManager subscription, and saves it to the API.

To test after enabling push on one device, run:

curl -X POST https://your-push-server.example.com/api/push/send -H "content-type: application/json" -d "{\"title\":\"Vajra\",\"body\":\"Push is working!\",\"url\":\"/\"}"

The push event listener is in src/frontend/public/sw.js. If your build system
generates and replaces sw.js, move that listener into the source for the active
generated service worker.

For a test, POST JSON with title, body, and url to /api/push/send. Before
production, protect that endpoint with administrator authentication and replace
subscriptions.json with a real database. The server removes expired 404/410
subscriptions automatically.
