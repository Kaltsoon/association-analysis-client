/* @flow */

export type Itemset = string[];

export type FrequentItemset = {
  itemset: Itemset,
  support: number,
};

export type Rule = [Itemset, Itemset];

export type RuleWithConfidence = {
  rule: Rule,
  confidence: number,
};