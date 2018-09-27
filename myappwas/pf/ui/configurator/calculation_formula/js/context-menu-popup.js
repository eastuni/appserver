const createFormulaPopupTpl = PFUtil.getTemplate("configurator/calculation_formula", "createFormulaPopupTpl");

function renderCalculationFormulaCreatePopup(self) {
  var popup = PFComponent.makePopup({
    title: bxMsg("createNewCalculationFormula"),
    contents: createFormulaPopupTpl(),
    width: 300,
    height: 140,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn create-formula-btn enter-save-btn",
        handler : function() {
          var $form = $(".create-formula-popup-form-table");

          var item = $.extend(PFUtil.makeParamFromForm($form), {
            applyStartDate: self.master.toCalDate(PFUtil.getToday()),
            applyEndDate: "99991231",
            formulaTypeCode: self.selectedItem.id,
            activeYn: "N"
          });

          var _this = this;
          self.master.createCalculationFormula(item, function(responseData) {
            PFComponent.showMessage(bxMsg("workSuccess"), "success");
            self.master.renderMainMenu(responseData);
            modifyFlag = false;
            _this.close();
          });
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
      contentsEvent: {
        "click .formula-content": function(e) {
          var $formula = $("[data-form-param='formulaContent']");
          self.master.formulaFormCtl.editFormula({formulaContent: $formula.val()}, function(formulaContent){
            $formula.val(formulaContent);
          })
        }
      },
      listeners: {
      	afterSyncUI: function() {
      		$('.create-formula-popup .formula-name').focus();
      	}
      }
  });
}