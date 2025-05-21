document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const blackOverlay = document.getElementById('black-overlay');
    const themeColorMeta = document.getElementById('theme-color-meta');
    const hashtagText = document.getElementById('hashtag-text'); // For initial fade-in
    const controlPanel = document.getElementById('control-panel'); // Get reference to control panel

    const animationDuration = 7000; // Total duration for background animation in ms
    const fadeToBlackDuration = 2000; // How long the fade to pure black (via overlay) takes at the end
    let startTime = null;

    function animateBackground(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        // Animate HSL: Hue from 0 to 360 (full spectrum), Saturation 100%, Lightness from 100% (white) to 0% (black)
        const hue = (progress * 360) % 360; // Cycle through hues
        let lightness;
        if (progress < 0.5) { // First half: White to Full Color
            lightness = 1 - (progress * 2 * 0.5); // L goes from 1 to 0.5
        } else { // Second half: Full Color to Black
            lightness = 0.5 - ((progress - 0.5) * 2 * 0.5); // L goes from 0.5 to 0
        }
        lightness = Math.max(0, Math.min(1, lightness)); // Clamp lightness

        const saturation = 1; // Keep saturation high for vivid colors

        if (progress < 1) { // Only update body background color if not fully black
            body.style.backgroundColor = `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`;
        }

        // Update theme color dynamically
        if (progress > 0.1 && progress < 0.9 && themeColorMeta.content !== '#808080') { 
             themeColorMeta.setAttribute('content', '#808080'); // Example: gray, or pick a vibrant color
        }


        // Start fading in black overlay towards the end
        const overlayStartTime = animationDuration - fadeToBlackDuration;
        if (elapsedTime > overlayStartTime) {
            const overlayProgress = Math.min((elapsedTime - overlayStartTime) / fadeToBlackDuration, 1);
            blackOverlay.style.opacity = overlayProgress;
            if (overlayProgress === 1) {
                body.style.backgroundColor = '#000000'; // Ensure final body is black under overlay
            }
        }

        if (progress < 1) {
            requestAnimationFrame(animateBackground);
        } else {
            // Animation complete
            body.style.backgroundColor = '#000000'; // Final background color
            blackOverlay.style.opacity = 1; // Ensure overlay is fully opaque
            themeColorMeta.setAttribute('content', '#000000'); // Final theme color
            
            // Call the updated hashtag transition function
            initHashtagVisualTransition(); 
        }
    }
    
    // Start the background animation
    requestAnimationFrame(animateBackground);

    // Control panel toggle logic
    document.addEventListener('keydown', (event) => {
        if (event.key === '\\') { // Check for backslash key
            if (controlPanel) {
                controlPanel.classList.toggle('visible');
            }
        }
    });

}); // End of DOMContentLoaded


// Renamed for clarity and updated logic
function initHashtagVisualTransition() {
    const hashtagElement = document.getElementById('hashtag-text');
    
    // 1. Start fade-in (opacity is initially 0, CSS handles transition which is 1.5s)
    hashtagElement.style.opacity = 1;

    // 2. After a delay, apply the masked effect
    setTimeout(() => {
        hashtagElement.classList.add('hashtag-masked');
        // The .hashtag-masked class applies:
        // - font-weight: 600
        // - background-image: linear-gradient(...)
        // - -webkit-background-clip: text
        // - background-clip: text
        // - color: transparent
        // - -webkit-text-fill-color: transparent
        
        // Ensure the gradient color update loop is running to animate the --color1, --color2, --color3 CSS variables.
        ensureGradientUpdateLoopIsRunning(); 
    }, 1500); // Delay set to 1500ms to match the opacity transition duration (1.5s).
               // This timing allows the text to become fully visible as white text first, 
               // then transition to the masked gradient effect.
}

// Gradient color update logic (from previous step, unchanged)
let gradientAnimationTime = 0;
let gradientAnimationReqId = null; // Stores the requestAnimationFrame ID

function updateGradientColors() {
    gradientAnimationTime += 0.01; // Adjust speed of animation

    // Calculate RGB values for three colors based on time
    const r1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 0)) * 255);
    const g1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 2)) * 255);
    const b1 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 0.0 + 4)) * 255);

    const r2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 0)) * 255); // Slightly different x for second color
    const g2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 2)) * 255);
    const b2 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 1.0 + 4)) * 255);
   
    const r3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 0)) * 255); // Even more different x for third color
    const g3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 2)) * 255);
    const b3 = Math.floor((0.5 + 0.5 * Math.cos(gradientAnimationTime + 2.0 + 4)) * 255);

    const hashtagElement = document.getElementById('hashtag-text');
    if (hashtagElement) { // Check if element exists
        // Update CSS custom properties used by the .hashtag-masked class's gradient
        hashtagElement.style.setProperty('--color1', `rgb(${r1},${g1},${b1})`);
        hashtagElement.style.setProperty('--color2', `rgb(${r2},${g2},${b2})`);
        hashtagElement.style.setProperty('--color3', `rgb(${r3},${g3},${b3})`);
    }
    
    gradientAnimationReqId = requestAnimationFrame(updateGradientColors);
}

function ensureGradientUpdateLoopIsRunning() {
    if (!gradientAnimationReqId) { // Check if it's already running
        updateGradientColors();
    }
}

function stopGradientUpdateLoop() { // For later use if needed (e.g. when panel is open)
    if (gradientAnimationReqId) {
        cancelAnimationFrame(gradientAnimationReqId);
        gradientAnimationReqId = null;
    }
}
