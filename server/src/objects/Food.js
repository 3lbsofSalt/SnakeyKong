function createFood(x, y, size) {
    const food = {
        position: {
            x,
            y,
        },
        size,
    };

    return food;
}

exports.createFood = createFood;
