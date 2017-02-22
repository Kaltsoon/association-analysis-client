class FPTreeNode {

  constructor(id, data) {
    this.frequency = 1;
    this.id = id;
    this.parent = null;
    this.data = data || null;
    this.inConditionalTree = false;

    this.children = [];
  }

  increaseFrequency(amount = 1) {
    return this.frequency = this.frequency + amount;
  }

  setFrequency(frequency) {
    this.frequency = frequency;

    return this;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
  }

  removeChild(node) {
    this.children = this.children.filter(c => c !== node);
  }

  remove() {
    const parent = this.getParent();

    if (parent) {
      parent.removeChild(this);
    }
  }

  getChild(id) {
    let targetChild = null;

    for (const child of this.children) {
      if (child.id === id) {
        targetChild = child;
        break;
      }
    }

    return targetChild;
  }

  setParent(node) {
    this.parent = node;

    return this;
  }

  addChild(node) {
    this.children.push(node);

    return this;
  }
}

module.exports = FPTreeNode;