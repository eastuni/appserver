const composeElementPopupTpl = PFUtil.getTemplate("designer/calculation_unit_template", "composeElementPopupTpl");
const composeElementTemplateValuePopupTpl = PFUtil.getTemplate("designer/calculation_unit_template", "composeElementTemplateValuePopupTpl");

function selectComposeElement(self, callBack) {
  var grid, select_grid, $form;
  var popup = PFComponent.makePopup({
    title: bxMsg("selectComposeElement"),
    contents: composeElementPopupTpl(),
    width: 800,
    height: 330,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn select-compose-element-btn",
        handler : function() {
          if (callBack && typeof(callBack) === "function") {
            $.each(select_grid.getAllData(), function(index, item) {
              callBack(item);
            });
          }
          this.close();
        }
      },
      {
        text: bxMsg("ButtonBottomString16"),
        elCls: "button button-primary",
        handler : function(){
          this.close();
        }
      }
      ],
      listeners: {
        afterRenderUI: function() {
          $form = $(".select-compose-element-form-table");

          // 조건 그리드
          var checkboxmodel = Ext.create ("Ext.selection.CheckboxModel", {mode:"MULTI"});
          grid = PFComponent.makeExtJSGrid({
            fields: ["composeElementConditionCode", "valueComputationMethodDistinctionCode", "conditionDetailTypeCode",
              "applyStartDate", "applyEndDate", "referenceObjectName", "referenceAttributeName",
              "inputInfoAttributeName", "calculationClassName", "interestRateStructureCode", "activeYn",
              {
              name: "composeElementConditionName",
              convert: function(newValue, record) {
                return self.master.conditionMap[record.get("composeElementConditionCode")];
              }
              },
              {
                name: "referenceCalculationClassName",
                convert: function(newValue, record) {
                  return record.get("calculationClassName");
                }
              }],
              gridConfig: {
                selModel: checkboxmodel,
                renderTo: ".pf-cal-compose-element-search-grid",
                columns: [
                  {
                    text: bxMsg("cndCd"), width: 160, dataIndex: "composeElementConditionCode"
                  },
                  {
                    text: bxMsg("cndNm"), flex: 1, dataIndex: "composeElementConditionName"
                  }
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                      select_grid.addData(record.data);
                    }
                  }
              },
          });

          // select grid
          select_grid = PFComponent.makeExtJSGrid({
            fields: ["composeElementConditionCode", "composeElementConditionName",
              "valueComputationMethodDistinctionCode", "conditionDetailTypeCode",
              "applyStartDate", "applyEndDate", "referenceObjectName", "referenceAttributeName",
              "inputInfoAttributeName", "calculationClassName", "interestRateStructureCode", "activeYn",
              "referenceCalculationClassName" 
              ],
              gridConfig: {
                renderTo: ".pf-cal-compose-element-select-grid",
                columns: [
                  {
                    text: bxMsg("cndCd"), width: 160, dataIndex: "composeElementConditionCode"
                  },
                  {
                    text: bxMsg("cndNm"), flex: 1, dataIndex: "composeElementConditionName"
                  },
                  {
                    xtype: "actioncolumn", width: 35, align: "center",
                    items: [{
                      icon: "/images/x-delete-16.png",
                      handler: function (grid, rowIndex, colIndex, item, e, record) {
                        record.destroy();
                      }
                    }]
                  }
                  ]
              },
          });

          self.master.getCalculationComposeElementTemplateForList(function(responseData) {
            grid.setData(responseData);
          });
        }
      },
      contentsEvent: {
        "keyup .compose-element-name-input": function(e) {
          var name = $form.find("[data-form-param='cndNm']").val();

          if (name) {
            grid.store.filterBy(function(record) {
              var keyword = record.get("composeElementConditionName") + " " + record.get("composeElementConditionCode");
              return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
            });

          } else {
            grid.store.clearFilter();
          }
        },

        "click .select-btn": function(e) {
          select_grid.addData(grid.getSelectedItem());
        }
      }
  });
}

function editComposeElementTemplateValue(self, record) {
  var item = record.data;

  var checkMandatoryInput = function(item) {
    var error = false;
    var checkList = ["applyStartDate", "applyEndDate", "valueComputationMethodDistinctionCode"];

    switch (item.valueComputationMethodDistinctionCode) {
    case "02":
      checkList.push("referenceCalculationClassName");
      break;

    case "03":
      //checkList.push("referenceConditionCode");
      break;

    case "04":
      //checkList.push("referenceConditionCode");
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
      PFComponent.showMessage(bxMsg("mandatoryInputIsEmpty")
          + "<br> <" + errorList.join(", ") + ">", "error");
    }

    return errorList.length === 0;
  };

  var checkApplyDate = function(item) {
    var error = false;
    var start = new Date(item.applyStartDate);
    var end = new Date(item.applyEndDate);
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

  var $form;
  var popup = PFComponent.makePopup({
    title: bxMsg("composeElementTemplateValue"),
    contents: composeElementTemplateValuePopupTpl(item),
    width: 600,
    height: 300,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn edit-compose-element-template-value-btn",
        handler : function() {
          var item = PFUtil.makeParamFromForm($form);

          if (!checkMandatoryInput(item)) return false;
          if (!checkApplyDate(item)) return false;

          self.updateTemplateValue(record, item);
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
        afterRenderUI: function() {
          $form = $(".compose-element-template-value-form-table");

          // render combobox
          self.renderComboBox("valCmptnMthdDscd", $form.find("[data-form-param='valueComputationMethodDistinctionCode']"),
              item.valueComputationMethodDistinctionCode, true);
          self.renderComboBox("TemplateActiveYnCode", $form.find("[data-form-param='activeYn']"),
              item.activeYn, true);

          // datepicker
          self.master.getDatePicker(false, $(".compose-element-template-value-form-table"));
          $form.find("[data-form-param='applyStartDate']").val(self.toPFDate(item.applyStartDate));
          $form.find("[data-form-param='applyEndDate']").val(self.toPFDate(item.applyEndDate));

          // selective input
          $form.find("[data-form-param='valueComputationMethodDistinctionCode']").trigger("change");

          if (item.activeYn === "Y") {
            var projectId = getSelectedProjectId();

            if (!isEmergency(projectId) && !isUpdateStatus(projectId)) {
              $form.find(".start-date").prop("disabled", true);
              $form.find(".value-computation-method-distinction-code").prop("disabled", true);
              $form.find(".val-method-selective-input input").prop("disabled", true);
            }

          } else if (item.process !== "C") {
            $form.find(".value-computation-method-distinction-code").prop("disabled", true);
          }

        }
      },
      contentsEvent: {
        "change .value-computation-method-distinction-code": function(e) {
          var dscd = $form.find("[data-form-param='valueComputationMethodDistinctionCode']").val();
          $form.find(".val-method-selective-input").hide();
          $form.find(".val-method-" + dscd).show();

          if (dscd === "06") {
            self.renderComboBox("referenceObjectCode", 
                $form.find("[data-form-param='referenceObjectName']"),
                item.referenceObjectName, true);
            $form.find("[data-form-param='referenceObjectName']").prop("disabled", false);
            $form.find("[data-form-param='referenceObjectName']").trigger("change");

          } else if (dscd === "07") {
            self.renderComboBox(null, $form.find("[data-form-param='referenceObjectName']"),
                "ARR_XTN_ATRBT", true, {"ARR_XTN_ATRBT": "계약확장속성 Object"});
            $form.find("[data-form-param='referenceObjectName']").prop("disabled", true);

            self.renderComboBox("referenceAttribute", 
                $form.find("[data-form-param='referenceAttributeName']"),
                item.referenceAttributeName, true);
          }

        },

        "click .reference-condition-code": function(e) {
          PFPopup.selectConditionTemplate({}, function (cnd) {
            $form.find("[data-form-param='referenceConditionCode']").val(cnd.code);
            $form.find(".reference-condition-name").text(cnd.name);
          });
        },

        "change .reference-object-name": function(e) {
          var obj = $("[data-form-param='referenceObjectName']").val();
          var code = codeMapObj["referenceAttributeDistinctionCode"][obj];

          if (code) {
            self.renderComboBox(code, 
                $form.find("[data-form-param='referenceAttributeName']"),
                item.referenceAttributeName, true);
          } else {
            $form.find("[data-form-param='referenceAttributeName']").empty();
          }
        },

        "click .bx-form-item": function(e) {
          $(e.target).removeClass("has-error");
        }
      }
  });
}
    
