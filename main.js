

let currentWindow = null;
let currentTab = null;
let currentTitle = '';


// async function onWindowChange(windowId) {
//     // console.log('onWindowChange', windowId);
//     document.getElementById('windowId').innerText = windowId
//     getActiveTab(windowId);
// }

// async function onTabActive(windowId, tabId) {
//     // console.log('onTabActive', tabId);
//     getTab(windowId, tabId);
// }

// async function onTabChange(tab) {
//     // console.log('onTabChange', tabId);

//     // getTabTitle(currentWindow, tabId);
//     setTitle(tab);
// }


// async function getActiveTab(windowId) {
//     // console.log('getActiveTab', windowId);

//     chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
//         const tab = tabs[0];
//         setTitle(tab);
//     });
// }

// async function getTab(windowId, tabId) {
//     // console.log('getTab', windowId, tabId);

//     chrome.tabs.query({ tabId: tabId, windowId: windowId }, (tabs) => {
//         const tab = tabs[0];
//         setTitle(tab);
//     });

// }

// async function setTitle(tab) {
//     // console.log('setTitle', tab.title, tab);



//     document.getElementById('title').innerText = tab.title;
// }

// async function getTabTitle(windowId, tabId) {

//     chrome.tabs.query({ tabId: tabId }, (tabs) => {
//         // chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
//         const tab = tabs[0];
//         document.getElementById('tabId').innerText = tab.id;

//         currentTitle = tab.title;
//         document.getElementById('title').innerText = currentTitle;



//         // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         // console.log('tabs', tabs);
//         // currentTitle = tabs[0].title;
//         // console.log('tab', tabs[0]);
//     })
// }

// // document.addEventListener('DOMContentLoaded', onLoad);

// chrome.windows.onFocusChanged.addListener((windowId) => {
//     // console.log('onFocusChanged', windowId);
//     // onWindowChange(windowId);
// });

// chrome.tabs.onActivated.addListener((activeInfo) => {
//     // console.log('onActivated', activeInfo);
//     // console.log('activeInfo', activeInfo);
//     // getTabTitle(activeInfo.windowId);
//     // onTabActive(activeInfo.tabId);
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     // console.log('onUpdated', tabId, changeInfo, tab);
//     // onTabChange(tab);
// });

// //     (tabId) => {
// //     console.log('tabId', tabId);
// //     chrome.tabs.get(tabId, (tab) => {
// //         console.log('tab', tab);
// //         currentTitle = tab.title;
// //         document.getElementById('title').innerText = currentTitle;
// //     })
// // });



// // chrome.scripting.registerContentScript([{
// //     id: "session-script",
// //     js: ["contentScripts.js"],
// //     runAt: "document_idle",
// // }])
// // .then(() => console.log('contentScripts.js loaded'))
// // .error((error) => console.error(error));


async function onLoad() {
    console.log('onLoad');

    // const currentWindow = await chrome.windows.getCurrent();
    // console.log('currentWindow', currentWindow);

    chrome.runtime.sendMessage('getSongInfo', (response) => {
    // chrome.tabs.sendMessage('getSongInfo', (response) => {
        console.log('getSongInfo', response);
    });
}

function setCurrentSong({ artist, song, image, url }) {
    if( artist ) {
        document.getElementById('artist').innerText = artist;
    }
    if( song ) {
        document.getElementById('song').innerText = song;
    }
    if( image) {
        document.getElementById('image').src = image;
    }
    if( url ) {
        document.getElementById('url').innerText = url;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    console.log('sender', sender);
    console.log('sendResponse', sendResponse);

    const { artist, song, image, url } = message;

    if (message === 'getTabInfo') {
        sendResponse({ tabId: currentTab.id, title: currentTab.title });
    }
    else if( artist && song && image && url) {
        setCurrentSong({artist, song, image, url});
    }
    return true;
});

document.addEventListener('DOMContentLoaded', onLoad);
