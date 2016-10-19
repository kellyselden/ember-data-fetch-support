import Ember from 'ember';
import FetchSupportMixin from 'ember-data-fetch-support/mixins/fetch-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

const {
  $,
  RSVP: { resolve }
} = Ember;

const url = 'test/url';
const query = 'test=query';

let type;
let sandbox;
let jsonResponse;
let fetch;
let subject;
let data;
let options;
let param;
let require;
let stringify;

module('Unit | Mixin | fetch support', {
  beforeEach() {
    sandbox = sinon.sandbox.create();

    jsonResponse = {};
    fetch = sandbox.stub().returns(resolve({
      json() {
        return jsonResponse;
      }
    }));

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
      }
    });
    subject = FetchSupportObject.create();

    type = 'TEST_METHOD';
    data = {
      test: 'data'
    };
    options = {
      data,
      headers: {
        test: 'request'
      }
    };
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
  return subject.ajax(url, type, options);
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

  assert.strictEqual(fetch.args[0][0], `${url}?${query}`);
});

test('it appends data to url as query string when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.strictEqual(fetch.args[0][0], `${url}?${query}`);
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

  assert.deepEqual(options, {
    data: {
      test: 'data'
    },
    headers: {
      test: 'request'
    }
  });
});

test('it handles method type', function(assert) {
  ajax();

  assert.strictEqual(fetch.args[0][1].method, type);
});

test('it sets cookie credentials when not fastboot', function(assert) {
  ajax();

  assert.strictEqual(fetch.args[0][1].credentials, 'include');
});

test('it sets cookie header when fastboot', function(assert) {
  turnOnFastBoot();

  ajax();

  assert.strictEqual(
    fetch.args[0][1].headers.cookie,
    'test=cookie; test2=another cookie'
  );
});

test('it returns json from fetch', function(assert) {
  return ajax().then(result => {
    assert.strictEqual(result, jsonResponse);
  });
});

test('it passes the data as body and not qs for PUT', function(assert) {
  type = 'PUT';
  return ajax().then(() => {
    assert.strictEqual(fetch.args[0][1].body, data);
    assert.strictEqual(fetch.args[0][0], url);
  });
});

test('it passes the data as body and not qs for POST', function(assert) {
  type = 'POST';
  return ajax().then(() => {
    assert.strictEqual(fetch.args[0][1].body, data);
    assert.strictEqual(fetch.args[0][0], url);
  });
});
