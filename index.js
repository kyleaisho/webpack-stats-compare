const fs = require('fs');
const process = require('process');

const SPACING = '  ';

function getStatsPath() {
  const [ _, __, prev, curr ] = process.argv;

  return { prev, curr };
}

function readStats(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);

      resolve(JSON.parse(data));
    })
  })
}

function getChunks(stats) {
  return stats['chunks'];
}

function createModuleMap(chunk) {
  const { modules } = chunk;
  const moduleMap = {};

  modules.forEach(({ identifier }) => moduleMap[identifier] = identifier);

  return moduleMap;
}

function getDiff(oldChunkMap, newChunkMap) {
  const diff = {};

  Object.keys(oldChunkMap).forEach(chunkName => {
    const oldChunk = oldChunkMap[chunkName];
    const newChunk = newChunkMap[chunkName];

    if (newChunk) {
      Object.keys(oldChunk).forEach(moduleName => {
        const oldModules = oldChunk[moduleName];
        const newModules = newChunk[moduleName];

        if (!newModules) {
          if (!diff[chunkName]) diff[chunkName] = {}
          if (!diff[chunkName].removed) diff[chunkName].removed = [];

          diff[chunkName].removed.push(oldModules);
        }
      });
    }
  });

  Object.keys(oldChunkMap).forEach(chunkName => {
    const oldChunk = oldChunkMap[chunkName];
    const newChunk = newChunkMap[chunkName];

    if (newChunk) {
      Object.keys(newChunk).forEach(moduleName => {
        const oldModules = oldChunk[moduleName];
        const newModules = newChunk[moduleName];

        if (!oldModules) {
          if (!diff[chunkName]) diff[chunkName] = {};
          if (!diff[chunkName].added) diff[chunkName].added = [];

          diff[chunkName].added.push(newModules)
        };
      });
    }
  });

  return diff;
}

function printDiff(diff) {
  Object.keys(diff).forEach((chunkName) => {
    const chunkDiff = diff[chunkName];
    const { added = [], removed = [] } = chunkDiff;
    console.log(`${chunkName}:`);
    console.log(`${SPACING}Number of modules moved into chunk: ${added.length}`);
    console.log(`${SPACING}Number of modules moved out chunk: ${removed.length}`);

    if (added.length) {
      console.log(`${SPACING}Modules moved into chunk:`);
      added.forEach(name => console.log(`${SPACING.repeat(2)}${name}`));
    }
    if (removed.length) {
      console.log(`${SPACING}Modules moved out of chunk:`);
      removed.forEach(name => console.log(`${SPACING.repeat(2)}${name}`));
    }
  });
}

(function main() {
  const { prev, curr } = getStatsPath();

  const getChunkMaps = (data) => {
    const chunkMap = {};
    const chunks = getChunks(data);
    chunks.forEach(chunk => {
      if (chunk.names.length) {
        // If a chunk name exists create a map of its modules
        chunkMap[chunk.names[0]] = createModuleMap(chunk);
      }
    });

    return chunkMap;
  };

  Promise.all([readStats(prev), readStats(curr)]).then(
    (values) => {
      const [ oldStats, newStats ] = values;

      const diff = getDiff(getChunkMaps(oldStats), getChunkMaps(newStats));

      printDiff(diff);
    },
    (values) => {
      console.error(values);
    });
}());