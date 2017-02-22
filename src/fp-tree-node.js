/* @flow */

class FPTreeNode {
  id: string
  frequency: number
  nodePointer: FPTreeNode
  data: ?Object
  children: FPTreeNode[]
  parent: ?FPTreeNode
  inConditionalTree: boolean

  constructor(id: string, data: ?Object) {
    this.frequency = 1;
    this.id = id;
    this.parent = null;
    this.data = data || null;
    this.inConditionalTree = false;

    this.children = [];
  }

  increaseFrequency(amount?: number = 1): number {
    return this.frequency = this.frequency + amount;
  }

  setFrequency(frequency: number): FPTreeNode {
    this.frequency = frequency;

    return this;
  }

  getChildren(): FPTreeNode[] {
    return this.children;
  }

  getParent(): ?FPTreeNode {
    return this.parent;
  }

  removeChild(node: FPTreeNode): void {
    this.children = this.children.filter(c => c !== node);
  }

  remove(): void {
    const parent = this.getParent();

    if (parent) {
      parent.removeChild(this);
    }
  }

  getChild(id: string): ?FPTreeNode {
    let targetChild = null;

    for (const child of this.children) {
      if (child.id === id) {
        targetChild = child;
        break;
      }
    }

    return targetChild;
  }

  setParent(node: FPTreeNode): FPTreeNode {
    this.parent = node;

    return this;
  }

  addChild(node: FPTreeNode): FPTreeNode {
    this.children.push(node);

    return this;
  }
}

module.exports = FPTreeNode;