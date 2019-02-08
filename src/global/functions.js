#!/usr/bin/env node
const {spawn} = require("child_process");
// const { fork } = require("child_process");

const getArgvOptions = () => {
  const options = [
    {
      name: "port",
      identifiers: ["--port", "-p"]
    },
    {
      name: "ports",
      identifiers: ["--ports", "-pp"]
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
  const processTag = `listProcessesOnPortWin`;
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
        `process "${processTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${processTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${processTag}" having pid ${
          command.pid
          } cloded with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const listProcessesOnPortLinux = port => {
  const processTag = `listProcessesOnPortLinux`;
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
        `process "${processTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${processTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${processTag}" having pid ${
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
  const processTag = `killProcessesByPidLinux`;
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
        `process "${processTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${processTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${processTag}" having pid ${
          command.pid
          } closed with exit code ${code}`
      );
      res({command, output});
    });
  });
};

const killProcessesByPidWin = pid => {
  const processTag = `killProcessesByPidWin`;
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
        `process "${processTag}" having pid ${command.pid} stdout:\n ${data}`
      );
      output.push(data.toString());
    });
    command.stderr.on("data", data => {
      console.log(
        `process "${processTag}" having pid ${command.pid} stderr:\n ${data}`
      );
    });
    command.on("close", code => {
      console.log(
        `process "${processTag}" having pid ${
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

const checkArgs = parsedOptions => {
  const functionTag = "checkArgs";
  console.log(`${functionTag} checking the arguments: \n ${parsedOptions}`);
  let port;
  try {
    port = parsedOptions.filter(option => {
      return option.name === "port";
    })[0].value;
  } catch (e) {
    console.warn(`${functionTag}`, e);
    throw e;
  }
  let ports;
  try {
    ports = parsedOptions.filter(option => {
      return option.name === "ports";
    })[0].value;
  } catch (e) {
    console.warn(`${functionTag}`, e);
    throw e;
  }
  return (
    typeof port !== "undefined" || typeof ports !== "undefined"
    // todo
  );
};

const printUsage = () => {
  // let functionTag = "printUsage";
  const tabs = `        `;
  console.info("p-killa usage:");
  console.info("");
  console.info("p-killa [options]");
  console.info("");
  console.info(`--port (-p) ${tabs} Single port to kill {number, required}`);
  console.info(`or`);
  console.info(
    `--ports (-pp) ${tabs} Multiple ports to kill, comma separated {string, required, e.g. 3002,8080,9000}`
  );
  console.info("");
};

const run = async () => {
  const {argv} = process;
  console.log(`running with arguments: \n ${argv.join("\n")}`);

  let argvOptions;
  let parsedOptions;

  try {
    argvOptions = getArgvOptions();
    parsedOptions = parseArgv(argv, argvOptions);
    console.log(`parsed options: \n ${JSON.stringify(parsedOptions, null, 4)}`);
    const isValidOptions = checkArgs(parsedOptions);
    if (!isValidOptions) {
      throw new Error("invalid options passed to p-killa");
    }
  } catch (e) {
    printUsage();
  }

  try {
    const processTag = "main";
    const port = parsedOptions.filter(option => {
      return option.name === "port";
    })[0].value;
    console.log(`${processTag} killing process on port ${port}`);
    const pid = await getPidOfProcessOnPort(port);
    console.log(`${processTag} the process on port ${port} has pid ${pid}`);
    return await killProcessByPid(pid);
  } catch (e) {
    console.error(e);
    printUsage();
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
