/* @flow */

import type { FrequentItemset, Itemset, RuleWithConfidence } from './types';

const _ = require('lodash');

const Appriori = require('./appriori');

class RuleGenerator {
  frequentItemsets: FrequentItemset[]
  itemsetToSupport: { [string]: number }
  minConfidence: number
  appriori: Appriori
  rules: RuleWithConfidence[]

  constructor(frequentItemsets: FrequentItemset[], { minConfidence = 0.5 }: { minConfidence: number } = {}) {
    this.frequentItemsets = frequentItemsets;
    this.appriori = new Appriori(frequentItemsets.map(f => f.itemset));

    this.itemsetToSupport = _.zipObject(
      frequentItemsets.map(f => f.itemset.join('$')),
      frequentItemsets.map(f => f.support)
    );

    this.minConfidence = minConfidence;

    this.rules = [];
  }

  sortByConfidence(ruleA: RuleWithConfidence, ruleB: RuleWithConfidence) {
    return ruleB.confidence - ruleA.confidence;
  }

  getItemsetSupport(itemset: Itemset): number {
    return this.itemsetToSupport[itemset.join('$')] || 0;
  }

  getConfidence(itemsetA: Itemset, itemsetB: Itemset): number {
    if (this.getItemsetSupport(itemsetB) === 0) {
      return 0;
    }

    return this.getItemsetSupport(itemsetA) / this.getItemsetSupport(itemsetB);
  }

  deleteItemsetFromItemsets(itemset: Itemset, itemsets: Itemset[]): void {
    _.remove(itemsets, set => _.isEqual(set, itemset));
  }

  generateRecursive(frequentItemset: Itemset, consequents: Itemset[]): void {
    const k = frequentItemset.length;
    const m = consequents.length > 0 ? consequents[0].length : 0;

    let incrementedConsequents;

    if (k > m + 1) {
      incrementedConsequents = this.appriori.generate(consequents);

      for (const itemset of incrementedConsequents) {
        const without: Itemset = _.without(frequentItemset, ...itemset);
        const confidence = this.getConfidence(frequentItemset, without);

        if (confidence >= this.minConfidence) {
          this.rules.push({
            rule:  [without, itemset],
            confidence, 
          });
        } else {
          this.deleteItemsetFromItemsets(itemset, incrementedConsequents);
        }
      }

      this.generateRecursive(frequentItemset, incrementedConsequents);
    }
  }

  generate(): RuleWithConfidence[] {
    this.rules = [];
    const itemsets = this.frequentItemsets.map(({ itemset }) => itemset).filter(itemset => itemset.length >= 2);

    for (const itemset of itemsets) {
      this.generateRecursive(itemset, itemset.map(item => [item]));
    }

    return this.rules.sort(this.sortByConfidence);
  }
}

module.exports = RuleGenerator;