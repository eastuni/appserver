const formulaPopupTpl = PFUtil.getTemplate("designer/calculation_unit_template", "formulaPopupTpl");

function selectFormula(self, callBack) {
  var grid, $form;
  var popup = PFComponent.makePopup({
    title: bxMsg("selectFormula"),
    contents: formulaPopupTpl(),
    width: 600,
    height: 330,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn select-formula-btn",
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
        afterRenderUI: function() {
          $form = $(".select-formula-form-table");

          // 산식 유형
          PFUtil.renderComboBox("formulaTypeCode", $form.find("[data-form-param='type']"), null, true);

          // 조건 그리드
          grid = PFComponent.makeExtJSGrid({
            fields: ["formulaId", "applyStartDate", "applyEndDate",
              "formulaName", "formulaContent", "formulaTypeCode", "activeYn" ],
              gridConfig: {
                renderTo: ".pf-cal-formula-search-grid",
                columns: [
                  {
                    text: bxMsg("formulaId"), width: 50, dataIndex: "formulaId", align: "center"
                  },
                  {
                    text: bxMsg("formulaName"), width: 160, dataIndex: "formulaName"
                  },
                  {
                    text: bxMsg("formulaContent"), flex: 1, dataIndex: "formulaContent"
                  }
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                      $(".select-formula-btn").click();
                    }
                  }
              },
          });

          var item = {
              activeYn: "Y"
          };

          self.master.getCalculationFormulaForList(item, function(responseData) {
            grid.setData(responseData);
          });
        }
      },
      contentsEvent: {
        "change .formula-type-input": function(e) {
          var formulaTypeCode = $form.find("[data-form-param='type']").val();

          if (formulaTypeCode) {
            grid.store.filterBy(function(record) {
              return record.get("formulaTypeCode") === formulaTypeCode;
            });
          } else {
            grid.store.clearFilter();
          }
        },
      }
  });
}
