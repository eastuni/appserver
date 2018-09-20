/**
 * product compare java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
var $loadingDim = $('#loading-dim');
$(document).ready(function() {
  $(window).resize(function() {
    adjustHeaderSize();
  });
  
  // 상품비교 목록 영역 렌더
  renderCompareProductList();
  // 상품조회조건 영역 렌더
  renderProductQueryArea();
});

function adjustHeaderSize() {
	$('.pf-detail-header').css('width', $('.pf-detail-contents').width() + 1 + 'px');
}


var $el = $('.pf-pc');          // Page Root jQuery Element

var productRelationGrid;
var productConditionGrid;
var productInformationGrid;

// Load Template in HTML
var queryAreaTpl = getTemplate('queryAreaTpl');
var conditionType1Tpl = getTemplate('conditionType1Tpl'),
    conditionType2Tpl = getTemplate('conditionType2Tpl'),
    conditionType3Tpl = getTemplate('conditionType3Tpl'),
    conditionType3ProvidedCndTpl = getTemplate('conditionType3ProvidedCndTpl'),
    conditionType4_1Tpl = getTemplate('conditionType4_1Tpl'),
    conditionType4FeeDiscountTpl = getTemplate('conditionType4FeeDiscountTpl'),
    cndValueType1Tpl = getTemplate('cndValueType1Tpl'),
    cndValueType2Tpl = getTemplate('cndValueType2Tpl'),
    cndValueType3Tpl = getTemplate('cndValueType3Tpl'),
    cndValueType4Tpl = getTemplate('cndValueType4Tpl'),
    cndValueTypeForFeeTpl = getTemplate('cndValueTypeForFeeTpl'),
    relInfoGridTpl = getTemplate('relInfoGridTpl'),
    relProductInfoGridTpl = getTemplate('relProductInfoGridTpl'),
    relBranchInfoGridTpl = getTemplate('relBranchInfoGridTpl'),
    relChannelInfoGridTpl = getTemplate('relChannelInfoGridTpl'),
    relNameInfoGridTpl = getTemplate('relNameInfoGridTpl'),
    relEtcInfoGridTpl = getTemplate('relEtcInfoGridTpl'),
    relClInfoGridTpl = getTemplate('relClInfoGridTpl'),
    relEmployeeInfoGridTpl = getTemplate('relEmployeeInfoGridTpl'),
    relServiceInfoGridTpl = getTemplate('relServiceInfoGridTpl'),
    relInterestRateStructureInfoGridTpl = getTemplate('relInterestRateStructureInfoGridTpl'),
    relConfigGridTpl = getTemplate('relConfigGridTpl'),
    cndApplyRuleTpl = getTemplate('cndApplyRuleTpl'),
    pirtRuleTpl = getTemplate('pirtRuleTpl'),
    detailContainerTpl = getTemplate('detailContainerTpl');


// simple handlebars template
var productSimpleTpl = getTemplate('productSimpleTpl');
var conditionType1SimpleTpl = getTemplate('conditionType1SimpleTpl');
var conditionType2SimpleTpl = getTemplate('conditionType2SimpleTpl');
var conditionType3SimpleTpl = getTemplate('conditionType3SimpleTpl');
var conditionType4_1SimpleTpl = getTemplate('conditionType4_1SimpleTpl');

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el);

onEvent('click', 'a', function(e) { e.preventDefault(); });

/**
 * 비교대상 상품목록 탭으로 표현
 */
function renderCompareProductList() {
    $('.pf-pc-product-list').empty();

    // 탭에 현재 비교대상 상품의 갯수 세팅처리
    var $title = $(parent.document).find('.product-compare-tab').find('.tab-item-title');
    var $compareList = $(parent.document).find('.compare-product-list').find('input');
    $title.text(Ext.String.format('{0} ( {1} )', $title.text().split('(')[0].trim(), $compareList.length));

    PFUI.use('pfui/tab',function(Tab) {
        var tab = new Tab.NavTab({
            render: '.pf-pc-product-list',
            height: '90%',
            itemWidth: '280px',
            elStyle: {'margin-top': '-1px', 'margin-left':'51px'},
            listeners: {
                closed : function(e) {
                    // 상품목록에서 특정상품제거시 상품비교목록에서 제거
                    var productCode = e.target.get('productCode');
                    var len = tab.get('children') ? tab.get('children').length - 1 : 0;
                    $(parent.document).find('.compare-product-list').find('input[product-code="' + productCode + '"]').remove();
                    $title.text(Ext.String.format('{0} ( {1} )', $title.text().split('(')[0].trim(), len));
                    
                    // Max 상품비교 목록은 3건, 실제 비교목록 상품외에 점선으로 default 영역 표시
                    setTimeout(function () {
                    	if (len < 3) {
                          var defaultTabCount = 3 - len;
                          for(var i = 0; i < defaultTabCount; i++) {
                              tab.addTab({
                                elCls: 'product-compare-list-default',
                                title: '　'
                              }, undefined, true);
                          }
                        }
                    	loadProductCondition();
                    }, 100);
                }
            }
        });
        tab.render();

        if ($compareList.length > 0) {
          $compareList.each(function () {
              var menuData = {
                  title: $(this).attr('product-name') + '( ' + $(this).attr('product-code') + ' )',
                  productCode: $(this).attr('product-code'),
                  productName: $(this).attr('product-name'),
                  firstCatalogId : $(this).attr('first-catalog-id'),
                  secondCatalogId : $(this).attr('second-catalog-id'),
                  pdInfoDscd : $(this).attr('pd-info-dscd'),
                  productTemplateCode : $(this).attr('product-template-code'),
                  tntInstId : $(this).attr('tntInstId')
              };
              tab.addTab(menuData, undefined, true);
          });
        }

        // Max 상품비교 목록은 3건, 실제 비교목록 상품외에 점선으로 default 영역 표시
        if (tab.get('children') && tab.get('children').length < 3) {
            var defaultTabCount = 3 - tab.get('children').length;
            for(var i = 0; i < defaultTabCount; i++) {
                tab.addTab({
                  elCls: 'product-compare-list-default',
                  title: '　'
                }, undefined, true);
            }
        }

        // 탭 컴포넌트를 사용하긴하지만 우클릭 context menu는 필요없으므로 제거
        $('body').on('contextmenu', '.pfui-nav-tab-item', function(e){
            $('.pfui-context-menu').find('li').remove();
        });
        
        
        var buttonHtml
        = '<div class="header-group" style="margin-left: 23px;width:306px;margin-top: 18px;position:absolute">'
        + '<label>' + bxMsg('productDetailCompare') + '</label>'
        +  '<input type="checkbox" class="detail-compare">'
        + '</br>'
        + '<span style="padding-right: 35px;">' + bxMsg('searchBaseDate') +  '</span>'
        + '<input type="text" name="start" style="width:170px;" data-form-param="applyStartDate" class="bx-form-item bx-compoenent-small product-compare-search-base-date calendar-all start-date"/>'
        + '<button type="button" class="bw-btn pf-pc-search-btn" style="margin-left:15px;" icon-tooltip="' + bxMsg('ButtonBottomString5') + '">'
        + '<i class="bw-icon i-30 i-search" style="height:27px;width:27px;"></i>'
        + '</button>'
        + '</div>';
        
        $('.pf-pc-product-list').append(buttonHtml);
        
        var spanHtml
        = '<span style="display: inherit;font-weight: bold;text-align: center;margin-left: 126px;z-index:1200;position:absolute;margin-top:11px;font-size:14px !important;">' + bxMsg('compareProduct') + '</span>';
        
        $('.pf-pc-product-list').find('.pfui-nav-tab').before(spanHtml);
        
        $('.pf-pc-product-list').find('li').find('span').each(function () {
          if ($(this).text().trim() !== '') {
            $(this).attr('icon-tooltip', $(this).text());        			
          }
        });
        
        // 현재 시각 세팅
        PFUtil.getAllDatePicker(true, $('.header-group'));
        $('.product-compare-search-base-date').val(XDate(Date()).toString("yyyy-MM-dd")+ " 00:00:00");
    });

    loadProductCondition();
}

function loadProductCondition() {
  var pdCds = []
  $(parent.document).find('.compare-product-list input').each(function () {
    pdCds.push($(this).attr('product-code'));
  });
        
  var requestParam = {
      pdInfoDscd: '01', // 상품
      pdCd: pdCds.join('@'),
      pirtCndQueryYn : 'Y' // 우대금리조건조회여부 20180206 추가
  };

  PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
    success: function(responseData) {
      if(responseData && responseData.length > 0) {
        productConditionGrid.setData(responseData);

        setTimeout(function() {
          if (productConditionGrid && productConditionGrid.grid && productConditionGrid.grid.getSelectionModel()) {
            var selectionModel = productConditionGrid.grid.getSelectionModel();
            selectionModel.selectAll(true);    						
          }
        }, 500)
      }
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'CndTemplateService',
      operation: 'queryListCndTemplate'
    }
  });

}

/**
 * 상품비교 조회조건 영역 세팅
 */
function renderProductQueryArea() {
    $('.pf-pc .pf-pc-query-area-form').html(queryAreaTpl());

    // 상품관계
    var renderPdRelInfoConfigCd = function() {
    	// 상품관계그리드
    	productRelationGrid = PFComponent.makeExtJSGrid({
    	  fields: ['id', 'name'],
    	  gridConfig: {
    	    selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI', checkOnly: true}),
    	    renderTo: '.product-relation-selection-grid',
    	    columns: [
    	      {text: bxMsg('productRelationAllCheck'), align:'left', flex: 1, style:'text-align:center', flex: 1, dataIndex: 'name'}
    	      ],
    	      plugins: [
    	        Ext.create('Ext.grid.plugin.CellEditing', {
    	          clicksToEdit: 1
    	        })
    	        ]
    	  }
    	});

    	var requestParam = {
    			pdInfoDscd : '01'
    	}
    	PFRequest.get('/common/relation/getListPdRelationConfiguration.json', requestParam, {
    		async: false,
    		success: function (responseData) {
    		  var relNodesChildren = [];
    			if(responseData && responseData.length > 0){
    				responseData.forEach(function(el){
    					if(el.useYn == 'Y'){
    						relNodesChildren.push({'id':el.relTpCd , 'name':el.relTpNm});
    					}
    				});
    			}
          
          if (relNodesChildren.length > 0) {
            productRelationGrid.setData(relNodesChildren);
          }
    		},
    		bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'getListPdRelationConfiguration'
        }
    	});
    }

    // 상품조건그리드
    var renderProductCondition = function() {
        productConditionGrid  = PFComponent.makeExtJSGrid({
            fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                name: 'typeNm',
                convert: function(newValue, record) {
                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                    return typeNm;
                }}],
            gridConfig: {
                selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI', checkOnly: true}),
                renderTo: '.product-condition-selection-grid',
                columns: [
                    {text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name', align:'left', flex: 1, style:'text-align:center'}
                ],
                listeners: {
                	afterrender:function( _this, eOpts ){
                        var selectionModel = _this.getSelectionModel();
                        selectionModel.selectAll(true);
                    }
                }
            }
        });

        loadProductCondition();
    }

    // 상품정보 체크박스
    var renderPdInfoTypeDscd = function() {
    	// 상품정보그리드
        productInformationGrid = PFComponent.makeExtJSGrid({
            fields: ['id', 'name'],
            gridConfig: {
            	selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI', checkOnly: true}),
                renderTo: '.product-information-selection-grid',
                columns: [
                     // header : 상품정보
                     // 2018.01.25 부가정보
                    {text: bxMsg('additionalInformation'), align:'left', flex: 1, style:'text-align:center', dataIndex: 'name'}
                ],
                listeners: {
                },
                plugins: [
                    Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 1
                    })
                ],
            }
        });
        var productInformationDataArr = codeArrayObj['PdInfoTypeDscd'].map(function(v) {
          return {
            id: v.code,
            name: v.name
          };
        });
        
        if (productInformationDataArr.length > 0) {
        	productInformationGrid.setData(productInformationDataArr);
        }
    }

    renderPdRelInfoConfigCd();
    renderProductCondition();
    renderPdInfoTypeDscd();
}

function renderProduct() {
    var conditionList, productAdditionInfoList, productAliasNameList, productBase, productBranchRelationList, productChannelRelationList,
        productDocumentRelationList, productRelationList, pdClassificationList, productEmployeeRelationList, serviceRelationList, pirtBenefitRuleMasterVO;

    var requestParam = {};
    // 상품비교 목록영역에 있는 목록을 가져옴.
    var $compareList = $(parent.document).find('.compare-product-list').find('input');
    if ($compareList.length > 0) {
        var pdList = [];
        $compareList.each(function () {
          var $v = $(this);
          // 상품코드목록조립
          pdList.push({
            firstCatalogId: $v.attr('first-catalog-id'),
            secondCatalogId: $v.attr('second-catalog-id'),
            pdInfoDscd: $v.attr('pd-info-dscd'),
            productTemplateCode: $v.attr('product-template-code'),
            code: $v.attr('product-code'),
            tntInstId: $v.attr('tntInstId')
          });
        });
        requestParam.pdList = pdList;
        
    } else return; // 상품비교 목록이 1건도없으면 조회불가

    var pdRelList = [];

    // 상품관계정보 체크
    if (productRelationGrid && productRelationGrid.getSelectedItem().length > 0) {
    	pdRelList = productRelationGrid.getSelectedItem().map(function(el) {
    	  return el.id;
    	});
      requestParam.relList = pdRelList;
    }
    
    // 조건정보
    if(productConditionGrid && productConditionGrid.getSelectedItem().length > 0) {
        requestParam.cndList = productConditionGrid.getSelectedItem().map(function (el) {
          return el.code;
        });
    }

    // 상품정보 체크
    if(productInformationGrid && productInformationGrid.getSelectedItem().length > 0) {
        requestParam.pdInfoList = productInformationGrid.getSelectedItem().map(function(el) {
          return el.id;
        });
    }
    
    // 상세비교여부
    requestParam.detailCompareYN = $('.detail-compare').prop('checked') ? 'Y' : 'N';
    requestParam.loginTntInstId = getLoginTntInstId();
    requestParam.applyStartDate = $('.product-compare-search-base-date').val() || undefined;

    // Loading Dim Show
    $loadingDim.show();

    PFRequest.post('/product/compareProduct.json', requestParam, {
        success: function(rsltData) {

            if (rsltData && rsltData.length > 0) {
                var conditionArray = [];
                var conditionListTreeArray = []; // 좌측 조건트리 영역

                var productRelMap = {};
                var conditionMap = {};

                // 상품관계정보가 있을경우 true
                var productDocumentRelationListExistYn = false;
                var productBranchRelationListExistYn = false;
                var productChannelRelationListExistYn = false;
                var productAliasNameListExistYn = false;
                var productAdditionInfoListExistYn = false;
                var productRelationListExistYn = false;
                var pdClassificationListExistYn = false;
                var productEmployeeRelationListExistYn = false;
                var serviceRelationListExistYn = false;
                var pdRelationInfoWrapListExistYn = false;
                var pdInterestRateStructureRelationListExistYn = false;

                var pdRelationInfoWrapListBakMap = {};

                $('.pf-detail-container').html(detailContainerTpl());
                rsltData.forEach(function (el) {
                    var conditionList = el.conditionList;
                    var productDocumentRelationList = el.productDocumentRelationList;
                    var productBranchRelationList = el.productBranchRelationList;
                    var productChannelRelationList = el.productChannelRelationList;
                    var productAliasNameList = el.productAliasNameList;
                    var productAdditionInfoList = el.productAdditionInfoList;
                    var productRelationList = el.productRelationList;
                    var pdClassificationList = el.classificationInformationRelationWrapVO;
                    var productEmployeeRelationList = el.productEmployeeRelationList;
                    var serviceRelationList = el.serviceRelationList;
                    var pdRelationInfoWrapList = el.pdRelationInfoWrapList;
                    var pdInterestRateStructureRelationList = el.pdInterestRateStructureRelationVO;

                    productDocumentRelationListExistYn |= productDocumentRelationList && productDocumentRelationList.voList && productDocumentRelationList.voList.length > 0;
                    productBranchRelationListExistYn |= productBranchRelationList && productBranchRelationList.voList && productBranchRelationList.voList.length > 0;
                    productChannelRelationListExistYn |= productChannelRelationList && productChannelRelationList.voList && productChannelRelationList.voList.length > 0;
                    productAliasNameListExistYn |= productAliasNameList && productAliasNameList.voList && productAliasNameList.voList.length > 0;
                    productAdditionInfoListExistYn |= productAdditionInfoList && productAdditionInfoList.voList && productAdditionInfoList.voList.length > 0;
                    productRelationListExistYn |= productRelationList && productRelationList.voList && productRelationList.voList.length > 0;
                    pdClassificationListExistYn |= pdClassificationList && pdClassificationList.voList && pdClassificationList.voList.length > 0;
                    productEmployeeRelationListExistYn |= productEmployeeRelationList && productEmployeeRelationList.voList && productEmployeeRelationList.voList.length > 0;
                    serviceRelationListExistYn |= serviceRelationList && serviceRelationList.voList && serviceRelationList.voList.length > 0;
                    pdInterestRateStructureRelationListExistYn |= pdInterestRateStructureRelationList && pdInterestRateStructureRelationList.voList && pdInterestRateStructureRelationList.voList.length > 0;
                    
                    // OHS 2017.06.07 추가 - 관계정보 Configuration 반영
                    if(pdRelationInfoWrapList && pdRelationInfoWrapList.length > 0) {
                      	pdRelationInfoWrapList.forEach(function(el, index){
                      		if (el.productRelationInformationVO && el.productRelationInformationVO.voList && el.productRelationInformationVO.voList.length > 0
                      			&& pdRelationInfoWrapListBakMap['pdRelationInfoWrapList' + el.pdRelationConfigurationItemVO.relTpCd] == null) {
                      				pdRelationInfoWrapListBakMap['pdRelationInfoWrapList' + el.pdRelationConfigurationItemVO.relTpCd] = bxMsg('relationInfo') 
                      				+ "[" + el.pdRelationConfigurationItemVO.relTpNm + "]";
                      		}
                    	  });                    		
                    	  pdRelationInfoWrapListExistYn = true;
                    }


                    if (conditionList && conditionList.length > 0) {
                        var pirtFlag = true;
                        conditionList.forEach(function (el) {
                            if (pirtFlag && el.conditionDetailTypeCode === '11') {
                                pirtFlag = false;
                                conditionMap['IZZZ'] = 'hidden';
                            }

                            if (conditionMap[el.id] == null) {
                                conditionMap[el.id] = el.text;
                            }
                        });
                    }
                });

                if (productDocumentRelationListExistYn && productRelMap['productDocumentRelationList'] == null) {
                    productRelMap['productDocumentRelationList'] = bxMsg('documentRelationTitle');
                }
                if (productBranchRelationListExistYn && productRelMap['productBranchRelationList'] == null) {
                    productRelMap['productBranchRelationList'] = bxMsg('DPM10002Sring4');
                }
                if (productChannelRelationListExistYn && productRelMap['productChannelRelationList'] == null) {
                    productRelMap['productChannelRelationList'] = bxMsg('DPM10002Sring12');
                }
                if (productAliasNameListExistYn && productRelMap['productAliasNameList'] == null) {
                    productRelMap['productAliasNameList'] = bxMsg('DPS0106String3');
                }
                if (productAdditionInfoListExistYn && productRelMap['productAdditionInfoList'] == null) {
                    productRelMap['productAdditionInfoList'] = bxMsg('DPS0115String2');
                }
                if (productRelationListExistYn && productRelMap['productRelationList'] == null) {
                    productRelMap['productRelationList'] = bxMsg('DPM10002Sring3');
                }
                if (pdClassificationListExistYn && productRelMap['pdClassificationList'] == null) {
                    productRelMap['pdClassificationList'] = bxMsg('DPM10002Sring10');
                }
                if (productEmployeeRelationListExistYn && productRelMap['productEmployeeRelationList'] == null) {
                    productRelMap['productEmployeeRelationList'] = bxMsg('relationEmployee');
                }
                if (serviceRelationListExistYn && productRelMap['serviceRelationList'] == null) {
                    productRelMap['serviceRelationList'] = bxMsg('RelationService');
                }
                // 2018.07.23 금리체계추가
                if (pdInterestRateStructureRelationListExistYn && productRelMap['pdInterestRateStructureRelationList'] == null) {
                	productRelMap['pdInterestRateStructureRelationList'] = bxMsg('intRtStrctr');
                }
                if (pdRelationInfoWrapListExistYn && pdRelationInfoWrapListBakMap) {
                	  Object.keys(pdRelationInfoWrapListBakMap).forEach(function(key) {
                	    if (productRelMap[key] == null) {
                	      productRelMap[key] = pdRelationInfoWrapListBakMap[key];
                	    }
                	  });
                }

                if (conditionMap) {
                    if (productRelMap) {
                        Object.keys(productRelMap).forEach(function(key) {
                            var productRel = {};
                            productRel.id = key;
                            productRel.text = productRelMap[key];
                            productRel.type = 0; // relation

                            conditionListTreeArray.push(productRel);
                        });
                    }

                    Object.keys(conditionMap).forEach(function(key) {
                        var condition = {};
                        condition.id = key;
                        condition.text = '[' + key + '] ' + conditionMap[key];
                        condition.type = 1; // condition

                        if (conditionMap[key] !== 'hidden') {
                            conditionListTreeArray.push(condition);
                        }
                        conditionArray.push(condition);
                    });
                }
                
                var $contents = $(".pf-detail-container .pf-detail-contents");
                conditionListTreeArray.sort(function(a, b) {
                  if (a.type < b.type) return -1;
                  else if (a.type > b.type) return 1;
                  else if (a.id < b.id) return -1;
                  else if (a.id > b.id) return 1;
                  else return 0;
                }).forEach(function(v) {
                  var $div = $(document.createElement("div")).addClass("pf-detail-column " + v.id);
                  $div.append("<div class='pf-detail-first'>"  + v.text + "</div>");
                  $contents.append($div);
                });

                var forIndex = 0;
                rsltData.forEach(function (el) {
                    var responseData = el;

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
                    pdRelationInfoWrapList = responseData.pdRelationInfoWrapList;
                    conditionList = responseData.conditionList;
                    pirtBenefitRuleMasterVO = responseData.pirtBenefitRuleMasterVO;
                    pdInterestRateStructureRelationList = responseData.pdInterestRateStructureRelationVO;
                    
                    // 2건 비교 상품헤더 세부조정
                    if(rsltData.length == 2) {
                        if(forIndex == 0) {
                        	$el.find('.pf-detail-header').append('<div style="margin-right:-10px;margin-left:5px;" class="pf-detail-info ' + productBase.code + '"></div>');                    	
                        }
                        else {
                        	$el.find('.pf-detail-header').append('<div style="margin-right:-2px;margin-left:19px;" class="pf-detail-info ' + productBase.code + '"></div>');
                        }
                    }
                    else {
                        if(forIndex == 0) {
                        	$el.find('.pf-detail-header').append('<div style="margin-right:5px;" class="pf-detail-info ' + productBase.code + '"></div>');                    	
                        }
                        else if(forIndex == 1) {
                        	$el.find('.pf-detail-header').append('<div style="margin-right:5px;" class="pf-detail-info ' + productBase.code + '"></div>');
                        }
                        else {
                        	$el.find('.pf-detail-header').append('<div class="pf-detail-info ' + productBase.code + '"></div>');
                        }
                    }
   
                    forIndex++;
                    $el.find('.pf-detail-header').find('.' + productBase.code).html(productSimpleTpl(productBase));

                    var clas = productBase.code;

                    
                    function _getPdRelGridChecked(code) {
                      return requestParam.relList.indexOf(code) !== -1;
                    }

                    var opMap = {
                        '203': [productDocumentRelationList, "productDocumentRelationList", renderRelDocumentGrid, relInfoGridTpl],         // 관련문서
                        '204': [productRelationList, "productRelationList", renderRelProductGrid, relProductInfoGridTpl],                   // 관련상품
                        '205': [productBranchRelationList, "productBranchRelationList", renderRelBranchGrid, relBranchInfoGridTpl],         // 관련부서
                        '206': [productAliasNameList, "productAliasNameList", renderRelNameGrid, relNameInfoGridTpl],                       // 상품명
                        '207': [productAdditionInfoList, "productAdditionInfoList", renderRelEtcGrid, relEtcInfoGridTpl],                   // 부가정보
                        '208': [pdClassificationList, "pdClassificationList", renderRelClGrid, relClInfoGridTpl],                           // 상품분류
                        '209': [productEmployeeRelationList, "productEmployeeRelationList", renderRelEmployeeGrid, relEmployeeInfoGridTpl], // 관련직원
                        '211': [serviceRelationList, "serviceRelationList", renderRelServiceGrid, relServiceInfoGridTpl],                   // 관련서비스
                        '212': [pdInterestRateStructureRelationList, "pdInterestRateStructureRelationList", renderRelInterestRateStructureGrid, relInterestRateStructureInfoGridTpl]                    					// 금리체계
                    };

                    pdRelList.forEach(function(rel) {
                      if (opMap[rel] && _getPdRelGridChecked(rel)) {
                        [relationList, relationListNm, renderer, relationTpl] = opMap[rel];

                        var $relList = $el.find('.pf-detail-column.' + relationListNm);
                        if (relationList && relationList.voList && relationList.voList.length > 0) {
                          $relList.append(relationTpl());
                          var $relationInfoWrap = $relList.find('.value-area').last().addClass('pf-detail-info').addClass(productBase.code).addClass('pf-panel');
                          renderer(relationList, $relationInfoWrap);

                        } else if (productRelMap[relationListNm] !== null) {
                          $relList.append('<div class="pf-detail-info value-area no-defined-area"><span style="color:red;">' + bxMsg('notDefinedRelationInfo') + '</span></div>');
                        }

                      } else {
                    		// 2017.08.21 수정
                    		if (productRelationGrid && productRelationGrid.getSelectedItem().length > 0) {
                    			if (pdRelationInfoWrapList && pdRelationInfoWrapList.length > 0) {
                    			  pdRelationInfoWrapList.forEach(function(el, index) {
                    			    var relTpCd = el.pdRelationConfigurationItemVO.relTpCd;
                    			    var $relList = $el.find('.pf-detail-column.pdRelationInfoWrapList' + relTpCd);

                    			    if (rel === relTpCd && _getPdRelGridChecked(rel)) {
                    			      if (!el.productRelationInformationVO.voList || el.productRelationInformationVO.voList.length === 0) {
                    			        if (productRelMap['pdRelationInfoWrapList' + relTpCd] != null) {
                    			          $relList.append('<div class="pf-detail-info value-area no-defined-area"><span style="color:red;">' + bxMsg('notDefinedRelationInfo') + '</span></div>');
                    			        }
                    			      } else {
                    			        productRelMap['pdRelationInfoWrapList' + el.pdRelationConfigurationItemVO.relTpCd] = bxMsg('relationInfo') 
                    			        + "[" + el.pdRelationConfigurationItemVO.relTpNm + "]";
                    			        $relList.append(relConfigGridTpl());
                    			        var renderTo = $relList.find('.value-area').last().addClass('menu2-'+relTpCd).addClass('pf-detail-info pf-panel').addClass(productBase.code);
                    			        renderProductRelConfiGrid(el.pdRelationConfigurationItemVO,el.productRelationInformationVO, renderTo);
                    			      }
                    			    }
                    			  });
                    			}
                    		}
                    	}
                    });

                    var newConditionList = [];
                    for (var i=0; i<conditionArray.length; i++) {
                        var sourceCode = conditionArray[i].id;
                        var existFlag = false;
                        var existPirtFlag = false;

                        if (conditionList && conditionList.length > 0) {
                            for (var j=0; j<conditionList.length; j++) {
                                var targetCode = conditionList[j].id;

                                if (sourceCode === targetCode) {
                                    existFlag = true;
                                    newConditionList.push(conditionList[j]);
                                }
                                // 우대금리정보가 있는지 체크
                                if (conditionList[j].conditionDetailTypeCode === '11') {
                                    existPirtFlag = true;
                                }
                            }
                        }
                        // 우대금리적용규칙영역에서 우대금리 조건이 하나도없으면 NoData 표시.
                        if (sourceCode === 'IZZZ' && !existPirtFlag) {
                        } else {
                            if (!existFlag && sourceCode !== 'IZZZ') {
                                newConditionList.push('NoData@' + sourceCode);
                            }
                        }
                    }

                    renderConditionDetailPage(conditionList, clas, pirtBenefitRuleMasterVO, newConditionList);
                });
                
                adjustHeaderSize();
            }
            // Loading Dim Hide
            $loadingDim.hide();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'comparePd'
        }
    });
    
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

        if(productBase.productRelationVO.voList && productBase.productRelationVO.voList.length > 0) {
        	clickEventForGrid.setData(productBase.productRelationVO.voList);
        }
        else {
        	clickEventForGrid.setData([]);
        }
    }

    function renderRelDocumentGrid(productDocumentRelationList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'code', 'pdDocumentDistinctionCode', 'documentId', 'isMandatory', 'documentContent',
                'applyStart', 'applyEnd'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-info-grid'),
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

        if(productDocumentRelationList.voList && productDocumentRelationList.voList.length > 0) {
        	clickEventForGrid.setData(productDocumentRelationList.voList);        	
        }
        else {
        	clickEventForGrid.setData([]);
        }
    }

    function renderRelProductGrid(productRelationList, renderTo) {
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
                renderTo: renderTo.find('.pf-base-rel-product-grid'),
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

    function renderRelBranchGrid(productBranchRelationList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'code', 'relationInformationStatus', 'branchRelationType','branchCode',
                'applyStart', 'applyEnd'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-branch-grid'),
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

        clickEventForGrid.setData(productBranchRelationList.voList ? productBranchRelationList.voList : []);
    }

    function renderRelChannelGrid(productChannelRelationList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'code','productChannelRelation', 'productChannelCode', 'relationInformationStatus',
                'applyStart', 'applyEnd'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-channel-grid'),
                columns: [
                    {text: bxMsg('DPP0109String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'productChannelRelation'},
                    {text: bxMsg('DPS0109String1'), flex: 1,  align: 'center', sortable: false, dataIndex: 'productChannelCode'},
                    {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStart'},
                    {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEnd'}
                ]
            }
        });

        clickEventForGrid.setData(productChannelRelationList.voList ? productChannelRelationList.voList : []);
    }

    function renderRelNameGrid(productAliasNameList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'code', 'languageCode', 'productAliasName','productAliasNameType','relationInformationStatus',
                'applyStart', 'applyEnd'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-name-grid'),
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

        clickEventForGrid.setData(productAliasNameList.voList ? productAliasNameList.voList : []);
    }

    // 부가정보
    function renderRelEtcGrid(productAdditionInfoList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'code','relationInformationStatus','additionalInformationType','additionalInformationContent',
                'applyStart', 'applyEnd'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-etc-grid'),
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

        clickEventForGrid.setData(productAdditionInfoList.voList ? productAdditionInfoList.voList : []);
    }

    // 상품분류
    function renderRelClGrid(pdClassificationList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                'classificationCode','classificationStructureDistinctionCode','classificationStructureName','navigation',
                'applyStartDate', 'applyEndDate'
            ],
            gridConfig: {
                renderTo: renderTo.find('.pf-base-rel-cl-grid'),
                columns: [
                    {text: bxMsg('ClassificationName'), flex: 1,  align: 'center', sortable: false, dataIndex: 'classificationStructureName'},
                    {text: bxMsg('Subclassification'), flex: 2,  align: 'left', style : 'text-align:center', sortable: false, dataIndex: 'navigation'},
                    {text: bxMsg('DPP0127String6'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyStartDate'},
                    {text: bxMsg('DPS0102String5'), flex: 1,  align: 'center', sortable: false, dataIndex: 'applyEndDate'}
                ]
            }
        });

        clickEventForGrid.setData(pdClassificationList.voList ? pdClassificationList.voList : []);
    }


    function renderRelEmployeeGrid(productEmployeeRelationList, renderTo) {
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
                renderTo: renderTo.find('.pf-base-rel-employee-grid'),
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
    function renderRelServiceGrid(serviceRelationList, renderTo) {
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
                renderTo: renderTo.find('.pf-base-rel-service-grid'),
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
    function renderRelInterestRateStructureGrid(pdInterestRateStructureRelationList, renderTo) {
        var clickEventForGrid = PFComponent.makeExtJSGrid({
            fields: [
                "tntInstId","pdInfoDscd","applyStartDate","applyEndDate", "intRtStructureCode", "intRtStructureName", "intRtStructureContent"
                ,"bizDscd", "productTypeCode", {
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
                renderTo: renderTo.find('.pf-base-rel-interest-rate-structure-grid'),
                columns: [
                    // 업무구분코드
                    {text: bxMsg('DPS0101String10'),  width:70, dataIndex: 'bizDscd', style: 'text-align:center',
                        renderer: function(value) {
                            return codeMapObj.ProductCategoryLevelOneCode[value] || value;
                        }
                    },
                    {text: bxMsg('intRtStrctrName'),  flex:1.5, dataIndex: 'intRtStructureName', style: 'text-align:center'},
                    {text: bxMsg('formulaCntnt'),  flex:1, dataIndex: 'intRtStructureContent', style: 'text-align:center'},
                    // 상태
                    {text: bxMsg('DPS0101String6'),  width:80, dataIndex: 'relationInformationStatus', style: 'text-align:center',
                        renderer: function(value) {
                            return codeMapObj.ProductStatusCode[value] || value;
                        }
                    },
                    // 적용시작일자
                    {text: bxMsg('DPP0127String6'), width:130, dataIndex:'applyStartDate', align: 'center'},
                    // 적용종료일자
                    {text: bxMsg('DPP0127String7'), width:130, dataIndex:'applyEndDate', align: 'center'}
                ]
            }
        });

        clickEventForGrid.setData(pdInterestRateStructureRelationList.voList ? pdInterestRateStructureRelationList.voList : []);
    }
    
    /**
     * 상품조건정보 렌더링
     * @param conditionList
     * @param productCode
     * @param pirtBenefitRuleMasterVO
     * @param conditionArray : 두 상품의 전체 유니크한 조건코드
     */
    function renderConditionDetailPage(conditionList, productCode, pirtBenefitRuleMasterVO, newConditionList) {
        var tplMap = {};
        var detail = $('.detail-compare').prop('checked');
        // 상세비교
        var tplMap = {
            '01': detail ? conditionType1Tpl : conditionType1SimpleTpl,
            '02': detail ? conditionType2Tpl : conditionType2SimpleTpl,
            '03': detail ? conditionType3Tpl : conditionType3SimpleTpl,
            '04': detail ? conditionType4_1Tpl : conditionType4_1SimpleTpl
        };

        // 우대금리적용규칙
        var pirtFlag = true;    // 우대금리적용규칙을 최초 한번만 그리기 위함
        var pirtList = [];      // 우대금리목록
        var pirtGrid;

        function integerAs(int) {
          var l = int.toString().split(".");
          var s = "";
          for (var i=0; i<l[0].length; i++) {
            if (i && !(i%3)) s = "," + s;
            s = l[0][l[0].length-1-i] + s;
          }
          l[0] = s;
          
          return l[0];
        }

        function floatAs(float) {
          var l = float.toString().split(".");
          l[0] = integerAs(l[0]);
          if (l[1] === undefined || l[1].length === 0) l[1] = "00";
          else if (l[1].length === 1) l[1] = l[1] + "0";
          else l[1] = l[1].substr(0, 2);
          
          return l.join(".");
        }

        function expression(data) {
          var result = "";
          if (data.conditionClassifyCode === "01") {
            //01: 목록형, 02: 범위형, 03: 금리형, 04: 수수료형
            switch (data.conditionTypeCode) {
            case "01":
              result = data.listConditionValue.defineValues.map(function(v) {
                return v.name;
              }).join(", ");
              break;

            case "02":
              var value = data.rangeConditionValue;
              var unit;
              var minValue, maxValue, defaultValue;
              switch (value.conditionDetailTypeCode) {
              case "01": // 금액
                minValue = floatAs(value.minValue);
                maxValue = floatAs(value.maxValue);
                defaultValue = floatAs(value.defalueValue);
                unit = value.currencyValue; break;

              case "02": // 날짜
              case "03": // 주기
              case "04": // 숫자
                minValue = integerAs(value.minValue);
                maxValue = integerAs(value.maxValue);
                defaultValue = integerAs(value.defalueValue);
                unit = codeMapObj.ProductMeasurementUnitCode[value.productMeasurementUnit]; break;

              case "05": // 율
                minValue = floatAs(value.minValue);
                maxValue = floatAs(value.maxValue);
                defaultValue = floatAs(value.defalueValue);
                if (value.productMeasurementUnit === "11") unit = "%"; // 백분율
                else if (value.productMeasurementUnit === "11") unit = "‰"; // 천분율
              }
              if (minValue === maxValue && minValue === defaultValue) result = defaultValue + unit;
              else result = minValue + unit + " ~ " + maxValue + unit + " (" + bxMsg("defaultValue") + ": " + defaultValue + unit + ")";
              break;

            case "03":
              var value = data.interestConditionValue;
              if (value.minInterestRate === value.maxInterestRate && value.maxInterestRate === value.rate) result = floatAs(value.rate) + "%";
              else result = floatAs(value.minInterestRate) + "% ~ " + floatAs(value.maxInterestRate) + "% (" + floatAs(value.rate) + "%)";
              
              // 부가정보 우대금리 체크시 보여질 정보 추출
              if(productInformationGrid && productInformationGrid.getSelectedItem()) {
                  var matched = false; 
                  productInformationGrid.getSelectedItem().forEach(function(el) {
                      if(el.id == '01') matched = true;
                  });
                  
                  if (data.conditionDetailTypeCode === '11' && matched) {
                	  if(data.providedCndBenefitRuleMasterVO && data.providedCndBenefitRuleMasterVO.ruleDesc) {
                		  result = result + '</br>';
                		  result = result + bxMsg('ApplyRule') + " : " + data.providedCndBenefitRuleMasterVO.ruleDesc;
                	  }
                  }
              }

              break;

            case "04":
              var value = data.feeConditionValue;
              var unit;
              switch (value.feeTpCd) {
              case "01": // 율
                if (value.rtMsurUnitCd === "11") unit = "%";// 백분율
                else if (value.rtMsurUnitCd === "11") unit = "‰"; break;// 천분율

              case "02": // 금액
              default:
                unit = "";
              }
              if (value.minRt === value.maxRt && value.maxRt === value.rate) result = floatAs(value.rate) + unit;
              else result = floatAs(value.minRt) + unit + " ~ " + floatAs(value.maxRt) + unit + " (" + bxMsg("defaultValue") + ": " + floatAs(value.rate) + ")";
              break;
            }
          } else if (data.conditionClassifyCode === "02") {
            result = "복합";
            
          }
          
          return result;
        }

        newConditionList.forEach(function (el) {
            // 상품전체조건중에 해당상품에 정의되지않은 조건
            if (el && typeof(el) === 'string' && el.split('@')[0] === 'NoData') {
              var cnd = el.split('@')[1];
              $el.find('.pf-detail-column.' + cnd).append('<div class="pf-detail-info value-area no-defined-area ' + productCode + '"><span style="color:red;">' +
                  (cnd === 'IZZZ' ? bxMsg('notDefinedForApplyRulesThePirt') : bxMsg('notDefinedForCondition')) + '</span></div>');
            }
            else {
                var data = el,
                    conditionClass = 'condition-' + el.id;
                var $cndList = $el.find('.pf-detail-column.' + el.id);
                console.log(data.conditionClassifyCode, data.conditionTypeCode, data.conditionDetailTypeCode, data);

                // 조건값이 없으면 화면에 보이지 않음.
                if (data.isValueNull) {
                    $cndList.append('<div class="pf-detail-info value-area no-defined-area ' + productCode + '"><span style="color:red;">' + bxMsg('notDefinedForCondition') + '</span></div>');
                    return;
                }

                data.statusNm = data.status ? '[' + data.status + '] ' + codeMapObj['ProductStatusCode'][data.status] : '';
                data.conditionAgreeLevelNm = data.conditionAgreeLevel ? '[' + data.conditionAgreeLevel + '] ' + codeMapObj['ProductConditionAgreeLevelCode'][data.conditionAgreeLevel] : '';
                data.conditionTypeCodeNm = data.conditionTypeCode ? '[' + data.conditionTypeCode + '] ' + codeMapObj['ProductConditionTypeCode'][data.conditionTypeCode] : '';
                data.conditionClassifyCodeNm = data.conditionClassifyCode ? '[' + data.conditionClassifyCode + '] ' + codeMapObj['ProductConditionClassifyCode'][data.conditionClassifyCode] : '';
                data.layerCalcTypeNm = data.layerCalcType ? '[' + data.layerCalcType + '] ' + codeMapObj['TierAplyCalcnWayCodeCode'][data.layerCalcType] : '';
                data.intRtAplyBaseDayCdNm = data.intRtAplyBaseDayCd ? '[' + data.intRtAplyBaseDayCd + '] ' + codeMapObj['IntRtAplyBaseDayCode'][data.intRtAplyBaseDayCd] : '';
                data.settleTypeNm = data.settleType ? '[' + data.settleType + '] ' + codeMapObj['FeeSettleTypeCode'][data.settleType] : '';
                data.calcBasicNm = data.calcBasic ? '[' + data.calcBasic + '] ' + codeMapObj['FeeCalculateBasicTypeCode'][data.calcBasic] : '';
                data.conditionValueAplyWayCodeNm = data.ConditionValueApplyWayCodeCode ? '[' + data.ConditionValueApplyWayCodeCode + '] ' + codeMapObj['ConditionValueApplyWayCodeCode'][data.conditionValueAplyWayCode] : '';

                $cndList.append(tplMap[data.conditionTypeCode](data));
                $cndList.find('.value-area').last().addClass('pf-detail-info').addClass(productCode).addClass('pf-panel');

                var $conditionInfoWrap = $cndList.find('.' + productCode);

                if (data.isMandatory) {
                    $conditionInfoWrap.find('.isMandatory').prop('checked', true);
                }

                if (data.conditionClassifyCode === '01') {
                    $conditionInfoWrap.find('.condition-value').addClass('active');

                    // 상세비교 아닌 경우
                    if (requestParam.detailCompareYN === "N") {
                      $conditionInfoWrap.html(expression(data)).addClass('simple-value-area').css('text-align', 'center');
                      return;
                    }

                    //01: 목록형, 02: 범위형, 03: 금리형, 04: 수수료형
                    switch (data.conditionTypeCode) {
                        case '01': // 목록 조건
                            renderCndValueType1Grid(data.listConditionValue.defineValues, null, $conditionInfoWrap);

                            break;

                        case '02': // 범위 조건
                            data.rangeConditionValue.productMeasurementUnitNm = data.rangeConditionValue.productMeasurementUnit ? '[' + data.rangeConditionValue.productMeasurementUnit + '] ' + codeMapObj['ProductMeasurementUnitCode'][data.rangeConditionValue.productMeasurementUnit] : '';
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

                        case '03':
                            // 우대금리목록에 추가, 조건유형이 우대금리고 상품정보에서 우대금리 체크하였을때
                            if (data.conditionDetailTypeCode === '11'
                            	&& productInformationGrid.getSelectedItem().map(function(el) {
                                    el.id == '01'
                                })) {
                              console.log('우대금리');
                                if(pirtFlag) {
                                    pirtList.push(data);

                                    pirtFlag = false;
                                    var pirtClass = 'condition-IZZZ';

                                    $conditionInfoWrap.find('.pirt-area').append(pirtRuleTpl(pirtBenefitRuleMasterVO));
                                    $conditionInfoWrap.find('.pirt-area').addClass(pirtClass).addClass(conditionClass);

                                    pirtGrid = renderPirtGrid($conditionInfoWrap);
                                }
                            }

                            data.interestConditionValue.frctnAplyWayCdNm = data.interestConditionValue.frctnAplyWayCd ? '[' + data.interestConditionValue.frctnAplyWayCd + '] ' + codeMapObj['FrctnAplyWayCode'][data.interestConditionValue.frctnAplyWayCd] : '';
                            data.interestConditionValue.rateApplyWayCodeNm = data.interestConditionValue.rateApplyWayCode ? '[' + data.interestConditionValue.rateApplyWayCode + '] ' + codeMapObj['ProductConditionInterestApplyTypeCode'][data.interestConditionValue.rateApplyWayCode] : '';
                            data.interestConditionValue.typeNm = data.interestConditionValue.type ? '[' + data.interestConditionValue.type + '] ' + codeMapObj['InterestTypeCode'][data.interestConditionValue.type] : '';

                            $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                            var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');

                            if (!data.interestConditionValue.rateApplyWayCode === '01') {
                                $cndValueType3Wrap.find('.condition-interest-apply-type-wrap').show();
                            } else {
                                $cndValueType3Wrap.find('.condition-interest-apply-type-wrap').hide();
                            }

                            // 우대금리
                            console.log('금리', data);
                            if (data.conditionDetailTypeCode === '11') {
                                if (data.providedCndBenefitRuleMasterVO) {
                                    data.providedCndBenefitRuleMasterVO.ruleStatusCodeNm = data.providedCndBenefitRuleMasterVO.ruleStatusCode ? '[' + data.providedCndBenefitRuleMasterVO.ruleStatusCode + '] ' + codeMapObj['ProductStatusCode'][data.providedCndBenefitRuleMasterVO.ruleStatusCode] : '';
                                }
                                $conditionInfoWrap.find('.provided-cnd-wrap').html(conditionType3ProvidedCndTpl(data.providedCndBenefitRuleMasterVO));

                                if($('.detail-compare').prop('checked')) {
                                    renderProvidedCndGrid(data.providedCndVOList, $conditionInfoWrap);
                                }
                            }

                            $el.find('.' + productCode + ' .pf-pc-info-panel').find('.value-area').css('overflow', 'auto'); // 금리값일경우 overflow 활성화
                            break;

                        case '04' :
                            data.feeConditionValue.rtMsurUnitCdNm = data.feeConditionValue.rtMsurUnitCd ? '[' + data.feeConditionValue.rtMsurUnitCd + '] ' + codeMapObj['ProductMeasurementUnitCode'][data.feeConditionValue.rtMsurUnitCd] : '';

                            $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(data.feeConditionValue));
                            $conditionInfoWrap.find('.condition-value').find('.cnd-value-04-amount-table').addClass('active');

                            if (data.feeConditionValue.isSystemMaxValue == true) {
                                $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                            }

                            if (data.feeConditionValue.feeTpCd === '01') {
                                $conditionInfoWrap.find('.charge-radio-rate').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').removeClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').addClass('active');
                            } else {
                                $conditionInfoWrap.find('.charge-radio-amount').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').addClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').removeClass('active');
                            }


                            if($('.detail-compare').prop('checked')) {
                                if (data.providedCndBenefitRuleMasterVO) {
                                    data.providedCndBenefitRuleMasterVO.ruleStatusCodeNm = data.providedCndBenefitRuleMasterVO.ruleStatusCode ? '[' + data.providedCndBenefitRuleMasterVO.ruleStatusCode + '] ' + codeMapObj['ProductStatusCode'][data.providedCndBenefitRuleMasterVO.ruleStatusCode] : '';
                                    data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCodeNm = data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode ? '[' + data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode + '] ' + codeMapObj['FeeTypeCode'][data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode] : '';
                                }
                                $conditionInfoWrap.find('.fee-discount-wrap').html(conditionType4FeeDiscountTpl(data.providedCndBenefitRuleMasterVO));

                                if (data.providedCndBenefitRuleMasterVO) {
                                    if (data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode == '01') {
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-amt').hide();
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-rt').show();
                                    } else if (data.providedCndBenefitRuleMasterVO.rateAmountDistinctionCode == '02') {
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-amt').show();
                                        $conditionInfoWrap.find('.fee-discount-wrap .fee-discount-tp-rt').hide();
                                    }
                                }
                                renderFeeDiscountGrid(data.feeDiscountVOList, $conditionInfoWrap);
                            }
                            break;
                    }

                } else if (data.conditionClassifyCode == '02') {
                    $conditionInfoWrap.find('.complex-grid-wrap').addClass('active');

                    renderComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix, data, $conditionInfoWrap);
                }

                if (data.conditionTypeCode === '04' && data.conditionValueAplyWayCode === '03') {
                    $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                }
            }
        });

        if (pirtGrid) pirtGrid.setData(pirtList);
    }
}

function renderCndValueType1Grid(data, popup, renderTo) {
    if (popup) {
        renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
    } else {
        renderTo = typeof(renderTo) === 'string'
          ? renderTo + ' .cnd-val-type1-grid'
          : renderTo.find('.cnd-val-type1-grid');
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

function renderComplexGrid(title, data, condition, renderTo) {
    renderTo = typeof(renderTo) === 'string'
      ? renderTo + ' .complex-grid'
      : renderTo.find('.complex-grid');

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
        el.defineValues = el.defineValues || [];
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
            renderTo: renderTo,
            columns: columns
        }

    });
    cndValComplexGrid.setData(gridData);
}

function renderProvidedCndGrid(data, renderTo) {
    renderTo = typeof(renderTo) === 'string'
      ? renderTo + ' .provided-cnd-wrap .provided-cnd-grid'
      : renderTo.find('.provided-cnd-wrap .provided-cnd-grid');

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

function renderFeeDiscountGrid(data, renderTo) {
    renderTo = typeof(renderTo) === 'string'
      ? renderTo + ' .fee-discount-wrap .fee-discount-grid'
      : renderTo.find('.fee-discount-wrap .fee-discount-grid');

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
                            tntInstId : getLoginTntInstId()
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

function renderPirtGrid(renderTo) {
    renderTo = typeof(renderTo) === 'string'
      ? renderTo + ' .pirt-grid'
      : renderTo.find('.pirt-grid');

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
                    dataIndex: 'conditionValue'

                }
            ]
        } // gridconfig end
    });

    return pirtGrid;
}


/**
 * 조회조건영역 숨김/펼쳐짐 버튼 클릭
 */
onEvent('click', '.sidebar-toggler', function (e) {
    var $target = $(e.currentTarget);

    $el.toggleClass('contents-expand');

    if($el.hasClass('contents-expand')) {
    	$('.pf-pc-info-wrap.pf-detail-wrap').css('height', '0px')
    	$('.pf-detail-container').height('89%');
    }else {
    	$('.pf-pc-info-wrap.pf-detail-wrap').css('height', '266px')
    	$('.pf-detail-container').height('61%');
    }
});

/**
 * 상품비교검색 버튼 클릭 처리
 */
onEvent('click', '.pf-pc-search-btn', function(e) {
    if ($(parent.document).find('.compare-product-list').find('input').length < 2) {
        // 비교대상은 최소 2건이어야 합니다.
        PFComponent.showMessage(bxMsg('mustCompare2CntMore'), 'warning');
        return;
    }
    renderProduct();
});

//설정 그리드 관
function renderProductRelConfiGrid(configData, relInfoData, renderTo) {
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
            renderTo: renderTo.find('.pf-base-rel-config-grid'),
            columns: columns
        }
    });

	clickEventForGrid.setData(relInfoData.voList ? relInfoData.voList : []);


    function addColumns(columns, fieldList){
    	
    	// 순서를 유지하기 위함.
    	var pdTgtRelCdColumn = $.grep(fieldList, function(el){
    		return el.field === 'pd_tgt_rel_cd';
    	});
    	if(pdTgtRelCdColumn.length>0){
    		addColumn(columns, pdTgtRelCdColumn[0]);
    	};

    	var tgtCdColumn = $.grep(fieldList, function(el){
    		return el.field === 'tgt_cd';
    	});
    	if(tgtCdColumn.length>0){
    		addColumn(columns, tgtCdColumn[0]);
    	};

    	var relCntntColumn = $.grep(fieldList, function(el){
    		return el.field === 'rel_cntnt';
    	});
    	if (relCntntColumn.length>0) {
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