<h1>Misc. Developer Notes:</h1>

<u><h3>5/29</h3></u>

Site layout:
```
<div id="AvailabilityGrids">
<div> (no class)
<div class="HalfPanel">
<div id="YouAvailability">
<div id="LeftPanel">
(after signing in), <div id="YouGrid">
<div> (third div)
(read contents for dates, every other div besides YouGridSlots), <div id="YouGridSlots">
```

Then, each div is a row of the times.

Each cell has 
- ontouchstart="SelectToHereByTouch(event)"
- ontouchmove="SelectToHereByTouch(event)"
- ontouchend="SelectStopByTouch(event)"
Each day and time also has id="YouTime###" and data-time="###", in which ### corresponds to a Unix time block"

`document.querySelectorAll('#YouGrid > div')[1]`: The list of times available
`document.querySelectorAll('#YouGrid > div')[2]`: The rest of the grid for users to interact with
```
const target = document.querySelectorAll('#YouGrid > div')[2];

const children = Array.from(target.children);

// Get all but the last
const dateDivs = children.slice(0, -1);

// Get just the last
const gridDiv = children[children.length - 1];

console.log("Date divs:", dateDivs);
console.log("Grid div:", gridDiv);
```

This is what I need to use to access all but the last (the dates) and the last (the clickable grid)

<u><h3>5/30</h3></u>

```
document.querySelectorAll('#YouGridSlots > div > div').forEach(cell => {
    const time = new Date(parseInt(cell.dataset.time, 10) * 1000);
    const col = parseInt(cell.dataset.col, 10);
    const row = parseInt(cell.dataset.row, 10);

    console.log(`${time.toLocaleString()} | col ${col}, row ${row}`);
});

```

Accessing each specific time slot and logging the time of each block

```
const youGrid = document.getElementById('YouGrid');
const isVisible = window.getComputedStyle(youGrid).display !== 'none';

console.log(isVisible ? 'YouGrid is visible' : 'YouGrid is hidden');
```

Can check first that "YouGrid" is not style="display:none" to ensure that the user has indeed signed in
