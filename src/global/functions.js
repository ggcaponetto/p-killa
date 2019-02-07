#!/usr/bin/env node
// @flow
const {spawn} = require('child_process');
const {fork} = require('child_process');


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
    // console.log(`processing arg: \n ${arg}`);
    argvOptions.forEach((argvOption) => {
      // console.log(`processing argvOption: \n ${JSON.stringify(argvOption, null, 4)}`);
      let runsWithOption = false;
      argvOption.identifiers.forEach(identifier => {
        if (identifier === arg) {
          runsWithOption = true;
        }
      });
      // console.log(`runs with option ${argvOption.name} (${argvOption.identifiers.join(" or ")}): ${runsWithOption}`);
      if (runsWithOption) {
        options.push({...argvOption, value: argv[argIndex + 1]});
      }
    });
  });
  return options;
};

const startHttpServer = (port, relPath, ready) => {
  return new Promise((res, rej) => {
    try {
      console.log(`executing "${"http-server"}" module. starting server on port ${port}`);
      let httpServerPath = require.resolve(`${__dirname}/../../node_modules/http-server/bin/http-server`);
      let httpServerDirectoryToServe = require.resolve(`${__dirname}/${relPath}`);
      let shellCommand = `node ${httpServerPath} ${httpServerPath} -p ${port} ${httpServerDirectoryToServe}`;
      console.log(`executing: "${shellCommand}"`);
      const command = spawn(
        shellCommand,
        {
          shell: true,
          stdio: "ignore",
          detached: true
        } //https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
      );
      command.on('data', (data) => {
        console.log(`process stdout:\n ${data.toString()}`);
      });
      command.on('close', (code) => {
      });
      /*
      If the unref function is called on the detached process, the parent process can exit independently of the child.
      This can be useful if the child is executing a long-running process, but to keep it running in the background the
      child’s stdio configurations also have to be independent of the parent.
      */
      command.unref();
      res(command);
    } catch (e) {
      console.error(e);
      rej(e.message);
    }
  });
};

const listProcesses = (parsedOptions) => {
  const listProcessedWin = (parsedOptions) => {
    let output = [];
    return new Promise((res) => {
      var listPidBatPath = require.resolve(`${__dirname}/../../scripts/win/list-pid.bat`);
      let portOption = parsedOptions.filter((option) => {
        return option.name === "port";
      })[0];
      let shellCommand = `${listPidBatPath} ${portOption.value}`;
      console.log(`executing: "${shellCommand}"`);
      const command = spawn(
        shellCommand,
        {
          shell: true
        } //https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
      );
      command.stdout.on('data', (data) => {
        console.log(`process stdout:\n ${data}`);
        output.push(data.toString());
      });
      command.on('close', (code) => {
        console.log(`process close:\n ${code}`);
        res({command, output});
      });
    });
  };
  const listProcessedLinux = (parsedOptions) => {
    let output = [];
    return new Promise((res) => {
      var listPidBatPath = require.resolve(`${__dirname}/../../scripts/linux/list-pid.sh`);
      let portOption = parsedOptions.filter((option) => {
        return option.name === "port";
      })[0];
      let shellCommand = `${listPidBatPath} ${portOption.value}`;
      console.log(`executing: "${shellCommand}"`);
      const command = spawn(
        shellCommand,
        {
          shell: true
        });
      command.stdout.on('data', (data) => {
        console.log(`process stdout:\n ${data}`);
        output.push(data.toString());
      });
      command.stderr.on('data', (data) => {
        console.log(`process stderr:\n ${data}`);
      });
      command.on('close', (code) => {
        console.log(`process close:\n ${code}`);
        res({command, output});
      });
    });
  };
  let platform = process.platform;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    return listProcessedWin(parsedOptions);
  } else if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    return listProcessedLinux(parsedOptions);
  } else {
    console.warn(`platform ${platform} might not be supported. applying linux shell commands and syntax`);
    try {
      return listProcessedLinux(parsedOptions);
    } catch (e) {
      console.error(`platform ${platform} is not supported`);
      console.error(e);
    }
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
    // process.exit(1);
    process.exit(0);
  });
};

module.exports = {
  startHttpServer,
  listProcesses,
  getArgvOptions,
  parseArgv,
  run
};
