class DetermineConditionMenu {
    constructor(config) {
      if (config) {
        this.tntInstId = config.tntInstId;
        this.container = config.container;
        this.determineConditionList = config.determineConditionList;
        this.determineConditionConfig = config.determineConditionConfig;
      }
      
      this.init();
    }
    
    init() {
      $(this.container).on('click', '.refresh-btn', () => {
        this.render();
      });
    }

    render() {
      const tree = $(this.container).find('.tree-nav');
      return new Promise((resolve, reject) => {
        tree.empty();
        PFUI.use(['pfui/tree', 'pfui/menu'], (Tree, Menu) => {
          this.loadNavTreeStore().then((store) => {
            const navTree = new Tree.TreeList({
              render: tree,
              showLine: false,
              showRoot: false,
              checkType: 'none',
              store,
            });

            navTree.on('itemdblclick', (e) => {
              if (e.item.leaf) {
                this.determineConditionConfig.repository.getDetermineCondition(e.item).then((item) => {
                  this.determineConditionConfig.render(item);
                });
              }
            });

            // context menus
            let selectedItem = null;
            const catalogMenu = new Menu.ContextMenu({
              children: [
                this.makeContextMenu('icon-plus', bxMsg('create'), () => {
                  this.determineConditionConfig.render({
                    interestTypeDscd: selectedItem.interestTypeDscd,
                    process: 'C',
                  });
                }),
              ],
            });

            navTree.on('itemcontextmenu', (e) => {
              if (!e.item.leaf) {
                navTree.setSelected(e.item);
                selectedItem = e.item
                var y = e.pageY >= 500 ? e.pageY - (28 * 5) : e.pageY;
                catalogMenu.set('xy', [e.pageX, y]);
                catalogMenu.show();
              }

              return false;
            });

            navTree.render();
            resolve(navTree);
          });
        });
      });
    }
    
    loadNavTreeStore() {
      return new Promise((resolve, reject) => {
        PFUI.use(['pfui/data'], (Data) => {
          const catalog = codeArrayObj.interestTypeDscd.map(({code, name}) => ({
            cls: 'Folder',
            id: code,
            text: name,
            children: this.determineConditionList
              .filter(determineCondition => determineCondition.interestTypeDscd === code)
              .map(determineCondition => Object.assign(determineCondition, {
                cls: 'PT',
                text: determineCondition.content,
                leaf: true,
              })),
          }));
          const data = this.determineConditionList.map(determineCondition => Object.assign(determineCondition, {
            cls: 'PT',
            text: determineCondition.content,
            leaf: true,
          }))

          const store = new Data.TreeStore({
            autoLoad: false,
            data,
          });

          store.on('load', () => {
            resolve(store);
          });

          store.load();
        });

      });
    }

    makeContextMenu(iconCls, text, clickEvent, UIEvent) {
      return {
        iconCls,
        text,
        listeners: {
          click: clickEvent,
          afterRenderUI() {
            if (UIEvent) UIEvent();
          },
        },
      };
    }

}
