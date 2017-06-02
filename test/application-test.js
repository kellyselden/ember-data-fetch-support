'use strict';

const expect = require('chai').expect;
const RSVP = require('rsvp');
const request = RSVP.denodeify(require('request'));
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('Acceptance | FastBoot', function() {
  this.timeout(300000);

  let app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy', {
      fixturesPath: 'tests'
    }).then(() => {
      return app.runEmberCommand(
        'install',
        `ember-cli-fastboot@${process.env.npm_package_devDependencies_ember_cli_fastboot}`,
        `ember-network@${process.env.npm_package_devDependencies_ember_network}`
      );
    }).then(() => {
      return app.startServer();
    });
  });

  after(function() {
    return app.stopServer();
  });

  it('can find the fetch global', function() {
    return request({
      url: 'http://localhost:49741',
      headers: { 'Accept': 'text/html' }
    }).then(response => {
      expect(response.body).to.contain('Error: only absolute urls are supported');
    });
  });
});
