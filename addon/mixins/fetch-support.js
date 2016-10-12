import Ember from 'ember';

const {
  $,
  Mixin,
  inject: { service },
  get, set
} = Ember;

// added in ember 2.5
let assign = Ember.assign;
if (!assign) {
  assign = (original, ...args) => {
    return args.reduce(Ember.merge, original);
  };
}

function isFastBoot() {
  return typeof FastBoot !== 'undefined';
}

export default Mixin.create({
  fastboot: service(),
  cookies: service(),
  fetch: service(),

  _convertDataToQueryString(data) {
    let qs;
    if (isFastBoot()) {
      // currently fastboot checks the filesystem for every require
      // so do our own caching
      // https://github.com/ember-fastboot/fastboot/issues/86
      let querystring = get(this, '_querystring');
      if (!querystring) {
        querystring = FastBoot.require('querystring');
        set(this, '_querystring', querystring);
      }
      qs = querystring.stringify(data);
    } else {
      qs = $.param(data);
    }
    return qs;
  },

  _createCookieString() {
    let cookies = get(this, 'fastboot.request.cookies');

    let cookie = Object.keys(cookies).map(key => {
      let value = get(cookies, key);
      return `${key}=${value}`;
    });

    return cookie.join('; ');
  },

  _createInit(type, headers) {
    headers = assign({}, get(this, 'headers'), headers);

    let init = {
      method: type,
      headers
    };

    if (isFastBoot()) {
      headers.cookie = this._createCookieString();
    } else {
      init.credentials = 'include';
    }

    return init;
  },

  ajax(url, type, options) {
    let qs = this._convertDataToQueryString(options.data);
    url += `?${qs}`;

    let init = this._createInit(type, options.headers);

    return get(this, 'fetch').fetch(url, init).then(response => {
      return response.json();
    });
  }
});
