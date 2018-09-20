const composeConditionSettingPopupTpl = PFUtil.getTemplate("configurator/calculator", "composeConditionSettingPopupTpl");
const rangeConditionPopupTpl = PFUtil.getTemplate("configurator/calculator", "rangeConditionPopupTpl");

/** complex condition */
function selectComposeCondition(callBack) {
  var self = calculationUnitManager;

  var item = null;

  var $container, conditionGrid, composeConditionSettingGrid;
  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("columnSetting"),
    contents: composeConditionSettingPopupTpl(item),
    elCls: popupId,
    width: 900,
    height: 330,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn set-column-btn",
        handler : function() {
          callBack(composeConditionSettingGrid.getAllData());
          this.close();
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
          $container = $("." + popupId);
          // 조건 그리드
          conditionGrid = PFComponent.makeExtJSGrid({
            fields: ["code", "name", "type", "conditionDetailTypeCode"],
            gridConfig: {
              renderTo: $container.find(".condition-grid"),
              columns: [
                {text: bxMsg("cndCd"), width: 70, dataIndex: "code", align: "center"},
                {text: bxMsg("cndNm"), flex: 1, dataIndex: "name", align: "center"}
                ],
                listeners: {
                  scope: this,
                  "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    $container.find(".condition-select-btn").click();
                  }
                }
            }
          });

          self.queryConditionTemplateBaseForList({conditionTypeCode: "A"}, function(responseData) {
            conditionGrid.setData(responseData);
          });

          var measureComboData = codeArrayObj["ProductMeasurementUnitCode"];
          var measureComboMap = codeMapObj["ProductMeasurementUnitCode"];
          var rangeComboData = codeArrayObj["RangeBlwUnderTypeCode"];
          var rangeComboMap = codeMapObj["RangeBlwUnderTypeCode"];
          var currencyComboData = codeArrayObj["CurrencyCode"];
          var currencyComboMap = codeMapObj["CurrencyCode"];

          // 구성조건 그리드
          composeConditionSettingGrid = PFComponent.makeExtJSGrid({
            fields: ["conditionCode", "conditionName", "conditionTypeCode", "conditionDetailTypeCode",
              {
              name: "conditionName",
              convert: function(newValue, record) {
                return self.conditionMap[record.get("conditionCode")];
              }
              },
              {
                name: "measurementUnitCode",
                convert: function(newValue, record) {
                  var cnd = self.conditionDetailMap[record.get("conditionCode")];

                  if (!newValue && cnd.type === "02") { // 범위형
                    switch (cnd.conditionDetailTypeCode) {
                    case "02": // 날짜
                    case "03": // 주기
                      return "01";
                    case "04": // 숫자
                      return "09";
                    case "05": // 율
                      return "11";
                    }
                  }

                  return newValue;
                }
              },
              {
                name: "currencyCode", 
                convert: function(newValue, record) {
                  var cnd = self.conditionDetailMap[record.get("conditionCode")];

                  if (!newValue && cnd.type === "02" && cnd.conditionDetailTypeCode === "01") {
                    return "KRW"
                  }

                  return newValue;
                }
              },
              {
                name: "belowUnderDistinctionCode",
                convert: function(newValue, record) {
                  var cnd = self.conditionDetailMap[record.get("conditionCode")];

                  if (!newValue && cnd.type === "02") {
                    return "01"
                  }

                  return newValue;
                }
              }
              ],
              gridConfig: {
                renderTo: $container.find(".compose-condition-setting-grid"),
                columns: [
                  {text: bxMsg("cndCd"), width: 60, dataIndex: "conditionCode", align: "center"},
                  {text: bxMsg("cndNm"), flex: 1, dataIndex: "conditionName", align: "center"},
                  {
                    text: bxMsg("measurementUnit"), width: 110, dataIndex: "measurementUnitCode", align: "center",
                    renderer: function(value, p, record) {
                      return measureComboMap[value];
                    },
                    editor: {
                      xtype: "combo",
                      typeAhead: true,
                      editable: false,
                      triggerAction: "all",
                      displayField: "name",
                      valueField: "code",
                      store: new Ext.data.Store({
                        fields: ["code", "name"],
                        data: measureComboData
                      })
                    }
                  },
                  {
                    text: bxMsg("currency"), width: 90, dataIndex: "currencyCode", align: "center",
                    renderer: function(value, p, record) {
                      return currencyComboMap[value];
                    },
                    editor: {
                      xtype: "combo",
                      typeAhead: true,
                      editable: false,
                      triggerAction: "all",
                      displayField: "name",
                      valueField: "code",
                      store: new Ext.data.Store({
                        fields: ["code", "name"],
                        data: currencyComboData
                      })
                    }
                  },
                  {
                    text: bxMsg("belowUnderDistinctionCode"), width: 110, dataIndex: "belowUnderDistinctionCode", align: "center",
                    renderer: function(value, p, record) {

                      return rangeComboMap[value];
                    },
                    editor: {
                      xtype: "combo",
                      typeAhead: true,
                      editable: false,
                      triggerAction: "all",
                      displayField: "name",
                      valueField: "code",
                      store: new Ext.data.Store({
                        fields: ["code", "name"],
                        data: rangeComboData
                      })
                    }
                  },
                  {
                    xtype: "actioncolumn", width: 30, align: "center",
                    items: [{
                      icon: "/images/x-delete-16.png",
                      handler: function (grid, rowIndex, colIndex, item, e, record) {
                        record.destroy();
                      }
                    }]
                  }
                  ],
                  plugins: [
                    Ext.create("Ext.grid.plugin.CellEditing", {
                      clicksToEdit: 1,
                      listeners: {
                        beforeedit: function(e, editor){
                          var cnd = self.conditionDetailMap[editor.record.get("conditionCode")];

                          if (cnd.type !== "02") return false;
                          else {
                            if (cnd.conditionDetailTypeCode === "01") {
                              if (editor.field === "measurementUnitCode")
                                return false;

                            } else {
                              if (editor.field === "currencyCode")
                                return false;
                            }
                          }
                        }
                      }
                    })
                    ]
              },
          });

          var $form = $(".calculation-rule-condition-form-table");
          var item = {
              calculationRuleId: $form.find("[data-form-param='calculationRuleId']").val(),
              conditionCode: $form.find("[data-form-param='conditionCode']").val(),
              applyStartDate: $form.find("[data-form-param='applyStartDate']").val()
          };

          self.getCalculationRuleCondition(item, function(responseData) {
            if (responseData) {
              composeConditionSettingGrid.setData(responseData.complexComposeList || []);
            }
          });
        }
      },
      contentsEvent: {
        "input .condition-name": function(e) {
          var name = $container.find("[data-form-param='conditionName']").val();
          conditionGrid.store.filterBy(function(record) {
            var keyword = record.get("code") + " " + record.get("name");
            return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
          });
        },

        "click .condition-select-btn": function(e) {
          var items = conditionGrid.getSelectedItem() || [];
          var store = composeConditionSettingGrid.store;
          for (var i in items) { // item length: 1
            var cnd = items[i];

            if (store.count() >= 9) {
              PFComponent.showMessage("9개까지 가능", "warning");

            } else if (store.find("conditionCode", items[i].code) >= 0) {
              PFComponent.showMessage("이미 존재:" + items[i].code , "warning");

            } else {
              // translate
              cnd.conditionCode = cnd.code;
              cnd.conditionName = cnd.name;
              cnd.conditionTypeCode = cnd.type;
              store.add(cnd)
            }
          }

        },

        "click .reset-btn": function(e) {
          composeConditionSettingGrid.resetData();
        }
      }
  });
}
    
function selectRangeCondition(condition, readOnly, callBack) {
  var self = calculationUnitManager;

  var isNotNegativeRangeType = function(rangeTypeCode) {
    return rangeTypeCode === "02" || rangeTypeCode === "03";
  }

  var $container, grid;
  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("inputRangeCondition"),
    contents: rangeConditionPopupTpl(),
    elCls: popupId,
    width: 240,
    height: 140,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn set-column-btn",
        handler : function() {
          var rangeCondition = PFUtil.makeParamFromForm($container.find(".range-condition-form"));
          callBack(rangeCondition);
          this.close();
        }
      },
      {
        text: bxMsg("ButtonBottomString16"),
        elCls: "button button-primary",
        handler : function () {
          this.close()
        }
      }
      ],
      listeners: {
        afterSyncUI: function() {
          $container = $("." + popupId);
          var $form = $container.find(".range-condition-form");
          var rangeTypeCode = condition.rangeTypeCode;
          var $measurementUnit = $form.find("[data-form-param='measurementUnitCode']");

          $container.find(".range-type-selective-input").hide();

          if (rangeTypeCode === "01") { // 금액
            $container.find(".range-type-" + rangeTypeCode).show();

            self.renderComboBox("CurrencyCode",
                $form.find("[data-form-param='currencyCode']"),
                condition.currencyCode, true);

          } else {
            $container.find(".range-type-" + rangeTypeCode).show();

            if (rangeTypeCode === "02") { // 날짜
              self.renderComboBox("ProductMeasurementUnitCodeD",
                  $measurementUnit, condition.measurementUnitCode, true);

            } else if (rangeTypeCode === "03") { // 숫자
              self.renderComboBox("ProductMeasurementUnitCodeF",
                  $measurementUnit, condition.measurementUnitCode, true);

            } else if (rangeTypeCode === "04") { // 주기
              self.renderComboBox("ProductMeasurementUnitCodeN",
                  $measurementUnit, condition.measurementUnitCode, true);

            } else if (rangeTypeCode === "05") { // /율
              self.renderComboBox("ProductMeasurementUnitCodeR",
                  $measurementUnit, condition.measurementUnitCode, true);
            } 
          }

          $basicValue = $form.find("[data-form-param='basicValue']");
          var checkFloat = PFValidation.floatCheckForRangeType($basicValue);

          if (isNotNegativeRangeType(rangeTypeCode)) {
            checkFloat($basicValue, 19, 0);
          } else {
            checkFloat($basicValue, 19, 2);
          }
          $basicValue.val(condition.basicValue);
          $basicValue.trigger("focusout");

          if (readOnly) {
            $basicValue.prop("disabled", true);
            $measurementUnit.prop("disabled", true);
            $form.find("[data-form-param='currencyCode']").prop("disabled", true);
          }

        }
      }
  });
}
    