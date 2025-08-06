// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered:', registration);
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}

// Clear localStorage and sessionStorage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('Storage cleared');
} catch (e) {
  console.log('Could not clear storage:', e);
}

// Don't auto-reload, just log completion
console.log('Cleanup complete - ready for fresh start');

console.log('Service worker, caches, and storage cleared');