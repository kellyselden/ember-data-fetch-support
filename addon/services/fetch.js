import Ember from 'ember';
import fetch from 'ember-network/fetch';

const {
  Service
} = Ember;

export default Service.extend({
  fetch() {
    return fetch(...arguments);
  }
});
