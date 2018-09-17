class ContextMenu extends CanvasObject {
  constructor(config) {
    super(config);

    const menuHeight = 30;
    if (config) {
      this.scale = config.scale || 1;
      this.width = 20 + Math.max(...config.menu.map(menu => 14 * this.getFontLength(menu.text || menu.action)));
      this.height = menuHeight * this.scale * config.menu.length;
      this.children = config.menu.map((menu, i) => new Menu({
        ctx: this.ctx,
        x: this.x,
        y: this.y + (menuHeight * this.scale * i),
        width: this.width,
        height: menuHeight,
        scale: this.scale,
        text: menu.text || menu.action,
        action: menu.action,
        onEvent: menu.onEvent,
      }));
    }
  }

  render() {
    const { ctx, x, y, width, height } = this;
    this.children.forEach((menu) => {
      menu.render();
    });

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.restore();
  }

  setScale(scale) {
    this.width *= scale / this.scale;
    this.height *= scale / this.scale;
    this.children.forEach((c, i) => {
      c.width *= scale / this.scale;
      c.height *= scale / this.scale;
      c.y = this.y + c.height * i
      c.scale = scale;
    });
    this.scale = scale;
  }
}
