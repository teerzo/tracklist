

// function Foo() {
//     document.body.style.backgroundColor = 'red';
// }

// chrome.action.onClicked.addListener((tab) => {
//     if(!tab.url.includes('chrome://')) {
//         chrome.scripting.executeScript({
//             target: {tabId: tab.id},
//             function: Foo
//         });
//     }
// });



// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, { greeting: "getSongInfo" }, function (response) {
//         console.log('getSongInfo', response);
//         if (response) {
//             const { artist, song, image, url } = response;
//             // setCurrentSong({ artist, song, image, url });
//         }
//         return true;
//     });

// chrome.runtime.sendMessage('getSongInfo', (response) => {
//     // chrome.tabs.sendMessage('getSongInfo', (response) => {
//     console.log('getSongInfo', response);
//     if (response) {
//         const { artist, song, image, url } = response;
//         // setCurrentSong({ artist, song, image, url });
//     }
// });
// });



// (async () => {
//     const tabs = await chrome.tabs.query({active: true});
//     console.log('tabs', tabs);

//     const tab = tabs.filter((tab) => { return tab.audible === true });
//     console.log('tab', tab);

//     if( tab ) {
//         const response = await chrome.tabs.sendMessage(tab.id, 'getSongInfo');
//         console.log('getSongInfo response', response);
//         // const response = await chrome.runtime.sendMessage('getSongInfo');
//         // do something with response here, not outside the function
//     }

// })();

let details = {
    source: '',
    artist: '',
    album: '',
    track: '',
    trackNumber: '',
    url: '',
    image: '',
    elapsed: '0:00',
    total: '0:00',
    isPlaying: false,
}

let lastTab = {};

let tracklist = [];

let queue = [
    // { track: 'Test', url: 'https://twitter.com' }
];


function addToQueue(newQueue) {
    if (queue && queue.length >= 0) {
        if (newQueue && newQueue.length > 0) {
            for (let i = 0; i < newQueue.length; i++) {
                let match = false;
                for (let q = 0; q < queue.length; q++) {
                    if (queue[q].url === newQueue[i].url) {
                        match = true;
                    }
                }
                if (!match) {

                    
                    addTrackToQueue(newQueue[i]);
                    // queue.push(newQueue[i]);
                }
            }
        }
    }
}

function addTrackToQueue(track) {

    let newTrack = {
        ...track,
        played: false,
    }

    queue.push(newTrack);
}

async function getQueueData() {

    const url = "http://localhost:3000/tracklist/queue";
    try {
        const response = await fetch(url);
        console.log('getQueueData', response);
        // if (!response.ok) {
        //     throw new Error(`Response status: ${response.status}`);
        // }

        const json = await response.json();
        console.log(json);

        if (json.queue) {
            addToQueue(json.queue);
        }

    } catch (error) {
        console.log(error);
    }

}

async function updateQueueList(details) {

    if( details?.url) {

        for( let i = 0; i < queue.length; i++ ) {
            if( queue[i].url === details.url) {
                queue[i].played = true;
            }
        }
    }
}



const handleOpenSidePanel = () => {
    chrome.windows.getCurrent({ populate: true }, (window) => {
        chrome.sidePanel.open({ windowId: window.id });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        console.log('message', message, sender);



        if (message.action === 'open_side_panel') {
            // chrome.sidePanel.open({ windowId: windowId });
            handleOpenSidePanel();
        }
        else {
            const messageObject = JSON.parse(message);
            console.log(messageObject.type, messageObject.data);

            // SOUNDCLOUD
            if (messageObject.type === 'soundcloud.start') {
                // details = { ...messageObject.data };

                const msg = JSON.stringify({ type: 'bandcamp.pause' });
                if (lastTab) {
                    console.log('bandcamp.pause', lastTab);
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }

                lastTab = sender.tab;
            }
            if (messageObject.type === 'soundcloud.update') {
                details = { ...messageObject.data };

                const msg = JSON.stringify({ type: 'sidepanel.update', data: { ...details } });
                chrome.runtime.sendMessage(msg);

                const bcMsg = JSON.stringify({ type: 'bandcamp.pause' });
                if (lastTab) {
                    console.log('bandcamp.pause', lastTab);
                    chrome.tabs.sendMessage(lastTab.id, bcMsg);
                }

                lastTab = sender.tab;
            }
            else if (messageObject.type === 'soundcloud.paused') {

                details = { ...messageObject.data };
                const msg = JSON.stringify({ type: 'sidepanel.paused', data: { ...details } });
                chrome.runtime.sendMessage(msg);
                lastTab = sender.tab;
            }
            else if (messageObject.type === 'soundcloud.play') {
                const msg = JSON.stringify({ type: 'soundcloud.play' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'soundcloud.pause') {
                const msg = JSON.stringify({ type: 'soundcloud.pause' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'soundcloud.previous') {
                const msg = JSON.stringify({ type: 'soundcloud.previous' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'soundcloud.next') {
                const msg = JSON.stringify({ type: 'soundcloud.next' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }

            // BANDCAMP
            else if (messageObject.type === 'bandcamp.start') {
                // details = { ...messageObject.data };

                const msg = JSON.stringify({ type: 'soundcloud.pause' });
                if (lastTab) {
                    console.log('soundcloud.pause', lastTab);
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }

                lastTab = sender.tab;
            }
            else if (messageObject.type === 'bandcamp.update') {
                details = { ...messageObject.data };

                getQueueData();
                updateQueueList(details);

                
                const msg = JSON.stringify({ type: 'sidepanel.update', data: { details: { ...details }, queue: queue } });
                chrome.runtime.sendMessage(msg);

                const scMsg = JSON.stringify({ type: 'soundcloud.pause' });
                if (lastTab) {
                    console.log('soundcloud.pause', lastTab);
                    chrome.tabs.sendMessage(lastTab.id, scMsg);
                }


                lastTab = sender.tab;
            }
            else if (messageObject.type === 'bandcamp.paused') {
                lastTab = sender.tab;

                details = { ...messageObject.data };
                const msg = JSON.stringify({ type: 'sidepanel.paused', data: { ...details } });
                chrome.runtime.sendMessage(msg);
            }
            else if (messageObject.type === 'bandcamp.finish') {
                lastTab = sender.tab;

                // sendResponse(queue[0]);
                const msg = JSON.stringify({ type: 'bandcamp.gotourl', data: { ...queue[0] } });
                console.log('send message', msg);

                chrome.tabs.sendMessage(sender.tab.id, msg);
                // chrome.runtime.sendMessage(msg);
            }


            else if (messageObject.type === 'bandcamp.play') {
                const msg = JSON.stringify({ type: 'bandcamp.play' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'bandcamp.pause') {
                const msg = JSON.stringify({ type: 'bandcamp.pause' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'bandcamp.previous') {
                const msg = JSON.stringify({ type: 'bandcamp.previous' });
                if (lastTab) {
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
            else if (messageObject.type === 'bandcamp.next') {
                const msg = JSON.stringify({ type: 'bandcamp.next' });
                if (lastTab) {
                    console.log('bandcamp.next', lastTab);
                    chrome.tabs.sendMessage(lastTab.id, msg);
                }
            }
        }
    })();
});

