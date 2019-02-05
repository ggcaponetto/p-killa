import * as functions from "../src/global/functions";

test("run", () => {
  let passed = false;
  let ports = [
    3000, 3001, 3003
  ];
  let portPromises = [];
  ports.forEach(p => {
    console.log("startHttpServer is openting port", p);
    let portPromise = functions.startHttpServer(p, ".", true);
    portPromises.push(portPromise);
  });
  return Promise.all(portPromises).then(values => {
    console.log("got startHttpServer values", values);
    passed = true;
    expect(passed);
  }).catch((e) => {
    console.log("got startHttpServer error", e);
    expect(passed);
  });
});
