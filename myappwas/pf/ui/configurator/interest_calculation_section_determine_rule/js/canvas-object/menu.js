class Menu extends CanvasObject {
  constructor(config) {
    super(config);
    if (config) {
      this.scale = config.scale || 1;
      this.width = config.width || 100;
      this.height = config.height || 30;
      this.text = config.text || config.action;
      this.action = config.action;
      this.onEvent = config.onEvent;
    }
  }

  getShape() {
    const { width, height } = this;
    const shape = new Path2D();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);
    return shape;
  }

  drawButton(background = 'white', color = 'black') {
    const { ctx, x, y, width, height, text } = this;
    const shape = this.getShape();
    const fontSize = 14 * this.scale;

    ctx.save();
    ctx.fillStyle = background;
    ctx.translate(x, y);
    ctx.fill(shape);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(text, width / 5, height * (2 / 3));
    ctx.restore();
  }

  render() {
    this.drawButton('white', 'black');
  }

  hilight() {
    this.drawButton('rgb(240, 240, 240)', 'black');
  }

  doAction(target, callback) {
    this.onEvent(target);
    callback();
  }
}