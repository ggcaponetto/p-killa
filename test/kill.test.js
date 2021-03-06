/* eslint-env node, jest */

import * as functions from "../src/global/functions";

test(`kill`, async done => {
  const ports = [3000, 3001, 3002];

  const openPortsPromises = [];
  ports.forEach(port => {
    const openPortPromise = functions.startHttpServer(port, ".").then(() => {
      console.log(`opened port ${port}`);
    });
    openPortsPromises.push(openPortPromise);
  });
  await Promise.all(openPortsPromises);

  const listPromise = new Promise(res => {
    const listProcessesPromises = [];
    setTimeout(async () => {
      ports.forEach(port => {
        const listProcessesPromise = functions
          .getPidOfProcessOnPort(port)
          .then(output => {
            console.log(
              `process list for port ${port}: \n ${JSON.stringify(
                output,
                null,
                4
              )}`
            );
            return output;
          });
        listProcessesPromises.push(listProcessesPromise);
      });
      Promise.all(listProcessesPromises).then(values => {
        res(values);
      });
    }, 3000);
  });

  const killPromises = [];
  let pids;
  await listPromise.then(values => {
    console.log(
      `process list for ports ${ports}: \n ${JSON.stringify(values, null, 4)}`
    );
    pids = values;
    pids.forEach(pid => {
      const killPromise = functions
        .killProcessByPid(pid)
        .then(({ command, output }) => output);
      killPromises.push(killPromise);
    });
  });

  return await Promise.all(killPromises).then(outputs => {
    console.log(`killed all processed with pids ${pids}: \n ${outputs}`);
    done();
  });
});
