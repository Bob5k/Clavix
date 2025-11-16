#!/usr/bin/env node

require('../dist/index.js')
  .run()
  .catch(require('@oclif/core/handle'));
