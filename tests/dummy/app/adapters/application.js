import JSONAPIAdapter from 'ember-data/adapters/json-api';
import FetchSupport from 'ember-data-fetch-support/mixins/fetch-support';

export default JSONAPIAdapter.extend(FetchSupport);
