export default class GridSystem {
    constructor({ rows, cols, cellWidth, cellHeight, originX, originY }) {
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.originX = originX;
        this.originY = originY;
        this.occupancy = new Map();
    }

    getSnap(x, y) {
        const col = Math.floor((x - (this.originX - this.cellWidth / 2)) / this.cellWidth);
        const row = Math.floor((y - (this.originY - this.cellHeight / 2)) / this.cellHeight);

        if (!this.isInside(row, col)) {
            return null;
        }

        return {
            row,
            col,
            ...this.getCellCenter(row, col)
        };
    }

    getCellCenter(row, col) {
        return {
            x: this.originX + (col * this.cellWidth),
            y: this.originY + (row * this.cellHeight)
        };
    }

    isInside(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    getKey(row, col) {
        return `${row}-${col}`;
    }

    isOccupied(row, col) {
        return this.occupancy.has(this.getKey(row, col));
    }

    getOccupant(row, col) {
        return this.occupancy.get(this.getKey(row, col));
    }

    occupy(row, col, entity) {
        this.occupancy.set(this.getKey(row, col), entity);
    }

    vacate(row, col) {
        this.occupancy.delete(this.getKey(row, col));
    }

    draw(scene) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const { x, y } = this.getCellCenter(row, col);

                scene.add.rectangle(x, y, this.cellWidth - 4, this.cellHeight - 4, 0xffffff, 0.1)
                    .setInteractive()
                    .on('pointerdown', (pointer) => {
                        scene.events.emit('grid-cell-selected', this.getSnap(pointer.worldX, pointer.worldY));
                    });
            }
        }
    }
}
