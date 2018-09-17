/**
 * @author Choi Junhyeok
 * @version $$id: calculation-unit.js, v 0.1 2017-05-10 $$
 */

var self;
var popupCount = 0;

var modifyFlag = false;
var popupModifyFlag = false;	// 팝업수정
var calUnitModifyFlag = false;	// 계산기본정보수정
var calRuleModifyFlag = false;	// 계산적용규칙수정
var composeModifyFlag = false;	// 계산구성요소수정
var cndModifyFlag = false;      // 계산조건수정
var applyRuleModifyFlag = false;	// 적용규칙수정
var determineRuleModifyFlag = false;	// 판단조건수정

var onEvent = PFUtil.makeEventBinder($(".pf-cal"));
const calculationUnitManager = {

    calculationRuleGridRendered: false,
    judgementRuleGridRendered: false,
    determineConditionTabRendered:false,
    applyRule: {},

    /**
     * core interface
     */
    init: function(callBack) {
      this.initPageRoot();
      this.initTemplates();
      this.initController();
      this.initEvents();
      this.initConditionMap(callBack);
    },

    run: function() {
      this.init(function() {
        setMainTapLeftPosition();

        var hash = parent.$('.pf-hidden .hash').text();
        if(hash) {
            location.hash = hash;
            parent.$('.pf-hidden .hash').text('');

            var requestParam = {};
    	    $.each(hash.split('&'),function(index, hashItem){
                var param = hashItem.split('=');
                requestParam[param[0]] = param[1];
            });
        	self.renderCalculationUnitTree(requestParam);

        }else{
        	self.renderCalculationUnitTree();
        }
      });
    },


    /**
     * init
     */
    initPageRoot: function() {
      this.$root = $(".pf-cal");
      PFComponent.toolTip(this.$root);
    },

    initController: function() {
      var self = calculationUnitManager;
    },

    initTemplates: function() {
      // 계산단위
      this.mainMenuTpl = this.getTemplate("mainMenuTpl");
      this.informationAreaTpl = this.getTemplate("informationAreaTpl");
      this.createFeePopupTpl = this.getTemplate("createFeePopupTpl");
      this.discountFormulaTpl = this.getTemplate("discountFormulaTpl");

      // 계산규칙
      this.conditionPopupTpl = this.getTemplate("conditionPopupTpl");

      // 판단조건
      this.calculationDetermineConditionTpl = this.getTemplate("calculationDetermineConditionTpl");

      // 계산규칙 구성요소
      this.editFormulaPopupTpl = this.getTemplate("editFormulaPopupTpl");
      this.calculationRuleComposeListTpl = this.getTemplate("calculationRuleComposeListTpl");
      this.calculationRuleComposeDetailTpl = this.getTemplate("calculationRuleComposeDetailTpl");

      // 계산규칙 조건
      this.composeConditionMenuTpl = this.getTemplate("composeConditionMenuTpl");

      // 적용규칙
      this.transactionApplyRuleFormTpl = this.getTemplate("transactionApplyRuleFormTpl");
      this.calculationApplyRuleTpl = this.getTemplate("calculationApplyRuleTpl");

    },

    getTemplate: function(template) {
      var tpl = $.ajax({
        //url: "/calculator/tpl/" + template + ".html",
    	url: "tpl/" + template + ".html",
        async: false,
        dataType: "html"
      }).responseText;
      return Handlebars.compile(tpl);
    },

    bindEventListener: function() {
        this.onEvent = onEvent;
    },

    initEvents: function() {
      var self = calculationUnitManager;

      if (this.onEvent === undefined)
        this.bindEventListener();

      onEvent("click", "a", function(e) {
        e.preventDefault();
      });

      onEvent("click", ".sidebar-toggler", function(e) {
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

      /**
       * search menu
       */
      onEvent("click", ".refresh-btn", function(e) {
        self.$root.find(".calculation-unit-search-name").val("");
        self.renderCalculationUnitTree();
        $(".pf-detail-wrap").removeClass("active");
      });

      onEvent("focusout", ".calculation-unit-search-name, .search-btn", function(e) {
        if ($(e.relatedTarget).hasClass("calculation-unit-search-list-wrap")
            || $(e.relatedTarget).hasClass("pfui-tree-list")) // for IE
          return;
        self.$root.find(".calculation-unit-search-list-wrap").removeClass("active");
      });

      onEvent("focusout", ".calculation-unit-search-list-wrap", function(e) {
        self.$root.find(".calculation-unit-search-list-wrap").removeClass("active");
      });

      onEvent("focus", ".calculation-unit-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      onEvent("keyup", ".calculation-unit-search-name", function(e) {
        var keyword = this.value.replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      onEvent("click", ".search-btn", function(e) {
        var keyword = self.$root.find(".calculation-unit-search-name").val().replace(/\s/g, "");
        self.renderSearchTree(keyword);
      });

      /**
       *  button
       */
      onEvent("click", ".save-calculation-unit-btn", function(e) {
        self.saveUnit();
      });

      onEvent("click", ".delete-calculation-unit-btn", function(e) {
        self.deleteUnit();
      });

      onEvent("click", ".save-calculation-unit-apply-rule-btn", function(e) {
        var self = calculationUnitManager;
      });



      /** 적용규칙 */
      // 적용규칙 이력보기 버튼 클릭
      onEvent("click", ".pf-cal-apply-rule-history-btn", function(e) {
        var headClass = "";

        if ($(".pf-cal-sub-tab .active").index() === 0) {
          headClass = ".pf-cal-detail-info ";

        } else if ($(".pf-cal-sub-tab .active").index() === 1) {
          headClass = ".pf-cal-determine-condition-info ";

        } else if ($(".pf-cal-discount-formula-form-tpl").length) {
          headClass = ".pf-cal-discount-formula-form-tpl ";

        } else {
          headClass = ".pf-cal-tx-apply-rule-form-tpl ";
        }

        var applyRuleId = $(headClass + ".apply-rule-info-wrap [data-form-param='applyRuleId']").val();
        if (applyRuleId)
          showCalculationApplyRuleHistory(self, applyRuleId);
        else
          PFComponent.showMessage(bxMsg("applyRuleNotExists"), "warning");
      });

      //적용규칙 도움말 포커스아웃 처리를 할때 HELP 영역을 클릭하였을경우 사라지지않도록 처리하기위함
      var isHelpAreaClick = false;

      // 적용규칙 도움말 버튼 클릭
      onEvent("click", ".pf-cal-apply-rule-help-btn", function(e) {
        // 버튼 아이콘이 보여 도움말 툴팁이 가려지는 케이스를 방지하기위해 hide() 처리
        var $toolTip = $(".tooltip");
        if($toolTip) $($toolTip).hide();

        var $helpDiv = $(".help-area");
        var applyRuleExample = $(".pf-cal-sub-tab .active").index() === 1
          ? bxMsg("ApplyRuleHelpMessageBoolean_1") + bxMsg("ApplyRuleHelpMessageBoolean_2")
          : bxMsg("ApplyRuleHelpMessageArithmetic");

        $($helpDiv).html("<p class='help-area-message'>" + applyRuleExample + "</p>");
        $($helpDiv).css({top: e.pageY+15, left: e.pageX+15}).show();

        $(".help-area-message").on("mousedown", function(e) {
          isHelpAreaClick = true;
        });
      });

      // 적용규칙 도움말 포커스아웃 처리
      onEvent("focusout", ".pf-cal-apply-rule-help-btn", function(e){
        if(!isHelpAreaClick) {
          var $helpDiv = $(".help-area");
          if($helpDiv) $($helpDiv).hide();
          isHelpAreaClick = false;
        }
        else {
          isHelpAreaClick = false;
          $(".pf-cal-apply-rule-help-btn").focus();
        }
      });

      // 적용규칙 저장
      onEvent("click", ".pf-cal-apply-rule-save-btn", function(e) {
        if (!self.checkProject()) return;

        //거래별 적용규칙    headClass = ".pf-cal-tx-apply-rule-form-tpl "
        //계산규칙 적용규칙  headClass = ".pf-cal-detail-info ";
        //판단조건 적용규칙  headClass = ".pf-cal-determine-condition-info ";
        var headClass = "";
        var ruleApplyTargetDistinctionCode = null;

        if ($(".pf-cal-sub-tab .active").index() === 0) {
          headClass = ".pf-cal-detail-info ";
          ruleApplyTargetDistinctionCode = "05"

        } else if ($(".pf-cal-sub-tab .active").index() === 1) {
          headClass = ".pf-cal-determine-condition-info ";
          ruleApplyTargetDistinctionCode = "06"

        } else if ($(".pf-cal-discount-formula-form-tpl").length) {
          headClass = ".pf-cal-discount-formula-form-tpl ";
          ruleApplyTargetDistinctionCode = "09"

        } else {
          headClass = ".pf-cal-tx-apply-rule-form-tpl ";
          ruleApplyTargetDistinctionCode = "07"
        }

        var item = PFComponent.makeYGForm($(headClass + ".apply-rule-info-wrap")).getData();
        item.applyStartDate = self.toCalDate(item.applyStartDate);
        item.applyEndDate = self.toCalDate(item.applyEndDate);
        item.ruleApplyTargetDistinctionCode = ruleApplyTargetDistinctionCode;
        item.calculationUnitId = item.calculationUnitId === "" ? null : item.calculationUnitId;

        self.saveCalculationApplyRule(item, function(responseData) {
          if (item.ruleStatusCode === '04' && self.applyRule.applyStartDate === responseData.applyStartDate) {
            PFComponent.showMessage(bxMsg("onlyApplyEndDateWillBeUpdatedForEffectiveItem"), "success");
          } else {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
          }

          self.renderCalculationApplyRule(responseData);
        });
      });

      onEvent("click", ".text-input-btn", function(e) {
        var $form = $(e.target).closest(".pf-cal-apply-rule-tpl");
        var $content = $form.find(".apply-rule");
        var s = $(e.currentTarget).val();

        PFFormulaEditor.inputToken(s, $content);
      });

      onEvent("click", ".back-space-btn", function(e) {
        var $form = $(e.target).closest(".pf-cal-apply-rule-tpl");
        var $content = $form.find(".apply-rule");
        var tokens = PFFormulaEditor.tokenize($content.val());
        tokens.pop();

        $content.val(PFFormulaEditor.toContent(tokens, " "));
        $content.trigger("change");
      });

      onEvent("change", ".pf-cal-apply-rule-tpl .apply-rule", function(e) {
        var $form = $(e.target).closest(".pf-cal-apply-rule-tpl");
        var $content = $form.find(".apply-rule");
        var $conversionContent = $form.find(".apply-rule-conversion-content");

        var map, scope;
        if ($(".pf-cal-sub-tab .active").index() === 1) { // 판단조건 적용규칙
          map = self.determineConditionGrid.getAllData().reduce(function(map, v) {
            map[v.judgementConditionSequenceNumber] = self.conditionMap[v.conditionCode];
            return map;
          }, {});
          scope = {
              func: ["and", "or", "not", "match", "less", "more", "equal", "not_equal", "less_equal", "more_equal"]
          };

        } else {
          map = self.conditionMap;
          scope = {
              func: ["min", "max", "sum", "avg"]
          };
        }

        var resultMessage = PFFormulaEditor.validate($content.val(), scope)
          ? PFFormulaEditor.translate($content.val(), map, " ")
          : bxMsg("applyRuleSyntaxError");
        $conversionContent.val(resultMessage);
      });

      onEvent("click", ".pf-cal-apply-rule-verify-btn", function(e) {
        var $form = $(e.target).closest(".pf-cal-apply-rule-tpl");
        var ruleApplyTargetDscd;
        if ($(".pf-cal-sub-tab .active").index() === 0) {
          ruleApplyTargetDscd = "05";

        } else if ($(".pf-cal-sub-tab .active").index() === 1) {
          ruleApplyTargetDscd = "06";

        } else if ($(".pf-cal-discount-formula-form-tpl").length) {
          ruleApplyTargetDscd = "09";

        } else {
          ruleApplyTargetDscd = "07";
        }

        var item = {
            ruleApplyTargetDscd: ruleApplyTargetDscd,
            ruleContent: $form.find("[data-form-param='ruleContent']").val()
        };

        self.verifyApplyRule(item, function(responseData) {
          PFComponent.showMessage(bxMsg("noAbnormality"), "success");
        });
      });



      /**
       *  판단조건
       */
      onEvent("click", ".add-cal-determine-condition-btn", function(e) {
        var self = calculationUnitManager;
        PFPopup.selectConditionTemplate({ targetCondition: ['01', '02'] }, function (cnd) {
          var item = {
              applyStartDate: self.toCalDate(PFUtil.getNextDate()),
              applyEndDate: "99991231",
              conditionTypeCode: cnd.type,
              conditionCode: cnd.code,
              conditionStatusCode: "01",
              process: "C"
          };

          renderDetermineConditionPopup(item);
        }, "A");
      });

      onEvent("click", ".add-calculation-rule-btn", function(e) {
        selectFormula(function(formula) {
          formula.applyStartDate = self.toCalDate(PFUtil.getToday());
          formula.process = "C";
          self.calculationRuleGrid.addData(formula);
          calUnitModifyFlag = true;
        });
      });

      onEvent("input", ".discount-condition-grid-search-header .condition-name", function(e) {
        var name = $(".discount-condition-grid-search-header [data-form-param='conditionName']").val();
        self.discountConditionGrid.store.filterBy(function(record) {
          var keyword = record.get("code") + " " + record.get("name");
          return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
        });
        e.preventDefault();
      });

      var baseDate;
      onEvent("change", ".pf-cal-determine-condition-info .base-date", function(e) {
        if (baseDate !== this.value) {
          baseDate = this.value;

          var $masterform = self.$root.find(".pf-cal-unit-form");
          var calculationUnitId = $masterform.find("[data-form-param='calculationUnitId']").val();
          var node = self.navTreeStore.findNode(calculationUnitId);

          var item = {
              calculationUnitId: node.calculationUnitId,
              transactionId: node.transactionId,
              baseDate: self.toCalDate(baseDate)
          };

          self.getCalculationDetermineConditionForList(item, function(responseData) {
            self.determineConditionGrid.resetData();
            self.determineConditionGrid.setData(responseData);

            self.applyRuleMap = responseData.reduce(function(map, v) {
              map[v.judgementConditionSequenceNumber] = self.conditionMap[v.conditionCode];
              return map;
            }, {});
          });
        }
      });

      onEvent("click", ".pf-cal-determine-condition-info .base-date", function(e) {
        oldValue = this.value;
      });

      /*
       * 변경정보 check event
       */
      // 계산단위 변경 시
      onEvent("change", ".pf-cal-unit-form .bx-form-item", function(e){
    	  calUnitModifyFlag = true;
      });

      // 계산단위 적용규칙 변경 시
      onEvent("change", ".calculation-rule-area .bx-form-item", function(e){
    	  calRuleModifyFlag = true;
      });

      // 판단조건 적용규칙 변경 시
      onEvent("change", ".pf-cal-determine-condition-tpl .bx-form-item", function(e){
    	  determineRuleModifyFlag = true;
      });
    },


    /*
     * render
     */
    renderCalculationUnitTree: function(item) {
      var self = calculationUnitManager;
      $(".pf-cal-left-tree-box").html(this.mainMenuTpl());
      this.renderNavTree(function(navTree, navTreeStore) {
        self.navTree = navTree;
        self.navTreeStore = navTreeStore;

        if (item) {
          self.traceTree(item);

          var node = navTree.findNode(item.calculationUnitId);
          if (node)
            self.renderCalculationUnitInfo(node);
          else
            self.$root.find(".pf-cal-info").empty();
        }
      });
    },

    renderNavTree: function(callBack) {
      var self = calculationUnitManager;
      var loginTntInstId = getLoginTntInstId();
      var navTreeStore;

      PFUI.use(["pfui/tree", "pfui/data", "pfui/menu"], function (Tree, Data, Menu) {
        var treeType = "PT";
        const LEVEL_ROOT = 1;
        const LEVEL_SERVICE = 2;
        const LEVEL_CALUNIT = 3;

        if (g_serviceType === g_bxmService) {
          var param = {
              header: {
                application: "PF_Factory",
                service: "CalculationUnitService",
                operation: "getCalculationUnitForList"
              },
              input: {
                tntInstId: loginTntInstId,
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
            url: "/calculator/getCalculationUnitForList.json?tntInstId=" + loginTntInstId + "&commonHeaderMessage={loginTntInstId:'" + loginTntInstId + "'}" ,
            dataProperty: "list",
            map: {
              name: "text",
              id: "id",
            }
          });
        }

        self.configNavTreeStore(navTreeStore, function() {
          var self = calculationUnitManager;
          self.$root.find(".pf-cal-tree-nav").empty();

          navTree = new Tree.TreeList({
            render : ".pf-cal-tree-nav",
            showLine : false,
            store : navTreeStore,
            checkType : "none",
            showRoot : false
          });
          navTree.render()

          navTree.on("itemdblclick", function(e) {
            self.selectedItem = e.item;

            if (e.item.leaf) {
              if (e.item.isApplyRule) {
                self.renderTransactionApplyRuleInfo(e.item);
              } else if (e.item.isDiscountFormula) {
                self.renderDiscountFormula(e.item);
              } else {
                self.renderCalculationUnitInfo(e.item);
              }
            } else if(e.item.level === 2) {
              if (!e.item.children[e.item.children.length-1].isApplyRule) {
                self.getCalculationApplyRule({
                  transactionId: e.item.id,
                  ruleApplyTargetDistinctionCode: "07"}, function(responseData) {
                  if (responseData) {
                    responseData.cls = "PT";
                    responseData.id = responseData.applyRuleId;
                    responseData.text = bxMsg("applyFeeDetermineRule");
                    responseData.isApplyRule = true;

                    var addedNode = self.navTreeStore.add(responseData, self.navTreeStore.findNode(self.selectedItem.id), self.navTreeStore.findNode(self.selectedItem.id).length);
                  }
                });
              }
            }
          });

          var serviceContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-plus", bxMsg("createNewFee"), self.contextMenuEvent.createCalculationUnit),
              self.makeContextMenu("icon-plus", bxMsg("createApplyFeeDetermineRule"), self.contextMenuEvent.createCalculationApplyRule),
              ]
          });

          var calculationUnitContextMenu = new Menu.ContextMenu({
            children: [
              self.makeContextMenu("icon-zoom-in", bxMsg("inquiry"), self.contextMenuEvent.openCalculationUnit),
              //self.makeContextMenu("icon-book", bxMsg("copy"), self.contextMenuEvent.copyCalculationUnit),
              self.makeContextMenu("icon-remove", bxMsg("delete"), self.contextMenuEvent.deleteCalculationUnit),
              ]
          });

          navTree.on("itemcontextmenu", function(ev) {
            var item = ev.item;
            var contextMenu;

            navTree.setSelected(item);
            self.selectedItem = item;

            var y = ev.pageY >= 500 ? ev.pageY-(28*5) : ev.pageY;

            // 수정가능 or Emergency
            if (item.level === LEVEL_SERVICE ||
                (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
              contextMenu = serviceContextMenu;
              contextMenu.set("xy",[ev.pageX,y]);
              contextMenu.show();
            } else if (!item.isApplyRule
                && (item.leaf ||
                (getSelectedProjectId() && isEmergency(getSelectedProjectId())))) {
              contextMenu = calculationUnitContextMenu;
              contextMenu.set("xy",[ev.pageX,y]);
              contextMenu.show();
            }

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
      var self = calculationUnitManager;

      var loginTntInstId = getLoginTntInstId();

      navTreeStore.on("beforeload", function (ev) {
        navTreeStore.set("map", {
          name: "text",
        });
      });

      navTreeStore.on("beforeprocessload", function (ev) {
        var data = ev.data;
        var srvcTpDscd = "ServiceTypeDscd";
        var typeOf = [];
        var detailTypeOf = [];

        if (data.ModelMap) {
          data.responseMessage = data.ModelMap.responseMessage;
          delete data.ModelMap.responseMessage;
        }

        var listData = data.responseMessage || [];

        data.list = [];

        // Create Service Type Code Category
        for (var i in codeArrayObj[srvcTpDscd]) {
          var folderData = {};
          folderData.cls = "Folder";
          folderData.id = codeArrayObj[srvcTpDscd][i].code;
          folderData.name = codeArrayObj[srvcTpDscd][i].name;
          folderData.children = [];

          // Create Detail Category
          for (var j in codeArrayObj[folderData.id]) {
            var detailData = {};
            detailData.cls = "Folder";
            detailData.id = codeArrayObj[folderData.id][j].code;
            detailData.name = codeArrayObj[folderData.id][j].name;
            detailData.children = [];

            folderData.children.push(detailData);
            typeOf[detailData.id] = i;
            detailTypeOf[detailData.id] = j;
          }

          data.list.push(folderData);
        }

        // put listData on tree
        for (var i in listData) {
          var dt = listData[i];
          dt.leaf = true;
          dt.cls = "PT";
          dt.id = dt.calculationUnitId;
          dt.name = (dt.calculationUnitConditionName) ? dt.calculationUnitConditionName : dt.calculationUnitConditionCode;//"[" + dt.calculationUnitConditionCode + "] " + dt.calculationUnitConditionName

          var tpCd = dt.transactionId;

          if (tpCd && typeOf[tpCd])
            data.list[typeOf[tpCd]].children[detailTypeOf[tpCd]].children.push(dt);
          else
            data.list.push(dt);
        }

        // 2017.08.25. 할인산식 추가
        data.list = [{
          leaf: true,
          cls: "PT",
          id: "",
          transactionId: "",
          name: bxMsg("discountFormula"),
          isDiscountFormula: true
        }].concat(data.list);
      });

      navTreeStore.on("load", function() {
        if (callBack && typeof(callBack) === "function")
          callBack();
      });

      navTreeStore.load();

    },

    traceTree: function(item) {
      var self = calculationUnitManager;
      var category = self.navTreeStore.findNode(item.transactionId);

      if (category) {
        self.navTree.expandNode(category);

        var node = self.navTreeStore.findNode(item.calculationUnitId);
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
            afterSyncUI: function(e) {
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
      openCalculationUnit: function() {
        var self = calculationUnitManager;

        if (self.selectedItem.isDiscountFormula)
          self.renderDiscountFormula(self.selectedItem);
        else if (self.selectedItem.leaf)
          self.renderCalculationUnitInfo(self.selectedItem);
      },

      createCalculationUnit: function() {
        var self = calculationUnitManager;
        if (!self.checkProject()) return;

        PFPopup.selectCalculationUnitTemplate({ calculationUnitDistinctionCode: '20' }, (item) => {
          item.transactionId = self.selectedItem.id;
          self.createCalculationUnit(item, function(responseData) {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
            self.renderCalculationUnitTree(responseData);
          });
        });
      },

      copyCalculationUnit: function() {
        var self = calculationUnitManager;
        if (!self.checkProject()) return;

        PFPopup.selectCalculationUnitTemplate({ calculationUnitDistinctionCode: '20' }, (template) => {
          var item = {
              calculationUnitId: self.selectedItem.calculationUnitId,
              calculationUnitConditionCode: template.calculationUnitConditionCode,
              transactionId: self.selectedItem.transactionId
          }

          self.copyCalculationUnit(item, function(responseData) {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
            self.renderCalculationUnitTree(responseData);
          });
        });
      },

      deleteCalculationUnit: function() {
        var self = calculationUnitManager;

        if (self.selectedItem.isDiscountFormula) {
            PFComponent.showMessage(bxMsg("cannotDeleteDiscountFormula"), "warning");
            return;
        }

        if (!self.checkProject()) return;

        var item = self.selectedItem;
        item.transactionId = self.selectedItem.transactionId;

        PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
          self.deleteCalculationUnit(item, function(responseData) {
            PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
            self.renderCalculationUnitTree(item);
          });
        });
      },

      createCalculationApplyRule: function() {
        var self = calculationUnitManager;
        var _this = this;

        if (!self.checkProject()) return;

        PFComponent.showConfirm(bxMsg("createFeeCalculationConfirm"), function() {
          var item = {
            transactionId: self.selectedItem.id,
            ruleApplyTargetDistinctionCode: "07"
          };

          self.getCalculationApplyRule(item, function(responseData) {
            if (responseData) {
              var ruleNode = {
                  cls : "PT",
                  id : self.selectedItem.id,
                  transactionId: self.selectedItem.id,
                  text : bxMsg("applyFeeDetermineRule"),
                  isApplyRule : true
              }

              var addedNode = self.navTreeStore.add(ruleNode, self.navTreeStore.findNode(self.selectedItem.id), self.navTreeStore.findNode(self.selectedItem.id).length);
              var renderParam = {
                  transactionId: self.selectedItem.id,
              };

              self.navTree.setSelected(addedNode);
              self.renderTransactionApplyRuleInfo(renderParam);

              _this.close();
            } else {
              PFComponent.showMessage(bxMsg("applyRuleAlreadyExists"), "warning");
                //TODO
            }
          });
        }, function() {
          return;
        });
      }
    },

    renderCalculationUnitInfo: function(item) {
      calUnitModifyFlag = false;

      var self = calculationUnitManager;

      if (item.cls === "Folder")
        return;

      setTaskRibbonInput(item.projectId, item.projectName);

      var that = this;

      item.calculationUnitStatusName = codeMapObj["CalcnUnitStatusCd"][item.calculationUnitStatusCode];

      this.$root.find(".pf-cal-info").html(this.informationAreaTpl(item));
      this.$root.find(".pf-cal-info-wrap").addClass("active");

      function renderCalculationUnitTab() {

        PFUI.use(["pfui/tab", "pfui/mask"], function(Tab) {
          var tab = new Tab.TabPanel({
            srcNode : ".tab-title",
            elCls : "nav-tabs",
            panelContainer : "#pf-cal-tab-conts",
            autoRender: true,
            itemStatusCls : {
              "selected" : "active"
            }
          });

          tab.on("click", function (ev) {
            // 서비스화면 and 제공조건 탭 and Render가 필요한 경우
            if ($(".pf-cal-sub-tab .active").index() === 1 && !that.determineConditionTabRendered) {
              var param = {
                  calculationUnitId: item.calculationUnitId,
              };

              that.renderCalculationDetermineCondition(param);
            }
          });
        });
      }

      this.determineConditionTabRendered = false;
      renderCalculationUnitTab();

      var $form = this.$root.find(".pf-cal-unit-form");

      // render combobox
      this.renderComboBox("CalcnUnitDscd",
          $form.find("[data-form-param='calculationUnitDistinctionCode']"),
          item.calculationUnitDistinctionCode, true);
      this.renderComboBox("CalcnUnitStatusCd",
          $form.find("[data-form-param='calculationUnitStatusCode']"),
          item.calculationUnitStatusCode, true);
      this.renderComboBox("ProductAmountTypeCode",
          $form.find("[data-form-param='amountTypeCode']"),
          item.amountTypeCode, true);
      this.renderComboBox("LevyCrncyDscd",
          $form.find("[data-form-param='levyCurrencyDistinctionCode']"),
          item.levyCurrencyDistinctionCode, false);

      if (item.calculationUnitStatusCode === "04") { // active
        this.$root.find(".levy-currency-distinction-code").prop("disabled", true);

        var projectId = getSelectedProjectId();
        if (!isEmergency(projectId) && !isUpdateStatus(projectId)) {
          this.$root.find(".delete-calculation-unit-btn").prop("disabled", true);
        }
      }

      // 계산규칙이 존재하면 그리드 및 적용규칙
      // render grid
      this.getCalculationUnitTemplate({calculationUnitConditionCode: item.calculationUnitConditionCode}, function(responseData) {
        responseData = responseData || {};
        if (responseData.calculationRuleExistenceYn === "Y") {
          $(".calculation-rule-area").show();

          self.calculationRuleGridRendered = true;
          self.renderCalculationRuleGrid();

          var ruleParam = {
              calculationUnitId: item.calculationUnitId,
              transactionId: item.transactionId,
              ruleApplyTargetDistinctionCode: "05",
          };
          self.renderCalculationApplyRule(ruleParam);
        }

        self.deletedRules = [];

      });

      $(".pf-cal-unit-form").on('change', 'input, select, textarea', (e) => {
        calUnitModifyFlag = true;
      });
    },

    renderCalculationRuleGrid: function() {
      var self = calculationUnitManager;

      // make grid
      var selectedCellIndex;
      var grid = PFComponent.makeExtJSGrid({
        fields: ["calculationRuleId", "applyStartDate", "applyEndDate",
          "formulaId", "formulaName", "formulaContent", "process",
          {
            name: "calculationRuleStatusCode",
            defaultValue: "01"
          }, {
            name: "calculationRuleStatusName",
            convert: function(newValue, record) {
              return codeMapObj.CalcnUnitStatusCd[record.get("calculationRuleStatusCode")];
            }
          }, {
            name: "calculationRuleContent",
            convert: function(newValue, record) {
              return newValue ? newValue : record.get("formulaContent");
            }
          }, {
            name: "calculationUnitId",
            defaultValue: self.$root.find("[data-form-param='calculationUnitId']").val()
          }
        ],
        gridConfig: {
          renderTo: ".pf-cal-calculation-rule-grid",
          columns: [
            {
              text: bxMsg("calculationRuleId"), width: 160, dataIndex: "calculationRuleId", align: "center"
            },
            {
              text: bxMsg("calculationRuleContent"), flex: 1, dataIndex: "calculationRuleContent",
              style: "text-align: center",
              renderer: function (value, p, record) {
                return Ext.String.format("<p class='ext-condition-value-column'>{0}</p>", value);
              }
            },
            {
              text: bxMsg("aplyStartDt"), width: 90, dataIndex: "applyStartDate", align: "center",
              renderer: function(value, p, record) {
                return self.toPFDate(value);
              },
              editor: {
                allowBlank: false,
                listeners: {
                  focus: function(_this) {
                    var isNextDay = true;
                    if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                      isNextDay = false;
                    }
                    PFUtil.getGridDatePicker(_this, "applyStartDate", grid, selectedCellIndex, isNextDay, true);
                  }
                }
              },
              listeners: {
                click: function() {
                  selectedCellIndex = $(arguments[1]).parent().index();
                }
              }
            },
            {
              text: bxMsg("aplyEndDt"), width: 90, dataIndex: "applyEndDate", align: "center",
              renderer: function(value, p, record) {
                return self.toPFDate(value);
              },
              editor: {
                allowBlank: false,
                listeners: {
                  focus: function(_this) {
                    var isNextDay = true;
                    if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                      isNextDay = false;
                    }
                    PFUtil.getGridDatePicker(_this, "applyEndDate", grid, selectedCellIndex, isNextDay, true);
                  }
                }
              },
              listeners: {
                click: function() {
                  selectedCellIndex = $(arguments[1]).parent().index();
                }
              }
            },
            {
              text: bxMsg("status"), width: 80, dataIndex: "calculationRuleStatusName", align: "center"
            },
            {
              xtype: "actioncolumn", text: bxMsg("history"), width: 40, align: "center",
              items: [{
                //icon: "/images/edit-icon30.png",
                iconCls: "bw-icon i-20 i-func-history",
                handler: function (_this, rowIndex, colIndex, item, e, record) {
                  if (record.get("process") === "C") {
                    PFComponent.showMessage(bxMsg("createCalculationRuleFirst"), "warning");

                  } else {
                    var req = {
                        calculationRuleId: record.get("calculationRuleId"),
                        calculationRuleContent: record.get("calculationRuleContent")
                    };
                    renderCalculationRuleHistoryPopup(req);
                  }
                }
              }]
            },
            {
              xtype: "actioncolumn", width: 35, align: "center",
              items: [{
                icon: "/images/x-delete-16.png",
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                  if (record.get("process") !== "C") {
                    record.set("process", "D");
                    self.deletedRules.push(record.data);
                  }
                  record.destroy();
                  calUnitModifyFlag = true;
                }
              }],
              renderer: function(value, p, record) {
                p.style += "padding-top: 4px;";
                if (record.get("calculationRuleStatusCode") !== "01")
                  p.style += "display: none;";
              }
            }
          ],
          plugins: [
            Ext.create("Ext.grid.plugin.CellEditing", {
              clicksToEdit: 1,
              listeners: {
                beforeedit: function(e, editor) {
                  var projectId = getSelectedProjectId();
                  var isActive = $("[data-form-param='calculationUnitStatusCode']").val() === "04";

                  if (isActive && !isEmergency(projectId) && !isUpdateStatus(projectId)
                      && editor.record.get("calculationRuleStatusCode") !== "01"
                        && editor.field === "applyStartDate") {
                    return false;
                  }
                },
                afteredit: function(e, editor) {
                  switch (editor.field) {
                  case "applyStartDate":
                  case "applyEndDate":
                    editor.record.set(editor.field, self.toCalDate(editor.value));
                    calUnitModifyFlag = true;
                    break;
                  }
                }
              }
            })
          ],
          listeners: {
            scope: this,
            "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
              if (cellIndex === 0) { // identifier
                var $content = $(".pf-cal-detail-info .apply-rule");
                var $conversionContent = $(".pf-cal-detail-info .apply-rule-conversion-content");
                var s = "#" + record.get("calculationRuleId");
                PFFormulaEditor.inputToken(s, $content);

              } else if (cellIndex === 1) { // rule content
                if (record.get("process") === "C") {
                  PFComponent.showMessage(bxMsg("createCalculationRuleFirst"), "warning");

                } else {
                  var rule = {
                      calculationRuleId: record.get("calculationRuleId"),
                      calculationRuleContent: record.get("calculationRuleContent")
                  };
                  editCalculationRuleCompose(rule);
                }
              }
            }
          }
        },
      });

      self.calculationRuleGrid = grid;
      $(".pf-cal-calculation-rule-grid").show();

      // 계산규칙 데이터 조회
      var node = self.navTreeStore.findNode(self.$root.find("[data-form-param='calculationUnitId']").val());
      var item = {
          calculationUnitId: node.id
      };

      self.getCalculationRuleForList(item, function(responseData) {
        responseData = responseData || [];
        grid.setData(responseData);
      });
    },

    renderComboBox: function(code, selector, value, defaultSetting, source) {
      var options = [];

      if (!source) {
        source = codeMapObj[code];
      }

      if (defaultSetting) {
        var $defaultOption = $("<option>");

        $defaultOption.val("");
        $defaultOption.text(bxMsg("select"));

        options.push($defaultOption);
      }

      $.each(source, function(key, value){
        var $option = $("<option>");

        $option.val(key);
        $option.text(value);

        options.push($option);
      });

      selector.html(options);

      if (value) {
        selector.val(value);
      }
    },

    renderTransactionApplyRuleInfo: function(_item) {
      var self = calculationUnitManager;

      $(".pf-cal-info-wrap").addClass("active");
      $(".pf-cal-info").html(this.transactionApplyRuleFormTpl());
      self.getDatePicker(false, $(".pf-cal-tx-apply-rule-form-tpl"));

      var ruleParam = {
          transactionId: _item.transactionId,
          ruleApplyTargetDistinctionCode: "07"
      }

      self.renderTxApplyRuleGrid(function() {
        self.renderCalculationApplyRule(ruleParam);
      });

    },

    renderDiscountFormula: function(_item) {
      var self = calculationUnitManager;

      $(".pf-cal-info-wrap").addClass("active");
      $(".pf-cal-info").html(self.discountFormulaTpl());

      self.renderDiscountConditionGrid(function() {
        self.renderCalculationApplyRule({
          ruleApplyTargetDistinctionCode: "09" // 할인산식
        });
      });
    },

    renderDiscountConditionGrid: function(callBack) {
      var self = calculationUnitManager;

      var grid = PFComponent.makeExtJSGrid({
        fields: ["code", "name"],
        gridConfig: {
          renderTo: ".pf-cal-discount-formula-form-tpl .discount-condition-grid",
          columns: [
            {text: bxMsg("cndCd"), flex: 1, dataIndex: "code"},
            {text: bxMsg("cndNm"), flex: 4, dataIndex: "name"},
          ],
          listeners: {
            scope: this,
            "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
              var $content = $(".pf-cal-discount-formula-form-tpl .apply-rule");
              var $conversionContent = $(".pf-cal-discount-formula-form-tpl .apply-rule-conversion-content");
                var s = "#" + record.get("code");
                PFFormulaEditor.inputToken(s, $content);
            }
          }
        },
      });

      self.queryConditionTemplateBaseForList({conditionName: "0"}, function(responseData) {
        grid.setData(responseData);
        self.applyRuleMap = self.conditionMap;
        self.discountConditionGrid = grid;
        callBack();
      });


    },

    renderCalculationApplyRule: function(_item) {
      var self = calculationUnitManager;

      var requestParam = {
          applyRuleId: _item.id, //applyRuleId, calculationUnitId, calculationRuleId 은 셋중 하나만 있으면 됨
          calculationUnitId: _item.calculationUnitId, //calculationUnitId 입력값이 있으면 ruleApplyTargetDistinctionCode도 필수로 받아야함
          ruleApplyTargetDistinctionCode: _item.ruleApplyTargetDistinctionCode,
          calculationRuleId: _item.calculationRuleId,
          transactionId: _item.transactionId
      }

      var that = this;

      self.getCalculationApplyRule(requestParam, function(responseData) {
          responseData = responseData || {};
          self.applyRule = responseData;
          //거래별 적용규칙    headClass = ".pf-cal-tx-apply-rule-form-tpl "
          //계산규칙 적용규칙  headClass = ".pf-cal-detail-info ";
          //판단조건 적용규칙  headClass = ".pf-cal-determine-condition-info ";
          var headClass = "";

          var map = {};
          if($(".pf-cal-sub-tab .active").index() === 0){
            headClass = ".pf-cal-detail-info ";

          } else if ($(".pf-cal-sub-tab .active").index() === 1) {
            headClass = ".pf-cal-determine-condition-info ";

          } else if (requestParam.ruleApplyTargetDistinctionCode === "09") { // 할인산식
            headClass= ".pf-cal-discount-formula-form-tpl ";

          } else {
            headClass = ".pf-cal-tx-apply-rule-form-tpl ";
          }

          // translate
          if (responseData.ruleContent) {
            responseData.conversionContent = PFFormulaEditor.translate(responseData.ruleContent, self.applyRuleMap, " ");
          }

          $(headClass + ".apply-rule-info-wrap").html(that.calculationApplyRuleTpl(responseData));     // 적용규칙 화면 render
          $(headClass + ".apply-rule-info-wrap .calculationUnitId").val(requestParam.calculationUnitId);
          $(headClass + ".apply-rule-info-wrap .transaction-id").val(requestParam.transactionId);
          $(headClass + ".apply-rule")[0].placeholder = bxMsg("noneApplyRule");
          self.getDatePicker(false, $(headClass + ".apply-rule-info-wrap"));

          self.renderComboBox("CalcnUnitStatusCd",
              $(headClass + "[data-form-param='ruleStatusCode']"),
              responseData.ruleStatusCode, true);

          if ($(".pf-cal-sub-tab .active").index() === 1){
            $(headClass + ".pf-cal-apply-rule-tpl .arithmetic-btn").hide();
          } else {
            $(headClass + ".pf-cal-apply-rule-tpl .boolean-btn").hide();
          }

          $(headClass).find(".arithmetic-btn, .boolean-btn").each(function() {
            $(this).attr("icon-tooltip", bxMsg("tooltip-" + $(this).val()));
          });

          if (responseData.applyStartDate && responseData.applyEndDate) {
            $(headClass + ".apply-rule-info-wrap .start-date").val(self.toPFDate(responseData.applyStartDate));
            $(headClass + ".apply-rule-info-wrap .end-date").val(self.toPFDate(responseData.applyEndDate));
          }

          // modify listener
          $(headClass + ".apply-rule-info-wrap").off('change').on('change', 'input, select, textarea', (e) => {
            applyRuleModifyFlag = true;
          });
      });
    },

    renderTxApplyRuleGrid: function(callBack) {

      var self = calculationUnitManager;
      var calculationUnitList;
      if(self.selectedItem.leaf){
        calculationUnitList = self.selectedItem.parent.children;
      }else{
        calculationUnitList = self.selectedItem.children
      }

      var gridData = [];
      calculationUnitList.forEach(function(el) {
        if(!el.isApplyRule){
          gridData.push(el);
        }
      });

      self.applyRuleMap = self.conditionMap;
      if (callBack) callBack();


      // make grid
      this.txApplyRuleGrid = PFComponent.makeExtJSGrid({
        fields: ["id", "text", "calculationUnitConditionCode", "applyStartDate", "applyEndDate"],
        gridConfig: {
          //selType: 'checkboxmodel',
          renderTo: ".pf-cal-tx-apply-rule-form-tpl .tx-apply-rule-grid",
          columns: [
            {text: bxMsg("calculationUnitId"), flex: 1, dataIndex: "id"},
            {text: bxMsg("calculationUnitName"), flex: 4, dataIndex: "text"},
            {text: bxMsg("cndCd"), flex: 1, dataIndex: "calculationUnitConditionCode"}
            ],
            listeners: {
              scope: this,
              "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                var $content = $(".pf-cal-tx-apply-rule-form-tpl .apply-rule");
                var $conversionContent = $(".pf-cal-tx-apply-rule-form-tpl .apply-rule-conversion-content");
                var s = "#" + record.get("calculationUnitConditionCode");
                PFFormulaEditor.inputToken(s, $content);
              }
            }
        },
      });

      this.txApplyRuleGrid.setData(gridData);
    },

    renderCalculationDetermineCondition: function(_item) {
      var self = calculationUnitManager;
      var $masterform = self.$root.find(".pf-cal-unit-form");
      var calculationUnitId = $masterform.find("[data-form-param='calculationUnitId']").val();
      var node = self.navTreeStore.findNode(calculationUnitId);
      var req = {
          calculationUnitId: node.calculationUnitId,
          transactionId: node.transactionId
      };

      this.$root.find(".pf-cal-determine-condition-info").html(this.calculationDetermineConditionTpl());

      if (writeYn !== "Y") {
        $(".write-btn").hide();
      }

      self.determineConditionGrid = self.renderConditionType3_2Grid({}, ".pf-cal-determine-condition-grid");

      self.getCalculationDetermineConditionForList(req, function(responseData) {
        self.determineConditionGrid.setData(responseData);

        self.applyRuleMap = responseData.reduce(function(map, v) {
          map[v.judgementConditionSequenceNumber] = self.conditionMap[v.conditionCode];
          return map;
        }, {});

        // 적용규칙
        var ruleParam = $.extend(req, {
          ruleApplyTargetDistinctionCode: "06",
        });

        self.renderCalculationApplyRule(ruleParam);
        PFUtil.getDatePicker(false, $(".pf-cal-determine-condition-grid-header"));
        self.getDatePicker(false, $(".apply-rule-info-wrap"));

        self.determineConditionTabRendered = true;        // 한번 render 이후에는 render 되지 않도록
      });
    },


    // 판단조건 그리드
    renderConditionType3_2Grid: function(treeItem, renderTo) {
      var grid = PFComponent.makeExtJSGrid({
        fields: ["applyEndDate", "applyStartDate", "judgementConditionSequenceNumber",
          "calculationDetermineListConditionDetailList", "calculationRuleId", "calculationUnitId",
          "conditionCode", "conditionName", "conditionStatusCode", "conditionTypeCode", "currencyCode", "measureUnitCode",
          "pdInfoDscd", "process", "calculationDetermineListConditionDetailList",
          "valueComputationMethodDistinctionCode", "className", "referenceConditionCode", "referenceAttributeName", "referenceObjectName",
          {
          name: "maxValue",
          convert: function(newValue, record) {
            if (newValue) {
              return newValue;
            } else {
              if (!record || !newValue) {
                var val = "0.00";
              }
              return val;
            }
          }
          },
          {
            name: "minValue",
            convert: function(newValue, record) {
              if (newValue) {
                return newValue;
              } else {
                if (!record || !newValue) {
                  var val = "0.00";
                }
                return val;
              }
            }
          }
          ],
          gridConfig: {
            renderTo: renderTo ? renderTo : ".condition-type3-grid-wrap",
                columns: [
                  {
                    text: bxMsg("DAS0101String11"),   // 일련번호
                    flex: 0.3, align: "center",
                    dataIndex: "judgementConditionSequenceNumber"
                  },
                  {
                    text: bxMsg("determineConditionCode"),   // 판단조건코드
                    flex: 0.4, align: "center",
                    dataIndex: "conditionCode"
                  },
                  {
                    text: bxMsg("cndNm"),   // 조건명
                    flex: 1, style: "text-align: center",
                    dataIndex: "conditionName"
                  },
                  {
                    text : bxMsg("DPS0101String6"),         // 상태
                    width : 70,
                    align: "center", align: "center",
                    dataIndex : "conditionStatusCode",
                    renderer : function(value){
                      return codeMapObj["ProductStatusCode"][value];
                    }
                  },
                  {
                    text: bxMsg("DPP0127String6"), flex: 0.5, dataIndex: "applyStartDate", align: "center",
                    renderer: function(value, p, record) {
                      return value.substr(0, 4) + "-" + value.substr(4, 2) + "-" + value.substr(6, 2);
                    }
                  },
                  {
                    text: bxMsg("DPP0127String7"), flex: 0.5, dataIndex: "applyEndDate", align: "center",
                    renderer: function(value, p, record) {
                      return value.substr(0, 4) + "-" + value.substr(4, 2) + "-" + value.substr(6, 2);
                    }
                  },
                  {
                    text: bxMsg("determineConditionVal"),
                    flex: 1, style: "text-align: center",
                    renderer: function (value, p, record) {
                      var yVal = "", extFormat, yTitle1 = "", yVal1 = "", yTitle2 = "", yVal2 = "";
                      var dscd = record.get("valueComputationMethodDistinctionCode");
                      var conditionTypeCode = record.get("conditionTypeCode");

                      if (dscd === "02") {
                        yTitle1 = bxMsg("className");
                        yVal1 = record.get("className");
                        extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0}: {1} </p>", yTitle1, yVal1);
                      }

                      else if (dscd === "04") {
                        if (conditionTypeCode == "01") {

                          if (record.get("calculationDetermineListConditionDetailList")) {
                            record.get("calculationDetermineListConditionDetailList").forEach(function (el) {
                              yVal = yVal + '['+el.listCode+']'+ el.listName + '，';
                            });

                            if (yVal != '' && yVal.length > 0) {
                              yVal = yVal.substring(0, yVal.length - 1);
                            }
                          }
                          extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0}</p>", yVal);
                        } else {
                          var minString, maxString;

                          minString = record.get("minValue");
                          maxString = record.get("maxValue");

                          yTitle1 = bxMsg("minAndMax");
                          yVal1 = minString + '~' + maxString;

                          extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0}: {1} </p>", yTitle1, yVal1);
                        }
                      }

                      else if (dscd === "06") {
                        yVal1 = codeMapObj.referenceObjectCode[record.get("referenceObjectName")];
                        yVal2 = codeMapObj.referenceAttribute[record.get("referenceAttributeName")];
                        extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0} - {1}</p>", yVal1, yVal2);
                      }

                      return extFormat;
                    }
                  }
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                      if (cellIndex === 6) {
                        renderDetermineConditionPopup(record.data);
                      } else {
                        var $content = $(".pf-cal-determine-condition-info .apply-rule");
                        var $conversionContent = $(".pf-cal-determine-condition-info .apply-rule-conversion-content");
                        var s = "#" + record.get("judgementConditionSequenceNumber");
                        PFFormulaEditor.inputToken(s, $content);
                      }
                    },
                    "viewready": function(_this, eOpts){

                    }
                  },
                  plugins: [
                    Ext.create("Ext.grid.plugin.CellEditing", {
                      clicksToEdit: 1,
                      listeners:{
                        beforeedit:function(e, editor){

                          if(editor.record.field === "isAdditionalInfoExist") {
                            return false;
                          }
                        },
                        afteredit: function(e, editor){
                          if(editor.originalValue !==  editor.value && editor.record.get("process") !== "C"){
                            editor.record.set("process", "U");
                          }
                        }
                      }
                    })
                    ]
          } // gridcinfig end
      }); // 그리드 end
      return grid;
    },


    /**
     * main-menu
     */
    renderSearchTree: function(keyword) {
      var self = calculationUnitManager;

      self.$root.find(".calculation-unit-search-list-wrap").addClass("active");
      self.$root.find(".calculation-unit-search-list-wrap").empty();

      var data = [];
      $.each(self.navTreeStore.findNodesBy(function(node) {
          return keyword ? node.cls === "PT" && node.text.toUpperCase().search(keyword.toUpperCase()) >= 0 : 0;
      }), function(index, item) {
        data.push({
          text: item.text,
          calculationUnitId: item.calculationUnitId,
          transactionId: item.transactionId
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
            render : ".calculation-unit-search-list-wrap",
            showLine : false,
            store : store,
            showRoot : false
          });

          tree.render();

          tree.on("itemdblclick", function(e) {
            var node = self.navTreeStore.findNode(e.item.calculationUnitId);
            self.traceTree(node);
            self.renderCalculationUnitInfo(node);
            self.$root.find(".calculation-unit-search-list-wrap").removeClass("active");
          });
        });
        store.load();

      });
    },

    /**
     * unit-form
     */
    saveUnit: function() {
      var self = calculationUnitManager;
      var $form = self.$root.find(".pf-cal-unit-form");
      if (!self.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);
      var node = self.navTreeStore.findNode(item.calculationUnitId);

      // modified rule
      if (self.calculationRuleGrid) {
        self.calculationRuleGrid.store.each(function(record, index) {
          if (record.dirty && record.get("process") !== "C") {
            record.set("process", "U");
          }
        });

        item.ruleList = self.calculationRuleGrid.getAllData().filter(function(value) {
          return value.process;
        }).concat(self.deletedRules);
      }
      item.transactionId = node.transactionId;

      self.saveCalculationUnit(item, function(responseData) {
        PFComponent.showMessage(bxMsg("workSuccess"), "success");
        self.deletedRules = [];
        self.renderCalculationUnitTree(responseData);
      });
    },

    deleteUnit: function() {
      var self = calculationUnitManager;
      var $form = self.$root.find(".pf-cal-unit-form");
      if (!self.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);
      var node = self.navTreeStore.findNode(item.calculationUnitId);
      item.transactionId = node.transactionId;

      PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
        self.deleteCalculationUnit(item, function(responseData) {
          PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
          self.renderCalculationUnitTree(item);
        });
      });
    },

    initConditionMap: function(callBack) {
      var self = calculationUnitManager;

      self.queryConditionTemplateBaseForList({conditionName: "0"}, function(responseData) {
          var map = {};
          var detailMap = {};
          for (var i in responseData) {
            var each = responseData[i];
            map[each.code] = each.name;
            detailMap[each.code] = each;
          }

          self.conditionMap = map;
          self.conditionDetailMap = detailMap;
          callBack();
      });
    },

    renderCalculationRangeConditionDetail: function(conditionCode, detail, renderTo, readOnly) {
      var self = calculationUnitManager;
      var $rngform = $(renderTo);//$(".calculation-rule-range-condition-form-table");
      var detail = detail || {};

      var rangeDetailType = {};
      var typeArray = codeArrayObj["ProductConditionDetailTypeCode"];
      typeArray.forEach(function(each) {
        if (each.code <= 5) // 01 ~ 05 - 법위형
          rangeDetailType[each.code] = each.name;
      });

      //var conditionCode = $(".calculation-rule-condition-form-table [data-form-param='conditionCode']").val();
      var rangeTypeCode = detail.rangeTypeCode || self.conditionDetailMap[conditionCode].conditionDetailTypeCode;
      self.renderComboBox(null,
          $rngform.find("[data-form-param='rangeTypeCode']"),
          rangeTypeCode, true, rangeDetailType);
      $rngform.find("[data-form-param='rangeTypeCode']").trigger("change");

      var $measurementUnit = $rngform.find("[data-form-param='measurementUnitCode']");

      if (rangeTypeCode === "01") { // 금액
        self.renderComboBox("CurrencyCode",
            $rngform.find("[data-form-param='currencyCode']"),
            detail.currencyCode, true);

      } else if (rangeTypeCode === "02") { // 날짜
        self.renderComboBox("ProductMeasurementUnitCodeD",
            $measurementUnit, detail.measurementUnitCode, true);

      } else if (rangeTypeCode === "03") { // 숫자
        self.renderComboBox("ProductMeasurementUnitCodeF",
            $measurementUnit, detail.measurementUnitCode, true);

      } else if (rangeTypeCode === "04") { // 주기
        self.renderComboBox("ProductMeasurementUnitCodeN",
            $measurementUnit, detail.measurementUnitCode, true);

      } else if (rangeTypeCode === "05") { // /율
        self.renderComboBox("ProductMeasurementUnitCodeR",
            $measurementUnit, detail.measurementUnitCode, true);

      }

      $rngform.find("[data-form-param='basicValue']").val(detail.basicValue);

      if (readOnly) {
        $rngform.find("[data-form-param='basicValue']").prop("disabled", true);
        $rngform.find("[data-form-param='currencyCode']").prop("disabled", true);
        $rngform.find("[data-form-param='measurementUnitCode']").prop("disabled", true);
      }

    },

    renderCalculationRuleCompose: function(item, renderTo, readOnly) {
      // modify listener 제거
      $(renderTo).off('change');

      var self = calculationUnitManager;
      $(renderTo).html(self.calculationRuleComposeDetailTpl(item));
      var $form = $(renderTo).find(".calculation-rule-compose-detail-form-table");

      // render combobox
      self.renderComboBox("CalcnUnitStatusCd",
          $form.find("[data-form-param='calculationRuleStatusCode']"),
          item.calculationRuleStatusCode, true);
      self.renderComboBox("valCmptnMthdDscd",
          $form.find("[data-form-param='valueComputationMethodDistinctionCode']"),
          item.valueComputationMethodDistinctionCode, true);
      self.renderComboBox("upCalcnRuleCmpsElmntRelTpDscd",
          $form.find("[data-form-param='upComposeElementRelationTypeDistinctionCode']"),
          item.upComposeElementRelationTypeDistinctionCode, true);

      $form.find("[data-form-param='valueComputationMethodDistinctionCode']").trigger("change");

      // datepicker
      self.getDatePicker(false, $form);
      $form.find("[data-form-param='applyStartDate']").val(this.toPFDate(item.applyStartDate));
      $form.find("[data-form-param='applyEndDate']").val(this.toPFDate(item.applyEndDate));

      $form.find(".reference-condition-name").text(self.conditionMap[item.referenceConditionCode]);

      if (item.process === "C") {
        $(renderTo).find(".save-calculation-rule-compose-btn").prop("disabled", true);

      }

      if (item.calculationRuleStatusCode === "04") { // 활동중인 경우 날짜만 수정 가능
        $form.find(".editable").prop("disabled", true);
        $form.find("[data-form-param='applyStartDate']").prop("disabled", false);
        $form.find("[data-form-param='applyEndDate']").prop("disabled", false);
      }

      if (readOnly) {
        $(renderTo).find("input, select, textarea").prop("disabled", true);
        $(renderTo).find(".write-btn").addClass("invisible");
        if ($(renderTo).parent().hasClass("context-popup")) {
          $(renderTo).find(".sub-compose-wrap").hide();
          $(renderTo).find(".bw-btn").hide();
          $(renderTo).find(".toggle-btn").hide();
          $(renderTo).find(".calculation-rule-compose-footer").hide();
        }
      }

      // modify listener
      $(renderTo).on('change', 'input, select, textarea', (e) => {
        composeModifyFlag = true;
      });

    },

    selectCondition: function(callBack, conditionTypeCode) {
      var self = calculationUnitManager;

      // Combobox data
      var listDetailType = {};
      var rangeDetailType = {};
      var typeArray = codeArrayObj["ProductConditionDetailTypeCode"];
      for (var i in typeArray) {
        var each = typeArray[i];
        if (each.code <= 5) // 01 ~ 05 - 법위형
          rangeDetailType[each.code] = each.name;
        else // 06 ~ 07 - 목록형
          listDetailType[each.code] = each.name;
      }

      // filter function
      var typeCheck = function(record, type) {
        if (type)
          return record.get("type") === type;
        return true;
      };

      var detailTypeCheck = function(record, detailType) {
        if (detailType)
          return record.get("conditionDetailTypeCode") === detailType;
        return true;
      };

      var nameCheck = function(record, name) {
        if (name) {
          var keyword = record.get("name") + " " + record.get("code");
          return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
        }
        return true;
      };

      var $container, grid, $form;
      var popupId = self.getNextPopupId();
      var popup = PFComponent.makePopup({
        title: bxMsg("selectCondition"),
        contents: self.conditionPopupTpl(),
        elCls: popupId,
        width: 400,
        height: 400,
        useCurrentTaskIdConfirmYn: true,
        buttons: [
          {
            text: bxMsg("Z_OK"),
            elCls: "button button-primary write-btn select-condition-btn",
            handler : function() {
              var selectedItems = grid.getSelectedItem();
              if (selectedItems.length > 0)
                var item = selectedItems[0];
              else return;

              if (callBack && typeof(callBack) === "function")
                callBack(item);
              this.close();
            }
          },
          {
            text: bxMsg('ButtonBottomString16'),
            elCls: 'button button-primary',
            handler : function(){
              this.close()
            }
          }
          ],
          listeners: {
            afterSyncUI: function() {
              $container = $("." + popupId);
              $form = $container.find(".select-condition-form-table");

              // 조건 유형
              self.renderComboBox("ProductConditionTypeCode", $form.find("[data-form-param='type']"), null, true);

              // 조건 그리드
              grid = PFComponent.makeExtJSGrid({
                fields: ["code", "name", "type", "conditionDetailTypeCode" ],
                gridConfig: {
                  renderTo: $container.find(".pf-cal-condition-search-grid"),
                  columns: [
                    {text: bxMsg("cndCd"), width: 160, dataIndex: "code"},
                    {text: bxMsg("cndNm"), flex: 1, dataIndex: "name"}
                    ],
                    listeners: {
                      scope: this,
                      "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        $container.find(".select-condition-btn").click();
                      }
                    }
                },
              });

              self.queryConditionTemplateBaseForList({conditionName: "0", conditionTypeCode: conditionTypeCode}, function(responseData) {
                grid.setData(responseData);
              });
            }
          },
          contentsEvent: {
            "keyup .condition-name-input": function(e) {
              var type = $form.find("[data-form-param='type']").val();
              var detailType = $form.find("[data-form-param='detailType']").val();
              var name = $form.find("[data-form-param='cndNm']").val();

              grid.store.filterBy(function(record) {
                return typeCheck(record, type) && detailTypeCheck(record, detailType)
                && nameCheck(record, name);
              });
            },

            "change .condition-type-input": function(e) {
              var type = $form.find("[data-form-param='type']").val();

              switch (type) {
              case "01": // 목록
                self.renderComboBox(null, $form.find("[data-form-param='detailType']"), null, true, listDetailType);
                break;
              case "02": // 범위
                self.renderComboBox(null, $form.find("[data-form-param='detailType']"), null, true, rangeDetailType);
                break;
              case "03": // 금리
                self.renderComboBox("ProductConditionInterestDetailTypeCode", $form.find("[data-form-param='detailType']"), null, true);
                break;
              case "04": // 수수료
                self.renderComboBox("ProductConditionFeeDetailTypeCode", $form.find("[data-form-param='detailType']"), null, true);
                break;
              default:
                $form.find("[data-form-param='detailType']").empty();
              }

              // 초기화
              $container.find(".condition-name-input").trigger("keyup");
            },

            "change .condition-detail-type-input": function(e) {
              // 초기화
              $container.find(".condition-name-input").trigger("keyup");
            }
          }
      });
    },

    editFormula: function(item, callBack) {
      var self = calculationUnitManager;

      // filter function
      var typeCheck = function(record, type) {
        if (type)
          return record.get("type") === type;
        return true;
      };

      var nameCheck = function(record, name) {
        if (name) {
          var keyword = record.get("name") + " " + record.get("code");
          return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
        }
        return true;
      };

      var grid, $form, $formula, tokens;
      var Editor = PFFormulaEditor;
      var popup = PFComponent.makePopup({
        title: bxMsg("formulaEdit"),
        contents: self.editFormulaPopupTpl(item),
        width: 510,
        height: 565,
        useCurrentTaskIdConfirmYn: true,
        buttons: [
          {
            text: bxMsg("Z_OK"),
            elCls: "button button-primary write-btn create-formula-btn",
            handler : function() {
              if (Editor.validate($formula.val())) {
                callBack($formula.val());
                this.close();
              } else {
                PFComponent.showMessage(bxMsg("invalidFormula"), "error");
              }
            }
          },
          {
            text: bxMsg("ButtonBottomString16"),
            elCls: "button button-primary",
            handler : function(){
              this.close()
            }
          }
        ],
        listeners: {
          afterSyncUI: function() {
              $form = $(".pf-cal-formula-editor-popup");
              $formula = $form.find("[data-form-param='formulaContent']");
              tokens = Editor.tokenize($formula.val());

              var conversionContent = Editor.translate($formula.val(), self.conditionMap, " ");
              $form.find("[data-form-param='conversionContent']").val(conversionContent);

              // 조건 유형
              self.renderComboBox("ProductConditionTypeCode", $form.find("[data-form-param='type']"), null, true);

              // 조건 그리드
              grid = PFComponent.makeExtJSGrid({
                fields: ["code", "name", "type", "conditionDetailTypeCode", "isActive",
                  {
                    name: "typeName",
                    convert: function(newValue, record) {
                      var typeName;
                      var detailType = record.get("conditionDetailTypeCode");

                      if (record.get("type") === "03") {
                        typeName = codeMapObj.ProductConditionInterestDetailTypeCode[detailType];

                      } else if (record.get("type") === "04") {
                        typeName = codeMapObj.ProductConditionFeeDetailTypeCode[detailType];

                      } else {
                        typeName = codeMapObj.ProductConditionDetailTypeCode[detailType];

                      }
                      return typeName;
                    }
                  },
                  {
                    name: "statusName",
                    convert: function(newValue, record) {
                      return codeMapObj["ProductConditionTypeCode"][record.get("type")];
                    }
                  }
                ],
                gridConfig: {
                  renderTo: ".formula-editor-grid",
                  columns: [
                    {text: bxMsg("cndCd"), width: 70, dataIndex: "code", align: "center"},
                    {text: bxMsg("cndNm"), flex: 1, dataIndex: "name", align: "center"},
                    {text: bxMsg("DTP0203String4"), width: 80, dataIndex: "typeName", align: "center"},
                    {text: bxMsg("status"), width: 50, dataIndex: "isActive", align: "center",
                      renderer: function(value, p, record) {
                        if (value === "Y")
                          return bxMsg("active");
                        return bxMsg("inactive");
                      }
                    }
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                      tokens.push({
                        type: TokenType.CONDITION,
                        value: "$" + record.get("code")
                      });

                      $formula.val(Editor.toContent(tokens, " "));
                    }
                  }
                },
              });

              self.queryConditionTemplateBaseForList({conditionName: "0"}, function(responseData) {
                grid.setData(responseData);
              });

          }
        },
        contentsEvent: {
          "keyup .cnd-name-search": function(e) {
            var type = $form.find("[data-form-param='type']").val();
            var name = $form.find("[data-form-param='name']").val();

            grid.store.filterBy(function(record) {
              return typeCheck(record, type) && nameCheck(record, name);
            })
          },

          "change .cnd-type-select": function(e) {
            $(".cnd-name-search").trigger("keyup");
          },

          "click .text-input-btn" : function(e) {
            var s = $(e.currentTarget).val();
            var type;

            if (s === "case" || s === "min" || s === "max") { // function
              type = TokenType.FUNCTION;

            } else if (s === "(") {
              type = TokenType.OPEN_BRACKET;

            } else if (s === ")") {
              type = TokenType.CLOSE_BRACKET;

            } else if (s === ",") {
              type = TokenType.COMMA;

            } else if (s === "+" || s === "-" || s === "*" || s === "/") {
              type = TokenType.ARITHMETIC;
            } else {
              type = TokenType.NUMBER;
            }

            tokens.push({
              type: type,
              value: s
            });

            $formula.val(Editor.toContent(tokens, " "));

          },

          "click .back-space-btn" : function(e) {
            tokens.pop();
            $formula.val(Editor.toContent(tokens, " "));
          },

          "click .formula-validation-btn": function(e) {

            if (Editor.validate($formula.val())) {

              var conversionContent = Editor.translate($formula.val(), self.conditionMap, " ");
              $form.find("[data-form-param='conversionContent']").val(conversionContent);

            } else {
              PFComponent.showMessage(bxMsg("invalidFormula"), "error");
            }

          }
        }
      });
    },

    renderSubComposeGrid: function(rule) {
      var self = calculationUnitManager;
      var readOnly = rule.baseDate ? true : false;

      $(".sub-compose-grid").empty();

      var grid = PFComponent.makeExtJSGrid({
        fields: ["composeElementConditionCode", "calculationRuleComposeElementId", "applyStartDate",
                  {
                    name: "composeElementConditionName",
                    convert: function(newValue, record) {
                      return self.conditionMap[record.get("composeElementConditionCode")];
                    }
                  }, {
                    name: "calculationRuleStatusCode",
                    defaultValue: "01"
                  }, "process"],
        gridConfig: {
          renderTo: ".sub-compose-grid",
          columns: [
            {
              text: bxMsg("cndCd"), width: 100, dataIndex: "composeElementConditionCode", align: "center"
            },
            {
              text: bxMsg("cndNm"), flex: 1, dataIndex: "composeElementConditionName", align: "center"
            },
            {
              text: bxMsg("status"), width: 70, dataIndex: "calculationRuleStatusCode", align: "center",
              renderer: function(value) {
                return codeMapObj["ProductStatusCode"][value];
              }
            },
            {
              xtype: "actioncolumn", width: 35, align: "center",
              items: [{
                icon: "/images/x-delete-16.png",
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                  if (record.get("process") !== "C") {
                    record.set("process", "D");
                    self.deletedSubCompose.push(record.data);
                  }
                  record.destroy();
                  composeModifyFlag = true;
                }
              }],
              renderer: function(value, p, record) {
                if (readOnly || record.get("calculationRuleStatusCode") !== "01")
                  p.style += "display: none;";
              }
            }
          ]
        },
      });

      var item = {
          calculationRuleId: rule.calculationRuleId,
          upComposeElementId: $("[data-form-param='calculationRuleComposeElementId']").val(),
          baseDate: rule.baseDate
      };

      self.getCalculationRuleComposeForList(item, function(responseData) {
        responseData = responseData || [];
        responseData.forEach(function(compose) {
          grid.store.add(compose);
        });
      });

      self.subComposeGrid = grid;

    },

    renderCalculationRuleListConditionGrid: function(conditionCode, selectedItems, renderTo, readOnly) {
      var self = calculationUnitManager;
      $(renderTo).empty();

      var grid = PFComponent.makeExtJSGrid({
        fields: ["selected", "listCode", "codeName"],
        gridConfig: {
          renderTo: renderTo,
          columns: [
            {
              xtype: "checkcolumn", text: bxMsg("useYn"), width: 120, dataIndex: "selected", align: "center",
              disabled: readOnly,
              listeners: {
                beforecheckchange() {
                  cndModifyFlag = true;
                },
              },
            },
            {
              text: bxMsg("code"), flex: 1, dataIndex: "listCode", align: "center"
            },
            {
              text: bxMsg("codeName"), flex: 1, dataIndex: "codeName", align: "center"
            }
          ],
        },
      });

      var item = {
          code: conditionCode
      };

      var map = selectedItems.reduce(function(map, v) {
        map[v] = true;
        return map;
      }, {})

      self.getListCndTemplateMasterList(item, function(responseData) {
        var listCnd = responseData[0].values;
        $.each(listCnd, function(index, cnd) {
          grid.store.add({
            selected: map[cnd.key] ? true : false,
            listCode: cnd.key,
            codeName: cnd.value
          });
        });
      });

      return grid;
    },

    buildCalculationRuleCondition: function() {
      var self = calculationUnitManager;
      var $cndform = $(".calculation-rule-condition-form-table");

      var isComplex = $cndform.find("[data-form-param='complexConditionYn']").is(":checked");
      var cnd = PFUtil.makeParamFromForm($cndform, {dateFormat: "yyyyMMdd"});
      cnd.complexConditionYn = isComplex ? "Y" : "N";
      var detailList;

      if (isComplex) { // 복합조건인 경우
        var complexComposeList = [];
        var complexComposeMap = {};
        var detailList = [];

        self.complexConditionGrid.getAllData().forEach(function(cxCnd) {
          var index = 0;
          var line = Object.keys(cxCnd).reduce(function(list, key) {
            var cnd = cxCnd[key];
            if (cnd.isComposeCondition && cnd.conditionTypeCode === "01") list.push(cxCnd[key]);
            return list;
          }, []);
          var redundantSize = line.reduce(function(cnt, v) {
            return cnt * v.listCode.length;
          }, 1);

          for (var i in cxCnd) {
            if (cxCnd[i].isComposeCondition) {
              var composeCnd = cxCnd[i];

              var complexCompose = complexComposeMap[composeCnd.conditionCode];

              if (!complexCompose) {
                complexCompose = {
                    conditionCode: composeCnd.conditionCode,
                    conditionTypeCode: composeCnd.conditionTypeCode,
                    belowUnderDistinctionCode: composeCnd.belowUnderDistinctionCode,
                    measurementUnitCode: composeCnd.measurementUnitCode,
                    currencyCode: composeCnd.currencyCode,
                }

                if (complexCompose.conditionTypeCode === "01") { // 목록
                  complexCompose.listCodeList = [];

                } else if (complexCompose.conditionTypeCode === "02") { //범위
                  complexCompose.minValueList = [];
                  complexCompose.maxValueList = [];

                }
                complexComposeMap[composeCnd.conditionCode] = complexCompose;
                complexComposeList.push(complexCompose);

              }

              var prevSize = line.slice(0, index).reduce(function(cnt, v) {
                return cnt * v.listCode.length;
              }, 1);
              var restSize = line.slice(++index).reduce(function(cnt, v) {
                return cnt * v.listCode.length;
              }, 1);

              if (complexCompose.conditionTypeCode === "01") { // 목록
                for (var i=0; i<prevSize; i++) {
                  composeCnd.listCode.forEach(function(v) {
                    for (var j=0; j<restSize; j++) {
                      complexCompose.listCodeList.push(v);
                    }
                  });
                }

              } else if (complexCompose.conditionTypeCode === "02") { //범위
                for (var i=0; i<redundantSize; i++) {
                  complexCompose.minValueList.push(composeCnd.minValue);
                  complexCompose.maxValueList.push(composeCnd.maxValue);
                }

              }

            }
          }

          // detail
          var type = cnd.conditionTypeCode;
          var value = cxCnd.condition;

          for (var i=0; i<redundantSize; i++) {
            if (type === "01") { // 목록
              var listCodeList = value.listCodeList.map(function(v) {
                return {
                  listCode: v.code
                }
              });

              detailList.push({
                detailList: listCodeList
              });

            } else if (type === "02") { // 범위
              detailList.push(value);
            }
          }
        });
        cnd.complexComposeList = complexComposeList;
        cnd.detailList = detailList;

      } else { // 단순조건인 경우
        if (cnd.conditionTypeCode === "01") { // list
          detailList = self.calculationRuleListConditionGrid.getAllData().filter(function(v) {
            return v.selected;
          });
          console.log(self.calculationRuleListConditionGrid);

        } else if (cnd.conditionTypeCode === "02") { // range
          var $rngform = $(".calculation-rule-range-condition-form-table");
          detailList = [PFUtil.makeParamFromForm($rngform)];
        }
      }

      cnd.detailList = detailList;
      return cnd;
    },


    makeComplexGridRecord: function(detail, composeConditionList, index) {
      var record = {};
      record.condition = detail;
      composeConditionList.forEach(function(v) {
        if (v.conditionTypeCode === "01") {
          record[v.conditionCode + ".listCode"] = v.listCodeList[index];

        } else if (v.conditionTypeCode === "02") {
          record[v.conditionCode + ".minValue"] = v.minValueList[index];
          record[v.conditionCode + ".maxValue"] = v.maxValueList[index];
        }
      });

      return record;
    },


    /**
     * Model Controller
     */

    /** Calculation Unit */
    getCalculationUnitForList: function(callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationUnitForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitService",
          operation: "getCalculationUnitForList"
        }
      });
    },

    createCalculationUnit: function(item, callBack) {
      var requestParam = {
          calculationUnitId: item.calculationUnitId,
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
          calculationUnitStatusCode: item.calculationUnitStatusCode,
          levyCurrencyDistinctionCode: item.levyCurrencyDistinctionCode,
          amountTypeCode: item.amountTypeCode,
          transactionId: item.transactionId,

          // Common Params
          process: "C",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/createCalculationUnit.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitService",
          operation: "createCalculationUnit"
        }
      });
    },

    saveCalculationUnit: function(item, callBack) {

      if(!calUnitModifyFlag){
        // 변경된 정보가 없습니다.
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
      }

      // for IE
      var ruleList = [];
      if (item && item.ruleList && item.ruleList.length > 0) {
    	  for (var i = 0; i < item.ruleList.length; i++) {
    		  ruleList.push(item.ruleList[i]);
    	  }
      }
      
      var requestParam = {
          calculationUnitId: item.calculationUnitId,
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
          calculationUnitStatusCode: item.calculationUnitStatusCode,
          levyCurrencyDistinctionCode: item.levyCurrencyDistinctionCode,
          amountTypeCode: item.amountTypeCode,
          transactionId: item.transactionId,
          // for IE
          //ruleList: Object.values($.extend(true, {}, item.ruleList)),
          ruleList: ruleList,

          // Common Params
          process: "U",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/saveCalculationUnit.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
          calUnitModifyFlag = false;
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitService",
          operation: "saveCalculationUnit"
        }
      });
    },

    copyCalculationUnit: function(item, callBack) {
      var requestParam = {
          calculationUnitId: item.calculationUnitId,
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          transactionId: item.transactionId,

          // Common Params
          process: "C",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/copyCalculationUnit.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitService",
          operation: "copyCalculationUnit"
        }
      });
    },

    deleteCalculationUnit: function(item, callBack) {
      var requestParam = {
          calculationUnitId: item.calculationUnitId,
          calculationUnitStatusCode: item.calculationUnitStatusCode,

          // Common Params
          process: "D",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/deleteCalculationUnit.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitService",
          operation: "deleteCalculationUnit"
        }
      });
    },

    /** Calculation Rule */
    getCalculationRuleForList: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationUnitId: item.calculationUnitId
      };

      PFRequest.get("/calculator/getCalculationRuleForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleService",
          operation: "getCalculationRuleForList"
        }
      });
    },

    getCalculationRuleHistory: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationRuleId: item.calculationRuleId
      };

      PFRequest.get("/calculator/getCalculationRuleHistory.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleService",
          operation: "getCalculationRuleHistory"
        }
      });
    },

    /** Calculation Rule Compose */
    getCalculationRuleCompose: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationRuleComposeElementId: item.calculationRuleComposeElementId,
          applyStartDate: item.applyStartDate
      };

      PFRequest.get("/calculator/getCalculationRuleCompose.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleComposeService",
          operation: "getCalculationRuleCompose"
        }
      });
    },

    getCalculationRuleComposeForList: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationRuleComposeElementId: item.calculationRuleComposeElementId,
          calculationRuleId: item.calculationRuleId,
          upComposeElementId: item.upComposeElementId
      };

      PFRequest.get("/calculator/getCalculationRuleComposeForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleComposeService",
          operation: "getCalculationRuleComposeForList"
        }
      });
    },

    getCalculationRuleComposeForTree: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationRuleId: item.calculationRuleId
      };

      PFRequest.get("/calculator/getCalculationRuleComposeForTree.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleComposeService",
          operation: "getCalculationRuleComposeForTree"
        }
      });
    },

    saveCalculationRuleCompose: function(item, callBack) {

        if(!composeModifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

      var requestParam = {
          calculationRuleComposeElementId: item.calculationRuleComposeElementId,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          calculationRuleStatusCode: item.calculationRuleStatusCode,
          calculationRuleId: item.calculationRuleId,
          composeElementConditionCode: item.composeElementConditionCode,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode,
          interestRateStructureCode: item.interestRateStructureCode,
          upComposeElementId: item.upComposeElementId,
          upComposeElementRelationTypeDistinctionCode: item.upComposeElementRelationTypeDistinctionCode,
          calculationLevelNumber: item.calculationLevelNumber,
          calculationRuleContent: item.calculationRuleContent,
          referenceConditionCode: item.referenceConditionCode,
          referenceObjectName: item.referenceObjectName,
          inputInformationAttributeName: item.inputInformationAttributeName,
          referenceAttributeName: item.referenceAttributeName,
          calculationClassName: item.calculationClassName,
          children: item.children,

          // Common Params
          process: "U",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/saveCalculationRuleCompose.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
          composeModifyFlag = false;
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleComposeService",
          operation: "saveCalculationRuleCompose"
        }
      });

    },

    /** Calculation Unit Template */
    getCalculationUnitTemplate: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationUnitConditionCode: item.calculationUnitConditionCode
      };

      PFRequest.get("/calculator/getCalculationUnitTemplate.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitTemplateService",
          operation: "getCalculationUnitTemplate"
        }
      });
    },

    /** Calculation Compose Element Template */
    getCalculationComposeElementTemplateForList: function(callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationComposeElementTemplateForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationComposeElementTemplateService",
          operation: "getCalculationComposeElementTemplateForList"
        }
      });
    },

    getCalculationComposeElementTemplateForTree: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          composeElementConditionCode: item.composeElementConditionCode
      };

      PFRequest.get("/calculator/getCalculationComposeElementTemplateForTree.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationComposeElementTemplateService",
          operation: "getCalculationComposeElementTemplateForTree"
        }
      });
    },

    /** Calculation Formula */
    getCalculationFormulaForList: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          calculationUnitConditionCode: item.calculationUnitConditionCode
      };

      PFRequest.get("/calculator/getCalculationFormulaForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationFormulaService",
          operation: "getCalculationFormulaForList"
        }
      });
    },

    /** Calculation Rule Condition */
    getCalculationRuleCondition: function(item, callBack) {
      var requestParam = {
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          applyStartDate: item.applyStartDate,
          baseDate: item.baseDate,
          tntInstId: getLoginTntInstId()
      };

      PFRequest.get("/calculator/getCalculationRuleCondition.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleConditionService",
          operation: "getCalculationRuleCondition"
        }
      });
    },

    getCalculationRuleConditionList: function(item, callBack) {
      var requestParam = {
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          tntInstId: getLoginTntInstId()
      };

      PFRequest.get("/calculator/getCalculationRuleConditionList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleConditionService",
          operation: "getCalculationRuleConditionList"
        }
      });
    },

    saveCalculationRuleCondition: function(item, callBack) {

        if(!cndModifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

      var requestParam = {
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          conditionTypeCode: item.conditionTypeCode,
          complexConditionYn: item.complexConditionYn,
          complexStructureId: item.complexStructureId,
          conditionStatusCode: item.conditionStatusCode,
          detailList: item.detailList,
          complexComposeList: item.complexComposeList,

          // Common Params
          process: "U",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/saveCalculationRuleCondition.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
          cndModifyFlag = false;
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationRuleConditionService",
          operation: "saveCalculationRuleCondition"
        }
      });

    },

    /** Condition Template */
    queryConditionTemplateBaseForList: function(item, callBack) {
      var requestParam = {
          conditionName: item.conditionName,
          conditionTypeCode: item.conditionTypeCode,
          activeYn: "Y",
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/condition/template/queryConditionTemplateBaseForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CndTemplateService",
          operation: "queryListCndTemplate"
        }
      });
    },

    getConditionTemplate: function(item, callBack) {
      var requestParam = {
          conditionCode: item.conditionCode,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/condition/template/getConditionTemplate.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CndTemplateService",
          operation: "queryCndTemplate"
        }
      });
    },

    getListCndTemplateMasterList: function(item, callBack) {
      var requestParam = {
          code: item.code,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/condition/template/getListCndTemplateMasterList.json", requestParam, {
        success: function (responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CndTemplateService",
          operation: "queryListListCndTemplate"
        }
      });
    },

    /** Apply Rule */
    getCalculationApplyRule: function(item, callBack) {
      var requestParam = {
          applyRuleId: item.applyRuleId,
          ruleApplyTargetDistinctionCode: item.ruleApplyTargetDistinctionCode,
          calculationUnitId: item.calculationUnitId,
          calculationRuleId: item.calculationRuleId,
          transactionId: item.transactionId,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationApplyRule.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationApplyRuleService",
          operation: "getCalculationApplyRule"
        }
      });
    },

    getCalculationApplyRuleHistory: function(item, callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
          applyRuleId: item.applyRuleId
      };

      PFRequest.get("/calculator/getCalculationApplyRuleHistory.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationApplyRuleService",
          operation: "getCalculationApplyRuleHistory"
        }
      });
    },

    saveCalculationApplyRule: function(item, callBack) {

      if(item.ruleApplyTargetDistinctionCode === "05" && !calRuleModifyFlag){
	  		// 변경된 정보가 없습니다.
	  		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
	  		return;

      }else if(item.ruleApplyTargetDistinctionCode === "06" && !determineRuleModifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;

      }else if((item.ruleApplyTargetDistinctionCode === "07" || item.ruleApplyTargetDistinctionCode === "09") && !modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
       }

      var requestParam = {
          applyRuleId: item.applyRuleId,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          ruleApplyTargetDistinctionCode: item.ruleApplyTargetDistinctionCode,
          ruleContent: item.ruleContent,
          ruleStatusCode: item.ruleStatusCode,
          calculationUnitId: item.calculationUnitId,
          calculationRuleId: item.calculationRuleId,
          composeElementConditionCode: item.composeElementConditionCode,
          transactionId: item.transactionId,

          // Common Params
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/saveCalculationApplyRule.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
          if(item.ruleApplyTargetDistinctionCode === "05"){
        	  calRuleModifyFlag = false;
          }else if(item.ruleApplyTargetDistinctionCode === "06"){
        	  determineRuleModifyFlag = false;
          }else if(item.ruleApplyTargetDistinctionCode === "07" || item.ruleApplyTargetDistinctionCode === "09"){
        	  modifyFlag = false;
          }
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationApplyRuleService",
          operation: "saveCalculationApplyRule"
        }
      });

    },

    /** Calculation Determine Condition */
    getCalculationDetermineCondition: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          applyStartDate: item.applyStartDate,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationDetermineCondition.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "getCalculationDetermineCondition"
        }
      });
    },

    getCalculationDetermineConditionForList: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          calculationUnitId: item.calculationUnitId,
          transactionId: item.transactionId,
          baseDate: item.baseDate,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationDetermineConditionForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "getCalculationDetermineConditionForList"
        }
      });
    },

    createCalculationDetermineCondition: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          transactionId: item.transactionId,
          calculationUnitId: item.calculationUnitId,
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          conditionTypeCode: item.conditionTypeCode,
          conditionStatusCode: item.conditionStatusCode,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode,
          className: item.className,
          referenceConditionCode: item.referenceConditionCode,
          referenceAttributeName: item.referenceAttributeName,
          referenceObjectName: item.referenceObjectName,
          minValue: item.minValue,
          maxValue: item.maxValue,
          measureUnitCode: item.measureUnitCode,
          currencyCode: item.currencyCode,
          calculationDetermineListConditionDetailList: item.calculationDetermineListConditionDetailList,

          // Common Params
          process: "C",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/createCalculationDetermineCondition.json", requestParam, {
        success: function(responseData) {
          if (responseData) {
            callBack(responseData);
          }
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "createCalculationDetermineCondition"
        }
      });
    },

    updateCalculationDetermineCondition: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          transactionId: item.transactionId,
          calculationUnitId: item.calculationUnitId,
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          conditionTypeCode: item.conditionTypeCode,
          conditionStatusCode: item.conditionStatusCode,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode,
          className: item.className,
          referenceConditionCode: item.referenceConditionCode,
          referenceAttributeName: item.referenceAttributeName,
          referenceObjectName: item.referenceObjectName,
          minValue: item.minValue,
          maxValue: item.maxValue,
          measureUnitCode: item.measureUnitCode,
          currencyCode: item.currencyCode,
          calculationDetermineListConditionDetailList: item.calculationDetermineListConditionDetailList,

          // Common Params
          process: "U",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/updateCalculationDetermineCondition.json", requestParam, {
        success: function(responseData) {
          if (responseData) {
            callBack(responseData);
          }
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "updateCalculationDetermineCondition"
        }
      });
    },

    deleteCalculationDetermineCondition: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          applyStartDate: item.applyStartDate,
          conditionTypeCode: item.conditionTypeCode,
          conditionStatusCode: item.conditionStatusCode,

          // Common Params
          process: "D",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/deleteCalculationDetermineCondition.json", requestParam, {
        success: function(responseData) {
          if (responseData) {
            callBack(responseData);
          }
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "deleteCalculationDetermineCondition"
        }
      });
    },

    saveCalculationDetermineCondition: function(item, callBack) {
      var requestParam = {
          judgementConditionSequenceNumber: item.judgementConditionSequenceNumber,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          transactionId: item.transactionId,
          calculationUnitId: item.calculationUnitId,
          calculationRuleId: item.calculationRuleId,
          conditionCode: item.conditionCode,
          conditionTypeCode: item.conditionTypeCode,
          conditionStatusCode: item.conditionStatusCode,
          minValue: item.minValue,
          maxValue: item.maxValue,
          measureUnitCode: item.measureUnitCode,
          currencyCode: item.currencyCode,
          calculationDetermineListConditionDetailList: item.calculationDetermineListConditionDetailList,

          // Common Params
          process: item.process,
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      PFRequest.post("/calculator/saveCalculationDetermineCondition.json", requestParam, {
        success: function(responseData) {
          if (responseData) {
            callBack(responseData);
          }
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationDetermineConditionService",
          operation: "saveCalculationDetermineCondition"
        }
      });
    },

    /** Verify Apply Rule */
    verifyApplyRule: function(item, callBack) {
      var requestParam = {
          ruleApplyTargetDscd: item.ruleApplyTargetDscd,
          cndGroupTemplateCode: item.cndGroupTemplateCode,
          cndGroupCode: item.cndGroupCode,
          cndCode: item.cndCode,
          pdCode: item.pdCode,
          feeDiscountSeqNbr: item.feeDiscountSeqNbr,
          ruleContent: item.ruleContent,
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/common/verifyApplyRule.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CommonService",
          operation: "verifyApplyRule"
        }
      });
    },

    /** Validate Product Condition */
    validateProductCondition: function(item, callBack) {
      var requestParam = item;/*{
          tntInstId: getLoginTntInstId(),
      };*/

      PFRequest.post("/product_condition/validateProductCondition.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "PdCndService",
          operation: "validatePdCnd"
        }
      });
    },


    /**
     * Utility
     */
    checkProject: function() {
      var projectId = getSelectedProjectId();
      var taskMenu = $(".default-layout-task-menu", parent.document);

      if(!isHaveProject()){
        haveNotTask();
        return false;
      }

      if (isNotMyTask(projectId)) {
        return false;
      }

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
    },

    toPFDate: function(calDate) {
      if (calDate)
        return calDate.substr(0, 4) + "-" + calDate.substr(4, 2) + "-" + calDate.substr(6, 2);
      return calDate;
    },

    toCalDate: function(pfDate) {
      if (pfDate)
        return pfDate.split(" ")[0].replace(/-/g, "");
      return pfDate;
    },

    getDatePicker: function(timepicker, $target) {
      $target.find(".calendar.start-date").val(PFUtil.getToday());
      $target.find(".calendar.end-date").val("9999-12-31");
      $target.find(".calendar").on("mousedown", function() {
        $(this).datetimepicker({
          format: "Y-m-d",
          timepicker: timepicker,
          minDate: "+1970/01/0" + (1 + g_nextDate),
          yearEnd: 9999,
          todayButton: true
        });
      });
    },

    isNotNegativeRangeType: function(rangeTypeCode) {
        return rangeTypeCode === "02" || rangeTypeCode === "03";
    },

    waitFor: function(conditionFunction, callBack, interval) {
      interval = interval || 100;
      var int = setInterval(function() {
        if (conditionFunction()) {
          clearInterval(int);
          callBack();
        }
      }, 100);
    },

    getNextPopupId: function() {
      return "fee-calculation-popup-" + popupCount++;
    }
};

$(document).ready(function() {
  self = calculationUnitManager;
  calculationUnitManager.run();
});

// EmergencyControl
function fnEmergencyControl(flag) {
  var isActive = $("[data-form-param='calculationUnitStatusCode']").val() === "04";
  var isEmergency = flag;

  if (isActive && !isEmergency) {
    $(".delete-calculation-unit-btn").prop("disabled", true);

  } else {
    $(".delete-calculation-unit-btn").prop("disabled", false);
  }
}