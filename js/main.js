const hashcode = require('./hashcode');
const optimize = require('./optimize');

const setup = hashcode.loadFile(process.argv[2]);
setup.rows = optimize.placeServers(setup.rows, setup.servers);
const result = optimize.optimize(setup.rows, setup.servers, setup.parameters, setup.pools);
setup.pools = result.pools;
console.log('setup:', setup);
console.log(hashcode.display(setup.rows));
console.log('score:', result.score);
