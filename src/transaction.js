/* @flow */

class Transaction {
  items: string[]

  constructor(items: string[]) {
    this.items = items.sort();
  }
}

module.exports = Transaction;