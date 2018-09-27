class Main {
  constructor(config) {
    const self = this;

    this.renderTo = config.renderTo;

    this.canvasCtl = new CanvasController({
      renderTo: '#canvas',
      parent: this,
    });

    this.nodeTreeGridCtl = new NodeTreeGridController({
      renderTo: '.node-grid',
      parent: this,
      celldblclick(_this, td, cellIndex, record) {
        // find root node
        let rootNode = record;
        if (!record.get('leaf')) {
          while (rootNode.parentNode.getId() !== 'root') {
            rootNode = rootNode.parentNode;
          }
        }

        // change root node
        self.canvasCtl.rootId = rootNode.getId();
        self.canvasCtl.regenerate();

        const root = self.canvasCtl.objects.find(v => v.refObj.id === self.canvasCtl.rootId);
        root.fold();

        let parent = record;
        while (parent.getId() !== 'root') {
          const r = self.canvasCtl.nodeMap[parent.getId()];
          r.folded = false;
          parent = parent.parentNode;
        }

        self.canvasCtl.regenerate();
        self.canvasCtl.draw();
        const obj = self.canvasCtl.objects.find(v => v.refObj.id === record.getId());
        if (obj) {
          self.canvasCtl.focus(obj);
        }
      }
    });

    this.determineConditionGridCtl = new DetermineConditionGridController({
      renderTo: '.condition-grid',
      parent: this,
    });

    this.sectionGridCtl = new SectionGridController({
      renderTo: '.section-grid',
      parent: this,
    });

    this.repository = new InterestCalcuationRepository({
      tntInstId: getLoginTntInstId(),
      loginUserId: getLoginUserId(),
    });
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.render();
    });
  }

  render() {
    const interestCalculationTypeTpl = getTemplate('interestCalculationTypeTpl');
    const main = document.querySelector(this.renderTo);
    main.innerHTML = interestCalculationTypeTpl();

    this.initEventListener();

    const getDetermineConditionList = this.repository.getDetermineConditionList();
    const getSectionList = this.repository.getSectionList();
    const getNodeTree = this.repository.getNodeTree({ baseDate: PFUtil.getToday().replace(/-/g, '') });

    this.nodeTreeGridCtl.render().then((ctl) => {
      getNodeTree.then((root) => {
        const maxDepth = 3;
        const copy = (node, depth) => ({
          id: node.id,
          content: node.content,
          activeYn: node.activeYn,
          children: depth !== maxDepth ? node.children.map(c => copy(c, depth + 1)) : null,
        });
        ctl.setData(copy(root, 1));

        const calendar = document.querySelector('.calendar');
        calendar.value = root.applyStartDate;
      });
    });

    getDetermineConditionList.then((determineConditionList) => {
      this.determineConditionGridCtl.render(determineConditionList);
    });

    getSectionList.then((sectionList) => {
      this.sectionGridCtl.render(sectionList);
    });

    Promise.all([getNodeTree, getDetermineConditionList, getSectionList])
      .then(([root, determineConditionList, sectionList]) => {
        if (root) {
          this.canvasCtl.rootId = 'S0003';//root.id;
        } else {
          PFComponent.showMessage(bxMsg('noInitialData'), 'warning');
        }
        this.canvasCtl.init({
          rootNode: root,
          determineConditionList,
          sectionList
        });
      });
  }

  initEventListener() {
    // save
    const saveBtn = document.querySelector('.save-btn');
    const calendar = document.querySelector('.calendar');

    const make_tree = (node, parent = null) => {
      if (!node) return null;
      const result = {
        stateId: (node.id && !node.id.startsWith('#NEW')) ? node.id : null,
        applyStartDate: node.process === 'C' ? calendar.value.replace(/-/g, '') : node.applyStartDate,
        applyEndDate: node.applyEndDate,
        rootNodeYn: node.rootNodeYn,
        leafNodeYn: node.leafNodeYn,
        activeYn: node.activeYn,
        content: node.content,
        process: node.process,
      };

      if (parent) {
        result.parentId = parent.id;
      }

      if (node.children) {
        // Leaf
        if (node.leafNodeYn === 'Y') {
          result.typeList = node.children.map(tr => tr.id);
        } else {
          result.children = node.children.map((tr) => {
            const out = make_tree(this.canvasCtl.nodeMap[tr.next], node);
            out.conditionId = tr.conditionId;
            return out;
          });
        }
      }

      return result;
    };
    
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
    

    saveBtn.addEventListener('click', () => {
      if (!this.checkProject()) return;

      const target = treeToList(this.canvasCtl.root, []).concat(...this.canvasCtl.deletedNodes)
      .filter(node => node.process != null);

      const nodeList = target .map((node) => {
        const result = {
          id: (node.id && !node.id.startsWith('#NEW')) ? node.id : null,
          applyStartDate: node.process === 'C' ? calendar.value.replace(/-/g, '') : node.applyStartDate,
          applyEndDate: node.applyEndDate,
          rootNodeYn: node.rootNodeYn,
          leafNodeYn: node.leafNodeYn,
          parentId: node.parentId,
          conditionId: node.conditionId,
          activeYn: node.activeYn,
          content: node.content,
          process: node.process,
        };
        
        if (node.parentId) {
          const parent = this.canvasCtl.nodeMap[node.parentId];
          result.inquirySequence = parent.children.findIndex(v => v.id === node.id);
        }
        
        if (node.leafNodeYn === 'Y') {
          result.sectionList = (node.children || []).map(type => type.id);
        }

        return result;
      });
        console.log(nodeList);

      this.repository.saveNode({
        nodeList,
      }).then(() => {
        PFComponent.showMessage(bxMsg('success'), 'success');
        target.forEach((node) => {
          node.process = null;
        });
        this.canvasCtl.deletedNodes = [];
        this.repository.getNodeTree({
          baseDate: calendar.value.replace(/-/g, ''),
          projectId: getSelectedProjectId(),
        }).then((root) => {
          this.canvasCtl.init({
            rootNode: root,
            determineConditionList: this.determineConditionGridCtl.grid.getAllData(),
            sectionList: this.sectionGridCtl.grid.getAllData(),
          });
        });
      });
    });


    // datepicker
    calendar.addEventListener('mousedown', () => {
      $(calendar).datetimepicker({
        format: 'Y-m-d',
        timepicker: false,
        yearEnd: 9999,
        todayButton: true,
      });
    });

    calendar.addEventListener('focusout', () => {
      this.repository.getNodeTree({
        baseDate: calendar.value.replace(/-/g, ''),
        projectId: getSelectedProjectId(),
      }).then((root) => {
        this.canvasCtl.init({
          rootNode: root,
          determineConditionList: this.determineConditionGridCtl.grid.getAllData(),
          sectionList: this.sectionGridCtl.grid.getAllData(),
        });
      });
    });
  }

  checkProject() {
    if(!isHaveProject()){
      haveNotTask();
      return false;
    }

    if (isNotMyTask(getSelectedProjectId())) {
      return false;
    }

    const taskMenu = $(".default-layout-task-menu", parent.document);
    if (taskMenu.find(".my-task-list").first().val() === ""){
      selectNotTask();
      selectedYourTask();
      return false;
    }

    if (taskMenu.find(".your-task").first().attr("data-status") === true){
      selectedYourTask();
      return false;
    }

    return true;
  }
}


const main = new Main({
  renderTo: '.pf-int-cal-tp',
});
main.init();

// pf common
const $el = $('.pf-int-cal-tp');
onEvent = PFUtil.makeEventBinder($el);