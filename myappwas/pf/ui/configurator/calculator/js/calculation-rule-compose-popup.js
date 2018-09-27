const calculationRuleComposeHistoryPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationRuleComposeHistoryPopupTpl");
const calculationRuleDetailPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationRuleDetailPopupTpl");
const composeConditionDetailTpl = PFUtil.getTemplate("configurator/calculator", "composeConditionDetailTpl");
const listConditionPopupTpl = PFUtil.getTemplate("configurator/calculator", "listConditionPopupTpl");
function renderCalculationRuleComposeHistoryPopup(item, query) {
  var self = calculationUnitManager;

  var $container, grid;
  var renderHistory = function(record) {
    var renderTo = $container.find(".calculation-rule-compose-detail-container");
    self.renderCalculationRuleCompose(record.data, renderTo, true);

    var $form = $container.find(".calculation-rule-compose-detail-form-table");
    var dscd = record.get("valueComputationMethodDistinctionCode");

    $form.find(".val-method-selective-input").hide();
    $form.find(".val-method-" + dscd).show();

    if (dscd === "01") {
      var conversionContent = PFFormulaEditor.translate(record.get("calculationRuleContent"), self.conditionMap, " ");
      $form.find(".conversion-content").val(conversionContent);

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

    } else if (dscd === "07") {
      self.renderComboBox(null, $form.find("[data-form-param='referenceObjectName']"),
          "ARR_XTN_ATRBT", true, {"ARR_XTN_ATRBT": "계약확장속성 Object"});

      self.renderComboBox("referenceAttribute",
          $form.find("[data-form-param='referenceAttributeName']"),
          record.get("referenceAttributeName"), true);
    }
  }

  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationRuleComposeHistory"),
    contents: calculationRuleComposeHistoryPopupTpl(),
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
            fields: ["calculationRuleComposeElementId", "composeElementConditionCode", "applyStartDate", "applyEndDate",
              "calculationRuleStatusCode", "calculationRuleId", "valueComputationMethodDistinctionCode",
              "interestRateStructureCode", "upComposeElementId", "upComposeElementRelationTypeDistinctionCode",
              "calculationLevelNumber", "calculationRuleContent", "referenceConditionCode", "referenceObjectName",
              "inputInformationAttributeName", "referenceAttributeName", "calculationClassName",
              {
              name: "text",
              convert: function(newValue, record) {
                return self.conditionMap[record.get("composeElementConditionCode")];
              }
              }
            ],
            gridConfig: {
              renderTo: $container.find(".calculation-rule-compose-history-grid"),
              columns: [
                {text: bxMsg("id"), width: 130, dataIndex: "calculationRuleComposeElementId", align: "center"},
                {text: bxMsg("cndCd"), width: 60, dataIndex: "composeElementConditionCode", align: "center"},
                {text: bxMsg("cndNm"), flex: 1, dataIndex: "text"},
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

          self.getCalculationRuleComposeForList(item, function(responseData) {
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

function editCalculationRuleCompose(rule, callBack) {
	composeModifyFlag = false;
	cndModifyFlag = false;
  var self = calculationUnitManager;
  var readOnly = rule.baseDate ? true : false;

  var store;
  var root;
  var applyStartDate;

  var $form;
  var Editor = PFFormulaEditor;
  var renderTo = ".calculation-rule-compose-detail";
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationRuleDetail"),
    contents: calculationRuleDetailPopupTpl(rule),
    width: 1000,
    height: 635,
    useCurrentTaskIdConfirmYn: true,
    modifyFlag : 'readonly',	// 별도의 flag 사용
    buttons: [
      {
        text: bxMsg("ButtonBottomString17"),
        elCls: "button button-primary",
        handler : function(){
        	composeModifyFlag = false;
        	cndModifyFlag = false;
            this.close()
        }
      }
      ],
      listeners: {
        afterSyncUI: function() {
          getRuleComposeStore(rule, function(_store) {
            store = _store;
            rule.store = _store;
            renderCalculationRuleEditTab(rule, function() { // 탭 추가
              var conversionContent = Editor.translate(rule.calculationRuleContent, self.conditionMap, " ");
              $(".calculation-rule-detail-container .calculation-rule-conversion-content").text(conversionContent);

              root = store.get("root");
              var param = {
                  list: root.children,
              };

              var firstNode = (root.children && root.children.length > 0) ? root.children[0] : {};

              // render
              $(".calculation-rule-compose-container").prepend(self.calculationRuleComposeListTpl(param));
              $(".calculation-rule-compose-list-item").first().addClass("active");
              self.renderCalculationRuleCompose(firstNode, renderTo, readOnly);

              $form = $(".calculation-rule-compose-detail-form-table");
            });
          });
        }
      },
      contentsEvent: {
        "change .val-method-dscd": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");

          var dscd = $form.find("[data-form-param='valueComputationMethodDistinctionCode']").val();
          var node = store.findNode($form.find("[data-form-param='calculationRuleComposeElementId']").val());

          $(".val-method-selective-input").hide();
          $(".val-method-" + dscd).show();

          var subCompose = $form.find("[data-form-param='upComposeElementId']").val();

          if (dscd === "01") {
            var conversionContent = Editor.translate($form.find("[data-form-param='calculationRuleContent']").val(), self.conditionMap, " ");
            $form.find(".conversion-content").val(conversionContent);
            $(".sub-compose-grid").height(subCompose ? "125px" : "156px");
            self.renderSubComposeGrid(rule);
            self.deletedSubCompose = [];

          } else if (dscd === "02" || dscd === "03") {
            $(".sub-compose-grid").height(subCompose ? "225px" : "255px");
            self.renderSubComposeGrid(rule);
            self.deletedSubCompose = [];

          } else if (dscd === "06") {
            self.renderComboBox("referenceObjectCode",
                $form.find("[data-form-param='referenceObjectName']"),
                node.referenceObjectName, true);
            $form.find("[data-form-param='referenceObjectName']").prop("disabled", false);
            $form.find("[data-form-param='referenceObjectName']").trigger("change");

          } else if (dscd === "07") {
            self.renderComboBox(null, $form.find("[data-form-param='referenceObjectName']"),
                "ARR_XTN_ATRBT", true, {"ARR_XTN_ATRBT": "계약확장속성 Object"});
            $form.find("[data-form-param='referenceObjectName']").prop("disabled", true);

            self.renderComboBox("referenceAttribute",
                $form.find("[data-form-param='referenceAttributeName']"),
                node.referenceAttributeName, true);
          }
        },

        "change .reference-object-name": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");
          var obj = $(e.target).val();
          var code = codeMapObj["referenceAttributeDistinctionCode"][obj];
          var node = store.findNode($form.find("[data-form-param='calculationRuleComposeElementId']").val());

          if (code) {
            self.renderComboBox(code,
                $form.find("[data-form-param='referenceAttributeName']"),
                node.referenceAttributeName, true);
          } else {
            $form.find("[data-form-param='referenceAttributeName']").empty();
          }
        },

        "click .reference-condition-code": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");
          PFPopup.selectConditionTemplate({}, function (cnd) {
            $form.find("[data-form-param='referenceConditionCode']").val(cnd.code);
            $form.find(".reference-condition-name").text(cnd.name);
            $(e.target).trigger('change');
          });
        },

        "click .calculation-rule-content": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");
          var $formula = $(".calculation-rule-compose-detail-form-table [data-form-param='calculationRuleContent']");

          PFPopup.editFormula({ formulaContent: $formula.val() }, function (formulaContent, conversionContent) {
            $formula.val(formulaContent);
            $form.find(".conversion-content").val(conversionContent);
            $(e.target).trigger('change');
          });
        },

        "click .calculation-rule-compose-history-btn": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");
          var item = {
              calculationRuleComposeElementId: $form.find("[data-form-param='calculationRuleComposeElementId']").val(),
          };
          renderCalculationRuleComposeHistoryPopup(item);
        },

        "click .save-calculation-rule-compose-btn": function(e) {
          if (!self.checkProject()) return;

          var $form = $(".calculation-rule-compose-detail-form-table");
          var item = PFUtil.makeParamFromForm($form, {dateFormat: "yyyyMMdd"});
          item.calculationRuleId = rule.calculationRuleId;

          // sub compose
          if (item.valueComputationMethodDistinctionCode === "01"
            || item.valueComputationMethodDistinctionCode === "02"
              || item.valueComputationMethodDistinctionCode === "03") {
            item.children = self.subComposeGrid.getAllData().filter(function(v) {
              return v.process == "C";
            }).concat(self.deletedSubCompose);
          }

          var save = function(item) {
            self.saveCalculationRuleCompose(item, function(responseData) {
              PFComponent.showMessage(bxMsg("workSuccess"), "success");

              getRuleComposeStore(rule, function(_store) {
                store = _store;
                rule.store = store;
                var node = store.findNode(item.calculationRuleComposeElementId);

                // refresh column list
                if (item.children && item.children.length > 0) {
                  root = store.get("root");
                  var param = {
                      list: root.children,
                  };

                  $(".calculation-rule-compose-list").remove();
                  $(".calculation-rule-compose-container").prepend(self.calculationRuleComposeListTpl(param));
                }

                self.renderCalculationRuleCompose(node, renderTo, readOnly);
              });
              composeModifyFlag = false;
            });
          }

          var node = store.findNode(item.calculationRuleComposeElementId);

          if (item.calculationRuleStatusCode === "04"
            && item.applyStartDate === node.applyStartDate
            && !isEmergency(getSelectedProjectId())) {
            PFComponent.showConfirm(bxMsg("savingEffectiveCalculationRuleCompose"), function() {
              save(item);
            });
          } else {
            save(item);
          }
        },

        "click .add-sub-compose-btn": function(e) {
          var $form = $(".calculation-rule-compose-detail-form-table");
          var targetCondition;

          if ($form.find("[data-form-param='valueComputationMethodDistinctionCode']").val() === "02") {
            // 클래스 하위 구성요소 (계산정보)의 경우 목록/범위형 조건만 선택가능
            targetCondition = ['01', '02'];
          }

          PFPopup.selectConditionTemplate({ targetCondition }, function (cnd) {
            self.subComposeGrid.store.add({
              composeElementConditionCode: cnd.code,
              applyStartDate: self.toCalDate(PFUtil.getToday()),
              process: "C"
            });
            composeModifyFlag = true;
          });
        },

        // 이벤트가 전체에 적용되는 버그 수정
        "click .calculation-rule-compose-detail-form-table .start-date": function(e) {
          if (e.target.name === "start") {
            applyStartDate = e.target.value;
          }
        },

        "change .calculation-rule-compose-detail-form-table .start-date": function(e) {
          if (e.target.name === "start") {
            var oldDate = new Date(applyStartDate);
            var newDate = new Date(e.target.value);

            if (oldDate < newDate) {
              $(".calculation-rule-compose-detail-form-table .editable").prop("disabled", false);
            }

            applyStartDate = e.target.value;
          }
        },

        // column-view control
        "click .calculation-rule-compose-list-item": function(e) {

        	if(!composeModifyFlag){
        		clickItem()
        	}else{
        		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
        			clickItem()
        			composeModifyFlag = false;
                }, function() {
                    return;
                });
        	}

        	function clickItem(){
		          var $column = $(e.target).closest("div");
		          var $button = $(e.target).closest("li").addBack("li");
		          var calculationRuleComposeElementId = $button.attr("value");
		          var node = store.findNode(calculationRuleComposeElementId);

		          // 하위 칼럼 제거
		          var $span = $column.find("span");
		          $span.removeClass("child-arrow-left");
		          $span.addClass("child-arrow-right");
		          while ($column.next().hasClass("calculation-rule-compose-list")) {
		            $column.next().remove();
		          }

		          // 하위 칼럼 생성
		          $span = $button.find("span");
		          $span.removeClass("child-arrow-right");
		          $span.addClass("child-arrow-left");
		          if (node.children && node.children.length > 0) {
		            var $new = $(self.calculationRuleComposeListTpl({list: node.children}));
		            $(".calculation-rule-compose-list").last().after($new);
		          }

		          $list = $(".calculation-rule-compose-list")
		          // focus
		          for (var i=0; i<$list.length-3; i++) {
		            $($list[i]).removeClass("focus");
		          }

		          for (var i=Math.max(0, $list.length-3); i<$list.length; i++) {
		            $($list[i]).addClass("focus");
		          }

		          // nav button
		          $(".focus .btn-left").hide();
		          $(".focus .btn-right").hide();

		          if ($(".focus").first().prev().hasClass("calculation-rule-compose-list")) {
		            $(".focus").first().find(".btn-left").show();
		          }

		          if ($(".focus").last().next().hasClass("calculation-rule-compose-list")) {
		            $(".focus").last().find(".btn-right").show();
		          }

		          $(".toggle-btn").removeClass("folded");

		          self.renderCalculationRuleCompose(node, renderTo, readOnly);

		          // activate button
		          while ($column.hasClass("calculation-rule-compose-list")) {
		            $column.find(".calculation-rule-compose-list-item").removeClass("active");
		            $column = $column.next();
		          }
		          $button.addClass("active");
        	}
        },

        "click .btn-left": function(e) {
          $(".focus").last().removeClass("focus");
          $(".focus").first().prev().addClass("focus");

          // nav button
          $(".focus .btn-left").hide();
          $(".focus .btn-right").hide();

          if ($(".focus").first().prev().hasClass("calculation-rule-compose-list")) {
            $(".focus").first().find(".btn-left").show();
          }

          if ($(".focus").last().next().hasClass("calculation-rule-compose-list")) {
            $(".focus").last().find(".btn-right").show();
          }
        },

        "click .btn-right": function(e) {
          $(".focus").first().removeClass("focus");
          $(".focus").last().next().addClass("focus");

          // nav button
          $(".focus .btn-left").hide();
          $(".focus .btn-right").hide();

          if ($(".focus").first().prev().hasClass("calculation-rule-compose-list")) {
            $(".focus").first().find(".btn-left").show();
          }

          if ($(".focus").last().next().hasClass("calculation-rule-compose-list")) {
            $(".focus").last().find(".btn-right").show();
          }
        },

        "click .toggle-btn": function(e) {
          $(e.target).toggleClass("folded");
          $(".calculation-rule-compose-detail-wrap").toggle();

          if ($(e.target).hasClass("folded")) {
            self.$focused = $(".focus");

            $(".calculation-rule-compose-list").addClass("focus");
            $(".btn-right, .btn-left").hide();

          } else {
            $(".calculation-rule-compose-list").removeClass("focus");
            self.$focused.addClass("focus");

            if ($(".focus").first().prev().hasClass("calculation-rule-compose-list")) {
              $(".focus").first().find(".btn-left").show();
            }
            if ($(".focus").last().next().hasClass("calculation-rule-compose-list")) {
              $(".focus").last().find(".btn-right").show();
            }
          }
        },


        // calculation rule condition
        "click .calculation-rule-condition-list-item": function(e) {

        	if(!cndModifyFlag){
        		clickItem();
        	}else{
        		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
        			clickItem();
        			cndModifyFlag = false;
                }, function() {
                    return;
                });
        	}

        	function clickItem(){
		          var $button = $(e.target).closest("li").addBack("li");
		          var conditionCode = $button.attr("value");


		          $(".condition-type-selective-input").hide();
		          $(".complex-selective-input").hide();

		          var item = {
		              calculationRuleId: rule.calculationRuleId,
		              conditionCode: conditionCode,
		              baseDate: rule.baseDate
		          };

		          // button click motion
		          $button.addClass("active");
		          $button.siblings().removeClass("active");

		          self.getCalculationRuleCondition(item, function(responseData) {
		            self.calculationRuleListConditionGrid = null;
		            self.complexConditionGrid = null;
		            renderCalculationRuleCondition(responseData, readOnly);
		          });
        	}
        },

        "click .calculation-rule-condition-history-btn": function(e) {
          var $form = $(".calculation-rule-condition-form-table");
          var item = {
              calculationRuleId: $form.find("[data-form-param='calculationRuleId']").val(),
              conditionCode: $form.find("[data-form-param='conditionCode']").val()
          };

          renderCalculationRuleConditionHistoryPopup(item);
        },

        "click .verify-btn": function(e) {
          var item = self.buildCalculationRuleCondition();
          var listConditionList = item.complexComposeList.filter(function(v) {
            return v.conditionTypeCode === "01";
          }).map(function(v) {return v.conditionCode});

          if (item.conditionTypeCode === "01")
            listConditionList.push(item.conditionCode);

          var translate = function(item, listCodeMap, defineValueMap) {
            listCodeMap = listCodeMap || {};
            defineValueMap = defineValueMap || {};
            return p = {
                conditionClassifyCode: "02", // 복합
                conditionTypeCode: item.conditionTypeCode,
                complexConditionTitleInfoList: item.complexComposeList.map(function(v) {
                  return {
                    titleConditionCode: v.conditionCode,
                    titleConditionName: self.conditionMap[v.conditionCode],
                    titleConditionTypeCode: v.conditionTypeCode,
                    currencyValue: v.currencyCode,
                    productMeasurementUnit: v.measurementUnitCode,
                    defineValues: defineValueMap[v.conditionCode],
                  };
                }),
                complexConditionMatrix: item.detailList.map(function(detail, i) {
                  return {
                    tierNumber: i+1,
                    listConditionValue: item.conditionTypeCode === "01" ? {
                      defineValues: detail.detailList.map(function(v) {
                        return {
                          name: listCodeMap[item.conditionCode][v.listCode],
                          isSelected: true,
                          code: v.listCode
                        };
                      })
                    } : undefined,
                    rangeConditionValue: item.conditionTypeCode === "02" ? {
                      minValue: detail.basicValue,
                      maxValue: detail.basicValue,
                      conditionDetailTypeCode: detail.rangeTypeCode
                    } : undefined,
                    x: item.complexComposeList.map(function(v) {
                      return {
                        id: v.conditionCode,
                        conditionTypeCode: v.conditionTypeCode,
                        listConditionValue: v.conditionTypeCode === "01" ? {
                          defineValues: [{
                            name: listCodeMap[v.conditionCode][v.listCodeList[i]],
                            isSelected: true,
                            code: v.listCodeList[i]
                          }]
                        } : undefined,
                        rangeConditionValue: v.conditionTypeCode === "02" ? {
                          minValue: v.minValueList[i],
                          maxValue: v.maxValueList[i],
                          conditionDetailTypeCode: self.conditionDetailMap[v.conditionCode].conditionDetailTypeCode
                        } : undefined
                      }

                    })
                  };
                })
            };
          }

          if (listConditionList.length > 0) {
            var codes = listConditionList.join(".");
            self.getListCndTemplateMasterList({code: codes}, function(responseData) {
              var defineValueMap = responseData.reduce(function(map, v) {
                map[v.code] = v.values.map(function(_v) {
                  return {
                    code: _v.key,
                    name: _v.value
                  };
                });
                return map;
              }, {});

              var listCodeMap = responseData.reduce(function(map, v) {
                map[v.code] = v.values.reduce(function(_map, _v) {
                  _map[_v.key] = _v.value;
                  return _map;
                }, {});
                return map;
              }, {});

              var p = translate(item, listCodeMap, defineValueMap);

              self.validateProductCondition(p, function(responseData) {
                PFComponent.showMessage(bxMsg("noAbnormality"), "success");
              });
            });
          } else {
            var p = translate(item);

            self.validateProductCondition(p, function(responseData) {
              PFComponent.showMessage(bxMsg("noAbnormality"), "success");
            });

          }
        },

        "click .compose-condition-setting-btn": function(e) {
          var $form = $(".calculation-rule-condition-form-table");
          var conditionCode = $form.find("[data-form-param='conditionCode']").val();
          var renderTo = ".calculation-rule-complex-condition-grid";
          selectComposeCondition(function(cndList) {
            renderComplexGrid(conditionCode, renderTo, cndList);
          });
        },

        "click .add-complex-condition-btn": function(e) {
          if (self.complexConditionGrid.grid.columns.length === 3) {
            PFComponent.showMessage(bxMsg("complexHeaderSetMsg"), "warning");
            return;
          }
          self.complexConditionGrid.store.add({});
        },

        "click .save-calculation-rule-condition-btn": function(e) {
          if (!self.checkProject()) return;

          var item = self.buildCalculationRuleCondition();
          // 복합조건
          if (item.complexConditionYn === "Y") {
            //계층이 존재하지 않을 시 오류
            if (item.detailList.length === 0) {
              PFComponent.showMessage(bxMsg("DPS0129Error5"), "warning");
              return;
            }

            var error = false;
            var minMaxError = false;
            // 계층에 부적절한 항목이 있는 경우 오류
            item.complexComposeList.forEach(function(v) {

              if (v.conditionTypeCode === "01") { // 목록형 조건상세 존재여부
                v.listCodeList.forEach(function(listCode) {
                  if (!listCode)
                    error = true;
                });

              } else if (v.conditionTypeCode === "02") { // 범위형 최대최소 확인
                v.minValueList.forEach(function(minValue, i) {
                  var maxValue = parseFloat(v.maxValueList[i]);
                  if (parseFloat(minValue) > maxValue || maxValue <= 0) {
                    minMaxError = true;
                  }
                });

              }
            });

            item.detailList.forEach(function(v, i) { // 조건값
              if (item.conditionTypeCode === "01") { // 목록형
                if (v.detailList.length === 0)
                  error = true;

              } else if (item.conditionTypeCode === "02") { // 범위형
                if (v.basicValue === null || v.basicValue === undefined
                    || (v.rangeTypeCode === "01" && !v.currencyCode)
                    || (v.rangeTypeCode !== "01" && !v.measurementUnitCode))
                  error = true;
              }
            });

            if (error) {
              PFComponent.showMessage(bxMsg("DPS0128Error4"), "warning");
              return;

            } else if (minMaxError) {
              PFComponent.showMessage(bxMsg("DPS0126_1Error4"), "warning");
              return;
            }


            // 단순조건
          } else {
            // 목록조건 상세는 하나 이상 선택해야함
            if (item.conditionTypeCode === "01" && item.detailList.length === 0) {
              PFComponent.showMessage(bxMsg("DPJ0122Error1"), "warning");
              return;
            }

          }

          var save = function(item) {
            self.saveCalculationRuleCondition(item, function(responseData) {
              PFComponent.showMessage(bxMsg("workSuccess"), "success");
              renderCalculationRuleCondition(responseData);
              cndModifyFlag = false;
            });
          }

          if (item.conditionStatusCode === "04"
            && item.applyStartDate === self.beforeRuleCondition.applyStartDate
            && !isEmergency(getSelectedProjectId())) {
            PFComponent.showConfirm(bxMsg("savingEffectiveItem"), function() {
              save(item);
            });
          } else {
            save(item);
          }
        },

        "change .condition-type-code": function(e) {
          var $cndform = $(".calculation-rule-condition-form-table");
          var type = $cndform.find("[data-form-param='conditionTypeCode']").val();
          var isComplex = $cndform.find("[data-form-param='complexConditionYn']").is(":checked");

          // 복합조건
          $(".condition-type-selective-input").hide();
          $(".complex-selective-input").hide();

          if (isComplex) {
            $(".complex-selective-input").show();

          } else {
            $(".condition-type-" + type).show();
          }
        },

        "change .range-type-code": function(e) {
          var $rngform = $(".calculation-rule-range-condition-form-table");
          var type = $rngform.find("[data-form-param='rangeTypeCode']").val();

          $(".range-type-selective-input").hide();
          $(".range-type-" + type).show();
        },

        "click .complex-condition-yn": function(e) {
          var $cndform = $(".calculation-rule-condition-form-table");
          var type = $cndform.find("[data-form-param='conditionTypeCode']").val();
          var isComplex = $cndform.find("[data-form-param='complexConditionYn']").is(":checked");
          $cndform.find("[data-form-param='conditionTypeCode']").trigger("change");
          var conditionCode = $cndform.find("[data-form-param='conditionCode']").val();

          if (!isComplex) {
            var $rngform = $(".calculation-rule-range-condition-form-table");
            var detailType = $rngform.find("[data-form-param='rangeTypeCode']").val();

            // 목록조건 신규인 경우
            if (type === "01" && !self.calculationRuleListConditionGrid) {
              var renderTo = ".calculation-rule-list-condition-grid";
              self.calculationRuleListConditionGrid = self.renderCalculationRuleListConditionGrid(conditionCode, [], renderTo);
            }

            // 범위조건 신규인 경우
            else if (type === "02" && !detailType) {
              var renderTo = ".calculation-rule-range-condition-form-table";
              self.renderCalculationRangeConditionDetail(conditionCode, {}, renderTo);
            }

          } else {
            // 복합조건 신규인 경우
            if (!self.complexConditionGrid) {
              var renderTo = ".calculation-rule-complex-condition-grid";
              renderComplexGrid(conditionCode, renderTo);
            }
            // OHS20180319 - 조건탭을 다시누르거나 할경우 그리드 사라짐 -> 그리드 다시생성해줌
            else if($('.calculation-rule-complex-condition-grid').children()
            		&& $('.calculation-rule-complex-condition-grid').children().length == 0) {
            	var renderTo = ".calculation-rule-complex-condition-grid";
                renderComplexGrid(conditionCode, renderTo);
            }

          }
        },

      }
  });
}

function getRuleComposeStore(rule, callBack) {
  var self = calculationUnitManager;

  var item = {
      tntInstId: getLoginTntInstId(),
      calculationRuleId: rule.calculationRuleId,
      baseDate: rule.baseDate
  };

  PFUI.use(["pfui/data", "pfui/menu"], function (Data, Menu) {
    var store;
    if (g_serviceType === g_bxmService) {
      var param = {
          header: {
            application: "PF_Factory",
            service: "CalculationRuleComposeService",
            operation: "getCalculationRuleComposeForList"
          },
          input: $.extend(item, {
            commonHeader: {
              loginTntInstId: getLoginTntInstId()
            }
          })
      };

      store = new Data.TreeStore({
        autoLoad: false,
        url: "/serviceEndpoint/json/request.json",
        dataProperty: "list",
        map: {
          name: "text",
          id: "id",
        },
        proxy : {
          method : "POST",
          ajaxOptions : {
            contentType: "application/json; charset=UTF-8",
            data:JSON.stringify(param)
          },
          dataType : "json"
        }
      });

    } else {
      store = new Data.TreeStore({
        autoLoad: false,
        url: "/calculator/getCalculationRuleComposeForList.json?" + $.param(item),
        dataProperty: "list",
        map: {
          name: "text",
          id: "id"
        }
      });
    }

    store.on("beforeprocessload", function (ev) {
      var data = ev.data;

      // error control
      if (data.responseError) {
        PFComponent.showMessage(data.responseError[0].errorMsg, "error");
        return false;
      }

      if (data.ModelMap) {
        data.responseMessage = data.ModelMap.responseMessage;
        delete data.ModelMap.responseMessage;
      }

      var listData = data.responseMessage || [];
      data.list = [];

      var map = {};
      for (var i in listData) {
        var each = listData[i];
        each.id = each.calculationRuleComposeElementId;
        each.name = self.conditionMap[each.composeElementConditionCode];
        each.name = each.name ? each.name : each.composeElementConditionCode;
        each.calculationRuleStatusName = codeMapObj.CalcnUnitStatusCd[each.calculationRuleStatusCode];
        each.children = [];
        map[each.calculationRuleComposeElementId] = each;
      }

      for (var i in listData) {
        var each = listData[i];

        if (each.upComposeElementId) {
          if (map[each.upComposeElementId])
            map[each.upComposeElementId].children.push(each);
        } else if (each === data.list) {
          continue;
        } else {
          data.list.push(each);
        }
      }
      data = data.list;
    });

    store.on("load", function() {
      callBack(store);
    });

    store.load();
  });
}

function renderCalculationRuleEditTab(rule, callBack) {
  var self = calculationUnitManager;

  var readOnly = rule.baseDate ? true : false;

  PFUI.use(["pfui/tab", "pfui/mask"], function(Tab) {
    var tab = new Tab.TabPanel({
      srcNode : ".pf-cal-compose-sub-tab ",
      elCls : "nav-tabs",
      panelContainer : "#pf-cal-compose-sub-tab-conts",
      autoRender: true,
      itemStatusCls : {
        "selected" : "active"
      }
    });

    tab.on("click", function (ev) {
      if (!$(ev.domTarget).is("ul")
          && $(".pf-cal-compose-sub-tab .active").index() === 1) {
        editCalculationRuleCondition(rule);
      }
    });

    if (readOnly) {
      var $tab = $(".pf-cal-compose-sub-tab");
      $tab.find(".base-date-header").removeClass("invisible");
      self.getDatePicker(false, $tab);
      $tab.find(".base-date").val(self.toPFDate(rule.baseDate));
    }

    callBack();
  });

}

function editCalculationRuleCondition(rule) {
  var self = calculationUnitManager;
  var readOnly = rule.baseDate ? true : false;

  var map = {};
  var targetNodes = rule.store.findNodesBy(function(node) {
    return node.valueComputationMethodDistinctionCode === "08"
  }).filter(function(item) {
    return map.hasOwnProperty(item.composeElementConditionCode) ? false : (map[item.composeElementConditionCode] = true);
  }).map(function(v) {
    return {
      conditionCode: v.composeElementConditionCode,
      text: v.text
    }
  });

  $(".calculation-rule-condition-container .calculation-rule-condition-menu").html(self.composeConditionMenuTpl({list: targetNodes}));

  var conditionCode = $(".calculation-rule-condition-list-item").first().attr("value");
  if (conditionCode) {
    $(".calculation-rule-condition-list-item").first().addClass("active");

    var item = {
        calculationRuleId: rule.calculationRuleId,
        conditionCode: conditionCode,
        baseDate: rule.baseDate
    };

    self.getCalculationRuleCondition(item, function(responseData) {
      renderCalculationRuleCondition(responseData, readOnly);
    });
  }
}

function renderCalculationRuleCondition(item = {}, readOnly) {
  item = item || {};
  // modify listener 제거
  $(".calculation-rule-condition-detail").off('change');

  var self = calculationUnitManager;

  $(".calculation-rule-condition-detail").html(composeConditionDetailTpl(item));

  var $cndform = $(".calculation-rule-condition-form-table");
  var applyStartDate = self.toPFDate(item.applyStartDate);
  var applyEndDate = self.toPFDate(item.applyEndDate);
  var isComplex = item.complexConditionYn === "Y" && $("[data-form-param='complexConditionYn']").prop("checked", true);

  self.renderComboBox("calculationRuleConditionTypeCode",
      $cndform.find("[data-form-param='conditionTypeCode']"),
      item.conditionTypeCode, true);
  $cndform.find("[data-form-param='conditionTypeCode']").trigger("change");

  self.renderComboBox("CalcnUnitStatusCd",
      $cndform.find("[data-form-param='conditionStatusCode']"),
      item.conditionStatusCode, true);

  $cndform.find("[data-form-param='complexConditionYn']").val(item.complexConditionYn);
  $cndform.find("[data-form-param='complexStructureId']").val(item.complexStructureId);

  self.getDatePicker(false, $cndform);
  $cndform.find("[data-form-param='applyStartDate']").val(applyStartDate);
  $cndform.find("[data-form-param='applyEndDate']").val(applyEndDate);

  var detailList = item.detailList || [];

  if (isComplex) { // 복합조건
    var renderTo = ".calculation-rule-complex-condition-grid";
    renderComplexGrid(item.conditionCode, renderTo, item.complexComposeList, item.detailList, readOnly);

  } else { // 단순조건

    if (item.conditionTypeCode === "01") { // list
      var selectedItems = detailList.map(function(v) {
        return v.listCode;
      });
      var renderTo = ".calculation-rule-list-condition-grid";
      self.calculationRuleListConditionGrid = self.renderCalculationRuleListConditionGrid(item.conditionCode, selectedItems, renderTo, readOnly);

    } else if (item.conditionTypeCode === "02") { // range
      var detail = detailList.length ? detailList[0] : {};
      var renderTo = ".calculation-rule-range-condition-form-table";

      self.renderCalculationRangeConditionDetail(item.conditionCode, detail, renderTo);
    }
  }

  if (readOnly) {
    $(".calculation-rule-condition-detail").find("input, select").prop("disabled", true);
    $(".calculation-rule-condition-detail").find(".write-btn").addClass("invisible");
  }

  self.beforeRuleCondition = item;

  // modify listener
  $(".calculation-rule-condition-detail").on('change', 'input, select, textarea', (e) => {
    cndModifyFlag = true;
  });
}

function renderComplexGrid(complexConditionCode, renderTo, complexComposeList, detailList, readOnly) {
  var self = calculationUnitManager;

  complexComposeList = complexComposeList || [];
  detailList = detailList || [];
  [complexComposeList, detailList] = aggregate(complexComposeList, detailList);
  var complexCondition = self.conditionDetailMap[complexConditionCode];
  console.log(complexConditionCode, complexCondition);
  var targetList = (complexCondition.conditionTypeCode === "01") // 복합조건의 경우 함께 조회
  ? complexComposeList.concat([complexCondition]) : complexComposeList;

  var listConditionIndexMap = {};
  var listConditionList = targetList.filter(function(v, i) {
    if (v.conditionTypeCode === "01") {
      listConditionIndexMap[v.conditionCode] = i;
      return v.conditionTypeCode === "01";
    }
    return false;
  });

  // 목록조건들의 상세 리스트 정보를 조회
  if (listConditionList.length > 0) {
    var codes = listConditionList.map(function(v) {return v.conditionCode}).join(".");
    self.getListCndTemplateMasterList({code: codes}, function(responseData) {
      responseData.forEach(function(v) {
        // 구성요소의 경우 상세 정보 설정
        var i = listConditionIndexMap[v.code];
        var cnd = complexComposeList[i];
        var map = {}
        cnd.listCodeArray = v.values.map(function(val) {
          map[val.key] = val.value;
          return {
            code: val.key,
            name: val.value
          }
        });
        cnd.listCodeMap = map;

        // 목록형 복합조건인 경우 상세 정보 설정
        if (v.code === complexConditionCode) {
          var map = v.values.reduce(function(map, v) {
            map[v.key] = v.value;
            return map;
          }, {});

          detailList.forEach(function(detail) {
            detail.listCodeList = detail.detailList.map(function(v) {
              return {
                selected: true,
                code: v.listCode,
                name: map[v.listCode]
              }
            });
          });
        }
      });

      renderComplexGridAux(complexCondition, complexComposeList, detailList, renderTo, readOnly);
    });

  } else {
    renderComplexGridAux(complexCondition, complexComposeList, detailList, renderTo, readOnly);
  }

}

function aggregate(complexComposeList, detailList) {
  var conditionList = detailList.reduce(function(list, v, i) {
    var tmp = complexComposeList.reduce(function(l, cnd) {
      if (cnd.conditionTypeCode === "01")
        l.push([cnd.listCodeList[i]]);
      else if (cnd.conditionTypeCode === "02")
        l.push({
          min: cnd.minValueList[i],
          max: cnd.maxValueList[i]
        });
      return l;
    }, []);
    tmp.push(v);
    list.push(tmp);
    return list;
  }, []);

  var match = function(a, b) {
    // 조건값 체크
    var va = a[a.length - 1];
    var vb = b[b.length - 1];
    if (va.detailList) { // 목록
      if (va.detailList.length !== vb.detailList.length)
        return -1;
      for (var i=0; i<va.detailList.length; i++) {
        if (va.detailList[i].listCode !== vb.detailList[i].listCode)
          return -1;
      }

    } else {
      if (va.rangeTypeCode !== vb.rangeTypeCode
          || va.basicValue !== vb.basicValue
          || va.currencyCode !== vb.currencyCode
          || va.measurementUnitCode !== vb.measurementUnitCode)
        return -1;
    }

    //구성조건 체크
    var diff = 0;
    var index = -1;
    for (var i=complexComposeList.length - 1; i>=0; i--) {
      if ((complexComposeList[i].conditionTypeCode === "01" && a[i].toString() !== b[i].toString())
          || (complexComposeList[i].conditionTypeCode === "02" && (a[i].min !== b[i].min || a[i].max !== b[i].max))) {
        if (++diff > 1) return -1;
        index = i;
      }
    }

    return index;
  };

  var iterate = function(list) {
    return list.reduce(function(l, now) {
      var prev = l.length ? l[l.length - 1] : null;
      if (prev) {
        var index = match(prev, now);
        if (index >= 0 && Array.isArray(prev[index])) {
          prev[index] = prev[index].concat(now[index]).sort();
        } else {
          l.push(now);
        }
      } else {
        l.push(now);
      }
      return l;
    }, []);
  };

  var prev, result = conditionList;
  do {
    prev = result;
    result = iterate(result);
  } while (prev.length > result.length);

  // 구성조건 초기화
  complexComposeList.forEach(function(cnd) {
    if (cnd.conditionTypeCode === "01")
      cnd.listCodeList = [];
    else if (cnd.conditionTypeCode === "02") {
      cnd.minValueList = [];
      cnd.maxValueList = [];
    }
  });

  result.forEach(function(v) {
    complexComposeList.forEach(function(cnd, i) {
      if (cnd.conditionTypeCode === "01")
        cnd.listCodeList.push(v[i]);
      else if (cnd.conditionTypeCode === "02") {
        cnd.minValueList.push(v[i].min);
        cnd.maxValueList.push(v[i].max);
      }
    });
  });
  detailList = result.map(function(v) {
    return v[v.length - 1];
  });

  return [complexComposeList, detailList];
}

function renderComplexGridAux(complexCondition, composeConditionList, detailList, renderTo, readOnly) {
  var self = calculationUnitManager;

  $(renderTo).empty();

  var grid;

  composeConditionList = composeConditionList || [];
  detailList = detailList || [];

  var isNotNegativeRangeType = function(rangeTypeCode) {
    return rangeTypeCode === "02" || rangeTypeCode === "03";
  }

  var fields = [{
    name: "condition",
    convert: function(newValue, record) {
      var type = complexCondition.type;

      if (!newValue) {
        newValue = {};

        if (type === "01") { // 목록
          newValue.listCodeList = [];

        } else if (type === "02") { // 범위
          var rangeTypeCode = complexCondition.conditionDetailTypeCode;

          newValue.basicValue = isNotNegativeRangeType(rangeTypeCode) ? "0" : "0.00";
          newValue.rangeTypeCode = rangeTypeCode;

          if (rangeTypeCode === "01") { // 날짜
            newValue.currencyCode = "KRW"

          } else if (rangeTypeCode === "02" || rangeTypeCode === "04") { // 날짜
            newValue.measurementUnitCode = "01"

          } else if (rangeTypeCode === "03") { // 숫자
            newValue.measurementUnitCode = "09"

          } else if (rangeTypeCode === "05") { // /율
            newValue.measurementUnitCode = "11"
          }
        }
      }

      return newValue;
    }
  }];

  // 2. 칼럼 추가
  var columns = [
    {
      text: bxMsg("tier"), width: 60, style: "text-align: center", align: "center",
      renderer: function(value, metaData, record, rowIndex) {
        var index = record.store.data.keys.indexOf(record.internalId);
        var prev = record.store.data.items.slice(0, index).map(function(v) { return v.data });
        var start = prev.reduce(function(n, cnd) {
          return n + Object.keys(cnd).reduce(function(m, key) {
            var v = cnd[key];
            if (v.isComposeCondition && v.conditionTypeCode === "01")
              m *= v.listCode.length;
            return m;
          }, 1);
        }, 1);
        var len = Object.keys(record.data).reduce(function(m, key) {
          var v = record.data[key];
          if (v.isComposeCondition && v.conditionTypeCode === "01")
            m *= v.listCode.length;
          return m;
        }, 1);
        return start + (len > 1 ? "~" + (start + len - 1) : "");
      }
    }
    ];

  var getListColumn = function(cnd) {
    var detail = self.conditionDetailMap[cnd.conditionCode];
    return {
      text: detail.name + "(" + detail.code + ")",
      width: 170, dataIndex: cnd.conditionCode + ".listCode", style: "text-align: center",
      renderer: function (value, metadata, record) {
        var map = value.reduce(function(map, v) {
          map[v] = true;
          return map;
        }, {});

        var consecutive = false;
        var resultList = [];
        var temp = [];
        cnd.listCodeArray.forEach(function(v, i) {
          if (map[v.code]) {
            temp.push(v);
            consecutive = true;
          }

          if (i === cnd.listCodeArray.length - 1 || (!map[v.code] && consecutive)) {
            if (temp.length === 1) {
              resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
            } else if (temp.length > 1) {
              var left = temp.shift();
              var right = temp.pop();
              resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
            }
            temp = [];
            consecutive = false;
          }
        });

        return resultList.join(", ");
      },
      editor: {
        xtype: "combo",
        typeAhead: true,
        editable: false,
        triggerAction: "all",
        displayField: "name",
        valueField: "code",
        emptyText: bxMsg("select"),
        multiSelect: true,
        listConfig: {
          getInnerTpl: function() {
            return "[{code}] {name}";
          }
        },
        store: new Ext.data.Store({
          fields: ["code", "name"],
          data: cnd.listCodeArray
        })
      }
    }
  };

  var getRangeColumn = function(cnd) {
    var detail = self.conditionDetailMap[cnd.conditionCode];
    var rangeHeader = "<div style='text-align:center'>" + detail.name + "(" + detail.code + ")<br/>"
    + (detail.conditionDetailTypeCode === "01"
      ? codeMapObj["CurrencyCode"][cnd.currencyCode]
    : codeMapObj["ProductMeasurementUnitCode"][cnd.measurementUnitCode]) + "<br/>"
    + codeMapObj["RangeBlwUnderTypeCode"][cnd.belowUnderDistinctionCode] + "</div>";

    return {
      header: rangeHeader,
      columns: [{
        text: bxMsg("DPS0121_1String1"), width: 160, dataIndex: cnd.conditionCode + ".minValue", style: "text-align:center",
        renderer: function (value, metadata, record) {
          return isNotNegativeRangeType(detail.conditionDetailCode)
          ? PFValidation.gridFloatCheckRenderer(value, 19, 0, true)
              : PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
        },
        editor: {
          xtype: "textfield",
          allowBlank: false,
          selectOnFocus: true,
          listeners: {
            "render": function (cmp) {
              cmp.getEl()
              .on("keydown", function (e) {
                if (isNotNegativeRangeType(detail.conditionDetailCode)) {
                  PFValidation.gridFloatCheckKeydown(e, 19, 0);
                } else {
                  PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                }
              })
              .on("keyup", function (e) {
                if (isNotNegativeRangeType(detail.conditionDetailCode)) {
                  PFValidation.gridFloatCheckKeyup(e, 19, 0);
                } else {
                  PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                }
              })
            }
          }
        }
      },
      {
        text: bxMsg("DPS0121_1String2"), width: 160, dataIndex: cnd.conditionCode + ".maxValue", style: "text-align:center",
        renderer: function (value, metadata, record) {
          return isNotNegativeRangeType(detail.conditionDetailCode)
          ? PFValidation.gridFloatCheckRenderer(value, 19, 0, true)
              : PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
        },
        editor: {
          xtype: "textfield",
          allowBlank: false,
          selectOnFocus: true,
          listeners: {
            "render": function (cmp) {
              cmp.getEl()
              .on("keydown", function (e) {
                if (isNotNegativeRangeType(detail.conditionDetailCode)) {
                  PFValidation.gridFloatCheckKeydown(e, 19, 0);
                } else {
                  PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                }
              })
              .on("keyup", function (e) {
                if (isNotNegativeRangeType(detail.conditionDetailCode)) {
                  PFValidation.gridFloatCheckKeyup(e, 19, 0);
                } else {
                  PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                }
              })
            }
          }
        }
      }
      ]
    }
  };

  composeConditionList.forEach(function(cnd) {
    var conditionCode = cnd.conditionCode;
    fields.push({
      name: conditionCode,
      convert: function(newValue, record) {
        return $.extend({isComposeCondition: true}, cnd);
      }
    });

    if (cnd.conditionTypeCode === "01") { // 목록형
      fields.push({
        name: conditionCode + ".listCode",
        convert: function(newValue, record) {
          if (typeof(newValue) === "string")
            newValue = [newValue];

          // 순서 조정
          var map = newValue.reduce(function(m, v) {
            m[v] = true;
            return m;
          }, {});
          newValue = cnd.listCodeArray.reduce(function(l, v) {
            if (map[v.code])
              l.push(v.code);
            return l;
          }, []);
          newValue = newValue.length > 0 ? newValue : [""];

          record.get(conditionCode).listCode = newValue;

          return newValue;
        }
      });

    } else if (cnd.conditionTypeCode === "02") { // 범위형
      var conditionDetailTypeCode = self.conditionDetailMap[cnd.conditionCode].conditionDetailTypeCode;

      fields.push({
        name: conditionCode + ".minValue",
        defaultValue: "0.00",
        convert: function(newValue, record) {
          newValue = (parseFloat(newValue) || "0.00") + ""; // 기본값
          newValue = isNotNegativeRangeType(conditionDetailTypeCode)
          ? PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true)
              : PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
          record.get(conditionCode).minValue = newValue;

          return newValue;
        }
      }, {
        name: conditionCode + ".maxValue",
        convert: function(newValue, record) {
          newValue = (parseFloat(newValue) || "0.00") + ""; // 기본값
          newValue = isNotNegativeRangeType(conditionDetailTypeCode)
          ? PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true)
              : PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
          record.get(conditionCode).maxValue = newValue;

          return newValue;
        }
      });
    }
    columns.push(cnd.conditionTypeCode === "01" ? getListColumn(cnd) : getRangeColumn(cnd))
  });

  var width, flex;
  if (composeConditionList.length > 1) {
    width = 300;
    flex = 0;
  } else {
    flex = 1;
  }

  // 조건값
  columns.push({
    text: bxMsg("conditionValue"), width: width, flex: flex, dataIndex: "condition", style: "text-align:center",
    renderer: function(value, p, record) {
      var type = complexCondition.type;
      var extFormat;

      var condition = record.get("condition");
      switch (type) {
      case "01":
        var content = condition.listCodeList.map(function(v) {
          return v.name;
        }).join(", ");

        extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0}</p>", content);
        break;

      case "02" :
        var basicValue = condition.basicValue;
        var title = condition.rangeTypeCode === "01" ? bxMsg("currency") : bxMsg("measurementUnit");
        var value = condition.rangeTypeCode === "01"
          ? codeMapObj["CurrencyCode"][condition.currencyCode] : codeMapObj["ProductMeasurementUnitCode"][condition.measurementUnitCode];


          extFormat = Ext.String.format("<p class='ext-condition-value-column'>{0}: {1} </br> {2}: {3}</p>", bxMsg("basicValue"), basicValue, title, value);
          break;
      }

      return extFormat;
    }
  });

  // 삭제 버튼
  columns.push({
    xtype: "actioncolumn", width: 30, align: "center",
    items: [{
      icon: "/images/x-delete-16.png",
      handler: function (_this, rowIndex, colIndex, item, e, record) {
        record.destroy();
        grid.grid.getView().refresh(); // rowIndex adjusting.
      }
    }],
    renderer: function(value, p, record) {
      if (readOnly)
        p.style += "display: none;";
    }
  });

  grid = PFComponent.makeExtJSGrid({
    fields: fields,
    gridConfig: {
      renderTo: renderTo,
      columns: columns,
      plugins: [
        Ext.create("Ext.grid.plugin.CellEditing", {
          clicksToEdit: 1,
          listeners: {
            beforeedit: function(e, editor) {
              if (readOnly) return false;
            },
            afteredit: function(e, editor) {
              if (editor.field.endsWith("listCode")) { // 목록조건 수정
                grid.grid.getView().refresh(); // rowIndex adjusting.
              }
              cndModifyFlag = true;
            }
          }
        })
        ],
        listeners: {
          scope: this,
          "celldblclick": function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            if ($(td).find("p").attr("class") === "ext-condition-value-column") {
              var type = complexCondition.type;
              var condition = record.get("condition");
              switch (type) {
              case "01":
                selectListCondition(complexCondition.code, condition.listCodeList, readOnly, function(listCodeList) {
                  condition.listCodeList = listCodeList;
                  record.commit();
                });
                break;

              case "02" :
                selectRangeCondition(condition, readOnly, function(rangeCondition) {
                  condition.basicValue = rangeCondition.basicValue;

                  if (condition.rangeTypeCode === "01") {
                    condition.currencyCode = rangeCondition.currencyCode;

                  } else {
                    condition.measurementUnitCode = rangeCondition.measurementUnitCode;
                  }
                  record.commit();

                });
                break;
              }
            }
          }
        }
    },
  });

  grid.store.model.override({
    isEqual : function(currentValue, newValue) {
      if (typeof currentValue == "undefined" || currentValue === null)
        return currentValue === newValue;
      if (currentValue === newValue) return true;

      if (Ext.isDate(currentValue))
        if (Ext.isDate(newValue))
          return currentValue.getTime() == newValue.getTime();
        else
          return false;

      if (Ext.isObject(currentValue)) {
        for (var key in currentValue) {
          if (currentValue.hasOwnProperty(key))
            if (!this.isEqual(currentValue[key], newValue[key]))
              return false;
        }
        return true;
      }
      else if (Ext.isArray(currentValue)) {
        if (newValue === null) return false;
        if (currentValue.length != newValue.length) return false;
        for (var i = 0 ; i < currentValue.length ; i++)
          if (!this.isEqual(currentValue[i], newValue[i]))
            return false;
        return true;
      }
      return false;
    }
  });

  // 데이터 추가
  if (complexCondition.type === "01") { // 목록
    self.getListCndTemplateMasterList({code: complexCondition.code}, function(responseData) {
      var map = responseData[0].values.reduce(function(map, v) {
        map[v.key] = v.value;
        return map;
      }, {});

      for (var i in detailList) {
        var detail = detailList[i];
        detail.listCodeList = detail.detailList.map(function(v) {
          return {
            selected: true,
            code: v.listCode,
            name: map[v.listCode]
          }
        });

        var record = self.makeComplexGridRecord(detail, composeConditionList, i);
        grid.store.add(record);
      }
    });

  } else {
    for (var i in detailList) {
      var detail = detailList[i];
      var record = self.makeComplexGridRecord(detail, composeConditionList, i);
      grid.store.add(record);
    }
  }

  if (!readOnly)
    self.complexConditionGrid = grid;
}

function selectListCondition(cndCd, listCodeList, readOnly, callBack) {
  var self = calculationUnitManager;

  var $container, grid;
  var popupId = self.getNextPopupId();
  var popup = PFComponent.makePopup({
    title: bxMsg("inputListCondition"),
    contents: listConditionPopupTpl(),
    elCls: popupId,
    width: 500,
    height: 325,
    buttons: [
      {
        text: bxMsg("Z_OK"),
        elCls: "button button-primary write-btn set-column-btn",
        handler : function() {
          var selected = grid.getAllData().filter(function(v) {
            return v.selected;
          });

          // 목록조건 상세는 하나 이상 선택해야함
          if (selected.length === 0) {
            PFComponent.showMessage(bxMsg("DPJ0122Error1"), "warning");
            return;
          }

          callBack(selected);
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
          grid = PFComponent.makeExtJSGrid({
            fields: ["selected", "code", "name"],
            gridConfig: {
              renderTo: $container.find(".list-condition-grid"),
              columns: [
                {
                  xtype: "checkcolumn", text: bxMsg("useYn"), width: 120, dataIndex: "selected",
                  style: "text-align: center", align: "center", disabled: readOnly
                },
                {
                  text: bxMsg("code"), flex: 1, dataIndex: "code", style: "text-align: center", align: "center"
                },
                {
                  text: bxMsg("codeName"), flex: 1, dataIndex: "name", style: "text-align: center", align: "center"
                }
                ]
            }
          });

          var map = {};
          listCodeList.forEach(function(v) {
            map[v.code] = v.selected;
          });

          self.getListCndTemplateMasterList({code: cndCd}, function(responseData) {
            var listCnd = responseData[0].values;
            $.each(listCnd, function(index, cnd) {
              grid.store.add({
                selected: map[cnd.key] ? true : false,
                    code: cnd.key,
                    name: cnd.value
              });
            });
          });
        }
      }
  });
}
