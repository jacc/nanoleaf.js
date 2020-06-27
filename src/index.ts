import { NanoleafClient } from './NanoleafClient';

const client = new NanoleafClient({
  host: '192.168.1.2',
  token: 'xtgAfyZTCvssd8yWsUGn0xuZuPN83OsI',
});

client.turnOff().then(console.log);
