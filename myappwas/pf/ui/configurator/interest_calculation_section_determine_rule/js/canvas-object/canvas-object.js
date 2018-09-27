const dictionary = {
  txDt: '거래일',
  txPrvDt: '거래전일',
  timeBnftLossDt: '기한이익상실일',
  ovrduBaseDt: '연체기준일',
  ovrduStartDt: '연체시작일',
  balOvrduBaseDt: '잔액연체기준일',
  balOvrduStartDt: '잔액연체시작일',
  holidyDfrdOvrduBaseDt: '이연연체기준일',
  holidyDfrdBalOvrduBaseDt: '이연잔액연체기준일',
  calStartDt: '시작일',
  calStartPrvDt: '시작전일',
  calStartNxtDt: '시작익일',
  calEndDt: '종료일',
  calEndPrvDt: '종료전일',
  calEndNxtDt: '종료익일',
  pymntCyclCorrespdngDt: '납입주기응당일',
  pymntCyclCorrespdngNxtDt: '납입주기응당일 익일',
  pymntCyclDt: '납입주기응당일',
  pymntCyclNxtDt: '납입주기응당일 익일',
  intCalIntervalDscd: '이자계산구간구분',
  repymntWayDscd: '상환방법구분',
};

class CanvasObject {
  constructor(config) {
    if (config) {
      this.ctx = config.ctx;
      this.x = config.x || 0;
      this.y = config.y || 0;
      this.width = config.width || 0;
      this.height = config.height || 0;
      this.refObj = config.refObj;
      this.parent = config.parent;
      this.children = config.children || [];
      this.stateMap = config.stateMap || {};
      this.conditionMap = config.conditionMap || {};
      this.draggable = false;
      this.foldable = false;
      this.folded = false;
    }
  }

  hasChild() {
    return this.children && this.children.length > 0;
  }

  getParent() {
    return this.parent;
  }

  render() {
    throw new Error('Unimplemented');
  }

  renderChildren() {
    if (this.children) {
      this.children.forEach(c => c.render());
    }
  }

  move(offsetX, offsetY) {
    this.x += offsetX;
    this.y += offsetY;

    if (this.hasChild()) {
      this.children.forEach((child) => {
        child.move(offsetX, offsetY);
      });
    }
  }

  getFontLength(str='') {
    return str.split('')
      .map(x => escape(x).length > 4 ? 1 : 0.5)
      .reduce((x, y) => x + y, 0);
  }

  hilight() {
    const { ctx, width, height } = this;
    const stroke = new Path2D();
    const radius = 5;

    stroke.moveTo(radius, 0);
    stroke.lineTo(width - radius, 0);
    stroke.quadraticCurveTo(width, 0, width, radius);
    stroke.lineTo(width, height - radius);
    stroke.quadraticCurveTo(width, height, width - radius, height);
    stroke.lineTo(radius, height);
    stroke.quadraticCurveTo(0, height, 0, height - radius);
    stroke.lineTo(0, radius);
    stroke.quadraticCurveTo(0, 0, radius, 0);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.stroke(stroke);
    ctx.restore();
  }

  isDraggable() {
    return this.draggable;
  }

  onDrop() {
  }

  onDragOver() {
  }

  onClick() {
    console.log(this.refObj.id);
  }

  isFoldable() {
    return this.foldable;
  }

  fold() {
    if (this.isFoldable()) {
      this.folded = true;
      this.refObj.folded = true;
    }
    (this.children || []).forEach(c => c.fold());
  }

  unfold() {
    if (this.isFoldable()) {
      this.folded = false;
      this.refObj.folded = false;
    }
  }

  toggle() {
    return this.folded ? this.unfold() : this.fold();
  }

  focus() {
  }

  tooltip(ex, ey, scale) {
    function getRect(width, height, radius = 0) {
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
    const width = 200 * scale;
    const height = 30 * scale;
    const fontSize = 14 * scale;
    const shape = getRect(width, height, 10 * scale);
    this.ctx.save();
    this.ctx.translate(ex, ey);
    this.ctx.fillStyle = '#b3b4ce';
    this.ctx.fill(shape);
    this.ctx.strokeStyle = '#b3b4ce';
    this.ctx.lineWidth = 2;
    this.ctx.stroke(shape);
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillText(this.refObj.content, 0, height / 2);
    this.ctx.restore();
  }
}

