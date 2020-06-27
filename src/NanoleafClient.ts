import fetch, { Response } from 'node-fetch';

type NanoleafClientConstructorOptions = {
  host: string;
  port?: number;
  base?: string;
  token: string;
};

export class NanoleafClient {
  host: string;
  port: number;
  base: string;
  token: string;
  baseURL: string;

  /**
   * Initiates the class
   * @constructor
   * @param options Options object
   */
  constructor(options: NanoleafClientConstructorOptions) {
    this.host = options.host;
    this.port = options.port || 16021;
    this.base = options.base || '/api/v1/';
    this.token = options.token;
    this.baseURL = `http://${this.host}:${this.port}${this.base}${this.token}`;

    this.resolveFetch = this.resolveFetch.bind(this);
  }

  resolveFetch<T>(x: Response): Promise<T | boolean> {
    if (x.ok) return x.status === 204 ? Promise.resolve(true) : x.json();
    return Promise.resolve(false);
  }

  get(path: string): Promise<any | false> {
    return fetch(`${this.baseURL}${path ? path : '/'}`).then(this.resolveFetch);
  }

  put(path: string, body: any): Promise<any | false> {
    return fetch(`${this.baseURL}${path ? path : '/'}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then(this.resolveFetch);
  }

  /**
   * Get status of connected Nanoleaf product
   */
  getStatus() {
    return this.get(`/`);
  }

  /**
   * Identify the Nanoleaf product. Flashes product twice with green color, used to make sure connection to product is active
   */
  identify() {
    return this.get(`/identify`);
  }

  /**
   * Turn Nanoleaf product on
   */
  turnOn() {
    return this.put(`/state`, {
      on: { value: true },
    });
  }

  /**
   * Turn Nanoleaf product off
   */
  turnOff() {
    return this.put(`/state`, {
      on: { value: false },
    });
  }

  /**
   * Get current brighness value of the Nanoleaf product. Returns 0-100.
   */
  getBrightness() {
    return this.get(`/state/brightness`);
  }

  /**
   * Get current hue value of the Nanoleaf product. Returns 0-360.
   */
  getHue() {
    return this.get(`/state/hue`);
  }

  /**
   * Get current saturation value of the Nanoleaf product. Returns 0-100.
   */
  getSaturation() {
    return this.get(`/state/sat`);
  }

  /**
   * Get current color temperature of the Nanoleaf product. Supposed to return 1200-6500, instead returns 0-100.
   */
  getTemperature() {
    return this.get(`/state/ct`);
  }

  /**
   * Get array of effects installed on the Nanoleaf product
   */
  getEffects() {
    return this.get('/effects/effectsList') as Promise<string[]>;
  }

  /**
   * Sets the brightness of the Nanoleaf product
   * @param value The brightness from 0-100.
   */
  setBrightness(value: number) {
    return this.put(`/state`, {
      brightness: { value },
    });
  }

  /**
   * Sets the hue of the Nanoleaf product
   * @param value The hue from 0-100.
   */
  setHue(value: number) {
    return this.put(`/state`, {
      hue: { value },
    });
  }

  /**
   * Sets the saturation of the Nanoleaf product
   * @param value The saturation from 0-100.
   */
  setSaturation(value: number) {
    return this.put(`/state`, {
      sat: { value },
    });
  }

  /**
   * Sets color temperature of the Nanoleaf product
   * @param value The temperature between 0-100. Supposed to be 1200-6500 however API only accepts 0-100.
   */
  setTemperature(value: number) {
    return this.put(`/state`, {
      ct: { value },
    });
  }

  /**
   * Set Nanoleaf product to specified effect
   * @param select The effect. Case sensitive.
   */
  setEffect(select: string) {
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

    const response = result.reduce((results, res: { key: string; data: any }) => {
      const { key, data } = res;
      return { ...results, [key]: data };
    }, {}) as { [key in keyof typeof requests]: any };

    return response;
  }

  /**
   * Generates a new client
   * @param options The options object
   */
  static from(options: NanoleafClientConstructorOptions) {
    return new NanoleafClient(options);
  }
}
