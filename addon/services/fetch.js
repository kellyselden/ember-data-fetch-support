import Ember from 'ember';
import _fetch from 'ember-network/fetch';

const {
  Service
} = Ember;

function isFastBoot() {
  return typeof FastBoot !== 'undefined';
}

// node-fetch doesn't polyfill global fetch, unlike GitHub's fetch
// in order to mock global fetch in the tests AND support FastBoot,
// we must unify by making node-fetch global
if (isFastBoot() || !window.fetch) {
  window.fetch = _fetch;
}

export default Service.extend({
  fetch() {
    return fetch(...arguments);
  }
});
