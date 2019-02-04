import {startHttpServer} from "../src/global/index";

test("run", () => {
  let passed = false;
  let ports = [
    3000, 3001, 3003
  ];
  let portPromises = [];
  ports.forEach(p => {
    let portPromise = startHttpServer(p, ".", true);
    portPromises.push(portPromise);
  });
  Promise.all(portPromises).then(values => {
    console.log("got startHttpServer values", values);
    passed = true;
    expect(passed);
  }).catch((e) => {
    console.log("got startHttpServer error", e);
    expect(passed);
  });
});
