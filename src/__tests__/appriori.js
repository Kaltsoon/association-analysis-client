const test = require('ava');

const Appriori = require('../appriori');

test('Generates correct itemsets', t => {
  const appriori = new Appriori([['Bread', 'Diapers', 'Milk']]);

  t.deepEqual(
    appriori.generate([
      ['Beer', 'Diapers'],
      ['Bread', 'Diapers'],
      ['Bread', 'Milk'],
      ['Diapers', 'Milk']
    ]),
    [['Bread', 'Diapers', 'Milk']]
  );
});