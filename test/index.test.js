import * as functions from "../src/global/functions";

test("run", async(done)=>{
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
  return await Promise.all(portPromises).then(values => {
    console.log("got startHttpServer values", values);
    passed = true;
    done();
  }).catch((e) => {
    console.log("got startHttpServer error", e);
    done();
  });
});
