#!/usr/bin/env node

require('../dist/index.js')
  .run()
  .catch((error) => {
    // ExitError from OCLIF is thrown when this.error() is called
    // It already displays the error message, so we just exit with the code
    if (error.oclif && error.oclif.exit !== undefined) {
      process.exit(error.oclif.exit);
    }

    // For other errors, display them
    console.error(error);
    process.exit(1);
  });
