# p-killa

[![forthebadge](https://forthebadge.com/images/badges/fuck-it-ship-it.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-by-crips.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/makes-people-smile.svg)](https://forthebadge.com)

A node process killer for windows and linux.

## Features

- kill a process specifying the port it is listening to.
- kill multiple processes occupying multiple ports.
- the above, with a delay

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



