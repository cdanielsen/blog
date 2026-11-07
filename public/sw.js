// Kill switch for the service worker registered by the old Gatsby site
// (gatsby-plugin-offline). Browsers that still have it installed fetch this
// file on their next visit, which wipes its caches and unregisters it so they
// stop serving the stale Gatsby build. Keep this around for a while.
self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: "window" })
      clients.forEach((client) => client.navigate(client.url))
    })()
  )
})
