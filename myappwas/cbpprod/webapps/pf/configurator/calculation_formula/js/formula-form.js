/**
 * @author Choi Junhyeok
 * @version $$id: formula-form.js, v 0.1 2017-06-16 $$
 */

const CalculationFormulaFormController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationFormulaFormController;

      binder("click", ".save-calculation-formula-btn", function(e) {
        self.saveFormula();
      });

      binder("click", ".delete-calculation-formula-btn", function(e) {
        self.deleteFormula();
      });
      
      binder("click", ".formula-content", function(e) {
        var $formula = $("[data-form-param='formulaContent']");
        var Editor = self.master.formulaEditor;
        PFPopup.editFormula({
          formulaContent: $formula.val(),
        }, function (formulaContent, conversionContent) {
          $formula.val(formulaContent);
          $(".conversion-formula").val(conversionContent);
        });
      });
    },

    renderFormulaForm: function(item) {
      var self = CalculationFormulaFormController;
      var $form = this.$root.find(".calculation-formula-form-table");
      var Editor = this.master.formulaEditor;

      // render combobox
      this.renderComboBox("formulaTypeCode", 
          $form.find("[data-form-param='formulaTypeCode']"),
          item.formulaTypeCode, true);
      this.renderComboBox("TemplateActiveYnCode", 
          $form.find("[data-form-param='activeYn']"),
          item.activeYn, true);
      
      // conversion formula
      $form.find(".conversion-formula").val(Editor.translate(item.formulaContent, this.master.conditionMap, " "));

      // datepicker
      this.master.getDatePicker(false, $form);
      $form.find("[data-form-param='applyStartDate']").val(this.master.toPFDate(item.applyStartDate));
      $form.find("[data-form-param='applyEndDate']").val(this.master.toPFDate(item.applyEndDate));

      if (item.activeYn === "Y") {
        var projectId = getSelectedProjectId();

        if (!isEmergency(projectId) && !isUpdateStatus(projectId)) {
          this.$root.find(".delete-calculation-formula-btn").prop("disabled", true);
          this.$root.find(".start-date").prop("disabled", true);
          this.$root.find(".formula-content").prop("disabled", true);
        }
      }
      
      self.beforeFormula = item;
    },
    
    saveFormula: function() {
      var self = CalculationFormulaFormController;
      var $form = self.$root.find(".calculation-formula-form-table");
      if (!self.master.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);
      item.applyStartDate = self.master.toCalDate(item.applyStartDate);
      item.applyEndDate = self.master.toCalDate(item.applyEndDate);

      var save = function(item) {
        self.master.saveCalculationFormula(item, function(responseData) {
          PFComponent.showMessage(bxMsg("workSuccess"), "success");
          self.master.renderMainMenu(responseData);
        });
      }

      if (item.activeYn === "Y"
        && item.applyStartDate === self.beforeFormula.applyStartDate
        && !isEmergency(getSelectedProjectId())) {
        PFComponent.showConfirm(bxMsg("onlyNameAndApplyEndDateWillBeUpdatedForEffectiveItem"), function() {
          save(item);
        });
      } else {
        save(item);
      }
    },
    
    deleteFormula: function() {
      var self = CalculationFormulaFormController;
      var $form = self.$root.find(".calculation-formula-form-table");
      if (!self.master.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);

      PFComponent.showConfirm(bxMsg("Z_Q_ProductDelete"), function() {
        self.master.deleteCalculationFormula(item, function(responseData) {
          PFComponent.showMessage(bxMsg("Z_DeleteSucced"), "success");
          self.master.renderMainMenu(item);
        });
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
    
    editFormula: function(item, callBack) {
      var self = CalculationFormulaFormController;

      // filter function
      var typeCheck = function(record, type) {
        if (type)
          return record.get("type") === type;
        return true;
      };

      var nameCheck = function(record, name) {
        if (name) {
          var keyword = record.get("name") + " " + record.get("code");
          return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
        }
        return true;
      };

      var grid, $form, $formula, tokens;
      var Editor = PFFormulaEditor;
      var popup = PFComponent.makePopup({
        title: bxMsg("formulaEdit"),
        contents: self.master.editFormulaPopupTpl(item),
        width: 510,
        height: 565,
        useCurrentTaskIdConfirmYn: true,
        buttons: [
          {
            text: bxMsg("Z_OK"),
            elCls: "button button-primary write-btn create-formula-btn",
            handler : function() {
              if (Editor.validate($formula.val())) {
                callBack($formula.val());
                this.close();
              } else {
                PFComponent.showMessage(bxMsg("invalidFormula"), "error");
              }
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
          afterRenderUI: function() {
              $form = $(".pf-cal-formula-editor-popup");
              $formula = $form.find("[data-form-param='formulaContent']");
              tokens = Editor.tokenize($formula.val());
              
              var conversionContent = Editor.translate($formula.val(), self.master.conditionMap, " ");
              $form.find("[data-form-param='conversionContent']").val(conversionContent);

              // 조건 유형
              self.renderComboBox("ProductConditionTypeCode", $form.find("[data-form-param='type']"), null, true);

              // 조건 그리드
              grid = PFComponent.makeExtJSGrid({
                fields: ["code", "name", "type", "conditionDetailTypeCode", "isActive",
                  {
                    name: "typeName",
                    convert: function(newValue, record) {
                      var typeName;
                      var detailType = record.get("conditionDetailTypeCode");

                      if (record.get("type") === "03") {
                        typeName = codeMapObj.ProductConditionInterestDetailTypeCode[detailType];

                      } else if (record.get("type") === "04") {
                        typeName = codeMapObj.ProductConditionFeeDetailTypeCode[detailType];

                      } else {
                        typeName = codeMapObj.ProductConditionDetailTypeCode[detailType];

                      }
                      return typeName;
                    }
                  },
                  {
                    name: "statusName",
                    convert: function(newValue, record) {
                      return codeMapObj["ProductConditionTypeCode"][record.get("type")];
                    }
                  }
                ],
                gridConfig: {
                  renderTo: ".formula-editor-grid",
                  columns: [
                    {text: bxMsg("cndCd"), width: 70, dataIndex: "code", align: "center"},
                    {text: bxMsg("cndNm"), flex: 1, dataIndex: "name", align: "center"},
                    {text: bxMsg("DTP0203String4"), width: 80, dataIndex: "typeName", align: "center"},
                    {text: bxMsg("status"), width: 50, dataIndex: "isActive", align: "center",
                      renderer: function(value, p, record) {
                        if (value === "Y")
                          return bxMsg("active");
                        return bxMsg("inactive");
                      }
                    }
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                      tokens.push({
                        type: TokenType.CONDITION,
                        value: "$" + record.get("code")
                      });

                      $formula.val(Editor.toContent(tokens, " "));
                    }
                  }
                },
              });

              self.master.queryConditionTemplateBaseForList({}, function(responseData) {
                grid.setData(responseData);
              });
            
          }
        },
        contentsEvent: {
          "keyup .cnd-name-search": function(e) {
            var type = $form.find("[data-form-param='type']").val();
            var name = $form.find("[data-form-param='name']").val();

            grid.store.filterBy(function(record) {
              return typeCheck(record, type) && nameCheck(record, name);
            })
          },

          "change .cnd-type-select": function(e) {
            $(".cnd-name-search").trigger("keyup");
          },

          "click .text-input-btn" : function(e) {
            var s = $(e.currentTarget).val();
            var type;
            
            if (s === "case" || s === "min" || s === "max") { // function
              type = TokenType.FUNCTION;

            } else if (s === "(") {
              type = TokenType.OPEN_BRACKET;

            } else if (s === ")") {
              type = TokenType.CLOSE_BRACKET;

            } else if (s === ",") {
              type = TokenType.COMMA;

            } else if (s === "+" || s === "-" || s === "*" || s === "/") {
              type = TokenType.ARITHMETIC;
            } else {
              type = TokenType.NUMBER;
            }

            tokens.push({
              type: type,
              value: s
            });

            $formula.val(Editor.toContent(tokens, " "));
              
          },

          "click .back-space-btn" : function(e) {
            tokens.pop();
            $formula.val(Editor.toContent(tokens, " "));
          },

          "click .formula-validation-btn": function(e) {

            if (Editor.validate($formula.val())) {

              var conversionContent = Editor.translate($formula.val(), self.master.conditionMap, " ");
              $form.find("[data-form-param='conversionContent']").val(conversionContent);

            } else {
              PFComponent.showMessage(bxMsg("invalidFormula"), "error");
            }

          }
        }
      });
    }
}