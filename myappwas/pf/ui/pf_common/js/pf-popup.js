/**
 * Created by yujin on 2015-11-11.
 */

/**
 * 조건군템플릿코드 선택 팝업
 * script : <script id="cnd-grp-tpl-popup" type="text/x-handlebars-template"></script>
 * input  : submitEvent
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 */
function renderConditionGroupTemplateListSearchPopup(submitEvent) {

    var htmlString
        = '<div class="cnd-grp-tpl-popup">'
        + ' <header class="popup-cnd-tpl-grid-header grid-extra-header">'
        + '     <div class="header-group">'
        + bxMsg('MTM0100String8') + ': <input type="text" class="bx-form-item bx-compoenent-small cnd-name-search"/>'
            //+ '         <button class="bx-btn bx-btn-small cnd-tpl-search">' + bxMsg('ButtonBottomString4') + '</button>'
        +'                <button class="bw-btn cnd-tpl-search" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        + '     </div>'
        + ' </header>'
        + ' <div class="popup-cnd-tpl-grid"></div>'
        + '</div>';

    $('#cnd-grp-tpl-popup').html(htmlString);

    var cndGrpTplPopup = Handlebars.compile($('#cnd-grp-tpl-popup').html());
    var cndPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('MTP0103Title'),
        width: 500,
        height: 330,
        contents: cndGrpTplPopup(),
        submit: function () {
            submitEvent(cndPopupGrid.getSelectedItem());
        },
        contentsEvent: {
            'click .cnd-tpl-search': function () {
                var requestParam = {
                    'conditionGroupTemplateTypeCode': '01',
                    'conditionGroupTemplateName': $('.cnd-grp-tpl-popup .cnd-name-search').val(),
                    'likeQueryYn': 'Y'
                };
                search(requestParam);
            }
        },
        listeners: {
            afterRenderUI: function () {
                var requestParam = {
                    'conditionGroupTemplateTypeCode': '01',
                    'likeQueryYn': 'Y'
                };
                search(requestParam);
            }
        }
    });

    function search(requestParam){
        PFRequest.get('/conditionGroup/template/queryConditionGroupTemplateBaseForList.json', requestParam, {
            success: function (responseData) {

                $('.cnd-grp-tpl-popup .popup-cnd-tpl-grid').empty();

                cndPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['name', 'code', 'type', 'isActive'],
                    gridConfig: {
                        selType: 'checkboxmodel',
                        renderTo: '.popup-cnd-tpl-grid',
                        columns: [
                            {text: bxMsg('MTM0100String7'), flex: 1, dataIndex: 'code'},
                            {text: bxMsg('MTM0100String8'), flex: 1, dataIndex: 'name'},
                            {
                                text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                                renderer: function (value, p, record) {
                                    if (value === 'Y') {
                                        return bxMsg('active');
                                    } else if (value === 'N') {
                                        return bxMsg('inactive');
                                    }
                                }
                            }
                        ]
                    }
                });

                cndPopupGrid.setData(responseData);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'queryListCndGroupTemplate'
            }
        });
    }
}


/**
 * 조건템플릿코드 선택 팝업(단일그리드)
 * script : <script id="cnd-tpl-popup" type="text/x-handlebars-template"></script>
 * input  : submitEvent
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 * mode : 'MULTI'(default), 'SINGLE'
 * paramList : 리스트에 들어있는 유형의 조건들만 보여줌. ['LIST', 'RANGE', 'INTEREST', 'FEE'], 없으면 모든 유형의 조건
 */
function renderConditionTemplateListSearchPopup(submitEvent, selMode, paramList) {
    var htmlString
        = '<div class="cnd-tpl-popup">                                                                                              '
        + '    <div class="search-box">                                                                                             '
        + '        <header class="popup-cnd-tpl-grid-header grid-extra-header">                                                     '
        + '            <div class="header-group">                                                                                   '
        + '                <span style="float:none;" class="">' +bxMsg('DPP0127String3')+ ': </span>                                                    ' // 2017.02.28 float:none추가 상품그룹에서 위치깨짐
        + '                <select class="bx-form-item bx-compoenent-small select-item cnd-type-select">                            '
        + '                </select>                                                                                                '
        +                  bxMsg('DTP0203String2')+ ': <input type="text" class="bx-form-item bx-compoenent-small cnd-name-search"/>'
            //+ '                <button class="bx-btn bx-btn-small cnd-tpl-search">'+bxMsg('ButtonBottomString4')+ '</button>            '
        +'                <button class="bw-btn cnd-tpl-search" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        + '            </div>                                                                                                       '
        + '        </header>                                                                                                        '
        + '        <div class="popup-cnd-grid"></div>                                                                               '
        + '    </div>                                                                                                               '
        + '</div>                                                                                                                   ';

    $('#cnd-tpl-popup').html(htmlString);

    var cndPopupTpl = Handlebars.compile($('#cnd-tpl-popup').html());
    var cndPopupGrid;
    var paramMap;

    if(!selMode){
        selMode = 'MULTI';
    }

    if(paramList){
        paramMap={};
        paramList.forEach(function(el){
            if(el === 'LIST'){
                paramMap['01'] = 'LIST';
            }else if(el === 'RANGE'){
                paramMap['02'] = 'RANGE';
            }else if(el === 'INTEREST'){
                paramMap['03'] = 'INTEREST';
            }else if(el === 'FEE'){
                paramMap['04'] = 'FEE';
            }
        });
    }

    PFComponent.makePopup({
        title: bxMsg('DTP0203Title'),		// 조건선택
        width: 500,
        height: 330,
        contents: cndPopupTpl(),
        submit: function() {
            submitEvent(cndPopupGrid.getSelectedItem());
        },
        contentsEvent: {
            // 검색버튼 클릭 시
            'click .cnd-tpl-search': function() {
                var requestParam = {
                    'conditionName': $('.cnd-tpl-popup .cnd-name-search').val(),		// 조건명
                };

                var comboVal = $('.cnd-tpl-popup .cnd-type-select').val();			// 조건유형 콤보

                if (comboVal) {
                    requestParam.conditionTypeCode = comboVal;						// 조건유형값
                }

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {

                        $('.cnd-tpl-popup .popup-cnd-grid').empty();


                        if(!requestParam.conditionTypeCode && paramMap){
                            for(var i  = 0; i < responseData.length ; i++){
                                if(!paramMap[responseData[i].type]){
                                    responseData.splice(i, 1);
                                    i -= 1;
                                }
                            }
                        }

                        cndPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                                name: 'typeNm',
                                convert: function(newValue, record) {
                                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                                    return typeNm;
                                }}],
                            gridConfig: {
                                selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: selMode}),
                                renderTo: '.popup-cnd-grid',
                                columns: [
                                    {text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code'},
                                    {text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm'},
                                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                    {text: bxMsg('DPS0101String6'), width: 60, dataIndex: 'isActive',
                                        renderer: function(value, p, record) {
                                            if (value === 'Y') {
                                                return bxMsg('active');
                                            } else if (value === 'N') {
                                                return bxMsg('inactive');
                                            }
                                        }
                                    },
                                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                                ]
                            }
                        });

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            }
        },
        listeners: {
            afterRenderUI: function() {
                var options = [];

                var $defaultOption = $('<option>');
                $defaultOption.text(bxMsg('Z_All'));
                $defaultOption.val('');

                options.push($defaultOption);

                $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
                    var $option = $('<option>');
                    if(!paramMap || paramMap[key]){

                        $option.val(key);
                        $option.text(value);

                        options.push($option);
                    }

                });

                $('.cnd-tpl-popup .cnd-type-select').html(options);

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', {
                    success: function(responseData) {

                        if(paramMap){
                            for(var i  = 0; i < responseData.length ; i++){
                                if(!paramMap[responseData[i].type]){
                                    responseData.splice(i, 1);
                                    i -= 1;
                                }
                            }
                        }
                        cndPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                                name: 'typeNm',
                                convert: function(newValue, record) {
                                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                                    return typeNm;
                                }}],
                            gridConfig: {
                                selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: selMode}),
                                renderTo: '.popup-cnd-grid',
                                columns: [
                                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                                        renderer: function(value, p, record) {
                                            if (value === 'Y') {
                                                return bxMsg('active');
                                            } else if (value === 'N') {
                                                return bxMsg('inactive');
                                            }
                                        }
                                    },
                                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                                ]
                            }
                        });

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            }
        }
    });
}

/**
 * 조건템플릿코드 선택 팝업(좌우그리드)
 * script : <script id="add-cnd-popup" type="text/x-handlebars-template"></script>
 * input  : submitEvent
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 */
function renderConditionTemplateListSelectPopup(submitEvent){
    var htmlString
        =  '  <div class="cnd-2-grd-tpl-popup">                                                                                        '
        +'        <div class="search-box" style=" display: inline-block;">                                                             '
        +'            <header class="popup-cnd-tpl-grid-header grid-extra-header">                                                     '
        +'                <div class="header-group" style="float: right; height:30px; width:470px;">                                                             '
        +'                    <span class="">'+bxMsg('DPP0127String3')+' : </span>                                                     '
        +'                    <select class="bx-form-item bx-compoenent-small select-item cnd-type-select" style="width: 120px;">      '
        +'                    </select>                                                                                                '
        +'                    <span style="margin-left:30px;">'+bxMsg('DTP0203String2')+' : </span>                                    '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small cnd-name-search" style="width: 150px;"/>      '
        +'                    <button type="button" class="bw-btn cnd-tpl-search" title="'+bxMsg('ButtonBottomString4')+'">            '
        +'                        <i class="bw-icon i-25 i-search"></i>                                                                '
        +'                    </button>                                                                                                '
        +'                </div>                                                                                                       '
        +'            </header>                                                                                                        '
        +'            <div class="popup-cnd-grid" style="height: 230px;"></div>                                                        '
        +'        </div>                                                                                                               '
        +'        <button class="search-list-add-btn write-btn" style="width: 51px; height: 280px; vertical-align: top;float: inherit;">>></button>   '
        +'        <div class="choose-cnd-grid" style="height: 230px; width: 117px; display: inline-block;"></div>                      '
        +'    </div>                                                                                                                   ';

    $('#cnd-2-grd-tpl-popup').html(htmlString);

    var cndPopupTpl = Handlebars.compile($('#cnd-2-grd-tpl-popup').html());

    var cndPopupGrid;
    var chooseCndGrid;

    PFComponent.makePopup({
        title: bxMsg('DTP0203Title'),
        width: 676,
        height: 330,
        contents: cndPopupTpl(),
        submit: function(){
            submitEvent(chooseCndGrid.getAllData());
        },
        contentsEvent: {
            'click .cnd-tpl-search': function() {
                var requestParam = {
                    'conditionName': $('.cnd-2-grd-tpl-popup .cnd-name-search').val(),
                    'activeYn': 'Y'
                };

                var comboVal = $('.cnd-2-grd-tpl-popup .cnd-type-select').val();

                if (comboVal) {
                    requestParam.conditionTypeCode = comboVal;
                }

                if($('.cnd-tpl-type-select').val() == '03') {
                    requestParam = {
                        conditionTypeCode : '04',
                        conditionDetailTypeCode:'04.10',
                        conditionName : $('.cnd-2-grd-tpl-popup .cnd-name-search').val()
                    }
                }

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            },
            'click .search-list-add-btn' : function(){
                chooseCndGrid.addData(cndPopupGrid.getSelectedItem());
            }
        },
        listeners: {
            afterRenderUI: function() {
                var requestParam = {};

                var options = [];

                // 상품조건만 전체 세팅
                if($('.cnd-tpl-type-select').val() == '01') {
                    var $defaultOption = $('<option>');
                    $defaultOption.text(bxMsg('Z_All'));
                    $defaultOption.val('');

                    options.push($defaultOption);

                    requestParam = {activeYn : 'Y'}
                }
                // 02 우대금리 : 조건템플릿 타입 03
                else if($('.cnd-tpl-type-select').val() == '02') {
                    requestParam = {conditionTypeCode : '03'}
                }
                // 03 공통수수료 : 조건템플릿 타입 04
                else if($('.cnd-tpl-type-select').val() == '03') {
                    requestParam = {conditionTypeCode : '04', conditionDetailTypeCode:'04.10'}
                }

                $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){

                    switch($('.cnd-tpl-type-select').val()){
                        case '02' : // 우대금리
                            if(key !== '03') return;
                            break;
                        case '03' : // 공통수수료
                            if(key !== '04') return;
                            break;
                        case '07' : // 공통조건
                            if(key == '04') return;
                            break;
                    }

                    var $option = $('<option>');
                    $option.val(key);
                    $option.text(value);

                    options.push($option);
                });

                $('.cnd-2-grd-tpl-popup .cnd-type-select').html(options);

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {

                        cndPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                                name: 'typeNm',
                                convert: function(newValue, record) {
                                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                                    return typeNm;
                                }}],
                            gridConfig: {
                                selType: 'checkboxmodel',
                                renderTo: '.popup-cnd-grid',
                                columns: [
                                    {text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code'},
                                    {text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm'},
                                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                    {text: bxMsg('DPS0101String6'), width: 60, dataIndex: 'isActive',
                                        renderer: function(value, p, record) {
                                            if (value === 'Y') {
                                                return bxMsg('active');
                                            } else if (value === 'N') {
                                                return bxMsg('inactive');
                                            }
                                        }
                                    },
                                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                                ]
                            }
                        });

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });

                chooseCndGrid = PFComponent.makeExtJSGrid({
                    fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                        name: 'typeNm',
                        convert: function(newValue, record) {
                            var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                            return typeNm;
                        }}],
                    gridConfig: {
                        renderTo: '.choose-cnd-grid',
                        columns: [
                            {text: bxMsg('DTP0203String3'), flex: 1, dataIndex: 'code'},
                            {
                                xtype: 'actioncolumn', width: 35, align: 'center',
                                items: [{
                                    icon: '/images/x-delete-16.png',
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        record.destroy();
                                    }
                                }]
                            }
                        ]
                    }
                });
            }
        }
    });
}

/**
 * 적용규칙 HISTORY 팝업
 * script : <script id="apply-rule-history-popup" type="text/x-handlebars-template"></script>
 * input  : param {ruleApplyTargetDistinctionCode,	// 규칙적용대상구분코드 : 01.우대금리적용규칙, 02.수수료할인, 03.우대금리제공조건, 04.수수료할인제공조건
 * 				   cndGroupTemplateCode, 			// 조건그룹템플릿코드 (02,03,04 인 경우 필수)
 * 				   cndGroupCode, 		 			// 조건그룹코드		 (02,03,04 인 경우 필수)
 *   		       cndCode,				 			// 조건코드		 (02,03,04 인 경우 필수)
 *   			   feeDiscountSequenceNumber,		// 수수료할인일련번호 (04 인 경우 필수)
 *   			   pdCode							// 상품코드		 (01 인 경우 필수)
 *   			   }
 */
function renderApplyRuleHistoryPopup(param) {
    var htmlString
        = '<div class="apply-rule-history-popup">                                                                                              '
        + '    <div class="search-box">                                                                                             '
        + '        <div class="popup-cnd-grid"></div>                                                                               '
        + '    </div>                                                                                                               '
        + '</div>                                                                                                                   ';

    $('#apply-rule-history-popup').html(htmlString);

    var cndPopupTpl = Handlebars.compile($('#apply-rule-history-popup').html());
    var cndPopupGrid;

    var columns = [
        {text: bxMsg('ApplyRuleId')	  , flex: 1, dataIndex: 'ruleId'},
        {text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate'},
        {text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate'}
    ];

    if(param.ruleApplyTargetDistinctionCode == '01'){             // 규칙적용대상구분코드 = 01.우대금리적용규칙

        columns.push({
            text: bxMsg('PAS0102String10')	  ,  // 유형
            flex: 0.3,
            dataIndex: 'rateAmountDistinctionCode',
            renderer: function(value) {
                return codeMapObj.FeeTypeCode[value];
            }
        });

        columns.push({
            text: bxMsg('DPS0121_4String6')+bxMsg('DPS0121_5String1')   ,
            flex: 0.5, align:'right'	, style: 'text-align:left',
            dataIndex: 'maxDiscount',
            renderer: function(value) {
                return !value ? 0 : value ;
            }
        });

    }else if(param.ruleApplyTargetDistinctionCode == '02'){       // 규칙적용대상구분코드 = 02.수수료할인

        columns.push({
            text: bxMsg('MaxDiscount')   ,
            flex: 0.5, align:'right'	, style: 'text-align:left',
            dataIndex: 'maxDiscount',
            renderer: function(value) {
                return !value ? 0 : value ;
            }
        });

    }

    columns.push({text: bxMsg('ApplyRule')	  , flex: 1, dataIndex: 'ruleContent'});

    PFComponent.makePopup({
        title: bxMsg('ApplyRuleHistory'),		// 적용규칙 이력조회
        width: 800,
        height: 330,
        contents: cndPopupTpl(),
        listeners: {
            afterRenderUI: function() {

                cndPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['ruleId', 'ruleContent', 'rateAmountDistinctionCode', 'maxAmount', 'maxRate', 'applyStartDate', 'applyEndDate',
                        {
                            name: 'maxDiscount',
                            convert: function (newValue, record) {
                                return record.get('rateAmountDistinctionCode') == '02' ? record.get('maxAmount') : record.get('maxRate');
                            }
                        }
                    ],
                    gridConfig: {
                        renderTo: '.popup-cnd-grid',
                        columns: columns
                    }
                });

                if(param.ruleId) {
                	param.pdInfoDscd = pdInfoDscd; // OHS 20171207 추가 - PdInfoDscd 필수입력값 세팅(값 누락시 조회되지 않음)
                    PFRequest.get('/benefit/getListBenefitRuleMasterHistory.json', param, {
                        success: function (responseData) {
                            cndPopupGrid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitRuleMasterService',
                            operation: 'queryListBenefitRuleMaster'
                        }
                    });
                }
            }
        }
    });
}

/**
 * 상품유형조회
 * script : <script id="product-type-popup" type="text/x-handlebars-template"></script>
 * input : pdInfoCd, bizDscd
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 */
function renderPdTpPopup(pdInfoDscd, bizDscd, submitEvent){
    var htmlString
        = '<div class="product-type-popup">                                                                                              '
        + '    <div class="product-type-popup-grid-wrap">                                                                                             '
        + '        <div class="product-type-popup-grid" style="height: 220px"></div>                                                                               '
        + '    </div>                                                                                                               '
        + '</div>                                                                                                                   ';

    $('#product-type-popup').html(htmlString);

    var pdTpPopupTpl = Handlebars.compile($('#product-type-popup').html());
    var pdTpPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DPS0101String11'),
        width: 500,
        height: 300,
        contents: pdTpPopupTpl(),
        submit: function () {
            submitEvent(pdTpPopupGrid.getSelectedItem()[0]);
        },
        listeners: {
            afterSyncUI: function () {
                pdTpPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['id', 'name',
                        {
                            name: 'code',
                            convert: function(newValue, record) {
                                return record.get('id').substr(3,4);
                        }}],
                    gridConfig: {
                        selType: 'checkboxmodel',
                        renderTo: '.product-type-popup-grid',
                        columns: [
                            {text: bxMsg('pdTpDscd'), width: 80, dataIndex: 'code'},
                            {text: bxMsg('pdTpDscdNm'), flex: 1, dataIndex: 'name'}
                        ]
                    }
                });


                    var requestParam = {
                        'idType': '04'
                        , 'treeType': 'PD'
                        , 'id': bizDscd
                        , 'pdInfoDscd': pdInfoDscd
                    };
                    PFRequest.get('/catalog/getCatalog.json', requestParam, {
                        success: function (responseData) {
                            pdTpPopupGrid.setData(responseData.childCatalogs);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        }
                    });


            }
        }
    });
}

/**
 * 상품템플릿조회
 * script : <script id="product-template-popup" type="text/x-handlebars-template"></script>
 * input : pdInfoCd, bizDscd, pdTpCd
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 */
function renderPdTemplatePopup(pdInfoDscd, bizDscd, pdTpCd, submitEvent){
    var htmlString
        = '<div class="product-template-popup">                                                                                              '
        + '    <div class="product-template-popup-grid-wrap">                                                                                             '
        + '        <div class="product-template-popup-grid" style="height: 220px"></div>                                                                               '
        + '    </div>                                                                                                               '
        + '</div>                                                                                                                   ';

    $('#product-template-popup').html(htmlString);

    var pdTmpltPopupTpl = Handlebars.compile($('#product-template-popup').html());
    var pdTmpltPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DPS0101String3'),
        width: 500,
        height: 300,
        contents: pdTmpltPopupTpl(),
        submit: function () {
            submitEvent(pdTmpltPopupGrid.getSelectedItem()[0]);
        },
        listeners: {
            afterSyncUI: function () {
                pdTmpltPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['id', 'name','code'],
                    gridConfig: {
                        selType: 'checkboxmodel',
                        renderTo: '.product-template-popup-grid',
                        columns: [
                            {text: bxMsg('pdTmpltCd'), width: 80, dataIndex: 'code'},
                            {text: bxMsg('pdTmpltNm'), flex: 1, dataIndex: 'name'}
                        ]
                    }
                });


                var requestParam = {
                      'treeType': 'PD'
                    , 'pdInfoDscd': pdInfoDscd
                    , 'firstCatalogId': bizDscd
                    , 'secondCatalogId': pdTpCd
                    , 'id' : pdTpCd
                };
                PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
                    success: function (responseData) {
                        pdTmpltPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdTemplateService',
                        operation: 'queryListPdTemplate'
                    }
                });


            }
        }
    });
}

/**
 * 상품템플릿조회
 * script : <script id="search-product-template-popup" type="text/x-handlebars-template"></script>
 * input : pdInfoCd
 * output : getSelectedItem()
 * submit 호출 시 submitEvent(getSelectedItem())를 호출해줌.
 */
function searchPdTemplatePopup(submitEvent, searchPdInfoDscd){
    var htmlString
        = '<div class="search-product-template-popup">                                                                                              '
    	+'    <div class="bx-info-table-wrap">                                                                                                   '
        +'        <table class="bx-info-table">                                                                          '
        +'            <tr>                                                                                                                       '
        +'                <th style="width:60px">'+bxMsg('category')+'</th>                                                                                    '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="businessDistinctionCode" class="bx-form-item bx-compoenent-small first-category-select">  '
        +'                    </select>                                                                                                          '
        +'                    <select data-form-param="productTypeCode" class="bx-form-item bx-compoenent-small second-category-select">         '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'        </table>                                                                                                                       '
        +'    </div>                                                                                                                             '
        + '    <div class="product-template-popup-grid-wrap" style="padding-top: 5px;">                                                                                             '
        + '        <div class="product-template-popup-grid" style="height: 220px"></div>                                                                               '
        + '    </div>                                                                                                               '
        + '</div>                                                                                                                   ';

    $('#search-product-template-popup').html(htmlString);

    var pdTmpltPopupTpl = Handlebars.compile($('#search-product-template-popup').html());
    var pdTmpltPopupGrid;

    if(searchPdInfoDscd === '01'){
        title = bxMsg('DPS0101String3');
    }else if(searchPdInfoDscd === '02'){
        title = bxMsg('ServiceTemplate');
    }else if(searchPdInfoDscd === '03'){
        title = bxMsg('PointTemplate');
    }

    PFComponent.makePopup({
        title: title,
        width: 500,
        height: 330,
        contents: pdTmpltPopupTpl(),
        submit: function () {
            submitEvent(pdTmpltPopupGrid.getSelectedItem()[0]);
        },
        contentsEvent: {
        	'change .first-category-select': function (e) {
        		var firstCategoryId = $(e.currentTarget).val();

                if (firstCategoryId != '') {
                    var secondCategoryOptions = [];
                    secondCategoryOptions.push($('<option>'));

                    var requestParam = {
                        'idType': '04'
                        , 'treeType': 'PD'
                        , 'id': firstCategoryId
                        , 'pdInfoDscd': searchPdInfoDscd
                        //, 'tntInstId': tntInstId
                    };
                    PFRequest.get('/catalog/getCatalog.json', requestParam, {
                        success: function (responseDate) {
                            secondCategoryMap = {};
                            if(responseDate.childCatalogs && responseDate.childCatalogs.length > 0){
	                            $.each(responseDate.childCatalogs, function (index, category) {

	                                category.code = category.id.substr(3, 4);
	                                secondCategoryMap[category.code] = category;

	                                var $option = $('<option>');
	                                $option.val(category.code);
	                                $option.text(category.name);
	                                secondCategoryOptions.push($option);
	                            });
	                            $('.second-category-select').html(secondCategoryOptions);
                            }
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        }
                    });
                }
        	},
        	'change .second-category-select': function (e) {
        		var requestParam = {
		              'treeType': 'PD'
		            , 'pdInfoDscd': searchPdInfoDscd
		            , 'firstCatalogId':  $('.first-category-select').val()
		            , 'secondCatalogId': $('.second-category-select').val()
//		            , 'id' : $('.second-category-select').val()
		        };
		        PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
		            success: function (responseData) {
		                pdTmpltPopupGrid.setData(responseData);
		            },
		            bxmHeader: {
		                application: 'PF_Factory',
		                service: 'PdTemplateService',
		                operation: 'queryListPdTemplate'
		            }
		        });
        	}
        },
        listeners: {
            afterSyncUI: function () {
                pdTmpltPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['id', 'name','code'],
                    gridConfig: {
                    	selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                        renderTo: '.product-template-popup-grid',
                        columns: [
                            {text: bxMsg('pdTmpltCd'), width: 80, dataIndex: 'code'},
                            {text: bxMsg('pdTmpltNm'), flex: 1, dataIndex: 'name'}
                        ]
                    }
                });

                // set first category select
                var firstCategoryOptions = [];
                firstCategoryOptions.push($('<option>'));

                if(searchPdInfoDscd === '01') {
                    $.each(codeArrayObj['ProductCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }

                else if(searchPdInfoDscd === '02') {
                    $.each(codeArrayObj['ServiceCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }

                else if(searchPdInfoDscd === '03'){
                    $.each(codeArrayObj['PointCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }
                $('.first-category-select').html(firstCategoryOptions);

            }
        }
    });
}

/* 가맹점조회 */
function renderMerchantSearchPopup(submitEvent) {
    var htmlString
        ='<div class="merchant-search-popup">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('merchantName')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="merchantName">'
            //+'                <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                            '
        +'    <div class="merchant-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#merchant-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#merchant-search-popup').html());
    var grid;

    PFComponent.makePopup({
        title: bxMsg('merchantSearch'),
        contents: popupTpl(),
        width: 500,
        height: 300,
        submit: function () {
            submitEvent(grid.getSelectedItem()[0]);
        },
        contentsEvent: {
            'click .search-btn': function () {
                var requestParam = PFComponent.makeYGForm($('.merchant-search-popup table')).getData();
                PFRequest.get('/merchant/getListMerchantMaster.json', requestParam, {
                    success: function (responseData) {
                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'MerchantService',
                        operation: 'queryList'
                    }
                })
            }
        },
        listeners: {
            afterRenderUI: function () {

                grid = PFComponent.makeExtJSGrid({
                    fields: [
                        'merchantCode', 'merchantName'
                    ],
                    gridConfig: {
                        selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                        renderTo: '.merchant-search-popup .merchant-list-grid',
                        columns: [
                            {
                                text: bxMsg('merchantNo'),
                                flex: 1,
                                dataIndex: 'merchantCode',
                                sortable: false,
                                align: 'center'
                            },
                            {
                                text: bxMsg('merchantName'),
                                flex: 2,
                                dataIndex: 'merchantName',
                                sortable: false,
                                style: 'text-align:center'
                            },
                        ]
                    }
                });

            }
        }
    });
}

// 가맹점 그룹 조회
function renderMerchantGroupSearchPopup(submitEvent) {
    var htmlString
        ='<div class="merchant-group-search-popup">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('merchantGroupName')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="merchantGroupName">'
            //+'                <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                            '
        +'    <div class="merchant-group-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#merchant-group-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#merchant-group-search-popup').html());
    var grid;

    PFComponent.makePopup({
        title: bxMsg('merchantGroupSearch'),
        contents: popupTpl(),
        width: 500,
        height: 300,
        submit: function () {
            submitEvent(grid.getSelectedItem()[0]);
        },
        contentsEvent: {
            'click .search-btn': function () {
                var requestParam = PFComponent.makeYGForm($('.merchant-group-search-popup table')).getData();
                requestParam.activeYn = 'Y';
                PFRequest.get('/merchant/getListMerchantGroupMaster.json', requestParam, {
                    success: function (responseData) {
                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'MerchantGroupService',
                        operation: 'queryList'
                    }
                });
            }
        },
        listeners: {
            afterRenderUI: function () {

                PFRequest.get('/merchant/getListMerchantGroupMaster.json', {}, {
                    success: function (responseData) {
                        grid = PFComponent.makeExtJSGrid({
                            fields: [
                                'merchantGroupCode', 'merchantGroupName'
                            ],
                            gridConfig: {
                                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                                renderTo: '.merchant-group-search-popup .merchant-group-list-grid',
                                columns: [
                                    {
                                        text: bxMsg('merchantGroupCd'),
                                        flex: 1,
                                        dataIndex: 'merchantGroupCode',
                                        sortable: false,
                                        align: 'center'
                                    },
                                    {
                                        text: bxMsg('merchantGroupName'),
                                        flex: 2,
                                        dataIndex: 'merchantGroupName',
                                        sortable: false,
                                        style: 'text-align:center'
                                    },
                                ]
                            }
                        });

                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'MerchantGroupService',
                        operation: 'queryList'
                    }
                })

            }
        }
    });
}

function renderEmployeeSearchPopup(submitEvent) {

    var htmlString
        ='<div class="employee-search-popup">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('employeeName')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="staffName">'
            //+'                <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                            '
        +'    <div class="employee-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#employee-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#employee-search-popup').html());
    var grid;

    PFComponent.makePopup({
        title: bxMsg('employeeSearch'),
        contents: popupTpl(),
        width: 500,
        height: 300,
        submit: function () {
            submitEvent(grid.getSelectedItem()[0]);
        },
        contentsEvent: {
            'click .search-btn': function () {
                var requestParam = PFComponent.makeYGForm($('.employee-search-popup table')).getData();
                PFRequest.get('/common/queryUserInfoForList.json', requestParam, {
                    success: function (responseData) {
                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonService',
                        operation: 'queryListUserInfo'
                    }
                })
            }
        },
        listeners: {
            afterRenderUI: function () {

                PFRequest.get('/common/queryUserInfoForList.json', {}, {
                    success: function (responseData) {
                        grid = PFComponent.makeExtJSGrid({
                            fields: [
                                'staffId', 'staffName'
                            ],
                            gridConfig: {
                                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                                renderTo: '.employee-search-popup .employee-list-grid',
                                columns: [
                                    {
                                        text: bxMsg('employeeNumber'),
                                        flex: 1,
                                        dataIndex: 'staffId',
                                        sortable: false,
                                        align: 'center'
                                    },
                                    {
                                        text: bxMsg('employeeName'),
                                        flex: 1,
                                        dataIndex: 'staffName',
                                        sortable: false,
                                        align: 'center'
                                    },
                                ]
                            }
                        });

                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonService',
                        operation: 'queryListUserInfo'
                    }
                })

            }
        }
    });
}

// 공통코드 상세 팝업
function renderCommonCodeDetailPopup(submitEvent, code, codeNm) {

    var htmlString
        ='<div class="common-code-detail-search-popup">                                                                     '
        +'    <div class="common-code-detail-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#common-code-detail-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#common-code-detail-search-popup').html());
    var grid;

    if(!codeNm){
        codeNm = bxMsg('DomainCodeDetail');
    }

    PFComponent.makePopup({
        title: codeNm +  bxMsg('ButtonBottomString4'),
        contents: popupTpl(),
        width: 500,
        height: 300,
        submit: function () {
            submitEvent(grid.getSelectedItem()[0]);
        },
        listeners: {
            afterRenderUI: function () {

                PFRequest.get('/commonCode/getCommonCodeDetailList.json', {activeYn : 'Y', domainCode:code}, {
                    success: function (responseData) {
                        grid = PFComponent.makeExtJSGrid({
                            fields: [
                                'instanceCode', 'instanceName'
                            ],
                            gridConfig: {
                                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                                renderTo: '.common-code-detail-search-popup .common-code-detail-list-grid',
                                columns: [
                                    {
                                        text: bxMsg('InstanceCode'),
                                        flex: 1,
                                        dataIndex: 'instanceCode',
                                        sortable: false
                                    },
                                    {
                                        text: bxMsg('InstanceCodeName'),
                                        flex: 2,
                                        dataIndex: 'instanceName',
                                        sortable: false
                                    },
                                ]
                            }
                        });

                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeDetailService',
                        operation: 'queryListCommonCodeDetail'
                    }
                })

            }
        }
    });
}


// 공통코드 팝업
function renderCommonCodePopup(submitEvent) {

    var htmlString
        ='<div class="common-code-search-popup">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('DomainContent')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="domainContent">'
            //+'                <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                            '
        +'    <div class="common-code-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#common-code-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#common-code-search-popup').html());
    var grid;

    PFComponent.makePopup({
        title: bxMsg('CommonCode') +  bxMsg('ButtonBottomString4'),
        contents: popupTpl(),
        width: 500,
        height: 300,
        submit: function () {
            submitEvent(grid.getSelectedItem()[0]);
        },
        contentsEvent: {
            'click .search-btn': function () {
                var requestParam = PFComponent.makeYGForm($('.common-code-search-popup table')).getData();
                requestParam.activeYn = 'Y';

                PFRequest.get('/commonCode/getCommonCodeMasterList.json', requestParam, {
                    success: function (responseData) {
                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeMasterService',
                        operation: 'queryListCommonCodeMaster'
                    }
                })
            }
        },
        listeners: {
            afterRenderUI: function () {

                PFRequest.get('/commonCode/getCommonCodeMasterList.json', {activeYn : 'Y'}, {
                    success: function (responseData) {
                        grid = PFComponent.makeExtJSGrid({
                            fields: [
                                'domainCode', 'domainContent'
                            ],
                            gridConfig: {
                                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                                renderTo: '.common-code-search-popup .common-code-list-grid',
                                columns: [
                                    {
                                        text: bxMsg('DomainCode'),
                                        flex: 1,
                                        dataIndex: 'domainCode',
                                        sortable: false
                                    },
                                    {
                                        text: bxMsg('DomainContent'),
                                        flex: 2,
                                        dataIndex: 'domainContent',
                                        sortable: false
                                    },
                                ]
                            }
                        });

                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeMasterService',
                        operation: 'queryListCommonCodeMaster'
                    }
                })

            }
        }
    });
}

// 제공조건 부가정보 팝업
function renderAddInfoPopup(submitEvent, data, isReadOnly) {

    var htmlString
        ='<div class="prov-cnd-add-info-popup">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>' + bxMsg('DAS0101String11') + '</label>                                             '     // 일련번호
        +'                <input disabled type="text" class="bx-compoenent-small bx-form-item width-80" data-form-param="providedConditionSequenceNumber" value="{{providedConditionSequenceNumber}}">'
        +'            </td>                                                                                       '
        +'            <td>                                                                                        '
        +'                <label>' + bxMsg('providedCondition') + '</label>                                             ' // 제공조건
        +'                <input disabled type="text" class="bx-compoenent-small bx-form-item width-80" data-form-param="providedConditionCode" value="{{providedConditionCode}}">'
        +'                <input disabled type="text" class="bx-compoenent-small bx-form-item width-250" data-form-param="providedConditionName" value="{{providedConditionName}}">'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                          '
        +'    <header class="fee-dis-complex-grid-header grid-extra-header">'
        +'        <div class="header-group">'
            //+'            <button class="bx-btn bx-btn-small product-add-btn write-btn">'+ bxMsg('ButtonBottomString8') + '</button>'
        +'                <button class="bw-btn product-add-btn write-btn" icon-tooltip=' + bxMsg("ButtonBottomString8") + '><i class="bw-icon i-25 i-func-add"></i></button>'
        +'        </div>'
        +'    </header>'
        +'    <div class="prov-cnd-add-info-list-grid"></div> '
        +'</div>';

    $('#prov-cnd-add-info-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#prov-cnd-add-info-popup').html());
    var grid;


    PFComponent.makePopup({
        title: bxMsg('DPM10002Sring8'), // 부가정보
        contents: popupTpl(data),
        width: 600,
        height: 330,
        submit: function () {
            submitEvent(grid.getAllData());
        },
        contentsEvent: {
            'click .product-add-btn': function () {

                var submitEvent = function (selectItem) {

                    selectItem.forEach(function(el){
                        el.additionalInfoValue = el.code;
                        el.additionalInfoValueName = el.name;
                        el.additionalInfoTypeDscd = '01';   // 상품
                        el.provideCndSequenceNumber = data.providedConditionSequenceNumber;
                        el.applyStartDate = data.applyStartDate;

                        delete el.code;
                        delete el.name;

                        grid.addData(el);
                    });
                };

                makeSearchProductListPopup(submitEvent);
            }
        },
        listeners: {
            afterRenderUI: function () {

                var columns = [
                    {
                        text: bxMsg('PAS0102String10'),  flex:1, dataIndex: 'additionalInfoTypeDscd',
                        style: 'text-align:center',
                        renderer: function(value) {
                            return codeMapObj.AdtnlInfoTpDscd[value] || value;
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
                                data: codeArrayObj['AdtnlInfoTpDscd']
                            })
                        }
                    },
                    {
                        text : bxMsg('PAS0203String3'),
                        flex:5,
                        dataIndex: 'content',
                        sortable: false,
                        style: 'text-align:center'
                    }
                ];

                // 권한이 없는 경우
                if(writeYn != 'Y' || isReadOnly){
                    $('.write-btn').hide();
                }else{
                    columns.push({
                        xtype: 'actioncolumn', width: 35, align: 'center',
                        items: [{
                            icon: '/images/x-delete-16.png',
                            handler: function (grid, rowIndex, colIndex, item, e, record) {
                                modifyFlag = true;
                                record.destroy();
                            }
                        }]
                    });
                }

                grid = PFComponent.makeExtJSGrid({
                    fields: [
                        'provideCndSequenceNumber', 'additionalInfoTypeDscd', 'additionalInfoValue', 'additionalInfoValueName',
                        'applyStartDate',
                        {
                            name: 'content',
                            convert: function(newValue, record) {
                                var value = record.get('additionalInfoValue') + '(' + record.get('additionalInfoValueName') + ')';
                                return value;
                            }
                        }
                    ],
                    gridConfig: {
                        renderTo: '.prov-cnd-add-info-popup .prov-cnd-add-info-list-grid',
                        columns : columns
                    }
                });

                if(data.provideCndAdditionalInfoDetailList) {
                    grid.setData(data.provideCndAdditionalInfoDetailList);
                }
            }
        }
    });
}


/**
 * 상품검색 팝업
 * script :  <script id="pf-cp-base-rel-product-add-popup" type="text/x-handlebars-template"></script>
 * @param submitEvent
 * @param searchPdInfoDscd
 * @param isSelectTemplate (true or false) - true : 카테고리를 선택후 검색을 하면 '전체'라는 리스트가 추가됨
 *                                           false : '전체'가 포함되지 않음
 * @param isSelectTemplate (true or false) - true : 카테고리를 선택후 검색을 하면 '전상품'라는 리스트가 추가됨
 */
function makeSearchProductListPopup(submitEvent, searchPdInfoDscd, isSelectTemplate, isSelectAllProduct) {

	var secondCategoryMap;
    var thirdCategoryMap;
    var productGrid;

    var title, code, name;

    if(searchPdInfoDscd === null || !searchPdInfoDscd){
        searchPdInfoDscd = '01'
    }

    if(searchPdInfoDscd === '01'){
        title = bxMsg('DPP0107Title');
        code = bxMsg('DPS0106String2');
        name = bxMsg('pdNm');
    }else if(searchPdInfoDscd === '02'){
        title = bxMsg('selectRelatedService');
        code = bxMsg('ServiceCode');
        name = bxMsg('ServiceName');
    }else if(searchPdInfoDscd === '03'){
        title = bxMsg('selectRelatedPoint');
        code = bxMsg('PointCode');
        name = bxMsg('PointName');
    }

    var htmlString
        ='<div class="pf-cp-base-rel-product-add-popup">																						   '
        +'    <div class="bx-info-table-wrap">                                                                                                   '
        +'        <table class="bx-info-table rel-product-search-form">                                                                          '
        +'            <tr>                                                                                                                       '
        +'                <th>'+bxMsg('category')+'</th>                                                                                    '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="businessDistinctionCode" class="bx-form-item bx-compoenent-small first-category-select">  '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="productTypeCode" class="bx-form-item bx-compoenent-small second-category-select">         '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="productTemplateCode" class="bx-form-item bx-compoenent-small third-category-select">      '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'            <tr>                                                                                                                       '
        +'                <th>'+name+'</th>                                                                                             '
        +'                <td colspan="3">                                                                                                       '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small product-name-search" data-form-param="name">            '
            //+'                    <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>                           '
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'        </table>                                                                                                                       '
        +'    </div>                                                                                                                             '
        +'    <div class="product-grid"></div>                                                                                                   '
        +'</div>                                                                                                                                 '

    $('#pf-cp-base-rel-product-add-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#pf-cp-base-rel-product-add-popup').html());

    // 권한이 없는 경우
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    PFComponent.makePopup({
        title: title,
        contents: popupTpl(),
        width: 600,
        submit: function () {
            var selectProduct = productGrid.getSelectedItem();
            var secondCategorySelect;
            var thirdCategorySelect;

            if(selectProduct.length === 0 && $('.second-category-select').val() !== null){
                  selectProduct = [];
                  selectProduct.push({
                    code : "*",
                    name : "전체"
                  });
            }

            if(!thirdCategoryMap && $('.third-category-select').val() === null){
                thirdCategorySelect = null;
            }else {
                thirdCategorySelect = thirdCategoryMap[$('.third-category-select').val()];
            }

            if($('.second-category-select').val() === null){
                secondCategorySelect = null;
            }else{
                secondCategorySelect = secondCategoryMap[$('.second-category-select').val()];
            }

            submitEvent(selectProduct, $('.first-category-select').val(), secondCategorySelect, thirdCategorySelect);
            modifyFlag = true;
        },
        contentsEvent: {
            'click .search-btn': function () {

                if ($('.first-category-select').val() === '') {
                    PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
                    $('.first-category-select').focus();
                    return;
                }

                var form = PFComponent.makeYGForm($('.rel-product-search-form'));
                var requestParam = form.getData();
                requestParam.productStatusCode = '04';
                requestParam.pdInfoDscd = searchPdInfoDscd;
                //requestParam.tntInstId = tntInstId;

                PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
                    success: function (responseData) {

                        var selectAll = [];
                        if($('.second-category-select').val() !== null && $('.second-category-select').val() !== '' && isSelectTemplate){
                            var temp = {
                                code : '*',
                                name : bxMsg('Z_All')
                            }
                            selectAll.push(temp);
                        }
                        var gridData = selectAll.concat(responseData);

                        productGrid.setData(gridData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdService',
                        operation: 'queryListPd'
                    }
                });

            }
        },
        listeners: {
            afterRenderUI: function () {

                var firstCategoryId;

                // set first category select
                var firstCategoryOptions = [];
                firstCategoryOptions.push($('<option>'));

                if(searchPdInfoDscd === '01') {
                    $.each(codeArrayObj['ProductCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }

                else if(searchPdInfoDscd === '02') {
                    $.each(codeArrayObj['ServiceCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }

                else if(searchPdInfoDscd === '03'){
                    $.each(codeArrayObj['PointCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }
                $('.first-category-select').html(firstCategoryOptions);
                // set second category select
                $('.first-category-select').change(function (e) {

                    firstCategoryId = $(e.currentTarget).val();

                    if (firstCategoryId != '') {
                        var secondCategoryOptions = [];
                        secondCategoryOptions.push($('<option>'));

                        var requestParam = {
                            'idType': '04'
                            , 'treeType': 'PD'
                            , 'id': firstCategoryId
                            , 'pdInfoDscd': searchPdInfoDscd
                            //, 'tntInstId': tntInstId
                        };
                        PFRequest.get('/catalog/getCatalog.json', requestParam, {
                            success: function (responseDate) {
                                secondCategoryMap = {};
                                $.each(responseDate.childCatalogs, function (index, category) {

                                    category.code = category.id.substr(3, 4);
                                    secondCategoryMap[category.code] = category;

                                    var $option = $('<option>');
                                    $option.val(category.code);
                                    $option.text(category.name);
                                    secondCategoryOptions.push($option);
                                });
                                $('.second-category-select').html(secondCategoryOptions);
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'CatalogService',
                                operation: 'queryCatalog'
                            }
                        });
                    }

                });


                // set third category select
                $('.second-category-select').change(function (e) {
                    $('.third-category-select').empty();

                    var selectSecondCategoryId = $(e.currentTarget).val();

                    if (selectSecondCategoryId != '') {
                        var requestParam = {
                            'firstCatalogId': firstCategoryId,
                            'secondCatalogId': selectSecondCategoryId,
                            'treeType': 'PD',
                            'id': selectSecondCategoryId,
                            'pdInfoDscd': searchPdInfoDscd     // 상품
//                            'tntInstId' : tntInstId
                        };

                        var thirdCategoryOptions = [];
                        thirdCategoryOptions.push($('<option>'));

                        PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
                            success:function (responseData) {
                                thirdCategoryMap = {};
                                $.each(responseData, function (index, tamplate) {

                                    thirdCategoryMap[tamplate.code] = tamplate;

                                    var $option = $('<option>');
                                    $option.val(tamplate.code);
                                    $option.text(tamplate.name);
                                    thirdCategoryOptions.push($option);
                                });
                                $('.third-category-select').html(thirdCategoryOptions);
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'PdTemplateService',
                                operation: 'queryListPdTemplate'
                            }
                        });
                    }
                });
                productGrid = renderProductListGrid();
                if(isSelectAllProduct){
                    var temp = {
                            code : '**',
                            name : bxMsg('allProduct')
                        }
                    productGrid.addData(temp);
                }
            }
        }
    });

    function renderProductListGrid(){
        var grid = PFComponent.makeExtJSGrid({
            pageAble: true,
            fields: ['code', 'name', 'fullPath', 'firstCatalogId', 'secondCatalogId', 'productTemplateCode'],
            gridConfig: {
                selType: 'checkboxmodel',
                renderTo: '.product-grid',
                columns: [
                    {text: code, flex: 1, dataIndex: 'code'},
                    {text: name, flex: 1, dataIndex: 'name'}
                ],
                listeners: {
                    scope: this,
                    itemdblclick : function(tree, record){
                        //alert(record.get('listCdNm'));
                    }
                }
            }
        });
        return grid;
    }
}


// 서비스검색팝업
function makeSearchServiceListPopup(submitEvent){

    var htmlString
        = '    <div class="pf-cp-base-rel-service-add-popup">                                                                                                   '
        + '		<div class="bx-info-table-wrap">                                                                                                                '
        + '			<table class="bx-info-table rel-service-search-form">                                                                                       '
        + '				<tr>                                                                                                                                    '
        + '					<th>' + bxMsg('ServiceType') + '</th>                                                                                               '
        + '					<td><select data-form-param="businessDistinctionCode" class="bx-form-item bx-compoenent-small service-type-select"></select></td>   '
        + '				</tr>                                                                                                                                   '
        + '				<tr>                                                                                                                                    '
        + '					<th>' + bxMsg('ServiceName') + '</th>                                                                                               '
        + '					<td>                                                                                                                                '
        + '						<input type="text" class="bx-form-item bx-compoenent-small product-name-search" data-form-param="name">                         '
        //+ '						<button class="bx-btn bx-btn-small search-btn">' + bxMsg('ButtonBottomString4') + '</button>                                    '
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        + '					</td>                                                                                                                               '
        + '				</tr>                                                                                                                                   '
        + '			</table>                                                                                                                                    '
        + '		</div>                                                                                                                                          '
        + '		<div class="service-grid">                                                                                                                      '
        + '                                                                                                                                                     '
        + '		</div>                                                                                                                                          '
        + '    </div>                                                                                                                                           ';

    $('#pf-cp-base-rel-service-add-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#pf-cp-base-rel-service-add-popup').html());

    // 권한이 없는 경우
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    var serviceGrid;

    PFComponent.makePopup({
        title: bxMsg('serviceSearch'),
        contents: popupTpl(),
        width: 600,
        submit: function () {
            var selectService = serviceGrid.getSelectedItem();
            submitEvent(selectService);
            modifyFlag = true;
        },
        contentsEvent: {
            'click .search-btn': function () {

            	/** OHS 2017.02.28 수정 - 유형을 선택하지않고도 조회가능해야함.
                if ($('.service-type-select').val() == '') {
                    PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
                    $('.service-type-select').focus();
                    return;
                }
                */

                var form = PFComponent.makeYGForm($('.rel-service-search-form'));
                var requestParam = form.getData();
                requestParam.productStatusCode = '04';
                requestParam.pdInfoDscd = '02';             // 02.서비스
                requestParam.tntInstId = tntInstId;

                // OHS 2017.02.28 추가 - 서비스유형을 선택하지않아도 조회되도록 수정
                requestParam.businessDistinctionCode = codeArrayObj['ServiceCategoryLevelOneCode'][0].code; // '31'
                requestParam.productTypeCode = $('.service-type-select').val();

                PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
                    success: function (responseData) {
                        serviceGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdService',
                        operation: 'queryListPd'
                    }
                });

            }
        },
        listeners: {
            afterSyncUI: function () {

            	var firstCategoryId = codeArrayObj['ServiceCategoryLevelOneCode'][0].code; // '31'

                if (firstCategoryId != '') {
                    var secondCategoryOptions = [];
                    secondCategoryOptions.push($('<option>'));

                    var requestParam = {
                        'idType': '04'
                        , 'treeType': 'ST'
                        , 'id': firstCategoryId
                        , 'pdInfoDscd': '02' // 02 :서비스
                        //, 'tntInstId': tntInstId
                    };
                    PFRequest.get('/catalog/getCatalog.json', requestParam, {
                        success: function (responseDate) {
                            secondCategoryMap = {};
                            $.each(responseDate.childCatalogs, function (index, category) {

                                category.code = category.id.substr(3, 4);
                                secondCategoryMap[category.code] = category;

                                var $option = $('<option>');
                                $option.val(category.code);
                                $option.text(category.name);
                                secondCategoryOptions.push($option);
                            });
                            $('.service-type-select').html(secondCategoryOptions);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        }
                    });
                }

                serviceGrid = PFComponent.makeExtJSGrid({
                    pageAble: true,
                    fields: ['code', 'name'],
                    gridConfig: {
                        selType: 'checkboxmodel',
                        renderTo: '.service-grid',
                        columns: [
                            {text: bxMsg('ServiceCode'), flex: 1, dataIndex: 'code'},
                            {text: bxMsg('ServiceName'), flex: 1, dataIndex: 'name'}
                        ]
                    }
                });

            	/**
            	 * OHS 2017.02.28 수정 - 기존 ServiceCategoryLevelOneCode[서비스대분류코드] 가 아닌 상품유형중 서비스관련 값만 콤보로 뿌려주도록 수정
                // set first category select
                var firstCategoryOptions = [];
                firstCategoryOptions.push($('<option>'));
                $.each(codeArrayObj['ServiceCategoryLevelOneCode'], function (index, category) {
                    var $option = $('<option>');
                    $option.val(category.code);
                    $option.text(category.name);
                    firstCategoryOptions.push($option);
                });
                $('.service-type-select').html(firstCategoryOptions);

                */
            }
        }
    });
}


/**
 * 상품그룹 검색 팝업
 */
function makeSearchProductGroupPopup(submitEvent) {

    var htmlString
        ='<div class="pf-cp-base-rel-product-group-add-popup">																					 '
        +'    <div class="bx-info-table-wrap">                                                                                                   '
        +'        <table class="bx-info-table rel-product-group-search-form">                                                                    '
        +'            <tr>                                                                                                                       '
        +'                <th>'+bxMsg('DPS0139String7')+'</th>                                                                                   '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="classificationStructureDistinctionCode" class="bx-form-item bx-compoenent-small first-category-select">'
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'                <th>'+bxMsg('ProductGroupName')+'</th>                                                                                 '
        +'                <td>                                                                                                                   '
        +'					  <input type="text" class="bx-form-item bx-compoenent-small classificationName" data-form-param="classificationName">'
        +'                    <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'        </table>                                                                                                                       '
        +'    </div>                                                                                                                             '
        +'    <div class="product-group-grid"></div>                                                                                             '
        +'</div>                                                                                                                                 '

    $('#pf-cp-base-rel-product-group-add-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#pf-cp-base-rel-product-group-add-popup').html());

    // 권한이 없는 경우
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
    var productGroupGrid;

    PFComponent.makePopup({
        title: bxMsg('SearchProductGroup'),
        contents: popupTpl(),
        width: 600,
        submit: function () {
            var selectProductGroup = productGroupGrid.getSelectedItem();

            submitEvent(selectProductGroup);
            modifyFlag = true;
        },
        contentsEvent: {
            'click .search-btn': function () {

                /*if ($('.first-category-select').val() == '') {
                    PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
                    $('.first-category-select').focus();
                    return;
                }*/

                var form = PFComponent.makeYGForm($('.rel-product-group-search-form'));
                var requestParam = form.getData();
                requestParam.pdInfoDscd = '01';     // 상품
                requestParam.tntInstId = tntInstId;
                requestParam.classificationStructureTypeCode = '2',

                PFRequest.get('/classification/getListClassificationDetail.json', requestParam, {
                    success: function (responseData) {

                        productGroupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: '',
                        operation: ''
                    }
                });

            }
        },
        listeners: {
            afterRenderUI: function () {

                var firstCategoryId;

                // set first category select
                var firstCategoryOptions = [];
                firstCategoryOptions.push($('<option>'));

                var requestParam = {
            		classificationStructureTypeCode : '2',
        			tntInstId : tntInstId,
        			pdInfoDscd : '01'
                };

                PFRequest.get('/classification/getListClassificationMaster.json', requestParam, {
                    success: function (responseDate) {
                        $.each(responseDate, function (index, category) {
                            var $option = $('<option>');
                            $option.val(category.classificationStructureDistinctionCode);
                            $option.text(category.classificationStructureName);
                            firstCategoryOptions.push($option);
                        });
                        $('.first-category-select').html(firstCategoryOptions);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: '',
                        operation: ''
                    }
                });
            }
        }
    });
    productGroupGrid = renderProductGroupListGrid();
}

function renderProductGroupListGrid(){
	var grid = PFComponent.makeExtJSGrid({
		pageAble: true,
		fields: ['classificationStructureDistinctionCode','classificationCode', 'classificationName','applyStartDate'],
		gridConfig: {
			selType: 'checkboxmodel',
			renderTo: '.product-group-grid',
			columns: [
			          {text: bxMsg('ProductGroupCode'), flex: 1, dataIndex: 'classificationCode'},
			          {text: bxMsg('ProductGroupName'), flex: 1, dataIndex: 'classificationName'}
			    ],
			    listeners: {
			        scope: this,
			        itemdblclick : function(tree, record){
			    }
			}
		}
	});
    return grid;
}



/**
 * 2017.02.22 신규추가
 * 상품, 서비스, 포인트 검색 팝업 (다건선택)
 * script :  <script id="pf-cp-base-rel-product-add-popup" type="text/x-handlebars-template"></script>
 * @param submitEvent
 * @param searchPdInfoDscd
 * @param isSelectTemplate (true or false) - true : 카테고리를 선택후 검색을 하면 '전체'라는 리스트가 추가됨
 *                                           false : '전체'가 포함되지 않음
 */
function makeSearchProductListPopupByMulti(submitEvent, searchPdInfoDscd, isSelectTemplate) {

	var secondCategoryMap;
    var thirdCategoryMap;
    var productGrid;

    var title, code, name;

    if(searchPdInfoDscd === null || !searchPdInfoDscd){
        searchPdInfoDscd = '01'
    }

    // pdInfoDscd == '01' : 상품
    if(searchPdInfoDscd === '01'){
        title = bxMsg('DPP0107Title');
        code = bxMsg('DPS0106String2');
        name = bxMsg('pdNm');
    }
    // pdInfoDscd == '02' : 서비스
    else if(searchPdInfoDscd === '02'){
        title = bxMsg('selectRelatedService');
        code = bxMsg('ServiceCode');
        name = bxMsg('ServiceName');
    }

	var htmlString
        ='<div class="pf-cp-base-rel-product-add-popup">																						 '
        +'    <div class="bx-info-table-wrap" style="margin-left:35px;">                                                                         '
        +'        <table class="bx-info-table rel-product-search-form">                                                                          '
        +'            <tr>                                                                                                                       '
        +'                <th>'+bxMsg('category')+'</th>                                                                                   '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="businessDistinctionCode" class="bx-form-item bx-compoenent-small first-category-select">  '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="productTypeCode" class="bx-form-item bx-compoenent-small second-category-select">         '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'                <td>                                                                                                                   '
        +'                    <select data-form-param="productTemplateCode" class="bx-form-item bx-compoenent-small third-category-select">      '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'            <tr>                                                                                                                       '
        +'                <th>'+name+'</th>                                                                                                              '
        +'                <td colspan="3">                                                                                                       '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small product-name-search" data-form-param="name">            '
            //+'                    <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>                           '
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'                </td>                                                                                                                  '
        +'            </tr>                                                                                                                      '
        +'        </table>                                                                                                                       '

    	+'		<table class="bx-info-table rel-service-fixed-input-form" style="width:665px;border-top:1px solid #dcdcdc;margin-top:10px;margin-left:-30px;vertical-align:middle;">		 '
        +'            <tr>                                                                                                                       '
        				  // 관계유형
        +'                <th>'+bxMsg('DPP0109String1')+'</th>                                                                                   '
        +'                <td style="padding-bottom:0px;">                                                                                        '
        +'                    <select class="bx-form-item bx-compoenent-small serviceRelationTypeCode">  										 '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
		  				  // 적용시작일
        +'                <th>'+bxMsg('DPP0127String6')+'</th>                                                                                   '
        +'                <td style="padding-bottom:0px;">                                                                                        '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar start-date" style="width:155px;">         	 '
        +'                </td>                                                                                                                  '
        				  // 적용종료일
        +'                <th>'+bxMsg('DPP0127String7')+'</th>                                                                                   '
        +'                <td style="padding-bottom:0px;">                                                                                        '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar end-date" style="width:155px;">      			 '
        +'                </td>                                                                                                                  '
        +'            </tr>																														 '
    	+'		</table>																													     '

        +'    </div>                                                                                                                             '
        +'    <div class="product-grid"></div>                                                                                                   '
        +'</div>                                                                                                                                 '


    $('#pf-cp-base-rel-product-add-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#pf-cp-base-rel-product-add-popup').html());

    // 권한이 없는 경우
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    PFComponent.makePopup({
        title: title,
        contents: popupTpl(),
        width: 700,
        height: 430,
        submit: function () {
            var selectProduct = productGrid.getSelectedItem();

            var thirdCategorySelect;

            if(selectProduct.length === 0 && $('.second-category-select').val() !== null){
                  selectProduct = [];
                  selectProduct.push({
                    code : "*",
                    name : "전체"
                  });
            }

            if(!thirdCategoryMap && $('.third-category-select').val() === null){
                thirdCategorySelect = null;
            }else {
                thirdCategorySelect = thirdCategoryMap[$('.third-category-select').val()];
            }

        	var serviceRelationTypeCode =  $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode').val();
        	var aplyStartDate = $('.rel-service-fixed-input-form').find('.calendar.start-date').val();
        	var endDate = $('.rel-service-fixed-input-form').find('.calendar.end-date').val();

        	var firstCategory = $('.first-category-select').val();
        	var secondCategory = secondCategoryMap[$('.second-category-select').val()];
        	var thirdCategory = thirdCategorySelect;

        	if(selectProduct.length < 1){
            	// 대상을 선택해주세요
            	PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
            	return;
            }

        	// submitEvent == undefined이면 '추가버튼'을 클릭하여 신규row생성
        	if(!submitEvent) {
        		$.each(selectProduct,function(index, row) {
                    row.applyStart = aplyStartDate; // 적용시작년월일
                    row.applyEnd = endDate; // 적용종료년월일
                    row.betweenProductRelation = serviceRelationTypeCode; // 서비스관계유형
                    row.relatedProductCode = row.code;
                    row.relatedProductName = row.name;
                    row.process = 'C';
                    row.relationInformationStatus = '01';
                    row.relationPdInfoDscd = searchPdInfoDscd;

                    if(row.code  !== '*'){

                        row.relatedProductCodeLabel = row.code;

                        row.businessDistinctionCode1 = firstCategory;

                        var requestParam = {};
                        requestParam.pdInfoDscd = searchPdInfoDscd;
                        requestParam.id = selectProduct[0].fullPath;

                        // 2017.02.07 OHS 수정 - 상품템플릿 잘라오는 substring 수정
                        // requestParam.code = data[0].fullPath.substring(6,13);
                        requestParam.code = selectProduct[0].fullPath.substring(selectProduct[0].fullPath.lastIndexOf('.') + 1, selectProduct[0].fullPath.length);

                        requestParam.firstCatalogId = selectProduct[0].fullPath.substring(0,2);
                        requestParam.secondCatalogId = selectProduct[0].fullPath.substring(3,5);

                        PFRequest.get('/product/template/getProductTemplate.json', requestParam, {
                            success: function (responseData) {
                            	row.industryDistinctionCode1 = responseData.industryDistinctionCode;
                                row.productTypeCode1 = responseData.secondCatalogId;
                                row.productTypeName1 = responseData.secondCatalogName;
                                row.productTemplateCode1 = responseData.code;
                                row.productTemplateName1 = responseData.name;
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'PdTemplateService',
                                operation: 'queryPdTemplate'
                            },
                            async : false
                        });
                    }else{

                        row.relatedProductCodeLabel = row.name;

                        if(secondCategory) {
                            row.industryDistinctionCode1 = secondCategory.industryDistinctionCode;
                            row.productTypeCode1 = secondCategory.id.substr(3, 4);
                            row.productTypeName1 = secondCategory.name;
                        }
                        if(secondCategory && !thirdCategory){
                            row.productTemplateCode1 = '*';
                            row.productTemplateName1 = bxMsg('Z_All');
                        }

                    }
                });
        		//clickEventForGrid.setData(selectProduct);
        		clickEventForGrid.addData(selectProduct);
        	}
        	// 기존 추가된 row행을 클릭하여 들어왔을때 처리
        	else {
        		submitEvent(selectProduct, $('.first-category-select').val(), secondCategoryMap[$('.second-category-select').val()], thirdCategorySelect);
        	}
            modifyFlag = true;
        },
        contentsEvent: {
            'click .search-btn': function () {

                if ($('.first-category-select').val() == '') {
                    PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
                    $('.first-category-select').focus();
                    return;
                }

                var form = PFComponent.makeYGForm($('.rel-product-search-form'));
                var requestParam = form.getData();
                requestParam.productStatusCode = '04';
                requestParam.pdInfoDscd = searchPdInfoDscd;     // 상품
                //requestParam.tntInstId = tntInstId;

                PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
                    success: function (responseData) {

                        var selectAll = [];
                        if($('.second-category-select').val() !== null && $('.second-category-select').val() !== '' && isSelectTemplate){
                            var temp = {
                                code : '*',
                                name : bxMsg('Z_All')
                            }
                            selectAll.push(temp);
                        }
                        var gridData = selectAll.concat(responseData);

                        productGrid.setData(gridData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdService',
                        operation: 'queryListPd'
                    }
                });

            }
        },
        listeners: {
            afterRenderUI: function () {

                var firstCategoryId;

                // set first category select
                var firstCategoryOptions = [];
                firstCategoryOptions.push($('<option>'));

                if(searchPdInfoDscd === '01') {
                    $.each(codeArrayObj['ProductCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });
                }

                else if(searchPdInfoDscd === '02') {
                    $.each(codeArrayObj['ServiceCategoryLevelOneCode'], function (index, category) {
                        var $option = $('<option>');
                        $option.val(category.code);
                        $option.text(category.name);
                        firstCategoryOptions.push($option);
                    });

                    // 관계유형 콤보조립
                    renderComboBox('ServiceRelationTypeCode', $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode'));

                    // 적용시작일,적용종료일 달력적용
                    PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form').find('.calendar.start-date'));
                    PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form').find('.calendar.end-date'));
                    $('.rel-service-fixed-input-form').find('.calendar.start-date').val(PFUtil.getToday() + ' 00:00:00');
                    $('.rel-service-fixed-input-form').find('.calendar.end-date').val('9999-12-31 23:59:59');
                }

                //포인트
                if(pdInfoDscd === '03'){
                    //포인트-상품 관계
                    if(searchPdInfoDscd === '01'){
                        $.each(codeArrayObj['ProductCategoryLevelOneCode'], function (index, category) {
                            var $option = $('<option>');
                            $option.val(category.code);
                            $option.text(category.name);
                            firstCategoryOptions.push($option);
                        });

                        // 관계유형 콤보조립
                        renderComboBox('PointProductRelTypeCode', $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode'));

                        // 적용시작일,적용종료일 달력적용
                        PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form').find('.calendar.start-date'));
                        PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form').find('.calendar.end-date'));
                        $('.rel-service-fixed-input-form').find('.calendar.start-date').val(PFUtil.getToday() + ' 00:00:00');
                        $('.rel-service-fixed-input-form').find('.calendar.end-date').val('9999-12-31 23:59:59');
                    }
                }

                $('.first-category-select').html(firstCategoryOptions);
                // set second category select
                $('.first-category-select').change(function (e) {

                    firstCategoryId = $(e.currentTarget).val();

                    if (firstCategoryId != '') {
                        var secondCategoryOptions = [];
                        secondCategoryOptions.push($('<option>'));

                        var requestParam = {
                            'idType': '04'
                            , 'treeType': 'PD'
                            , 'id': firstCategoryId
                            , 'pdInfoDscd': searchPdInfoDscd
                            //, 'tntInstId': tntInstId
                        };
                        PFRequest.get('/catalog/getCatalog.json', requestParam, {
                            success: function (responseDate) {
                                secondCategoryMap = {};
                                $.each(responseDate.childCatalogs, function (index, category) {

                                    category.code = category.id.substr(3, 4);
                                    secondCategoryMap[category.code] = category;

                                    var $option = $('<option>');
                                    $option.val(category.code);
                                    $option.text(category.name);
                                    secondCategoryOptions.push($option);
                                });
                                $('.second-category-select').html(secondCategoryOptions);
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'CatalogService',
                                operation: 'queryCatalog'
                            }
                        });
                    }

                });


                // set third category select
                $('.second-category-select').change(function (e) {
                    $('.third-category-select').empty();

                    var selectSecondCategoryId = $(e.currentTarget).val();

                    if (selectSecondCategoryId != '') {
                        var requestParam = {
                            'firstCatalogId': firstCategoryId,
                            'secondCatalogId': selectSecondCategoryId,
                            'treeType': 'PD',
                            'id': selectSecondCategoryId,
                            'pdInfoDscd': searchPdInfoDscd,     // 상품
                            'tntInstId' : tntInstId
                        };

                        var thirdCategoryOptions = [];
                        thirdCategoryOptions.push($('<option>'));

                        PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
                            success:function (responseData) {
                                thirdCategoryMap = {};
                                $.each(responseData, function (index, tamplate) {

                                    thirdCategoryMap[tamplate.code] = tamplate;

                                    var $option = $('<option>');
                                    $option.val(tamplate.code);
                                    $option.text(tamplate.name);
                                    thirdCategoryOptions.push($option);
                                });
                                $('.third-category-select').html(thirdCategoryOptions);
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'PdTemplateService',
                                operation: 'queryListPdTemplate'
                            }
                        });
                    }
                });
                productGrid = renderProductListGrid();
            }
        }
    });

    function renderProductListGrid(){
        var grid = PFComponent.makeExtJSGrid({
            pageAble: true,
            fields: ['code', 'name', 'fullPath', 'firstCatalogId', 'secondCatalogId', 'productTemplateCode'],
            gridConfig: {
                selType: 'checkboxmodel',
                renderTo: '.product-grid',
                columns: [
                    {text: code, flex: 1, dataIndex: 'code'},
                    {text: name, flex: 1, dataIndex: 'name'}
                ],
                listeners: {
                    scope: this,
                    itemdblclick : function(tree, record){
                        //alert(record.get('listCdNm'));
                    }
                }
            }
        });
        return grid;
    }
}

/**
 * 가맹점&그룹조회 다건처리
 */
function renderMerchantSearchPopupByMulti() {
    var htmlString
        ='<div class="merchant-merchant-group-search-popup">                                                                     '

        +'    <div>'
    	+'		<table class="bx-info-table rel-merchant-merchantgroup-fixed-input-form">		 '
        +'            <tr>                                                                                                                       '
        				  // 가맹점관계유형
        +'                <th>'+bxMsg('merchantRelType')+'</th>                                                                                   '
        +'                <td>                                                                                        '
        +'                    <select class="bx-form-item bx-compoenent-small merchantRelType" style="width:155px;">  										 '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        				   // 가맹점유형구분
        +'                <th>'+bxMsg('merchantTypeDistinction')+'</th>                                                                          '
        +'                <td>                                                                                        '
        +'                    <select class="bx-form-item bx-compoenent-small merchantTypeDistinction" style="width:155px;">  										 '
        +'                    </select>                                                                                                          '
        +'                </td>                                                                                                                  '
        +'			  </tr>'
        +'			  <tr>'
		  				  // 적용시작일
        +'                <th>'+bxMsg('DPP0127String6')+'</th>                                                                                   '
        +'                <td>                                                                                        '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar start-date" style="width:155px;">         	 '
        +'                </td>                                                                                                                  '
        				  // 적용종료일
        +'                <th>'+bxMsg('DPP0127String7')+'</th>                                                                                   '
        +'                <td>                                                                                        '
        +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar end-date" style="width:155px;">      			 '
        +'                </td>                                                                                                                  '
        +'            </tr>																														 '
    	+'		</table>																													     '
    	+'    </div>'

        +'   <div class="merchant-search-popup" style="display:none;border-top:1px solid #dcdcdc;margin-top:10px;">                                                                                            '
        +'    	<table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('merchantName')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="merchantName">'
            //+'                <button class="bx-btn bx-btn-small search-btn">'+bxMsg('ButtonBottomString4')+'</button>'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    	</table>                                                                                            '
        +'    <div class="merchant-list-grid"></div>                                                              '
        +'	</div>                                                                                                  '

        +'	<div class="merchant-group-search-popup" style="display:none;border-top:1px solid #dcdcdc;margin-top:10px;">                                                                     '
        +'    <table class="bx-info-table">                                                                       '
        +'        <tr>                                                                                            '
        +'            <td>                                                                                        '
        +'                <label>'+bxMsg('merchantGroupName')+'</label>                                                '
        +'                <input type="text" class="bx-compoenent-small bx-form-item" data-form-param="merchantGroupName">'
        +'                <button class="bw-btn search-btn" icon-tooltip=' + bxMsg("ButtonBottomString4") + '><i class="bw-icon i-25 i-search"></i></button>'
        +'            </td>                                                                                       '
        +'        </tr>                                                                                           '
        +'    </table>                                                                                            '
        +'    <div class="merchant-group-list-grid"></div>                                                              '
        +'	</div>                                                                                                  '
        +'</div>                                                                                                  ';

    $('#merchant-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#merchant-search-popup').html());
    var grid;

    PFComponent.makePopup({
        title: bxMsg('MerchantGroup') + '/' + bxMsg('merchantSearch'), // 가맹점그룹 / 가맹점조회
        contents: popupTpl(),
        width: 700,
        height: 400,
        submit: function () {
        	var selectedItem;
        	if(grid) {
        		selectedItem = grid.getSelectedItem();
        	}
        	var merchantRelCode = $('.merchant-merchant-group-search-popup').find('.merchantRelType').val(); // 가맹점관계유형
        	var merchantTypeCode = $('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val(); // 가맹점유형구분
        	var aplyStartDate = $('.merchant-merchant-group-search-popup').find('.calendar.start-date').val();
        	var endDate = $('.merchant-merchant-group-search-popup').find('.calendar.end-date').val();

        	// 전 가맹점
        	if($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() == '01') {
        		var selectedItems = [];
        		var row = {
    				pdMerchantRelCode : merchantRelCode,
    				merchantTypeCode : merchantTypeCode,
    				applyStart : aplyStartDate,
    				applyEnd : endDate,
    				process : 'C',
        			relationInformationStatus : '01'
        		}
        		selectedItems.push(row);
        		//clickEventForGrid.setData(selectedItems);
        		clickEventForGrid.addData(selectedItems);
        	}
        	// 가맹점그룹
        	else if($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() == '02') {
        		if(selectedItem.length < 1) {
                   	// 대상을 선택해주세요
                	PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
                	return;
        		}

        		$.each(selectedItem,function(index, row) {
        			row.merchantNumber = row.merchantGroupCode;
        			row.merchantName = row.merchantGroupName;

        			row.pdMerchantRelCode = merchantRelCode;
        			row.merchantTypeCode = merchantTypeCode;

        			row.applyStart = aplyStartDate; // 적용시작년월일
                    row.applyEnd = endDate; // 적용종료년월일

                    row.process = 'C';
                    row.relationInformationStatus = '01';
        		});
        		//clickEventForGrid.setData(selectedItem);
        		clickEventForGrid.addData(selectedItem);
        	}
        	// 개별가맹점
        	else if($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() == '03') {
        		if(selectedItem.length < 1) {
                   	// 대상을 선택해주세요
                	PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
                	return;
        		}

        		$.each(selectedItem,function(index, row) {
        			row.merchantNumber = row.merchantCode;
        			row.merchantName = row.merchantName;

        			row.pdMerchantRelCode = merchantRelCode;
        			row.merchantTypeCode = merchantTypeCode;

        			row.applyStart = aplyStartDate; // 적용시작년월일
                    row.applyEnd = endDate; // 적용종료년월일

                    row.process = 'C';
                    row.relationInformationStatus = '01';
        		});
        		//clickEventForGrid.setData(selectedItem);
        		clickEventForGrid.addData(selectedItem);
        	}
        },
        contentsEvent: {
            'click .search-btn': function () {
             	// 가맹점그룹
            	if($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() == '02') {
                    var requestParam = PFComponent.makeYGForm($('.merchant-group-search-popup table')).getData();
                    requestParam.activeYn = 'Y';
                    PFRequest.get('/merchant/getListMerchantGroupMaster.json', requestParam, {
                        success: function (responseData) {
                            grid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'MerchantGroupService',
                            operation: 'queryList'
                        }
                    });

            	}
            	// 개별가맹점
            	else if($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() == '03') {
            		var requestParam = PFComponent.makeYGForm($('.merchant-search-popup table')).getData();
                    PFRequest.get('/merchant/getListMerchantMaster.json', requestParam, {
                        success: function (responseData) {
                            grid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'MerchantService',
                            operation: 'queryList'
                        }
                    })
            	}
            },
            'change .merchantTypeDistinction' : function(e) {
            	// 가맹점그룹
            	if($(e.currentTarget).val() == '02') {
            		$('.merchant-group-search-popup .merchant-group-list-grid').empty();
            		$('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'block');
            		$('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'none');

            		grid = PFComponent.makeExtJSGrid({
                        fields: [
                            'merchantGroupCode', 'merchantGroupName'
                        ],
                        gridConfig: {
                            selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
                            renderTo: '.merchant-group-search-popup .merchant-group-list-grid',
                            columns: [
                                {
                                    text: bxMsg('merchantGroupCd'),
                                    flex: 1,
                                    dataIndex: 'merchantGroupCode',
                                    sortable: false,
                                    align: 'center'
                                },
                                {
                                    text: bxMsg('merchantGroupName'),
                                    flex: 2,
                                    dataIndex: 'merchantGroupName',
                                    sortable: false,
                                    style: 'text-align:center'
                                },
                            ]
                        }
            	    });
            	}
            	// 개별가맹점
            	else if($(e.currentTarget).val() == '03') {
            		$('.merchant-search-popup .merchant-list-grid').empty();
            		$('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'none');
            		$('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'block');

            		grid = PFComponent.makeExtJSGrid({
                        fields: [
                            'merchantCode', 'merchantName'
                        ],
                        gridConfig: {
                            selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
                            renderTo: '.merchant-search-popup .merchant-list-grid',
                            columns: [
                                {
                                    text: bxMsg('merchantNo'),
                                    flex: 1,
                                    dataIndex: 'merchantCode',
                                    sortable: false,
                                    align: 'center'
                                },
                                {
                                    text: bxMsg('merchantName'),
                                    flex: 2,
                                    dataIndex: 'merchantName',
                                    sortable: false,
                                    style: 'text-align:center'
                                },
                            ]
                        }
                    });
            	}
            	// 전가맹점은 보여주지않음
            	else {
            		$('.merchant-search-popup .merchant-list-grid').empty();
            		$('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'none');
            		$('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'none');
            	}
            }
        },
        listeners: {
            afterRenderUI: function () {
                // 가맹점관계유형 콤보조립
                renderComboBox('BnftMrchntRelTypeCode', $('.merchant-merchant-group-search-popup').find('.merchantRelType'));
                // 가맹점유형구분
                renderComboBox('merchantTypeDistinction', $('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction'));

                // 적용시작일,적용종료일 달력적용
                PFUtil.getDatePicker(true, $('.merchant-merchant-group-search-popup').find('.calendar.start-date'));
                PFUtil.getDatePicker(true, $('.merchant-merchant-group-search-popup').find('.calendar.end-date'));
                $('.merchant-merchant-group-search-popup').find('.calendar.start-date').val(PFUtil.getToday() + ' 00:00:00');
                $('.merchant-merchant-group-search-popup').find('.calendar.end-date').val('9999-12-31 23:59:59');
            }
        }
    });
}

/**
 * 공통코드 상세 팝업 (다건선택)
 */
function renderCommonCodeDetailPopupByMulti(code, codeNm) {
    var htmlString
        ='<div class="common-code-detail-search-popup">                                                                     '
        	+'		<table class="bx-info-table rel-biz-fixed-input-form">		 '
            +'            <tr>                                                                                                                       '
            				  // 업종관계유형
            +'                <th>'+bxMsg('relationType')+'</th>                                                                                   '
            +'                <td>                                                                                        '
            +'                    <select class="bx-form-item bx-compoenent-small merchantRelType" style="width:155px;">  										 '
            +'                    </select>                                                                                                          '
            +'                </td>                                                                                                                  '
            +'			  </tr>'
            +'			  <tr>'
    		  				  // 적용시작일
            +'                <th>'+bxMsg('DPP0127String6')+'</th>                                                                                   '
            +'                <td>                                                                                        '
            +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar start-date" style="width:155px;">         	 '
            +'                </td>                                                                                                                  '
            				  // 적용종료일
            +'                <th>'+bxMsg('DPP0127String7')+'</th>                                                                                   '
            +'                <td>                                                                                        '
            +'                    <input type="text" class="bx-form-item bx-compoenent-small calendar end-date" style="width:155px;">      			 '
            +'                </td>                                                                                                                  '
            +'            </tr>																														 '
        	+'		</table>																													     '
        +'    <div class="common-code-detail-list-grid"></div>                                                              '
        +'</div>                                                                                                  ';

    $('#common-code-detail-search-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#common-code-detail-search-popup').html());
    var grid;

    if(!codeNm){
        codeNm = bxMsg('DomainCodeDetail');
    }

    PFComponent.makePopup({
        title: codeNm +  bxMsg('ButtonBottomString4'),
        contents: popupTpl(),
        width: 500,
        height: 350,
        submit: function () {
        	var selectedItem = grid.getSelectedItem();
        	var merchantRelCode = $('.common-code-detail-search-popup').find('.merchantRelType').val(); // 업종관계유형
        	var aplyStartDate = $('.common-code-detail-search-popup').find('.calendar.start-date').val();
        	var endDate = $('.common-code-detail-search-popup').find('.calendar.end-date').val();

    		if(selectedItem.length < 1) {
               	// 대상을 선택해주세요
            	PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
            	return;
    		}

    		$.each(selectedItem,function(index, row) {
                row.bizCategoryCode = row.instanceCode;
                row.merchantName = row.instanceName;

    			row.bizCategoryRelCode = merchantRelCode; // 업종관계유형
    			row.applyStart = aplyStartDate; // 적용시작년월일
                row.applyEnd = endDate; // 적용종료년월일

                row.process = 'C';
                row.relationInformationStatus = '01';
    		});
    		//clickEventForGrid.setData(selectedItem);
    		clickEventForGrid.addData(selectedItem);
        },
        listeners: {
            afterRenderUI: function () {
                // 가맹점관계유형 콤보조립
                renderComboBox('BnftMrchntRelTypeCode', $('.common-code-detail-search-popup').find('.merchantRelType'));

                // 적용시작일,적용종료일 달력적용
                PFUtil.getDatePicker(true, $('.common-code-detail-search-popup').find('.calendar.start-date'));
                PFUtil.getDatePicker(true, $('.common-code-detail-search-popup').find('.calendar.end-date'));
                $('.common-code-detail-search-popup').find('.calendar.start-date').val(PFUtil.getToday() + ' 00:00:00');
                $('.common-code-detail-search-popup').find('.calendar.end-date').val('9999-12-31 23:59:59');

                PFRequest.get('/commonCode/getCommonCodeDetailList.json', {activeYn : 'Y', domainCode:code}, {
                    success: function (responseData) {
                        grid = PFComponent.makeExtJSGrid({
                            fields: [
                                'instanceCode', 'instanceName'
                            ],
                            gridConfig: {
                                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
                                renderTo: '.common-code-detail-search-popup .common-code-detail-list-grid',
                                columns: [
                                    {
                                        text: bxMsg('InstanceCode'),
                                        flex: 1,
                                        dataIndex: 'instanceCode',
                                        sortable: false
                                    },
                                    {
                                        text: bxMsg('InstanceCodeName'),
                                        flex: 2,
                                        dataIndex: 'instanceName',
                                        sortable: false
                                    },
                                ]
                            }
                        });

                        grid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeDetailService',
                        operation: 'queryListCommonCodeDetail'
                    }
                })

            }
        }
    });
}

/**
 * 상품정보변경내역상세 팝업
 * script : <script id="pd-info-change-detail-popup" type="text/x-handlebars-template"></script>
 * input  : record
 */
//
function renderPdInfoChangeDetail(record){

    var htmlString
	    = '<div class="pd-info-change-detail-wrap" style="height:520px; overflow:auto;">'
	    + '<table class="bx-info-table pd-info-change-detail-table">'
	    + '</table>'
	    + '</div>';

    $('#pd-info-change-detail-popup').html(htmlString);

    var popupTpl = Handlebars.compile($('#pd-info-change-detail-popup').html());

    var columnCodeMap = {
	    pdInfoDscd :'PdInfoDscd',
	    cmpxCndYn :'ProductConditionClassifyCode',
	    pdStsCd :'ProductStatusCode',
	    bizDscd :'ProductCategoryLevelOneCode',
	    intRtAplyBaseDayCd:'IntRtAplyBaseDayCode',
	    cndValDcsnLvlCd:'ProductConditionAgreeLevelCode',
	    crncyCd:'CurrencyCode',
	    intRtDataTpCd:'InterestTypeCode',
	    frctnAplyWayCd:'FrctnAplyWayCode',
	    intRtAplyWayCd:'ProductConditionInterestApplyTypeCode',
	    blwUndrDscd:'RangeBlwUnderTypeCode',
	    msurUnitCd:'ProductMeasurementUnitCode',
	    pdDocDscd:'ProductDocumentTypeCode',
	    pdTpDscd:'ProductTypeDistinctionCode'
	};

    PFComponent.makePopup({
        title: bxMsg('detailInfo'),
        contents: popupTpl(),
        width: 400,
        height: 600,
        buttons: [
            {
                text: bxMsg('ButtonBottomString3'),
                elCls: 'button button-primary',
                handler: function () {
                    this.close();
                }
            }
        ],
        contentsEvent: {},
        listeners: {
            afterRenderUI: function () {

                var $table = $('.pd-info-change-detail-wrap .pd-info-change-detail-table');
                var keyValueMap = getKeyValueMap(record.txDataContentKeyValue);

                record.allTableColumns.forEach(function (el) {
                    if(el == 'tntInstId' || el == 'cndGrpCd' || el == 'gmtCreate' || el == 'stsChngHms') return;

                    var name;
                    if(keyValueMap[el] && keyValueMap[el].name && (keyValueMap[el].name !== null && keyValueMap[el].name != undefined)){
                        name = keyValueMap[el].name;
                    }else {
                        name = '';
                    }

                    var codeName;
                    if(keyValueMap[el] && columnCodeMap[keyValueMap[el].key] && (columnCodeMap[keyValueMap[el].key] !== null && columnCodeMap[keyValueMap[el].key] != undefined)){
                        if(keyValueMap[el].key === 'cmpxCndYn'){
                            if(keyValueMap[el].value === 'Y'){
                                codeName = codeMapObj[columnCodeMap[keyValueMap[el].key]]['02']
                            }
                            else{
                                codeName = codeMapObj[columnCodeMap[keyValueMap[el].key]]['01']
                            }
                        }else{
                            codeName = codeMapObj[columnCodeMap[keyValueMap[el].key]][keyValueMap[el].value]
                        }
                    }else {
                        codeName = '';
                    }

                    if(codeName == undefined) codeName = '';

                    var code;
                    if(keyValueMap[el] && (keyValueMap[el].value !== null && keyValueMap[el].value != undefined)){
                        code = '[' + keyValueMap[el].value + ']';
                    }else {
                        code = '';
                    }

                    if(!(code ===  '' && name === '' && codeName === '')){
                        var tr = '<tr><th bgcolor="#eeeeee" style="padding-left: 10px;">' + bxMsg(el) + '</th><td style="padding-left: 10px;">' + code + name + codeName + '</td></tr>';
                        $table.append(tr);
                    }
                });
            }
        }
    });
}

/*
 * 상품정보변경내역상세 팝업 에서 사용
 */
function getKeyValueMap(list) {
    var keyValueMap = {};
    list.forEach(function (el) {
        var value;
        if(!el.value){
            value = '';
        } else{
            value = el;
        }

        keyValueMap[el.key] = value;
    });
    return keyValueMap;
}

//배포 변경이력 조회
function renderPdInfoChange(requestParam){

    var htmlString
	    = '<div class="pd-info-change-grid-wrap">							'
		+ '    <div class="pd-info-change-grid" id="pd-info-change-grid"></div>'
		+ '</div>';

	$('#pd-info-change-grid-wrap').html(htmlString);

	var popupTpl = Handlebars.compile($('#pd-info-change-grid-wrap').html());


    var columnCodeMap = {
	    pdInfoDscd :'PdInfoDscd',
	    cmpxCndYn :'ProductConditionClassifyCode',
	    pdStsCd :'ProductStatusCode',
	    bizDscd :'ProductCategoryLevelOneCode',
	    intRtAplyBaseDayCd:'IntRtAplyBaseDayCode',
	    cndValDcsnLvlCd:'ProductConditionAgreeLevelCode',
	    crncyCd:'CurrencyCode',
	    intRtDataTpCd:'InterestTypeCode',
	    frctnAplyWayCd:'FrctnAplyWayCode',
	    intRtAplyWayCd:'ProductConditionInterestApplyTypeCode',
	    blwUndrDscd:'RangeBlwUnderTypeCode',
	    msurUnitCd:'ProductMeasurementUnitCode',
	    pdDocDscd:'ProductDocumentTypeCode',
	    pdTpDscd:'ProductTypeDistinctionCode'
	};

	/**
	 * TreeGrid형태를 조립하기위한 관계도 세팅
	 */
	var PD_PD_M_TABLES = {
			'PD_PD_CG_R' : 'Y',
			'PD_PD_CHNG_H' : 'Y',
			'PD_PD_R' : 'Y',
			'PD_PD_DOC_D' : 'Y',
			'PD_CL_M' : 'Y',
			'PD_PD_STS_H' : 'Y',
			'PD_PD_CUST_R' : 'Y',
			'PD_CG_STS_H' : 'Y',
			'PD_CG_M' : 'Y',
			'PD_PD_BR_R' : 'Y'};
	var PD_PD_CND_M_TABLES = {
			'PD_PD_CND_STS_H' : 'Y',
			'PD_PD_LST_CND_D' : 'Y',
			'PD_PD_RNG_CND_D' : 'Y',
			'PD_PD_INT_CND_D' : 'Y',
			'PD_PD_FEE_CND_D' : 'Y',
			'PD_PD_CX_LST_CND_D' : 'Y',
			'PD_PD_CX_RNG_CND_D' : 'Y',
			'PD_PD_CX_INT_CND_D' : 'Y',
			'PD_PD_CX_FEE_CND_D' : 'Y',
			'PD_CX_STRC_M' : 'Y',
			'PD_CX_CMPS_D' : 'Y',
			'PD_CX_TIER_D' : 'Y'
	};

	var PD_PDT_M = {
			'PD_PDT_STS_H' : 'Y',
			'PD_PDT_CGT_R' : 'Y'
	};

	var PD_CGT_M = {
			'PD_CGT_CT_R' : 'Y',
			'PD_RNG_CT_D' : 'Y',
			'PD_CGT_CT_CT_R' : 'Y',
			'PD_CGT_CTV_CTV_R' : 'Y',
			'PD_LST_CT_D' : 'Y',
			'PD_RNG_CT_D' : 'Y'
	};

	var PD_CT_M = {
			'PD_LST_CT_M' : 'Y'
	};

	PFComponent.makePopup({
        title: bxMsg('DPP0127String5'),
        contents: popupTpl(),
        width: 700,
        height: 500,
        buttons: [
            {
                text: bxMsg('ButtonBottomString3'),
                elCls: 'button button-primary',
                handler: function () {
                    this.close();
                }
            }
        ],
        contentsEvent: {},
        listeners: {
            afterRenderUI: function () {
                PFRequest.get('/publish/PublishGetProductInfoChange.json', requestParam, {
                    success: function(responseData) {

                        $('.pd-info-change-grid-wrap .pd-info-change-grid').empty();

                        var newResultObj = {};
                        var resultArr = [];

                        responseData.publishPdInfoChange.forEach(function (record) {
                        	var resultObj;
                        	if(record.changeTargetTable == 'PD_PD_M') {

                            	resultObj = {
                            			'sequenceNumber' : record.sequenceNumber,
                            			'changeType' : record.changeType,
                            			'allTableColumns' : record.allTableColumns,
                            			'changeTargetTable' : record.changeTargetTable,
                            			'targetTableKey' : record.targetTableKey,
                            			'txDataContentKeyValue' : record.txDataContentKeyValue,
                            			'leaf' : false
                            	};

                        		// PD_PD_M 일경우 child 조립 대상 테이블
                    			var childObjArr = [];
                		       responseData.publishPdInfoChange.forEach(function (record_) {
                		    	   if(record_.changeTargetTable == 'PD_PD_CG_R'
                            			|| record_.changeTargetTable == 'PD_PD_CHNG_H'
                        				|| record_.changeTargetTable == 'PD_PD_R'
                    					|| record_.changeTargetTable == 'PD_PD_DOC_D'
                						|| record_.changeTargetTable == 'PD_CL_M'
            							|| record_.changeTargetTable == 'PD_PD_STS_H'
        								|| record_.changeTargetTable == 'PD_PD_CUST_R'
    									|| record_.changeTargetTable == 'PD_CG_STS_H'
										|| record_.changeTargetTable == 'PD_CG_M'
            							|| record_.changeTargetTable == 'PD_PD_BR_R') {

                    					var childObj = {
                        					'sequenceNumber' : record_.sequenceNumber,
                                			'changeType' : record_.changeType,
                                			'allTableColumns' : record_.allTableColumns,
                                			'changeTargetTable' : record_.changeTargetTable,
                                			'targetTableKey' : record_.targetTableKey,
                                			'txDataContentKeyValue' : record_.txDataContentKeyValue,
                                			'leaf' : true
                            			};

                    					childObjArr.push(childObj);
                               		}
                		       });
                		       resultObj.children = childObjArr;

                        	}
                        	else if(record.changeTargetTable == 'PD_PD_CND_M') {
                              	resultObj = {
                            			'sequenceNumber' : record.sequenceNumber,
                            			'changeType' : record.changeType,
                            			'allTableColumns' : record.allTableColumns,
                            			'changeTargetTable' : record.changeTargetTable,
                            			'targetTableKey' : record.targetTableKey,
                            			'txDataContentKeyValue' : record.txDataContentKeyValue,
                            			'leaf' : false
                            	};

                        		// PD_PD_CND_M 일경우 child 조립 대상 테이블
                    			var childObjArr = [];
                		       responseData.publishPdInfoChange.forEach(function (record_) {
                		    	   if(record_.changeTargetTable == 'PD_PD_CND_STS_H'
                            			|| record_.changeTargetTable == 'PD_PD_LST_CND_D'
                        				|| record_.changeTargetTable == 'PD_PD_RNG_CND_D'
                    					|| record_.changeTargetTable == 'PD_PD_INT_CND_D'
                						|| record_.changeTargetTable == 'PD_PD_FEE_CND_D'
            							|| record_.changeTargetTable == 'PD_PD_CX_LST_CND_D'
        								|| record_.changeTargetTable == 'PD_PD_CX_RNG_CND_D'
    									|| record_.changeTargetTable == 'PD_PD_CX_INT_CND_D'
										|| record_.changeTargetTable == 'PD_PD_CX_FEE_CND_D'

											// TODO 그룹핑 - 복합구조영역 재검토 필요.
//										|| record_.changeTargetTable == 'PD_CX_STRC_M'
//										|| record_.changeTargetTable == 'PD_CX_CMPS_D'
//										|| record_.changeTargetTable == 'PD_CX_TIER_D'
                		    	   ) {

                		    		   var isAllKeyYn = true;
                		    		   record.targetTableKey.forEach(function(key) {
                		    			  record.txDataContentKeyValue.forEach(function(value) {

                		    				 if(value.key == key) {
                		    					 record_.txDataContentKeyValue.forEach(function(value_) {
                		    						if(value_.key == value.key && value_.value != value.value) {
                		    							isAllKeyYn = false;
                		    							return false;
                		    						}
                		    					 });
                		    				 }
                		    			  });
                		    		   });

                		    		   if(isAllKeyYn) {
                		    			   var childObj = {
                        					'sequenceNumber' : record_.sequenceNumber,
                                			'changeType' : record_.changeType,
                                			'allTableColumns' : record_.allTableColumns,
                                			'changeTargetTable' : record_.changeTargetTable,
                                			'targetTableKey' : record_.targetTableKey,
                                			'txDataContentKeyValue' : record_.txDataContentKeyValue,
                                			'leaf' : true
                		    			   };

                		    			   childObjArr.push(childObj);
                		    		   }
                               		}
                		       });
                		       resultObj.children = childObjArr;
                        	}
                        	else if(record.changeTargetTable == 'PD_PDT_M') {
                              	resultObj = {
                            			'sequenceNumber' : record.sequenceNumber,
                            			'changeType' : record.changeType,
                            			'allTableColumns' : record.allTableColumns,
                            			'changeTargetTable' : record.changeTargetTable,
                            			'targetTableKey' : record.targetTableKey,
                            			'txDataContentKeyValue' : record.txDataContentKeyValue,
                            			'leaf' : false
                            	};

                        		// PD_PDT_M 일경우 child 조립 대상 테이블
                    			var childObjArr = [];
                		       responseData.publishPdInfoChange.forEach(function (record_) {
                		    	   if(record_.changeTargetTable == 'PD_PDT_STS_H'
                		    		   || record_.changeTargetTable == 'PD_PDT_CGT_R') {

                		    		   var isAllKeyYn = true;
                		    		   record.targetTableKey.forEach(function(key) {
                		    			  record.txDataContentKeyValue.forEach(function(value) {

                		    				 if(value.key == key) {
                		    					 record_.txDataContentKeyValue.forEach(function(value_) {
                		    						if(value_.key == value.key && value_.value != value.value) {
                		    							isAllKeyYn = false;
                		    							return false;
                		    						}
                		    					 });
                		    				 }
                		    			  });
                		    		   });

                		    		   if(isAllKeyYn) {
                		    			   var childObj = {
                        					'sequenceNumber' : record_.sequenceNumber,
                                			'changeType' : record_.changeType,
                                			'allTableColumns' : record_.allTableColumns,
                                			'changeTargetTable' : record_.changeTargetTable,
                                			'targetTableKey' : record_.targetTableKey,
                                			'txDataContentKeyValue' : record_.txDataContentKeyValue,
                                			'leaf' : true
                		    			   };

                		    			   childObjArr.push(childObj);
                		    		   }
                               		}
                		       });
                		       resultObj.children = childObjArr;
                        	}
                        	else if(record.changeTargetTable == 'PD_CGT_M') {
                        		resultObj = {
                        				'sequenceNumber' : record.sequenceNumber,
                        				'changeType' : record.changeType,
                        				'allTableColumns' : record.allTableColumns,
                        				'changeTargetTable' : record.changeTargetTable,
                        				'targetTableKey' : record.targetTableKey,
                        				'txDataContentKeyValue' : record.txDataContentKeyValue,
                        				'leaf' : false
                        		};

                        		// PD_CGT_M 일경우 child 조립 대상 테이블
                        		var childObjArr = [];
                        		responseData.publishPdInfoChange.forEach(function (record_) {
                        			if(record_.changeTargetTable == 'PD_CGT_CT_R'
                        				|| record_.changeTargetTable == 'PD_RNG_CT_D'
                        				|| record_.changeTargetTable == 'PD_CGT_CT_CT_R'
                    					|| record_.changeTargetTable == 'PD_CGT_CTV_CTV_R'
                						|| record_.changeTargetTable == 'PD_LST_CT_D'
                        				|| record_.changeTargetTable == 'PD_PDT_CGT_R') {

                        				var isAllKeyYn = true;
                        				record.targetTableKey.forEach(function(key) {
                        					record.txDataContentKeyValue.forEach(function(value) {

                        						if(value.key == key) {
                        							record_.txDataContentKeyValue.forEach(function(value_) {
                        								if(value_.key == value.key && value_.value != value.value) {
                        									isAllKeyYn = false;
                        									return false;
                        								}
                        							});
                        						}
                        					});
                        				});

                        				if(isAllKeyYn) {
                        					var childObj = {
                        							'sequenceNumber' : record_.sequenceNumber,
                        							'changeType' : record_.changeType,
                        							'allTableColumns' : record_.allTableColumns,
                        							'changeTargetTable' : record_.changeTargetTable,
                        							'targetTableKey' : record_.targetTableKey,
                        							'txDataContentKeyValue' : record_.txDataContentKeyValue,
                        							'leaf' : true
                        					};

                        					childObjArr.push(childObj);
                        				}
                        			}
                        		});
                        		resultObj.children = childObjArr;
                        	}
                        	else if(record.changeTargetTable == 'PD_CT_M') {
                        		resultObj = {
                        				'sequenceNumber' : record.sequenceNumber,
                        				'changeType' : record.changeType,
                        				'allTableColumns' : record.allTableColumns,
                        				'changeTargetTable' : record.changeTargetTable,
                        				'targetTableKey' : record.targetTableKey,
                        				'txDataContentKeyValue' : record.txDataContentKeyValue,
                        				'leaf' : false
                        		};

                        		// PD_CGT_M 일경우 child 조립 대상 테이블
                        		var childObjArr = [];
                        		responseData.publishPdInfoChange.forEach(function (record_) {
                        			if(record_.changeTargetTable == 'PD_LST_CT_M') {

                        				var isAllKeyYn = true;
                        				record.targetTableKey.forEach(function(key) {
                        					record.txDataContentKeyValue.forEach(function(value) {

                        						if(value.key == key) {
                        							record_.txDataContentKeyValue.forEach(function(value_) {
                        								if(value_.key == value.key && value_.value != value.value) {
                        									isAllKeyYn = false;
                        									return false;
                        								}
                        							});
                        						}
                        					});
                        				});

                        				if(isAllKeyYn) {
                        					var childObj = {
                        							'sequenceNumber' : record_.sequenceNumber,
                        							'changeType' : record_.changeType,
                        							'allTableColumns' : record_.allTableColumns,
                        							'changeTargetTable' : record_.changeTargetTable,
                        							'targetTableKey' : record_.targetTableKey,
                        							'txDataContentKeyValue' : record_.txDataContentKeyValue,
                        							'leaf' : true
                        					};

                        					childObjArr.push(childObj);
                        				}
                        			}
                        		});
                        		resultObj.children = childObjArr;
                        	}
                        	else {
                        		if(PD_PD_M_TABLES[record.changeTargetTable] == undefined
                        				&& PD_PD_CND_M_TABLES[record.changeTargetTable] == undefined
                        				&& PD_CGT_M[record.changeTargetTable] == undefined
                        				&& PD_CT_M[record.changeTargetTable] == undefined
                        				&& PD_PDT_M[record.changeTargetTable] == undefined) {

                        	       	resultObj = {
                                			'sequenceNumber' : record.sequenceNumber,
                                			'changeType' : record.changeType,
                                			'allTableColumns' : record.allTableColumns,
                                			'changeTargetTable' : record.changeTargetTable,
                                			'targetTableKey' : record.targetTableKey,
                                			'txDataContentKeyValue' : record.txDataContentKeyValue,
                                			'leaf' : true
                                	};
                        		}
                        	}

                        	if(resultObj != undefined) resultArr.push(resultObj);
                        });

                        newResultObj.result = resultArr;
                        newResultObj.leaf = false;

                        Ext.define('Car', {
                            extend: 'Ext.data.Model',
                            fields: ['sequenceNumber'
                                     , 'changeType', 'changeTypeNm'
                                     , 'changeTargetTable'
                                     , 'targetTableKey', 'txDataContentKeyValue'
                                     , 'contents', 'allTableColumns'
                                 ],
                            proxy: {
                                type: 'memory',
                                data: {
                                    success: true,
                                    children : newResultObj.result
                                }
                            }
                        });

                        var store = Ext.create('Ext.data.TreeStore', {
                            model: 'Car'
                        });

                        Ext.create('Ext.tree.Panel', {
                        	height: '420px',
                            store: store,
                            rootVisible: false,
                            lines: true,
                            useArrows: true,
                            renderTo: $('.pd-info-change-grid-wrap .pd-info-change-grid')[0],
                            columns: [
                                      // 일련번호
                                      {xtype: 'treecolumn', text: bxMsg('DAS0101String11'), width: 60, dataIndex: 'sequenceNumber'},

                                      // 구분(테이블)
                                      {text: bxMsg('PAS0501String8'), width: 150,
                                          renderer: function(value, p, record){
                                              return bxMsg(record.get('changeTargetTable').toLowerCase()) + '</br>' + '[' + record.get('changeTargetTable') + ']';
                                          }
                                      },

                                      // 변경구분
                                      {text: bxMsg('changeDistinction'), width: 60, dataIndex: 'changeType',
                                    	  renderer: function(value, p, record) {
                                    		  var result = '';
                                    		  // 등록
                                    		  if(value == 'C') {
                                    			  result = bxMsg('registration');
                                    		  }
                                    		  // 수정
                                    		  else if(value == 'U') {
                                    			  result = bxMsg('modify');
                                    		  }
                                    		  // 삭제
                                    		  else {
                                    			  result = bxMsg('Z_Del');
                                    		  }
                                    		  return result;
                                    	  }
                                      },

                                      // 내용
                                      {text: bxMsg('PAS0203String3'), flex: 1,
                                          renderer: function(value, p, record){
                                              var result = '';

                                              // DB Data가 존재하지않는 경우가 존재하여 방지.
                                              if(record.get('txDataContentKeyValue').length == 0) {
                                            	  return result;
                                              }
                                              var keyValueMap = getKeyValueMap(record.get('txDataContentKeyValue'));

                                              var cndGrpTmpltExistYn = false;
                                              var cndCdExistYn = false;
                                              var cndGrpTmpltInfo = '';
                                              record.get('targetTableKey').forEach(function(el){
                                            	  if(el == 'cndGrpTmpltCd') {
                                            		  cndGrpTmpltExistYn = true;

                                                      var codeName;
                                                      if(columnCodeMap[keyValueMap[el].key]){
                                                          codeName = codeMapObj[columnCodeMap[keyValueMap[el].key]][keyValueMap[el].value]
                                                      }else {
                                                          codeName = '';
                                                      }

                                                      var name;
                                                      if(keyValueMap[el].name){
                                                          name = keyValueMap[el].name;
                                                      }else {
                                                          name = '';
                                                      }
                                                      var value = keyValueMap[el].value == undefined ? '' : keyValueMap[el].value;
                                                      cndGrpTmpltInfo = cndGrpTmpltInfo + ' [' + value + '] ' + name + codeName;
                                            	  }
                                            	  else if(el == 'cndCd') {
                                            		  cndCdExistYn = true;
                                            	  }
                                              });
                                              record.get('targetTableKey').forEach(function(el) {
                                                  if(el == 'cndGrpCd') return;

                                                  if(el == 'cndGrpTmpltCd' && cndGrpTmpltExistYn && cndCdExistYn) {
                                                	  return;
                                                  }

                                                  var codeName;
                                                  if(columnCodeMap[keyValueMap[el].key]){
                                                      codeName = codeMapObj[columnCodeMap[keyValueMap[el].key]][keyValueMap[el].value]
                                                  }else {
                                                      codeName = '';
                                                  }


                                                  var name;
                                                  if(keyValueMap[el].name){
                                                      name = keyValueMap[el].name;
                                                  }else {
                                                      name = '';
                                                  }

                                                  // 20160830 OHS - 화면에 undefined로 보이는것 처리
                                                  var value = keyValueMap[el].value == undefined ? '' : keyValueMap[el].value;
                                                  if(el == 'cndCd' && cndGrpTmpltExistYn) {
                                                	  result = result + bxMsg(el) + ' : ' + cndGrpTmpltInfo + ' / [' + value + '] ' + name + codeName + '</br>';
                                                  }
                                                  else {
                                                	  result = result + bxMsg(el) + ' : [' + value + '] ' + name + codeName + '</br>';
                                                  }
                                              });
                                              return result;
                                          }
                                      }
                                  ],
                                  listeners: {
                                      scope: this,
                                      celldblclick:function(_this, _td, _cellIndex, _record, _tr, _rowIndex, _e, _eOpts ) {
                                    	  if(_record.data.txDataContentKeyValue && _record.data.txDataContentKeyValue.length > 0 ){
                                              renderPdInfoChangeDetail(_record.data);
                                              return false;
                                          }
                                      }
                                  },
                        });
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PublishService',
                        operation: 'queryProductInfoChangeHistory'
                    }
                });
            }
        }
    });
}



/*
 * 산식 editor popup
 * script :
 *  - <script id="pf-formula-editor-popup pf-panel" type="text/x-handlebars-template"></script>
 * input  :
 * 	- submitEvent
 * 	- data = {
 * 		formulaContent : 산식내용
 * 		type : ''-선택, '01'-목록, '02'-범위, '03'-금리, '04'-수수료
 *  }
 *
 * output : formulaContent, conversionFormula
 *  - submitEvent(formulaContent, conversionFormula)
 */
function renderFormulaEditor(submitEvent, data){


    var htmlString
    = '<div class="pf-formula-editor-popup pf-panel">																			  '
	+ '        <div class="pf-panel-body formula-editor-table-wrap" style="top:0px;">                                             '
	+ '    <table class="bx-info-table formula-editor-table">                                                                     '
	+ '        <tr>                                                                                                               '
	+ '            <th style="width:70px;">' + bxMsg('formulaCntnt') + '</th>                                                     '
	+ '            <td>                                                                                                           '
	+ '                <textarea type="text" data-form-param="intRtStructureContent"                   '
	+ '                       class="bx-form-item formula-content"                                                                '
	+ '                       style="height:50px; width:650px;" disabled/>                                                        '
	+ '                <button type="button" class="bw-btn formula-validation-btn" style="top:25px; right:10px; position: absolute;" icon-tooltip="' + bxMsg('validation') + '" >   '
	+ '                    <i class="bw-icon i-25 i-func-submit2"></i>                                                            '
	+ '                </button>                                                                                                  '
	+ '            </td>                                                                                                          '
	+ '        </tr>                                                                                                              '
	+ '        <tr>                                                                                                               '
	+ '            <th></th>                                                                                                      '
	+ '            <td>                                                                                                           '
	+ '                <textarea type="text" data-form-param="conversionContent"                     '
	+ '                          class="bx-form-item conversion-content"                                                          '
	+ '                          style="height:50px" disabled/>                                                                   '
	+ '            </td>                                                                                                          '
	+ '        </tr>                                                                                                              '
	+ '    </table>                                                                                                               '
	+ '</div>                                                                                                                     '
	+ '<div class="pf-panel-body formula-editor-grid-wrap" style="margin-top:10px;left: 0px;width: 525px;position: relative;">    '
	+ '    <table class="bx-info-table">                                                                                          '
	+ '        <tr>                                                                                                               '
	+ '            <th style="width:60px;">' + bxMsg('DPP0127String3') +'</th>                                                    '
	+ '            <td style="width:120px;">                                                                                      '
	+ '                <select class="bx-form-item bx-compoenent-small select-item cnd-type-select" style="width:80px;"/>         '
	+ '            </td>                                                                                                          '
	+ '            <th style="width:50px;">' + bxMsg('DTP0203String2') +'</th>                                                    '
	+ '            <td>                                                                                                           '
	+ '                <input type="text" class="bx-form-item bx-compoenent-small cnd-name-search"/>                              '
	+ '            </td>                                                                                                          '
	+ '            <td>                                                                                                           '
	+ '                <button class="bw-btn cnd-tpl-search" icon-tooltip="' + bxMsg('ButtonBottomString4') + '">                 '
	+ '                    <i class="bw-icon i-25 i-search"></i>                                                                  '
	+ '                </button>                                                                                                  '
	+ '            </td>                                                                                                          '
	+ '        </tr>                                                                                                              '
	+ '    </table>                                                                                                               '
	+ '    <div class="formula-editor-grid" style="height:220px; margin-top:10px;"></div>                                         '
	+ '</div>                                                                                                                     '
	+ '<div class="pf-panel-body formula-editor-btn-wrap" style="top:197px; right:15px; width:235px; height: 281px; position: absolute;">'
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn large-button" value="case">case</button>   '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn large-button" value="min">min</button>     '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn large-button" value="max">max</button>     '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="(">(</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value=",">,</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value=")">)</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn back-space-btn small-button" value="">←</button>          '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="7">7</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="8">8</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="9">9</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="/">÷</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="4">4</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="5">5</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="6">6</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="*">x</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="1">1</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="2">2</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="3">3</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="-">-</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="0" style="width:104px;">0</button> '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value=".">.</button>         '
	+ '             <button type="button" class="bw-btn formula-cal-btn text-input-btn small-button" value="+">+</button>         '
	+ '</div>                                                                                                                     '
	+ '</div>                                                                                                                     ';

	$('#pf-formula-editor-popup').html(htmlString);

	var formulaEditorPopupTpl = Handlebars.compile($('#pf-formula-editor-popup').html());
	var cndPopupGrid;
	var tokens, conditionMap={};

    PFComponent.makePopup({
        title: bxMsg('formulaEdit'),		// 산식관리
        contents: formulaEditorPopupTpl(),
        width: 800,
        height: 500,
        buttons: [
            {
                text:bxMsg('ButtonBottomString3'),
                elCls:'button button-primary',
                handler:function() {
                    var formulaContent = $('.pf-formula-editor-popup .formula-content').val();
                    var conversionFormula = $('.pf-formula-editor-popup .conversion-content').val();
                    submitEvent(formulaContent, conversionFormula);
                    this.close();
                }
            },
            {
                text:bxMsg('ButtonBottomString17'),
                elCls:'button button-primary',
                handler:function() {
                    this.close();
                }
            }
        ],
        contentsEvent: {
            'click .text-input-btn' : function(e){

            	var s = $(e.currentTarget).val();
                var type = PFFormulaEditor.getTokenType(s);

                tokens.push({
                  type: type,
                  value: s
                });

                var cntnt = PFFormulaEditor.toContent(tokens, " ");
                fnBindFormula(cntnt);
            },

            'click .back-space-btn' : function(e){
            	tokens.pop();
            	var cntnt = PFFormulaEditor.toContent(tokens, " ");
            	fnBindFormula(cntnt);
            },


            // 검증버튼
            'click .formula-validation-btn' :function(e) {

                var requestParam = PFComponent.makeYGForm($('.formula-editor-table')).getData();

                if(!requestParam.intRtStructureContent){
                    PFComponent.showMessage(bxMsg('FormulaContentError'), 'warning');
                    return;
                }

                if(!PFFormulaEditor.validate(requestParam.intRtStructureContent)){
                	PFComponent.showMessage(bxMsg('invalidFormula'), 'warning');
                    return;
                }

                PFRequest.get('/interestRateStructure/validateFormula.json', requestParam, {
                    success: function (responseData) {
                        $('.pf-formula-editor-popup .conversion-content').val(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'InterestRateStructureService',
                        operation: 'validateFormula'
                    }
                });
            },
            'click .cnd-tpl-search': function(e){

                fnSearchCondition();
            }
        },
        listeners: {
            afterSyncUI: function () {

                var type = data.type ? data.type : "";
                renderComboBox('ProductConditionTypeCode', $('.pf-formula-editor-popup .cnd-type-select'), type, true, bxMsg("select"));

                tokens = PFFormulaEditor.tokenize(data.formulaContent);

                cndPopupGrid = PFComponent.makeExtJSGrid({
                    fields: ['code', 'conditionDetailTypeCode', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                        name: 'typeNm',
                        convert: function(newValue, record) {
                            var typeNm;
                            if(record.get('type')=='03'){
                                typeNm = codeMapObj.ProductConditionInterestDetailTypeCode[record.get('conditionDetailTypeCode')];
                            }else if(record.get('type')=='04'){
                                typeNm = codeMapObj.ProductConditionFeeDetailTypeCode[record.get('conditionDetailTypeCode')];
                            }else {
                                typeNm = codeMapObj.ProductConditionDetailTypeCode[record.get('conditionDetailTypeCode')];
                            }
                            return typeNm;
                        }}],
                    gridConfig: {
                        renderTo: '.formula-editor-grid',
                        columns: [
                            {text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code'},
                            {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                            {text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm'},
                            {text: bxMsg('DPS0101String6'), width: 60, dataIndex: 'isActive',
                                renderer: function(value, p, record) {
                                    if (value === 'Y') {
                                        return bxMsg('active');
                                    } else if (value === 'N') {
                                        return bxMsg('inactive');
                                    }
                                }
                            }
                        ],
                        listeners: {
                            scope: this,
                            'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                                tokens.push({
                                    type: TokenType.CONDITION,
                                    value: "#" + record.get("code")
                                  });

                                var cntnt = PFFormulaEditor.toContent(tokens, " ")

                                $('.pf-formula-editor-popup .formula-content').val(cntnt);

                                if(PFFormulaEditor.validate(cntnt)){
                                	var convertCntnt = PFFormulaEditor.translate(cntnt, conditionMap, " ")
                            		$('.pf-formula-editor-popup .conversion-content').val(convertCntnt);
                            	}else{
                            		$('.pf-formula-editor-popup .conversion-content').val(bxMsg('invalidFormula'));
                            	}
                            }
                        }
                    }
                });

                fnSearchCondition(data.formulaContent);
            }
        }
    });

    function fnBindFormula(formulaContent){

    	$('.pf-formula-editor-popup .formula-content').val(formulaContent);
    	if(formulaContent.length == 0){
    		$('.pf-formula-editor-popup .conversion-content').val('');
    		return;
    	}

        if(PFFormulaEditor.validate(formulaContent)){
        	var convertCntnt = PFFormulaEditor.translate(formulaContent, conditionMap, " ")
    		$('.pf-formula-editor-popup .conversion-content').val(convertCntnt);
    	}else{
    		$('.pf-formula-editor-popup .conversion-content').val(bxMsg('invalidFormula'));
    	}
    }

    function fnSearchCondition(formulaContent){
        var requestParam = {
            'conditionName': $('.pf-formula-editor-popup .cnd-name-search').val(),		// 조건명
        };

        var comboVal = $('.pf-formula-editor-popup .cnd-type-select').val();			// 조건유형 콤보

        if (comboVal) {
            requestParam.conditionTypeCode = comboVal;						// 조건유형값
        }

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
            success: function (responseData) {
                cndPopupGrid.setData(responseData);

                responseData.forEach(function(el){
                	conditionMap[el.code] = el.name;
                });

                if(formulaContent){
                	fnBindFormula(formulaContent);
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndTemplateService',
                operation: 'queryListCndTemplate'
            }
        });
    }
}