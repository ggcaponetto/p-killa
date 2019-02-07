/* eslint-env node, jest */

import * as functions from "../src/global/functions";

test(`kill`, async (done)=>{
  let ports = [3000, 3001, 3002];

/*  let openPortsPromises = [];
  ports.forEach((port) => {
    let openPortPromise = functions.startHttpServer(port, ".").then(() => {
      console.log(`opened port ${port}`);
    });
    openPortsPromises.push(openPortPromise);
  });
  await Promise.all(openPortsPromises);*/

  let listPromise = new Promise((res) => {
    let listProcessesPromises = [];
    setTimeout(async () => {
      ports.forEach((port) => {
        let listProcessesPromise = functions.getPidOfProcessOnPort(port).then((columns) => {
          console.log(`process list for port ${port}: \n ${JSON.stringify(columns, null, 4)}`);
          return columns;
        });
        listProcessesPromises.push(listProcessesPromise);
      });
      Promise.all(listProcessesPromises).then((values)=>{res(values);});
    }, 3000);
  });
  return await listPromise.then((values) => {
    console.log(`process list for ports ${ports}: \n ${JSON.stringify(values, null, 4)}`);
    done();
  });
});
