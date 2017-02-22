

const FPTree = require('./fp-tree');

class FrequentItemsetGenerator {

  constructor(fpTree, itemNames, numTransactions, { minSupport = 0.2 } = {}) {
    this.fpTree = fpTree;
    this.itemNames = itemNames.sort();
    this.numTransactions = numTransactions;
    this.minSupport = minSupport;
    this.frequentItemsets = [];
  }

  getConditionalTree(tree, item) {
    const clonedTree = FPTree.clone(tree);

    const nodes = clonedTree.getNodesFromLookup(item);

    const support = nodes.reduce((total, n) => total + n.frequency, 0) / this.numTransactions;

    clonedTree.toConditionalTree(item);

    debugger;

    return {
      tree: clonedTree,
      support
    };
  }

  generateRecursive(conditionalTree, itemIndex, items) {
    if (itemIndex < 0) {
      return;
    }

    const { tree, support } = this.getConditionalTree(conditionalTree, this.itemNames[itemIndex]);

    if (support >= this.minSupport) {
      const itemset = [this.itemNames[itemIndex], ...items];
      this.frequentItemsets.push({ itemset, support });

      for (let n = itemIndex - 1; n >= 0; n--) {
        this.generateRecursive(tree, n, itemset);
      }
    }
  }

  generate() {
    this.frequentItemsets = [];

    for (let n = this.itemNames.length - 1; n >= 0; n--) {
      this.generateRecursive(this.fpTree, n, []);
    }

    return this.frequentItemsets;
  }
}

module.exports = FrequentItemsetGenerator;