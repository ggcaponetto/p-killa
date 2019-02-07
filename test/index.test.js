import * as functions from "../src/global/functions";

const testFilePath = __dirname+"/index.test.js";
const testFileName = "/index.test.js";

let ports = [
  3000, 3001, 3002
];
test(`p-kill is able to open ports: ${ports.join(",")}`, async (done)=>{
  let portPromises = [];
  ports.forEach(p => {
    console.log(`${testFileName} startHttpServer is openting port`, p);
    let portPromise = functions.startHttpServer(p, ".");
    portPromises.push(portPromise);
  });
  await Promise.all(portPromises).then(values => {
    console.log(`${testFileName} got startHttpServer values`);
    done();
  }).catch((e) => {
    console.log(`${testFileName} got startHttpServer error`, e);
    done();
  });
});

test(`p-kill is able to list processes on given ports: ${ports.join(",")}`, async (done)=>{
  let listProcessPromises  = [];
  let promise = new Promise((res, rej) => {
    setTimeout(() => {
      ports.forEach((port) => {
        console.log(`${testFileName} listProcesses is listing processes on port ${port}`);
        let listProcessPromise = functions.listProcessesOnPort(port).then(({command, output}) => {
          return output;
        });
        listProcessPromises.push(listProcessPromise);
      });
      return Promise.all(listProcessPromises).then((values) => {
        console.log(`${testFileName} listProcesses finished: \n`, values);
        res()
      });
    }, 1000); // the setTimeout is a quick and diry workaround to ensure that the ports are opened (server bootup)
  });
  await promise.then(() => {done();});
});
