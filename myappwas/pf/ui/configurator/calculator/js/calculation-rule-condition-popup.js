const calculationRuleConditionHistoryPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationRuleConditionHistoryPopupTpl");

function renderCalculationRuleConditionHistoryPopup(item, query) {
  var self = calculationUnitManager;

  var $container, grid;
  var renderHistory = function(record) {
    var req = {
        calculationRuleId: record.get("calculationRuleId"),
        conditionCode: record.get("conditionCode"),
        applyStartDate: record.get("applyStartDate")
    };

    self.getCalculationRuleCondition(req, function(cnd) {
      $container.find(".condition-type-selective-input").hide();
      $container.find(".complex-selective-input").hide();

      // 복합조건
      if (cnd.complexConditionYn === "Y") {
        $container.find(".complex-selective-input").show();
        var renderTo = $container.find(".calculation-rule-complex-condition-grid");
        self.renderComplexGrid(cnd.conditionCode, renderTo, cnd.complexComposeList, cnd.detailList, true);


      } else {
        $container.find(".condition-type-" + cnd.conditionTypeCode).show();

        // 목록형
        if (cnd.conditionTypeCode === "01") {
          var renderTo = $container.find(".calculation-rule-list-condition-grid");
          var selectedItems = cnd.detailList ? cnd.detailList.map(function(v) {
            return v.listCode;
          }) : [];

          self.renderCalculationRuleListConditionGrid(cnd.conditionCode, selectedItems, renderTo, true);
        }

        // 범위형
        else if (cnd.conditionTypeCode === "02") {
          var detail = cnd.detailList.length ? cnd.detailList[0] : {};
          var renderTo = $container.find(".calculation-rule-range-condition-form-table");
          var rangeTypeCode = detail.rangeTypeCode || self.conditionDetailMap[cnd.conditionCode].conditionDetailTypeCode; 

          $container.find(".range-type-selective-input").hide();
          $container.find(".range-type-" + rangeTypeCode).show();

          self.renderCalculationRangeConditionDetail(cnd.conditionCode, detail, renderTo, true);

        }

      }

    });
  };

  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationRuleConditionHistory"),
    contents: calculationRuleConditionHistoryPopupTpl(),
    elCls: popupId,
    width: 800,
    height: 490,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary",
        handler : function() {
          this.close();
        }
      }
      ],
      listeners: {
        afterSyncUI: function() {
          $container = $("." + popupId);
          $container.find(".condition-type-selective-input").hide();
          $container.find(".complex-selective-input").hide();

          grid = PFComponent.makeExtJSGrid({
            fields: ["conditionCode", "conditionTypeCode", "applyStartDate", "applyEndDate",
              "calculationRuleId", "complexConditionYn",
              {
              name: "conditionName",
              convert: function(newValue, record) {
                return self.conditionMap[record.get("conditionCode")];
              }
              }
            ],
            gridConfig: {
              renderTo: $container.find(".calculation-rule-condition-history-grid"),
              columns: [
                {text: bxMsg("cndCd"), width: 60, dataIndex: "conditionCode", align: "center"},
                {text: bxMsg("cndNm"), flex: 1, dataIndex: "conditionName"},
                {text: bxMsg("conditionType"), width: 60, dataIndex: "conditionTypeCode", align: "center",
                  renderer: function(value, p, record) {
                    return codeMapObj.ProductConditionTypeCode[value];
                  }
                },
                {text: bxMsg("complexConditionYn"), width: 90, dataIndex: "complexConditionYn", align: "center"},
                {text: bxMsg("applyStartDate"), width: 90, dataIndex: "applyStartDate", align: "center",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  },
                },
                {text: bxMsg("applyEndDate"), width: 90, dataIndex: "applyEndDate", align: "center",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  },
                }
                ],
                listeners: {
                  scope: this,
                  "celldblclick": function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    renderHistory(record);
                  }
                }
            },
          });

          self.getCalculationRuleConditionList(item, function(responseData) {
            grid.setData(responseData);

            if (query) {
              var record = grid.store.findRecord("applyStartDate", query.applyStartDate);
              if (record) {
                var row = grid.store.indexOf(record);
                if (query.prev)
                  record = grid.store.getAt(++row);
                renderHistory(record);

                // grid가 이후에 loading되는 문제. callBack으로 조치
                self.waitFor(function() { // condition
                  return grid.grid;
                }, function() { // callback
                  grid.grid.getSelectionModel().select(row);
                });
              }
            }
          });
        }
      }
  });

  return popupId;
}
