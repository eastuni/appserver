/**
 * @author Choi Junhyeok
 * @version $$id: calculation-compose-template.js, v 0.1 2017-06-16 $$
 */

var self;
const calculationComposeTemplateController = {

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
      var self = calculationComposeTemplateController;

      this.mainMenuCtl = CalculationComposeTemplateMainMenuController;
      this.templateFormCtl = CalculationComposeTemplateFormController;

      this.mainMenuCtl.init(this);
      this.templateFormCtl.init(this);
    },

    initTemplates: function() {
      this.mainMenuTpl = this.getTemplate("mainMenuTpl");
      this.templateFormTpl = this.getTemplate("templateFormTpl");
      this.conditionPopupTpl = this.getTemplate("conditionPopupTpl");
    },

    getTemplate: function(template) {
      var tpl = $.ajax({
        //url: "/calculation_compose_template/tpl/" + template + ".html",
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
      var self = calculationComposeTemplateController;

      if (this.onEvent === undefined)
        this.bindEventListener();

      onEvent("click", "a", function(e) {
        e.preventDefault();
      });

      this.mainMenuCtl.registerEvents(onEvent);
      this.templateFormCtl.registerEvents(onEvent);
    },

    renderMainMenu: function(item) {
      var self = calculationComposeTemplateController;

      this.$root.find(".pf-cal-main-menu-box").html(this.mainMenuTpl());
      this.mainMenuCtl.renderNavTree(function (navTree, navTreeStore) {
        self.navTree = navTree;
        self.navTreeStore = navTreeStore;

        if (item) {
          self.mainMenuCtl.traceTree(item);

          var node = navTree.findNode(item.composeElementConditionCode);
          if (node)
            self.renderTemplateForm(node);
          else
            self.$root.find(".pf-cal-info").empty();
        }
      });
    },

    renderTemplateForm: function(item) {
      var self = calculationComposeTemplateController;
      setTaskRibbonInput(item.projectId, item.projectName);

      this.$root.find(".pf-cal-info").html(self.templateFormTpl(item));
      this.$root.find(".pf-cal-info-wrap").addClass("active");
      self.templateFormCtl.renderTemplateForm(item);
    },

    initConditionMap: function(callBack) {
      var self = calculationComposeTemplateController;

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

    createCalculationComposeElementTemplate: function(item, callBack) {
      var requestParam = {
          composeElementConditionCode: item.composeElementConditionCode,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode,
          referenceObjectName: item.referenceObjectName,
          referenceAttributeName: item. referenceAttributeName,
          inputInformationAttributeName: item.inputInformationAttributeName,
          calculationClassName: item.calculationClassName,
          interestRateStructureCode: item.interestRateStructureCode,
          activeYn: item.activeYn,
          composeElementList: item.composeElementList,

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

      PFRequest.post("/calculator/createCalculationComposeElementTemplate.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationComposeElementTemplateService",
          operation: "createCalculationComposeElementTemplate"
        }
      });
    },

    saveCalculationComposeElementTemplate: function(item, callBack) {

      if(!modifyFlag){
    	// 변경된 정보가 없습니다.
    	PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    	return;
      }

      var requestParam = {
          composeElementConditionCode: item.composeElementConditionCode,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          valueComputationMethodDistinctionCode: item.valueComputationMethodDistinctionCode,
          referenceConditionCode: item.referenceConditionCode,
          referenceObjectName: item.referenceObjectName,
          referenceAttributeName: item. referenceAttributeName,
          inputInformationAttributeName: item.inputInformationAttributeName,
          calculationClassName: item.calculationClassName,
          interestRateStructureCode: item.interestRateStructureCode,
          activeYn: item.activeYn,
          composeElementList: item.composeElementList,

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

      PFRequest.post('/calculator/saveCalculationComposeElementTemplate.json', requestParam, {
        success: function(responseData) {
          callBack(responseData)
          modifyFlag = false;
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationComposeElementTemplateService",
          operation: "saveCalculationComposeElementTemplate"
        }
      });
    },

    deleteCalculationComposeElementTemplate: function(item, callBack) {
      var requestParam = {
          composeElementConditionCode: item.composeElementConditionCode,

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

      PFRequest.post("/calculator/deleteCalculationComposeElementTemplate.json", requestParam, {
        success: function(responseData){
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationComposeElementTemplateService",
          operation: "deleteCalculationComposeElementTemplate"
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
  self = calculationComposeTemplateController;
  calculationComposeTemplateController.run();
});

// EmergencyControl
function fnEmergencyControl(flag){
  var isActive = $("[data-form-param='activeYn']").val() === "Y";
  var isEmergency = flag;

  if (isActive && !isEmergency) {
    $(".delete-btn").prop("disabled", true);
    $(".calculation-compose-template-form-table .start-date").prop("disabled", true);
    $(".val-method-selective-input select").prop("disabled", true);

  } else {
    $(".delete-btn").prop("disabled", false);
    $(".calculation-compose-template-form-table .start-date").prop("disabled", false);
    $(".val-method-selective-input select").prop("disabled", false);
  }
}

