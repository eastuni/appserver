function renderConditionValue3Popup(data, rowIndex, historyButton){
    var button;
    var enterFlag = false; // 참조상품코드, 참조조건코드 조회 flag

    if (historyButton){
        button = historyButton;
    } else {
        if (!data) {
            data = {};
        }
        data.minInterestRate = PFValidation.gridFloatCheckRenderer(data.minInterestRate, 3, 6);
        data.maxInterestRate = PFValidation.gridFloatCheckRenderer(data.maxInterestRate, 3, 6);
        data.applyMinInterestRate = PFValidation.gridFloatCheckRenderer(data.applyMinInterestRate, 3, 6);
        data.applyMaxInterestRate = PFValidation.gridFloatCheckRenderer(data.applyMaxInterestRate, 3, 6);
        data.rate = PFValidation.gridFloatCheckRenderer(data.rate, 3, 6);
        data.minSprdRt = PFValidation.gridFloatCheckRenderer(data.minSprdRt, 3, 6); // 스프레드율 최소
        data.maxSprdRt = PFValidation.gridFloatCheckRenderer(data.maxSprdRt, 3, 6); // 스프레드율 최대

        button = [
            // 확인
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary write-btn', handler:function(){

                var $popup = $('.cnd-value-type3-popup');

            	if ($('.cnd-value-type3-popup .fixed-info .interest-min-check').length>0 &&
                		!PFValidation.minMaxCheck($popup, '.fixed-info .interest-min-check', '.fixed-info .interest-max-check', '.fixed-info .interest-default-check')) {

                		PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                }
                if ($('.cnd-value-type3-popup .var-info .interest-min-check').length>0 &&
                	!PFValidation.minMaxCheck($popup, '.var-info .interest-min-check', '.var-info .interest-max-check', '.var-info .interest-default-check')) {

                	PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                    return;
                }

                if ($('.cnd-value-type3-popup .fixed-info .applyMinInterestRate-min-check').length>0 &&
                	!PFValidation.minMaxCheck($popup, '.fixed-info .applyMinInterestRate-min-check', '.fixed-info .applyMinInterestRate-max-check')) {

                	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                    return;
                }
                if ($('.cnd-value-type3-popup .var-info .applyMinInterestRate-min-check').length>0 &&
                	!PFValidation.minMaxCheck($popup, '.var-info .applyMinInterestRate-min-check', '.var-info .applyMinInterestRate-max-check')) {

                	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                    return;
                }

                // 상품결정레벨이 상품인 경우
                if(selectedCondition.conditionAgreeLevel == '01'){
                	if($popup.find('.fixed-info .InterestTypeCode').val() != '01') {
                		$popup.find('.fixed-info .maxSprdRt').val($popup.find('.fixed-info .minSprdRt').val());
                	}
                	if($popup.find('.var-info .InterestTypeCode').val() != '01') {
                		$popup.find('.var-info .maxSprdRt').val($popup.find('.var-info .minSprdRt').val());
                	}
                }

                var dontSave = false;
                var formData = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .default-condition-info')).getData();

                // 금리적용방식코드 분기
                // 고정적용
                if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '01') {
                    var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                    formData = $.extend(formData,detailInfo);
                }
                // 변동적용
                else if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                    formData = $.extend(formData,detailInfo);
                }
                // 고정후변동
                else if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '03'){
                	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                	detailInfo.varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                    formData = $.extend(formData,detailInfo);
                }
                // 타상품참조
                else if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
                	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .cnd-value-type3-ref-info .bx-info-table')).getData();
                    formData = $.extend(formData,detailInfo);
                }

                // 금리유형에 따른 분기 - 고정후변동일 때
                if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '03'){

                	/*
                	 * 고정정보
                	 */
                	// 금리값
                    if($popup.find('.fixed-info .InterestTypeCode').val() == '01') {
                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .fixed-info .interest-value-wrap .bx-info-table')).getData();

                        formData = $.extend(formData,detailInfo);
                    }
                    // 기준금리
                    else if($popup.find('.fixed-info .InterestTypeCode').val() == '02') {
                        if(!$popup.find('.fixed-info .BaseIntRtKndCode')) {
                            // 기준금리종류 미입력
                        	$popup.find('.fixed-info .BaseInterestKind').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.fixed-info .BaseIntRtAplyTmCode')) {
                            // 기준금리적용시점코드 미입력
                        	$popup.find('.fixed-info .BaseIntRtAplyTmCode').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.fixed-info .SprdAplyFormulaCode')) {
                            // 스프레드적용산식 미입력
                        	$popup.find('.fixed-info .SprdAplyFormulaCode').addClass("has-error");
                            dontSave = true;
                        }

                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .fixed-info .base-interest-tpl .bx-info-table')).getData();
                        formData = $.extend(formData,detailInfo);

                    }
                    // 타상품금리연동
                    else if($popup.find('.fixed-info .InterestTypeCode').val() == '03') {
                        var detailInfo= PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .fixed-info .interest-link-tpl .bx-info-table')).getData();
                        formData = $.extend(formData,detailInfo);
                        if(formData.refPdCd == null || formData.refPdCd == ''){
                        	$popup.find('.fixed-info .product-code').addClass("has-error");
                        	dontSave = true;
                        }
                        if(formData.refCndCd == null || formData.refCndCd == ''){
                        	$popup.find('.fixed-info .condition-code').addClass("has-error");
                        	dontSave = true;
                        }
                    }

                    /*
                     * 변동정보
                     */
                	// 금리값
                    if($popup.find('.var-info .InterestTypeCode').val() == '01') {
                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .var-info .interest-value-wrap .bx-info-table')).getData();

                        formData.varIntCndValueVO = $.extend(formData.varIntCndValueVO,varIntCndValueVO);
                    }
                    // 기준금리
                    else if($popup.find('.var-info .InterestTypeCode').val() == '02') {
                        if(!$popup.find('.var-info .BaseIntRtKndCode')) {
                            // 기준금리종류 미입력
                        	$popup.find('.var-info .BaseInterestKind').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.var-info .BaseIntRtAplyTmCode')) {
                            // 기준금리적용시점코드 미입력
                        	$popup.find('.var-info .BaseIntRtAplyTmCode').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.var-info .SprdAplyFormulaCode')) {
                            // 스프레드적용산식 미입력
                        	$popup.find('.var-info .SprdAplyFormulaCode').addClass("has-error");
                            dontSave = true;
                        }

                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .var-info .base-interest-tpl .bx-info-table')).getData();
                        formData.varIntCndValueVO = $.extend(formData.varIntCndValueVO,varIntCndValueVO);

                    }
                    // 타상품금리연동
                    else if($popup.find('.var-info .InterestTypeCode').val() == '03') {
                        var varIntCndValueVO= PFComponent.makeYGForm($('.cnd-value-type3-popup .cnd-value-type3 .var-info .interest-link-tpl .bx-info-table')).getData();
                        formData.varIntCndValueVO = $.extend(formData.varIntCndValueVO,varIntCndValueVO);

                        if(formData.varIntCndValueVO.refPdCd == null || formData.varIntCndValueVO.refPdCd == ''){
                        	$popup.find('.var-info .product-code').addClass("has-error");
                        	dontSave = true;
                        }
                        if(formData.varIntCndValueVO.refCndCd == null || formData.varIntCndValueVO.refCndCd == ''){
                        	$popup.find('.var-info .condition-code').addClass("has-error");
                        	dontSave = true;
                        }
                    }
                }else{

                	if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '01'){
                		$popup = $('.cnd-value-type3-popup .fixed-info');
                	}else if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                		$popup = $('.cnd-value-type3-popup .var-info');
                	}else if($popup.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
                		$popup = $('.cnd-value-type3-popup .ref-info');
                	}

                    // 금리값
                    if($popup.find('.InterestTypeCode').val() == '01') {
                        var detailInfo = PFComponent.makeYGForm($popup.find('.interest-value-wrap .bx-info-table')).getData();

                        formDat = $.extend(formData,detailInfo);
                    }
                    // 기준금리
                    else if($popup.find('.InterestTypeCode').val() == '02') {
                        if(!$popup.find('.BaseIntRtKndCode')) {
                            // 기준금리종류 미입력
                        	$popup.find('.BaseInterestKind').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.BaseIntRtAplyTmCode')) {
                            // 기준금리적용시점코드 미입력
                        	$popup.find('.BaseIntRtAplyTmCode').addClass("has-error");
                            dontSave = true;
                        }
                        if(!$popup.find('.SprdAplyFormulaCode')) {
                            // 스프레드적용산식 미입력
                        	$popup.find('.SprdAplyFormulaCode').addClass("has-error");
                            dontSave = true;
                        }

                        var detailInfo = PFComponent.makeYGForm($popup.find('.base-interest-tpl .bx-info-table')).getData();
                        formData = $.extend(formData,detailInfo);

                    }
                    // 타상품금리연동
                    else if($popup.find('.InterestTypeCode').val() == '03') {
                        var detailInfo= PFComponent.makeYGForm($popup.find('.interest-link-tpl .bx-info-table')).getData();
                        formData = $.extend(formData,detailInfo);

                        if(formData.refPdCd == null || formData.refPdCd == ''){
                        	$popup.find('.product-code').addClass("has-error");
                        	dontSave = true;
                        }
                        if(formData.refCndCd == null || formData.refCndCd == ''){
                        	$popup.find('.condition-code').addClass("has-error");
                        	dontSave = true;
                        }
                    }
                }

                // 구성조건값을 선택하지 않았음
                if(dontSave) {
                    //PFComponent.showMessage(bxMsg('DPS0129Error6'), 'warning');
                	PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');		// 입력하지 않은 값이 있습니다.
                    return;
                }

                var record = cndValComplexGrid.store.getAt(rowIndex);

                if(record.data.conditionStatusCode == '01' && (record.data.process == null || record.data.process.length == 0)){
                	var originalData = $.extend(true, {}, record.data);
                    originalData['process'] = 'D';
                    complexGridDeleteData.push(originalData);
                }

                record.set('process', 'C');
                record.set('y', formData);

                modifyFlag = true;
                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ]
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title3'),      // 금리조건 입력
        width: 720,
        height: 680,
        contents: cndValueType3Tpl(data),
        elCls: 'cnd-value-type3-popup',
        buttons: button,
        contentsEvent: {
        	// 고정변동코드 변경처리
            'change .ProductConditionInterestApplyTypeCode': function(e) {
                var $popup =  $('.cnd-value-type3-popup');

                defaultValueSetting = {
                        minInterestRate: '0.000000',
                        maxInterestRate: '0.000000',
                        rate: '0.000000',
                        rateApplyWayCode : $(e.currentTarget).val()
                    };

                renderCndValueType3Tab($popup, {interestConditionValue : defaultValueSetting});
            },
            'change .same-product-yn': function(e){
            	var $popup;

                if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }
                sameProductCheckEvent(e, $popup);
            },
            'focus .varFrqRefCndCd' : function(e){
            	var $popup;

                if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }

                PFPopup.selectConditionTemplate({}, function (data) {
                    $popup.find('.varFrqRefCndCd').val(data.code);
                    $popup.find('.varFrqRefCndNm').val(data.name);
                });
            },
            'focus .product-code' : function(e){
            	var $popup;
            	if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }

                PFPopup.selectProduct({ pdInfoDscd }, function(data) {
                    var code;
                    var name;
                    if(data){
                        code = data.code;
                        name = data.name;
                    }

                    if(code == $(e.currentTarget).val()){
                    	$popup.find('.same-product-yn').prop('checked', true);
                    }else{
                    	$popup.find('.same-product-yn').prop('checked', false);
                    	$popup.find('.product-code').val(code);
                    	$popup.find('.product-name').val(name);
                    }
                    modifyFlag = true;
                });
            },
            'focus .condition-code' : function(e){
            	var $popup;

            	if($(e.currentTarget).parents('.fix-irt-tr').length > 0){
            		$popup = $('.cnd-value-type3-popup .fix-irt-tr');

            		var submitEvent = function(data){
            	        if(!data) return;
            	        $(e.currentTarget).val(data.code);
            	        $('.fix-irt-tr .condition-name').val(data.name); //$('.condition-value .condition-name').val(data.name);
            	    }

            		var requestParam = {
        				pdCd: selectedTreeItem.id //$('.pf-cp-product-info-base-form').find('.product-base-info-code').text()
        				, conditionTypeCode:'02'
					};
            		makeConditionTemplateListSearchPopup(submitEvent, false, requestParam);

            	}else if($(e.currentTarget).parents('.base-interest-type-wrap').length > 0){
            		var submitEvent = function(data){
            	        if(!data) return;
            	        $(e.currentTarget).val(data.code);
            	        if($(e.currentTarget).parents('.fixed-info').length > 0){
            	        	$('.fixed-info .base-interest-type-wrap .condition-name').val(data.name);
    	                }else{
    	                	$('.var-info .base-interest-type-wrap .condition-name').val(data.name);
    	                }
            	    }

            		var requestParam = {
            			pdCd: selectedTreeItem.id //$('.pf-cp-product-info-base-form').find('.product-base-info-code').text()
            		};
            		makeConditionTemplateListSearchPopup(submitEvent, false, requestParam);
            	}else{
            		if($(e.currentTarget).parents('.fixed-info').length > 0){
	                	$popup = $('.cnd-value-type3-popup .fixed-info .interest-link-info-wrap ');
	                }else{
	                	$popup = $('.cnd-value-type3-popup .var-info .interest-link-info-wrap ');
	                }
            		conditionCodeFocusEvent(e , $popup);
            	}
            },
            'focus .reference-product-code' : function(e){
            	var $popup;

                if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info .interest-link-info-wrap');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info .interest-link-info-wrap');
                }
                referenceProductCodeFocusEvent(e , $popup);
            },

            // 고정>금리유형 변경 처리
            'change .InterestTypeCode': function(e) {
                var $popup;

                if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }

                var data = {interestConditionValue:{type:$(e.currentTarget).val()}};
                setInterestCombobox(data, $popup);
            },
            // 고정>고정기간데이터유형구분코드
            'change .fixTrmDataTpDscd': function(e) {
            	setFixTrmDataTpDscd($('.cnd-value-type3-popup .fix-irt-tr'), $(e.currentTarget).val());
            },
        	'change .baseIntRateDataTpDscd': function(e) {
        		var $popup;

                if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }
            	setBaseIntRateDataTpDscd($popup, $(e.currentTarget).val());
            },
            // 스프레드 적용산식 변경 처리
            'change .SprdAplyFormulaCode' : function(e) {
            	var $popup;
            	if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }
                setSprdAplyFormulaCombobox($popup, $(e.currentTarget).val());
            },
            'change .InterestSegmentTypeCode' : function(e) {
            	var $popup;
            	if($(e.currentTarget).parents('.fixed-info').length > 0){
                	$popup = $('.cnd-value-type3-popup .fixed-info');
                }else{
                	$popup = $('.cnd-value-type3-popup .var-info');
                }
                setInterestSegmentTypeCombobox($popup);
            },
        },
        listeners: {
        	afterSyncUI: function() {
                var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type3-popup');
                checkFloatPopup('.float21', 19, 2);
                checkFloatPopup('.float10', 3, 6);
                checkFloatPopup('.float0', 3, 0);

                var focusDragPopup = PFValidation.dragAll('.cnd-value-type3-popup');
                focusDragPopup('.float21');
                focusDragPopup('.float19');
                focusDragPopup('.float10');
                focusDragPopup('.float0');

                var checkFlatForRageType = PFValidation.floatCheckForRangeType($('body'));
                checkFlatForRageType('.float-range-10', 3, 6);
                checkFlatForRageType('.float-range-21', 19, 2);
                checkFlatForRageType('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

                // 우수리적용자리수/적용방법
                if(data.frctnAplyWayCd) {
                    renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'), data.frctnAplyWayCd); // 우수리적용방법코드
                } else {
                    renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'),'',true); // 우수리적용방법코드
                }

                // 금리적용방식코드
                renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode'), data.rateApplyWayCode);
                $('.ProductConditionInterestApplyTypeCode option[value="04"]').remove();    // 팝업에서는 04.타상품참조 제외

                var $popup =  $('.cnd-value-type3-popup');
                renderCndValueType3Tab($popup, {interestConditionValue : data});

                if (historyButton) {
                    $popup.find('input').prop('disabled', true);
                    $popup.find('select').prop('disabled', true);
                }

                // 조건값결정레벨이 상품(01)이면
                if(selectedCondition.conditionAgreeLevel == '01'){
                    // 스프레스율 1개만 입력
                    $popup.find('.maxSprdRt').hide();
                }else{
                    $popup.find('.maxSprdRt').show();
                }

            }
        }
    });
}
