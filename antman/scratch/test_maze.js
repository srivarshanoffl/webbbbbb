const candidateF = [
  '#############', // 0
  '#S..#...#..2#', // 1: S at (1,1), choice to go right or down
  '#.#.###.#.#.#', // 2: vertical bus lines
  '#...#1#.#.#.#', // 3: 1 tucked into central logic block at (5,3)
  '###.#.E.###.#', // 4: E at (6,4) with entry from above or below
  '#...#.#...#.#', // 5: horizontal interconnects
  '#.###.###.#.#', // 6: lower barrier
  '#3......#..4#', // 7: 3 at (1,7), 4 at (11,7)
  '#############'  // 8
];

function test(grid, name) {
  const H = grid.length;
  const W = grid[0].length;
  let start = null;
  const nodes = {};
  let regulator = null;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = grid[y][x];
      if (ch === 'S') start = [x, y];
      else if (['1', '2', '3', '4'].includes(ch)) nodes[ch] = [x, y];
      else if (ch === 'E') regulator = [x, y];
    }
  }

  function bfs(from, to) {
    const queue = [[from[0], from[1], 0]];
    const visited = new Set([`${from[0]},${from[1]}`]);
    while (queue.length > 0) {
      const [x, y, dist] = queue.shift();
      if (x === to[0] && y === to[1]) return dist;
      const neighbors = [
        [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] !== '#' && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          queue.push([nx, ny, dist + 1]);
        }
      }
    }
    return -1;
  }

  console.log(`\n=== ${name} ===`);
  grid.forEach((row, idx) => console.log(`${idx}: ${row}`));

  const allTargets = ['1', '2', '3', '4', 'E'];
  let allReachable = true;
  for (const t of allTargets) {
    const targetPos = t === 'E' ? regulator : nodes[t];
    const dist = bfs(start, targetPos);
    console.log(`Dist S -> ${t}: ${dist}`);
    if (dist === -1) allReachable = false;
  }

  const nodeKeys = ['1', '2', '3', '4'];
  for (const k of nodeKeys) {
    const d = bfs(nodes[k], regulator);
    console.log(`Dist ${k} -> E: ${d}`);
  }

  console.log(allReachable ? 'STATUS: OK' : 'STATUS: UNREACHABLE BLOCKED');
  return allReachable;
}

test(candidateF, 'Candidate F');
