# nanoleaf.js

### A typesafe, unopinionated Nanoleaf client for Node

```
 _____________
< nanoleaf.js >
 -------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
```

## Usage

Get the IP of your Nanoleaf product via your router's Admin panel, then use `yarn authorization` or `npm run authorization` to get your authorization token.

### Constructor Options

```ts
host: string; // IP address of Nanoleaf product
token: string; // Authorization token from Nanoleaf product
port?: number; // Defaults to 16021
base?: string; // Defaults to /api/v1
```

### TypeScript

```ts
import { NanoleafClient } from 'nanoleaf.js';

const client = new NanoleafClient({
  host: 'Nanoleaf IP address',
  token: 'Authorization token',
});

client.turnOff().then(console.log);
```

### JavaScript

```js
const nanoleaf = import('nanoleaf.js');

const client = new nanoleaf.NanoleafClient({
  host: 'Nanoleaf IP address',
  token: 'Authorization token',
});

client.turnOff().then(console.log);
```
