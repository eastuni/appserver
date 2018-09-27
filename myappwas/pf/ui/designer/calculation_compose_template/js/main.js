/**
 * @author Choi Junhyeok
 * @version $$id: main-menu.js, v 0.1 2017-06-16 $$
 */

var modifyFlag = false;
var onEvent = PFUtil.makeEventBinder($(".pf-cal"));

const CalculationComposeTemplateMainMenuController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationComposeTemplateMainMenuController;

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
        self.$root.find(".calculation-compose-template-search-name").val("");
        self.master.renderMainMenu();
        $(".pf-detail-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-compose-template-search-name, .search-btn", function(e) {
        if ($(e.relatedTarget).hasClass("calculation-compose-template-search-list-wrap")
            || $(e.relatedTarget).hasClass("pfui-tree-list")) // for IE
          return;
        self.$root.find(".calculation-compose-template-search-list-wrap").removeClass("active");
      });

      binder("focusout", ".calculation-compose-template-search-list-wrap", function(e) {
        self.$root.find(".calculation-compose-template-search-list-wrap").removeClass("active");
      });

      binder("focus", ".calculation-compose-template-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("keyup", ".calculation-compose-template-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      binder("click", ".search-btn", function(e) {
        var keyword = self.$root.find(".calculation-compose-template-search-name").val().replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

    },

    renderNavTree: function(callBack) {
      var self = CalculationComposeTemplateMainMenuController;
      var loginTntInstId = getLoginTntInstId();
      var navTreeStore;

      PFUI.use(["pfui/tree", "pfui/data", "pfui/menu"], function (Tree, Data, Menu) {
        if (g_serviceType === g_bxmService) {
          var param = {
              header: {
                application: "PF_Factory",
                service: "CalculationComposeElementTemplateService",
                operation: "getCalculationComposeElementTemplateForList"
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
            url: "/calculator/getCalculationComposeElementTemplateForList.json?tntInstId=" + loginTntInstId + "&commonHeaderMessage={loginTntInstId:'" + loginTntInstId + "'}" ,
            dataProperty: "list",
            map: {
              name: "text",
              id: "id"
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
                        $('.most-significant-box').removeAttr('data-edited');
                    }, function() {
                        return;
                    });
            	}
            }
          });

          var templateTypeContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-plus", bxMsg("createNewCalculationComposeTemplate"), self.contextMenuEvent.createTemplate),
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
      var self = CalculationComposeTemplateMainMenuController;
      var loginTntInstId = getLoginTntInstId();

      navTreeStore.on("beforeload", function (ev) {
        navTreeStore.set("map", {
          name: "text",
        });
      });

      navTreeStore.on("beforeprocessload", function (ev) {
        var data = ev.data;
        var category = "valCmptnMthdDscd";
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
          var name = self.master.conditionMap[dt.composeElementConditionCode] || "";
          dt.leaf = true;
          dt.cls = "PT";
          dt.id = dt.composeElementConditionCode;
          dt.name = "[" + dt.composeElementConditionCode + "] " + name;

          var tpCd = dt.valueComputationMethodDistinctionCode;

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
      var self = CalculationComposeTemplateMainMenuController;
      var category = self.navTreeStore.findNode(item.valueComputationMethodDistinctionCode);

      if (category) {
        self.navTree.expandNode(category);

        var node = self.navTreeStore.findNode(item.composeElementConditionCode);
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
        var self = CalculationComposeTemplateMainMenuController;
        self.master.renderTemplateForm(self.selectedItem);
      },

      createTemplate: function() {
        var self = CalculationComposeTemplateMainMenuController;
        if (!self.master.checkProject()) return;

        PFPopup.selectConditionTemplate({}, function (cnd) {
          var item = {
              composeElementConditionCode: cnd.code,
              applyStartDate: self.master.toCalDate(PFUtil.getToday()),
              applyEndDate: "99991231",
              valueComputationMethodDistinctionCode: self.selectedItem.id,
              activeYn: "N"
          };

          self.master.createCalculationComposeElementTemplate(item, function(responseData) {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
            self.master.renderMainMenu(responseData);
            modifyFlag = false;
          });
        });
      },

      deleteTemplate: function() {
        var self = CalculationComposeTemplateMainMenuController;
        if (!self.master.checkProject()) return;

        var item = self.selectedItem;

        PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
          self.master.deleteCalculationComposeElementTemplate(item, function(responseData) {
            PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
            self.master.renderMainMenu(item);
            modifyFlag = false;
          });
        });
      }
    },

    renderSearchTree: function(keyword) {
      var self = CalculationComposeTemplateMainMenuController;

      self.$root.find(".calculation-compose-template-search-list-wrap").addClass("active");
      self.$root.find(".calculation-compose-template-search-list-wrap").empty();

      var data = [];
      $.each(self.navTreeStore.findNodesBy(function(node) {
          return keyword ? node.cls === "PT" && node.text.toUpperCase().search(keyword.toUpperCase()) >= 0 : 0;
      }), function(index, item) {
        data.push({
          text: item.text,
          composeElementConditionCode: item.composeElementConditionCode,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode
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
            render : ".calculation-compose-template-search-list-wrap",
            showLine : false,
            store : store,
            showRoot : false
          });

          tree.render();

          tree.on("itemdblclick", function(e) {
            var node = self.navTreeStore.findNode(e.item.composeElementConditionCode);
            self.traceTree(node);
            self.master.renderTemplateForm(node);
            self.$root.find(".calculation-compose-template-search-list-wrap").removeClass("active");
          });
        });
        store.load();

      });
    }

};