class Type extends CanvasObject {
  constructor(config) {
    super(config);
    this.type = 'type';
    this.width = config.width || 140;
    this.height = config.height || 100;
    this.draggable = true;

    if (config) {
      this.parent = config.parent;
    }
  }

  getShape(codeHeight) {
    const codeShape = new Path2D();
    const periodShape = new Path2D();
    const { width, height } = this;
    const radius = 10;

    codeShape.moveTo(radius, 0);
    codeShape.lineTo(width - radius, 0);
    codeShape.quadraticCurveTo(width, 0, width, radius);
    codeShape.lineTo(width, codeHeight);
    codeShape.lineTo(0, codeHeight);
    codeShape.lineTo(0, radius);
    codeShape.quadraticCurveTo(0, 0, radius, 0);

    periodShape.moveTo(0, codeHeight);
    periodShape.lineTo(width, codeHeight);
    periodShape.lineTo(width, height - radius);
    periodShape.quadraticCurveTo(width, height, width - radius, height);
    periodShape.lineTo(radius, height);
    periodShape.quadraticCurveTo(0, height, 0, height - radius);
    periodShape.lineTo(0, codeHeight);

    return [codeShape, periodShape];
  }

  static getRect(width, height, radius = 0) {
    const shape = new Path2D();

    shape.moveTo(radius, 0);
    shape.lineTo(width - radius, 0);
    shape.quadraticCurveTo(width, 0, width, radius);
    shape.lineTo(width, height - radius);
    shape.quadraticCurveTo(width, height, width - radius, height);
    shape.lineTo(radius, height);
    shape.quadraticCurveTo(0, height, 0, height - radius);
    shape.lineTo(0, radius);
    shape.quadraticCurveTo(0, 0, radius, 0);

    return shape;
  }

  render() {
    const { ctx, x, y, width, height } = this;
    const codeName = codeMapObj.interestTypeDscd[this.refObj.interestTypeDscd];
    const start = codeMapObj.calculationIntervalPropertyDscd[this.refObj.startDateDscd];
    const end = codeMapObj.calculationIntervalPropertyDscd[this.refObj.endDateDscd];
    const text = start === end ? `${start} 1일` : `${start} ~ ${end}`;
    const container = Type.getRect(width, height, 10);
    const padding = 10;
    const [codeWidth, codeHeight] = [width - (padding * 2), 30];
    const [periodWidth, periodHeight] = [width - (padding * 2), height - codeHeight - (padding * 2) - 5];
    const codeShape = Type.getRect(codeWidth, codeHeight, 5);
    const periodShape = Type.getRect(periodWidth, periodHeight, 5);

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgb(166, 166, 166)';
    ctx.lineWidth = 2.25;
    ctx.stroke(container);

    ctx.translate(padding, padding);
    ctx.fillStyle = 'black';
    ctx.fill(codeShape);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'center';
    ctx.fillText(codeName, (codeWidth / 2) - (this.getFontLength(codeName) * 8), codeHeight * (2 / 3));

    ctx.translate(0, codeHeight + 5);
    ctx.fillStyle = 'rgb(166, 166, 166)';
    ctx.fill(periodShape);

    const fontSize = 12;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'white';

    const len = this.getFontLength(text);
    if (len > 10) {
      const [first, second] = text.split(' ~ ');
      ctx.textBaseline = 'bottom';
      ctx.fillText(first, (periodWidth / 2) - (this.getFontLength(first) * (fontSize / 2)), (periodHeight / 2));
      ctx.textBaseline = 'top';
      const sec = `~ ${second}`;
      ctx.fillText(sec, (periodWidth / 2) - (this.getFontLength(sec) * (fontSize / 2)), (periodHeight / 2));
    } else {
      ctx.fillText(text, (periodWidth / 2) - (this.getFontLength(text) * (fontSize / 2)), (periodHeight / 2));
    }

    ctx.restore();
  }

  onDragOver(dragObject) {
    if (dragObject.type === 'type') {
      if (this.parent) {
        this.parent.hilight();
      }
    }
  }

  onDrop(dragObject, coord) {
    if (this.parent) {
      this.parent.onDrop(dragObject, coord);
    }
  }
}
