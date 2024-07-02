
// function setDate(secondHand: HTMLElement, minHand: HTMLElement, hourHand: HTMLElement): void {
function setDate(secondHand, minHand, hourHand) {
    // Set the divs that are styled to be clock hands
    const currentTime = new Date();
    const seconds = currentTime.getSeconds();
    // Add 90 to account for the offset in the CSS
    // 360 degrees in a circle
    // 60 seconds in a minute
    const secondsDegrees = ((seconds / 60) * 360) + 90;
    // ${} is like an f-string in Python, but without the need for the f prefix
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

    // Basically the same as setInterval but matches the refresh rate
    requestAnimationFrame(function(){
        setDate(secondHand, minHand, hourHand);
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get the clock hands
    const secondHand = document.querySelector(".second-hand");
    const minHand = document.querySelector(".min-hand");
    const hourHand = document.querySelector(".hour-hand");
    // Actually call the function
    setDate(secondHand, minHand, hourHand);
});
