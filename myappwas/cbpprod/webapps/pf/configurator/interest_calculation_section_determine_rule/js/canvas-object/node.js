let counter = 1;
class Node extends CanvasObject {
  constructor(config) {
    super(config);
    this.type = 'node';
    this.width = this.width || 140;
    this.folded = this.refObj.folded;
    this.foldable = true;
    if (config) {
      this.nodeMap = config.nodeMap;

      const marginX = 90;
      const marginY = 10;
      const x = marginX + this.x + this.width;
      let y = this.y + marginY;
      this.children = (this.folded ? [] : (this.refObj.children || [])).map((child) => {
        const cnd =  new DetermineCondition({
          ctx: this.ctx,
          x,
          y,
          refObj: config.determineConditionMap[child.conditionId],
          parent: this,
          next: child.id,
          nodeMap: config.nodeMap,
          determineConditionMap: config.determineConditionMap,
        });

        y += cnd.height + marginY;
        return cnd;
      });
      this.height = Math.max(y - this.y, 140);
    }
  }

  // Circle
  getShape() {
    const shape = new Path2D();
    const { width, height } = this;

    shape.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);

    return shape;
  }

  render() {
    const { ctx } = this;
    const text = this.refObj.content;
    const shape = this.getShape();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = 'rgb(230, 230, 230)';
    ctx.lineWidth = 2.25;
    ctx.fill(shape);
    ctx.strokeStyle = 'rgb(160, 160, 160)';
    ctx.stroke(shape);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, (this.width / 2) - (this.getFontLength(text) * 8), this.height / 2);
    ctx.restore();

    this.renderChildren();
  }

  getInsertableIndex(ex, ey) {
    for (let i = 0; i <= this.children.length; i += 1) {
      const prev = this.children[i - 1];
      const now = this.children[i];
      const start = prev ? prev.y + prev.height : this.y;
      const end = now ? now.y : this.y + this.height;

      if ((this.x + this.width <= ex && ex <= this.x + this.width + (prev || now).width)
        && (start < ey && ey < end)) {
        return i;
      }
    }

    return -1;
  }

  hilightInsertableArea(index) {
    if (index >= 0) {
      const { ctx } = this;
      const conditionWidth = 220;
      const marginX = 90;
      const cnd = this.children[index];
      const end = cnd ? cnd.y : this.y + this.height;
      const x = this.x + this.width + marginX;
      const y = end;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + conditionWidth, y);
      ctx.stroke();
    }
  }

  onDrop(dragObject) {
    if (dragObject.type === 'determineCondition') {
      const children = this.refObj.children;
      const duplicate = children.find(v => v.conditionId === dragObject.refObj.id);
      if (duplicate) {
        PFComponent.showMessage(bxMsg('duplicate'), 'warning');
      } else {
        // 새 항목 추가
        const id = `#NEW${(`${10000 + counter++}`).substring(1)}`;
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
        children.push(this.nodeMap[id]);
      }
    }
  }

  onDragOver(dragObject) {
    if (dragObject.type === 'determineCondition') {
      this.hilight();
    }
  }

  onClick([ex, ey]) {
    const { y, width, height } = this;
    const oy = y + (height / 2);
    const r = width / 2;
    // icon click
    if (oy - r <= ey && ey <= oy + r) {
      this.toggle();
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

