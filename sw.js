/**
 * SERVICE WORKER BÁSICO DE EXAMEN B_24006295
 * Garantiza la instalación de la aplicación web en teléfonos móviles
 * y la carga instantánea de recursos estáticos clave.
 */

const CACHE_NAME = 'soaplab-qa-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
];

// Evento de instalación: Almacenar en caché los recursos estáticos iniciales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Abriendo caché de instalación de Soap-Lab...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Evento de activación: Limpieza de cachés antiguas obsoletas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Limpiando caché obsoleta:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de red: Cache First con recuperación de red de respaldo para PWA rápidas
self.addEventListener('fetch', (event) => {
    // Evitar interceptar llamadas a APIs de geolocalización o de análisis de red externas
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        // Guardar recursos dinámicos solicitados para acceso fuera de línea posterior
                        if (networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    });
                }).catch(() => {
                    // Si falla la red y no hay caché, retornar una respuesta limpia por defecto
                    return new Response("Sin conexión a Internet.");
                })
        );
    }
});