
// console.log('popup');

const domPopupLink = document.getElementById('popupLink');
if( domPopupLink ) {
    console.log('check', chrome.runtime.id);
    const url = `chrome-extension://${chrome.runtime.id}/index.html`
    domPopupLink.href = url;
}
