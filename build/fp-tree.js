const Transaction = require('./transaction');
const FPTreeNode = require('./fp-tree-node');

class FPTree {

  constructor() {
    this.root = new FPTreeNode('FP_TREE_ROOT');
    this.nodeLookup = {};
  }

  addNodeToLookup(node) {
    this.nodeLookup[node.id] = this.nodeLookup[node.id] || [];
    this.nodeLookup[node.id].push(node);
  }

  setAncestorsAsMembersOfConditionalTree(node) {
    const parent = node.getParent();

    if (parent) {
      parent.inConditionalTree = true;
      parent.setFrequency(0);

      this.setAncestorsAsMembersOfConditionalTree(parent);
    }
  }

  removeNodesNotInConditionalTree(node) {
    const targetNode = node ? node : this.root;

    for (const child of targetNode.getChildren()) {
      if (!child.inConditionalTree) {
        child.remove();
      }

      this.removeNodesNotInConditionalTree(child);
    }
  }

  toConditionalTree(item) {
    const nodes = this.getNodesFromLookup(item);

    for (const node of nodes) {
      node.inConditionalTree = true;
      this.setAncestorsAsMembersOfConditionalTree(node);
    }

    this.removeNodesNotInConditionalTree();

    for (const node of nodes) {
      this.increaseAncestorsFrequence(node, node.frequency);
      node.remove();
    }
  }

  increaseAncestorsFrequence(node, frequency) {
    if (!node) {
      return;
    }

    const parent = node.getParent();

    if (parent) {
      parent.increaseFrequency(frequency);

      this.increaseAncestorsFrequence(parent, frequency);
    }
  }

  getSupportCountForNode(id) {
    return this.getNodesFromLookup(id).reduce((total, node) => total + node.frequency, 0);
  }

  getNodesFromLookup(id) {
    return this.nodeLookup[id] || [];
  }

  static cloneNode(clonedNode, node, clonedTree) {
    for (const child of node.getChildren()) {
      const clonedChild = new FPTreeNode(child.id, child.data);

      clonedChild.setFrequency(child.frequency).setParent(clonedNode);

      clonedNode.addChild(clonedChild);

      clonedTree.addNodeToLookup(clonedChild);

      this.cloneNode(clonedChild, child, clonedTree);
    }
  }

  static clone(tree) {
    const clonedTree = new FPTree();

    this.cloneNode(clonedTree.root, tree.root, clonedTree);

    return clonedTree;
  }

  addTransaction(transaction) {
    let currentNode = this.root;

    for (const item of transaction.items) {
      const child = currentNode.getChild(item);

      if (child) {
        child.increaseFrequency();

        currentNode = child;
      } else {
        const newNode = new FPTreeNode(item);

        this.addNodeToLookup(newNode);

        newNode.setParent(currentNode);

        currentNode.addChild(newNode);

        currentNode = newNode;
      }
    }

    return this;
  }
}

module.exports = FPTree;