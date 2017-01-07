const hashcode = require('./hashcode');
const optimize = require('./optimize');

const setup = hashcode.loadFile(process.argv[2]);
setup.rows = optimize.placeServers(setup.rows, setup.servers);
console.log('setup:', setup);
