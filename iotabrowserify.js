//browserify version: 16.2.3, uglify version: uglify-js@3.5.15, iota.js version: @iota/core@1.0.0-beta.12

//command: browserify iotabrowserify.js --standalone window| uglifyjs > js/iota.js-browser.js

//license added on top of the resul

// global.bundle_validator = require('@iota/bundle-validator');
// global.bundle = require('@iota/bundle');
global.checksum = require('@iota/checksum');
global.converter = require('@iota/converter');
global.core = require('@iota/core');
// global.http_client = require('@iota/http-client');
// global.signing = require('@iota/signing');
// global.transaction_converter = require('@iota/transaction-converter');
// global.transaction = require('@iota/transaction');