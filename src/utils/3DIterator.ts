



export function iterateCube(expr: (x: number, y: number, z: number) => void, dims: number) {
    for (var x = 0; x < dims; x++) {
        for (var y = 0; y < dims; y++) {
            for (var z = 0; z < dims; z++) {
                expr(x, y, z);
            }
        }
    }
}

