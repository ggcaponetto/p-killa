#!/usr/bin/env node
// @flow

const getArgvOptions = () => {
  let options = [
    {
      name: "port",
      identifiers: [
        "--port", "-p"
      ]
    }
  ];
  return options;
};

const parseArgv = (argv, argvOptions) => {
  let options = [];
  argv.forEach((arg, argIndex) => {
    console.log(`processing arg: \n ${arg}`);
    argvOptions.forEach((argvOption) => {
      console.log(`processing argvOption: \n ${JSON.stringify(argvOption, null, 4)}`);

      let runsWithOption = false;
      argvOption.identifiers.forEach(identifier => {
        if(identifier === arg){
          runsWithOption = true;
        }
      });
      console.log(`runs with option ${argvOption.name} (${argvOption.identifiers.join(" or ")}): ${runsWithOption}`);
      if (runsWithOption) {
        options.push({...argvOption, value: argv[argIndex + 1]});
      }
    });
  });
  return options;
};

const run = () => {
  let argv = process.argv;
  console.log(`running with arguments: \n ${argv.join("\n")}`);
  let argvOptions = getArgvOptions();
  let parsedOptions = parseArgv(argv, argvOptions);
  console.log(`parsed options: \n ${JSON.stringify(parsedOptions, null, 4)}`);
};

run();
