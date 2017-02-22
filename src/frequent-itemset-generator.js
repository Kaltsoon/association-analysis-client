/* @flow */

import type { Itemset, FrequentItemset } from './types';

const FPTree = require('./fp-tree');

class FrequentItemsetGenerator {
  fpTree: FPTree
  itemNames: string[]
  numTransactions: number
  minSupport: number
  frequentItemsets: FrequentItemset[]

  constructor(fpTree: FPTree, itemNames: string[], numTransactions: number, { minSupport = 0.2 }: { minSupport: number } = {}) {
    this.fpTree = fpTree;
    this.itemNames = itemNames.sort();
    this.numTransactions = numTransactions;
    this.minSupport = minSupport;
    this.frequentItemsets = [];
  }

  getConditionalTree(tree: FPTree, item: string): ({ tree: FPTree, support: number }) {
    const clonedTree = FPTree.clone(tree);

    const nodes = clonedTree.getNodesFromLookup(item);

    const support = nodes.reduce((total, n) => total + n.frequency, 0) / this.numTransactions;

    clonedTree.toConditionalTree(item);

    debugger;

    return {
      tree: clonedTree,
      support,
    };
  }

  generateRecursive(conditionalTree: FPTree, itemIndex: number, items: string[]) {
    if (itemIndex < 0) {
      return;
    }

    const { tree, support } = this.getConditionalTree(conditionalTree, this.itemNames[itemIndex]);

    if (support >= this.minSupport) {
      const itemset = [this.itemNames[itemIndex], ...items];
      this.frequentItemsets.push({ itemset, support });

      for(let n = itemIndex - 1; n >= 0; n--) {
        this.generateRecursive(tree, n, itemset);
      }
    }
  }

  generate(): FrequentItemset[] {
    this.frequentItemsets = [];

    for (let n = this.itemNames.length - 1; n >= 0; n --) {
      this.generateRecursive(this.fpTree, n, []);
    }
    
    return this.frequentItemsets;
  }
}

module.exports = FrequentItemsetGenerator;