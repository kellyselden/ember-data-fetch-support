import Ember from 'ember';
import 'ember-network/fetch';

const {
  Service
} = Ember;

export default Service.extend({
  fetch() {
    return fetch(...arguments);
  }
});
