console.log('soundcloud.js');

let details = {
    source: 'soundcloud',
    artist: '',
    album: '',
    track: '',
    trackNumber: '',
    url: window.location.href,
    image: '',
    elapsed: '0:00',
    total: '0:00',
    isPlaying: false,
}

let tracklist = [];

let detailsLast = {
    isPlaying: false,
    elapsed: '0:00',
}

const queueWatchNode = 'stream__list';
const queueButtonTarget = 'soundList__item';
const controlsWatch = 'playControls__elements';

function fetchSongInfo() {
    const playback = document.getElementsByClassName('playbackSoundBadge');
    if (playback) {
        // console.log('playback', playback);

        details.isPlaying = getPlayingStatus();

        const domAvatar = playback[0].getElementsByClassName('playbackSoundBadge__avatar');
        if (domAvatar && domAvatar.length > 0) {
            details.url = domAvatar[0].href;

            const domImage = domAvatar[0].getElementsByClassName('sc-artwork');
            if (domImage && domImage.length > 0) {
                const domSpan = domImage[0].getElementsByTagName('span')[0];
                if (domSpan) {
                    // console.log(domSpan);
                    // console.log('style', domSpan.style.backgroundImage);

                    let str = 'url("';
                    let index = domSpan.style.backgroundImage.indexOf(str);
                    let slice = domSpan.style.backgroundImage.slice(str.length, -2);

                    slice = slice.replace('-t50x50', '-t200x200');
                    // console.log('slice', slice);
                    details.image = slice;
                }
                // "url("https://i1.sndcdn.com/artworks-kJ5eRQTXBmSrr7F0-xJGvyw-t120x120.jpg"


                // console.log(domImage[0]);
                // image = domImage[0];
            }
        }

        const domArtist = playback[0].getElementsByClassName('playbackSoundBadge__lightLink');
        if (domArtist && domArtist.length > 0) {
            details.artist = domArtist[0].title;
        }

        const domSong = playback[0].getElementsByClassName('playbackSoundBadge__titleLink');
        if (domSong && domSong.length > 0) {
            details.track = domSong[0].title;
        }

        const domTimePassed = document.getElementsByClassName('playbackTimeline__timePassed');
        if (domTimePassed && domTimePassed.length > 0) {
            // console.log('domTimePassed', domTimePassed);
            const domSpanTime = domTimePassed[0].getElementsByTagName('span');
            if (domSpanTime && domSpanTime.length > 0) {
                // console.log('domSpanTime', domSpanTime);

                details.elapsed = domSpanTime[1].textContent.trim();
            }
        }

        const domTimeDuration = document.getElementsByClassName('playbackTimeline__duration');
        if (domTimeDuration && domTimeDuration.length > 0) {
            // console.log('domTimePassed', domTimeDuration);
            const domSpanTotal = domTimeDuration[0].getElementsByTagName('span');
            if (domSpanTotal && domSpanTotal.length > 0) {
                // console.log('domSpanTotal', domSpanTotal);

                details.total = domSpanTotal[1].textContent.trim();
            }
        }

    }
}

function getPlayingStatus() {

    const domBtnPlay = document.getElementsByClassName('playControls__play playing');
    if (domBtnPlay && domBtnPlay.length > 0) {
        // console.log('domBtnPlay', domBtnPlay);
        return true;
    }
    // playControl sc-ir playControls__control playControls__play
    return false;
}

function getTrackElapsed() {
    const domTimePassed = document.getElementsByClassName('playbackTimeline__timePassed');
    if (domTimePassed && domTimePassed.length > 0) {
        // console.log('domTimePassed', domTimePassed);
        const domSpanTime = domTimePassed[0].getElementsByTagName('span');
        if (domSpanTime && domSpanTime.length > 0) {
            // console.log('domSpanTime', domSpanTime);

            return domSpanTime[1].textContent.trim();
        }
    }
}

function playTrack() {
    console.log('playTrack')

    const isPlaying = getPlayingStatus();
    if (!isPlaying) {
        const domBtnPlay = document.getElementsByClassName('playControls__play');
        if (domBtnPlay && domBtnPlay.length > 0) {
            console.log('playTrack button click');
            domBtnPlay[0].click();
        }
    }
}

function pauseTrack() {
    console.log('pauseTrack')
    // <button type="button" class="playControl sc-ir playControls__control playControls__play" tabindex="" title="Play current" aria-label="Play current">Play current</button>

    // <button type="button" class="playControl sc-ir playControls__control playControls__play playing" tabindex="" title="Pause current" aria-label="Pause current">Pause current</button>
    const isPlaying = getPlayingStatus();
    if (isPlaying) {
        const domBtnPlay = document.getElementsByClassName('playControls__play');
        if (domBtnPlay && domBtnPlay.length > 0) {
            console.log('pauseTrack button click');
            domBtnPlay[0].click();
        }
    }
}

function previousTrack() {
    console.log('previousTrack')

    const domBtnPrevious = document.getElementsByClassName('playControls__prev');
    if (domBtnPrevious && domBtnPrevious.length > 0) {
        console.log('previousTrack button click');
        domBtnPrevious[0].click();
    }
}

function nextTrack() {
    console.log('nextTrack')

    const domBtnNext = document.getElementsByClassName('playControls__next');
    if (domBtnNext && domBtnNext.length > 0) {
        console.log('nextTrack button click');
        domBtnNext[0].click();
    }
}

function scrollToElement(element) {
    const yOffset = -200;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
}



const targetNode = document.getElementsByClassName(controlsWatch)[0];

// Select the node that will be observed for mutations
// const targetNode = document.getElementById("some-id");

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {

    const isPlaying = getPlayingStatus();
    const elapsed = getTrackElapsed();

    fetchSongInfo();

    if (isPlaying && elapsed !== detailsLast.elapsed) {
        const message = {
            type: 'soundcloud.update',
            data: { ...details }
        }
        console.log(message.type, elapsed);
        chrome.runtime.sendMessage(JSON.stringify(message));
    }
    else if (!isPlaying) {
        details.isPlaying = false;
        const message = {
            type: 'soundcloud.paused',
            data: { ...details }
        }
        console.log(message.type, elapsed);
        chrome.runtime.sendMessage(JSON.stringify(message));
    }

    detailsLast.isPlaying = isPlaying;
    detailsLast.elapsed = elapsed;


    // if (isPlaying !== detailsLast.isPlaying) {
    //     if (elapsed !== detailsLast.elapsed) {

    //     }
    // }





    // for (const mutation of mutationList) {
    //     if (mutation.type === "childList") {
    //         // console.log("A child node has been added or removed.");
    //     } else if (mutation.type === "attributes") {
    //         // console.log(`The ${mutation.attributeName} attribute was modified.`);

    //     }
    // }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    // console.log('sender', sender);
    // console.log('sendResponse', sendResponse);

    const messageObject = JSON.parse(message);


    if (messageObject.type === 'getTrackInfo') {
        fetchSongInfo();
        console.log('soundcloud response', { ...details });
        sendResponse({ ...details });
    }
    else if (messageObject.type === 'soundcloud.play') {
        playTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'soundcloud.pause') {
        pauseTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'soundcloud.previous') {
        previousTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'soundcloud.next') {
        nextTrack();
        sendResponse(true);
    }
    else {
        // window.alert(`message not handled ${message}`)
    }
});

async function onLoad() {
    console.log('onLoad');

    queueWatch();



    // domEvents();
    // domInit();
}

// function controlsWatch() {
//     const targetNode = document.getElementsByClassName(controlsWatch)[0];

// }


function queueWatch() {

    const targetNode = document.getElementsByClassName(queueWatchNode)[0];
    if (targetNode) {

        // Select the node that will be observed for mutations
        // const targetNode = document.getElementById("some-id");

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
            console.log('callback');
            // fetchSongInfo();
            // chrome.runtime.sendMessage('soundcloudUpdate');
            updateQueueButtons();

            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    // console.log("A child node has been added or removed.");
                } else if (mutation.type === "attributes") {
                    // console.log(`The ${mutation.attributeName} attribute was modified.`);

                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }
    else {
        // window.alert('bad soundcloud queue target node', queueWatchNode);
    }
}

function updateQueueButtons() {

    if (!bg.updateQueue) {
        return;
    }

    const list = document.getElementsByClassName(queueButtonTarget);

    console.log('updateQueue', bg.watchlistLength, list.length);

    if (list && list.length > 0) {
        if (bg.watchlistLength !== list.length)
            for (let i = 0; i < list.length; i++) {
                console.log('item', i, list[i]);
                let data = {
                    url: '',
                    artist: '',
                    track: ''
                }

                // ITEM ARTIST
                const domArtist = list[i].getElementsByClassName('soundTitle__username');
                if (domArtist && domArtist.length > 0) {
                    const span = domArtist[0].getElementsByTagName('span');
                    if (span && span.length > 0) {
                        data.artist = span[0].textContent.trim();
                    }
                }

                // ITEM TRACK
                const domTrack = list[i].getElementsByClassName('soundTitle__title');
                if (domTrack && domTrack.length > 0) {
                    console.log('domTrack', domTrack[0].href);
                    data.url = domTrack[0].href;

                    const span = domTrack[0].getElementsByTagName('span');
                    if (span && span.length > 0) {
                        data.track = span[0].textContent;
                    }

                }
                // ITEM URL 


                async function buttonClick(data) {
                    console.log('buttonclick 2', data);

                    const options = { ...data };


                    const message = {
                        type: 'soundcloud.addToQueue',
                        data: data
                    }

                    chrome.runtime.sendMessage(JSON.stringify(message));
                    window.alert(`Clicked button ${JSON.stringify(data)}`);
                }



                const row = document.createElement('div');
                list[i].appendChild(row);

                const button = document.createElement('button');
                button.textContent = 'Add to Queue';
                button.onclick = () => {
                    console.log('buttonclick 1', data);
                    buttonClick(data);
                }
                row.appendChild(button);

                const text = document.createElement('span');
                row.appendChild(text);
            }
        bg.watchlistLength = list.length;
        bg.updateQueue = false;
    }
}



const bg = {
    updateQueue: true,
    watchlistLength: 0,

}


// document.addEventListener('DOMContentLoaded', onLoad);
onLoad();

