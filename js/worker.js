console.log('Service Worker loaded');

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received');
    self.registration.showNotification(data.title, {
        body: 'Notified by Travesty media',
        icon: 'http://image.ibb.co/frYOFD/tmlogo.png',
    });
});