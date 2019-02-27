# p-killa

A Node process killer for Windows and Linux and OSX.

## Features

- Kill a process specifying the port it is listening to.
- Kill multiple processes occupying multiple ports.
- ...the above, with a delay

## Install

The easiest way to use **p-killa** is to install it globally.

```bash
npm i -g p-killa
```

## Commands

#### kill a single process
```bash
p-killa --ports 4000
```
#### kill a multiple processes
```bash
p-killa --ports 4000,3000,8080,9090
```
#### kill a multiple processes with a 5 seconds delay

```bash
p-killa --ports 4000,3000,8080,9090 --delay 5
```

## Sponsors

This project is maintained and sponsored by:
 - [geoimpact AG](https://www.geoimpact.ch/) 
 
 
 <img src="https://media.licdn.com/dms/image/C560BAQGttJNI4vTkjQ/company-logo_400_400/0?e=1559174400&v=beta&t=7Wkzk_JfKBHSMQfQlP_K1nxnzdpBxJF26vSET_1IEHw" height="36">

## Contribute
This project has been bootstrapped using [nod](https://github.com/diegohaz/nod) and coded with the amazing
 [IntelliJ IDEA](https://www.jetbrains.com/idea/).

To hack a little bit with it you can additionally run ``npm run auto-build-install``, which transpiles es6 and installs
 the module globally.
If you are developing on windows but want to test it on linux you can run the provided docker container.

First, build and bash into the container by running.
``
docker-test\linux\run.cmd
``

Now you can play around opening and shutting down ports. I use ``http-server -pp 4000 . &`` followed by 
``p-killa --ports 4000 --delay 5`` for example.

If you want to test it on your host just run ``npm run test``



