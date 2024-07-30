

let currentWindow = null;
let currentTab = null;
let currentTitle = '';

async function onLoad() {
    console.log('onLoad');

    // getSongInfo();

    setTimeout(() => {
        getSongInfo();
    }, 1000)
}

async function getSongInfo() {
    // console.log('getSongInfo');
    const tabs = await chrome.tabs.query({ active: true });
    // console.log('tabs', tabs);

    const [tab] = tabs.filter((tab) => { return tab.audible === true });
    // console.log('tab', tab);

    if (tab) {
        const response = await chrome.tabs.sendMessage(tab.id, 'getSongInfo');
        console.log('getSongInfo response', response);
        // const response = await chrome.runtime.sendMessage('getSongInfo');
        // do something with response here, not outside the function
        if (response) {
            const { source, artist, album, song, image, url } = response;
            setCurrentSong({ source, artist, album, song, image, url });
        }
    }
}

function setCurrentSong({ source, artist, album, song, image, url }) {
    if (source) {
        document.getElementById('source').innerText = source;
    }
    if (artist) {
        document.getElementById('artist').innerText = artist;
    }
    if (album) {
        document.getElementById('album').innerText = album;
    }
    if (song) {
        document.getElementById('song').innerText = song;
    }
    if (image) {
        document.getElementById('image').src = image;
    }
    if (url) {
        document.getElementById('url').innerText = url;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    // console.log('sender', sender);
    // console.log('sendResponse', sendResponse);


    if (message === 'soundcloudUpdate') {
        // sendResponse(true);
        getSongInfo();
        // sendResponse({ tabId: currentTab.id, title: currentTab.title });
    }
});

document.addEventListener('DOMContentLoaded', onLoad);

