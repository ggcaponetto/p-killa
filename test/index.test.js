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
    console.log(`${testFileName} got startHttpServer values`, values);
    done();
  }).catch((e) => {
    console.log(`${testFileName} got startHttpServer error`, e);
    done();
  });
});

test(`p-kill is able to list processes on given ports: ${ports.join(",")}`, async (done)=>{
  let listProcessPromises  = [];
  ports.forEach((port) => {
    let mockArgv = [
      null,
      `p-killa`,
      `-p`,
      `${port}`
    ];
    let argvOptions = functions.getArgvOptions();
    let parsedOptions = functions.parseArgv(mockArgv, argvOptions);
    console.log(`${testFileName} listProcesses is listing processes on port ${port}`);
    let listProcessPromise = functions.listProcesses(parsedOptions);
    listProcessPromises.push(listProcessPromise);
  });
  await Promise.all(listProcessPromises).then(() => {
    done();
  });
});
