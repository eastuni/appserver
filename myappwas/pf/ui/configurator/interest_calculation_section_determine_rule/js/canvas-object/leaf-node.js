class LeafNode extends CanvasObject {
  constructor(config) {
    const margin = 10;
    const length = 140;
    const typeXMargin = length + margin;

    super(config);
    this.nodeMap = config.nodeMap;
    this.type = 'leafNode';
    // this.width = 140;
    // this.height = 70 + (typeMargin * ((this.refObj.children.length || 1) - 1)) + (margin * 2);
    this.width = (typeXMargin * (this.refObj.children.length || 1)) + margin;
    this.height = 100;
    if (this.refObj) {
      this.children = this.refObj.children.map((v, i) => new Type({
        ctx: this.ctx,
        x: margin + this.x + (typeXMargin * i),
        y: this.y,
        width: length,
        height: this.height,
        // x: this.x,
        // y: this.y + margin + (typeMargin * i),
        parent: this,
        refObj: v,
      }));
    }
  }

  render() {
    if (this.children.length > 0) {
      this.children.forEach((type) => {
        type.render();
      });
    } else {
      this.hilight();
    }
  }

  getInsertableIndex(ex, ey) {
    for (let i = 0; i <= this.children.length; i += 1) {
      const prev = this.children[i - 1];
      const now = this.children[i];
      const start = prev ? prev.x + prev.width : this.x;
      const end = now ? now.x : this.x + this.width;

      if ((start < ex && ex < end)
        && (this.y <= ey && ey <= this.y + this.height)) {
        return i;
      }
      // Vertical
      // const start = prev ? prev.y + prev.height : this.y;
      // const end = now ? now.y : this.y + this.height;

      // if ((this.x <= ex && ex <= this.x + this.width)
      //   && (start < ey && ey < end)) {
      //   return i;
      // }
    }

    return -1;
  }

  hilightInsertableArea(index) {
    if (index >= 0) {
      const { ctx } = this;
      const typeMargin = 10;
      const type = this.children[index];
      const end = type ? type.x : this.x + this.width;
      const x = end - (typeMargin / 2);

      ctx.beginPath();
      ctx.moveTo(x, this.y);
      ctx.lineTo(x, this.y + this.height);
      ctx.stroke();
    }
  }

  onDrop(dragObject, [ex, ey]) {
    if (dragObject.type === 'type') {
      const index = this.getInsertableIndex(ex, ey);
      const types = this.refObj.children;
      const duplicate = types.find(v => v.id === dragObject.refObj.id);
      if (duplicate) {
        PFComponent.showMessage(bxMsg('duplicate'), 'warning');
      } else {
        types.splice(index >= 0 ? index : this.children.length, 0, dragObject.refObj);
        if (this.refObj.process !== 'C') {
          this.refObj.process = 'U';
        }
      }
    } else if (this.children.length === 0 && dragObject.type === 'determineCondition') {
      // 신규 Leaf Node
      const id = `$NEW${(`${10000 + counter++}`).substring(1)}`;
      this.nodeMap[id] = {
        id,
        applyEndDate: '99991231',
        rootNodeYn: 'N',
        leafNodeYn: 'Y',
        parentId: this.refObj.id,
        children: [],
        conditionId: dragObject.refObj.id,
        activeYn: 'N',
        content: id,
        process: 'C',
      };

      // Node로 변경
      this.refObj.leafNodeYn = 'N';
      this.refObj.children = [this.nodeMap[id]];
    }
  }

  onDragOver(dragObject, [ex, ey]) {
    if (dragObject.type === 'type') {
      this.hilight();
      const index = this.getInsertableIndex(ex, ey);
      if (index >= 0) {
        this.hilightInsertableArea(index);
      }
    } else if (this.children.length === 0 && dragObject.type === 'determineCondition') {
      this.hilight();
    }
  }

  focus() {
    let parent = this.parent;
    while (parent) {
      parent.focus();
      parent = parent.parent;
    }
  }
}
