const calculationRuleHistoryPopupTpl = PFUtil.getTemplate("configurator/calculator", "calculationRuleHistoryPopupTpl");

function renderCalculationRuleHistoryPopup(item) {
  var self = calculationUnitManager;

  var $container, grid;
  var changeRenderer = function(value, p, record) {
    switch (record.get("target")) {
    case "applyEndDate":
      value = self.toPFDate(value); break;

    case "conditionCode":
    case "calculationRuleStatusCode":
    case "conditionStatusCode":
      value = codeMapObj.ProductStatusCode[value]; break;

    case "composeElementConditionCode":
    case "referenceConditionCode":
      var cndNm = self.conditionMap[value];
      value = cndNm ? Ext.String.format("[{0}] {1}", value, cndNm) : value; break;

    case "valueComputationMethodDistinctionCode":
      value = codeMapObj.valCmptnMthdDscd[value]; break;

    case "upComposeElementRelationTypeDistinctionCode":
      value = codeMapObj.upCalcnRuleCmpsElmntRelTpDscd[value]; break;

    case "referenceObjectName":
      value = codeMapObj.referenceObjectCode[value]; break;

    case "referenceAttributeName":
      value = codeMapObj.referenceAttribute[value]; break;

    case "conditionTypeCode":
      value = codeMapObj.ProductConditionTypeCode[value]; break;

    case "complexConditionYn":
      value = codeMapObj.ProductBooleanCode[value]; break;

    case "basicValue":
      var f = parseFloat(value)
      if (f) {
        var detail = self.conditionDetailMap[record.get("item")];
        var detailType = detail ? detail.conditionDetailTypeCode : "";
        value =  "" + f;
        value = self.isNotNegativeRangeType(detailType)
        ? PFValidation.gridFloatCheckRenderer(value, 19, 0, true)
            : PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2, true); break;
      }

    case "rangeTypeCode":
      value = codeMapObj.ProductConditionDetailTypeCode[value]; break;

    case "currencyCode":
      value = codeMapObj.CurrencyCode[value]; break;

    case "measurementUnitCode":
      value = codeMapObj.ProductMeasurementUnitCode[value]; break;

    case "subComposeElement":
      var root = grid.store.getRootNode();
      var cndCd = root.findChild("item", value, true).get("name");
      var cndNm = self.conditionMap[cndCd] || cndCd;
      value = Ext.String.format("[{0}] {1}", cndCd, cndNm);

    case "conditionValue":
      value = Ext.String.format("<p class='ext-condition-value-column ellipsis' icon-tooltip='{0}'>{0}</p>", bxMsg(value)); break;

    }

    return value;
  }

  var basis;
  var popup = PFComponent.makePopup({
    title: bxMsg("calculationRuleHistory"),
    contents: calculationRuleHistoryPopupTpl(),
    width: 800,
    height: 510,
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
          $container = $(".calculation-rule-history-popup");
          basis = $container.find(".basis").val();

          grid = PFComponent.makeExtTreeGrid({
            fields: ["item", "applyStartDate", "calculationRuleHistoryDistinctionCode", "target",
              "before", "after", "name", "category", // role: [ "applyStartDate", "item", else: attribute/information ]
              {
              name: "field",
              convert: function(newValue, record) {
                var name = record.get("name");
                if (record.get("category") === "applyStartDate") {
                  return self.toPFDate(name);

                } else if (record.get("category") === "item") {
                  var cndNm = self.conditionMap[name] || name;
                  return Ext.String.format("[{0}] {1}", name, cndNm);

                } else
                  return bxMsg(record.get("target"));
              }
              }
            ],
            gridConfig: {
              renderTo: ".pf-cal-rule-history-grid",
              expanded: true,
              columns: [
                {
                  xtype: "treecolumn", text: bxMsg(basis), width: 200, dataIndex: "field", style: "text-align: center",
                  renderer: function(value, p, record) {
                    var msg;
                    if (record.get("category") === "item" && record.get("calculationRuleHistoryDistinctionCode") === "01")
                      msg = Ext.String.format("{0} ({1})", value, record.get("item"));
                    else
                      msg = value

                      p.tdAttr = Ext.String.format("icon-tooltip='{0}'", msg);
                    return value;
                  }
                },
                {
                  text: bxMsg("distinction"), width: 110, dataIndex: "calculationRuleHistoryDistinctionCode", align: "center",
                  renderer: function(value, p, record) {
                    return record.get("category") === "item" ? codeMapObj["calculationRuleHistoryDistinctionCode"][value] : null;
                  }
                },
                {
                  text: bxMsg("beforeChange"), flex: 1, dataIndex: "before", align: "center",
                  renderer: function(value, p, record) {
                    if (value === null || value === undefined) {
                      p.style += "text-align: center;";
                      return bxMsg("new");
                    }

                    return changeRenderer(value, p, record);
                  }
                },
                {
                  text: bxMsg("afterChange"), flex: 1, dataIndex: "after", align: "center",
                  renderer: changeRenderer
                },
                {
                  xtype: "actioncolumn", width: 35, align: "center",
                  items: [{
                    iconCls: "bw-icon i-20 i-search",
                    handler: function (_this, rowIndex, colIndex, _item, e, record) {
                      if (record.get("category") === "applyStartDate") {
                        var rule = $.extend({baseDate: record.get("name")}, item);
                        showCalculationRuleComposeTotalHistory(rule);

                      } else {
                        var after = $("." + renderHistoryDetailPopup(record, false, item.calculationRuleId));
                        var before = $("." + renderHistoryDetailPopup(record, true, item.calculationRuleId));
                        var posA = $("body").width()/2 + 15 + "px";
                        var posB = before.css("left").replace("px", "") - before.css("width").replace("px", "")/2 - 15 + "px";

                        after.css("left", posA);
                        before.css("left", posB);
                      }
                    }
                  }],
                  renderer: function(value, p, record) {
                    var target = record.get("target");
                    var before = record.get("before");
                    var isNewRecord = before !== null && before !== undefined;
                    var needDetail = target === "subComposeElement" || target === "conditionValue";

                    if ((basis === "date" && record.get("category") === "applyStartDate")
                        || (isNewRecord && needDetail)) {}

                    else {
                      p.style += "display: none;"
                    }

                  }
                }
                ],
                listeners: {
                  scope: this,
                  "celldblclick": function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if ($(td).find("p").hasClass("ext-condition-value-column")) {
                      renderHistoryDetailPopup(record, cellIndex === 2, item.calculationRuleId);
                    }
                  }
                }
            },
          });

          self.getCalculationRuleHistory(item, function(responseData) {
            var data = buildCalculationRuleHistoryTree(responseData, basis);
            grid.setStoreRootNode(data);
          });

        }
      },
      contentsEvent: {
        "change .basis": function(e) {
          basis = $(e.target).val();
          self.getCalculationRuleHistory(item, function(responseData) {
            var data = buildCalculationRuleHistoryTree(responseData, basis);
            grid.setStoreRootNode(data);
            grid.grid.columns[0].setText(bxMsg(basis));
          });
        }
      }
  });

}
    
function showCalculationRuleComposeTotalHistory(rule, callBack) {
  editCalculationRuleCompose(rule, callBack);
}

function renderHistoryDetailPopup(record, prev, calculationRuleId) {
  var query = {
      applyStartDate: record.get("applyStartDate"),
      prev: prev
  };

  var popupId;
  if (record.get("calculationRuleHistoryDistinctionCode") === "01") {
    popupId = renderCalculationRuleComposeHistoryPopup({
      calculationRuleComposeElementId: record.get("after") // before === after
    }, query);

  } else if (record.get("calculationRuleHistoryDistinctionCode") === "02") {
    popupId = renderCalculationRuleConditionHistoryPopup({
      calculationRuleId: calculationRuleId,
      conditionCode: record.get("item"),
    }, query);

  }

  return popupId;
}
    
function buildCalculationRuleHistoryTree(data, basis) {
  var firstCategory, secondCategory;

  if (basis === "date") {
    firstCategory = "applyStartDate";
    secondCategory = "item";

  } else {
    firstCategory = "item";
    secondCategory = "applyStartDate";
  }

  var map = data.reduce(function(map, v) {
    var f = v[firstCategory];
    var s = v[secondCategory];

    if (!map[f]) {
      map[f] = {};
    } 

    if (!map[f][s]) {
      map[f][s] = {
          item: v.item,
          name: s,
          category: secondCategory,
          children: []
      };
    }

    map[f][s].children.push($.extend({leaf: true}, v));

    if (basis === "date") {
      map[f][s].calculationRuleHistoryDistinctionCode = v.calculationRuleHistoryDistinctionCode;
      map[f][s].name = v.name
    }

    return map;
  }, {});

  var list = [];
  Object.keys(map).forEach(function(key) {
    var item = {
        name: key,
        category: firstCategory,
        children: Object.values(map[key])
    };

    if (basis === "date") {
      list.unshift(item); // 날짜 역순

    } else if (basis === "item") {
      item.children.reverse(); // 날짜 역순
      item.calculationRuleHistoryDistinctionCode = item.children[0].children[0].calculationRuleHistoryDistinctionCode;
      item.item = item.children[0].children[0].item;
      item.name = item.children[0].children[0].name;
      list.push(item);
    }
  });

  return list;
}
