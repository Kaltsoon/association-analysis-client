/* @flow */

const cli = require('./cli');
const minimist = require('minimist');
const path = require('path');

const FPTree = require('./fp-tree');
const FrequentItemsetGenerator = require('./frequent-itemset-generator');
const Transaction = require('./transaction');

function getArgs(): Object {
  return minimist(process.argv.slice(2));
}

function initialize(): void {
  const { transactionsFile, itemNamesFile, minSupport, minConfidence, outFile } = getArgs();

  cli.parse({
    transactionsFile: path.join(__dirname, '..', transactionsFile),
    itemNamesFile: path.join(__dirname, '..', itemNamesFile),
    outFile: outFile ? path.join(__dirname, '..', outFile) : null,
    minSupport: +(minSupport || 0.2),
    minConfidence: +(minConfidence || 0.5),
  });
}

initialize();