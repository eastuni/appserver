/**
 * @author Choi Junhyeok
 * @version $$id: calculation-formula.js, v 0.1 2017-06-16 $$
 */

var self;
const calculationFormulaController = {

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
      var self = calculationFormulaController;

      this.mainMenuCtl = CalculationFormulaMainMenuController;
      this.formulaFormCtl = CalculationFormulaFormController;
      this.formulaEditor = PFFormulaEditor;

      this.mainMenuCtl.init(this);
      this.formulaFormCtl.init(this);
    },

    initTemplates: function() {
      this.mainMenuTpl = this.getTemplate("mainMenuTpl");
      this.formulaFormTpl = this.getTemplate("formulaFormTpl");
      this.editFormulaPopupTpl = this.getTemplate("editFormulaPopupTpl");
    },

    getTemplate: function(template) {
      var tpl = $.ajax({
        //url: "/calculation_formula/tpl/" + template + ".html",
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
      var self = calculationFormulaController;

      if (this.onEvent === undefined)
        this.bindEventListener();

      onEvent("click", "a", function(e) {
        e.preventDefault();
      });

      this.mainMenuCtl.registerEvents(onEvent);
      this.formulaFormCtl.registerEvents(onEvent);
    },

    renderMainMenu: function(item) {
      var self = calculationFormulaController;

      this.$root.find(".pf-cal-main-menu-box").html(this.mainMenuTpl());
      this.mainMenuCtl.renderNavTree(function (navTree, navTreeStore) {
        self.navTree = navTree;
        self.navTreeStore = navTreeStore;

        if (item) {
          self.mainMenuCtl.traceTree(item);

          var node = navTree.findNode(item.formulaId);
          if (node)
            self.renderFormulaForm(node);
          else
            self.$root.find(".pf-cal-info").empty();
        }
      });
    },

    renderFormulaForm: function(item) {
      var self = calculationFormulaController;
      setTaskRibbonInput(item.projectId, item.projectName);

      this.$root.find(".pf-cal-info").html(self.formulaFormTpl(item));
      this.$root.find(".pf-cal-info-wrap").addClass("active");
      self.formulaFormCtl.renderFormulaForm(item);
    },

    initConditionMap: function(callBack) {
      var self = calculationFormulaController;

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
    getCalculationFormulaForList: function(callBack) {
      var requestParam = {
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

    createCalculationFormula: function(item, callBack) {
      var requestParam = {
          formulaId: item.formulaId,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          formulaName: item.formulaName,
          formulaContent: item.formulaContent,
          formulaTypeCode: item.formulaTypeCode,
          activeYn: item.activeYn,

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

      PFRequest.post("/calculator/createCalculationFormula.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CalculationFormulaService",
          operation: "createCalculationFormula"
        }
      });
    },

    saveCalculationFormula: function(item, callBack) {

    	if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

      var requestParam = {
          formulaId: item.formulaId,
          applyStartDate: item.applyStartDate,
          applyEndDate: item.applyEndDate,
          formulaName: item.formulaName,
          formulaContent: item.formulaContent,
          formulaTypeCode: item.formulaTypeCode,
          activeYn: item.activeYn,

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

      PFRequest.post('/calculator/saveCalculationFormula.json', requestParam, {
        success: function(responseData) {
          callBack(responseData)
          modifyFlag = false;
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationFormulaService",
          operation: "saveCalculationFormula"
        }
      });
    },

    deleteCalculationFormula: function(item, callBack) {
      var requestParam = {
          formulaId: item.formulaId,
          activeYn: item.activeYn,

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

      PFRequest.post("/calculator/deleteCalculationFormula.json", requestParam, {
        success: function(responseData){
          callBack(responseData);
        },
        bxmHeader: {
          application: "PF_Factory",
          service: "CalculationFormulaService",
          operation: "deleteCalculationFormula"
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
  self = calculationFormulaController;
  calculationFormulaController.run();
});

// EmergencyControl
function fnEmergencyControl(flag){
  var isActive = $("[data-form-param='activeYn']").val() === "Y";
  var isEmergency = flag;

  if (isActive && !isEmergency) {
    $(".delete-calculation-formula-btn").prop("disabled", true);
    $(".start-date").prop("disabled", true);
    $(".formula-content").prop("disabled", true);

  } else {
    $(".delete-calculation-formula-btn").prop("disabled", false);
    $(".start-date").prop("disabled", false);
    $(".formula-content").prop("disabled", false);
  }
}

