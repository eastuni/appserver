const calculationDetermineConditionPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationDetermineConditionPopupTpl");
const calculationDetermineConditionHistoryPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationDetermineConditionHistoryPopupTpl");

/*******************************
 * 판단조건 팝업
 *******************************/
function renderDetermineConditionPopup(data) {
  determineRuleModifyFlag = false;
  var self = calculationUnitManager;
  var $form;
  var projectId = getSelectedProjectId();

  var checkDscd = function() {
    var dscd = $form.find("[data-form-param='valueComputationMethodDistinctionCode']").val();
    return dscd ? dscd : PFComponent.showMessage(bxMsg("setValueComputationMethod"), "warning");
  };

  PFComponent.makePopup({
    title: bxMsg("determineConditionMangement"),
    width: 600,
    height: 490,
    contents: calculationDetermineConditionPopupTpl(data),
    modifyFlag : 'popup',
    buttons: [
      {
        text: bxMsg("registration"), elCls: "button button-primary write-btn determine-condition-reg-btn",
        handler: function() {
          if (!self.checkProject()) return;
          if (!checkDscd()) return;
          saveCalProvideCndPopup("C", () => this.close());
        }
      },
      {
        text: bxMsg("modify"), elCls: "button button-primary write-btn determine-condition-mod-btn",
        handler: function() {
          if (!self.checkProject()) return;
          if (!checkDscd()) return;
          if(!determineRuleModifyFlag){
            // 변경된 정보가 없습니다.
            PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
            return;
          }

          var temp = PFComponent.makeYGForm($form).getData();

          if (temp.conditionStatusCode === "04") {
            PFComponent.showConfirm(bxMsg("UpdateAplyEndDateWarning"), function() {
              saveCalProvideCndPopup("U");
            });
          } else if (temp.conditionStatusCode === "01") {
            saveCalProvideCndPopup("U");
          }

        }
      },
      {
        text: bxMsg("ButtonBottomString2"), elCls: "button button-primary write-btn determine-condition-delete-btn",
        handler: function() {
          if (!self.checkProject()) return;
          saveCalProvideCndPopup("D", () => this.close);
        }
      },
      {
        text: bxMsg("ButtonBottomString17"), elCls: "button button-primary write-btn",
        handler: function() {
            this.close();
            popupModifyFlag = false;
            determineRuleModifyFlag = false;
        }
      }
      ],
      contentsEvent: {
        "click .determine-condition-history-btn": function() {
          var formData = PFComponent.makeYGForm($form).getData();
          renderCalculationDetermineConditionHistoryPopup(formData);
        },

        /*"change .value-computation-method-distinction-code": function(e) {
          console.log(e);
          var dscd = $(e.target).val();
          $form.find(".val-method-selective-input").hide();
          $form.find(".val-method-" + dscd).show();

          if (dscd === "02") { // 클래스

          } else if (dscd === "04") { // 입력정보
            $form.find(".reference-condition-name").text(self.conditionMap[data.referenceConditionCode]);
            if (data.judgementConditionSequenceNumber) {
              self.getCalculationDetermineCondition(data, function(responseData) {
                renderCalculationDetermineConditionDetail(self, responseData, $form, function(listConditionGrid) {
                  self.provListCndCodeGrid = listConditionGrid;
                });
              });
            } else {
              renderCalculationDetermineConditionDetail(self, data, $form, function(listConditionGrid) {
                self.provListCndCodeGrid = listConditionGrid;
              });
            }

          } else if (dscd === "06") { // 객체정보
            self.renderComboBox("referenceObjectCode",
                $form.find("[data-form-param='referenceObjectName']"),
                data.referenceObjectName, true);
            $form.find("[data-form-param='referenceObjectName']").trigger("change");
          }
        },*/

        "click .reference-condition-code": function(e) {
          PFPopup.selectConditionTemplate({}, function (cnd) {
            $(e.target).val(cnd.code);
            $form.find(".reference-condition-name").text(self.conditionMap[cnd.code]);
          });
        },

        /*"change .reference-object-name": function(e) {
          var obj = $(e.target).val();
          var code = codeMapObj["referenceAttributeDistinctionCode"][obj];
          if (code) {
            self.renderComboBox(code,
                $form.find("[data-form-param='referenceAttributeName']"),
                data.referenceAttributeName, true);
          } else {
            $form.find("[data-form-param='referenceAttributeName']").empty();
          }
        },*/
      },
      listeners: {
        afterSyncUI: function() {
          $form = $(".pf-cal-determine-condition-popup-tpl");
          var isNewData = !data.judgementConditionSequenceNumber;

          if (isNewData) {
            $form.find(".determine-condition-history-btn").hide();
          }

          self.getDatePicker(true, $form);
          $form.find(".start-date").val(self.toPFDate(data.applyStartDate));
          $form.find(".end-date").val(self.toPFDate(data.applyEndDate));
          $form.find(".determine-condition-status-name").val(codeMapObj["ProductStatusCode"][data.conditionStatusCode]);

          var dscd = data.valueComputationMethodDistinctionCode;
          self.renderComboBox("DtrmnCndValCmptnDscd",
              $form.find("[data-form-param='valueComputationMethodDistinctionCode']"),
              dscd, true);
          
          // 값산출방법 변경시 이벤트
          $form.find("[data-form-param='valueComputationMethodDistinctionCode']").on('change', (e) => {
            var dscd = $(e.target).val();
            $form.find(".val-method-selective-input").hide();
            $form.find(".val-method-" + dscd).show();

            if (dscd === "02") { // 클래스

            } else if (dscd === "04") { // 입력정보
              $form.find(".reference-condition-name").text(self.conditionMap[data.referenceConditionCode]);
              if (data.judgementConditionSequenceNumber) {
                self.getCalculationDetermineCondition(data, function(responseData) {
                  renderCalculationDetermineConditionDetail(self, responseData, $form, function(listConditionGrid) {
                    self.provListCndCodeGrid = listConditionGrid;
                  });
                });
              } else {
                renderCalculationDetermineConditionDetail(self, data, $form, function(listConditionGrid) {
                  self.provListCndCodeGrid = listConditionGrid;
                });
              }

            } else if (dscd === "06") { // 객체정보
              self.renderComboBox("referenceObjectCode",
                  $form.find("[data-form-param='referenceObjectName']"),
                  data.referenceObjectName, true);
              $form.find("[data-form-param='referenceObjectName']").trigger("change");
            }
          }).trigger('change');

          $form.find('.reference-object-name').on('change', (e) => {
            var obj = $(e.target).val();
            var code = codeMapObj["referenceAttributeDistinctionCode"][obj];
            if (code) {
              self.renderComboBox(code,
                  $form.find("[data-form-param='referenceAttributeName']"),
                  data.referenceAttributeName, true);
            } else {
              $form.find("[data-form-param='referenceAttributeName']").empty();
            }
          });

          if (writeYn !== "Y") {
            $(".write-btn").hide();

          } else {
            //수정가능
            if ($form.find(".determine-condition-status").val() === "01") {
              if (isNewData) {
                $(".determine-condition-reg-btn").prop("disabled", false);
                $(".determine-condition-delete-btn").prop("disabled", true);
                $(".determine-condition-mod-btn").prop("disabled", true);

              } else {
                $(".determine-condition-reg-btn").prop("disabled", true);
              }
            }

            //판매중
            else if ($form.find(".determine-condition-status").val() === "04") {
              //emergency
              if (getSelectedProjectId() && isEmergency(getSelectedProjectId())) {
                $(".determine-condition-reg-btn").prop("disabled", false);
                $(".determine-condition-mod-btn").prop("disabled", false);
                $(".determine-condition-delete-btn").prop("disabled", false);

              } else {
                $(".determine-condition-reg-btn").prop("disabled", false);
                $(".determine-condition-mod-btn").prop("disabled", false);
                $(".determine-condition-delete-btn").prop("disabled", true);
              }
            }
          }

          // modify listener
          $(".pf-cal-determine-condition-popup-tpl").off('change').on('change', 'input, select, textarea', (e) => {
            determineRuleModifyFlag = true;
          });
        }
      }
  });
}

function saveCalProvideCndPopup(process, callback = function() {}) {
  var self = calculationUnitManager;
  var $masterform = self.$root.find(".pf-cal-unit-form");
  var calculationUnitId = $masterform.find("[data-form-param='calculationUnitId']").val();
  var node = self.navTreeStore.findNode(calculationUnitId);

  var provCnd = [];
  var formData = PFComponent.makeYGForm($(".pf-cal-determine-condition-popup-tpl")).getData();



  var item = {
      judgementConditionSequenceNumber: formData.judgementConditionSequenceNumber,
      applyStartDate: self.toCalDate(formData.applyStartDate),
      applyEndDate: self.toCalDate(formData.applyEndDate),
      transactionId: node.transactionId,
      calculationUnitId: calculationUnitId,
      conditionCode: formData.conditionCode,
      conditionName: self.conditionMap[formData.conditionCode],
      conditionTypeCode: formData.conditionTypeCode,
      conditionStatusCode: formData.conditionStatusCode,
      valueComputationMethodDistinctionCode: formData.valueComputationMethodDistinctionCode
  };

  var dscd = item.valueComputationMethodDistinctionCode;
  if (dscd === "02") {
    item.className = formData.className;

  } else if (dscd === "04") {
    item.referenceConditionCode = formData.referenceConditionCode;
    if (formData.conditionTypeCode === "01") {
      item.calculationDetermineListConditionDetailList = self.provListCndCodeGrid.getSelectedItem();
      item.calculationDetermineListConditionDetailList.forEach(function(el) {
        el.listCode = el.key;
      });
    }

    else if (formData.conditionTypeCode === "02") {
      item.minValue = formData.minValue.replace(/,/g, "");
      item.maxValue = formData.maxValue.replace(/,/g, "");
      item.measureUnitCode = formData.measureUnitCode;
      item.currencyCode = formData.currencyCode;
    }

  } else if (dscd === "06") {
    item.referenceObjectName = formData.referenceObjectName;
    item.referenceAttributeName = formData.referenceAttributeName;

  }

  var request;

  if (process === "C") {
    request = self.createCalculationDetermineCondition;
    delete formData.conditionStatusCode;
  } else if (process === "U") {
    request = self.updateCalculationDetermineCondition;
  } else if (process === "D") {
    request = self.deleteCalculationDetermineCondition;
  }

  request(item, function(responseData) {
    if (responseData) {

      // 등록인경우
      if (formData.process === "C") {
        $(".pf-cal-determine-condition-popup-tpl .judgementConditionSequenceNumber").val(responseData.judgementConditionSequenceNumber);  // 일련번호 바인딩
        $(".determine-condition-reg-btn").prop("disabled", true);          // 등록버튼 비활성
        $(".determine-condition-delete-btn").prop("disabled", false);       // 삭제버튼 활성
        $(".determine-condition-mod-btn").prop("disabled", false);          // 수정버튼 활성
      }

      $(".determine-condition-status-name").val(codeMapObj["ProductStatusCode"][responseData.conditionStatusCode]);

      PFComponent.showMessage(bxMsg("workSuccess"),  "success");
      deleteConditionList = [];
      popupModifyFlag = false;
      determineRuleModifyFlag = false;

      // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
      var req = {
          calculationUnitId: item.calculationUnitId,
          transactionId: item.transactionId,
      };
      self.getCalculationDetermineConditionForList(req, function(responseData) {
        calculationUnitManager.determineConditionGrid.setData(responseData);
        self.applyRuleMap = responseData.reduce(function(map, v) {
          map[v.judgementConditionSequenceNumber] = self.conditionMap[v.conditionCode];
          return map;
        }, {});
        callback();
      });
    }
  });
}


function renderCalculationDetermineConditionDetail(self, data, $form, callBack, readOnly) {
  self.getConditionTemplate({conditionCode: data.conditionCode}, function(responseData) {
    if (data.conditionTypeCode === "01") { // 목록형
      $form.find(".determine-condition-type1-wrap").show();
      $form.find(".determine-condition-type2-wrap").hide();

      if (responseData.values && data.calculationDetermineListConditionDetailList) {
        var codeMap = {};
        var codeMap = data.calculationDetermineListConditionDetailList.reduce(function(map, v) {
          map[v.listCode] = v;
          return map;
        }, {});
        responseData.values.forEach(function(v) {
          if (codeMap[v.key]) {
            v.isSelected = true;
          }
        });
      }
      var grid = renderProvListCndCodeGrid(responseData.values, $form.find(".determine-condition-list-code-grid"), readOnly);
      if (callBack && typeof(callBack) === "function")
        callBack(grid);

    } else if (data.conditionTypeCode === "02") { //범위형
      $form.find(".determine-condition-type1-wrap").hide();
      $form.find(".determine-condition-type2-wrap").show();

      var checkFloat = PFValidation.floatCheckForRangeType(".determine-condition-type2-wrap");
      checkFloat(".range-input", 19, 2);
      $form.find(".range-input").trigger("focusout");

      var detailTypeCode = responseData.currentCatalogId;
      //금액
      if (detailTypeCode === "01") {
        $form.find(".determine-condition-currency-code").show();
        $form.find(".determine-condition-measure-code").hide();
        renderComboBox("CurrencyCode", $form.find(".determine-condition-currency-code-combo"));
        $(".determine-condition-currency-code-combo").val(data.currencyCode);

      } else {
        $form.find(".determine-condition-currency-code").hide();
        $form.find(".determine-condition-measure-code").show();

        var detailTypeMap = {
            "02": "ProductMeasurementUnitCodeD",
            "03": "ProductMeasurementUnitCodeF",
            "04": "ProductMeasurementUnitCodeN",
            "05": "ProductMeasurementUnitCodeR",
        };
        renderComboBox(detailTypeMap[detailTypeCode], $form.find(".determine-condition-measurement-unit-code-combo"));
        setRangeFormat($form.find(".determine-condition-tpl"), data.conditionDetailTypeCode);
        $form.find(".determine-condition-measurement-unit-code-combo").val(data.measureUnitCode);

      }

      if (readOnly) $form.find("input, select, textarea").prop("disabled", true);
    }
  });
}

function setRangeFormat($selector, conditionDetailTypeCode) {
  if (conditionDetailTypeCode === "01") {      //  금액
    $selector.find(".minValue").removeClass("float-range-10");
    $selector.find(".maxValue").removeClass("float-range-10");
    $selector.find(".defalueValue").removeClass("float-range-10");
    $selector.find(".increaseValue").removeClass("float-range-10");

    $selector.find(".minValue").removeClass("float-range-0");
    $selector.find(".maxValue").removeClass("float-range-0");
    $selector.find(".defalueValue").removeClass("float-range-0");
    $selector.find(".increaseValue").removeClass("float-range-0");

    $selector.find(".minValue").addClass("float-range-21");
    $selector.find(".maxValue").addClass("float-range-21");
    $selector.find(".defalueValue").addClass("float-range-21");
    $selector.find(".increaseValue").addClass("float-range-21");
  }
  else if(conditionDetailTypeCode == "05" || conditionDetailTypeCode == "08"){    // 율일때
    $selector.find(".minValue").removeClass("float-range-21");
    $selector.find(".maxValue").removeClass("float-range-21");
    $selector.find(".defalueValue").removeClass("float-range-21");
    $selector.find(".increaseValue").removeClass("float-range-21");

    $selector.find(".minValue").removeClass("float-range-0");
    $selector.find(".maxValue").removeClass("float-range-0");
    $selector.find(".defalueValue").removeClass("float-range-0");
    $selector.find(".increaseValue").removeClass("float-range-0");

    $selector.find(".minValue").addClass("float-range-10");
    $selector.find(".maxValue").addClass("float-range-10");
    $selector.find(".defalueValue").addClass("float-range-10");
    $selector.find(".increaseValue").addClass("float-range-10");

  }else{
    $selector.find(".minValue").removeClass("float-range-21");
    $selector.find(".maxValue").removeClass("float-range-21");
    $selector.find(".defalueValue").removeClass("float-range-21");
    $selector.find(".increaseValue").removeClass("float-range-21");

    $selector.find(".minValue").removeClass("float-range-10");
    $selector.find(".maxValue").removeClass("float-range-10");
    $selector.find(".defalueValue").removeClass("float-range-10");
    $selector.find(".increaseValue").removeClass("float-range-10");

    $selector.find(".minValue").addClass("float-range-0");
    $selector.find(".maxValue").addClass("float-range-0");
    $selector.find(".defalueValue").addClass("float-range-0");
    $selector.find(".increaseValue").addClass("float-range-0");

  }
}


/**
 * 판단조건 팝업 제공조건값 그리드(목록조건)
 */
function renderProvListCndCodeGrid(data, renderTo, readOnly) {
  $(renderTo).empty();

  var checkboxmodel = Ext.create ("Ext.selection.CheckboxModel", {
    mode:"MULTI",
    checkOnly: true,
    renderer: function(value, p) {
      if (readOnly) {
        $(renderTo).find(".x-column-header-checkbox").addClass("checkbox-disabled");
        p.tdCls += "checkbox-disabled";
      }
      return "<div class='x-grid-row-checker'>&nbsp;</div>";
    }
  });

  var grid = PFComponent.makeExtJSGrid({
    fields: ["key","value", "isSelected"],
    gridConfig: {
      selModel: checkboxmodel,
      renderTo: renderTo,
      columns: [
        {text: bxMsg("DPS0121_21String1"), flex: 0.5, dataIndex: "key", align:"center",
        },
        {text: bxMsg("DPS0121_21String2"), flex: 1, dataIndex: "value", align:"center"}
        ],
        plugins: [
          Ext.create("Ext.grid.plugin.CellEditing", {
            clicksToEdit: 1
          })
          ],
          listeners:{
            scope: this,
            "viewready" : function(_this, eOpts){
              if(data){
                $.each(_this.getStore().data.items, function(index, condition){
                  $.each(data, function(idx, thisRowCondition){
                    if(condition.data.key == thisRowCondition.key && thisRowCondition.isSelected){
                      checkboxmodel.select(index, true);
                    }
                  });
                })
              }
            },
            'cellclick' : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts){
            	if (cellIndex == 0) {
            		popupModifyFlag = true;
            		determineRuleModifyFlag = true;
            	}
            }
          }
    }
  });

  if(data) {
    grid.setData(data);
  }
  return grid;
}

function renderCalculationDetermineConditionHistoryPopup(item) {
  var self = calculationUnitManager;

  var $container, grid;
  var renderHistory = function(record) {
    var renderTo = $container.find(".calculation-determine-condition-detail-container");
    var $form = renderTo;

    var dscd = record.get("valueComputationMethodDistinctionCode");
    $container.find(".val-method-selective-input").hide();
    $container.find(".val-method-" + dscd).show();

    if (dscd === "02") {
      var className = record.get("className");
      $form.find("[data-form-param='className']").val(className);

    } else if (dscd === "04") {
      var cndCd = record.get("referenceConditionCode");
      var cndNm = self.conditionMap[cndCd] || cndCd;
      $form.find("[data-form-param='referenceConditionCode']").val(cndCd);
      $form.find(".reference-condition-name").text(cndNm);
      renderCalculationDetermineConditionDetail(self, record.data, renderTo, null, true);

    } else if (dscd === "06") {
      var referenceObjectName = record.get("referenceObjectName");
      self.renderComboBox("referenceObjectCode",
          $form.find("[data-form-param='referenceObjectName']"),
          referenceObjectName, true);

      var code = codeMapObj["referenceAttributeDistinctionCode"][referenceObjectName];

      if (code) {
        self.renderComboBox(code,
            $form.find("[data-form-param='referenceAttributeName']"),
            record.get("referenceAttributeName"), true);
      } else {
        $form.find("[data-form-param='referenceAttributeName']").empty();
      }
    }

    $form.find("input, select").prop("disabled", true);
  }

  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationDetermineConditionHistory"),
    contents: calculationDetermineConditionHistoryPopupTpl(),
    elCls: popupId,
    width: 800,
    height: 480,
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

          grid = PFComponent.makeExtJSGrid({
            fields: ["applyEndDate", "applyStartDate", "judgementConditionSequenceNumber",
              "calculationDetermineListConditionDetailList", "calculationRuleId", "calculationUnitId",
              "conditionCode", "conditionStatusCode", "conditionTypeCode", "currencyCode", "measureUnitCode",
              "pdInfoDscd", "process", "calculationDetermineListConditionDetailList", "maxValue", "minValue",
              "valueComputationMethodDistinctionCode", "className", "referenceConditionCode", "referenceAttributeName", "referenceObjectName",
              {
              name: "conditionName",
              convert: function(value) {
                return self.conditionMap[value] || value;
              }
              }
            ],
            gridConfig: {
              renderTo: $container.find(".calculation-determine-condition-history-grid"),
              columns: [
                {text: bxMsg("seqNbr"), width: 60, dataIndex: "judgementConditionSequenceNumber", align: "center"},
                {text: bxMsg("cndCd"), width: 60, dataIndex: "conditionCode", align: "center"},
                {text: bxMsg("cndNm"), flex: 1, dataIndex: "conditionName"},
                {text: bxMsg("valueComputationMethod"), width: 80, dataIndex: "valueComputationMethodDistinctionCode",
                  renderer: function(value) {
                    return codeMapObj.valCmptnMthdDscd[value];
                  }
                },
                {text: bxMsg("applyStartDate"), width: 90, dataIndex: "applyStartDate", align: "center",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  }
                },
                {text: bxMsg("applyEndDate"), width: 90, dataIndex: "applyEndDate", align: "center",
                  renderer: function(value) {
                    return self.toPFDate(value);
                  }
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

          self.getCalculationDetermineConditionForList({judgementConditionSequenceNumber: item.judgementConditionSequenceNumber}, function(responseData) {
            grid.setData(responseData);
          });
        }
      }
  });

  return popupId;
}
