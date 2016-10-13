# ember-data-fetch-support

[![npm version](https://badge.fury.io/js/ember-data-fetch-support.svg)](https://badge.fury.io/js/ember-data-fetch-support)
[![Build Status](https://travis-ci.org/kellyselden/ember-data-fetch-support.svg?branch=master)](https://travis-ci.org/kellyselden/ember-data-fetch-support)

Replaces `$.ajax` with `fetch` in [`ember-data`](https://github.com/emberjs/data). Functions as a mixin for `ember-data` adapters. Uses [`ember-network`](https://github.com/tomdale/ember-network) for FastBoot support.

## Installation

`ember install ember-data-fetch-support`

## Usage

```js
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import FetchSupport from 'ember-data-fetch-support/mixins/fetch-support';

export default JSONAPIAdapter.extend(FetchSupport);
```
