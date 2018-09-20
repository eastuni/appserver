/**
 * @author Choi Junhyeok
 * @version $$id: calculation-unit-template.js, v 0.1 2017-06-20 $$
 */

var self;
const calculationUnitTemplateController = {

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
        	self.renderMainMenu(requestParam);

        }else{
        	self.renderMainMenu();
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
      var self = calculationUnitTemplateController;

      this.mainMenuCtl = CalculationUnitTemplateMainMenuController;
      this.templateFormCtl = CalculationUnitTemplateFormController;

      this.mainMenuCtl.init(this);
      this.templateFormCtl.init(this);
    },

    initTemplates: function() {
      this.mainMenuTpl = this.getTemplate("mainMenuTpl");
      this.templateFormTpl = this.getTemplate("templateFormTpl");
      this.conditionPopupTpl = this.getTemplate("conditionPopupTpl");
      this.feeConditionPopupTpl = this.getTemplate("feeConditionPopupTpl");
    },

    getTemplate: function(template) {
      var tpl = $.ajax({
        //url: "/calculation_unit_template/tpl/" + template + ".html",
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
      var self = calculationUnitTemplateController;

      if (onEvent === undefined)
        this.bindEventListener();

      onEvent("click", "a", function(e) {
        e.preventDefault();
      });

      this.mainMenuCtl.registerEvents(onEvent);
      this.templateFormCtl.registerEvents(onEvent);
    },

    renderMainMenu: function(item) {
      var self = calculationUnitTemplateController;

      this.$root.find(".pf-cal-main-menu-box").html(this.mainMenuTpl());
      this.mainMenuCtl.renderNavTree(function (navTree, navTreeStore) {
        self.navTree = navTree;
        self.navTreeStore = navTreeStore;

        if (item) {
          self.mainMenuCtl.traceTree(item);

          var node = navTree.findNode(item.calculationUnitConditionCode);
          if (node)
            self.renderTemplateForm(node);
          else
            self.$root.find(".pf-cal-info").empty();
        }
      });
    },

    renderTemplateForm: function(item) {
      var self = calculationUnitTemplateController;
      setTaskRibbonInput(item.projectId, item.projectName);

      this.$root.find(".pf-cal-info").html(self.templateFormTpl(item));
      this.$root.find(".pf-cal-info-wrap").addClass("active");
      self.templateFormCtl.renderTemplateForm(item);
    },

    initConditionMap: function(callBack) {
      var self = calculationUnitTemplateController;

      self.queryConditionTemplateBaseForList({}, function(responseData) {
          var map = {};
          for (var i in responseData) {
            var each = responseData[i];
            map[each.code] = each.name;
          }

          self.conditionMap = map;
          callBack();
      });
    },


    /**
     * Model Controller
     */
    getCalculationUnitTemplateForList: function(callBack) {
      var requestParam = {
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/calculator/getCalculationUnitTemplateForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitTemplateService",
          operation: "getCalculationUnitTemplateForList"
        }
      });
    },

    createCalculationUnitTemplate: function(item, callBack) {
      var requestParam = {
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          activeYn: item.activeYn,
          calculationRuleExistenceYn: item.calculationRuleExistenceYn,
          amountTypeCode: item.amountTypeCode,
          calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
          formulaList: item.formulaList,
          templateValueList: item.templateValueList,

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

      PFRequest.post("/calculator/createCalculationUnitTemplate.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitTemplateService",
          operation: "createCalculationUnitTemplate"
        }
      });
    },

    saveCalculationUnitTemplate: function(item, callBack) {

    	if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

      var requestParam = {
          calculationUnitConditionCode: item.calculationUnitConditionCode,
          activeYn: item.activeYn,
          calculationRuleExistenceYn: item.calculationRuleExistenceYn,
          amountTypeCode: item.amountTypeCode,
          calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
          formulaList: item.formulaList,
          templateValueList: item.templateValueList,

          // Common Params
          process: "U",//item.activeYn === "Y" ? "C" : "U",
          projectId: getSelectedProjectId(),
          industryDistinctionCode: "01",
          lastModifier: getLoginUserId(),
          tntInstId: getLoginTntInstId(),
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId()
          }
      };

      // 판매중 && 일반 과제인 경우 이력 등록
      /*if (requestParam.activeYn === "Y"
          && !isEmergency(projectId) && !isUpdateStatus(projectId))
          requestParam.process = "C";*/

      PFRequest.post('/calculator/saveCalculationUnitTemplate.json', requestParam, {
        success: function(responseData) {
          callBack(responseData)
          modifyFlag = false;
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitTemplateService",
          operation: "saveCalculationUnitTemplate"
        }
      });
    },

    deleteCalculationUnitTemplate: function(item, callBack) {
      var requestParam = {
          calculationUnitConditionCode: item.calculationUnitConditionCode,

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

      PFRequest.post("/calculator/deleteCalculationUnitTemplate.json", requestParam, {
        success: function(responseData){
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationUnitTemplateService",
          operation: "deleteCalculationUnitTemplate"
        }
      });
    },

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

    getCalculationFormulaForList: function(item, callBack) {
      var requestParam = {
          activeYn: item.activeYn,
          tntInstId: getLoginTntInstId(),
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

    queryConditionTemplateBaseForList: function(item, callBack) {
      var requestParam = {
          conditionTypeCode: item.conditionTypeCode,
          conditionName: "0",
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
    }

};

$(document).ready(function() {
  self = calculationUnitTemplateController;
  calculationUnitTemplateController.run();
});


// EmergencyControl
function fnEmergencyControl(flag){
  var isActive = $("[data-form-param='activeYn']").val() === "Y";
  var isEmergency = flag;
  var isNew = $(".compose-element-template-value-form-table [data-form-param='calculationComposeElementTemplateValueSequenceNumber']").val();

  if (isActive && !isEmergency) {
    $(".delete-btn").prop("disabled", true);
    $(".calculation-unit-template-form-table .start-date").prop("disabled", true);
    $(".amount-type-code").prop("disabled", true);
    $(".calculation-rule-existence-yn").prop("disabled", true);

    // popup
    $(".compose-element-template-value-form-table .start-date").prop("disabled", true);
    $(".compose-element-template-value-form-table .value-computation-method-distinction-code").prop("disabled", true);
    $(".compose-element-template-value-form-table .val-method-selective-input input").prop("disabled", true);

  } else {
    $(".delete-btn").prop("disabled", false);
    $(".calculation-unit-template-form-table .start-date").prop("disabled", false);
    $(".amount-type-code").prop("disabled", false);
    $(".calculation-rule-existence-yn").prop("disabled", false);

    // popup
    $(".compose-element-template-value-form-table .start-date").prop("disabled", false);
    $(".compose-element-template-value-form-table .val-method-selective-input input").prop("disabled", false);

    if (isNew)
      $(".compose-element-template-value-form-table .value-computation-method-distinction-code").prop("disabled", false);
  }
}

