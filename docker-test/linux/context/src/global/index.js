#!/usr/bin/env node
// @flow
const {spawn} = require('child_process');

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
        if (identifier === arg) {
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

const listProcessedWin = (parsedOptions) => {
  return new Promise((res, rej) => {
    var listPidBatPath = require.resolve(`${__dirname}/../../scripts/win/list-pid.bat`);
    let portOption = parsedOptions.filter((option) => {
      return option.name === "port";
    })[0];
    console.log(`executing ${listPidBatPath} with arg:\n ${JSON.stringify(portOption)}`);
    const command = spawn(listPidBatPath, [`${portOption.value}`]);
    command.stdout.on('data', (data) => {
      console.log(`process stdout:\n ${data}`);
    });
    command.stderr.on('data', (data) => {
      console.log(`process stderr:\n ${data}`);
    });
    command.on('close', (code) => {
      if (code === 0) {
        res(`process exited with code ${code}`);
      } else {
        rej(`process exited with code ${code}`);
      }
    });
  });
};

const listProcesses = (parsedOptions) => {
  let platform = process.platform;
  if (platform === "win32") {
    console.error(`platform ${platform} is supported`);
    return listProcessedWin(parsedOptions);
  } else {
    console.error(`platform ${platform} not supported yet`);
    return Promise.reject(`platform ${platform} not supported yet`);
  }
};

const run = () => {
  let argv = process.argv;
  console.log(`running with arguments: \n ${argv.join("\n")}`);
  let argvOptions = getArgvOptions();
  let parsedOptions = parseArgv(argv, argvOptions);
  console.log(`parsed options: \n ${JSON.stringify(parsedOptions, null, 4)}`);
  return listProcesses(parsedOptions).catch(e => {
    console.error(e);
    process.exit(1);
  });
};

run();
