#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert');

process.chdir(path.join(__dirname, '..'));

const args = process.argv.slice(2);

assert(args.length === 2, 'file $src $dest (relative to project root)');

const src = args[0].replace(/[\\\/]$/, ''); // Removing the final '\' or '/'.
const dest = args[1].replace(/[\\\/]$/, ''); // Removing the final '\' or '/'.
const normSrc = path.relative(path.dirname(dest), src);

try {
  fs.mkdirSync('./node_modules');
} catch (err) {}

try {
  fs.unlinkSync(dest);
} catch (err) {}

fs.symlinkSync(normSrc, dest, 'dir');
