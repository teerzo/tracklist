console.log('contentScripts.js');

function fetchSongInfo() {
    const playback = document.getElementsByClassName('playbackSoundBadge');
    if (playback) {
        // console.log('playback', playback);

        let artist = '';
        let song = '';
        let url = '';
        let image = '';

        const domAvatar = playback[0].getElementsByClassName('playbackSoundBadge__avatar');
        if (domAvatar && domAvatar.length > 0) {
            url = domAvatar[0].href;

            const domImage = domAvatar[0].getElementsByClassName('sc-artwork');
            if (domImage && domImage.length > 0) {
                const domSpan = domImage[0].getElementsByTagName('span')[0];
                if (domSpan) {
                    console.log(domSpan);
                    console.log('style', domSpan.style.backgroundImage);

                    let str = 'url("';
                    let index = domSpan.style.backgroundImage.indexOf(str);
                    let slice = domSpan.style.backgroundImage.slice(str.length, -2);
                    console.log('slice', slice);
                    image = slice;
                }
                // "url("https://i1.sndcdn.com/artworks-kJ5eRQTXBmSrr7F0-xJGvyw-t120x120.jpg"


                // console.log(domImage[0]);
                // image = domImage[0];
            }
        }

        const domArtist = playback[0].getElementsByClassName('playbackSoundBadge__lightLink');
        if (domArtist && domArtist.length > 0) {
            artist = domArtist[0].title;
        }

        const domSong = playback[0].getElementsByClassName('playbackSoundBadge__titleLink');
        if (domSong && domSong.length > 0) {
            song = domSong[0].title;
        }

        console.log('finish', artist, song, url);
        // if( chrome && chrome.runtime && chrome.runtime.sendMessage ) {
        chrome.runtime.sendMessage({ artist: artist, song: song, image, image, url: url });
        // }
    }
}

setTimeout(() => {
    // console.log("Delayed for 2 second.");
    // fetchSongInfo();
}, "2000");

const targetNode = document.getElementsByClassName("playbackSoundBadge")[0];

// Select the node that will be observed for mutations
// const targetNode = document.getElementById("some-id");

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
    // console.log('callback');
    for (const mutation of mutationList) {
        if (mutation.type === "childList") {
            //   console.log("A child node has been added or removed.");
        } else if (mutation.type === "attributes") {
            //   console.log(`The ${mutation.attributeName} attribute was modified.`);
            fetchSongInfo();
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    console.log('sender', sender);
    console.log('sendResponse', sendResponse);

    const { artist, song, image, url } = message;

    if (message === 'getSongInfo') {
        sendResponse({ foo: 'bar' });
        fetchSongInfo();
    }
    else if (artist && song && image && url) {
        setCurrentSong({ artist, song, image, url });
    }
    return true;
});

