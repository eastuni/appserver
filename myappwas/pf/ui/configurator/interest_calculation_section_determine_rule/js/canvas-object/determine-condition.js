class DetermineCondition extends CanvasObject {
  constructor(config) {
    super(config);
    this.type = 'determineCondition';
    this.draggable = true;
    if (config) {
      this.width = config.width || 220;

      // always having only 1 children
      const nextState = config.nodeMap[config.next]
      if (nextState) {
        const cls = nextState.leafNodeYn === 'Y' ? LeafNode : Node;
        this.children = [
          new cls({
            ctx: this.ctx,
            x: this.x + this.width,
            y: this.y,
            refObj: nextState,
            parent: this,
            nodeMap: config.nodeMap,
            determineConditionMap: config.determineConditionMap,
          }),
        ];
        this.height = this.children[0].height;
      } else {
        this.children = [];
        this.height = 90;
      }
    }
  }

  getShape() {
    const shape = new Path2D();
    const { width, height } = this;

    shape.moveTo(0, height / 2);
    shape.lineTo(width, height / 2);

    return shape;
  }

  render() {
    const { ctx, x, y, width, height } = this;
    const text = this.getText(this.refObj);
    const shape = this.getShape();
    const fontSize = 12;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgb(166, 166, 166)';
    ctx.lineWidth = 2.25;
    ctx.stroke(shape);
    ctx.font = `bolder ${fontSize}px sans-serif`;
    ctx.fillStyle = 'black';
    const lines = text.split('\n');
    ctx.textBaseline = 'top';
    const textHeight = -lines.length * 16;
    lines.forEach((line, i) => {
      ctx.fillText(line, (width / 2) - (this.getFontLength(line) * (fontSize / 2)), (height / 2) + textHeight + (16 * i));
    });

    if (this.parent) {
      const sx = this.parent.x + this.parent.width - x;
      const sy = this.parent.y + (this.parent.height / 2) - y;
      // draw line to state
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(0, height / 2);
      ctx.stroke();
    }

    ctx.restore();

    this.renderChildren();
  }

  getText(cond) {
    const op = codeMapObj.calculationOperatorDscd[cond.operatorDscd];
    const property = codeMapObj.calculationIntervalPropertyDscd;

    switch (op) {
      case 'AND':
      case 'OR':
        return `${this.getText(cond.operand1)} ${op}\n${this.getText(cond.operand2)}`;

      case 'NOT':
        return this.getText(cond.operand1).replace('=', '!=');
      
      case 'EMPTY':
        return `${property[cond.operand1Content]} = ''`;
        
      case 'IS':
        return `${property[cond.operand1Content]} = ${cond.operand2Content}`;

      default:
        return `${property[cond.operand1Content]} ${op} ${property[cond.operand2Content]}`;
    }
  }

  onDrop(dragObject) {
    if (this !== dragObject && dragObject.type === 'determineCondition' && this.parent) {
      const children = this.parent.refObj.children;
      const duplicate = children.find(v => v.conditionId === dragObject.refObj.id);
      if (duplicate) {
        PFComponent.showMessage(bxMsg('duplicate'), 'warning');
      } else {
        const replaceTarget = children.find(v => v.conditionId === this.refObj.id);
        replaceTarget.conditionId = dragObject.refObj.id;
        replaceTarget.process = 'U';
      }
    }
  }

  onDragOver(dragObject) {
    if (this !== dragObject && dragObject.type === 'determineCondition') {
      this.hilight();
    }
  }

  focus() {
    const { ctx, x, y, height } = this;
    const shape = this.getShape();

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke(shape);

    if (this.parent) {
      const sx = (this.parent.x + this.parent.width) - x;
      const sy = (this.parent.y + (this.parent.height / 2)) - y;
      // draw line to state
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(0, height / 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
