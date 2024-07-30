

let currentWindow = null;
let currentTab = null;
let currentTitle = '';

let lastTab = null;

// Player status 
const domPlay = document.getElementById('btn-play');
const domPause = document.getElementById('btn-pause');
const domBtnPrevious = document.getElementById('btn-previous');
const domBtnNext = document.getElementById('btn-next');

const domAlbum = document.getElementById('div-album'); // ????

const domElapsed = document.getElementById('div-elapsed');
const domTotal = document.getElementById('div-total');
const domInputTime = document.getElementById('input-time');

const domSrcLoading = document.getElementById('div-src-loading');
const domSrcBandcamp = document.getElementById('div-src-bandcamp');
const domSrcSoundcloud = document.getElementById('div-src-soundcloud');

// Tracklist/Queue
const domTabItemsTracklist = document.getElementById('tab-items-tracklist');
const domTabItemsQueue = document.getElementById('tab-items-queue');

const domTabButtonTracklist = document.getElementById('tab-button-tracklist');
const domTabButtonQueue = document.getElementById('tab-button-queue');
const domTabButtonLyrics = document.getElementById('tab-button-lyrics');

const domTabTracklist = document.getElementById('tab-tracklist');
const domTabQueue = document.getElementById('tab-queue');
const domTabLyrics = document.getElementById('tab-lyrics');



let details = {
    source: '',
    artist: '',
    album: '',
    track: '',
    url: '',
    image: '',
    strElapsed: '',
    strTotal: '',
    elapsed: 0,
    total: 0,
    isPlaying: false,

    tracklist: [],
}







async function onLoad() {
    console.log('onLoad');


    domEvents();
    domInit();

    setTimeout(() => {
        getTrackInfo();
    }, 1000)
}

function domEvents() {
    domPlay.addEventListener('click', () => { controls.play() });
    domPause.addEventListener('click', () => { controls.pause() });
    domBtnPrevious.addEventListener('click', () => { controls.previous() });
    domBtnNext.addEventListener('click', () => { controls.next() });

    domTabButtonTracklist.addEventListener('click', () => { controls.showTracklist() });
    domTabButtonQueue.addEventListener('click', () => { controls.showQueue() });
    domTabButtonLyrics.addEventListener('click', () => { controls.showLyrics() });
}

function domInit() {

    if (domElapsed) {
        domElapsed.innerText = '00:01';
    }
    if (domTotal) {
        domTotal.innerText = '00:59';
    }
    if (domInputTime) {
        domInputTime.value = 50;
    }
    if (domSrcLoading) {
        // domSrcLoading.classList.add("hide");
    }

    controls.showSource('loading');
}

async function getTrackInfo() {
    console.log('getTrackInfo');
    const tabs = await chrome.tabs.query({ audible: true });
    // const tabs = await chrome.tabs.query({ active: true });
    // console.log('tabs', tabs);

    // const [tab] = tabs.filter((tab) => { return tab.audible === true });
    // console.log('tab', tab);

    if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        if (tab) {
            const message = { type: "getTrackInfo" };
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('getTrackInfo response', response);
            // const response = await chrome.runtime.sendMessage('getTrackInfo');
            // do something with response here, not outside the function
            if (response) {
                setCurrentTrack(response);
            }
        }
        else {
            window.alert('two tabs playing at once????');
        }
    }
}

async function playTrack() {
    console.log('playTrack');


    let msg = {};
    if (details.source === 'soundcloud') {
        msg = { type: 'soundcloud.play' }
    }
    else if (details.source === 'bandcamp') {
        msg = { type: 'bandcamp.play' }
    }
    const response = chrome.runtime.sendMessage(JSON.stringify(msg));

    // if (lastTab) {
    //     await sendPlayMessage(lastTab);
    // }
    // else {
    //     const tab = await getCurrentTab();
    //     await sendPlayMessage(tab);
    //     lastTab = tab;
    // }
}

async function pauseTrack() {
    console.log('pauseTrack');

    let msg = {};
    if (details.source === 'soundcloud') {
        msg = { type: 'soundcloud.pause' }
    }
    else if (details.source === 'bandcamp') {
        msg = { type: 'bandcamp.pause' }
    }
    const response = chrome.runtime.sendMessage(JSON.stringify(msg));


    // if( lastTab ) {
    //     await sendPauseMessage(lastTab);
    // }
    // else {
    //     const tab = await getCurrentTab();
    //     await sendPauseMessage(tab);
    //     lastTab = tab;
    // }
}

async function sendPlayMessage(tab) {
    if (tab && tab.id) {
        if (details.source === 'soundcloud') {
            const message = { type: "soundcloud.play" };
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('soundcloud.pause response', response);
        }
        else if (details.source === 'bandcamp') {
            const message = { type: "bandcamp.play" };
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('bandcamp.pause response', response);
        }
    }
}

async function sendPauseMessage(tab) {
    if (tab && tab.id) {
        if (details.source === 'soundcloud') {
            const message = { type: "soundcloud.pause" };
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('soundcloud.pause response', response);
        }
        else if (details.source === 'bandcamp') {
            const message = { type: "bandcamp.pause" };
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('bandcamp.pause response', response);
        }
    }
}

async function previousTrack() {
    console.log('previousTrack');

    let msg = {};
    if (details.source === 'soundcloud') {
        msg = { type: 'soundcloud.previous' }
    }
    else if (details.source === 'bandcamp') {
        msg = { type: 'bandcamp.previous' }
    }
    const response = chrome.runtime.sendMessage(JSON.stringify(msg));

    // const tab = await getCurrentTab();
    // if (tab) {
    //     await sendPreviousTrackMessage(tab);
    //     lastTab = tab;
    // }
    // else if (lastTab) {
    //     await sendPreviousTrackMessage(tab);
    // }
}

async function sendPreviousTrackMessage(tab) {
    console.log('tab', tab);
    if (tab && tab.id) {
        if (details.source === 'soundcloud') {
            const message = { type: "soundcloud.previous" }
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('soundcloud.previous response', response);
        }
        else if (details.source === 'bandcamp') {
            const message = { type: "bandcamp.previous" }
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('bandcamp.previous response', response);
        }
    }
}

async function nextTrack() {
    console.log('nextTrack'.details);

    let msg = {};
    if (details.source === 'soundcloud') {
        msg = { type: 'soundcloud.next' }
    }
    else if (details.source === 'bandcamp') {
        msg = { type: 'bandcamp.next' }
    }
    const response = chrome.runtime.sendMessage(JSON.stringify(msg));

    // const tab = await getCurrentTab();
    // if (tab) {
    //     await sendNextTrackMessage(tab);
    //     lastTab = tab;
    // }
    // else if (lastTab) {
    //     await sendNextTrackMessage(tab);
    // }
}

async function sendNextTrackMessage(tab) {
    console.log('tab', tab);
    if (tab && tab.id) {
        if (details.source === 'soundcloud') {
            const message = { type: "soundcloud.next" }
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('soundcloud.next response', response);
        }
        else if (details.source === 'bandcamp') {
            const message = { type: "bandcamp.next" }
            const response = await chrome.tabs.sendMessage(tab.id, JSON.stringify(message));
            console.log('bandcamp.next response', response);
        }
    }
}

async function getCurrentTab() {
    // const tabs = await chrome.tabs.query({ active: true });
    const tabs = await chrome.tabs.query({ audible: true });
    console.log('tabs', tabs);

    // const [tab] = tabs.filter((tab) => { return tab.audible === true });
    // console.log('tab', tab);

    if (tabs && tabs.length > 0) {
        return tabs[0];
    }
    return null;
}

function setCurrentTrack(response) {

    const { source, artist, album, track, image, url, elapsed, total, tracklist, isPlaying } = response;

    const lastDetails = { ...details };

    details.source = source ? source : 'loading';
    details.artist = artist ? artist : '';
    details.album = album ? album : '';
    details.track = track ? track : '';
    details.image = image ? image : '';
    details.url = url ? url : '';
    details.strElapsed = elapsed ? elapsed : '00:00';
    details.strTotal = total ? total : '00:00';
    details.tracklist = tracklist ? tracklist : [];

    details.isPlaying = isPlaying ? isPlaying : false;

    calculateElapsed();

    console.log('setCurrentTrack', source, artist, album, track, image, url, elapsed, total);
    if (source) {
        controls.showSource(source);
        // if( )
        // document.getElementById('source').innerText = source;
    }
    if (artist) {
        document.getElementById('artist').innerText = artist;
    }
    if (album) {
        document.getElementById('album').innerText = album;
        controls.showAlbum();
    }
    else {
        controls.hideAlbum();
    }
    if (track) {
        document.getElementById('track').innerText = track;
    }
    if (image) {
        document.getElementById('image').src = image;
    }
    if (url) {
        const domURL = document.getElementById('url')
        if (domURL) {
            domURL.innerText = url;
        }
    }

    if (elapsed && domElapsed) {
        domElapsed.innerText = elapsed;
    }
    if (total && domTotal) {
        domTotal.innerText = total;
    }
    if (isPlaying) {
        controls.showPause();
    }
    else {
        controls.showPlay();
    }

    if (lastDetails.track !== details.track) {
        updateTracklist();
    }

    loading = false;
}

function calculateElapsed() {

    if (details.strElapsed && details.strTotal) {
        let elapsed = 0;
        let total = 0;

        // STRING MM:SS
        let arrE = details.strElapsed.split(':');
        let arrT = details.strTotal.split(':');

        if (arrE.length <= 2) {
            // MM:SS
            elapsed = Number(arrE[0]) * 60 + Number(arrE[1]);
        }
        else {
            // HH:MM:SS
            elapsed = (Number(arrE[0]) * 60 * 60) + (Number(arrE[1]) * 60) + Number(arrE[2]);
        }

        if (arrT.length <= 2) {
            // MM:SS
            total = Number(arrT[0]) * 60 + Number(arrT[1]);
        }
        else {
            // HH:MM:SS
            total = (Number(arrT[0]) * 60 * 60) + (Number(arrT[1]) * 60) + Number(arrT[2]);
        }


        console.log('calculateElapsed', elapsed, total);


        const timeout = setTimeout(() => {
            console.log("Hello timeout");

            controls.isPlaying = false;
            // controls.pause();
        }, 1500);

        if (details.elapsed === elapsed) {

        }
        else {
            controls.isPlaying = true;
            // controls.play();
            console.log('clear timeout');
            clearTimeout(timeout);
        }


        details.elapsed = elapsed;
        details.total = total;

        domInputTime.value = elapsed;
        domInputTime.max = total;
    }
}

function updateTracklist() {
    console.log('$$$', domTabItemsTracklist);
    if (domTabItemsTracklist) {

        domTabItemsTracklist.replaceChildren();

        if (details.tracklist && details.tracklist.length > 0) {

            // domTabItemsTracklist.replaceChildren();

            for (let i = 0; i < details.tracklist.length; i++) {

                // <div class="row"> Title - Total </div>    

                const row = document.createElement('div');
                domTabItemsTracklist.appendChild(row);
                row.classList.add("tab-row");

                if (details.track === details.tracklist[i].track) {
                    row.classList.add("active");
                }



                const index = document.createElement('span');
                index.innerText = `${i + 1}.`;
                index.classList.add("index");
                row.appendChild(index);

                const track = document.createElement('span');
                track.innerText = details.tracklist[i].track;
                track.classList.add("track");
                row.appendChild(track);

                if (details.tracklist[i].total) {


                    const total = document.createElement('span');
                    total.innerText = details.tracklist[i].total;
                    total.classList.add("total");
                    row.appendChild(total);
                }
            }
        }
        else {
            const row = document.createElement('div');
            domTabItemsTracklist.appendChild(row);
            row.classList.add("tab-row-center");

            const track = document.createElement('span');
            track.innerText = 'No tracklist available'
            track.classList.add("track");
            row.appendChild(track);
        }
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    // console.log('sender', sender);
    // console.log('sendResponse', sendResponse);
    if (message === 'test') {

    }
    else {
        const msg = JSON.parse(message);
        console.log(msg.type, msg.data);
        if (msg.type === 'sidepanel.update') {
            setCurrentTrack(msg.data.details);
            controls.addToQueue(msg.data.queue);
        }
        else if (msg.type === 'sidepanel.paused') {
            setCurrentTrack(msg.data);
        }
    }




    // if (messageObject.type === 'soundcloud.update') {
    //     // sendResponse(true);
    //     getTrackInfo();
    //     // sendResponse({ tabId: currentTab.id, title: currentTab.title });
    // }
    // else if (messageObject.type === 'soundcloud.addToQueue') {
    //     console.log('soundcloud.addToQueue', messageObject.data);

    //     controls.addToQueue(messageObject.data);
    // }

});


let controls = {
    isPlaying: false,
    loading: true,

    queue: [],

    play: async () => {
        console.log('play');
        domPause.classList.add("hide");
        domPlay.classList.remove("hide");

        playTrack();
    },
    pause: () => {
        console.log('pause');
        domPlay.classList.add("hide");
        domPause.classList.remove("hide");

        pauseTrack();
    },
    previous: () => {
        previousTrack();
    },
    next: () => {
        nextTrack();
    },

    showPlay: () => {
        domPause.classList.add("hide");
        domPlay.classList.remove("hide");
    },
    showPause: () => {
        domPlay.classList.add("hide");
        domPause.classList.remove("hide");
    },

    showAlbum: () => {
        domAlbum.classList.remove("hide");
    },
    hideAlbum: () => {
        domAlbum.classList.add("hide");
    },
    showSource: (type) => {
        if (type === 'bandcamp') {
            domSrcLoading.classList.add("hide");
            domSrcBandcamp.classList.remove("hide");
            domSrcSoundcloud.classList.add("hide");
        }
        else if (type === 'soundcloud') {
            domSrcLoading.classList.add("hide");
            domSrcBandcamp.classList.add("hide");
            domSrcSoundcloud.classList.remove("hide");
        }
        else {
            // loading 
            domSrcLoading.classList.remove("hide");
            domSrcBandcamp.classList.add("hide");
            domSrcSoundcloud.classList.add("hide");
        }
    },
    showTracklist: () => {
        if (domTabTracklist && domTabQueue && domTabLyrics) {
            domTabButtonTracklist.classList.add('active');
            domTabButtonQueue.classList.remove('active');
            domTabButtonLyrics.classList.remove('active');

            domTabTracklist.classList.remove('hide');
            domTabQueue.classList.add('hide');
            domTabLyrics.classList.add('hide');
        }
    },
    showQueue: () => {
        if (domTabTracklist && domTabQueue && domTabLyrics) {
            domTabButtonTracklist.classList.remove('active');
            domTabButtonQueue.classList.add('active');
            domTabButtonLyrics.classList.remove('active');

            domTabTracklist.classList.add('hide');
            domTabQueue.classList.remove('hide');
            domTabLyrics.classList.add('hide');
        }
    },
    showLyrics: () => {
        if (domTabTracklist && domTabQueue && domTabLyrics) {
            domTabButtonTracklist.classList.remove('active');
            domTabButtonQueue.classList.remove('active');
            domTabButtonLyrics.classList.add('active');

            domTabTracklist.classList.add('hide');
            domTabQueue.classList.add('hide');
            domTabLyrics.classList.remove('hide');
        }
    },
    addToQueue: (newQueue) => {

        addToQueue(newQueue);
        updateQueueDom();
    }
}

function addToQueue(newQueue) {
    if (controls.queue && controls.queue.length >= 0) {
        if (newQueue && newQueue.length > 0) {
            for (let i = 0; i < newQueue.length; i++) {
                let match = false;
                for (let q = 0; q < controls.queue.length; q++) {
                    if (controls.queue[q].url === newQueue[i].url) {
                        match = true;
                    }
                }
                if (!match) {
                    controls.queue.push(newQueue[i]);
                }
            }
        }
    }
}



function updateQueueDom() {
    if (domTabItemsQueue) {

        if (controls.queue && controls.queue.length > 0) {
            // const queueIndex = controls.queue.length;
            domTabItemsQueue.replaceChildren();

            for (let i = 0; i < controls.queue.length; i++) {
                const item = controls.queue[i];

                const row = document.createElement('div');
                domTabItemsQueue.appendChild(row);
                row.classList.add("tab-row");

                const index = document.createElement('span');
                index.innerText = `${i + 1}`;
                index.classList.add("index");
                row.appendChild(index);

                if (item.url) {
                    const details = document.createElement('div');
                    details.classList.add('tab-details');
                    row.appendChild(details)

                    const track = document.createElement('span');
                    track.innerText = item?.url ? item.url : 'no url'
                    track.classList.add("track");
                    details.appendChild(track);
                }
                else {
                    const details = document.createElement('div');
                    details.classList.add('tab-details');
                    row.appendChild(details)

                    const artist = document.createElement('span');
                    artist.innerText = item?.artist ? item.artist : 'artist missing'
                    artist.classList.add("artist");
                    details.appendChild(artist);

                    const track = document.createElement('span');
                    track.innerText = item?.track ? item.track : 'track missing'
                    track.classList.add("track");
                    details.appendChild(track);

                    const total = document.createElement('span');
                    total.innerText = item?.total ? item.total : '420:69';
                    total.classList.add("total");
                    row.appendChild(total);

                }
                const played = document.createElement('span');
                played.innerText = item?.played ? 'Played' : 'not played'
                played.classList.add("total");
                details.appendChild(played);
            }
        }
    }
}



document.addEventListener('DOMContentLoaded', onLoad);

