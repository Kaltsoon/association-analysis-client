# Awesome association analysis client based on FP-Growth algorithm

## What?

The algorithm behind the client generates frequent itemsets and generates association rules based on a set of transactions.
Transactions are a single text file containing lines of comma separated items (like shopping basket items). Here's an example
of transaction file:

```
Beer,Diapers
Bread,Diapers
Beer,Butter,Milk
Bread,Milk
Beer,Milk
...
```

The generated rules such as `{ Beer } -> { Milk }`, meaning "in transactions which contain beer also commonly contain milk".

You can read more about assosiation rule learning [here](https://en.wikipedia.org/wiki/Association_rule_learning).

## How?

1. Install [Node.js](https://nodejs.org/en) and [Yarn](https://yarnpkg.com/en/) 
1. Download this repository
2. Run command `yarn` (this command installs the dependencies)
3. Run command `yarn start -- --transactionsFile ./transactions.txt --itemNamesFile ./itemnames.txt --minSupport 0.2 --minConfidence 0.5`

In the 3. step replace `./transactions.txt` with path to transactions file and `./itemnames.txt` with path to item names file. The paths are relative to the folder download in the 2. step.
Transactions file is any file containing list of lines containing comma separated items, like in example above. 
Item names file on the other hand is a file containing all possible items separated by comma. In the given example, item names file would contain:

```
Beer,Diapers,Bread,Milk,Butter
```

The order of the names doesn't matter.

`minSupport` is the minimum support value used to generate frequent itemsets (default is 0.2). `minConfidence` is the minimum confidence value used to generate rules (default is 0.5).