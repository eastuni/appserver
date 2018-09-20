/**
 * @author wb-yealeekim
 * @version $$id: condition-group.js, v 0.1 2015-01-12 PM 3:09 wb-yealeekim Exp $$
 */

var tagBox;
$(function() {

    $('body').css('overflow-y', 'scroll');

    setMainTapLeftPosition();
    renderConditionGroupTemplateTree();
    renderPdInfoDscdCombo();
    renderProductStatusCombo();
    renderProductInfo();
    
    // Autocomplete
    const getInput = (param) => $el.find(`[data-form-param='${param}']`);
    const $pdInfoDscd = getInput('pdInfoDscd');
    const $businessDistinctionCode = getInput('businessDistinctionCode');
    const $productTypeCode = getInput('productTypeCode');
    const $productStatusCode = getInput('productStatusCode');
    const $productName = getInput('productName');

    const tntInstId = getLoginTntInstId();
    const loginUserId = getLoginUserId();

    let option = () => {
      let config = (g_serviceType === g_bxmService) ? { // BXM
        serviceUrl: '/serviceEndpoint/json/request.json',
        type: 'POST',
        ajaxSettings: {
          data: JSON.stringify({
            header: {
              application: 'PF_Factory',
              operation: 'queryListPd',
              service: 'PdService'
            },
            input: {
              tntInstId: tntInstId,
              pdInfoDscd: $pdInfoDscd.val(),
              businessDistinctionCode: $businessDistinctionCode.val(),
              productTypeCode: $productTypeCode.val(),
              productStatusCode: $productStatusCode.val(),
              name: $productName.val(),
              commonHeader: {
                loginTntInstId: tntInstId,
                lastModifier: loginUserId
              }
            }
          }),
          contentType: "application/json"
        }
      } : { // Spring
        serviceUrl: '/product/peekProductNameForList.json',
        paramName: 'name',
        params: {
          tntInstId: tntInstId,
          pdInfoDscd: $pdInfoDscd.val(),
          businessDistinctionCode: $businessDistinctionCode.val(),
          productTypeCode: $productTypeCode.val(),
          productStatusCode: $productStatusCode.val(),
          commonHeaderMessage: `{loginTntInstId:"${tntInstId}",lastModifier:"${loginUserId}"}`
        }
      };

      return $.extend(config, {
        transformResult: response => {
          result = (g_serviceType === g_bxmService ? response.ModelMap.responseMessage : response.responseMessage) || {};
          return {
            suggestions: result.map(v => ({
              value: v,
              data: v
            }))
          };
        },
        onSearchStart: query => $productName.autocomplete().setOptions(option()),
        onSearchComplete: (query, suggestions) => {
          
        },
        dataType: 'json',
        preventBadQueries: false
      });
    };

    $productName.autocomplete(option());
    
    // hashtag
    tagBox = PFComponent.makeTagBox({
      targetClass: 'hashtag'
    });
    // autocomplete
    let req = {
        tntInstId: getLoginTntInstId()
    };
    PFRequest.get('/product/queryProductHashtagForList.json', req, {
      success: function (responseData) {
        // autocomplete
        let input = $el.find('.hashtag input');
        input.autocomplete({
          lookup: responseData.map(function(v) {
            return {
              value: v.hashtag,
              data: v.hashtag
            };
          }),
          onSelect: function(suggestion) {
            if (tagBox.tags.has(suggestion.value))
              input.val('');
          }
        });
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'PdService',
        operation: 'queryProductHashtagForList'
      }
    });
});


    var $el = $('.pf-ps');          // Page Root jQuery Element

    var conditionGroupTemplateLeftTreeTpl,
	  //cndPopupTpl,
        beforeRenderUITal,
        productConditionGrid;

    var cndGrid,
        selectedGridData,
        productTab;

    var listMap = {},
        navTree,
        navTreeStore;



    var productBaseObj = {};
    // Load Template in HTML
    productTabTal = getTemplate('productTabTal');
    conditionGroupTemplateLeftTreeTpl = getTemplate('conditionGroupTemplateLeftTreeTpl');

    var conditionType1Tpl = getTemplate('conditionType1Tpl'),
        conditionType2Tpl = getTemplate('conditionType2Tpl'),
        conditionType2GridTpl = getTemplate('conditionType2GridTpl'),
        conditionType3Tpl = getTemplate('conditionType3Tpl'),
        conditionType3ProvidedCndTpl = getTemplate('conditionType3ProvidedCndTpl'),
        conditionType4_1Tpl = getTemplate('conditionType4_1Tpl'),
        conditionType4_2Tpl = getTemplate('conditionType4_2Tpl'),
        conditionType4FeeDiscountTpl = getTemplate('conditionType4FeeDiscountTpl'),
        cndValueType2Tpl = getTemplate('cndValueType2Tpl'),
        cndValueType3Tpl = getTemplate('cndValueType3Tpl'),
        cndValueType4Tpl = getTemplate('cndValueType4Tpl'),
        relInfoGridTpl = getTemplate('relInfoGridTpl'),
        relProductInfoGridTpl = getTemplate('relProductInfoGridTpl'),
        relBranchInfoGridTpl = getTemplate('relBranchInfoGridTpl'),
        relChannelInfoGridTpl = getTemplate('relChannelInfoGridTpl'),
        relNameInfoGridTpl = getTemplate('relNameInfoGridTpl'),
        relEtcInfoGridTpl = getTemplate('relEtcInfoGridTpl'),
        relClInfoGridTpl = getTemplate('relClInfoGridTpl'),
        relEmployeeInfoGridTpl = getTemplate('relEmployeeInfoGridTpl'),
        relServiceInfoGridTpl = getTemplate('relServiceInfoGridTpl'),
        relIntRtStrctrInfoGridTpl = getTemplate('relIntRtStrctrInfoGridTpl'),
        relConfigGridTpl = getTemplate('relConfigGridTpl'),
        cndApplyRuleTpl = getTemplate('cndApplyRuleTpl'),  // 적용규칙
        pirtRuleTpl = getTemplate('pirtRuleTpl');      // 우대금리적용규칙

    var onEvent = PFUtil.makeEventBinder($el);

    PFComponent.toolTip($el);

    onEvent('click', 'a', function(e) { e.preventDefault(); });

    onEvent('click', '.sidebar-toggler', function(e) {
        var $target = $(e.currentTarget);

        $el.toggleClass('contents-expand');

        if($el.hasClass('contents-expand')) {
            $target.text('>');
        }else {
            $target.text('<');
        }

        setTimeout(function() {
            $('.manual-resize-component:visible').resize();
        }, 600);
    });

    function scrollMove(menuClass, thisClass){
        var selectedItemTop = $('.'+thisClass+' .'+menuClass).attr('data-offset');
        $('.' + thisClass + ' .pf-ps-info-panel').scrollTop(selectedItemTop-110);
    }

    function setOffset(tplClass) {
        var selectedItemTop = $(tplClass).offset().top;
        $(tplClass).attr('data-offset', selectedItemTop)
    }

    onEvent('click', '.search-list-expand-btn', function(e) {
        var $target = $(e.currentTarget);

        $el.find('.pf-ps-list-panel').toggleClass('nav-expand');

        if($el.find('.pf-ps-list-panel').hasClass('nav-expand')) {
            //$target.text('▼');
            $target.html('<i class="bw-icon i-25 i-open3"></i>');
        }else {
            //$target.text('▲');
            $target.html('<i class="bw-icon i-25 i-close3"></i>');
        }
    });

    onEvent('change', '.pd-info-dscd', function(e) {
        var type;
        switch(e.target.value) {
            case '01':
                type = 'PD';
                break;
            case '02':
                type = 'SV';
                break;
            case '03':
                type = 'PO';
                break;
        }
        renderFirstCatalogCombo(type);
        renderProductTypeCombo('');
    });

    onEvent('change', '.first-catalog-combo', function(e) {
        renderProductTypeCombo(this.value);
    });

    onEvent('click', '.pf-ps-search-btn', function(e) {
        $el.find('.pf-ps-tree-nav').empty();

        var requestParam = PFComponent.makeYGForm($('.pf-ps-search-panel-body')).getData();

        //var tempArr = [];
        //productConditionGrid.getAllData().forEach(function(el) {
        //    tempArr.push(el.code);
        //});
        //
        //requestParam.conditionCodeList = tempArr;

        var cndOrderList = [];
        productConditionGrid.getAllData().forEach(function(el) {
            //requestParam.productSearchConditionOrderList = productConditionGrid.getAllData();
            var cndOrder = {};
            cndOrder.code = el.code;
            cndOrder.type = el.type;
            cndOrder.maxValue = el.maxValue;
            cndOrder.minValue = el.minValue;

            if (el.listConditionValueList != "") {
                cndOrder.listConditionValueList = el.listConditionValueList;
            }

            cndOrderList.push(cndOrder);
        });

        requestParam.productSearchConditionOrderList = cndOrderList;

        requestParam.saleStartDate = (requestParam.saleStartDate.split(' ').length == 1) ? requestParam.saleStartDate + ' 00:00:00' : requestParam.saleStartDate;
        requestParam.saleEndDate = (requestParam.saleEndDate.split(' ').length == 1) ? requestParam.saleEndDate + ' 23:59:59' : requestParam.saleEndDate.substr(0,10)+' 23:59:59';
        requestParam.tntInstId =  $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
        
        // for IE.
        //var hashtags = Array.from(tagBox.tags.keys());
        var hashtags = [];
        tagBox.tags.forEach(function (el) {
        	if($(el).find('span') && $(el).find('span').length > 0) {
        		hashtags.push($(el).find('span').eq(0).text());
        	}
        });
        
        requestParam.hashtagList = hashtags;

        PFRequest.post('/search/queryAllProductList.json', requestParam, {
            success: function(responseData) {
            	var productCompareAddToolTip = bxMsg('productCompareAddIcon');

                PFUI.use(['pfui/tree'], function (Tree) {
                    var tree = new Tree.TreeList({
                        render : '.pf-ps-tree-nav',
                        itemTpl : '<li>{name} ({code}) ' +
                        '<button type="button" class="bw-btn compare-add-btn write-btn" ' +
                        'product-code={code} ' +
                        'product-name={name} ' +
                        'firstCatalogId={firstCatalogId} ' +
                        'secondCatalogId={secondCatalogId} ' +
                        'pdInfoDscd={pdInfoDscd} ' +
                        'productTemplateCode={productTemplateCode} ' +
                        'tntInstId={tntInstId} ' +
                        'icon-tooltip="' + productCompareAddToolTip  + '"' +
                        //'style="right: 1px;margin-top: -3px;position: absolute;">' +
                        'style="right: 1px;margin-top: -1px;position: absolute;">' +
                    '<i class="bw-icon i-20 i-func-add"></i>' +
                    '</button></li>',
                        showLine : false,
                        nodes : responseData,
                        showRoot : false
                    });


                    tree.render();

                    tree.on('itemdblclick', function(e) {
                        renderProductTab(e.item);
                    });
/*
                    var addCompareProductCode;
                    var addCompareProductName;
                    var addCompareFirstCatalogId;
                    var addCompareSecondCatalogId;
                    var addComparePdInfoDscd;
                    var addCompareProductTemplateCode;

*/
                    onEvent('click', '.compare-add-btn', function(e) {
                        var addCompareProductCode = $(e.currentTarget).attr("product-code");
                        var addCompareProductName = $(e.currentTarget).attr("product-name");
                        var addCompareFirstCatalogId = $(e.currentTarget).attr("firstCatalogId");
                        var addCompareSecondCatalogId = $(e.currentTarget).attr("secondCatalogId");
                        var addComparePdInfoDscd = $(e.currentTarget).attr("pdInfoDscd");
                        var addCompareProductTemplateCode = $(e.currentTarget).attr("productTemplateCode");
                        var addCompareTntInstId = $(e.currentTarget).attr("tntInstId");

                        if($(parent.document).find('.compare-product-list').find('input') && $(parent.document).find('.compare-product-list').find('input').length > 0) {
                            if($(parent.document).find('.compare-product-list').find('input').length > 2) {
                                // 상품비교는 최대 3개 상품까지 비교 가능합니다.
                                PFComponent.showMessage(bxMsg('maxProductCompareCount'), 'warning', undefined, false);
                                return false;
                            }
                            var alreadyExistCount = 0;
                            $(parent.document).find('.compare-product-list').find('input').each(function() {
                                if($(this).attr('product-code') == addCompareProductCode) {
                                    alreadyExistCount++;
                                }
                            });

                            if(alreadyExistCount > 0) {
                                // 이미 상품비교 대상에 추가된 상품입니다.
                                PFComponent.showMessage(bxMsg('productCompareAlreadyAdded'), 'warning', undefined, false);
                                return false;
                            }
                            else {
                                $(parent.document).find('.compare-product-list').append('<input product-code=' + addCompareProductCode
                                                                                            + ' product-name=' + addCompareProductName
                                                                                            + ' first-catalog-id=' + addCompareFirstCatalogId
                                                                                            + ' second-catalog-id=' + addCompareSecondCatalogId
                                                                                            + ' pd-info-dscd=' + addComparePdInfoDscd
                                                                                            + ' tntInstId=' + addCompareTntInstId
                                                                                            + ' product-template-code=' + addCompareProductTemplateCode + '>');

                                if($(parent.document).find('.product-compare-tab').find('.tab-item-title').text().indexOf('(') != -1) {
                                    $(parent.document).find('.product-compare-tab').find('.tab-item-title').text(
                                        $(parent.document).find('.product-compare-tab').find('.tab-item-title').text().substr(0, $(parent.document).find('.product-compare-tab').find('.tab-item-title').text().indexOf('(') - 1)
                                        + ' ( ' +  $(parent.document).find('.compare-product-list').find('input').length + ' ) '
                                    );
                                }
                                else {
                                    $(parent.document).find('.product-compare-tab').find('.tab-item-title').text($(parent.document).find('.product-compare-tab').find('.tab-item-title').text()
                                        + ' ( ' +  $(parent.document).find('.compare-product-list').find('input').length + ' ) '
                                    );
                                }

                            }
                        }
                        else {
                            $(parent.document).find('.compare-product-list').append('<input product-code=' + addCompareProductCode
                                                                                        + ' product-name=' + addCompareProductName
                                                                                        + ' first-catalog-id=' + addCompareFirstCatalogId
                                                                                        + ' second-catalog-id=' + addCompareSecondCatalogId
                                                                                        + ' pd-info-dscd=' + addComparePdInfoDscd
                                                                                        + ' tntInstId=' + addCompareTntInstId
                                                                                        + ' product-template-code=' + addCompareProductTemplateCode + '>');

                            if($(parent.document).find('.product-compare-tab').find('.tab-item-title').text().indexOf('(') != -1) {
                                $(parent.document).find('.product-compare-tab').find('.tab-item-title').text(
                                    $(parent.document).find('.product-compare-tab').find('.tab-item-title').text().substr(0, $(parent.document).find('.product-compare-tab').find('.tab-item-title').text().indexOf('(') - 1)
                                    + ' ( ' +  $(parent.document).find('.compare-product-list').find('input').length + ' ) '
                                );
                            }
                            else {
                                $(parent.document).find('.product-compare-tab').find('.tab-item-title').text($(parent.document).find('.product-compare-tab').find('.tab-item-title').text()
                                    + ' ( ' +  $(parent.document).find('.compare-product-list').find('input').length + ' ) '
                                );
                            }
                        }

                        PFComponent.showMessage(addCompareProductName + '( ' + addCompareProductCode + ' )' + '<br>' + bxMsg('productCompareAdded'), 'success', undefined, true);
                    });
                });
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'SearchService',
                operation: 'queryListAllPd'
            }
        });
    });

    onEvent('click', '.product-condition-search-btn', function() {
      selectCondition(function(cndList) {
        cndList.forEach(function(cnd) {
          productConditionGrid.addData(cnd);
        });
      }, "A");

    	/*var submitEvent = function(selectedData){
            selectedData.forEach(function(el) {
                productConditionGrid.addData(el);
            });
    	};

        // 공통 팝업으로 분리하여 호출하도록 변경
    	renderConditionTemplateListSearchPopup(submitEvent);*/
//        var cndPopupGrid;
//
//        PFComponent.makePopup({
//            title: bxMsg('DTP0203Title'),
//            width: 500,
//            height: 330,
//            contents: cndPopupTpl(),
//            submit: function() {
//                var selectedData = cndPopupGrid.getSelectedItem();
//
//                selectedData.forEach(function(el) {
//                    productConditionGrid.addData(el);
//                });
//            },
//            contentsEvent: {
//                'click .cnd-tpl-search': function() {
//                    var requestParam = {
//                        'conditionName': $('.add-cnd-popup .cnd-name-search').val()
//                    };
//
//                    var comboVal = $('.add-cnd-popup .cnd-type-select').val();
//
//                    if (comboVal) {
//                        requestParam.conditionTypeCode = comboVal;
//                    }
//
//                    if ($('.cnd-tpl-type-select').val() == '03') {
//                        requestParam = {
//                            conditionTypeCode : '04',
//                            conditionDetailTypeCode:'04.10',
//                            conditionName : $('.add-cnd-popup .cnd-name-search').val()
//                        }
//                    }
//
//                    PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
//                        success: function(responseData) {
//
//                            $('.add-cnd-popup .popup-cnd-grid').empty();
//
//                            cndPopupGrid = PFComponent.makeExtJSGrid({
//                                fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
//                                    name: 'typeNm',
//                                    convert: function(newValue, record) {
//                                        var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
//                                        return typeNm;
//                                    }}],
//                                gridConfig: {
//                                    selType: 'checkboxmodel',
//                                    renderTo: '.popup-cnd-grid',
//                                    columns: [
//                                        {text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code'},
//                                        {text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm'},
//                                        {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
//                                        {text: bxMsg('DPS0101String6'), width: 60, dataIndex: 'isActive',
//                                            renderer: function(value, p, record) {
//                                                if (value === 'Y') {
//                                                    return bxMsg('active');
//                                                } else if (value === 'N') {
//                                                    return bxMsg('inactive');
//                                                }
//                                            }
//                                        },
//                                        {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
//                                    ]
//                                }
//                            });
//
//                            cndPopupGrid.setData(responseData);
//                        }
//                    });
//                }
//            },
//            listeners: {
//                afterRenderUI: function() {
//                    var options = [];
//
//                    var $defaultOption = $('<option>');
//                    $defaultOption.text(bxMsg('Z_All'));
//                    $defaultOption.val('');
//
//                    options.push($defaultOption);
//
//                    $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
//                        var $option = $('<option>');
//                        $option.val(key);
//                        $option.text(value);
//
//                        options.push($option);
//                    });
//
//                    $('.add-cnd-popup .cnd-type-select').html(options);
//
//                    PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', {
//                        success: function(responseData) {
//
//                            cndPopupGrid = PFComponent.makeExtJSGrid({
//                                fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
//                                    name: 'typeNm',
//                                    convert: function(newValue, record) {
//                                        var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
//                                        return typeNm;
//                                    }}],
//                                gridConfig: {
//                                    selType: 'checkboxmodel',
//                                    renderTo: '.popup-cnd-grid',
//                                    columns: [
//                                        {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
//                                        {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
//                                        {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
//                                        {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
//                                            renderer: function(value, p, record) {
//                                                if (value === 'Y') {
//                                                    return bxMsg('active');
//                                                } else if (value === 'N') {
//                                                    return bxMsg('inactive');
//                                                }
//                                            }
//                                        },
//                                        {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
//                                    ]
//                                }
//                            });
//
//                            cndPopupGrid.setData(responseData);
//                        }
//                    });
//                }
//            }
//        });
    });

    //onEvent('focusout', '.base-date', function(e){
    //    var pdCd = $('.pf-ps-tab-container[style="display: block;"]')[0].classList[1];   // 기관코드_상품코드
    //
    //    // form Info
    //    var requestParam = {
    //        tntInstId : productBaseObj[pdCd].tntInstId,
    //        pdInfoDscd: productBaseObj[pdCd].pdInfoDscd,
    //        productCode : productBaseObj[pdCd].productCode,
    //        productTemplateCode: productBaseObj[pdCd].productTemplateCode,
    //        productTypeCode: productBaseObj[pdCd].productTypeCode,
    //        businessDistinctionCode:productBaseObj[pdCd].businessDistinctionCode
    //    }
    //
    //    requestParam.baseDate = e.target.value;
    //
    //    renderProductTab(requestParam, true);
    //});

    onEvent('keydown.xdsoft', '.base-date', function(e) {

        if (e.keyCode == '13') {
            var pdCd = $('.pf-ps-tab-container[style="display: block;"]')[0].classList[1];   // 기관코드_상품코드

            // form Info
            var requestParam = {
                tntInstId: productBaseObj[pdCd].tntInstId,
                pdInfoDscd: productBaseObj[pdCd].pdInfoDscd,
                productCode: productBaseObj[pdCd].productCode,
                productTemplateCode: productBaseObj[pdCd].productTemplateCode,
                productTypeCode: productBaseObj[pdCd].productTypeCode,
                businessDistinctionCode: productBaseObj[pdCd].businessDistinctionCode
            }

            requestParam.baseDate = e.target.value;

            renderProductTab(requestParam, true);
        }
    });

    onEvent('click', '.pf-report-download', function(e) {

       var pdCd = $('.pf-ps-tab-container[style="display: block;"]')[0].classList[1];   // 기관코드_상품코드

		// form Info
		var requestParam = {
			tntInstId : productBaseObj[pdCd].tntInstId,
			pdInfoDscd: productBaseObj[pdCd].pdInfoDscd,
			productCode : productBaseObj[pdCd].productCode,
            productTemplateCode: productBaseObj[pdCd].productTemplateCode,
            productTypeCode: productBaseObj[pdCd].productTypeCode,
            businessDistinctionCode:productBaseObj[pdCd].businessDistinctionCode,
            baseDate: productBaseObj[pdCd].baseDate
		}

		//request
		PFRequest.get('/product/queryProductAllInfoReport.json', requestParam, {
			success: function (responseData) {
                PFUtil.downLaodFile('.file-download-iframe', requestParam.productCode+'.pdf', 'temp.file.path', requestParam.productCode+'.pdf');
			},
			bxmHeader: {
                application: 'PF_Factory',
                service: 'PdService',
                operation: 'queryPdAllInfoReport'
			}
		});
    });

    onEvent("click", ".text-input-btn", function(e) {
      var $content = $("[data-form-param='searchRule'], .search-rule");
      var s = $(e.currentTarget).val();

      PFFormulaEditor.inputToken(s, $content);
      var map = productConditionGrid.getAllData().reduce(function(m, v, i) {
        var value = v.type === "01"
          ? (v.listConditionValueList ? v.listConditionValueList.map(function(_v) {return _v.listCode}).join(",") : "")
          : v.minValue + "~" + v.maxValue;
        m[i] = "[" + v.code + ": " + value + "]";
        return m;
      }, {});
      $(".search-rule").val(PFFormulaEditor.translate($content.val(), map, " "));
    });

    onEvent("click", ".back-space-btn", function(e) {
      var $content = $("[data-form-param='searchRule'], .search-rule");
      var tokens = PFFormulaEditor.tokenize($content.val());
      tokens.pop();

      $content.val(PFFormulaEditor.toContent(tokens, " "));
      var map = productConditionGrid.getAllData().reduce(function(m, v, i) {
        var value = v.type === "01"
          ? (v.listConditionValueList ? v.listConditionValueList.map(function(_v) {return _v.listCode}).join(",") : "")
          : v.minValue + "~" + v.maxValue;
          m[i] = "[" + v.code + ": " + value + "]";
          return m;
      }, {});
      $(".search-rule").val(PFFormulaEditor.translate($content.val(), map, " "));
    });

    function renderConditionGroupTemplateTree(){
        $('.pf-ps-left-tree-box').html(conditionGroupTemplateLeftTreeTpl());

        PFUtil.getDatePicker();
        $('.pf-ps-left-tree-box').find('.start-date').val('1900-01-01');

        renderProductTypeCombo('01');

        productConditionGrid = PFComponent.makeExtJSGrid({
            fields: ['code', 'name', 'type', 'listConditionValueList', {
                name: 'maxValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }}, {
                name: 'minValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }}],
            gridConfig: {
                renderTo: '.product-condition-selection-grid',
                columns: [
                    {text: bxMsg('DPP0128String2'), align:'center', flex: 1, dataIndex: 'code'},
                    {text: bxMsg('DPS0121String2'), align:'center', flex: 3, dataIndex: 'name'},
                    {text: bxMsg('DPS0129String4'), flex:2,
                        renderer: function(value, p, record) {
	                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
	                        var conditionTypeCode = record.get('type');

	                        // If LIST type
	                        // else if RANGE type
	                        if (conditionTypeCode == '01') {
	                            if (record.get('listConditionValueList')) {
	                                record.get('listConditionValueList').forEach(function(el) {
	                                    yVal = yVal + '[' + el.listCode + ']' + el.value + ',';
	                                });

	                                if(yVal != '' && yVal.length > 0) {
	                                    yVal = yVal.substring(0, yVal.length - 1);
	                                }
	                            }

	                            if(yVal.length > 16){
	                            	yVal = yVal.replace(/,/g, '</br>');
	                            }

	                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);

	                        } else if (conditionTypeCode == '02') {
	                            var minString, maxString;

	                            minString = record.get('minValue');
	                            maxString = record.get('maxValue');

	                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
	                            yVal1 = minString + '~' + maxString;

	                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
//	                            extFormat = record.get('minValue');
	                        } else {
	                            extFormat = Ext.String.format('<p class="ext-condition-value-column"></p>');
	                        }

	                        // Return Output
	                        return extFormat;
	                    },
//                        editor:{},
                        dataIndex : 'minValue'
                    },
                    {
                        xtype: 'actioncolumn', width: 35, align: 'center',
                        items: [{
                            icon: '/images/x-delete-16.png',
                            handler: function (grid, rowIndex, colIndex, item, e, record) {
                                record.destroy();
                            }
                        }]
                    }
                ],
                listeners: {
                    scope: this,
                    'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        if ($(td).find('p').attr('class') === 'ext-condition-value-column') {
                            var conditionTypeCode = record.get('type');

                            // If LIST type
                            // else if RANGE type
                            if (conditionTypeCode == '01') {
                                renderListConditionValuePopup(record.get('listConditionValueList'), rowIndex, record.get('code'));
                            } else if (conditionTypeCode == '02') {
                                renderRangeConditionValuePopup({minValue: record.get('minValue'), maxValue: record.get('maxValue')}, rowIndex);
                            } else {
                                alert("수수료와 금리 유형은 조건값 설정 불가");
                            }
                        } else {
                          var $content = $("[data-form-param='searchRule'], .search-rule");
                          var s = "#" + rowIndex; 
                          PFFormulaEditor.inputToken(s, $content);
                          var map = productConditionGrid.getAllData().reduce(function(m, v, i) {
                            var value = v.type === "01"
                              ? (v.listConditionValueList ? v.listConditionValueList.map(function(_v) {return _v.listCode}).join(",") : "")
                              : v.minValue + "~" + v.maxValue;
                            m[i] = "[" + v.code + ": " + value + "]";
                            return m;
                          }, {});
                          $(".search-rule").val(PFFormulaEditor.translate($content.val(), map, " "));
                        }
                    },
                },
                plugins: [
                    Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 2,
                        listeners: {
//                            beforeedit: function(e, editor){
//                                var conditionTypeCode =editor.record.data.type;
//                                if (conditionTypeCode != '02') {
//                                    return false;
//                                }
//                            }
                        }
                    })
                ],
            }
        });
    }

    function renderPdInfoDscdCombo() {
        var options = [];

        var $defaultOption = $('<option>');
        //$defaultOption.text(bxMsg('Z_All'));
        //$defaultOption.val('');
        //
        //options.push($defaultOption);

        $.each(codeArrayObj['PdInfoDscd'],function(index, option){
            var $option = $('<option>');
            $option.val(option.code);
            $option.text(option.name);
            options.push($option);
        });

        $('.pd-info-dscd').html(options);

        renderFirstCatalogCombo('PD');  // 초기화시
    }

    function renderFirstCatalogCombo(type) {
        var requestParam = {
            //idType: '04',
            treeType: type,
            //id: id,
            tntInstId: $('.product-factory-header', parent.document).find('.pf-multi-entity').val(),
            pdInfoDscd: $('.pd-info-dscd').val()
        };

        PFRequest.get('/catalog/getCatalog.json', requestParam, {
            success: function(responseData) {
                var options = [];

                var $defaultOption = $('<option>');
                $defaultOption.text(bxMsg('Z_All'));
                $defaultOption.val('');

                options.push($defaultOption);

                if (responseData.childCatalogs) {
                    responseData.childCatalogs.forEach(function (el) {
                        var $option = $('<option>');

                        $option.val(el.id);
                        $option.text(el.name);

                        options.push($option);
                    });

                    $('.first-catalog-combo').html(options);
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'queryCatalog'
            }
        });
    }

    function renderProductStatusCombo() {
        var options = [];

        var $defaultOption = $('<option>');
        $defaultOption.text(bxMsg('Z_All'));
        $defaultOption.val('');

        options.push($defaultOption);

        $.each(codeArrayObj['ProductStatusCode'],function(index, option){
            var $option = $('<option>');
            $option.val(option.code);
            $option.text(option.name);
            options.push($option);
        });

        $('.product-status-combo').html(options);
    }

    function renderProductTypeCombo(id) {

        if(!id || id==''){
            var options = [];

            var $defaultOption = $('<option>');
            $defaultOption.text(bxMsg('Z_All'));
            $defaultOption.val('');

            options.push($defaultOption);

            $('.product-type-combo').html(options);
            return;
        }

        var requestParam = {
            idType: '04',
            treeType: 'PD',
            id: id,
            tntInstId: $('.product-factory-header', parent.document).find('.pf-multi-entity').val(),
            pdInfoDscd: $('.pd-info-dscd').val()
        };

        PFRequest.get('/catalog/getCatalog.json', requestParam, {
            success: function(responseData) {
                var options = [];

                var $defaultOption = $('<option>');
                $defaultOption.text(bxMsg('Z_All'));
                $defaultOption.val('');

                options.push($defaultOption);

                if (responseData.childCatalogs) {
                    responseData.childCatalogs.forEach(function(el) {
                        var $option = $('<option>');

                        $option.val(el.id.split('.')[1]);
                        $option.text(el.name);

                        options.push($option);
                    });
                }

                $('.product-type-combo').html(options);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'queryCatalog'
            }
        });
    }

    function renderProductInfo() {
        $el.find('.pf-ps-info-wrap').addClass('active');

        PFUI.use(['pfui/tab'],function(Tab) {
            productTab = new Tab.TabPanel({
                render : '.pf-ps-info',
                elCls : 'nav-tabs',
                panelTpl: '<div class="pf-ps-tab-container {id}"></div>',
                autoRender: true,
                children: [],
                defaultChildCfg : {
                    closeable : true,
                    closeTpl : '<i class="icon icon-remove"></i>'
                }
            });

        });
    }

    function renderProductTab(item, reloadYn) {
        var conditionList, productAdditionInfoList, productAliasNameList, productBase, productBranchRelationList, productChannelRelationList,
            productDocumentRelationList, productRelationList, pdClassificationList, productEmployeeRelationList, serviceRelationList, pirtBenefitRuleMasterVO;

        var requestParam;

        if(reloadYn){
            requestParam = item;
        }else{
            requestParam = {
                businessDistinctionCode: item.firstCatalogId,
                productTypeCode: item.secondCatalogId,
                productTemplateCode: item.productTemplateCode,
                productCode: item.code,
                pdInfoDscd: item.pdInfoDscd,
                tntInstId : item.tntInstId
            };
        }

        var selectedItem = productTab.getItem(requestParam.tntInstId + requestParam.productCode);
        if (!reloadYn && selectedItem) {
            productTab.setSelected(selectedItem);

            return;
        }

        if (!reloadYn && productTab.getItemCount() > 4) {
            PFComponent.showMessage(bxMsg('5-max-tab'), 'warning');

            return;
        }

        productBaseObj[requestParam.tntInstId + requestParam.productCode] = requestParam;
        var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

        PFRequest.get('/product/queryProductAllInfo.json', requestParam, {
            success: function(responseData) {

                productBase = responseData.productBase;
                productDocumentRelationList = responseData.productDocumentRelationList;
                productBranchRelationList = responseData.productBranchRelationList;
                productChannelRelationList = responseData.productChannelRelationList;
                productAliasNameList = responseData.productAliasNameList;
                productAdditionInfoList = responseData.productAdditionInfoList;
                productRelationList = responseData.productRelationList;
                pdClassificationList = responseData.classificationInformationRelationWrapVO;
                productEmployeeRelationList = responseData.productEmployeeRelationList;
                serviceRelationList = responseData.serviceRelationList;
                conditionList = responseData.conditionList;
                pirtBenefitRuleMasterVO = responseData.pirtBenefitRuleMasterVO;
                pdRelationInfoWrapList = responseData.pdRelationInfoWrapList;
                productIntRtStrctrRelationList =  responseData.pdInterestRateStructureRelationVO; // 금리체계

                if (reloadYn) {
                    $('.'+requestParam.tntInstId + requestParam.productCode+' .pf-ps-info-panel').children().not('.fiexed').remove();
                } else{
                    var addedTab = productTab.addChild({
                        title: item.name,
                        panelContent: productTabTal(productBase),
                        id: requestParam.tntInstId + requestParam.productCode,
                        panelCls: requestParam.tntInstId + requestParam.productCode
                    });
                    productTab.setSelected(addedTab);
                    PFUtil.getAllDatePicker(true, $el.find('.'+requestParam.tntInstId + requestParam.productCode+' .pf-ps-info-panel'));
                }

                $el.find('.' + requestParam.tntInstId + requestParam.productCode + ' .product-base-info-mgmt-status').text('[' + productBase.productStatus + '] '+ codeMapObj.ProductStatusCode[productBase.productStatus]);
                $el.find('.' + requestParam.tntInstId + requestParam.productCode + ' .product-base-info-firstCatalogId').text(codeMapObj.ProductCategoryLevelOneCode[productBase.firstCatalogId]);
                $el.find('.' + requestParam.tntInstId + requestParam.productCode + ' .product-base-info-distinctionCode').text('[' + productBase.productTypeDistinctionCode + '] '+ codeMapObj.ProductTypeDistinctionCode[productBase.productTypeDistinctionCode]);

                if (productBase.isCompositeProduct == 'Y') {
                    $el.find('.' + requestParam.tntInstId + requestParam.productCode + ' .packageYn-check').prop('checked', true);
                    $el.find('.' + requestParam.tntInstId + requestParam.productCode + ' .pf-base-package-grid-wrap').show();
                    renderPackageGrid(productBase, requestParam.tntInstId + requestParam.productCode);
                }

                setOffset('.' + requestParam.tntInstId + requestParam.productCode + ' .pf-ps-info-panel');
                var nodes = [{id : '1', text : bxMsg('baseInfo')}],
                    children = [];

                if (productDocumentRelationList && productDocumentRelationList.voList && productDocumentRelationList.voList.length > 0) {
                    children.push({id : '2-3', text : bxMsg('documentRelationTitle')});        // 문서관계
                    renderRelDocumentGrid(productDocumentRelationList, requestParam.tntInstId + requestParam.productCode);
                }
                if (productRelationList && productRelationList.voList && productRelationList.voList.length > 0){
                    children.push({id : '2-4', text : bxMsg('DPM10002Sring3')});
                    renderRelProductGrid(productRelationList, requestParam.tntInstId + requestParam.productCode);
                }
                if(productBranchRelationList && productBranchRelationList.voList && productBranchRelationList.voList.length > 0) {
                    children.push({id : '2-5', text : bxMsg('DPM10002Sring4')});
                    renderRelBranchGrid(productBranchRelationList, requestParam.tntInstId + requestParam.productCode);
                }
                if(productChannelRelationList && productChannelRelationList.voList && productChannelRelationList.voList.length > 0) {
                    children.push({id : '2-6', text : bxMsg('DPM10002Sring12')});
                    renderRelChannelGrid(productChannelRelationList, requestParam.tntInstId + requestParam.productCode);
                }
                if(productAliasNameList && productAliasNameList.voList && productAliasNameList.voList.length > 0) {
                    children.push({id : '2-7', text : bxMsg('DPS0106String3')});
                    children.push({id : '2-7', text : bxMsg('DPS0106String3')});
                    renderRelNameGrid(productAliasNameList, requestParam.tntInstId + requestParam.productCode);
                }
                if(productAdditionInfoList && productAdditionInfoList.voList && productAdditionInfoList.voList.length > 0) {
                    children.push({id : '2-8', text : bxMsg('DPS0115String2')});
                    renderRelEtcGrid(productAdditionInfoList, requestParam.tntInstId + requestParam.productCode);
                }
                if(pdClassificationList && pdClassificationList.voList && pdClassificationList.voList.length > 0) {
                    children.push({id : '2-9', text : bxMsg('DPM10002Sring10')});
                    renderRelClGrid(pdClassificationList, requestParam.tntInstId + requestParam.productCode);  // 상품분류
                }
                if(productEmployeeRelationList && productEmployeeRelationList.voList && productEmployeeRelationList.voList.length > 0) {
                    children.push({id : '2-10', text : bxMsg('relationEmployee')});
                    renderRelEmployeeGrid(productEmployeeRelationList, requestParam.tntInstId + requestParam.productCode);  // 관련직원
                }
                if(serviceRelationList && serviceRelationList.voList && serviceRelationList.voList.length > 0) {
                    children.push({id : '2-12', text : bxMsg('RelationService')});
                    renderRelServiceGrid(serviceRelationList, requestParam.tntInstId + requestParam.productCode);    // 관련서비스
                }
                if(productIntRtStrctrRelationList && productIntRtStrctrRelationList.voList && productIntRtStrctrRelationList.voList.length > 0) {
                	children.push({id : '2-11', text : bxMsg('intRtStrctr')});
                	renderRelIntRtStrctr(productIntRtStrctrRelationList, requestParam.tntInstId + requestParam.productCode);    // 금리체계
                }

                if(pdRelationInfoWrapList && pdRelationInfoWrapList.length>0){
                	pdRelationInfoWrapList.forEach(function(el, index){

                		if(!el.productRelationInformationVO.voList || el.productRelationInformationVO.voList.length == 0){
                			return;
                		}

                		children.push({id : '2-'+el.pdRelationConfigurationItemVO.relTpCd, text : el.pdRelationConfigurationItemVO.relTpNm});
                		renderProductRelConfiGrid(requestParam.tntInstId + requestParam.productCode, el.pdRelationConfigurationItemVO,el.productRelationInformationVO);
                	});
                }

                if(children.length > 0) {
                    nodes.push({id: '2', text: bxMsg('relationInfo'), expanded: true, children: children});
                }

                renderMenu(requestParam, nodes);
                renderConditionPage(conditionList, requestParam.tntInstId + requestParam.productCode, pirtBenefitRuleMasterVO);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdService',
                operation: 'queryPdAllInfo'
            }
        });

        function renderMenu(requestParam, nodes) {

            $('.'+requestParam.tntInstId + requestParam.productCode+' .pf-ps-info-list-wrap').empty();

            PFUI.use('pfui/tree',function(Tree){
                var menu = new Tree.TreeList({
                    render : '.'+requestParam.tntInstId + requestParam.productCode+' .pf-ps-info-list-wrap',
                    elCls: 'pf-ps-menu-list',
                    dirCls: '',
                    leafCls: '',
                    nodes : nodes
                });
                menu.render();
                menu.setSelection(menu.getItemAt(0));
                menu.on('itemdblclick', function(ev) {
                    scrollMove('menu'+ev.item.id, requestParam.tntInstId + requestParam.productCode);
                });
            });

            var param = {
                businessDistinctionCode: requestParam.businessDistinctionCode,
                productTypeCode: requestParam.productTypeCode,
                productTemplateCode: requestParam.productTemplateCode,
                code: requestParam.productCode,
                pdInfoDscd: requestParam.pdInfoDscd,
                baseDate : requestParam.baseDate
            };

            var tntInstId = requestParam.tntInstId; // $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
            var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

            PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

                if(g_serviceType == g_bxmService){

                    param.tntInstId = tntInstId;
                    param.commonHeader = {
                        loginTntInstId: getLoginTntInstId()
                    };

                    var params = {
                        header: {
                            application: 'PF_Factory',
                            service: 'PdCndService',
                            operation: 'queryListPdCnd'
                        },
                        input: param
                    };

                    store = new Data.TreeStore({
                        autoLoad: false,
                        url: '/serviceEndpoint/json/request.json',
                        dataProperty: 'responseMessage',
                        proxy : {
                            method : 'POST',
                            ajaxOptions : {
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify(params)
                            },
                            dataType : 'json'
                        }
                    });

                }else {

                    var store = new Data.TreeStore({
                        autoLoad: false,
                        url: '/product_condition/getListProductCondition.json?tntInstId=' + tntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}',
                        dataProperty: 'responseMessage'
                    });
                }
                store.on('beforeprocessload', function (ev) {

                    if(ev.data.ModelMap){
                        ev.data.responseMessage = ev.data.ModelMap.responseMessage;
                        delete ev.data.ModelMap.responseMessage;
                    }

                    var data = [];

                    ev.data.responseMessage.forEach(function(el, index){

                        var item;
                        var children = [];

                        if(!el.children) {
                            return;
                        }

                        el.children.forEach(function (cnd, i) {
                            if (!cnd.isValueNull) {
                                children.push(cnd);
                            }
                        });

                        if(children.length > 0){
                            item = el;
                            item.children = children;
                        }

                        if(item && item.id == 'PIRT'){    // (조건군템플릿유형코드 = 02.우대금리)
                            item.text = bxMsg('DPS0121_5String1');

                            if(item.children) {

                                // 우대금리적용규칙
                                item.children.unshift({
                                    id: 'IZZZ',
                                    text: bxMsg('pirtApplyRule')
                                });
                            }
                        }

                        if(item) {
                        	if(item.text.indexOf('*') >= 0){
                        		item.text =  item.text.substring(0, item.text.length-1) + '<span style="color:red;vertical-align: middle;"> *</span>';
                        	}
                        	data.push(item);
                        }
                    })

                    ev.data.responseMessage = data;
                });

                if(g_serviceType == g_bxmService){
                    store.load();
                }else {
                    store.load(param);
                }

                var tree = new Tree.TreeList({
                    render: '.'+ requestParam.tntInstId + requestParam.productCode+' .pf-ps-info-list-wrap',
                    elCls: 'pf-ps-condition-menu-list',
                    store : store
                });

                tree.render();

                tree.on('itemdblclick', function (ev) {
                    scrollMove('condition-'+ev.item.id, requestParam.tntInstId + requestParam.productCode);
                });

            });
        }

        function renderPackageGrid(productBase, productCode) {
            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'relationInformationStatus',
                    'relatedProductCode','relatedProductName','isPackageMandatoryProduct',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-package-grid',
                    columns: [
                        {text: bxMsg('DPS0101String17'), flex: 1.5,  align: 'center', sortable: false, dataIndex: 'relatedProductCode'},
                        {text: bxMsg('DPM10002Sring7'), flex: 1,  align: 'center', sortable: false, dataIndex: 'relatedProductName'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'},
                        {text: bxMsg('DPS0101String14'),  align: 'center', width: 80, sortable: false,  dataIndex: 'isPackageMandatoryProduct',
                            renderer: function(value) {
                                return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
                            }}
                    ]
                }
            });

            clickEventForGrid.setData(productBase.productRelationVO.voList);
        }

        function renderRelDocumentGrid(productDocumentRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-3');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'pdDocumentDistinctionCode', 'documentId', 'isMandatory', 'documentContent',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-info-grid',
                    columns: [
                        {text: bxMsg('DPS0104String1'), width: 80, dataIndex: 'pdDocumentDistinctionCode',  align: 'center', sortable: false
                         , renderer:function(value){
                            return codeMapObj.ProductDocumentTypeCode[value];
                        }},
                        {text: bxMsg('DocumentId'), flex: 1, dataIndex: 'documentId',  align: 'center', sortable: false},   // 문서ID
                        {text: bxMsg('DPS0104String4'), width: 70, dataIndex: 'isMandatory',  align: 'center', sortable: false,
                            renderer: function(value) {
                                return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
                        }},
                        {text: bxMsg('DPS0104String9'), width: 180, dataIndex: 'documentContent',  align: 'center', sortable: false},
                        {text: bxMsg('DPP0127String6'), width: 140,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), width: 140,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productDocumentRelationList.voList);
        }

        function renderRelProductGrid(productRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relProductInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-4');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'relationInformationStatus','relatedProductCode','relatedProductName',
                    'applyStart', 'applyEnd', 'relationPdInfoDscd', 'betweenProductRelation',
                    {
                        name: 'betweenProductRelationName',
                        convert: function(newValue, record){
                            return codeMapObj.ProductRelationTypeCode[record.get('betweenProductRelation')];
                        }
                    }
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-product-grid',
                    columns: [
                        {text: bxMsg('DPP0109String1'), flex:1, align: 'center', sortable: false, dataIndex: 'betweenProductRelationName'},
                        {text: bxMsg('DPS0101String17') , flex: 1, align: 'center', sortable: false, dataIndex: 'relatedProductCode'},
                        {text:  bxMsg('DPM10002Sring7') , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductName'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productRelationList.voList ? productRelationList.voList : []);
        }

        function renderRelBranchGrid(productBranchRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relBranchInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-5');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'relationInformationStatus', 'branchRelationType','branchCode',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-branch-grid',
                    columns: [
                        {text: bxMsg('DPP0109String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'branchRelationType',
                            renderer: function(value) {
                                return codeMapObj.ProductBranchRelationTypeCode[value];
                            }
                        },
                        {text: bxMsg('DPP0109String3'), flex: 1,  align: 'center', sortable: false, dataIndex: 'branchCode'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productBranchRelationList.voList);
        }

        function renderRelChannelGrid(productChannelRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relChannelInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-6');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code','productChannelRelation', 'productChannelCode', 'relationInformationStatus',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-channel-grid',
                    columns: [
                        {text: bxMsg('DPP0109String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'productChannelRelation'},
                        {text: bxMsg('DPS0109String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'productChannelCode'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productChannelRelationList.voList);
        }

        function renderRelNameGrid(productAliasNameList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relNameInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-7');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'languageCode', 'productAliasName','productAliasNameType','relationInformationStatus',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-name-grid',
                    columns: [
                        {text: bxMsg('DPS0113String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'productAliasNameType'
                            , renderer:function(value){
                                return codeMapObj.ProductAliasNameTypeCode[value];
                        }},
                        {text: bxMsg('DPS0113String2'), flex: 1,  align: 'center', sortable: false, dataIndex: 'languageCode'
                            , renderer:function(value){
                            return codeMapObj.LanguageCode[value];
                        }},
                        {text: bxMsg('DPS0113String3'), flex: 1, dataIndex: 'productAliasName', align: 'center', sortable: false},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productAliasNameList.voList);
        }

        // 부가정보
        function renderRelEtcGrid(productAdditionInfoList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relEtcInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-8');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code','relationInformationStatus','additionalInformationType','additionalInformationContent',
                    'applyStart', 'applyEnd'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-etc-grid',
                    columns: [
                        {text: bxMsg('DPP0116String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'additionalInformationType'
                            , renderer:function(value){
                            return codeMapObj.ProductAdditionalInfoTypeCode[value];
                        }},
                        {text: bxMsg('DPP0116String3'), flex: 1, dataIndex: 'additionalInformationContent', align: 'center', sortable: false},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productAdditionInfoList.voList);
        }

        // 상품분류
        function renderRelClGrid(pdClassificationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relClInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-9');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'classificationCode','classificationStructureDistinctionCode','classificationStructureName','navigation',
                    'applyStartDate', 'applyEndDate'
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-cl-grid',
                    columns: [
                        {text: bxMsg('ClassificationName'), flex: 1,  align: 'center', sortable: false, dataIndex: 'classificationStructureName'},
                        {text: bxMsg('Subclassification'), flex: 2,  align: 'left', style : 'text-align:center', sortable: false, dataIndex: 'navigation'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStartDate'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEndDate'}
                    ]
                }
            });

            clickEventForGrid.setData(pdClassificationList.voList);
        }


        function renderRelEmployeeGrid(productEmployeeRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relEmployeeInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-10');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'employeeRelationType','employeeId','employeeName','applyStart','applyEnd',  'code', 'relationInformationStatus',
                    {
                        name: 'employeeRelationTypeName',
                        convert: function(newValue, record){
                            return codeMapObj.ProductEmployeeRelationTypeCode[record.get('employeeRelationType')];
                        }
                    }
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-employee-grid',
                    columns: [

                        {text: bxMsg('employeeNumber'), flex: 1, dataIndex: 'employeeId', sortable: false, align: 'center'},
                        {text: bxMsg('employeeName'), flex: 1, dataIndex: 'employeeName', sortable: false, align: 'center'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(productEmployeeRelationList.voList ? productEmployeeRelationList.voList : []);
        }

        // 관련서비스
        function renderRelServiceGrid(serviceRelationList, productCode) {
            $el.find('.'+productCode+' .pf-ps-info-panel').append(relServiceInfoGridTpl());
            setOffset('.'+productCode+ ' .menu2-12');

            var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: [
                    'code', 'relationInformationStatus','relatedProductCode','relatedProductName',
                    'applyStart', 'applyEnd', 'relationPdInfoDscd', 'betweenProductRelation',
                    {
                        name: 'betweenProductRelationName',
                        convert: function(newValue, record){
                            return codeMapObj.ServiceRelationTypeCode[record.get('betweenProductRelation')];
                        }
                    }
                ],
                gridConfig: {
                    renderTo: '.'+productCode+' .pf-base-rel-service-grid',
                    columns: [
                        {text: bxMsg('DPP0109String1'), flex:1, align: 'center', sortable: false, dataIndex: 'betweenProductRelationName'},
                        {text: bxMsg('ServiceCode') , flex: 1, align: 'center', sortable: false, dataIndex: 'relatedProductCode'},
                        {text: bxMsg('ServiceName') , width: 100, align: 'center', sortable: false, dataIndex: 'relatedProductName'},
                        {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                        {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                    ]
                }
            });

            clickEventForGrid.setData(serviceRelationList.voList ? serviceRelationList.voList : []);
        }
        
        // 금리체계
        function renderRelIntRtStrctr(productIntRtStrctrRelationList, productCode) {
        	$el.find('.'+productCode+' .pf-ps-info-panel').append(relIntRtStrctrInfoGridTpl());
        	setOffset('.'+productCode+ ' .menu2-11');
        	
        	var clickEventForGrid = PFComponent.makeExtJSGrid({
        		fields: [
        			"tntInstId","pdInfoDscd","applyStartDate","applyEndDate", "intRtStructureCode", "intRtStructureName", "intRtStructureContent"
                    ,"bizDscd", "bizDscdName", "productTypeCode", {
                        name:"productTypeName",
                        convert: function(newValue, record){
                            if(record.get('productTypeCode') == '*'){
                                return bxMsg('Z_All');
                            }else{
                                return newValue;
                            }
                        }
                    }, "productTemplateCode", {
                        name: "productTemplateName",
                        convert: function(newValue, record){
                            if(record.get('productTemplateCode') == '*'){
                                return bxMsg('Z_All');
                            }else{
                                return newValue;
                            }
                        }
                    }
                    ,"productCode", {
                        name: "productName",
                        convert: function(newValue, record){
                            if(record.get('productCode') == '*'){
                                return bxMsg('Z_All');
                            }else{
                                return newValue;
                            }
                        }
                    }, "intRtStructureCode", "relationInformationStatus", 'process'
        			],
        			gridConfig: {
        				renderTo: '.'+productCode+' .pf-base-rel-int-rt-strctr-grid',
        				columns: [
        					// 업무구분
                            {text: bxMsg('DPS0101String10'),  width:70, dataIndex: 'bizDscd', style: 'text-align:center',
                                renderer: function(value) {
                                    return codeMapObj.ProductCategoryLevelOneCode[value] || value;
                                },
                                editor: {
                                    xtype: 'combo',
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    displayField: 'name',
                                    valueField: 'code',
                                    editable: false,
                                    store: new Ext.data.Store({
                                        fields: ['code', 'name'],
                                        data: codeArrayObj['ProductCategoryLevelOneCode']
                                    })
                                }
                            },
        					// 금리체계명
        					{text: bxMsg('intRtStrctrName') , flex: 1, align: 'center', sortable: false, dataIndex: 'intRtStructureName'},
        					// 공식내용
        					{text: bxMsg('formulaCntnt') , width: 100, align: 'center', sortable: false, dataIndex: 'intRtStructureContent'},
        					// 적용시작일
        					{text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStartDate'},
        					// 적용종료일
        					{text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEndDate'}
        					]
        			}
        	});
        	
        	clickEventForGrid.setData(productIntRtStrctrRelationList.voList ? productIntRtStrctrRelationList.voList : []);
        }

        // 설정 그리드 관계
        function renderProductRelConfiGrid(productCode, configData, relInfoData){

        	$el.find('.'+productCode+' .pf-ps-info-panel').append(relConfigGridTpl());
        	$el.find('.'+productCode+' .pf-ps-info-panel').find('.pf-panel-header').last().find('.pf-panel-title').text(configData.relTpNm);
        	$el.find('.'+productCode+' .pf-ps-info-panel').find('.pf-panel-body').last().addClass('menu2-'+configData.relTpCd);
            setOffset('.'+productCode+ ' .menu2-'+configData.relTpCd);

        	var fieldList = configData.fieldList;

        	var fields = [
                'code', 'relationInformationStatus', 'pdTgtRelCd','tgtCd', 'relCntnt',
                'applyStart', 'applyEnd', 'process',
                {
                    name: 'relTpCd',
                    convert: function(newValue, record) {
                        return configData.relTpCd;
                    }
                }
            ];

        	var columns = [];
        	
        	// 20180205 - 잘못된 데이터가 존재하는 케이스가있음 (configData.fieldList) 데이터가 없음
        	if(configData.fieldList) {
        		addColumns(columns, configData.fieldList);
        	}

        	columns.push({
                text : bxMsg('DPS0101String6'),
                width : 100,
                align: 'center',
                dataIndex : 'relationInformationStatus',
                renderer : function(value){
                    return codeMapObj['ProductStatusCode'][value];
                }
            });    // 상태 getStatusOfGrid('pdRelStsCd')
    		columns.push({
    	        text: bxMsg('DPP0127String6'), width:150, sortable: false, dataIndex: 'applyStart', align: 'center',
    	        listeners: {
    	            click: function() {
    	                selectedCellIndex = $(arguments[1]).parent().index();
    	            }
    	        }
    	    });	// getAppyDateCellOfGrid('applyStart')
    		columns.push({
    	        text: bxMsg('DPP0127String7'), width:150, sortable: false, dataIndex: 'applyEnd', align: 'center',
    	        listeners: {
    	            click: function() {
    	                selectedCellIndex = $(arguments[1]).parent().index();
    	            }
    	        }
    	    });	// getAppyDateCellOfGrid('applyEnd')

    		var gridListener = {
    	        cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

    	        }
    	    };

    		var clickEventForGrid = PFComponent.makeExtJSGrid({
                fields: fields,
                gridConfig: {
                    renderTo: '.'+productCode+' .menu2-'+configData.relTpCd+' .pf-base-rel-config-grid',
                    columns: columns
                }
            });

    		clickEventForGrid.setData(relInfoData.voList ? relInfoData.voList : []);


            function addColumns(columns, fieldList){

            	// 순서를 유지하기 위함.
            	var pdTgtRelCdColumn = $.grep(fieldList, function(el){
            		return el.field == 'pd_tgt_rel_cd';
            	});
            	if(pdTgtRelCdColumn.length>0){
            		addColumn(columns, pdTgtRelCdColumn[0]);
            	};

            	var tgtCdColumn = $.grep(fieldList, function(el){
            		return el.field == 'tgt_cd';
            	});
            	if(tgtCdColumn.length>0){
            		addColumn(columns, tgtCdColumn[0]);
            	};

            	var relCntntColumn = $.grep(fieldList, function(el){
            		return el.field == 'rel_cntnt';
            	});
            	if(relCntntColumn.length>0){
            		addColumn(columns, relCntntColumn[0]);
            	};
        	}

        	function addColumn(columns, el){

        		el.field = el.field.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });

        		if(el.dmnCd != null && el.dmnCd != ''){
        			columns.push( { 	//makeComboOfRelGrid(el.fieldNm, 'flex', 1, el.field, el.dmnNm)
				        text: el.fieldNm, flex: 1, dataIndex:el.field, align: 'center', sortable: false,
				        renderer: function(value) {
				            return codeMapObj[el.dmnNm][value];
				        },
				        editor: {
				            xtype: 'combo',
				            typeAhead: true,
				            triggerAction: 'all',
				            displayField: 'name',
				            valueField: 'code',
				            editable: false,
				            store: new Ext.data.Store({
				                fields: ['name', 'code'],
				                data: codeArrayObj[el.dmnNm]
				            }),
				            listeners: {
				                'change': function(_this, newValue, oldValue, eOpts) {
				                    modifyFlag = true;
				                }
				            }
				        }
				    });
        		}else{
        			columns.push({text: el.fieldNm, flex: 1, dataIndex: el.field, sortable: false, align: 'center', editor:{}});
        		}

        	};
        }


        function renderConditionPage(conditionList, productCode, pirtBenefitRuleMasterVO) {
            var tplMap = {
                '01': conditionType1Tpl,
                '02': conditionType2Tpl,
                '03': conditionType3Tpl,
                '04': conditionType4_1Tpl
            };

            // 우대금리적용규칙
            var pirtFlag = true;    // 우대금리적용규칙을 최초 한번만 그리기 위함
            var pirtList = [];      // 우대금리목록
            var pirtGrid;
            var addClassIndex = 0; // 수수료가 2개이상일경우 수수료유형(라디오버튼)의 값이 가장 마지막 수수료조건에만 적용되는 현상을 막기 위함
            conditionList.forEach(function(el) {
                var data = el,
                    conditionClass = 'condition-'+el.id;

                // 조건값이 없으면 화면에 보이지 않음.
                if (data.isValueNull) {
                    return true;        // continue;
                }

                if(pirtFlag && data.conditionDetailTypeCode == '11'){
                    pirtFlag = false;
                    var pirtClass = 'condition-IZZZ';

                    $el.find('.'+productCode+' .pf-ps-info-panel').append(pirtRuleTpl(pirtBenefitRuleMasterVO));
                    $el.find('.'+productCode+' .pf-ps-info-panel').find('.pf-panel-body').last().addClass(pirtClass);
                    setOffset('.'+productCode+' .' + pirtClass);

                    pirtGrid = renderPirtGrid(pirtClass, productCode);
                }

                // 우대금리목록에 추가
                if(data.conditionDetailTypeCode == '11'){
                    pirtList.push(data);
                }

                data.conditionTypeCodeNm         = data.conditionTypeCode               ? '[' + data.conditionTypeCode              + '] ' + codeMapObj['ProductConditionTypeCode'][data.conditionTypeCode] : '';
                data.statusNm                    = data.status                          ? '[' + data.status                         + '] ' + codeMapObj['ProductStatusCode'][data.status] : '';
                data.conditionAgreeLevelNm       = data.conditionAgreeLevel             ? '[' + data.conditionAgreeLevel            + '] ' + codeMapObj['ProductConditionAgreeLevelCode'][data.conditionAgreeLevel] : '';
                data.conditionClassifyCodeNm     = data.conditionClassifyCode           ? '[' + data.conditionClassifyCode          + '] ' + codeMapObj['ProductConditionClassifyCode'][data.conditionClassifyCode] : '';
                data.layerCalcTypeNm             = data.layerCalcType                   ? '[' + data.layerCalcType                  + '] ' + codeMapObj['TierAplyCalcnWayCodeCode'][data.layerCalcType] : '';
                data.intRtAplyBaseDayCdNm        = data.intRtAplyBaseDayCd              ? '[' + data.intRtAplyBaseDayCd             + '] ' + codeMapObj['IntRtAplyBaseDayCode'][data.intRtAplyBaseDayCd] : '';
                data.settleTypeNm                = data.settleType                      ? '[' + data.settleType                     + '] ' + codeMapObj['FeeSettleTypeCode'][data.settleType] : '';
                data.calcBasicNm                 = data.calcBasic                       ? '[' + data.calcBasic                      + '] ' + codeMapObj['FeeCalculateBasicTypeCode'][data.calcBasic] : '';
                data.conditionValueAplyWayCodeNm = data.ConditionValueApplyWayCodeCode  ? '[' + data.ConditionValueApplyWayCodeCode + '] ' + codeMapObj['ConditionValueApplyWayCodeCode'][data.conditionValueAplyWayCode] : '';

                $el.find('.'+productCode+' .pf-ps-info-panel').append(tplMap[data.conditionTypeCode](data));
                $el.find('.'+productCode+' .pf-ps-info-panel').find('.pf-panel-body').last().addClass(conditionClass);
                setOffset('.'+productCode+' .'+conditionClass);

                var $conditionInfoWrap = $el.find('.'+productCode+' .'+conditionClass);

                //if (data.isValueNull) {
                //    return true;        // continue;
                //    $conditionInfoWrap.find('.isValueNull').prop('checked', true);
                //    $conditionInfoWrap.find('.isValueNull-hidden').addClass('active');
                //    $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                //} else {
                    if (data.isMandatory) {
                        $conditionInfoWrap.find('.isMandatory').prop('checked', true);
                    }

                    if (data.conditionClassifyCode == '01') {
                        $conditionInfoWrap.find('.condition-value').addClass('active');

                        //01: 목록형, 02: 범위형, 03: 금리형, 04: 수수료형
                        switch (data.conditionTypeCode) {
                            case '01' :
                                renderCndValueType1Grid(data.listConditionValue.defineValues, '', conditionClass, productCode);

                                break;
                            case '02' :
                                data.rangeConditionValue.productMeasurementUnitNm = data.rangeConditionValue.productMeasurementUnit  ? '[' + data.rangeConditionValue.productMeasurementUnit + '] ' + codeMapObj['ProductMeasurementUnitCode'][data.rangeConditionValue.productMeasurementUnit] : '';
                                $conditionInfoWrap.find('.condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

                                if (data.rangeConditionValue.isSystemMaxValue == true) {
                                    $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                                }

                                if (data.rangeConditionValue.isSingleValue) {
                                    $conditionInfoWrap.find('.isSingleValue-hide').hide();
                                } else {
                                    $conditionInfoWrap.find('.isNotSingleValue-hide').hide();
                                }

                                if (data.conditionDetailTypeCode == '01') {
                                    $conditionInfoWrap.find('.detail-type01-hide').hide();
                                } else {
                                    $conditionInfoWrap.find('.detail-except-type01-hide').hide();

                                    if (data.conditionDetailTypeCode == '05') {
                                        $conditionInfoWrap.find('input').find('.isSystemMaxValue').prop('checked', false);
                                    }
                                }

                                break;
                            case '03' :
                                data.interestConditionValue.frctnAplyWayCdNm = data.interestConditionValue.frctnAplyWayCd ? '[' + data.interestConditionValue.frctnAplyWayCd + '] ' + codeMapObj['FrctnAplyWayCode'][data.interestConditionValue.frctnAplyWayCd] : '';
                                data.interestConditionValue.rateApplyWayCodeNm = data.interestConditionValue.rateApplyWayCode ? '[' + data.interestConditionValue.rateApplyWayCode + '] ' + codeMapObj['ProductConditionInterestApplyTypeCode'][data.interestConditionValue.rateApplyWayCode] : '';
                                data.interestConditionValue.typeNm = data.interestConditionValue.type ? '[' + data.interestConditionValue.type + '] ' + codeMapObj['InterestTypeCode'][data.interestConditionValue.type] : '';
                                //$conditionInfoWrap.find('.frctnAplyCnt').val(data.interestConditionValue.frctnAplyCnt);
                                $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                                var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');

                                if(!data.interestConditionValue.rateApplyWayCode == '01') {
                                    $cndValueType3Wrap.find('.condition-interest-apply-type-wrap').show();
                                } else {
                                    $cndValueType3Wrap.find('.condition-interest-apply-type-wrap').hide();
                                }

                                // 우대금리
                                if(data.conditionDetailTypeCode == '11'){
                                    if(data.providedCndBenefitRuleMasterVO) {
                                        data.providedCndBenefitRuleMasterVO.ruleStatusCodeNm = data.providedCndBenefitRuleMasterVO.ruleStatusCode ? '[' + data.providedCndBenefitRuleMasterVO.ruleStatusCode + '] ' + codeMapObj['ProductStatusCode'][data.providedCndBenefitRuleMasterVO.ruleStatusCode] : '';
                                    }
                                    $conditionInfoWrap.find('.provided-cnd-wrap').html(conditionType3ProvidedCndTpl(data.providedCndBenefitRuleMasterVO));
                                    renderProvidedCndGrid(data.providedCndVOList, conditionClass, productCode);
                                }
                                break;
                            case '04' :
                                data.feeConditionValue.rtMsurUnitCdNm = data.feeConditionValue.rtMsurUnitCd ? '[' + data.feeConditionValue.rtMsurUnitCd + '] ' + codeMapObj['ProductMeasurementUnitCode'][data.feeConditionValue.rtMsurUnitCd] : '';

                                $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(data.feeConditionValue));
                                $conditionInfoWrap.find('.condition-value').find('.cnd-value-04-amount-table').addClass('active');

                                if (data.feeConditionValue.isSystemMaxValue == true) {
                                    $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                                }

                                if (data.feeConditionValue.feeTpCd == '01') {
                                	$conditionInfoWrap.find('.charge-radio-rate').attr('name', $conditionInfoWrap.find('.charge-radio-rate').attr('name') + addClassIndex + "");
                                	$conditionInfoWrap.find('.charge-radio-rate').addClass(addClassIndex + "");
                                	$conditionInfoWrap.find('.charge-radio-rate.' + addClassIndex + "").prop('checked', true);
                                    $conditionInfoWrap.find('.cnd-value-04-amount-table').removeClass('active');
                                    $conditionInfoWrap.find('.cnd-value-04-rate-table').addClass('active');
                                } else {
                                	$conditionInfoWrap.find('.charge-radio-amount').attr('name', $conditionInfoWrap.find('.charge-radio-amount').attr('name') + addClassIndex + "");
                                	$conditionInfoWrap.find('.charge-radio-amount').addClass(addClassIndex + "");
                                    $conditionInfoWrap.find('.charge-radio-amount.' + addClassIndex + "").prop('checked', true);
                                    $conditionInfoWrap.find('.cnd-value-04-amount-table').addClass('active');
                                    $conditionInfoWrap.find('.cnd-value-04-rate-table').removeClass('active');
                                }

                                if(data.providedCndBenefitRuleMasterVO) {
                                    data.providedCndBenefitRuleMasterVO.ruleStatusCodeNm = data.providedCndBenefitRuleMasterVO.ruleStatusCode ? '[' + data.providedCndBenefitRuleMasterVO.ruleStatusCode + '] ' + codeMapObj['ProductStatusCode'][data.providedCndBenefitRuleMasterVO.ruleStatusCode] : '';
                                    data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCodeNm = data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode ? '[' + data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode + '] ' + codeMapObj['FeeTypeCode'][data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode] : '';
                                }
                                $conditionInfoWrap.find('.fee-discount-wrap').html(conditionType4FeeDiscountTpl(data.providedCndBenefitRuleMasterVO));

                                if(data.providedCndBenefitRuleMasterVO) {
                                    if (data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode == '01') {
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-amt').hide();
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-rt').show();
                                    } else if (data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode == '02') {
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-amt').show();
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-rt').hide();
                                    }
                                }

                                renderFeeDiscountGrid(data.feeDiscountVOList, conditionClass, productCode, requestParam.tntInstId);
                                break;
                        }

                    } else if (data.conditionClassifyCode == '02') {
                        $conditionInfoWrap.find('.complex-grid-wrap').addClass('active');

                        renderComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix, data, conditionClass, productCode);
                    }

                    if (data.conditionTypeCode == '04') {
                        if (data.conditionValueAplyWayCode === '03') {
                            $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                        }
                    }
                //}
                    addClassIndex++;
            });

            if(pirtGrid) pirtGrid.setData(pirtList);
        }
    }

    function renderCndValueType1Grid(data, popup, conditionClass, thisClass) {
        var renderTo;

        if (popup) {
            renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
        } else {
            renderTo = '.'+thisClass+' .'+conditionClass+' .cnd-val-type1-grid';
        }

        var cndValueType1Grid = PFComponent.makeExtJSGrid({
            fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
            gridConfig: {
                renderTo: renderTo,
                columns: [
                    {text: bxMsg('DPS0121_21String3'), width: 120, dataIndex: 'isSelected', align:'center',
                        renderer: function(value) {
                            return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
                        }
                    },
                    {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                    {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                    {text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',  sortable: false, align: 'center', width: 120,
                        renderer: function(value) {
                            return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
                        }}
                ]
            }
        });

        cndValueType1Grid.setData(data);
    }

    function renderComplexGrid(title, data, condition, conditionClass, thisClass) {
        var fields = ['y'],
            columns = [{text: bxMsg('DPS0128String1'), xtype: 'rownumberer', width: 47, sortable: false, style : 'text-align:center'}],
            gridData = [];

        var titleDataArr = [];
        var titleDataObj = {};

        data.forEach(function(el) {
            var tempObj = {};

            el.x.forEach(function(xEl){
                var columnId = xEl.id;

                tempObj[columnId] = xEl;
            });

            tempObj['y'] = el.y;

            gridData.push(tempObj);
        });

        //title(즉, 컬럼 수) 만큼 필드와 컬럼 세팅 해줘야 함
        title.forEach(function(el) {
            var conditionCode = el.titleConditionCode,
                tempObj = {};

            tempObj['titleConditionCode'] = conditionCode;
            tempObj['titleConditionName'] = el.titleConditionName;
            tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

            //목록형
            if (el.titleConditionTypeCode == '01') {
                tempObj['defineValues'] = el.defineValues;

                var defineValuesObj = {};

                el.defineValues.forEach(function(el) {
                    defineValuesObj[el.code] = el.name;
                });

                fields.push(conditionCode, conditionCode+'.defineValues', {
                    name: conditionCode+'.code',
                    style: 'text-align:center',
                    convert: function(newValue, record) {
                        var code ;

                        if (newValue) {
                            code = newValue;

                            record.get(conditionCode)['listConditionValue'] = {};
                            record.get(conditionCode)['listConditionValue']['defineValues'] = [];
                            record.get(conditionCode)['listConditionValue']['defineValues'].push({
                                code: newValue,
                                name: defineValuesObj[newValue],
                                isSelected: true
                            });

                        } else if (record.get(conditionCode)['listConditionValue']) {
                            record.get(conditionCode)['listConditionValue']['defineValues'].forEach(function(el) {
                                if (el.isSelected) {
                                    code =  el.code;
                                }
                            })
                        } else {
                            code = '';
                        }

                        return code;
                    }
                });

                columns.push({header: el.titleConditionName + '('+ el.titleConditionCode +')',
                    width: 170, dataIndex: conditionCode+'.code',
                    style: 'text-align:center',
                    renderer: function(value) {
                        return defineValuesObj[value];
                    }});
            } else if (el.titleConditionTypeCode == '02') { //범위형
                tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
                tempObj['currencyValue'] = el.currencyValue;
                tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
                tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;

                fields.push(conditionCode, {
                    name: conditionCode+'.minValue',
                    style: 'text-align:center',
                    convert: function(newValue, record) {
                        var minValue ;
                        if (newValue) {
                            if (!record.get(conditionCode)['rangeConditionValue']) {
                                record.get(conditionCode)['rangeConditionValue'] = {};
                            }

                            minValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2, true);

                            record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                        }  else if (record.get(conditionCode)['rangeConditionValue']) {
                            minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];
                        } else {
                            if (!record.get(conditionCode)['rangeConditionValue']) {
                                record.get(conditionCode)['rangeConditionValue'] = {};
                            }

                            minValue = '0.00';

                            record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                        }

                        return minValue;
                    }
                }, {
                    name: conditionCode+'.maxValue',
                    style: 'text-align:center',
                    convert: function(newValue, record) {
                        var maxValue ;
                        if (newValue) {
                            if (!record.get(conditionCode)['rangeConditionValue']) {
                                record.get(conditionCode)['rangeConditionValue'] = {};
                            }

                            maxValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2, true);

                            record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                        }  else if (record.get(conditionCode)['rangeConditionValue']['maxValue']){
                            maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];
                        } else {
                            if (!record.get(conditionCode)['rangeConditionValue']) {
                                record.get(conditionCode)['rangeConditionValue'] = {};
                            }

                            maxValue = '0.00';

                            record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                        }

                        return maxValue;
                    }
                });

                var rangeHeader;

                if(el.titleConditionDetailTypeCode == '01') {
                    rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['CurrencyCode'][el.currencyValue] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
                } else {
                    rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
                }

                columns.push({
                    header: rangeHeader,
                    columns: [{
                        text: bxMsg('DPS0121_1String1'),
                        width: 120,
                        dataIndex: conditionCode + '.minValue',
                        style: 'text-align:center',
                        renderer: function(value, metadata, record) {
                            return PFValidation.gridFloatCheckRenderer(value, 19, 2);
                        }
                    }, {
                        text: bxMsg('DPS0121_1String2'),
                        width: 120,
                        dataIndex: conditionCode + '.maxValue',
                        style: 'text-align:center',
                        renderer: function(value, metadata, record) {
                            return PFValidation.gridFloatCheckRenderer(value, 19, 2);
                        }
                    }]
                });
            }

            titleDataArr.push(tempObj);
        });

        titleDataArr.forEach(function(el) {
            titleDataObj[el.titleConditionCode] = el;
        });

        var flex = 0,
            width = 0;

        if(titleDataArr.length >= 2) {
            flex = 0;
            width = 295;
        } else {
            flex = 1;
            width = 0;
        }

        columns.push({text: bxMsg('DPS0129String4'), style: 'text-align:center', flex : flex, width : width,  renderer: function(value, p, record) {
            var yTitle1 = '',
                yVal1 = '',
                yTitle2 = '',
                yVal2 = '';

            var extFormat;

            switch (condition.conditionTypeCode) {
                case '01':
                    if (record.get('y')) {
                        record.get('y')['defineValues'].forEach(function(el) {
                            if (el.isSelected) {
                                yTitle1 = yTitle1 + el.name + '，';
                            }
                        });
                    }

                    if(yTitle1 != '' && yTitle1.length > 0) {
                        yTitle1 = yTitle1.substring(0, yTitle1.length - 1);
                    }

                    extFormat = Ext.String.format('<p>{0}</p>', yTitle1);
                    break;
                case '02' :
                    if (record.get('y')) {
                        var defaultString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00',
                            minString = (record.get('y').minValue) ? record.get('y').minValue : '0.00',
                            maxString, baseString;

                        if (record.get('y').isSystemMaxValue) {
                            maxString = bxMsg('systemMax');
                        } else {
                            maxString = (record.get('y').maxValue) ? record.get('y').maxValue : '0.00';
                        }
                        baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';

                        if (condition.isSingleValue) {
                            yTitle1 = bxMsg('DPM100TabSring1') + ' : ';
                            yVal1 = defaultString;
                        } else {
                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minString + '~' + maxString + '(' + baseString  + ')';
                        }

                        if (condition.conditionDetailTypeCode == '01') {
                            yTitle2 = bxMsg('currencyCode') + ' : ';
                            yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                        } else {
                            yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';
                            yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                        }
                    }

                    extFormat = Ext.String.format('<p>{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                    break;
                case '03' :
                    if (record.get('y')) {
                        var minInString,
                            maxInString, base,
                            minSprdRtString, maxSprdRtString,
                            refPdCd, refPdNm,
                            refCndCd, refCndNm;

                        if (record.get('y').type == '01') {
                            minInString = (record.get('y').minInterestRate) ? record.get('y').minInterestRate : '';
                            maxInString = (record.get('y').maxInterestRate) ? record.get('y').maxInterestRate : '';
                            base = (record.get('y').rate) ? record.get('y').rate : '';

                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minInString + '~' + maxInString + '(' + base + ')';
                        } else if (record.get('y').type == '02') {
                            yTitle1 = bxMsg('DPS0121_33String5') + ' : ';
                            minSprdRtString = (record.get('y').minSprdRt) ? record.get('y').minSprdRt : '';
                            maxSprdRtString = (record.get('y').maxSprdRt) ? record.get('y').maxSprdRt : '';
                            yVal1 = minSprdRtString + '~' + maxSprdRtString;

                        } else if(record.get('y').type == '03') {
                            yTitle1 = bxMsg('DPS0121_34String1') + ' : ';
                            refPdCd = (record.get('y').refPdCd) ? record.get('y').refPdCd : '';
                            refPdNm = (record.get('y').refPdNm) ? record.get('y').refPdNm : '';
                            yVal1 = refPdCd;

                            yTitle2 = bxMsg('DPS0121_34String2') + ' : ';
                            refCndCd = (record.get('y').refCndCd) ? record.get('y').refCndCd : '';
                            refCndNm = (record.get('y').refCndNm) ? record.get('y').refCndNm : '';
                            yVal2 = refCndCd;
                        }

                        if (yVal2 == '0') {
                            yVal2 = '';
                        }
                    }

                    extFormat = Ext.String.format('<p>{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                    break;
                case '04' :
                    if (record.get('y')) {
                        var minFixFeeAmt, // 최소수수료
                            maxFixFeeAmt,  // 최대수수료
                            fixed, // 기본수수료
                            minRt, // 최소수수료율
                            maxRt, // 최대수수료율
                            rate; // 기본율
                        // 금액정보
                        if (record.get('y').feeTpCd == '02') {
                            minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                            maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                            fixed = (record.get('y').fixed) ? record.get('y').fixed : '0.00';

                            // 최소~최대(기본)
                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                        }
                        // 율정보
                        else if (record.get('y').feeTpCd == '01') {
                            minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                            maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                            rate = (record.get('y').rate) ? record.get('y').rate : '0.000000';

                            // 최소~최대(기본)
                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minRt + '~' + maxRt + '(' + rate + ') (%)';
                        }
                    }

                    extFormat = Ext.String.format('<p>{0}</br> {1}</p>', yTitle1, yVal1);
                    break;
            }

            return extFormat;
        }
        });

        var cndValComplexGrid = PFComponent.makeExtJSGrid({
            fields: fields,
            gridConfig: {
                renderTo: '.'+thisClass+' .'+conditionClass+' .complex-grid',
                columns: columns
            }

        });
        cndValComplexGrid.setData(gridData);
    }

    function renderProvidedCndGrid(data, conditionClass, thisClass){
        var renderTo = '.'+thisClass+' .'+conditionClass+' .provided-cnd-wrap .provided-cnd-grid';

        var cndValueType3ProvidedCndGrid = PFComponent.makeExtJSGrid({
            fields:['providedConditionCode','providedConditionName','process',
                'providedConditionStatusCode', 'applyStartDate',
                'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode',
                'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'currencyCode', 'cndDscd',
                'isAdditionalInfoExist','provideCndAdditionalInfoDetailList', 'providedConditionSequenceNumber',
                {
                    name: 'maxValue',
                    convert: function(newValue, record) {
                        if (newValue) {
                            return newValue;
                        } else {
                            if (!record || !newValue) {
                                var val = '0.00';
                            }
                            return val;
                        }
                    }
                },
                {
                    name: 'minValue',
                    convert: function(newValue, record) {
                        if (newValue) {
                            return newValue;
                        } else {
                            if (!record || !newValue) {
                                var val = '0.00';
                            }
                            return val;
                        }
                    }
                }
            ],
            gridConfig: {
                renderTo: renderTo,
                columns: [
                    {
                        text: bxMsg('DAS0101String11'),   // 일련번호
                        width: 60,
                        dataIndex: 'providedConditionSequenceNumber'
                    },
                    {
                        text: bxMsg('providedConditionCode'),   // 제공조건코드
                        width: 100,
                        dataIndex: 'providedConditionCode'
                    },
                    {
                        text: bxMsg('providedConditionName'),   // 제공조건명
                        width: 200,
                        dataIndex: 'providedConditionName'
                    },
                    {
                        text: bxMsg('DPP0127String6'), width: 160, dataIndex: 'applyStartDate'
                    },
                    {
                        text: bxMsg('DPP0127String7'), width: 160, dataIndex: 'applyEndDate'
                    },
                    {
                        text: bxMsg('providedConditionVal'),
                        width: 280,
                        renderer: function (value, p, record) {
                            var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                            var conditionTypeCode = record.get('providedConditionTypeCode');

                            if (conditionTypeCode == '01') {

                                if (record.get('productBenefitProvidedListConditionList')) {
                                    record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                        yVal = yVal + el.listCode + '，';
                                    });

                                    if (yVal != '' && yVal.length > 0) {
                                        yVal = yVal.substring(0, yVal.length - 1);
                                    }
                                }

                                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);
                            } else {
                                var minString, maxString;

                                minString = record.get('minValue');
                                maxString = record.get('maxValue');

                                yTitle1 = bxMsg('minAndMax') + ' : ';
                                yVal1 = minString + '~' + maxString;

                                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                            }

                            return extFormat;
                        }
                    },
                    {
                        text: bxMsg('DPM10002Sring8'),
                        width: 60,
                        dataIndex: 'isAdditionalInfoExist', // 부가정보존재여부
                        style: 'text-align:center',
                        align: 'center',
                        renderer: function(value) {
                            return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
                        }
                    }
                ],
                listeners: {
                    scope: this,
                    'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        // 부가정보 팝업 호출하도록
                        if(record.get('isAdditionalInfoExist') && cellIndex == 6){
                            PFPopup.selectAdditionalInfo({
                              data: record.getData(),
                              readOnly: true,
                            });
                        }
                    }
                }
            }
        });
        if(data && data.length>0) {
            cndValueType3ProvidedCndGrid.setData(data);
        }
    }

    function renderFeeDiscountGrid(data, conditionClass, thisClass, tntInstId){
        var renderTo = '.'+thisClass+' .'+conditionClass+' .fee-discount-wrap .fee-discount-grid';

        var cndType4FeeDiscountGrid = PFComponent.makeExtJSGrid({
            fields: ['feeDiscountSequenceNumber', 'applyStartDate','applyEndDate',
                'feeDiscountName', 'feeDiscountRate', 'feeDiscountAmount',
                'conditionCode', 'conditionGroupCode', 'conditionGroupTemplateCode'
            ],
            gridConfig: {
                renderTo: renderTo,
                columns: [
                    {text: bxMsg('discountNo')     , width:100, dataIndex: 'feeDiscountSequenceNumber'	, align:'center', style: 'text-align:center'},
                    {text: bxMsg('DPP0127String6') , width:150, dataIndex: 'applyStartDate'				, align:'center', style: 'text-align:center'},
                    {text: bxMsg('DPP0127String7') , width:150, dataIndex: 'applyEndDate'				, align:'center', style: 'text-align:center'},
                    {text: bxMsg('discountName')   , width:150, dataIndex: 'feeDiscountName'			, align:'left'  , style: 'text-align:center'},
                    {text: bxMsg('discountAmount') , width:150, dataIndex: 'feeDiscountAmount'			, align:'right'	, style: 'text-align:center'},
                    {text: bxMsg('DPS0126String18'), width:150, dataIndex: 'feeDiscountRate'			, align:'right'	, style: 'text-align:center'}
                ],
                listeners: {
                    'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        PFRequest.get('/product_condition/getProductConditionFeeDiscount.json', {
                                conditionGroupTemplateCode: record.get('conditionGroupTemplateCode'),
                                conditionGroupCode: record.get('conditionGroupCode'),
                                conditionCode: record.get('conditionCode'),
                                feeDiscountSequenceNumber: record.get('feeDiscountSequenceNumber'),
                                applyStartDate: record.get('applyStartDate'),
                                tntInstId : tntInstId
                            },
                            {
                                success: function(data) {
                                    renderCnd4FeePopup(data, record); // 팝업 개발후 연결
                                },
                                bxmHeader: {
                                    application: 'PF_Factory',
                                    service: 'PdCndFeeDiscountService',
                                    operation: 'queryPdCndFeeDiscount'
                                }
                            }
                        );
                    }
                }
            }
        });

        if(data && data.length>0) {
            cndType4FeeDiscountGrid.setData(data);
        }
    }

    function renderPirtGrid(pirtClass, thisClass){
        var renderTo = '.'+thisClass+' .'+pirtClass+' .pirt-grid';

        var pirtGrid = PFComponent.makeExtJSGrid({
            fields: [
                'id'
                ,'text'
                ,'interestConditionValue'       // 금리조건
                ,'conditionClassifyCode'        // 01.일반조건 / 02.복합조건
                ,{
                    name:'conditionValue',
                    convert: function(newValue, record) {
                        var data = record.get('interestConditionValue');
                        if (record.get('conditionClassifyCode') == '01') {   // 일반조건
                            return bxMsg('DPS0129Unit1String1') + ' : ' + data.minInterestRate + '~' + data.maxInterestRate + '(' + data.rate + ')';
                        }else{      // 복합조건
                            return bxMsg('MTM0200String8');
                        }
                    }
                }
            ],
            gridConfig: {
                renderTo: renderTo,
                columns: [
                    {
                        text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String3'),   // 우대금리 조건코드
                        flex: 1,
                        dataIndex: 'id'
                    },
                    {
                        text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String5'),   // 우대금리 조건명
                        flex: 2,
                        dataIndex: 'text'
                    },
                    {
                        text: bxMsg('DPS0129String4'),      // 조건값
                        flex:3,
                        dataIndex: 'conditionValue',

                    }
                ]
            } // gridconfig end
        });

        return pirtGrid;
    }



    function renderComboBox(code, selector, value, defaultSetting, source) {
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
    }

    function queryConditionTemplateBaseForList(item, callBack) {
      var requestParam = {
          conditionName: item.conditionName,
          conditionTypeCode: item.conditionTypeCode,
          activeYn: "Y",
          tntInstId: getLoginTntInstId(),
      };

      PFRequest.get("/condition/template/queryConditionTemplateBaseForList.json", requestParam, {
        success: function(responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CndTemplateService",
          operation: "queryListCndTemplate"
        }
      });
    }

    function getListCndTemplateMasterList(item, callBack) {
      var requestParam = {
          code: item.code,
          tntInstId: getLoginTntInstId(),
      };

      return PFRequest.get("/condition/template/getListCndTemplateMasterList.json", requestParam, {
        success: function (responseData) {
          callBack(responseData);
        }, bxmHeader: {
          application: "PF_Factory",
          service: "CndTemplateService",
          operation: "queryListListCndTemplate"
        },
        async: false // 동기
      });
    }


//});