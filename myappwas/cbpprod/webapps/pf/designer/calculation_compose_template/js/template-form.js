/**
 * @author Choi Junhyeok
 * @version $$id: template-form.js, v 0.1 2017-06-16 $$
 */

const CalculationComposeTemplateFormController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationComposeTemplateFormController;

      binder("click", ".save-calculation-compose-template-btn", function(e) {
        self.saveTemplate();
      });

      binder("click", ".delete-calculation-compose-template-btn", function(e) {
        self.deleteTemplate();
      });

      binder("click", ".add-calculation-compose-detail-btn", function(e) {
        self.addComposeDetail();
      });

      binder("click", ".reference-condition-code", function(e) {
        PFPopup.selectConditionTemplate({}, function (cnd) {
          $(e.target).val(cnd.code);
          $(".reference-condition-name").text(cnd.name);
          modifyFlag = true;
        });
      });

      binder("change", ".reference-object-name", function(e) {
        var obj = $(".reference-object-name").val();
        var code = codeMapObj["referenceAttributeDistinctionCode"][obj];
        var node = self.master.navTreeStore.findNode($(".compose-element-condition-code").val());

        if (code) {
          self.renderComboBox(code,
              $(".reference-attribute-name"),
              node.referenceAttributeName, true);
        } else {
          $(".reference-attribute-name").empty();
        }
      });

      binder("click", ".bx-form-item", function(e) {
        $(e.target).removeClass("has-error");
      });

    },

    renderTemplateForm: function(item) {
      var self = CalculationComposeTemplateFormController;
      var $form = this.$root.find(".calculation-compose-element-template-form");

      // render combobox
      this.renderComboBox("valCmptnMthdDscd",
          $form.find("[data-form-param='valueComputationMethodDistinctionCode']"),
          item.valueComputationMethodDistinctionCode, true);
      $form.find(".val-method-selective-input").hide();
      $form.find(".val-method-" + item.valueComputationMethodDistinctionCode).show();

      this.renderComboBox("TemplateActiveYnCode",
          $form.find("[data-form-param='activeYn']"),
          item.activeYn, true);

      if (item.valueComputationMethodDistinctionCode === "06") {
        this.renderComboBox("referenceObjectCode",
            $form.find("[data-form-param='referenceObjectName']"),
            item.referenceObjectName, true);
        $form.find("[data-form-param='referenceObjectName']").prop("disabled", false);
        $form.find("[data-form-param='referenceObjectName']").trigger("change");

      } else if (item.valueComputationMethodDistinctionCode === "07") {
        this.renderComboBox(null, $form.find("[data-form-param='referenceObjectName']"),
            "ARR_XTN_ATRBT", true, {"ARR_XTN_ATRBT": "계약확장속성 Object"});
        $form.find("[data-form-param='referenceObjectName']").prop("disabled", true);

        this.renderComboBox("referenceAttribute",
            $form.find("[data-form-param='referenceAttributeName']"),
            item.referenceAttributeName, true);
      }

      // datepicker
      this.master.getDatePicker(false, $form);
      $form.find("[data-form-param='applyStartDate']").val(this.master.toPFDate(item.applyStartDate));
      $form.find("[data-form-param='applyEndDate']").val(this.master.toPFDate(item.applyEndDate));

      // render grid
      this.renderGrid(item.composeElementList);

      if (item.activeYn === "Y") {
        var projectId = getSelectedProjectId();

        if (!isEmergency(projectId) && !isUpdateStatus(projectId)) {
          this.$root.find(".delete-calculation-compose-template-btn").prop("disabled", true);
          this.$root.find(".start-date").prop("disabled", true);
          this.$root.find(".val-method-selective-input select").prop("disabled", true);
        }
      }

      this.deletedItems = [];
      $form.find(".reference-condition-name").text(
          this.master.conditionMap[item.referenceConditionCode]);

      self.beforeItem = item;
      modifyFlag = false;
    },

    saveTemplate: function() {
      var self = CalculationComposeTemplateFormController;
      var $form = self.$root.find(".calculation-compose-element-template-form");
      if (!self.master.checkProject()) return;

      var checkMandatoryInput = function(item) {
        var checkList = ["applyStartDate", "applyEndDate", "valueComputationMethodDistinctionCode"];

        switch (item.valueComputationMethodDistinctionCode) {
        case "02":
          checkList.push("calculationClassName");
          break;

        case "03":
          //checkList.push("referenceConditionCode");
          break;

        case "04":
          //checkList.push("referenceConditionCode");
          //checkList.push("inputInformationAttributeName");
          break;

        case "05":
          checkList.push("interestRateStructureCode");
          break;

        case "06":
          checkList.push("referenceObjectName");
          checkList.push("referenceAttributeName");
          break;

        case "07":
          checkList.push("referenceAttributeName");
          break;
        }

        var errorList = [];
        $.each(checkList, function(index, param) {
          var attr = $form.find("[data-form-param='" + param + "']");
          if (!attr.val()) {
            attr.addClass("has-error");
            errorList.push(bxMsg(param));
          }
        });

        if (errorList.length > 0) {
          PFComponent.showMessage(`${bxMsg("mandatoryInputIsEmpty")} <br> <${errorList.join(", ")}>`, "error");
        }

        return errorList.length === 0;
      };

      var checkApplyDate = function(item) {
        var error = false;
        var start = new Date(self.master.toPFDate(item.applyStartDate)); start.setHours(0, 0, 0, 0);
        var end = new Date(self.master.toPFDate(item.applyEndDate)); end.setHours(0, 0, 0, 0);
        var today = new Date(); today.setHours(0, 0, 0, 0);

        if ((item.activeYn === "N" || isEmergency(getSelectedProjectId()))
            && start < today) {
          PFComponent.showMessage(bxMsg("startDateBeforeToday"), "error");
          $form.find("[data-form-param='applyStartDate']").addClass("has-error");
          error = true;
        }

        if (start > end) {
          PFComponent.showMessage(bxMsg("endDateBeforeStartDate"), "error");
          $form.find("[data-form-param='applyStartDate']").addClass("has-error");
          $form.find("[data-form-param='applyEndDate']").addClass("has-error");
          error = true;
        }

        return !error;
      };

      var item = PFUtil.makeParamFromForm($form);
      item.applyStartDate = self.master.toCalDate(item.applyStartDate);
      item.applyEndDate = self.master.toCalDate(item.applyEndDate);

      if (!checkMandatoryInput(item)) return false;
      if (!checkApplyDate(item)) return false;

      // modified compose detail data
      self.composeDetailGrid.store.each(function(record, index) {
        if (record.dirty && record.get("process") !== "C") {
          record.set("process", "U");
        }
      });
      item.composeElementList = self.composeDetailGrid.getAllData().filter(function(v) {
        return v.process;
      }).concat(self.deletedItems);

      var save = function(item) {
        self.master.saveCalculationComposeElementTemplate(item, function(responseData) {
          PFComponent.showMessage(bxMsg("workSuccess"), "success");
          self.deletedItems = [];
          self.master.renderMainMenu(responseData);
        });
      }

      if (item.activeYn === "Y"
        && item.applyStartDate === self.beforeItem.applyStartDate
        && !isEmergency(getSelectedProjectId())) {
        PFComponent.showConfirm(bxMsg("onlyApplyEndDateWillBeUpdatedForEffectiveItem"), function() {
          save(item);
        });
      } else {
        save(item);
      }
    },

    deleteTemplate: function() {
      var self = CalculationComposeTemplateFormController;
      var $form = self.$root.find(".calculation-compose-element-template-form");
      if (!self.master.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);

      PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
        self.master.deleteCalculationComposeElementTemplate(item, function(responseData) {
          PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
          self.master.renderMainMenu(item);
        });
      });
    },

    addComposeDetail: function() {
      var self = CalculationComposeTemplateFormController;

      PFPopup.selectConditionTemplate({}, function (cnd) {
    	let duplicateCnt = 0;
    	// OHS20180306 구성조건코드 중복체크
	    if(self.composeDetailGrid
	    		&& self.composeDetailGrid.getAllData()
	    		&& self.composeDetailGrid.getAllData().length > 0) {
	    	self.composeDetailGrid.getAllData().forEach(function(el) {
	    		if(el.composeConditionCode == cnd.code) {
	    			var msg = bxMsg("CannotAddExistingItem") + ' [ ' + cnd.code + ' ]'
	    			PFComponent.showMessage(msg, "warning");
	    			duplicateCnt++;
	    		};
	        });
	    }
	    if(duplicateCnt == 0) {
	        self.composeDetailGrid.addData({
	            composeElementConditionCode: self.$root.find("[data-form-param='composeElementConditionCode']").val(),
	            composeConditionCode: cnd.code,
	            composeConditionName: cnd.name,
	            applyStartDate: self.master.toCalDate(PFUtil.getToday()),
	            applyEndDate: "99991231",
	            process: "C"
	        });
	        modifyFlag = true;
	    }
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

    renderGrid: function(list) {
      var self = CalculationComposeTemplateFormController;
      list = list || [];

      var selectedCellIndex;
      var composeDetailGrid = PFComponent.makeExtJSGrid({
        fields: ["composeElementConditionCode", "composeConditionCode", "applyStartDate", "applyEndDate",
                  {
                    name: "composeConditionName",
                    convert: function(newValue, record) {
                      return self.master.conditionMap[record.get("composeConditionCode")];
                    }
                  }, "process"],
        gridConfig: {
          renderTo: ".pf-cal-info .pf-cal-calculation-compose-template-detail-grid",
          columns: [
            {
              text: bxMsg("composeConditionCode"), flex: 1, dataIndex: "composeConditionCode",
              listeners: {
                click: function(_this, td, cellIndex, rowIndex, e, record)  {
                  if (record.get("process") === "C") {
                    PFPopup.selectConditionTemplate({}, function (cnd) {
                      record.set("composeConditionCode", cnd.code);
                      record.set("composeConditionName", cnd.name);
                      modifyFlag = true;
                    });
                  }
                }
              }
            },
            {
              text: bxMsg("cndNm"), flex: 1, dataIndex: "composeConditionName",
            },
            {
              text: bxMsg("aplyStartDt"), flex: 1, dataIndex: "applyStartDate",
              renderer: function(value, p, record) {
                return self.master.toPFDate(value);
              },
              editor: {
                allowBlank: true,
                listeners: {
                  focus: function(_this) {
                    var isNextDay = true;
                    if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                      isNextDay = false;
                    }
                    PFUtil.getGridDatePicker(_this, "applyStartDate", composeDetailGrid, selectedCellIndex, isNextDay, true);
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
              text: bxMsg("aplyEndDt"), flex: 1, dataIndex: "applyEndDate",
              renderer: function(value, p, record) {
                return self.master.toPFDate(value);
              },
              editor: {
                allowBlank: false,
                listeners: {
                  focus: function(_this) {
                    var isNextDay = true;
                    if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                      isNextDay = false;
                    }
                    PFUtil.getGridDatePicker(_this, "applyEndDate", composeDetailGrid, selectedCellIndex, isNextDay, true);
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
              xtype: "actioncolumn", width: 35, align: "center",
              items: [{
                icon: "/images/x-delete-16.png",
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                  if (record.get("process") !== "C") {
                    record.set("process", "D");
                    self.deletedItems.push(record.data);
                  }
                  record.destroy();
                  modifyFlag = true; // OHS20180726 - 행삭제시에도 수졍여부를 true로 처리한다.
                }
              }]
            }
          ],
          plugins: [
            Ext.create("Ext.grid.plugin.CellEditing", {
              clicksToEdit: 1,
              listeners: {
                beforeedit: function(e, editor) {
                  var projectId = getSelectedProjectId();
                  var isActive = $("[data-form-param='activeYn']").val() === "Y";

                  if (isActive && !isEmergency(projectId) && !isUpdateStatus(projectId)
                      && editor.record.get("process") !== "C") {
                    return false;
                  }
                },
                afteredit: function(e, editor) {
                  switch (editor.field) {
                  case "applyStartDate":
                  case "applyEndDate":
                    editor.record.set(editor.field, self.master.toCalDate(editor.value));
                    break;
                  }
                }
              }
            })
          ]
        }
      });

      composeDetailGrid.setData(list);
      self.composeDetailGrid = composeDetailGrid;
    },
}
