/**
 * @author Choi Junhyeok
 * @version $$id: main-menu.js, v 0.1 2017-06-16 $$
 */
var modifyFlag = false;
var onEvent = PFUtil.makeEventBinder($(".pf-cal"));

const CalculationUnitTemplateMainMenuController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationUnitTemplateMainMenuController;

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
        self.$root.find(".calculation-unit-template-search-name").val("");
        self.master.renderMainMenu();
        $(".pf-detail-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-unit-template-search-name, .search-btn", function(e) {
        if ($(e.relatedTarget).hasClass("calculation-unit-template-search-list-wrap")
            || $(e.relatedTarget).hasClass("pfui-tree-list")) // for IE
          return;
        self.$root.find(".calculation-unit-template-search-list-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-unit-template-search-list-wrap", function(e) {
        self.$root.find(".calculation-unit-template-search-list-wrap").removeClass("active");
      });

      binder("focus", ".calculation-unit-template-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("keyup", ".calculation-unit-template-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("click", ".search-btn", function(e) {
        var keyword = self.$root.find(".calculation-unit-template-search-name").val().replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

    },

    renderNavTree: function(callBack) {
      var self = CalculationUnitTemplateMainMenuController;
      var loginTntInstId = getLoginTntInstId();
      var navTreeStore;

      PFUI.use(["pfui/tree", "pfui/data", "pfui/menu"], function (Tree, Data, Menu) {
        if (g_serviceType === g_bxmService) {
          var param = {
              header: {
                application: "PF_Factory",
                service: "CalculationUnitTemplateService",
                operation: "getCalculationUnitTemplateForList"
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
            url: "/calculator/getCalculationUnitTemplateForList.json?tntInstId=" + loginTntInstId + "&commonHeaderMessage={loginTntInstId:'" + loginTntInstId + "'}" ,
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
            		self.master.renderTemplateForm(e.item);
            	}else{
            		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
            			self.master.renderTemplateForm(e.item);
                        modifyFlag = false;
                    }, function() {
                        return;
                    });
            	}
            }
          });

          var templateTypeContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-plus", bxMsg("createNewCalculationUnitTemplate"), self.contextMenuEvent.createTemplate),
              ]
          });

          var templateContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-zoom-in", bxMsg("inquiry"), self.contextMenuEvent.openTemplate),
              self.makeContextMenu("icon-remove", bxMsg("delete"), self.contextMenuEvent.deleteTemplate),
              ]
          });

          navTree.on("itemcontextmenu", function(ev) {
            var item = ev.item;
            var contextMenu;

            navTree.setSelected(item);
            self.selectedItem = item;

            if (item.cls === "PT")
              contextMenu = templateContextMenu;
            else
              contextMenu = templateTypeContextMenu;

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
      var self = CalculationUnitTemplateMainMenuController;
      var loginTntInstId = getLoginTntInstId();

      navTreeStore.on("beforeload", function (ev) {
        navTreeStore.set("map", {
          name: "text",
        });
      });

      navTreeStore.on("beforeprocessload", function (ev) {
        var data = ev.data;
        var category = "CalcnUnitDscd";
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
          var name = self.master.conditionMap[dt.calculationUnitConditionCode] || "";
          dt.leaf = true;
          dt.cls = "PT";
          dt.id = dt.calculationUnitConditionCode;
          dt.name = "[" + dt.calculationUnitConditionCode + "] " + name;

          var tpCd = dt.calculationUnitDistinctionCode;

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
      var self = CalculationUnitTemplateMainMenuController;
      var category = self.navTreeStore.findNode(item.calculationUnitDistinctionCode);

      if (category) {
        self.navTree.expandNode(category);

        var node = self.navTreeStore.findNode(item.calculationUnitConditionCode);
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
      openTemplate: function() {
        var self = CalculationUnitTemplateMainMenuController;
        self.master.renderTemplateForm(self.selectedItem);
      },

      createTemplate: function() {
        var self = CalculationUnitTemplateMainMenuController;
        if (!self.master.checkProject()) return;

        PFPopup.selectConditionTemplate({ targetCondition: ['04'] }, function (cnd) {
          var item = {
              calculationUnitConditionCode: cnd.code,
              activeYn: "N",
              calculationUnitDistinctionCode: self.selectedItem.id,
              calculationRuleExistenceYn: "N"
          };

          self.master.createCalculationUnitTemplate(item, function(responseData) {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
            self.master.renderMainMenu(responseData);
            modifyFlag = false;
          });
        });
      },

      deleteTemplate: function() {
        var self = CalculationUnitTemplateMainMenuController;
        if (!self.master.checkProject()) return;

        var item = self.selectedItem;

        PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
          self.master.deleteCalculationUnitTemplate(item, function(responseData) {
            PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
            self.master.renderMainMenu(item);
            modifyFlag = false;
          });
        });
      }
    },

    renderSearchTree: function(keyword) {
      var self = CalculationUnitTemplateMainMenuController;

      self.$root.find(".calculation-unit-template-search-list-wrap").addClass("active");
      self.$root.find(".calculation-unit-template-search-list-wrap").empty();

      var data = [];
      $.each(self.navTreeStore.findNodesBy(function(node) {
          return keyword ? node.cls === "PT" && node.text.toUpperCase().search(keyword.toUpperCase()) >= 0 : 0;
      }), function(index, item) {
        data.push({
          text: item.text,
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          calculationUnitDistinctionCode: item.calculationUnitDistinctionCode
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
            render : ".calculation-unit-template-search-list-wrap",
            showLine : false,
            store : store,
            showRoot : false
          });

          tree.render();

          tree.on("itemdblclick", function(e) {
            var node = self.navTreeStore.findNode(e.item.calculationUnitConditionCode);
            self.traceTree(node);
            self.master.renderTemplateForm(node);
            self.$root.find(".calculation-unit-template-search-list-wrap").removeClass("active");
          });
        });
        store.load();

      });
    }

};