const skygear = require('skygear');
const skygearIot = require('../skygear-iot.js');

const TemperatureRecord = skygear.Record.extend('temperature');

async function main() {
  console.log('Waiting for temperature requests...');
  while(true) {
    await skygearIot.pubsub.one('request-temp');
    // randomly generate a temperature between 30-80
    // because we don't have a physical sensor connected
    const temperature = 30 + 50 * Math.random();
    skygear.publicDB.save(
      new TemperatureRecord({temperature})
    );
    console.log(`Temperature Sent: ${temperature}C`);
  }
}

module.exports = main();
