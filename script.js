const GRID_WIDTH = 8;
const GRID_HEIGHT = 15;
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT
const IMAGE_SIZE = 50;
const CANVAS_WIDTH = GRID_WIDTH * IMAGE_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * IMAGE_SIZE;

class Tile {
    constructor(image_path, image_size, sides) {
        this.img = new Image(image_size, image_size);
        this.img.src = image_path;
        let nesw = sides.split(" ");
        this.sides = {
            "north": nesw[0],
            "east": nesw[1],
            "south": nesw[2],
            "west": nesw[3]
        };
    }
}

console.log(`Grid size is ${CANVAS_WIDTH / IMAGE_SIZE} x ${CANVAS_HEIGHT / IMAGE_SIZE}`)

// Get grid canvas and its context
const canvas = document.getElementById('grid');
const context = canvas.getContext("2d");
// Style the grid
context.canvas.width = CANVAS_WIDTH;
context.canvas.height = CANVAS_HEIGHT;
canvas.style.backgroundColor = 'rgba(255, 0, 0, 1)';
canvas.style.border = '1px solid #000000';

// Numbers for the grid
context.fillStyle = "grey"
for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
        context.fillText(`${x + y * GRID_WIDTH}`, x * IMAGE_SIZE + IMAGE_SIZE / 2, y * IMAGE_SIZE + IMAGE_SIZE / 2)
    }
}

let tiles = []
tiles.push(new Tile('./tiles/tile0.png', IMAGE_SIZE, 'www www www www'))
tiles.push(new Tile('./tiles/tile1.png', IMAGE_SIZE, 'wbw wbw wbw wbw'))
tiles.push(new Tile('./tiles/tile2.png', IMAGE_SIZE, 'www wbw wbw wbw'))
tiles.push(new Tile('./tiles/tile3.png', IMAGE_SIZE, 'www wbw www wbw'))
tiles.push(new Tile('./tiles/tile4.png', IMAGE_SIZE, 'www www wbw wbw'))
tiles.push(new Tile('./tiles/tile5.png', IMAGE_SIZE, 'www www www wbw'))
tiles.push(new Tile('./tiles/tile6.png', IMAGE_SIZE, 'wbw www wbw wbw'))
tiles.push(new Tile('./tiles/tile7.png', IMAGE_SIZE, 'wbw wbw www wbw'))
tiles.push(new Tile('./tiles/tile8.png', IMAGE_SIZE, 'wbw wbw wbw www'))
tiles.push(new Tile('./tiles/tile9.png', IMAGE_SIZE, 'wbw www wbw www'))
tiles.push(new Tile('./tiles/tile10.png', IMAGE_SIZE, 'wbw www www wbw'))
tiles.push(new Tile('./tiles/tile11.png', IMAGE_SIZE, 'wbw wbw www www'))
tiles.push(new Tile('./tiles/tile12.png', IMAGE_SIZE, 'www wbw wbw www'))
tiles.push(new Tile('./tiles/tile13.png', IMAGE_SIZE, 'wbw www www www'))
tiles.push(new Tile('./tiles/tile14.png', IMAGE_SIZE, 'www wbw www www'))
tiles.push(new Tile('./tiles/tile15.png', IMAGE_SIZE, 'www www wbw www'))

// Generate an array for grid and initialize values to undefined
let grid = Array(GRID_SIZE).fill(undefined)
let entropies = Array(GRID_SIZE).fill(tiles.length);


function placeTileOnGrid(tile, x, y) {
    if (!grid[x + y * GRID_WIDTH]) {
        context.drawImage(tile.img, x * IMAGE_SIZE, y * IMAGE_SIZE);
        grid[x + y * GRID_WIDTH] = tile;
        entropies[x + y * GRID_WIDTH] = Infinity;
        // console.log(`Placed tile ${tile.img.src.substring(28)} on ${x} ${y} `);
    } else {
        console.log(`Cannot place tile on ${x} ${y}, spot already taken`);
    }
}


/**
 * Algorithm:
 *  While every spots entropy is not the same:
 *      - Calculate all entropies
 *      - Pick one spot with minimal entropy
 *      - Place a suitable tile on the chosen spot
 * 
 */
function initWaveFunctionCollapse() {
    while (!entropies.every(e => e === entropies[0])) {
        // Calculate entropies
        calculate_entropies()

        // Get sport with smallest entropy
        let new_idx = entropies.indexOf(Math.min(...entropies))
        let new_x = new_idx % GRID_WIDTH
        let new_y = Math.floor(new_idx / GRID_WIDTH) % GRID_HEIGHT 
        // console.log(`Smallest entropy on index ${new_idx} with an entropy of ${entropies[new_idx]}`)

        // Get tile that can go there and place it
        _, valid_tiles = getEntropy(new_idx)
        placeTileOnGrid(valid_tiles[Math.floor(Math.random() * valid_tiles.length)], new_x, new_y)
    }
    console.log("Done!")
}


function calculate_entropies() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            let idx = x + y * GRID_WIDTH
            entropies[idx], _ = getEntropy(idx)
        } 
    }
}


function getEntropy(idx) {
    if (entropies[idx] === Infinity)
        return Infinity;
    
    let north;
    let east;
    let south;
    let west;

    // Get south side of tile on top
    if (idx >= GRID_WIDTH && grid[idx-GRID_WIDTH]) {
        north = grid[idx-GRID_WIDTH].sides['south'];
    }

    // Get west side of tile on right
    if (idx % (GRID_WIDTH - 1) != 0 && grid[idx+1]) {
        east = grid[idx+1].sides['west'];
    }

    // Get north side of tile below
    if (idx < GRID_SIZE - GRID_WIDTH && grid[idx+GRID_WIDTH]) {
        south = grid[idx+GRID_WIDTH].sides['north'];
    }

    // Get east side of tile on left
    if (idx % GRID_WIDTH && grid[idx-1]) {
        west = grid[idx-1].sides['east'];
    }

    // Get entropy by checking how many tiles could go here
    return whatCanGoHere(north, west, south, east);


}


function whatCanGoHere(n, w, s, e) {
    let entropy = 0;
    let valid_tiles = [];
    tiles.forEach((tile) => {
        let num = 0
        if (!n || n === tile.sides['north']) {
            num++;
        }
        if (!w || w === tile.sides['west']) {
            num++;
        }
        if (!s || s === tile.sides['south']) {
            num++;
        }
        if (!e || e === tile.sides['east']) {
            num++;
        }
        if (num === 4) {
            entropy++;
            valid_tiles.push(tile);
        }
    })
    return entropy, valid_tiles;
}


// Button that initializes wave function collapse
const btn = document.getElementById('generate-button');
btn.addEventListener('click', () => {
    // Reset grid and entropies
    grid = Array(GRID_SIZE).fill(undefined);
    entropies = Array(GRID_SIZE).fill(tiles.length);
    // Place initial random tile on random spot
    let x = (Math.floor(Math.random() * (CANVAS_WIDTH / IMAGE_SIZE)))
    let y = (Math.floor(Math.random() * (CANVAS_HEIGHT / IMAGE_SIZE)))
    let idx = Math.floor(Math.random() * tiles.length)
    placeTileOnGrid(tiles[idx], x, y)
    // Start WFC
    initWaveFunctionCollapse()
});


// Button that generates a totally random grid
const btnGenerateRandomGrid = document.getElementById('generate-random-grid');
btnGenerateRandomGrid.addEventListener('click', () => {
    // Reset grid
    grid = Array(GRID_SIZE).fill(undefined);
    entropies = Array(GRID_SIZE).fill(tiles.length);
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            let idx = Math.floor(Math.random() * tiles.length)
            placeTileOnGrid(tiles[idx], x, y)
        } 
    }
});


// Clicking the canvas prints the color that was clicked.
// For debugging purposes.
canvas.addEventListener('click', event => {
    const bounding = canvas.getBoundingClientRect();
    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;
    console.log(context.getImageData(x, y, 1, 1).data);
});