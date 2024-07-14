import md5 from 'md5';

let rhymeFetchedMinute = -1;

function getDisclaimer(infoElement) {
    fetch('/getDisclaimer')
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Set infoElement to data.response.message, if it's not null. Then make it visible.
            if (data.response.message) {
                infoElement.innerHTML = data.response.message;
                infoElement.style.display = 'block';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    // Check every 5 minutes
    // setInterval(function () {
    //     getApiKeyHash(infoElement);
    // }, 5 * 60 * 1000);
}


function setDate(secondHand, minHand, hourHand) {
    // Set the divs that are styled to be clock hands
    const currentTime = new Date();
    const seconds = currentTime.getSeconds();
    const secondDeg = (seconds / 60) * 360 + 90;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
    // Add 90 to account for the offset in the CSS
    // 360 degrees in a circle
    // 60 seconds in a minute
    const mins = currentTime.getMinutes();
    const minsDeg = (mins / 60) * 360 + 90;
    minHand.style.transform = `rotate(${minsDeg}deg)`;

    const hours = currentTime.getHours();
    const hoursDeg = (hours / 12) * 360 + 90;
    hourHand.style.transform = `rotate(${hoursDeg}deg)`;
    // When the minute changes, reset the positions of the other hands instead of keeping the prior position before seamlessly transitioning
    if (seconds == 0) {
        secondHand.style.transitionDuration = '0s';
        minHand.style.transitionDuration = '0s';
        hourHand.style.transitionDuration = '0s';
    } else {
        secondHand.style.transitionDuration = '0.05s';
        minHand.style.transitionDuration = '0.05s';
        hourHand.style.transitionDuration = '0.05s';
    }

    if (rhymeFetchedMinute != mins) {
        const rhyme = document.getElementById("rhyme");
        fetch('/getRhyme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ datetime: currentTime.toISOString() }),
            body: JSON.stringify({ datetime: currentTime}),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                rhyme.innerHTML = data.response.rhyme;
                document.title = data.response.rhyme;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        rhymeFetchedMinute = mins;
    }
    // Basically the same as setInterval but matches the refresh rate
    requestAnimationFrame(function () {
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
    // Get the info element
    const infoElement = document.getElementById("api-disclaimer");
    getDisclaimer(infoElement);
});