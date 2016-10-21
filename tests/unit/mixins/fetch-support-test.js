import Ember from 'ember';
import FetchSupportMixin from 'ember-data-fetch-support/mixins/fetch-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

const {
  $,
  RSVP: { resolve },
  copy
} = Ember;

const url = 'test/url';
const query = 'test=query';
const getQuery = `${url}?${query}`;
const status = '12345';

let sandbox;
const jsonResponse = {
  test: 'test json response'
};
let fetch;
const handleResponseResponse = {
  test: 'test handleResponse respose'
};
let handleResponseResponseCopy;
let handleResponse;
let subject;
let type;
const data = {
  test: 'test data'
};
const options = {
  data: copy(data, true),
  headers: {
    test: 'request'
  }
};
let optionsCopy;
let param;
let require;
let stringify;

module('Unit | Mixin | fetch support', {
  beforeEach() {
    sandbox = sinon.sandbox.create();

    fetch = sandbox.stub().returns(resolve({
      status,
      headers: {
        forEach(func) {
          func('test response header value', 'test response header');
        }
      },
      json() {
        return resolve(copy(jsonResponse, true));
      }
    }));

    handleResponseResponseCopy = copy(handleResponseResponse, true);
    handleResponse = sandbox.stub().returns(handleResponseResponseCopy);

    let FetchSupportObject = Ember.Object.extend(FetchSupportMixin, {
      fetch: {
        fetch
      },
      headers: {
        test: 'global, will be overridden',
        test2: 'global'
      },
      fastboot: {
        request: {
          cookies: {
            test: 'cookie',
            test2: 'another cookie'
          }
        }
      },
      handleResponse
    });
    subject = FetchSupportObject.create();

    type = 'TEST_METHOD';

    optionsCopy = copy(options, true);

    param = sandbox.stub($, 'param');
    param.withArgs(data).returns(query);
  },
  afterEach() {
    sandbox.restore();

    delete window.FastBoot;
  }
});

function turnOnFastBoot() {
  require = sandbox.stub();
  stringify = sandbox.stub();

  require.withArgs('querystring').returns({
    stringify
  });
  stringify.withArgs(data).returns(query);

  window.FastBoot = {
    require
  };
}

function ajax() {
  return subject.ajax(url, type, optionsCopy);
}

test('it calls jquery param for query string when not fastboot', function(assert) {
  ajax();

  assert.ok(param.calledOnce);
});

test('it calls require for querystring when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.ok(require.calledOnce);
});

test('it caches require result when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();
  ajax();

  assert.ok(require.calledOnce);
});

test('it calls querystring stringify for query string when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.ok(stringify.calledOnce);
});

test('it only calls fetch once', function(assert) {
  ajax();

  assert.ok(fetch.calledOnce);
});

test('it appends data to url as query string when not fastboot', function(assert) {
  ajax();

  assert.strictEqual(fetch.args[0][0], getQuery);
});

test('it appends data to url as query string when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.strictEqual(fetch.args[0][0], getQuery);
});

test('it merges global and request headers', function(assert) {
  ajax();

  assert.deepEqual(fetch.args[0][1].headers, {
    test: 'request',
    test2: 'global'
  });
});

test('it doesn\'t modify passed in options', function(assert) {
  ajax();

  assert.deepEqual(optionsCopy, options);
});

test('it handles method type', function(assert) {
  ajax();

  assert.strictEqual(fetch.args[0][1].method, type);
});

test('it sets cookie credentials when not fastboot', function(assert) {
  ajax();

  assert.strictEqual(fetch.args[0][1].credentials, 'include');
});

test('it doesn\'t set cookie credentials when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.notOk('credentials' in fetch.args[0][1]);
});

test('it sets cookie header when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.strictEqual(
    fetch.args[0][1].headers.cookie,
    'test=cookie; test2=another cookie'
  );
});

test('it doesn\'t set cookie header when not fastboot', function(assert) {
  ajax();

  assert.notOk('cookie' in fetch.args[0][1].headers);
});

test('it passes the data as body for PUT', function(assert) {
  type = 'PUT';

  ajax();

  assert.deepEqual(fetch.args[0][1].body, data);
});

test('it doesn\'t pass the data as qs for PUT', function(assert) {
  type = 'PUT';

  ajax();

  assert.strictEqual(fetch.args[0][0], url);
});

test('it passes the data as body for POST', function(assert) {
  type = 'POST';

  ajax();

  assert.deepEqual(fetch.args[0][1].body, data);
});

test('it doesn\'t pass the data as qs for POST', function(assert) {
  type = 'POST';

  ajax();

  assert.strictEqual(fetch.args[0][0], url);
});

test('it calls handleResponse', function(assert) {
  return ajax().then(() => {
    assert.deepEqual(handleResponse.args, [[
      status,
      {
        'test response header': 'test response header value'
      },
      jsonResponse,
      {
        url: getQuery,
        method: type
      }
    ]]);
  });
});

test('it throws if isAdapterError is true', function(assert) {
  handleResponseResponseCopy.isAdapterError = true;

  let anotherCopy = copy(handleResponseResponseCopy, true);

  return ajax().catch(result => {
    assert.deepEqual(result, anotherCopy);
  });
});

test('it returns json from fetch', function(assert) {
  return ajax().then(result => {
    assert.deepEqual(result, handleResponseResponse);
  });
});
