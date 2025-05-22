console.log("DEBUG: script.js execution started.");

// FPS Tracking Variables
let lastFrameTime = performance.now();
const fpsHistory = [];
const fpsHistoryCapacity = 150; // Match canvas width for 1px per entry

// Gradient Animation Variables
let gradientAnimationTime = 0;
let gradientAnimationReqId = null; 
let animationSpeedFactor = 1.0; // Default speed, will be updated from slider

// Variable to store the start time of the background animation
let backgroundAnimationStartTime = null; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded event fired.");
    
    const body = document.body;
    const blackOverlay = document.getElementById('black-overlay');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const hashtagText = document.getElementById('hashtag-text'); 
    const controlPanel = document.getElementById('control-panel');
    const speedControl = document.getElementById('speed-control'); 

    // Existing diagnostic line:
    if (hashtagText) {
        console.log("DEBUG: Initial hashtagText.textContent:", hashtagText.textContent);
        console.log("DEBUG: Initial hashtagText.innerHTML:", hashtagText.innerHTML);
    } else {
        console.log("DEBUG: hashtagText element not found.");
    }

    // Initialize speed control if the element exists
    if (speedControl) {
        animationSpeedFactor = parseFloat(speedControl.value) / 100.0;
        speedControl.addEventListener('input', () => {
            animationSpeedFactor = parseFloat(speedControl.value) / 100.0;
            console.log("DEBUG: Animation speed factor set to:", animationSpeedFactor); 
        });
    }

    // animateBackground function with new timing and easing logic
    function animateBackground(timestamp) {
        if (!backgroundAnimationStartTime) {
            backgroundAnimationStartTime = timestamp;
            console.log("DEBUG: animateBackground started at timestamp:", timestamp);
        }

        const localAnimationDuration = 3000;
        const localFadeToBlackDuration = 1500;
        
        const elapsedTime = timestamp - backgroundAnimationStartTime;
        
        let easedProgress;
        // Calculate easedProgress based on two halves of the animation
        if (elapsedTime < localAnimationDuration / 2) { // First half (0 to 1.5s)
            let halfProgress = elapsedTime / (localAnimationDuration / 2); // Linear progress for first half (0 to 1)
            easedProgress = 0.5 * (halfProgress * halfProgress); // Quadratic ease-in, results in 0 to 0.5
        } else { // Second half (1.5s to 3s)
            let halfProgress = (elapsedTime - localAnimationDuration / 2) / (localAnimationDuration / 2); // Linear progress for second half (0 to 1)
            easedProgress = 0.5 + 0.5 * (1 - (1 - halfProgress) * (1 - halfProgress)); // Quadratic ease-out, results in 0.5 to 1
        }
        easedProgress = Math.min(Math.max(easedProgress, 0), 1); // Clamp easedProgress between 0 and 1

        // console.log(`DEBUG: ElapsedTime: ${elapsedTime.toFixed(2)}, EasedProgress: ${easedProgress.toFixed(3)}`);

        const hue = (easedProgress * 360) % 360; 
        
        let finalLightness;
        if (easedProgress < 0.5) { // First half of visual effect (white to color)
            // As easedProgress goes from 0 to 0.5, finalLightness goes from 1 (white) to 0.5 (full color)
            finalLightness = 1 - (easedProgress / 0.5) * 0.5; 
        } else { // Second half of visual effect (color to black)
            // As easedProgress goes from 0.5 to 1, finalLightness goes from 0.5 (full color) to 0 (black)
            finalLightness = 0.5 - ((easedProgress - 0.5) / 0.5) * 0.5; 
        }
        finalLightness = Math.max(0, Math.min(1, finalLightness)); // Clamp lightness

        const saturation = 1; // Keep saturation high for vivid colors

        if (easedProgress < 1) {
            const newBgColor = `hsl(${hue}, ${saturation * 100}%, ${finalLightness * 100}%)`;
            body.style.backgroundColor = newBgColor;
            if (themeColorMeta) { // Check if meta tag exists
                themeColorMeta.setAttribute('content', newBgColor);
            }
        }

        // Fade in black overlay
        if (elapsedTime >= localAnimationDuration / 2) { // Start fade when elapsed time is >= 1.5s (second half)
            // Progress of the overlay fade, from 0 to 1, over localFadeToBlackDuration (1.5s)
            const overlayProgress = Math.min((elapsedTime - (localAnimationDuration / 2)) / localFadeToBlackDuration, 1);
            blackOverlay.style.opacity = overlayProgress;
            if (overlayProgress === 1) {
                // Ensure final body is black and theme color is black if overlay fully covers
                const finalBgColor = '#000000';
                body.style.backgroundColor = finalBgColor;
                if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', finalBgColor);
                }
            }
        } else {
            blackOverlay.style.opacity = 0; // Ensure overlay is not visible in first half
        }

        if (elapsedTime < localAnimationDuration) {
            requestAnimationFrame(animateBackground);
        } else {
            // Animation complete
            console.log("DEBUG: animateBackground complete. Final body.style.backgroundColor:", body.style.backgroundColor);
            const finalBgColor = '#000000';
            body.style.backgroundColor = finalBgColor; 
            blackOverlay.style.opacity = 1; 
            if (themeColorMeta) {
                themeColorMeta.setAttribute('content', finalBgColor);
            }
            
            console.log("DEBUG: Calling initHashtagVisualTransition...");
            if (typeof initHashtagVisualTransition === 'function') {
                initHashtagVisualTransition(); 
            }
        }
    }
    
    // Start the background animation
    requestAnimationFrame(animateBackground);

    // Control panel toggle logic
    document.addEventListener('keydown', (event) => {
        if (event.key === '\\') { 
            if (controlPanel) {
                controlPanel.classList.toggle('visible');
            }
        }
    });

    // Control panel dragging logic & Parallax Hover Effects
    if (controlPanel) { 
        let isDragging = false;
        let offsetX, offsetY; 

        controlPanel.addEventListener('mousedown', (e) => {
            isDragging = true;
            controlPanel.classList.add('dragging'); 
            document.body.classList.add('dragging'); 

            const panelStyle = window.getComputedStyle(controlPanel);
            const panelLeft = parseFloat(panelStyle.left);
            const panelTop = parseFloat(panelStyle.top);

            offsetX = e.clientX - panelLeft;
            offsetY = e.clientY - panelTop;
            
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) { 
                let newX = e.clientX - offsetX;
                let newY = e.clientY - offsetY;

                controlPanel.style.left = `${newX}px`;
                controlPanel.style.top = `${newY}px`;
                controlPanel.style.transform = 'translate(-50%, -50%)'; 
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                controlPanel.classList.remove('dragging');
                document.body.classList.remove('dragging');
            }
        });

        const maxRotate = 10; 
        const perspective = 500; 

        controlPanel.addEventListener('mousemove', (e) => {
            if (controlPanel.classList.contains('dragging')) {
                controlPanel.style.transform = 'translate(-50%, -50%) perspective(0px) rotateX(0deg) rotateY(0deg)';
                return; 
            }

            const rect = controlPanel.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  

            const panelWidth = rect.width;
            const panelHeight = rect.height;

            const rotateY = ((x / panelWidth) - 0.5) * 2 * maxRotate; 
            const rotateX = (0.5 - (y / panelHeight)) * 2 * maxRotate; 

            controlPanel.style.transform = `translate(-50%, -50%) perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            const shadowOffsetX = -rotateY * 0.8; 
            const shadowOffsetY = rotateX * 0.8;
            const shadowBlur = 32 + Math.abs(rotateX) * 0.5 + Math.abs(rotateY) * 0.5; 
            
            controlPanel.style.boxShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(0, 0, 0, 0.45)`;
        });

        controlPanel.addEventListener('mouseleave', () => {
            if (!controlPanel.classList.contains('dragging')) {
                 controlPanel.style.transform = 'translate(-50%, -50%) perspective(0px) rotateX(0deg) rotateY(0deg)'; 
                 controlPanel.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)'; 
            }
        });
    }

}); // End of DOMContentLoaded


function initHashtagVisualTransition() {
    console.log("DEBUG: initHashtagVisualTransition started.");
    const hashtagElement = document.getElementById('hashtag-text');
    
    console.log("DEBUG: initHashtagVisualTransition: Hashtag should be visible by CSS (opacity:1).");

    ensureGradientUpdateLoopIsRunning(); 
    console.log("DEBUG: initHashtagVisualTransition: Gradient color update loop ensured to be running.");
}

// Function to draw the FPS graph
function drawFpsGraph(ctx, canvasWidth, canvasHeight, history) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (history.length === 0) return;

    // Styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    
    const maxFpsDisplay = Math.max(60, ...history, 120); 

    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
        const x_coord = (i / (fpsHistoryCapacity - 1)) * canvasWidth;
        const y = canvasHeight - (Math.min(history[i], maxFpsDisplay) / maxFpsDisplay) * canvasHeight;
        if (i === 0) {
            ctx.moveTo(x_coord, y);
        } else {
            ctx.lineTo(x_coord, y);
        }
    }
    ctx.stroke();

    const y60 = canvasHeight - (60 / maxFpsDisplay) * canvasHeight;
    if (y60 > 0 && y60 < canvasHeight) { 
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.moveTo(0, y60);
        ctx.lineTo(canvasWidth, y60);
        ctx.stroke();
        ctx.setLineDash([]); 
    }
}

function updateGradientColors() {
    // FPS Calculation
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    lastFrameTime = now;
    const currentFPS = Math.round(1000 / deltaTime);

    const fpsValueElement = document.getElementById('fps-value');
    if (fpsValueElement) fpsValueElement.textContent = currentFPS;

    fpsHistory.push(currentFPS);
    if (fpsHistory.length > fpsHistoryCapacity) {
        fpsHistory.shift();
    }

    const canvas = document.getElementById('fps-graph');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (ctx) { 
        drawFpsGraph(ctx, canvas.width, canvas.height, fpsHistory);
    }

    // Modified time increment for gradient animation speed
    gradientAnimationTime += 0.01 * animationSpeedFactor; 

    // Calculate RGB values for three colors based on time
    const r1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 0)) * 255);
    const g1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 2)) * 255);
    const b1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 4)) * 255);

    const r2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 0)) * 255); 
    const g2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 2)) * 255);
    const b2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 4)) * 255);
   
    const r3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 0)) * 255); 
    const g3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 2)) * 255);
    const b3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 4)) * 255);

    const hashtagElement = document.getElementById('hashtag-text');
    if (hashtagElement) { 
        hashtagElement.style.setProperty('--color1', `rgb(${r1},${g1},${b1})`);
        hashtagElement.style.setProperty('--color2', `rgb(${r2},${g2},${b2})`);
        hashtagElement.style.setProperty('--color3', `rgb(${r3},${g3},${b3})`);
    }
    
    gradientAnimationReqId = requestAnimationFrame(updateGradientColors);
}

function ensureGradientUpdateLoopIsRunning() {
    if (!gradientAnimationReqId) { 
        updateGradientColors();
    }
}

function stopGradientUpdateLoop() { 
    if (gradientAnimationReqId) {
        cancelAnimationFrame(gradientAnimationReqId);
        gradientAnimationReqId = null;
    }
}
