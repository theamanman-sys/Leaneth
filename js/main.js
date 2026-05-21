/* MAIN APPLICATION BOOTSTRAPPER - LEANETH VENTURES */

import { initRouter, setSoundEnabled, playClickSound } from './router.js';
import { initParallax } from './parallax.js';
import { initYouTube } from './youtube-api.js';
import { initMovies } from './tmdb-api.js';
import { initWeb3 } from './crypto-api.js';
import { initSandbox } from './sandbox.js';
import { initCosmos } from './cosmos-api.js';
import { initWeather } from './weather-api.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize custom page router and transition engine
    initRouter();

    // 2. Initialize 3D parallax scroll and mouse tilt engines
    initParallax();

    // 3. Boot API showcases
    initYouTube();
    initMovies();
    initWeb3();
    initSandbox();
    initCosmos();
    initWeather();

    // 4. Setup sound toggle control logic
    setupSoundControl();

    // 5. Setup live edge-node latency updates (Pulse)
    setupAPILatencyPulse();

    // 6. Setup premium magnetic hover button physics
    setupMagneticButtons();

    // 7. Setup runtime offscreen Canvas transparentizer for 3D shapes
    setupImageTransparency();
});

function setupSoundControl() {
    const btnSound = document.getElementById('btn-sound');
    const iconOn = document.querySelector('.sound-icon-on');
    const iconOff = document.querySelector('.sound-icon-off');
    
    if (!btnSound) return;

    let soundState = localStorage.getItem('leaneth_sfx') !== 'false';
    setSoundEnabled(soundState);
    updateSoundIcons(soundState, iconOn, iconOff);

    btnSound.addEventListener('click', () => {
        soundState = !soundState;
        localStorage.setItem('leaneth_sfx', soundState);
        setSoundEnabled(soundState);
        updateSoundIcons(soundState, iconOn, iconOff);
        
        if (soundState) {
            playClickSound();
        }
    });
}

function updateSoundIcons(isOn, iconOn, iconOff) {
    if (isOn) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
    } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
    }
}

function setupAPILatencyPulse() {
    const pingMs = document.getElementById('ping-ms');
    if (!pingMs) return;

    // Simulate real-time Edge network analytics updates
    setInterval(() => {
        const bounce = Math.floor(Math.random() * 6) + 11; // ranges from 11ms to 17ms
        pingMs.textContent = `${bounce}ms`;
        
        // Add momentary highlight pulse
        pingMs.style.transition = 'color 0.2s ease';
        pingMs.style.color = 'var(--accent-cyan)';
        setTimeout(() => {
            pingMs.style.color = '';
        }, 300);
    }, 4000);
}

function setupMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-magnetic, .btn, .genre-pill, .wallet-option');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Shift element toward cursor position slightly
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            
            // Set variables for radial gradient glow overlays
            btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
            btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
        });

        btn.addEventListener('mouseleave', () => {
            // Restore original position smoothly
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

function setupImageTransparency() {
    const shapes = document.querySelectorAll('.shape-3d');
    
    shapes.forEach(imgElement => {
        // Build offscreen processor to prevent flash cycles
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgElement.src;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            
            // Iterate and convert black pixels to transparent alpha channels
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                // Fast brightness average
                const brightness = (r + g + b) / 3;
                
                if (brightness < 12) {
                    data[i+3] = 0; // Complete alpha cutout
                } else if (brightness < 45) {
                    // Linear interpolation blend to prevent sharp borders
                    data[i+3] = ((brightness - 12) / 33) * 255;
                }
            }
            
            ctx.putImageData(imgData, 0, 0);
            
            // Swap src for transparent canvas URL
            imgElement.src = canvas.toDataURL("image/png");
            
            // Animate fade in smoothly once transparentized!
            imgElement.style.transition = 'opacity 0.8s ease';
            imgElement.style.opacity = '1';
        };
    });
}
