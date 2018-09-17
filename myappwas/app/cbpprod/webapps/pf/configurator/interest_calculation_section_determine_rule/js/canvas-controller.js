class CanvasController {
  constructor({
    renderTo,
    parent,
    rootId = 'S0003',
  }) {
    this.renderTo = renderTo;
    this.rootId = rootId;
    this.parent = parent;
  }

  init(data) {
    const treeToList = (tree, list) => {
      const stack = tree ? [tree] : [];
      const result = [];
      while (stack.length) {
        const node = stack.pop();
        node.folded = true;
        result.push(node);
        if (node.children) {
          stack.push(...node.children);
        }
      }
      return result;
    };

    function listToMap(list) {
      return (list || []).reduce((m, v) => {
        m[v.id] = v;
        return m;
      }, {});
    }

    const nodeList = treeToList(data.rootNode);
    const nodeMap = listToMap(nodeList);
    const determineConditionMap = listToMap(data.determineConditionList);
    const sectionMap = listToMap(data.sectionList);

    Object.values(nodeMap)
      .filter(node => node.leafNodeYn === 'Y')
      .forEach((node) => {
        node.sectionList = node.sectionList.map(id => sectionMap[id]);
        node.children = node.sectionList;
      });

    Object.values(determineConditionMap)
      .filter(cnd => ['AND', 'OR', 'NOT'].includes(codeMapObj.calculationOperatorDscd[cnd.operatorDscd]))
      .forEach((cnd) => {
        cnd.operand1 = determineConditionMap[cnd.operand1Content];
        cnd.operand2 = determineConditionMap[cnd.operand2Content];
      });

    this.nodeMap = nodeMap;
    this.determineConditionMap = determineConditionMap;
    this.sectionMap = sectionMap;
    
    if (!this.configured) {
      this.configure();
    }
    
    this.generate(this.root);
    this.draw();
  }
    
  configure() {
    // Canvas
    const canvas = document.querySelector(this.renderTo);

    if (canvas && canvas.getContext) {
      this.ctx = canvas.getContext('2d');
      this.objects = [];
      this.deletedNodes = [];
      this.floatingObject = null;
      this.history = [];
      this.diff = [];

      // 원점
      this.ox = 0;
      this.oy = 0;

      // 축척
      this.screenWidth = getComputedStyle(canvas).width.replace('px', '');
      this.screenHeight = getComputedStyle(canvas).height.replace('px', '');
      this.scale = canvas.width / this.screenWidth;

      this.mouse = {
        over: null,
        holded: null,
      };

      this.menus = this.getMenu();
      this.initEventListener();
    }

    this.configured = true;
    return this;
  }

  generate(node, x = 0, y = 0) {
    if (!node) {
      this.objects = [];
      return;
    }

    const cls = node.leafNodeYn !== 'Y' ? Node : LeafNode;
    const nodeObj = new cls({
      ctx: this.ctx,
      x,
      y,
      refObj: node,
      nodeMap: this.nodeMap,
      determineConditionMap: this.determineConditionMap,
    });

    const stack = [nodeObj];
    while (stack.length > 0) {
      const obj = stack.pop();
      this.objects.push(obj);
      (obj.children || []).forEach((child) => {
        if (['node', 'determineCondition', 'leafNode'].includes(child.type)) {
          stack.push(child);
        }
      });
    }
  }

  regenerate() {
    this.history.push(this.objects);
    this.objects = [];
    this.generate(this.root);
  }

  draw() {
    this.clear();
    const root = this.objects.find(v => v.refObj === this.root);
    if (root) {
      root.render();
      if (this.floatingObject) {
        this.floatingObject.render();
        this.floatingObject.hilight();
      }
    }
  }

  drawline(sx, sy, width, height) {
    const [ex, ey] = [sx + width, sy + height];
    const space = 100;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgb(210, 210, 210)';
    this.ctx.beginPath();
    for (let ix = sx; ix < ex; ix += space) {
      this.ctx.moveTo(ix, sy);
      this.ctx.lineTo(ix, ey);
    }
    for (let iy = sy; iy < ey; iy += space) {
      this.ctx.moveTo(sx, iy);
      this.ctx.lineTo(ex, iy);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  clear() {
    const width = this.screenWidth * this.scale;
    const height = this.screenHeight * this.scale;
    const [sx, sy] = [this.ox, this.oy];
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(sx, sy, width, height);
    this.drawline(sx, sy, width, height);
    this.ctx.restore();
  }

  getObject(offsetX, offsetY) {
    const [ex, ey] = this.getCoord(offsetX, offsetY);
    const root = this.objects.find(v => v.refObj === this.root);
    if (!root) return null;

    const stack = [...(this.floatingObject ? [this.floatingObject] : []), root];
    while (stack.length > 0) {
      const obj = stack.pop();
      if (obj.type === 'leafNode') {
        for (let c of (obj.children || [])) {
          const { x, y, width, height } = c;
          if (x <= ex && ex <= x + width && y <= ey && ey <= y + height) {
            return c;
          }
        }
      } else {
        (obj.children || []).forEach(c => stack.push(c));
      }

      const { x, y, width, height } = obj;
      if (x <= ex && ex <= x + width && y <= ey && ey <= y + height) {
        return obj;
      }
    }
  }

  initEventListener() {
    const { ctx, mouse } = this;
    const { canvas } = ctx;


    /**
     * 마우스 Wheel 시 동작
     * @content
     * 1. Wheel - Scroll
     * 2. Ctrl + Wheel - Zoom in/out
     */
    canvas.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const w = Math.abs(e.wheelDeltaY / 1500);
        const z = e.wheelDeltaY > 0 ? (1 + w) : 1 / (1 + w);
        const factor = z / this.scale > 1 ? this.scale : z;

        ctx.translate(this.ox, this.oy);
        ctx.scale(factor, factor);
        this.ox += e.offsetX * this.scale * (1 - (1 / factor));
        this.oy += e.offsetY * this.scale * (1 - (1 / factor));
        ctx.translate(-this.ox, -this.oy);
        this.scale /= factor;

        this.draw();
      } else {
        ctx.translate(0, e.wheelDeltaY);
        this.oy -= e.wheelDeltaY;
        if (this.floatingObject) {
          this.floatingObject.move(0, -e.wheelDeltaY);
        }
        this.draw();
      }
    });


    /**
     * @content 우클릭 시 컨텍스트 메뉴 출력
     */
    canvas.addEventListener('contextmenu', (e) => {
      if (mouse.over) {
        e.preventDefault();

        const [ex, ey] = this.getCoord(e.offsetX, e.offsetY);
        const menu = this.menus[mouse.over.type];
        if (menu) {
          menu.move(ex - menu.x, ey - menu.y);
          menu.setScale(this.scale);
          this.objects.push(menu);
          this.draw();
          this.objects.pop();
          this.contextMenu = menu;
          this.rightClicked = mouse.over;
        }
      }
    });


    /**
     * @content Object drag를 위해 클릭시 좌표를 보존한다
     * @content Context Menu 클릭 시 동작을 정의한다
     */
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const isRight = 'which' in e ? e.which === 3 : e.button === 2;
      const [ex, ey] = this.getCoord(e.offsetX, e.offsetY);

      if (this.contextMenu) {
        const button = this.contextMenu.children
          .filter(({ x, y, width, height }) =>
            x < ex && ex < x + width && y < ey && ey < y + height)[0];
        if (button) {
          const target = this.rightClicked;
          button.doAction(target, () => {
            this.regenerate();
          });
        }
        this.contextMenu = null;
        this.draw();
      } else if (!isRight) {
        canvas.clicked = true;
        this.clickedX = e.offsetX;
        this.clickedY = e.offsetY;

        const target = mouse.over;
        if (target) {
          target.onClick([ex, ey]);
          if (target.isFoldable()) {
            this.regenerate();
            this.draw();
          }
        }
        if (target && target.isDraggable()) {
          this.floatingObject = target;
          this.history.push(this.objects);
          this.objects = this.objects.filter(v => v !== this.floatingObject);
          this.tempx = target.x;
          this.tempy = target.y;
        }
      }
    });


    /**
     * @content Drop 액션을 정의한다. 이동 가능한 Object는 위치를 바꾸고,
     *   이외에는 원래 위치로 되돌린다
     */
    canvas.addEventListener('mouseup', (e) => {
      if (canvas.clicked) {
        canvas.clicked = false;
        const target = this.floatingObject;
        if (target) {
          const state = target.parent;
          const [ex, ey] = this.getCoord(e.offsetX, e.offsetY);
          const tIndex = state.children.indexOf(target);
          const index = state.getInsertableIndex(ex, ey);

          if (index >= 0) {
            if (state.type === 'node') {
              const transition = state.refObj.children[tIndex];
              state.refObj.children = state.refObj.children
                .filter(c => c.condition !== target.refObj.id);
              state.refObj.children.splice(index <= tIndex ? index : index - 1, 0, transition);
            } else if (state.type === 'leafNode') {
              state.refObj.children = state.refObj.children.filter(c => c.id !== target.refObj.id);
              state.refObj.children.splice(index <= tIndex ? index : index - 1, 0, target.refObj);
            }
            this.regenerate();
          } else {
            target.move(this.tempx - target.x, this.tempy - target.y);
            this.objects = this.history.pop();
          }
          this.floatingObject = null;
          this.draw();
        }
      }
    });


    /**
     * @content 마우스가 캔버스에서 벗어나는 경우 드래그하던 Object를 초기화한다
     */
    canvas.addEventListener('mouseout', () => {
      if (canvas.clicked) {
        canvas.clicked = false;
        const target = this.floatingObject;
        if (target) {
          target.move(this.tempx - target.x, this.tempy - target.y);
          this.objects = this.history.pop();
          this.floatingObject = null;
          this.draw();
        }
      }
    });


    /**
     * @content 마우스의 움직임을 추적한다
     * 1. Context 메뉴가 보여지는 경우 hover 효과
     * 2. Drag 중인 Object가 있는 경우 해당 Object를 re-rendering한다
     *    - Object가 이동 가능한 위치에 위치하면 이를 화면에 표시한다
     * 3. 시점 변경(translate)의 경우 원점의 위치를 조정한다
     */
    canvas.addEventListener('mousemove', (e) => {
      const [ex, ey] = this.getCoord(e.offsetX, e.offsetY);
      if (this.contextMenu) {
        const match = this.getObject(e.offsetX, e.offsetY);
        mouse.over = match;

        const button = this.contextMenu.children
          .filter(({ x, y, width, height }) =>
            x < ex && ex < x + width && y < ey && ey < y + height)[0];
        this.contextMenu.render(this.scale);
        if (button) {
          button.hilight(this.scale);
        }
      } else if (canvas.clicked) {
        const x = (e.offsetX - this.clickedX) * this.scale;
        const y = (e.offsetY - this.clickedY) * this.scale;
        this.clickedX = e.offsetX;
        this.clickedY = e.offsetY;

        const target = mouse.over;
        if (target && target.isDraggable()) {
          target.move(x, y);
          this.draw();

          const node = target.parent;

          // sibling condition
          const index = node.getInsertableIndex(ex, ey);
          node.hilightInsertableArea(index);
          node.hilight();
        } else {
          ctx.translate(x, y);
          this.ox -= x;
          this.oy -= y;
          this.draw();
        }
      } else {
        const match = this.getObject(e.offsetX, e.offsetY);
        if (mouse.over !== match) {
          this.draw();
          if (match) {
            match.tooltip(ex, ey, this.scale);
          }
        }
        mouse.over = match;
      }
    });


    /**
     * @content Double Click 시 해당 Object 시점으로 변경한다
     */
    // canvas.addEventListener('dblclick', () => {
    //   console.log(this.ctx);
    //   const target = mouse.over;
    //   if (target && target.type === 'node') {
    //     const [ex, ey] = [this.ox - target.x, this.oy - target.y];
    //     ctx.translate(this.ox - target.x, ey);
    //     this.ox -= ex;
    //     this.oy -= ey;
    //     this.draw();
    //   }
    // });


    /**
     * @content 계산유형 드래그 시 해당 Object를 생성한다
     */
    canvas.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (e.relatedTarget) {
        const id = e.dataTransfer.types[0].toUpperCase(); // hack
        const [cls, map] = ({
          C: [DetermineCondition, this.determineConditionMap],
          T: [Type, this.sectionMap],
          S: [Type, this.sectionMap],
        })[id[0]];

        const obj = map[id];
        if (obj) {
          this.floatingObject = new cls({
            ctx: this.ctx,
            refObj: map[id],
            nodeMap: this.nodeMap,
            determineConditionMap: this.determineConditionMap,
          });
        }
      }
    });


    /**
     * 외부에서 Drag한 Object의 동작을 정의한다
     *
     * @content
     * 1. 추가할 Type를 마우스 위치에 re-render
     * 2. Leaf Node에서 Type을 삽입할 수 있는 위치 표시
     */
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dragObject = this.floatingObject;

      if (dragObject) {
        const target = this.getObject(e.offsetX, e.offsetY);
        const [ex, ey] = this.getCoord(e.offsetX, e.offsetY);
        dragObject.move(ex - dragObject.x, ey - dragObject.y);
        this.draw();

        if (target && target !== this.floatingObject) {
          target.onDragOver(dragObject, [ex, ey]);
        }
      }
    });

    canvas.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.floatingObject = null;
      this.draw();
    });


    /**
     * 외부 Object Drop시 동작을 정의한다
     */
    canvas.addEventListener('drop', (e) => {
      const target = this.getObject(e.offsetX, e.offsetY);
      const dragObject = this.floatingObject;

      if (target && dragObject) {
        const coord = this.getCoord(e.offsetX, e.offsetY);
        target.onDrop(dragObject, coord);
        this.regenerate();
      }

      this.floatingObject = null;
      this.draw();
    });
  }

  getCoord(offsetX, offsetY) {
    return [this.ox + (offsetX * this.scale), this.oy + (offsetY * this.scale)];
  }

  getMenu(event) {
    const { ctx } = this;

    const deleteNode = (target) => {
      console.log('delete', target);

      // parent state
      const parent = this.objects
        .filter(v => v.type === 'node' && v.refObj.children
          .filter(c => c.next === target.refObj.id && c.conditionId === target.parent.refObj.id).length > 0)[0];
      
      if (target.refObj.process !== 'C') {
        target.refObj.process = 'D';
        this.deletedNodes.push(target.refObj);
      }
      if (parent) {
        parent.refObj.children = parent.refObj.children.filter(v => v.id !== target.refObj.id);
        this.diff.push(target.refObj);

        // 마지막 node였던 경우 상위 node 제거
        if (parent.refObj.children.length === 0) {
          deleteNode(parent);
        }
      }
    };

    const deleteDetermineCondition = (target) => {
      console.log('delete', target);
      const parent = this.objects
        .filter(v => v.type === 'node' && v.refObj.children.filter(c => c.conditionId === target.refObj.id && c.id === target.children[0].refObj.id)
          .length > 0)[0];
      
      // 하위 node 제거
      deleteNode(target.children[0]);
      
      if (parent) {
        parent.refObj.children = parent.refObj.children.filter(v => v.conditionId !== target.refObj.id);

        // 마지막 condition이었던 경우 상위 node 제거
        if (parent.refObj.children.length === 0) {
          deleteNode(parent);
        }
      }
    };

    return {
      node: new ContextMenu({
        ctx,
        menu: [{
          action: 'modify',
          onEvent: (target) => {
            const content = target.refObj.content;
            target.refObj.content = prompt('Modify Content', content) || content;
            target.refObj.process = 'U';
          },
        },
        {
          action: 'delete',
          onEvent: (target) => {
            deleteNode(target);
          },
        }],
      }),
      determineCondition: new ContextMenu({
        ctx,
        menu: [{
          action: 'delete',
          onEvent: (target) => {
            deleteDetermineCondition(target);
          },
        }],
      }),
      type: new ContextMenu({
        ctx,
        menu: [{
          action: 'delete',
          onEvent: (target) => {
            // parent state
            const { parent } = target;

            if (parent) {
              parent.refObj.children = parent.refObj.children
                .filter(c => c.id !== target.refObj.id);
              parent.refObj.process = 'U';
            }
          },
        }],
      }),
    };
  }

  focus(obj) {
    // const width = this.screenWidth * this.scale;
    // const height = this.screenHeight * this.scale;
    // const [cx, cy] = [width / 3, height / 6];
    // const [tx, ty] = [(this.ox - obj.x) + cx, (this.oy - obj.y) + cy];
    // this.ctx.translate(tx, ty);
    // this.ox -= tx;
    // this.oy -= ty;
    this.draw();
    obj.focus();
  }

  get root() {
    return this.nodeMap[this.rootId];
  }
}
