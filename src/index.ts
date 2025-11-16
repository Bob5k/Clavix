#!/usr/bin/env node

import { run as oclifRun, handle } from '@oclif/core';

export async function run(argv?: string[]) {
  return oclifRun(argv);
}

// Run if called directly
if (require.main === module) {
  run().catch(handle);
}
