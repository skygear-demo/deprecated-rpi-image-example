# Create your first Skygear IoT application

In this tutorial, we will create a system with 3 parts:

- Devices will save a temperature reading to the Skygear Cloud Database on request
- Server will request a reading from devices every 5 minutes using a PubSub channel
- If the reported temperature is higher than 70C, the server will broadcast a warning.

## Client-Side Code

First we will create a user application on the RespberryPi. In the `/home/pi/skygear-iot`
directory create a folder named `user-app` and a file named `package.json` inside with the
following contents:

```
{
  "name": "user-app",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "skygear": "^0.22.1"
  }
}

```
This file contains metadata about your user application which will be loaded by the
Skygear IoT Client. Next, create a file named `index.js` inside `user-app` with the
following contents:

```
const skygear = require('skygear');
const skygearIot = require('../skygear-iot.js');

const TemperatureRecord = skygear.Record.extend('temperature');

async function main() {
  console.log('Waiting for temperature requests...');
  while(true) {
    await skygearIot.pubsub.one('request-temperature');
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
```

Your file structure would now look something like this:

```
/home/pi/skygear-iot
├── config.json
├── ...
└── user-app
    ├── index.js
    └── package.json

```

Now restart the Skygear IoT client using `sudo systemctl restart skygear-iot` and it should
load your newly created application:

```

```

The device is now ready, we can set it aside and begin configuring the server.

Before proceeding any further, you should familiarize yourself with Skygear Cloud Code
by following the [Cloud Code Introduction Guide][skygear-cloud-code].

## Scheduled Tasks using Cloud Code

In an empty folder on your computer, create a file named `__init__.py` with the following
contents:

```
import skygear
from skygear.pubsub import publish

@skygear.every('@every 5m')
def request_temperature():
    publish('request-temperature', {})

```

The `request_temperature` function will be called every 5 minutes and publish a request event.
Deploy this code to your skygear server to see it in action, you should be able to see
temperature readings from your device in 5 minutes after the server has restarted successfully.

## Database Event Hooks using Cloud Code

Now we will add one more function to `__init__.py` to check if the reported temperatures are
higher than 70C:

```
import skygear
from skygear.pubsub import publish

@skygear.every('@every 5m')
def request_temperature():
  publish('request-temperature', {})

@skygear.after_save('temperature')
def check_temperature(record):
  if record['temperature'] > 70:
    publish('high-temperature', {
      'device':       record['created_by'],
      'temperature':  record['temperature']})

```

[skygear-cloud-code]: https://docs.skygear.io/guides/cloud-function/intro-and-deployment/python/ 
