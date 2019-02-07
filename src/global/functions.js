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

const startHttpServer = (port, relPath) => {
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
        console.log(`process cloded with exit code ${code.toString()}`);
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

const listProcessesOnPortWin = (port) => {
  let processTag = `listProcessesOnPortWin`;
  let output = [];
  return new Promise((res) => {
    let listPidBatPath = require.resolve(`${__dirname}/../../scripts/win/list-pid.bat`);
    let shellCommand = `${listPidBatPath} ${port}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(
      shellCommand,
      {
        shell: true
      } //https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
    );
    command.stdout.on('data', (data) => {
      console.log(`process "${processTag}" having pid ${command.pid} stdout:\n ${data}`);
      output.push(data.toString());
    });
    command.stderr.on('data', (data) => {
      console.log(`process "${processTag}" having pid ${command.pid} stderr:\n ${data}`);
    });
    command.on('close', (code) => {
      console.log(`process "${processTag}" having pid ${command.pid} cloded with exit code ${code}`);
      res({command, output});
    });
  });
};

const listProcessesOnPortLinux = (port) => {
  let processTag = `listProcessesOnPortLinux`;
  let output = [];
  return new Promise((res) => {
    var listPidBatPath = require.resolve(`${__dirname}/../../scripts/linux/list-pid.sh`);
    let shellCommand = `${listPidBatPath} ${port}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(
      shellCommand,
      {
        shell: true
      });
    command.stdout.on('data', (data) => {
      console.log(`process "${processTag}" having pid ${command.pid} stdout:\n ${data}`);
      output.push(data.toString());
    });
    command.stderr.on('data', (data) => {
      console.log(`process "${processTag}" having pid ${command.pid} stderr:\n ${data}`);
    });
    command.on('close', (code) => {
      console.log(`process "${processTag}" having pid ${command.pid} cloded with exit code ${code}`);
      res({command, output});
    });
  });
};

const listProcessesOnPort = (port) => {
  let platform = process.platform;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    return listProcessesOnPortWin(port);
  } else if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    return listProcessesOnPortLinux(port);
  } else {
    console.warn(`platform ${platform} might not be supported. applying linux shell commands and syntax.`);
    try {
      return listProcessesOnPortLinux(port);
    } catch (e) {
      console.error(`platform ${platform} is not supported`);
      console.error(e);
    }
  }
};

const getPidOfProcessOnPort = (port) => {
  let processListPromise = listProcessesOnPort(port);
  return processListPromise.then(({command, output}) => {
    console.info(`getPidOfProcessOnPort - the process list for processes listening on port ${port} is: \n type:${typeof output} \n${output}`);
      return output;
  });
};

const killProcesses = () => {
  let platform = process.platform;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    return null; //todo
  } else if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    return null; //todo
  } else {
    console.warn(`platform ${platform} might not be supported. applying linux shell commands and syntax.`);
    try {
      return null; //todo
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
  listProcessesOnPort,
  getPidOfProcessOnPort,
  getArgvOptions,
  parseArgv,
  run
};
