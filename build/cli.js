

const EventEmitter = require('events');

const hl = require('highland');
const chalk = require('chalk');
const emoji = require('node-emoji');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const FPTree = require('./fp-tree');
const Transaction = require('./transaction');
const FrequentItemsetGenerator = require('./frequent-itemset-generator');
const RuleGenerator = require('./rule-generator');

const tree = new FPTree();

const cli = {
  parse
};

const LINE_EVENT = 'line';
const END_EVENT = 'end';

function stripSpecialCharacters(string) {
  return string.replace(/(\r\n|\n|\r|\$)/gm, '');
}

function readDataFileByLine(filePath) {
  const eventEmitter = new EventEmitter();

  const readStream = fs.createReadStream(filePath);

  let numberOfLines = 0;

  hl(readStream).split().filter(line => !!line).map(line => line.split(',').map(stripSpecialCharacters)).each(line => {
    numberOfLines++;
    eventEmitter.emit(LINE_EVENT, line);
  }).done(() => eventEmitter.emit(END_EVENT, { numberOfLines }));

  return eventEmitter;
}

function readItemNames(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.split(',').map(stripSpecialCharacters));
      }
    });
  });
}

function echo(message) {
  console.log(message);
}

function echoSuccess(message) {
  echo(chalk.green(emoji.emojify(`:clap:  ${message}`)));
}

function echoProgress(message) {
  echo(chalk.white(emoji.emojify(`:rocket:  ${message}`)));
}

function echoError(message) {
  echo(chalk.red(emoji.emojify(`:dizzy_face:  ${message}`)));
}

function executeFPGrowth(tree, itemNames, numTransactions, { minSupport, minConfidence }) {
  const frequentItemsetGenerator = new FrequentItemsetGenerator(tree, itemNames, numTransactions, { minSupport });

  echoProgress('Generating frequent itemsets...');

  const frequentItemsets = frequentItemsetGenerator.generate();

  echoSuccess(`Successfully generated ${frequentItemsets.length} frequent itemsets with support >= ${minSupport}!`);

  echoProgress('Generating rules...');

  const ruleGenerator = new RuleGenerator(frequentItemsets, { minConfidence });

  const rules = ruleGenerator.generate();

  echoSuccess(`Successfully generated ${rules.length} rules with confidence >= ${minConfidence}!`);

  for (let n = 0; n < rules.length; n++) {
    echo(chalk.white(renderRule(rules[n])));
  }
}

function renderRule(ruleWithConfidence) {
  const { rule, confidence } = ruleWithConfidence;

  return `{ ${rule[0].join(', ')} } -> { ${rule[1].join(', ')} } (confidence: ${_.round(confidence, 2)})`;
}

function parse(args) {
  echoProgress(`Reading item names from ${args.itemNamesFile}...`);

  const { minSupport, minConfidence } = args;

  readItemNames(args.itemNamesFile).then(itemNames => {
    echoSuccess(`Successfully read ${itemNames.length} item names!`);

    echoProgress(`Reading transactions from file ${args.transactionsFile}...`);

    const tree = new FPTree();

    readDataFileByLine(args.transactionsFile).on(LINE_EVENT, line => {
      tree.addTransaction(new Transaction(line));
    }).on(END_EVENT, ({ numberOfLines }) => {
      echoSuccess(`Successfully read ${numberOfLines} transactions!`);
      executeFPGrowth(tree, itemNames, numberOfLines, { minSupport, minConfidence });
    });
  }).catch(err => echoError(err));
}

module.exports = cli;