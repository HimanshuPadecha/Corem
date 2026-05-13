#!/usr/bin/env node

import "tsconfig-paths/register.js";
import { push } from "./commands/push.js";

const command = process.argv[2];

switch (command) {
  case "push": {
    push();
    break;
  }

  default: {
    console.log("Unknown command !!");
  }
}
