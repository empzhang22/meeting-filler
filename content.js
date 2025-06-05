const SLOP = 5;

const wait = ms => new Promise(r => setTimeout(r, ms));

async function autoClickAllCells() {
    const cells = [...document.querySelectorAll('#YouGridSlots > div > div')];

    for (const cell of cells) {
        cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        await wait(SLOP);

        cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        await wait(SLOP);
    }

    console.log(`clicked ${cells.length} cells with ${SLOP} ms pacing`);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== 'AUTOFILL_W2M') return;

    const timer = setInterval(() => {
        const grid = document.getElementById('YouGrid');
        if (grid && window.getComputedStyle(grid).display !== 'none') {
            clearInterval(timer);
            autoClickAllCells().then(() => sendResponse({ done: true }));
        }
    }, 500);

    return true;
});
