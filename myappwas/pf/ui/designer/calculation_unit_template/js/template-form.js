/**
 * @author Choi Junhyeok
 * @version $$id: template-form.js, v 0.1 2017-06-16 $$
 */

const CalculationUnitTemplateFormController = {

    init: function(master) {
      this.$root = master.$root;
      this.master = master;
    },

    registerEvents: function(binder) {
      var self = CalculationUnitTemplateFormController;

      binder("click", ".calculation-rule-existence-yn", function(e) {
        if (this.checked) {
          self.$root.find(".grid-area").show();
          if (!self.gridRendered) {
            var id = self.$root.find("[data-form-param='calculationUnitConditionCode']").val();
            var item = self.master.navTreeStore.findNode(id);

            self.renderCalculationFormulaGrid(item.formulaList);
            self.renderComposeElementTemplateValueGrid(item.templateValueList);
            self.gridRendered = true;
          }
        } else {
          self.$root.find(".grid-area").hide();
        }
      });

      binder("click", ".save-calculation-unit-template-btn", function(e) {
        self.saveTemplate();
      });

      binder("click", ".delete-calculation-unit-template-btn", function(e) {
        self.deleteTemplate();
      });

      binder("click", ".add-calculation-formula-btn", function(e) {
        selectFormula(self, function (formula) {
          formula.applyStartDate = self.master.toCalDate(PFUtil.getToday());
          formula.process = "C";
          self.calculationFormulaGrid.addData(formula);
          modifyFlag = true;
        });
      });

      binder("click", ".add-calculation-compose-template-value-btn", function(e) {
        selectComposeElement(self, function (item) {
          item.calculationUnitConditionCode = self.$root.find("[data-form-param='calculationUnitConditionCode']").val();
          item.applyStartDate = self.master.toCalDate(PFUtil.getToday());
          item.activeYn = "N";
          item.process = "C";
          self.composeElementTemplateValueGrid.addData(item);
          modifyFlag = true;
        });
      });
    },

    renderTemplateForm: function(item) {
      var $form = this.$root.find(".calculation-unit-template-form-table");
      this.gridRendered = false;

      // render combobox
      this.renderComboBox("CalcnUnitDscd",
          $form.find("[data-form-param='calculationUnitDistinctionCode']"),
          item.calculationUnitDistinctionCode, true);
      this.renderComboBox("TemplateActiveYnCode",
          $form.find("[data-form-param='activeYn']"),
          item.activeYn, true);
      this.renderComboBox("ProductAmountTypeCode",
          $form.find("[data-form-param='amountTypeCode']"),
          item.amountTypeCode, true);

      // render grid
      if (item.calculationRuleExistenceYn === "Y")
        $form.find("[data-form-param='calculationRuleExistenceYn']").click();
      else
        this.$root.find(".grid-area").hide();

      if (item.activeYn === "Y") {
        var projectId = getSelectedProjectId();

        if (!isEmergency(projectId)) {
          $(".delete-btn").prop("disabled", true);
          $form.find(".calculation-unit-template-form-table .start-date").prop("disabled", true);
          $form.find(".amount-type-code").prop("disabled", true);
          $form.find(".calculation-rule-existence-yn").prop("disabled", true);
        }
      }

      this.deletedFormulas = [];
      this.deletedTemplateValues = [];
    },

    saveTemplate: function() {
      var self = CalculationUnitTemplateFormController;
      var $form = self.$root.find(".calculation-unit-template-form-table");
      if (!self.master.checkProject()) return;

      var formulaList;
      var templateValueList;
      var calculationRuleExistenceYn = $form.find("[data-form-param='calculationRuleExistenceYn']").is(":checked") ? "Y" : "N";
      if (calculationRuleExistenceYn === "Y") {
        // modified formula relation data
        self.calculationFormulaGrid.store.each(function(record, index) {
          if (record.dirty && record.get("process") !== "C") {
            record.set("process", "U");
          }
        });
        formulaList = self.calculationFormulaGrid.getAllData().filter(function(v) {
          return v.process;
        }).concat(self.deletedFormulas);

        // modified template value data
        self.composeElementTemplateValueGrid.store.each(function(record, index) {
          if (record.dirty && record.get("process") !== "C") {
            record.set("process", "U");
          }
        });
        templateValueList = self.composeElementTemplateValueGrid.getAllData().filter(function(v) {
          return v.process;
        }).concat(self.deletedTemplateValues);
      }

      var item = $.extend(PFUtil.makeParamFromForm($form), {
        calculationRuleExistenceYn: calculationRuleExistenceYn,
        formulaList: formulaList,
        templateValueList: templateValueList
      });

      self.master.saveCalculationUnitTemplate(item, function(responseData) {
        PFComponent.showMessage(bxMsg("workSuccess"), "success");
        self.deletedFormulas = [];
        self.deletedTemplateValues = [];
        self.master.renderMainMenu(responseData);
      });
    },

    deleteTemplate: function() {
      var self = CalculationUnitTemplateFormController;
      var $form = self.$root.find(".calculation-unit-template-form-table");
      if (!self.master.checkProject()) return;

      var item = PFUtil.makeParamFromForm($form);

      PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
        self.master.deleteCalculationUnitTemplate(item, function(responseData) {
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

    renderCalculationFormulaGrid: function(list) {
      var self = CalculationUnitTemplateFormController;
      list = list || [];

      var selectedCellIndex;
      var calculationFormulaGrid = PFComponent.makeExtJSGrid({
        fields: ["formulaId", "applyStartDate", "applyEndDate",
          "formulaName", "formulaContent", "formulaTypeCode",
          "activeYn", "process"],
        gridConfig: {
          renderTo: ".pf-cal-info .pf-cal-calculation-formula-grid",
          columns: [
            {
              text: bxMsg("formulaId"), width: 50, dataIndex: "formulaId", align: "center"
            },
            {
              text: bxMsg("distinction"), width: 50, dataIndex: "formulaTypeCode", align: "center",
              renderer: function (value) {
                return codeMapObj["formulaTypeCode"][value];
              }
            },
            {
              text: bxMsg("formulaName"), width: 160, dataIndex: "formulaName", align: "center"
            },
            {
              text: bxMsg("formulaContent"), flex: 1, dataIndex: "formulaContent"
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
                    PFUtil.getGridDatePicker(_this, "applyStartDate", calculationFormulaGrid, selectedCellIndex, isNextDay, true);
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
                    PFUtil.getGridDatePicker(_this, "applyEndDate", calculationFormulaGrid, selectedCellIndex, isNextDay, true);
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
                    self.deletedFormulas.push(record.data);
                  }
                  record.destroy();
                  modifyFlag = true;
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
                    modifyFlag = true;
                    break;
                  }
                }
              }
            })
          ]
        }
      });

      calculationFormulaGrid.setData(list);
      self.calculationFormulaGrid = calculationFormulaGrid;
    },

    renderComposeElementTemplateValueGrid: function(list) {
      var self = CalculationUnitTemplateFormController;
      list = list || [];

      var selectedCellIndex;
      var composeElementTemplateValueGrid = PFComponent.makeExtJSGrid({
        fields: ["calculationUnitConditionCode", "composeElementConditionCode",
          "valueComputationMethodDistinctionCode","templateSequenceNumber",
          "applyStartDate", "applyEndDate", "referenceConditionCode", "referenceObjectName",
          "referenceAttributeName", "interestRateStructureCode", "referenceCalculationClassName",
          "activeYn",
                  {
                    name: "composeElementConditionName",
                    convert: function(newValue, record) {
                      return self.master.conditionMap[record.get("composeElementConditionCode")];
                    }
                  },
                  {
                    name: "referenceConditionName",
                    convert: function(newValue, record) {
                      return self.master.conditionMap[record.get("referenceConditionCode")];
                    }
                  }, "process"],
        gridConfig: {
          renderTo: ".pf-cal-info .pf-cal-calculation-compose-template-value-grid",
          columns: [
            {
              text: bxMsg("seqNbr"), width: 80,
              dataIndex: "templateSequenceNumber", align: "center"
            },
            {
              text: bxMsg("cndCd"), width: 80,
              dataIndex: "composeElementConditionCode", align: "center"
            },
            {
              text: bxMsg("cndNm"), width: 160,
              dataIndex: "composeElementConditionName", align: "center"
            },
            {
              text: bxMsg("valueComputationMethod"), width: 80,
              dataIndex: "valueComputationMethodDistinctionCode", align: "center",
              renderer: function (value) {
                return codeMapObj["valCmptnMthdDscd"][value];
              }
            },
            {
              text: bxMsg("aplyStartDt"), flex: 1, dataIndex: "applyStartDate", align: "center",
              renderer: function(value, p, record) {
                return self.toPFDate(value);
              }
            },
            {
              text: bxMsg("aplyEndDt"), flex: 1, dataIndex: "applyEndDate", align: "center",
              renderer: function(value, p, record) {
                return self.toPFDate(value);
              }
            },
            {
              xtype: "actioncolumn", width: 35, align: "center",
              items: [{
                icon: "/images/edit-icon30.png",
                handler: function (_this, rowIndex, colIndex, item, e, record) {
                  editComposeElementTemplateValue(self, record);
                }
              }]
            },
            {
              xtype: "actioncolumn", width: 35, align: "center",
              items: [{
                icon: "/images/x-delete-16.png",
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                  if (record.get("process") !== "C") {
                    record.set("process", "D");
                    self.deletedTemplateValues.push(record.data);
                  }
                  record.destroy();
                  modifyFlag = true;
                }
              }]
            }
          ],
        }
      });

      composeElementTemplateValueGrid.setData(list);
      self.composeElementTemplateValueGrid = composeElementTemplateValueGrid;
    },

    selectCondition: function(callBack) {
      var self = CalculationUnitTemplateFormController;

      // Combobox data
      var listDetailType = {};
      var rangeDetailType = {};
      var typeArray = codeArrayObj["ProductConditionDetailTypeCode"];
      for (var i in typeArray) {
        var each = typeArray[i];
        if (each.code <= 5) // 01 ~ 05 - 법위형
          rangeDetailType[each.code] = each.name;
        else // 06 ~ 07 - 목록형
          listDetailType[each.code] = each.name;
      }

      // filter function
      var typeCheck = function(record, type) {
        if (type)
          return record.get("type") === type;
        return true;
      };

      var detailTypeCheck = function(record, detailType) {
        if (detailType)
          return record.get("conditionDetailTypeCode") === detailType;
        return true;
      };

      var nameCheck = function(record, name) {
        if (name) {
          var keyword = record.get("name") + " " + record.get("code");
          return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
        }
        return true;
      };

      var grid, $form;
      var popup = PFComponent.makePopup({
        title: bxMsg("selectCondition"),
        contents: self.master.conditionPopupTpl(),
        width: 400,
        height: 400,
        useCurrentTaskIdConfirmYn: true,
        buttons: [
          {
            text: bxMsg("Z_OK"),
            elCls: "button button-primary write-btn select-condition-btn",
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
              $form = $(".select-condition-form-table");

              // 조건 유형
              self.renderComboBox("ProductConditionTypeCode", $form.find("[data-form-param='type']"), null, true);

              // 조건 그리드
              grid = PFComponent.makeExtJSGrid({
                fields: ["code", "name", "type", "conditionDetailTypeCode" ],
                gridConfig: {
                  renderTo: ".pf-cal-condition-search-grid",
                  columns: [
                    {text: bxMsg("cndCd"), width: 160, dataIndex: "code"},
                    {text: bxMsg("cndNm"), flex: 1, dataIndex: "name"}
                    ],
                    listeners: {
                      scope: this,
                      "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        $(".select-condition-btn").click();
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
            "keyup .condition-name-input": function(e) {
              var type = $form.find("[data-form-param='type']").val();
              var detailType = $form.find("[data-form-param='detailType']").val();
              var name = $form.find("[data-form-param='cndNm']").val();

              grid.store.filterBy(function(record) {
                return typeCheck(record, type) && detailTypeCheck(record, detailType)
                && nameCheck(record, name);
              });
            },

            "change .condition-type-input": function(e) {
              var type = $form.find("[data-form-param='type']").val();

              switch (type) {
              case "01": // 목록
                self.renderComboBox(null, $form.find("[data-form-param='detailType']"), null, true, listDetailType);
                break;
              case "02": // 범위
                self.renderComboBox(null, $form.find("[data-form-param='detailType']"), null, true, rangeDetailType);
                break;
              case "03": // 금리
                self.renderComboBox("ProductConditionInterestDetailTypeCode", $form.find("[data-form-param='detailType']"), null, true);
                break;
              case "04": // 수수료
                self.renderComboBox("ProductConditionFeeDetailTypeCode", $form.find("[data-form-param='detailType']"), null, true);
                break;
              default:
                $form.find("[data-form-param='detailType']").empty();
              }

              // 초기화
              $(".condition-name-input").trigger("keyup");
            },

            "change .condition-detail-type-input": function(e) {
              // 초기화
              $(".condition-name-input").trigger("keyup");
            }
          }
      });
    },

    selectFeeCondition: function(callBack) {
      var self = CalculationUnitTemplateFormController;

      var grid, $form;
      var popup = PFComponent.makePopup({
        title: bxMsg("selectCondition"),
        contents: self.master.feeConditionPopupTpl(),
        width: 400,
        height: 330,
        useCurrentTaskIdConfirmYn: true,
        buttons: [
          {
            text: bxMsg("Z_OK"),
            elCls: "button button-primary write-btn select-condition-btn",
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
            $form = $('.select-condition-form-table');

            // 조건 유형
            self.renderComboBox("ProductConditionTypeCode", $form.find("[data-form-param='type']"), null, true);

            // 조건 그리드
            grid = PFComponent.makeExtJSGrid({
              fields: ["code", "name", "type", "conditionDetailTypeCode" ],
              gridConfig: {
                renderTo: ".pf-cal-condition-search-grid",
                columns: [
                  {text: bxMsg("cndCd"), width: 160, dataIndex: "code"},
                  {text: bxMsg("cndNm"), flex: 1, dataIndex: "name"}
                  ],
                  listeners: {
                    scope: this,
                    "celldblclick": function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                      $(".select-condition-btn").click();
                    }
                  }
              },
            });

            var item = {
                conditionTypeCode: "04" // 수수료
            }

            self.master.queryConditionTemplateBaseForList(item, function(responseData) {
                grid.setData(responseData);
            });
          }
        },
        contentsEvent: {
          "keyup .condition-name-input": function(e) {
            var name = $form.find("[data-form-param='cndNm']").val();

            if (name) {
              grid.store.filterBy(function(record) {
                var keyword = record.get("name") + " " + record.get("code");
                return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
              });

            } else {
              grid.store.clearFilter();

            }
          }
        }
      });
    },

    updateTemplateValue: function(target, item) {
      var self = CalculationUnitTemplateFormController;

      var keys = Object.keys(item);
      for (var i in keys) {
        var key = keys[i];
        target.set(key, item[key]);
      }
      target.set("applyStartDate", self.toCalDate(item.applyStartDate))
      target.set("applyEndDate", self.toCalDate(item.applyEndDate))
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
    }

}