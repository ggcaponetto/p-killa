import * as functions from "../src/global/functions.js";
let passed = false;
let ports = [
  3000, 3001, 3003
];
let portPromises = [];
ports.forEach(p => {
  console.log("startHttpServer is openting port:", p);
  let portPromise = functions.startHttpServer(p, ".");
  portPromises.push(portPromise);
});
Promise.all(portPromises).then(values => {
  console.log("got startHttpServer values \n", values.toString());
  passed = true;
}).catch((e) => {
  console.log("got startHttpServer error", e);
});
