#!/usr/bin/env node

import { push } from "./commands/push";

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
