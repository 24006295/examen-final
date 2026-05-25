/**
 * EXAMEN B_24006295 - SISTEMA DE CONTROL DE CALIDAD Y MANUFACTURA DE JABÓN
 * Controladores principales, soporte PWA, validación y Canvas Interactivo
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SISTEMA DE CAMBIO DE TEMA CLARO/OSCURO
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // Comprobar la preferencia almacenada o la preferencia del sistema
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    // ==========================================
    // 2. SÍNTESIS DE VOZ (TEXT-TO-SPEECH)
    // ==========================================
    const btnReadAloud = document.getElementById('btn-read-aloud');
    const policyText = document.getElementById('policy-text').innerText;

    btnReadAloud.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            // Cancelar cualquier lectura previa activa
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(policyText);
            utterance.lang = 'es-ES';
            utterance.pitch = 1.0;
            utterance.rate = 1.0;

            // Cambiar aspecto del botón mientras habla
            btnReadAloud.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon-svg"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>
                Leyendo Compromiso...
            `;
            btnReadAloud.disabled = true;

            utterance.onend = () => {
                resetReadAloudButton();
            };

            utterance.onerror = () => {
                resetReadAloudButton();
            };

            window.speechSynthesis.speak(utterance);
        } else {
            alert("La síntesis de voz no está soportada en este navegador de teléfono.");
        }
    });

    function resetReadAloudButton() {
        btnReadAloud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon-svg"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            Escuchar Compromiso
        `;
        btnReadAloud.disabled = false;
    }


    // ==========================================
    // 3. VALIDACIÓN EN JAVASCRIPT DE FORMULARIO
    // ==========================================
    const qaForm = document.getElementById('qa-report-form');
    const formAlert = document.getElementById('form-alert');

    qaForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        let isFormValid = true;

        // Validar cada campo
        const fields = [
            { id: 'input-operator', errorId: 'error-operator' },
            { id: 'select-line', errorId: 'error-line' },
            { id: 'select-defect', errorId: 'error-defect' },
            { id: 'text-obs', errorId: 'error-obs' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            const parent = element.parentElement;

            if (!element.value.trim()) {
                parent.classList.add('invalid');
                isFormValid = false;
            } else {
                parent.classList.remove('invalid');
            }
        });

        if (isFormValid) {
            // Mostrar mensaje de éxito simulando subida
            formAlert.classList.remove('hidden');
            qaForm.reset();

            // Desaparecer la notificación de éxito en 4 segundos
            setTimeout(() => {
                formAlert.classList.add('hidden');
            }, 4000);
        }
    });

    // Limpiar errores visuales en tiempo real mientras el auditor escribe
    const inputElements = qaForm.querySelectorAll('input, select, textarea');
    inputElements.forEach(element => {
        element.addEventListener('input', () => {
            if (element.value.trim()) {
                element.parentElement.classList.remove('invalid');
            }
        });
        element.addEventListener('change', () => {
            if (element.value) {
                element.parentElement.classList.remove('invalid');
            }
        });
    });


    // ==========================================
    // 4. API DE GEOLOCALIZACIÓN CON SIMULACIÓN
    // ==========================================
    const btnCaptureGeo = document.getElementById('btn-capture-geo');
    const latDisplay = document.getElementById('geo-lat');
    const lngDisplay = document.getElementById('geo-lng');
    const geoStatus = document.getElementById('geo-status');
    const statusText = document.getElementById('status-text');

    btnCaptureGeo.addEventListener('click', () => {
        geoStatus.className = 'geo-status-indicator loading';
        statusText.textContent = 'Buscando coordenadas GPS...';

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Geolocalización real exitosa
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);

                    latDisplay.textContent = lat;
                    lngDisplay.textContent = lng;
                    geoStatus.className = 'geo-status-indicator success';
                    statusText.textContent = 'Ubicación Planta Auditada';
                },
                (error) => {
                    // Fallback / Simulación inteligente de la Planta Galileo / Central si el usuario niega permisos o está en emulación
                    console.warn("Error en la geolocalización o permisos denegados. Activando simulación de planta.");
                    
                    setTimeout(() => {
                        // Coordenadas simuladas de la Universidad Galileo, Guatemala (Planta Central Educativa)
                        const simulatedLat = "14.611100";
                        const simulatedLng = "-90.505800";

                        latDisplay.textContent = simulatedLat;
                        lngDisplay.textContent = simulatedLng;
                        geoStatus.className = 'geo-status-indicator success';
                        statusText.textContent = 'Simulando Planta Galileo (FALBACK)';
                    }, 1000);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            statusText.textContent = 'Geolocalización no soportada por el dispositivo.';
        }
    });


    // ==========================================
    // 5. RADAR DE MANUFACTURA (CANVAS INTERACTIVO)
    // ==========================================
    const canvas = document.getElementById('interactive-radar');
    const ctx = canvas.getContext('2d');
    let animationId;

    // Ajustar el Canvas dinámicamente según su contenedor responsivo
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    // Configuración de los Enlaces del Canvas
    const buttons = [
        {
            text: "Soap-Lab Wix",
            url: "https://24006295.wixsite.com/soap-lab",
            color: "#00f0ff", // Cian brillante
            xPercent: 0.25,
            yPercent: 0.5,
            radius: 40,
            hovered: false,
            angle: 0
        },
        {
            text: "Audit Video",
            url: "https://youtu.be/ESdIr3uhktY?si=gmYbyCGxZ1AYHcwA",
            color: "#ff007f", // Rosa fucsia
            xPercent: 0.5,
            yPercent: 0.5,
            radius: 45,
            hovered: false,
            angle: 120
        },
        {
            text: "U Galileo",
            url: "https://www.galileo.edu/",
            color: "#b026ff", // Morado eléctrico
            xPercent: 0.75,
            yPercent: 0.5,
            radius: 40,
            hovered: false,
            angle: 240
        }
    ];

    // Bucle de animación del radar interactivo
    function draw() {
        // Dimensiones lógicas del canvas
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, w, h);

        // 1. Dibujar fondo tecnológico (Círculos concéntricos de radar de manufactura)
        const centerX = w / 2;
        const centerY = h / 2;

        ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 30; r < w; r += 50) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Líneas cruzadas de radar
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, h);
        ctx.stroke();

        // 2. Dibujar y animar los botones/nodos interactivos
        buttons.forEach(btn => {
            const posX = w * btn.xPercent;
            // Movimiento flotante sutil en el eje Y
            btn.angle += btn.hovered ? 0.05 : 0.02;
            const floatOffset = Math.sin(btn.angle) * 8;
            const posY = (h * btn.yPercent) + floatOffset;

            // Guardar posición actual renderizada para colisión de eventos táctiles y mouse
            btn.currentX = posX;
            btn.currentY = posY;

            // Dibujar brillo exterior en hover (CSS3 3D simulado en Canvas)
            if (btn.hovered) {
                ctx.shadowBlur = 25;
                ctx.shadowColor = btn.color;
                
                // Círculo interactivo hover más grande
                ctx.beginPath();
                ctx.arc(posX, posY, btn.radius + 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.fill();
            } else {
                ctx.shadowBlur = 0;
            }

            // Cuerpo del nodo interactivo
            ctx.beginPath();
            ctx.arc(posX, posY, btn.radius, 0, Math.PI * 2);
            ctx.fillStyle = btn.hovered ? btn.color : 'rgba(21, 30, 46, 0.85)';
            ctx.strokeStyle = btn.color;
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            // Texto interno
            ctx.shadowBlur = 0; // Desactivar sombra para el texto
            ctx.fillStyle = btn.hovered ? '#000000' : '#ffffff';
            ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.text, posX, posY);
        });

        animationId = requestAnimationFrame(draw);
    }

    // Detección de Colisiones / Interacciones
    function checkCollision(x, y) {
        let activeHover = false;
        buttons.forEach(btn => {
            if (btn.currentX && btn.currentY) {
                const dist = Math.hypot(x - btn.currentX, y - btn.currentY);
                if (dist < btn.radius) {
                    btn.hovered = true;
                    activeHover = true;
                } else {
                    btn.hovered = false;
                }
            }
        });
        canvas.style.cursor = activeHover ? 'pointer' : 'default';
    }

    // Eventos de ratón
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        checkCollision(x, y);
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        buttons.forEach(btn => {
            if (btn.currentX && btn.currentY) {
                const dist = Math.hypot(x - btn.currentX, y - btn.currentY);
                if (dist < btn.radius) {
                    // Abrir el enlace interactivo de forma segura
                    window.open(btn.url, '_blank');
                }
            }
        });
    });

    // Eventos táctiles para el teléfono (Touch Events)
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            checkCollision(x, y);
        }
    });

    canvas.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const x = e.changedTouches[0].clientX - rect.left;
            const y = e.changedTouches[0].clientY - rect.top;

            buttons.forEach(btn => {
                if (btn.currentX && btn.currentY) {
                    const dist = Math.hypot(x - btn.currentX, y - btn.currentY);
                    if (dist < btn.radius) {
                        window.open(btn.url, '_blank');
                    }
                }
            });
        }
    });

    // Inicializar Canvas
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();
});

// ==========================================
// 6. REGISTRO DE SERVICE WORKER PARA INSTALACIÓN PWA
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('Service Worker registrado con éxito en el sistema.', reg.scope);
            })
            .catch(err => {
                console.error('Fallo en el registro del Service Worker en el teléfono:', err);
            });
    });
}