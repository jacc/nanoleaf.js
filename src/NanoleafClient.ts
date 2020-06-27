import { EventEmitter } from 'events';
import fetch from 'node-fetch';

type NanoleafClientConstructorOptions = {
  host: string;
  port?: number;
  base?: string;
  token: string;
};

export enum READY_STATES {
  notReady,
  ready,
}

export class NanoleafClient extends EventEmitter {
  host: string;
  port: number;
  base: string;
  token: string;
  baseURL: string;
  effects?: string[];
  readyState: READY_STATES;
  isFirstRequest: boolean = true;

  constructor(options: NanoleafClientConstructorOptions) {
    super();

    this.host = options.host;
    this.port = options.port || 16021;
    this.base = options.base || '/api/v1/';
    this.token = options.token;
    this.baseURL = `http://${this.host}:${this.port}${this.base}${this.token}`;
    this.readyState = READY_STATES.notReady;

    // you need this
    // this.getEffects().then((effects) => {
    //   this.effects = effects;
    //   this.readyState = READY_STATES.ready;
    //   this.emit('ready');
    // });

    this.getStatus().then(() => {
      this.readyState = READY_STATES.ready;
      this.emit('ready');
    });
  }

  checkReadyState() {
    if (this.readyState !== READY_STATES.ready && !this.isFirstRequest) {
      throw new Error('Instance is not ready just yet.');
    }

    this.isFirstRequest = false;
  }

  async get(path: string) {
    this.checkReadyState();
    return fetch(`${this.baseURL}${path ? path : '/'}`).then((x) => x.json());
  }

  async put(path: string, body: any) {
    this.checkReadyState();
    return fetch(`${this.baseURL}${path ? path : '/'}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((x) => {
      console.log(x);
      if (x.status === 204) {
      } else if (x.status === 400) {
        console.log(x.statusText);
      } else {
        x.json();
      }
    });
  }

  /**
   * Get status of connected Nanoleaf product
   */
  async getStatus() {
    return this.get(`/`);
  }

  /**
   * Turn Nanoleaf product on
   */
  async turnOn() {
    return this.put(`/state/on`, {
      on: { value: true },
    });
  }

  /**
   * Turn Nanoleaf product off
   */
  async turnOff() {
    return this.put(`/state/off`, {
      on: { value: false },
    });
  }

  async getBrightness() {
    return this.get(`/state/brightness`);
  }

  /**
   *  Get current hue value of the Nanoleaf product
   */
  async getHue() {
    return this.get(`/state/hue`);
  }

  /**
   * Get current saturation value of the Nanoleaf product
   */
  async getSaturation() {
    return this.get(`/state/sat`);
  }

  /**
   * Get current color temperature of the Nanoleaf product
   */
  async getTemperature() {
    return this.get(`/state/ct`);
  }

  /**
   * Get array of effects installed on the Nanoleaf product
   */
  async getEffects() {
    return this.get('/effects/effectsList') as Promise<string[]>;
  }

  /**
   * Sets the brightness of the Nanoleaf product
   * @param value The brightness from 0-100
   */
  async setBrightness(value: number) {
    return this.put(`/state`, {
      brightness: { value },
    });
  }

  /**
   * Sets the hue of the Nanoleaf product
   * @param value The hue from 0-100
   */
  async setHue(value: number) {
    return this.put(`/state`, {
      hue: { value },
    });
  }

  /**
   * Sets the saturation of the Nanoleaf product
   * @param value The saturation from 1-100
   */
  async setSaturation(value: number) {
    return this.put(`/state`, {
      sat: { value },
    });
  }

  /**
   * Set Nanoleaf product to specified effect
   * @param select The effect
   */
  async setEffect(select: string) {
    return this.put(`/effects`, { select });
  }

  /**
   * Fetches information on an installed Rythym module
   */
  async rythymInfo() {
    let result;

    const requests = {
      connected: this.get('/rhythm/rhythmConnected'),
      active: this.get('/rhythm/rhythmActive'),
      hwVersion: this.get('/rhythm/hardwareVersion'),
      fwVersion: this.get('/rhythm/firmwareVersion'),
      mode: this.get('/rhythm/rhythmMode'),
    } as const;

    try {
      result = await Promise.all(
        Object.entries(requests).map(async (item) => {
          const [key, promise] = item;
          return { key, data: await promise };
        })
      );
    } catch (error) {
      console.log(error);
      return null;
    }

    const response = result.reduce((results, res) => {
      const { key, data } = res;
      return { ...results, [key]: data };
    }, {}) as { [key in keyof typeof requests]: any };

    return response;
  }

  static from(options: NanoleafClientConstructorOptions): Promise<NanoleafClient> {
    return new Promise((r) => {
      const instance = new NanoleafClient(options);
      instance.on('ready', () => r(instance));
    });
  }
}
