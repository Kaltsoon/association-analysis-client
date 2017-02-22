const test = require('ava');

const FrequentItemsetGenerator = require('../frequent-itemset-generator');
const FPTree = require('../fp-tree');
const Transaction = require('../transaction');

function sorter(itemsetA, itemsetB) {
  return itemsetA.join('$').localeCompare(itemsetB.join('$'));
}

test('Generates correct itemsets', t => {
  const tree = new FPTree();

  tree
    .addTransaction(new Transaction(['a', 'b']))
    .addTransaction(new Transaction(['b', 'c', 'd']))
    .addTransaction(new Transaction(['a', 'c', 'd', 'e']))
    .addTransaction(new Transaction(['a', 'd', 'e']))
    .addTransaction(new Transaction(['a', 'b', 'c']))
    .addTransaction(new Transaction(['a', 'b', 'c', 'd']))
    .addTransaction(new Transaction(['a']))
    .addTransaction(new Transaction(['a', 'b', 'c']))
    .addTransaction(new Transaction(['a', 'b', 'd']))
    .addTransaction(new Transaction(['b', 'c', 'e']));

  const generator = new FrequentItemsetGenerator(tree, ['a', 'b', 'c', 'd', 'e'], 10, { minSupport: 0.2 });

  const frequentItemsets = generator.generate().map(({ itemset }) => itemset).sort(sorter);

  const expectedItemsets = [
      ['e'],
      ['d', 'e'],
      ['a', 'd', 'e'],
      ['c', 'e'],
      ['a', 'e'],
      ['d'],
      ['c', 'd'],
      ['b', 'c', 'd'],
      ['a', 'c', 'd'],
      ['b', 'd'],
      ['a', 'b', 'd'],
      ['a', 'd'],
      ['c'],
      ['b', 'c'],
      ['a', 'b', 'c'],
      ['a', 'c'],
      ['b'],
      ['a', 'b'],
      ['a']
    ].sort(sorter);

  t.deepEqual(
    frequentItemsets,
    expectedItemsets
  ); 
});