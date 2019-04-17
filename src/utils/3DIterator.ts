



export function iterateCube(
    expr: (x: number, y: number, z: number) => void, dims: number) {
  for (let x = 0; x < dims; x++) {
    for (let y = 0; y < dims; y++) {
      for (let z = 0; z < dims; z++) {
        expr(x, y, z);
      }
    }
  }
}
