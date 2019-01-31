#!/usr/bin/env node
// @flow

function run(){
  let argv = process.argv;
  console.log(`running with arguments: ${argv.join("\n")}`);
}

run();
