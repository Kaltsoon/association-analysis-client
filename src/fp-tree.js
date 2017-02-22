/* @flow */

const Transaction = require('./transaction');
const FPTreeNode = require('./fp-tree-node');

class FPTree {
  nodeLookup: { [string]: FPTreeNode[] }
  root: FPTreeNode

  constructor() {
    this.root = new FPTreeNode('FP_TREE_ROOT');
    this.nodeLookup = {};
  }

  addNodeToLookup(node: FPTreeNode) {
    this.nodeLookup[node.id] = this.nodeLookup[node.id] || [];
    this.nodeLookup[node.id].push(node);
  }

  setAncestorsAsMembersOfConditionalTree(node: FPTreeNode) {
    const parent = node.getParent();

    if (parent) {
      parent.inConditionalTree = true;
      parent.setFrequency(0);

      this.setAncestorsAsMembersOfConditionalTree(parent);
    }
  }

  removeNodesNotInConditionalTree(node: ?FPTreeNode) {
    const targetNode = node ? node : this.root;

    for (const child of targetNode.getChildren()) {
      if (!child.inConditionalTree) {
        child.remove();
      }

      this.removeNodesNotInConditionalTree(child);
    }
  }

  toConditionalTree(item: string): void {
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

  increaseAncestorsFrequence(node: ?FPTreeNode, frequency: number) {
    if (!node) {
      return;
    }

    const parent = node.getParent();

    if (parent) {
      parent.increaseFrequency(frequency);

      this.increaseAncestorsFrequence(parent, frequency);
    }
  }

  getSupportCountForNode(id: string): number {
    return this.getNodesFromLookup(id).reduce((total, node) =>  total + node.frequency, 0) 
  }

  getNodesFromLookup(id: string): FPTreeNode[] {
    return this.nodeLookup[id] || [];
  }

  static cloneNode(clonedNode: FPTreeNode, node: FPTreeNode, clonedTree: FPTree): void {
    for (const child of node.getChildren()) {
      const clonedChild = new FPTreeNode(child.id, child.data);

      clonedChild
        .setFrequency(child.frequency)
        .setParent(clonedNode);

      clonedNode.addChild(clonedChild);

      clonedTree.addNodeToLookup(clonedChild);

      this.cloneNode(clonedChild, child, clonedTree);
    }
  }

  static clone(tree: FPTree): FPTree {
    const clonedTree = new FPTree();

    this.cloneNode(clonedTree.root, tree.root, clonedTree);

    return clonedTree;
  }

  addTransaction(transaction: Transaction): FPTree {
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