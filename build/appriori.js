

const _ = require('lodash');

class Apriori {

  constructor(frequentItemsets) {
    this.frequentItemsets = frequentItemsets;

    this.itemsetToIsFrequent = _.zipObject(this.frequentItemsets.map(set => set.join('$')), this.frequentItemsets.map(set => true));
  }

  isFrequent(itemset) {
    return !!this.itemsetToIsFrequent[itemset.join('$')];
  }

  isCombinable(itemsetA, itemsetB) {
    if (itemsetA.length === 0) {
      return true;
    }

    const startA = itemsetA.slice(0, itemsetA.length - 1);
    const startB = itemsetB.slice(0, itemsetB.length - 1);

    for (const itemA of startA) {
      for (const itemB of startB) {
        if (itemA !== itemB) {
          return false;
        }
      }
    }

    return _.last(itemsetA) !== _.last(itemsetB);
  }

  combinableItemsets(targetItemset, itemsets) {
    const combinable = [];

    for (const itemset of itemsets) {
      if (this.isCombinable(targetItemset, itemset)) {
        combinable.push(itemset);
      }
    }

    return combinable;
  }

  combine(itemsetA, itemsetB) {
    if (itemsetA.length === 1) {
      return [...itemsetA, ...itemsetB];
    }

    return [...itemsetA, itemsetB[itemsetB.length - 1]];
  }

  combineAll(targetItemset, itemsets) {
    const combined = [];

    for (const itemset of itemsets) {
      combined.push(this.combine(targetItemset, itemset));
    }

    return combined;
  }

  generate(itemsets) {
    const generatedItemsets = [];

    for (let n = 0; n < itemsets.length; n++) {
      generatedItemsets.push(...this.combineAll(itemsets[n], this.combinableItemsets(itemsets[n], itemsets.slice(n))));
    };

    return generatedItemsets.filter(itemset => this.isFrequent(itemset));
  }
}

module.exports = Apriori;