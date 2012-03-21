#!/bin/sh

anvil -b build.json

mv ./lib/standard/machina.postal.node.js ./lib/node/machina.postal.js
rm ./lib/standard/machina.postal.node*