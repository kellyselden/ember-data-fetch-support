import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import fetchMock from 'npm:fetch-mock';

moduleForAcceptance('Acceptance | application', {
  afterEach() {
    fetchMock.restore();
  }
});

test('visiting /', function(assert) {
  fetchMock.get('/users/1', {
    'data': {
      'type': 'user',
      'id': '1',
      'attributes': {
        'name': 'my test name'
      }
    }
  });

  visit('/');

  andThen(function() {
    assert.equal(find('.ember-view').text().trim(), 'my test name');
  });
});
