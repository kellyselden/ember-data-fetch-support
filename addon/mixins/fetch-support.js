import Ember from 'ember';

const {
  $,
  Mixin,
  inject: { service },
  computed,
  getOwner,
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

function parseHeaders(headers) {
  let newHeaders = {};
  headers.forEach((val, key) => {
    newHeaders[key] = val;
  });
  return newHeaders;
}

export default Mixin.create({
  fetch: service(),

  fastboot: computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }),

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

  _createInit(type, headers, body) {
    headers = assign({}, get(this, 'headers'), headers);

    let init = {
      method: type,
      headers
    };

    if (body) {
      init.body = body;
    }

    if (isFastBoot()) {
      headers.cookie = this._createCookieString();
    } else {
      init.credentials = 'include';
    }

    return init;
  },

  _handleResponse(url, type, response) {
    return response.json().then(json => {
      response = this.handleResponse(
        response.status,
        parseHeaders(response.headers),
        json,
        {
          url,
          method: type
        }
      );

      if (response.isAdapterError) {
        throw response;
      }

      return response;
    });
  },

  ajax(url, type, options) {
    let body;
    switch (type) {
      case 'PUT':
      case 'POST':
        body = options.data;
        break;
      default:
        let qs = this._convertDataToQueryString(options.data);
        if (qs) {
          url += `?${qs}`;
        }
    }

    let init = this._createInit(type, options.headers, body);

    return get(this, 'fetch').fetch(url, init).then(response => {
      return this._handleResponse(url, type, response);
    });
  }
});
