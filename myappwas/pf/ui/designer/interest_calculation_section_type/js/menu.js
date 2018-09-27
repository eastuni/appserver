class SectionMenu {
    constructor(config) {
      if (config) {
        this.tntInstId = config.tntInstId;
        this.container = config.container;
        this.sectionList = config.sectionList;
        this.sectionConfig = config.sectionConfig;
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
                this.sectionConfig.repository.getSection(e.item).then((item) => {
                  this.sectionConfig.render(item);
                });
              }
            });

            // context menus
            let selectedItem = null;
            const catalogMenu = new Menu.ContextMenu({
              children: [
                this.makeContextMenu('icon-plus', bxMsg('create'), () => {
                  this.sectionConfig.render({
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
            children: this.sectionList
              .filter(section => section.interestTypeDscd === code)
              .map(section => Object.assign(section, {
                cls: 'PT',
                text: section.content,
                leaf: true,
              })),
          }));

          const store = new Data.TreeStore({
            autoLoad: false,
            data: catalog,
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
