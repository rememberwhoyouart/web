const hashtagText = document.getElementById('hashtag-text');
let time = 0;

function updateGradient() {
    time += 0.01; // Adjust speed of animation

    // Simulate the shader's color calculation
    // 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4))
    // We'll simplify this for a linear gradient by varying HSL components over time.
    // This will create three color stops that shift their hues.
    
    const r = 0.5 + 0.5 * Math.cos(time + 0); // Offset 0
    const g = 0.5 + 0.5 * Math.cos(time + 2); // Offset 2
    const b = 0.5 + 0.5 * Math.cos(time + 4); // Offset 4

    const color1_r = Math.floor((0.5 + 0.5 * Math.cos(time + 0.0 + 0)) * 255);
    const color1_g = Math.floor((0.5 + 0.5 * Math.cos(time + 0.0 + 2)) * 255);
    const color1_b = Math.floor((0.5 + 0.5 * Math.cos(time + 0.0 + 4)) * 255);

    const color2_r = Math.floor((0.5 + 0.5 * Math.cos(time + 1.0 + 0)) * 255); // Slightly different x for second color
    const color2_g = Math.floor((0.5 + 0.5 * Math.cos(time + 1.0 + 2)) * 255);
    const color2_b = Math.floor((0.5 + 0.5 * Math.cos(time + 1.0 + 4)) * 255);
    
    const color3_r = Math.floor((0.5 + 0.5 * Math.cos(time + 2.0 + 0)) * 255); // Even more different x for third color
    const color3_g = Math.floor((0.5 + 0.5 * Math.cos(time + 2.0 + 2)) * 255);
    const color3_b = Math.floor((0.5 + 0.5 * Math.cos(time + 2.0 + 4)) * 255);

    hashtagText.style.setProperty('--color1', `rgb(${color1_r}, ${color1_g}, ${color1_b})`);
    hashtagText.style.setProperty('--color2', `rgb(${color2_r}, ${color2_g}, ${color2_b})`);
    hashtagText.style.setProperty('--color3', `rgb(${color3_r}, ${color3_g}, ${color3_b})`);

    requestAnimationFrame(updateGradient);
}

requestAnimationFrame(updateGradient);
