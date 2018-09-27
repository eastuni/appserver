/**
 * @author Choi Junhyeok
 * @version $$id: main-menu.js, v 0.1 2017-06-16 $$
 */
var modifyFlag = false;
var onEvent = PFUtil.makeEventBinder($(".pf-cal"));

const CalculationFormulaMainMenuController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationFormulaMainMenuController;

      binder("click", ".sidebar-toggler", function(e) {
        var $target = $(e.currentTarget);

        self.$root.toggleClass("contents-expand");

        if(self.$root.hasClass("contents-expand"))
          $target.text(">");
        else
          $target.text("<");

        setTimeout(function() {
          $(".manual-resize-component:visible").resize();
        }, 600);
      });

      /*
       * search menu
       */
      binder("click", ".refresh-btn", function(e) {
        self.$root.find(".calculation-formula-search-name").val("");
        self.master.renderMainMenu();
        $(".pf-detail-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-formula-search-name, .search-btn", function(e) {
        if ($(e.relatedTarget).hasClass("calculation-formula-search-list-wrap")
            || $(e.relatedTarget).hasClass("pfui-tree-list")) // for IE
          return;
        self.$root.find(".calculation-formula-search-list-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-formula-search-list-wrap", function(e) {
        self.$root.find(".calculation-formula-search-list-wrap").removeClass("active");
      });

      binder("focus", ".calculation-formula-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("keyup", ".calculation-formula-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("click", ".search-btn", function(e) {
        var keyword = self.$root.find(".calculation-formula-search-name").val().replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

    },

    renderNavTree: function(callBack) {
      var self = CalculationFormulaMainMenuController;
      var loginTntInstId = getLoginTntInstId();
      var navTreeStore;

      PFUI.use(["pfui/tree", "pfui/data", "pfui/menu"], function (Tree, Data, Menu) {
        if (g_serviceType === g_bxmService) {
          var param = {
              header: {
                application: "PF_Factory",
                service: "CalculationFormulaService",
                operation: "getCalculationFormulaForList"
              },
              input: {
                tntInstId: getLoginTntInstId(),
                commonHeader: {
                  loginTntInstId: getLoginTntInstId()
                }
              }
          };

          navTreeStore = new Data.TreeStore({
            autoLoad: false,
            url: "/serviceEndpoint/json/request.json",
            dataProperty: "list",
            map: {
              name: "text",
              id: "id",
            },
            proxy : {
              method : "POST",
              ajaxOptions : {
                contentType: "application/json; charset=UTF-8",
                data:JSON.stringify(param)
              },
              dataType : "json"
            }
          });

        } else {
          navTreeStore = new Data.TreeStore({
            autoLoad: false,
            url: "/calculator/getCalculationFormulaForList.json?tntInstId=" + loginTntInstId + "&commonHeaderMessage={loginTntInstId:'" + loginTntInstId + "'}" ,
            dataProperty: "list",
            map: {
              name: "text",
              id: "id",
            }
          });
        }

        self.configNavTreeStore(navTreeStore, function() {
          self.$root.find(".pf-cal-tree-nav").empty();

          navTree = new Tree.TreeList({
            render : ".pf-cal-tree-nav",
            showLine : false,
            store : navTreeStore,
            checkType : "none",
            showRoot : false
          });
          navTree.render();

          navTree.on("itemdblclick", function(e) {
            if (e.item.cls === "PT") {
            	if(!modifyFlag){
            		self.master.renderFormulaForm(e.item);
            	}else{
            		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
            			self.master.renderFormulaForm(e.item);
                        modifyFlag = false;
                    }, function() {
                        return;
                    });
            	}
            }
          });

          var formulaTypeContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-plus", bxMsg("createNewCalculationFormula"), self.contextMenuEvent.createFormula),
              ]
          });

          var formulaContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-zoom-in", bxMsg("inquiry"), self.contextMenuEvent.openFormula),
              self.makeContextMenu("icon-remove", bxMsg("delete"), self.contextMenuEvent.deleteFormula),
              ]
          });

          navTree.on("itemcontextmenu", function(ev) {
            var item = ev.item;
            var contextMenu;

            navTree.setSelected(item);
            self.selectedItem = item;

            if (item.cls === "PT")
              contextMenu = formulaContextMenu;
            else
              contextMenu = formulaTypeContextMenu;

            var y = ev.pageY >= 500 ? ev.pageY-(28*5) : ev.pageY;
            contextMenu.set("xy",[ev.pageX,y]);
            contextMenu.show();

            return false;
          });

          self.navTree = navTree;
          self.navTreeStore = navTreeStore;

          if (callBack && typeof(callBack) === "function")
            callBack(navTree, navTreeStore);
        });
      });
    },

    configNavTreeStore: function(navTreeStore, callBack) {
      var self = CalculationFormulaMainMenuController;
      var loginTntInstId = getLoginTntInstId();

      navTreeStore.on("beforeload", function (ev) {
        navTreeStore.set("map", {
          name: "text",
        });
      });

      navTreeStore.on("beforeprocessload", function (ev) {
        var data = ev.data;
        var category = "formulaTypeCode";
        var typeOf = [];
        var detailTypeOf = [];

        if (data.ModelMap) {
          data.responseMessage = data.ModelMap.responseMessage;
          delete data.ModelMap.responseMessage;
        }

        var listData = data.responseMessage || [];

        data.list = [];

        // create category
        for (var i in codeArrayObj[category]) {
          var folderData = {};
          folderData.cls = "Folder";
          folderData.id = codeArrayObj[category][i].code;
          folderData.name = codeArrayObj[category][i].name;
          folderData.children = [];
          typeOf[folderData.id] = i;
          data.list.push(folderData);
        }

        // put listData on tree
        for (var i in listData) {
          var dt = listData[i];
          dt.leaf = true;
          dt.cls = "PT";
          dt.id = dt.formulaId;
          dt.name = dt.formulaName;

          var tpCd = dt.formulaTypeCode;

          if (tpCd && typeOf[tpCd])
            data.list[typeOf[tpCd]].children.push(dt);
          else
            data.list.push(dt);
        }
      });

      navTreeStore.on("load", function() {
        if (callBack && typeof(callBack) === "function")
          callBack();
      });

      navTreeStore.load();
    },

    traceTree: function(item) {
      var self = CalculationFormulaMainMenuController;
      var category = self.navTreeStore.findNode(item.formulaTypeCode);

      if (category) {
        self.navTree.expandNode(category);

        if(typeof item.formulaId === 'string'){
        	item.formulaId = Number(item.formulaId);
        }

        var node = self.navTreeStore.findNode(item.formulaId);
        if (node) {
          self.navTree.setSelected(node);
        }
      }
    },

    makeContextMenu: function(icon, title, clickEvent, UIEvent) {
      var listener;

      if (UIEvent){
        listener = {
            click: function (e) {
              clickEvent();
            },
            afterRenderUI: function(e) {
              UIEvent();
            }
        }
      } else {
        listener = {
            click: function (e) {
              clickEvent();
            }
        }
      }

      var contextMenu = {
          iconCls: icon,
          text: title,
          listeners: listener
      }

      return contextMenu;
    },

    contextMenuEvent: {
      openFormula: function() {
        var self = CalculationFormulaMainMenuController;
        self.master.renderFormulaForm(self.selectedItem);
      },

      createFormula: function() {
        var self = CalculationFormulaMainMenuController;
        if (!self.master.checkProject()) return;
        renderCalculationFormulaCreatePopup(self);

      },

      deleteFormula: function() {
        var self = CalculationFormulaMainMenuController;
        if (!self.master.checkProject()) return;

        var item = self.selectedItem;

        PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
          self.master.deleteCalculationFormula(item, function(responseData) {
            PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
            self.master.renderMainMenu(item);
          });
        });
      }
    },

    renderSearchTree: function(keyword) {
      var self = CalculationFormulaMainMenuController;

      self.$root.find(".calculation-formula-search-list-wrap").addClass("active");
      self.$root.find(".calculation-formula-search-list-wrap").empty();

      var data = [];
      $.each(self.navTreeStore.findNodesBy(function(node) {
          return keyword ? node.cls === "PT" && node.text.toUpperCase().search(keyword.toUpperCase()) >= 0 : 0;
      }), function(index, item) {
        data.push({
          text: item.text,
          formulaId: item.formulaId,
          formulaTypeCode: item.formulaTypeCode
        });
      });

      PFUI.use(["pfui/tree", "pfui/data"], function (Tree, Data) {
        var store = new Data.TreeStore({
          autoLoad: false,
          dataProperty: "list",
          data: data
        });

        store.on("load", function() {
          var tree = new Tree.TreeList({
            render : ".calculation-formula-search-list-wrap",
            showLine : false,
            store : store,
            showRoot : false
          });

          tree.render();

          tree.on("itemdblclick", function(e) {
            var node = self.navTreeStore.findNode(e.item.formulaId);
            self.traceTree(node);
            self.master.renderFormulaForm(node);
            self.$root.find(".calculation-formula-search-list-wrap").removeClass("active");
          });
        });
        store.load();

      });
    }

};