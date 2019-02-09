#!/usr/bin/env node
const {spawn} = require("child_process");
const chalk = require('chalk');
// const { fork } = require("child_process");

const getArgvOptions = () => {
  const options = [
    {
      name: "help",
      identifiers: ["--help", "-h"]
    },
    {
      name: "ports",
      identifiers: ["--ports", "-pp"]
    },
    {
      name: "delayed",
      identifiers: ["--delayed", "-d"]
    }
  ];
  return options;
};

const parseArgv = (argv, argvOptions) => {
  const options = [];
  argv.forEach((arg, argIndex) => {
    // console.log(`processing arg: \n ${arg}`);
    argvOptions.forEach(argvOption => {
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
      console.log(
        `executing "${"http-server"}" module. starting server on port ${port}`
      );
      const httpServerPath = require.resolve(
        `${__dirname}/../../node_modules/http-server/bin/http-server`
      );
      const httpServerDirectoryToServe = require.resolve(
        `${__dirname}/${relPath}`
      );
      const shellCommand = `node ${httpServerPath} ${httpServerPath} -p ${port} ${httpServerDirectoryToServe}`;
      console.log(`executing: "${shellCommand}"`);
      const command = spawn(
        shellCommand,
        {
          shell: true,
          stdio: "ignore",
          detached: true
        } // https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
      );
      command.on("data", data => {
        console.log(`process stdout:\n ${data.toString()}`);
      });
      command.on("close", code => {
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

const listProcessesOnPortWin = port => {
  const functionTag = `listProcessesOnPortWin`;
  const output = [];
  return new Promise(res => {
    const listPidBatPath = require.resolve(
      `${__dirname}/../../scripts/win/list-pid.bat`
    );
    const shellCommand = `${listPidBatPath} ${port}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(
      shellCommand,
      {
        shell: true
      } // https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
    );
    command.stdout.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${functionTag}" having pid ${
          command.pid
          } cloded with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const listProcessesOnPortLinux = port => {
  const functionTag = `listProcessesOnPortLinux`;
  const output = [];
  return new Promise(res => {
    const listPidBatPath = require.resolve(
      `${__dirname}/../../scripts/linux/list-pid.sh`
    );
    const shellCommand = `${listPidBatPath} ${port}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(shellCommand, {
      shell: true
    });
    command.stdout.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${functionTag}" having pid ${
          command.pid
          } cloded with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const listProcessesOnPort = port => {
  const {platform} = process;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    return listProcessesOnPortWin(port);
  }
  if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    return listProcessesOnPortLinux(port);
  }
  try {
    console.warn(
      `platform ${platform} might not be supported. applying linux shell commands and syntax.`
    );
    return listProcessesOnPortLinux(port);
  } catch (e) {
    console.error(`platform ${platform} is not supported`);
    console.error(e);
    throw e;
  }
};

const extractPidFromOutput = output => {
  const {platform} = process;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    console.info(`extractPidFromOutput`, output);
    const line = output[0].trim();
    const columns = line.split(" ").filter(element => {
      return element.trim() !== "";
    });
    return parseInt(columns[4], 10);
  }
  if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    console.info(`extractPidFromOutput`, output);
    const line = output[0].trim();
    const columns = line.split(" ").filter(element => {
      return element.trim() !== "";
    });
    return parseInt(columns[6].split("/")[0], 10);
  }
  try {
    console.warn(
      `platform ${platform} might not be supported. applying linux shell commands and syntax.`
    );
    console.info(`platform ${platform} is supported`);
    console.info(`extractPidFromOutput`, output);
    const line = output[0].trim();
    const columns = line.split(" ").filter(element => {
      return element.trim() !== "";
    });
    return parseInt(columns[6].split("/")[0], 10);
  } catch (e) {
    console.error(`platform ${platform} is not supported`);
    console.error(e);
    throw e;
  }
};

const getPidOfProcessOnPort = port => {
  const processListPromise = listProcessesOnPort(port);
  return processListPromise.then(({output}) => {
    console.info(
      `getPidOfProcessOnPort - the process list for processes listening on port ${port} is: \n type:${typeof output} \n${output}`
    );
    return extractPidFromOutput(output);
  });
};

const killProcessesByPidLinux = pid => {
  const functionTag = `killProcessesByPidLinux`;
  const output = [];
  return new Promise(res => {
    const listPidBatPath = require.resolve(
      `${__dirname}/../../scripts/linux/kill-pid.sh`
    );
    const shellCommand = `${listPidBatPath} ${pid}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(shellCommand, {
      shell: true
    });
    command.stdout.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${functionTag}" having pid ${
          command.pid
          } closed with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const killProcessesByPidWin = pid => {
  const functionTag = `killProcessesByPidWin`;
  const output = [];
  return new Promise(res => {
    const listPidBatPath = require.resolve(
      `${__dirname}/../../scripts/win/kill-pid.bat`
    );
    const shellCommand = `${listPidBatPath} ${pid}`;
    console.log(`executing: "${shellCommand}"`);
    const command = spawn(
      shellCommand,
      {
        shell: true
      } // https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
    );
    command.stdout.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${functionTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${functionTag}" having pid ${
          command.pid
          } closed with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const killProcessByPid = pid => {
  const {platform} = process;
  if (platform === "win32") {
    console.info(`platform ${platform} is supported`);
    return killProcessesByPidWin(pid);
  }
  if (platform === "linux") {
    console.info(`platform ${platform} is supported`);
    return killProcessesByPidLinux(pid);
  }
  console.warn(
    `platform ${platform} might not be supported. applying linux shell commands and syntax.`
  );
  try {
    return killProcessesByPidLinux(pid);
  } catch (e) {
    console.error(`platform ${platform} is not supported`);
    console.error(e);
    throw e;
  }
};

const isArgsValid = parsedOptions => {
  const functionTag = "isArgsValid";
  console.log(`${functionTag} checking the arguments: \n ${JSON.stringify(parsedOptions, null, 4)}`);

  let help;
  try {
    help = parsedOptions.filter(option => {
      return option.name === "help";
    }).length > 0;
  } catch (e) {
    console.warn(chalk.cyan(`${functionTag}- help option`), e.message);
  }

  let delay;
  try {
    delay = parsedOptions.filter(option => {
      return option.name === "delay";
    })[0].value;
  } catch (e) {
    console.warn(chalk.cyan(`${functionTag} - delay option`), e.message);
  }

  let ports;
  try {
    ports = parsedOptions.filter(option => {
      return option.name === "ports";
    })[0].value;
  } catch (e) {
    console.warn(chalk.cyan(`${functionTag} - ports option`), e.message);
  }

  console.log(`${functionTag} checking the arguments`, {help, ports, delay});
  let isValidArguments = () => {
    let isValid = (
      (
        typeof ports !== "undefined" || typeof help !== "undefined"
      )
    );
    console.log(`${functionTag} checking the arguments - isValidArguments`, {isValidArguments: isValid});
    return isValid;
  };
  try {
    return isValidArguments();
  } catch (e) {
    console.warn(chalk.red(`${functionTag} - option error`), e.message);
    return false;
  }
};

const printUsage = () => {
  // let functionTag = "printUsage";
  const tabs = `        `;
  console.info(chalk.yellow("p-killa usage:"));
  console.info(chalk.yellow("p-killa [options]"));
  console.info(
    chalk.yellow(`--help (-h) ${tabs} Prints this.`)
  );
  console.info(
    chalk.yellow(`--ports (-pp) ${tabs} Multiple ports to kill, comma separated {string, required, e.g. 3002,8080,9000}`)
  );
  console.info(
    chalk.yellow(`--delay (-d) ${tabs} Delay the killing of the process by the passed amount of milliseconds (e.g. 2000)`)
  );
};

const killProcessesOnPort = async (port) => {
  let functionTag = "killProcessesOnPort";
  console.log(`${functionTag} killing process on port ${port}`);
  const pid = await getPidOfProcessOnPort(port);
  console.log(`${functionTag} the process on port ${port} has pid ${pid}`);
  return await killProcessByPid(pid);
};

const run = async () => {
  let functionTag = "run";
  const {argv} = process;
  console.log(`running with arguments: \n ${argv.join("\n")}`);

  let argvOptions;
  let parsedOptions;

  try {
    argvOptions = getArgvOptions();
    parsedOptions = parseArgv(argv, argvOptions);
    console.log(`parsed options: \n ${JSON.stringify(parsedOptions, null, 4)}`);
    const isValidOptions = isArgsValid(parsedOptions);
    if (isValidOptions === false) {
      throw new Error("invalid options passed to p-killa");
    } else {
      let help;
      try {
        help = parsedOptions.filter(option => {
          return option.name === "help";
        }).length > 0;
      } catch (e) {
        console.warn(chalk.cyan(`${functionTag}`), e);
      }

      let delay;
      try {
        delay = parsedOptions.filter(option => {
          return option.name === "delay";
        })[0].value;
      } catch (e) {
        console.warn(chalk.cyan(`${functionTag}`), e);
      }

      let ports;
      try {
        ports = parsedOptions.filter(option => {
          return option.name === "ports";
        })[0].value;
      } catch (e) {
        console.warn(chalk.cyan(`${functionTag}`), e);
      }

      console.log(chalk.green("you are runing with options:"), {help, delay, ports});
      if(help){
        console.log(chalk.green("i'm happy to help you.."));
        printUsage();
        process.exit(1);
      } else if (typeof port !== "undefined") {
        console.error(chalk.blue(`${functionTag} killing single port ${ports}`));
        return await killProcessesOnPort(parsedOptions);
      } else if (typeof ports !== "undefined") {
        let portsArray = ports.split(",").map((e) => parseInt(e.trim(), 10));
        console.error(chalk.blue(`${functionTag} killing multiple ports ${ports}`));
        let killPromises = [];
        portsArray.forEach((port) => {
          killPromises.push(killProcessesOnPort(port));
        });
        return await Promise.all(portsArray);
      } else {
        console.error(chalk.red("incorrect usage of the p-killa. try running `p-killa --help`."));
        printUsage();
        process.exit(1);
      }
    }
  } catch (e) {
    console.error(chalk.red(e.message));
    printUsage();
    process.exit(1);
  }
};


module.exports = {
  startHttpServer,
  listProcessesOnPort,
  getPidOfProcessOnPort,
  killProcessByPid,
  getArgvOptions,
  parseArgv,
  run
};
