var expect = require('chai').expect;
var RSVP = require('rsvp');
var request = RSVP.denodeify(require('request'));
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('Acceptance | FastBoot', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy', {
      fixturesPath: 'tests'
    }).then(function() {
      app.editPackageJSON(function(pkg) {
        pkg['devDependencies']['ember-cli-fastboot'] = '1.0.0-beta.13';
        pkg['devDependencies']['ember-network'] = process.env.npm_package_devDependencies_ember_network;
      });
      return app.run('npm', 'install');
    }).then(function() {
      return app.startServer({
        command: 'fastboot',
        additionalArguments: ['--serve-assets']
      });
    });
  });

  after(function() {
    return app.stopServer();
  });

  it('can find the fetch global', function() {
    return request('http://localhost:49741')
      .then(function(response) {
        expect(response.body).to.contain('Error: only absolute urls are supported');
      });
  });
});
