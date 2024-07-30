console.log('bandcamp-track.js');

const watchHome = 'carousel-player';
const watchTrack = 'trackInfo';

// const domNameSection = document.getElementById('name-section');
// const domTrackInfo = document.getElementsByClassName('track_info');
const domTrackTable = document.getElementById('track_table');
// const domTrack = document.getElementById('trackTitle');
// const domArt = document.getElementById('tralbumArt');
// const domImage = domArt.getElementsByTagName('img');


let bandcamp = {
    location: '',
    initalized: false,
}

let details = {
    source: 'bandcamp',
    artist: '',
    album: '',
    track: '',
    trackNumber: '',
    url: window.location.href,
    image: '',
    elapsed: 0,
    total: 0,
    isPlaying: false,
    tracklist: []
}

// let tracklist = [];

let detailsLast = {
    track: '',
    trackNumber: '',
    elapsed: 0,
    isPlaying: false,
}

function init() {
    const url = window.location.href;

    const regUser = /https:[/][/]bandcamp.com[/]([a-zA-Z])\w+/g
    const regWishlist = /bandcamp.com[/]([a-zA-Z])\w+[/]wishlist/g
    const regAlbum = /([a-zA-Z])\w+.bandcamp.com[/]album[/]/g
    const regTrack = /([a-zA-Z])\w+.bandcamp.com[/]track[/]/g

    if (regUser.test(url)) {
        bandcamp.location = 'user';
    }
    else if (regWishlist.test(url)) {
        bandcamp.location = 'wishlist';
    }
    else if (regAlbum.test(url)) {
        bandcamp.location = 'album';
    }
    else if (regTrack.test(url)) {
        bandcamp.location = 'track'
    }

    initWatcher();
    // initListener();

    bandcamp.initalized = true;


    window.setTimeout(() => {
        const isPlaying = getPlayingStatus();
        if( !isPlaying) {
            playTrack();
        }
    },2000)
}

function initWatcher() {
    console.log('initWatcher', bandcamp.location);
    let targetNode = null;
    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        targetNode = document.getElementById(watchHome);
    }
    else if (bandcamp.location === 'album' || bandcamp.location === 'track') {
        targetNode = document.getElementById(watchTrack);
    }

    if (targetNode !== null) {
        console.log('watching', targetNode);

        // const targetNode = document.getElementsByClassName(watchNode)[0];
        // Select the node that will be observed for mutations
        // const targetNode = document.getElementById("some-id");

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
            // console.log('callback');

            const isPlaying = getPlayingStatus();
            const time = getTrackElapsed();

            fetchTrackInfo();
            // console.log('watch', isPlaying, time, details.isPlaying);

            // console.log('message check')
            if (isPlaying && details.track !== detailsLast.track) {
                details.isPlaying = true;
                const message = {
                    type: 'bandcamp.start',
                    data: { ...details },
                }
                console.log(message.type, time, details);
                chrome.runtime.sendMessage(JSON.stringify(message));
            }
            else if (isPlaying && details.elapsed !== detailsLast.elapsed) {
                details.isPlaying = true;
                const message = {
                    type: 'bandcamp.update',
                    data: { ...details }
                }
                // console.log(message.type, time, details);
                chrome.runtime.sendMessage(JSON.stringify(message));
            }

            else if (!isPlaying) {
                if (details.elapsed === details.total) {

                    if (details.tracklist && details.tracklist.length > 0) {
                        console.log('finished', details);
                        if (details.track === details.tracklist[details.tracklist.length - 1].track) {
                            details.isPlaying = false;
                            const message = {
                                type: 'bandcamp.finish',
                                data: { ...details }
                            }
                            console.log(message.type, time);
                            chrome.runtime.sendMessage(JSON.stringify(message));
                        }
                    }
                    else {
                        details.isPlaying = false;
                        const message = {
                            type: 'bandcamp.finish',
                            data: { ...details }
                        }
                        console.log(message.type, time);
                        chrome.runtime.sendMessage(JSON.stringify(message));
                    }
                }
                else {
                    details.isPlaying = false;
                    const message = {
                        type: 'bandcamp.paused',
                        data: { ...details }
                    }
                    console.log(message.type, time);
                    chrome.runtime.sendMessage(JSON.stringify(message));
                }
            }

            detailsLast.track = details.track;
            detailsLast.trackNumber = details.trackNumber;
            detailsLast.isPlaying = isPlaying;
            detailsLast.elapsed = time.elapsed;


            // chrome.runtime.sendMessage('soundcloudUpdate');
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    //   console.log("A child node has been added or removed.");
                } else if (mutation.type === "attributes") {
                    //   console.log(`The ${mutation.attributeName} attribute was modified.`);
                    // fetchTrackInfo();
                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

        // Later, you can stop observing
        // observer.disconnect();
    }

}

// function initListener() {

function playTrack() {
    console.log('playTrack')

    const isPlaying = getPlayingStatus();
    if (!isPlaying) {

        if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
            const player = document.getElementById('carousel-player');
            if (player) {
                const btnPause = player.getElementsByClassName('pause');
                if (btnPause && btnPause.length > 0) {
                    // console.log('btnPause', btnPause[0].style);
                    if (btnPause[0].style.display !== 'none') {
                        // return true;
                        btnPause[0].click();
                    }
                }
            }
        }
        else if (bandcamp.location === 'album' || bandcamp.location === 'track') {

            const trackInfo = document.getElementById('trackInfo');
            if (trackInfo) {

                const playing = trackInfo.getElementsByClassName('playbutton');
                if (playing && playing.length > 0) {
                    // return true;
                    playing[0].click();
                }
            }
        }
    }
}

function pauseTrack() {
    console.log('pauseTrack')


    const isPlaying = getPlayingStatus();
    if (isPlaying) {

        if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
            const player = document.getElementById('carousel-player');
            if (player) {
                const btnPause = player.getElementsByClassName('pause');
                if (btnPause && btnPause.length > 0) {
                    // console.log('btnPause', btnPause[0].style);
                    if (btnPause[0].style.display !== 'none') {
                        // return true;
                        btnPause[0].click();
                    }
                }
            }
        }
        else if (bandcamp.location === 'album' || bandcamp.location === 'track') {

            const trackInfo = document.getElementById('trackInfo');
            if (trackInfo) {

                const playing = trackInfo.getElementsByClassName('playbutton playing');
                if (playing && playing.length > 0) {
                    // return true;
                    playing[0].click();
                }
            }
        }
    }
}

function previousTrack() {
    console.log('previousTrack', bandcamp.location);

    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        const player = document.getElementById('carousel-player');
        if (player) {
            const queue = player.getElementsByClassName('queue');
            if (queue && queue.length > 0) {
                // prev item in bandcamp queue 
                const btnPrev = player.getElementsByClassName('prev-icon');
                if (btnPrev && btnPrev.length > 0) {
                    if (!btnPrev[0].classList.contains('disabled')) {
                        btnPrev[0].click();
                    }
                    else {
                        getPrevTrackIndex();
                    }
                }
            }
            else {
                // prev item on wishlist page?
                getPrevTrackIndex();
            }
        }
    }

    else if (bandcamp.location === 'album' || bandcamp.location === 'track') {

        const tracktable = document.getElementById('track_table');
        if (tracktable) {

            const tracks = tracktable.getElementsByTagName('tr');
            if (tracks && tracks.length > 0) {

                for (let i = 0; i < tracks.length; i++) {
                    const track = getClassText('track-title', tracks[i]);
                    if (track === details.track) {
                        if (i > 0) {
                            const target = tracks[i - 1].getElementsByClassName('play_status');
                            target[0].click();
                            return;
                        }
                    }
                }
            }
        }
    }
}

function nextTrack() {
    console.log('nextTrack', bandcamp.location);

    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        const player = document.getElementById('carousel-player');
        if (player) {
            const queue = player.getElementsByClassName('queue');
            if (queue && queue.length > 0) {
                // Next item in bandcamp queue 
                const btnNext = player.getElementsByClassName('next-icon');
                if (btnNext && btnNext.length > 0) {
                    if (!btnNext[0].classList.contains('disabled')) {
                        btnNext[0].click();
                    }
                    else {
                        getNextTrackIndex();
                    }
                }
            }
            else {
                // Next item on wishlist page?
                getNextTrackIndex();
            }
        }
    }
    else if (bandcamp.location === 'album' || bandcamp.location === 'track') {

        const tracktable = document.getElementById('track_table');
        if (tracktable) {

            const tracks = tracktable.getElementsByTagName('tr');
            if (tracks && tracks.length > 0) {
                for (let i = 0; i < tracks.length; i++) {
                    const track = getClassText('track-title', tracks[i]);
                    if (track === details.track) {
                        if (i < tracks.length - 1) {
                            const target = tracks[i + 1].getElementsByClassName('play_status');
                            target[0].click();
                            return;
                        }
                    }
                }
            }
        }
    }
}

function getPrevTrackIndex() {

    let collection = null; // document.getElementsByClassName('collection-items');
    let collectionIndex = 0;

    const gridTabs = document.getElementById('grid-tabs');
    if( gridTabs ) {
        const tabs = gridTabs.getElementsByTagName('li');
        if( tabs && tabs.length > 0 ) {
            for( let i = 0; i < tabs.length; i++ ) {
                if( tabs[i].classList.contains('active')) {
                    console.log('active', i);
                    collectionIndex = i;
                }
            }
        }
    }

    if( collectionIndex === 0 ) {
        collection = document.getElementById('collection-items');
    }
    else if( collectionIndex === 1 ) {
        collection = document.getElementById('wishlist-items');
    }


    if (collection ) {
        const tracks = collection.getElementsByClassName('collection-item-container');

        if (tracks && tracks.length > 0) {
            for (let i = 0; i < tracks.length; i++) {
                // console.log('index', i, tracks[i]);
                const title = tracks[i].getElementsByClassName('collection-item-title');
                if (title && title.length > 0) {
                    let text = title[0].textContent.trim();
                    const index = text.indexOf("\n");
                    if (index !== -1) {
                        text = text.slice(0, index);
                    }

                    // console.log('text', i, text, details.track);
                    if (details.track === text) {
                        // console.log('next track is', i + 1);
                        if (i > 0) {
                            const play = tracks[i - 1].getElementsByClassName('item_link_play');
                            if (play && play.length > 0) {
                                // console.log('play');
                                play[0].click();
                                scrollToElement(play[0]);
                                return;
                            }
                        }

                        // document.getElementById("divFirst").scrollIntoView();
                    }
                    else if (details.album === text) {
                        if (i > 0) {
                            const play = tracks[i - 1].getElementsByClassName('item_link_play');
                            if (play && play.length > 0) {
                                // console.log('play');
                                play[0].click();
                                scrollToElement(play[0]);
                                return;
                            }
                        }
                    }
                }
            }

        }
    }
}

function getNextTrackIndex() {
   
    let collection = null; // document.getElementsByClassName('collection-items');
    let collectionIndex = 0;

    const gridTabs = document.getElementById('grid-tabs');
    if( gridTabs ) {
        const tabs = gridTabs.getElementsByTagName('li');
        if( tabs && tabs.length > 0 ) {
            for( let i = 0; i < tabs.length; i++ ) {
                if( tabs[i].classList.contains('active')) {
                    console.log('active', i);
                    collectionIndex = i;
                }
            }
        }
    }

    if( collectionIndex === 0 ) {
        collection = document.getElementById('collection-items');
    }
    else if( collectionIndex === 1 ) {
        collection = document.getElementById('wishlist-items');
    }


    if (collection ) {
        const tracks = collection.getElementsByClassName('collection-item-container');

        if (tracks && tracks.length > 0) {
            for (let i = 0; i < tracks.length; i++) {
                // console.log('index', i, tracks[i]);
                const title = tracks[i].getElementsByClassName('collection-item-title');
                if (title && title.length > 0) {
                    let text = title[0].textContent.trim();
                    const index = text.indexOf("\n");
                    if (index !== -1) {
                        text = text.slice(0, index);
                    }

                    // console.log('text', i, text, details.track);
                    if (details.track === text) {
                        // console.log('next track is', i + 1);

                        const play = tracks[i + 1].getElementsByClassName('item_link_play');
                        if (play && play.length > 0) {
                            // console.log('play');

                            play[0].click();
                            scrollToElement(play[0]);
                            return;
                        }

                        // document.getElementById("divFirst").scrollIntoView();
                    }
                    else if (details.album === text) {
                        const play = tracks[i + 1].getElementsByClassName('item_link_play');
                        if (play && play.length > 0) {
                            // console.log('play');

                            play[0].click();
                            scrollToElement(play[0]);
                            return;
                        }
                    }
                }
            }

        }
    }
}

function scrollToElement(element) {
    const yOffset = -200;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
}


function getHomeInfo() {
    // console.log('getHomeInfo');
    const player = document.getElementById('carousel-player');
    if (player) {
        // console.log('getHomeInfo', player);
        let isAlbum = false;

        const queue = player.getElementsByClassName('queue');
        if (queue && queue.length > 0) {
            isAlbum = true;

            let newTracklist = [];

            const tracks = queue[0].getElementsByTagName('li');
            if (tracks && tracks.length > 0) {

                for (let i = 0; i < tracks.length; i++) {
                    const track = tracks[i].getElementsByTagName('span');
                    if (track && track.length > 0) {
                        newTracklist.push({ trackNumber: track[0].textContent.trim(), track: track[1].textContent.trim() });
                    }
                }
            }
            details.tracklist = newTracklist;
        }

        const nowPlaying = player.getElementsByClassName('now-playing');
        if (nowPlaying && nowPlaying.length > 0) {
            details.image = getImgSrc(nowPlaying[0]);
        }

        const title = getClassText('title', player);
        if (isAlbum) {
            details.album = title;
            const info = player.getElementsByClassName('info-progress');
            if (info && info.length > 0) {
                // console.log('info');
                const infoTitle = info[0].getElementsByClassName('title');
                if (infoTitle && infoTitle.length > 0) {
                    // console.log('infoTitle', infoTitle);

                    const trackAnchor = infoTitle[0].getElementsByTagName('a');
                    if (trackAnchor && trackAnchor.length > 0) {
                        // console.log('trackAnchor');

                        const track = trackAnchor[0].getElementsByTagName('span');
                        // console.log('track', track);
                        if (track && track.length > 0) {
                            details.trackNumber = track[0].textContent.trim();
                            details.track = track[1].textContent.trim();
                        }
                    }
                }
            }
        }
        else {
            details.track = title;
            details.album = '';
            details.tracklist = [];
        }

        const artist = player.getElementsByClassName('artist');
        if (artist && artist.length > 0) {
            details.artist = getTagText('span', artist[0])
        }

        const time = getTrackElapsed();
        details.elapsed = time.elapsed;
        details.total = time.total;

        details.isPlaying = getPlayingStatus();

    }
}

function getAlbumInfo() {

    const domNameSection = document.getElementById('name-section');
    const domTrackInfo = document.getElementsByClassName('track_info');

    details.track = getClassText('title', domTrackInfo[0]);
    details.album = getClassText('trackTitle', domNameSection);
    details.artist = getTagText('a', domNameSection);
    details.elapsed = getClassText('time_elapsed', domTrackInfo[0])
    details.total = getClassText('time_total', domTrackInfo[0])

    const art = document.getElementById('tralbumArt');
    details.image = getImgSrc(art);

    if (domTrackTable) {
        const domTracks = domTrackTable.getElementsByClassName('track_row_view');
        if (domTracks && domTracks.length > 0) {
            let tracklist = [];
            // console.log('domTracks', domTracks);

            for (let i = 0; i < domTracks.length; i++) {
                const child = domTracks[i];

                let _track = {
                    track: '',
                    total: ''
                }

                const domTrackTitle = child?.getElementsByClassName('track-title');
                if (domTrackTitle && domTrackTitle.length > 0) {
                    _track.track = domTrackTitle[0].textContent.trim();
                }

                const domTrackTotal = child?.getElementsByClassName('time secondaryText');
                if (domTrackTotal && domTrackTotal.length > 0) {
                    _track.total = domTrackTotal[0].textContent.trim();
                }
                tracklist.push(_track);


            }

            details.tracklist = tracklist;
        }
    }
}

function getTrackInfo() {
    // if (domNameSection) {
    //     if (details.url.indexOf('/track/') !== -1) {
    //         // TRACK DETAILS 
    //         const domTrack = domNameSection.getElementsByClassName('trackTitle');
    //         if (domTrack && domTrack.length > 0) {
    //             details.track = domTrack[0].textContent.trim();
    //         }
    //         details.album = '';
    //     }
    // }
    const domNameSection = document.getElementById('name-section');
    const domTrackInfo = document.getElementsByClassName('track_info');

    details.track = getClassText('trackTitle', domNameSection);
    details.artist = getTagText('a', domNameSection);
    details.elapsed = getClassText('time_elapsed', domTrackInfo[0])
    details.total = getClassText('time_total', domTrackInfo[0])

    const art = document.getElementById('tralbumArt');
    details.image = getImgSrc(art);

    const time = getTrackElapsed();
    details.elapsed = time.elapsed;
    details.total = time.total;

    details.isPlaying = getPlayingStatus();
}


function fetchTrackInfo() {
    // console.log('fetchTrackInfo', bandcamp.location);
    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        getHomeInfo();
    }
    else if (bandcamp.location === 'album') {
        getAlbumInfo();
    }
    else if (bandcamp.location === 'track') {
        getTrackInfo();
    }


    // console.log('bandcamp fetchTrackInfo');
    // if (domNameSection) {
    //     if (details.url.indexOf('/track/') !== -1) {
    //         // TRACK DETAILS 
    //         const domTrack = domNameSection.getElementsByClassName('trackTitle');
    //         if (domTrack && domTrack.length > 0) {
    //             details.track = domTrack[0].textContent.trim();
    //         }
    //         details.album = '';
    //     }
    //     else if (details.url.indexOf('/album/') !== -1) {
    //         // ALBUM DETAILS
    //         const domAlbum = domNameSection.getElementsByClassName('trackTitle');
    //         if (domAlbum && domAlbum.length > 0) {
    //             details.album = domAlbum[0].textContent.trim();
    //         }

    //         // const domTrackInfo = document.getElementsByClassName('track_info');
    //         if (domTrackInfo && domTrackInfo.length > 0) {
    //             const domTitle = domTrackInfo[0].getElementsByClassName('title');
    //             if (domTitle && domTitle.length > 0) {
    //                 details.track = domTitle[0].textContent.trim();
    //             }
    //         }
    //     }


    //     const domArt = document.getElementById('tralbumArt');
    //     // console.log('domArt', domArt);
    //     if (domArt) {
    //         const domImg = domArt.getElementsByTagName('img');
    //         // console.log('domImg', domImg, domImg[0].src);
    //         if (domImg && domImg.length > 0) {
    //             details.image = domImg[0].src;
    //         }
    //     }

    //     const domSpan = domNameSection.getElementsByTagName('a');
    //     if (domSpan && domSpan.length > 0) {
    //         details.artist = domSpan[0].textContent.trim();
    //     }
    //     if (domTrackInfo && domTrackInfo.length > 0) {
    //         const domElapsed = domTrackInfo[0].getElementsByClassName('time_elapsed');
    //         if (domElapsed && domElapsed.length > 0) {
    //             details.elapsed = domElapsed[0].textContent.trim();
    //         }

    //         const domTotal = domTrackInfo[0].getElementsByClassName('time_total');
    //         if (domTotal && domTotal.length > 0) {
    //             details.total = domTotal[0].textContent.trim();
    //         }
    //     }
    // }

    // if (domTrackTable) {
    //     const domTracks = domTrackTable.getElementsByClassName('track_row_view');
    //     if (domTracks && domTracks.length > 0) {
    //         let tracklist = [];
    //         console.log('domTracks', domTracks);

    //         for (let i = 0; i < domTracks.length; i++) {
    //             const child = domTracks[i];

    //             let _track = {
    //                 track: '',
    //                 total: ''
    //             }

    //             const domTrackTitle = child?.getElementsByClassName('track-title');
    //             if (domTrackTitle && domTrackTitle.length > 0) {
    //                 _track.track = domTrackTitle[0].textContent.trim();
    //             }

    //             const domTrackTotal = child?.getElementsByClassName('time secondaryText');
    //             if (domTrackTotal && domTrackTotal.length > 0) {
    //                 _track.total = domTrackTotal[0].textContent.trim();
    //             }
    //             tracklist.push(_track);


    //         }

    //         details.tracklist = tracklist;
    //     }
    // }
}

function getPlayingStatus() {
    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        const player = document.getElementById('carousel-player');
        if (player) {
            const btnPause = player.getElementsByClassName('pause');
            if (btnPause && btnPause.length > 0) {
                // console.log('btnPause', btnPause[0].style.display);
                if (btnPause[0].style.display !== 'none') {
                    return true;
                }
            }
        }
    }
    else if (bandcamp.location === 'album' || bandcamp.location === 'track') {
        const trackInfo = document.getElementById('trackInfo');
        if (trackInfo) {
            const playing = trackInfo.getElementsByClassName('playbutton playing');
            if (playing && playing.length > 0) {
                return true;
            }
        }
    }
    return false;
}

function getTrackElapsed() {

    let time = {
        elapsed: 0,
        total: 0,
    }


    if (bandcamp.location === 'user' || bandcamp.location === 'wishlist') {
        const player = document.getElementById('carousel-player');
        if (player) {
            const parent = player.getElementsByClassName('pos-dur');
            if (parent && parent.length > 0) {
                const elapsed = parent[0].getElementsByTagName('span');
                if (elapsed && elapsed.length > 0) {
                    time.elapsed = elapsed[0].textContent.trim();
                    time.total = elapsed[1].textContent.trim();
                }
            }
        }
    }
    else if (bandcamp.location === 'album' || bandcamp.location === 'track') {
        const trackInfo = document.getElementById('trackInfo');
        if (trackInfo) {
            time.elapsed = getClassText('time_elapsed', trackInfo);
            time.total = getClassText('time_total', trackInfo);
        }
    }

    return time;
}


function getClassText(name, parent) {
    if (name) {
        if (parent) {
            const child = parent.getElementsByClassName(name);
            if (child && child.length > 0) {
                return child[0].textContent.trim();
            }
        }
        else {
            const child = document.getElementsByClassName(name);
            if (child && child.length > 0) {
                return child[0].textContent.trim();
            }
        }
    }
    return '';
}

function getIdText(id, parent) {
    if (id) {
        if (parent) {
            const child = parent.getElementById(id);
            if (child) {
                return child.textContent.trim();
            }
        }
        else {
            const child = document.getElementById(id);
            if (child) {
                return child.textContent.trim();
            }
        }
    }
    return '';
}

function getTagText(tag, parent) {
    if (tag && parent) {
        const child = parent.getElementsByTagName(tag);
        if (child && child.length > 0) {
            return child[0].textContent.trim();
        }
    }
}

function getImgSrc(parent) {
    if (parent) {
        const child = parent.getElementsByTagName('img');
        if (child && child.length > 0) {
            return child[0].src;
        }
    }
}


navigator.mediaSession.setActionHandler('previoustrack', () => {
    /* Your code to play the previous track. */
    previousTrack();
});
navigator.mediaSession.setActionHandler('nexttrack', () => {
    /* Your code to play the next track. */
    nextTrack();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    const messageObject = JSON.parse(message);
    console.log(messageObject.type, messageObject.data);

    if (messageObject.type === 'bandcamp.gotourl') {

        if( messageObject.data.url ) {
            window.setTimeout(() => {
                window.location.href = messageObject.data.url;
            }, 2000)
        }
        else {
            nextTrack();
        }



        // console.log('message', message);
        // console.log('sender', sender);
        // console.log('sendResponse', sendResponse);

        // if (message === 'getTrackInfo') {
        //     fetchTrackInfo();
        //     console.log('bandcamp response', { ...details });
        //     sendResponse({ ...details });
        // }
    }
    else if (messageObject.type === 'bandcamp.play') {
        playTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'bandcamp.pause') {
        pauseTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'bandcamp.previous') {
        previousTrack();
        sendResponse(true);
    }
    else if (messageObject.type === 'bandcamp.next') {
        nextTrack();
        sendResponse(true);
    }
    else {
        // window.alert(`message not handled ${message}`)
    }
});
// }



init();