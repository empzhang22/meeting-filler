function autoClickAllCells() {
    const cells = document.querySelectorAll('#YouGridSlots > div > div');

    cells.forEach(cell => {
        const downEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        cell.dispatchEvent(downEvent);
        cell.dispatchEvent(upEvent);
    });

    console.log(`Clicked ${cells.length} cells`);
}

function waitForLoginAndClick() {
    const interval = setInterval(() => {
        const grid = document.getElementById('YouGrid');
        if (grid && window.getComputedStyle(grid).display !== 'none') {
            clearInterval(interval);
            autoClickAllCells();
        }
    }, 1000);
}

waitForLoginAndClick();
