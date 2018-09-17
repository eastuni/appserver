const calculationApplyRuleHistoryPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationApplyRuleHistoryPopupTpl");

function showCalculationApplyRuleHistory(self, applyRuleId) {
  var self = calculationUnitManager;

  var grid;
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationApplyRuleHistory"),
    contents: calculationApplyRuleHistoryPopupTpl(),
    width: 800,
    height: 330,
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
          grid = PFComponent.makeExtJSGrid({
            fields: ["applyRuleId", "ruleContent", "applyStartDate", "applyEndDate" ],
            gridConfig: {
              renderTo: ".calculation-apply-rule-history-grid",
              columns: [
                {text: bxMsg("applyRuleId"), width: 160, dataIndex: "applyRuleId"},
                {text: bxMsg("applyStartDate"), width: 100, dataIndex: "applyStartDate",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  },
                },
                {text: bxMsg("applyEndDate"), width: 100, dataIndex: "applyEndDate",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  },
                },
                {text: bxMsg("applyRule"), flex: 1, dataIndex: "ruleContent"}
                ]
            },
          });

          self.getCalculationApplyRuleHistory({applyRuleId: applyRuleId}, function(responseData) {
            grid.setData(responseData);
          });
        }
      }
  });
}
