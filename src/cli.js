/* @flow */

import type { RuleWithConfidence, FrequentItemset } from './types';

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
  parse,
  executeFPGrowth,
};

const events = {
  TRANSACTION_LINE: 'TRANSACTION_LINE',
  END_OF_TRANSACTIONS: 'END_OF_TRANSACTIONS',
  FREQUENT_ITEMSETS_GENERATING: 'FREQUENT_ITEMSETS_GENERATING',
  FREQUENT_ITEMSETS_GENERATED: 'FREQUENT_ITEMSETS_GENERATED',
  RULES_GENERATING: 'RULES_GENERATING',
  RULES_GENERATED: 'RULES_GENERATED',
};

function stripSpecialCharacters(string: string): string {
  return string.replace(/(\r\n|\n|\r|\$)/gm, '');
}

function readTransactionsFileByLine(filePath: string): EventEmitter {
  const eventEmitter = new EventEmitter();

  const readStream = fs.createReadStream(filePath);

  let numberOfLines = 0;

  hl(readStream)
    .split()
    .filter(line => !!line)
    .map(line => line.split(',').map(stripSpecialCharacters))
    .each(line => {
      numberOfLines++;
      eventEmitter.emit(events.TRANSACTION_LINE, line);
    })
    .done(() => eventEmitter.emit(events.END_OF_TRANSACTIONS, { numberOfLines }));
  
  return eventEmitter;
}

function readItemNames(filePath: string): Promise<string[]> {
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

function echo(message: string): void {
  console.log(message);
}

function echoSuccess(message: string): void {
  echo(chalk.green(emoji.emojify(`:clap:  ${message}`)));
}

function echoProgress(message: string): void {
  echo(chalk.white(emoji.emojify(`:rocket:  ${message}`)));
}

function echoWrite(message: string): void {
  echo(chalk.white(emoji.emojify(`:pencil:  ${message}`)));
}

function echoRead(message: string): void {
  echo(chalk.white(emoji.emojify(`:open_book:  ${message}`)))
}

function echoError(message: string): void {
  echo(chalk.red(emoji.emojify(`:dizzy_face:  ${message}`)));
}

function executeFPGrowth(
  tree: FPTree, 
  itemNames: string[], 
  numTransactions: number, 
  { 
    minSupport, 
    minConfidence, 
    onProgress = (event) => {} 
  }: { minSupport: number, minConfidence: number, onProgress?: (event: string, data: any) => void }
): ({ frequentItemsets: FrequentItemset[], rules: RuleWithConfidence[] }) {
  const frequentItemsetGenerator = new FrequentItemsetGenerator(tree, itemNames, numTransactions, { minSupport });

  onProgress(events.FREQUENT_ITEMSETS_GENERATING);

  const frequentItemsets = frequentItemsetGenerator.generate();

  onProgress(events.FREQUENT_ITEMSETS_GENERATED, { frequentItemsets, minSupport });
  
  onProgress(events.RULES_GENERATING);

  const ruleGenerator = new RuleGenerator(frequentItemsets, { minConfidence });

  const rules = ruleGenerator.generate();

  onProgress(events.RULES_GENERATED, { rules, minConfidence });

  return {
    frequentItemsets,
    rules,
  };
}

function renderRule(ruleWithConfidence: RuleWithConfidence): string {
  const { rule, confidence } = ruleWithConfidence;

  return `{ ${rule[0].join(', ')} } -> { ${rule[1].join(', ')} } (confidence: ${_.round(confidence, 2)})`;
}

function writeOutputToFile(filePath: string, frequentItemsets: FrequentItemset[], rules: RuleWithConfidence[]): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify({ frequentItemsets, rules }), err => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

function writeOutputToStdout(frequentItemsets: FrequentItemset[], rules: RuleWithConfidence[]): void {
  for (const rule of rules) {
    echo(chalk.white(renderRule(rule)));
  }
}

function onFPGrowthProgress(event: string, data: any): void {
  switch(event) {
    case events.FREQUENT_ITEMSETS_GENERATING:
      echoProgress('Generating frequent itemsets...');
      break;
    case events.FREQUENT_ITEMSETS_GENERATED:
      echoSuccess(`Successfully generated ${data.frequentItemsets.length} frequent itemsets with support >= ${data.minSupport}!`);
      break;
    case events.RULES_GENERATING:
      echoProgress('Generating rules...');
      break;
    case events.RULES_GENERATED:
      echoSuccess(`Successfully generated ${data.rules.length} rules with confidence >= ${data.minConfidence}!`);
      break;
  }
}

function parse(args: ({ transactionsFile: string, itemNamesFile: string, outFile: ?string, minSupport: number, minConfidence: number })): void {
  echoRead(`Reading item names from ${args.itemNamesFile}...`);

  const { minSupport, minConfidence, outFile, transactionsFile, itemNamesFile } = args;

  readItemNames(itemNamesFile)
    .then(itemNames => {
      echoSuccess(`Successfully read ${itemNames.length} item names!`);

      echoRead(`Reading transactions from file ${transactionsFile}...`);

      const tree = new FPTree();

      readTransactionsFileByLine(transactionsFile)
        .on(events.TRANSACTION_LINE, line => {
          tree.addTransaction(new Transaction(line));
        })
        .on(events.END_OF_TRANSACTIONS, ({ numberOfLines }) => {
          echoSuccess(`Successfully read ${numberOfLines} transactions!`);

          const { frequentItemsets, rules } = executeFPGrowth(
            tree, 
            itemNames, 
            numberOfLines, 
            { minSupport, minConfidence, onProgress: onFPGrowthProgress }
          );

          if (outFile) {
            echoWrite(`Writing output to ${outFile}...`);

            writeOutputToFile(outFile, frequentItemsets, rules)
              .then(() => {
                echoSuccess(`Successfully wrote results to ${outFile}!`);
              })
              .catch(echoError);
          } else {
            writeOutputToStdout(frequentItemsets, rules);
          }
        });
    })
    .catch(echoError);
}

module.exports = cli;