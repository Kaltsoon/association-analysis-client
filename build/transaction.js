class Transaction {

  constructor(items) {
    this.items = items.sort();
  }
}

module.exports = Transaction;