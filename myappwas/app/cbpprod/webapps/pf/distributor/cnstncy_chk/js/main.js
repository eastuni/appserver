/**
 * consistency check java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */

var $loadingDim = $('#loading-dim');

$(function() {

    // Rendering 화면기본항목
    renderCnstncyChkBase();

    // Rendering 그리드
    renderCnstncyChkGrid();

    // 초기조회
    $('.cnstncy-chk-search-btn').click();

    $('body').css('overflow-y', 'scroll');

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});
var tntInstId = getLoginTntInstId();

// Page Root jQuery Element
var $el = $('.pf-cnstncy-chk');

// cnstncyChk Form
var cnstncyChkForm;

// cnstncyChk Grid
var cnstncyChkGrid;



// 정합성체크결과 그리드
var cnstncyChkResultInfoGrid;
// 정합성체크결과상세 그리드
var cnstncyChkResultDetailInfoGrid;

// 재조회없이 결과를 세팅하기위한 변수
var cnstncyChkResponseData;


//Global Variable
var cnstncyChkFormTpl = getTemplate('cnstncyChkFormTpl');
var productInfoTpl = getTemplate('productInfoTpl');
var cnstncyChkResultTab = getTemplate('cnstncyChkResultTab');


// 정합성체크대상 테이블목록
var tables = [];
tables.push(
    {tableName:'pd_base_int_m', logicalTableName:bxMsg('pd_base_int_m')},
    {tableName:'pd_bnft_grp_cmps_d', logicalTableName:bxMsg('pd_bnft_grp_cmps_d')},
    {tableName:'pd_bnft_grp_m', logicalTableName:bxMsg('pd_bnft_grp_m')},
    {tableName:'pd_bnft_prvd_cnd_m', logicalTableName:bxMsg('pd_bnft_prvd_cnd_m')},
    {tableName:'pd_bnft_prvd_list_cnd_d', logicalTableName:bxMsg('pd_bnft_prvd_list_cnd_d')},
    {tableName:'pd_bnft_rule_m', logicalTableName:bxMsg('pd_bnft_rule_m')},
    {tableName:'pd_cg_m', logicalTableName:bxMsg('pd_cg_m')},
    {tableName:'pd_cgt_ct_ct_r', logicalTableName:bxMsg('pd_cgt_ct_ct_r')},
    {tableName:'pd_cgt_ct_r', logicalTableName:bxMsg('pd_cgt_ct_r')},
    {tableName:'pd_cgt_ctv_ctv_r', logicalTableName:bxMsg('pd_cgt_ctv_ctv_r')},
    {tableName:'pd_cgt_m', logicalTableName:bxMsg('pd_cgt_m')},
    {tableName:'pd_cl_d', logicalTableName:bxMsg('pd_cl_d')},
    {tableName:'pd_cl_info_r', logicalTableName:bxMsg('pd_cl_info_r')},
    {tableName:'pd_cl_m', logicalTableName:bxMsg('pd_cl_m')},
    {tableName:'pd_ct_m', logicalTableName:bxMsg('pd_ct_m')},
    {tableName:'pd_cx_cmps_d', logicalTableName:bxMsg('pd_cx_cmps_d')},
    {tableName:'pd_cx_strc_m', logicalTableName:bxMsg('pd_cx_strc_m')},
    {tableName:'pd_cx_tier_d', logicalTableName:bxMsg('pd_cx_tier_d')},
    {tableName:'pd_fee_dc_d', logicalTableName:bxMsg('pd_fee_dc_d')},
    {tableName:'pd_fee_dc_m', logicalTableName:bxMsg('pd_fee_dc_m')},
    {tableName:'pd_lst_ct_d', logicalTableName:bxMsg('pd_lst_ct_d')},
    {tableName:'pd_lst_ct_m', logicalTableName:bxMsg('pd_lst_ct_m')},
    {tableName:'pd_pd_add_inf_d', logicalTableName:bxMsg('pd_pd_add_inf_d')},
    {tableName:'pd_pd_br_r', logicalTableName:bxMsg('pd_pd_br_r')},
    {tableName:'pd_pd_cg_r', logicalTableName:bxMsg('pd_pd_cg_r')},
    {tableName:'pd_pd_chng_h', logicalTableName:bxMsg('pd_pd_chng_h')},
    {tableName:'pd_pd_chnl_r', logicalTableName:bxMsg('pd_pd_chnl_r')},
    {tableName:'pd_pd_cnd_m', logicalTableName:bxMsg('pd_pd_cnd_m')},
    {tableName:'pd_pd_cuseg_r', logicalTableName:bxMsg('pd_pd_cuseg_r')},
    {tableName:'pd_pd_cust_r', logicalTableName:bxMsg('pd_pd_cust_r')},
    {tableName:'pd_pd_cx_fee_cnd_d', logicalTableName:bxMsg('pd_pd_cx_fee_cnd_d')},
    {tableName:'pd_pd_cx_int_cnd_d', logicalTableName:bxMsg('pd_pd_cx_int_cnd_d')},
    {tableName:'pd_pd_cx_lst_cnd_d', logicalTableName:bxMsg('pd_pd_cx_lst_cnd_d')},
    {tableName:'pd_pd_cx_rng_cnd_d', logicalTableName:bxMsg('pd_pd_cx_rng_cnd_d')},
    {tableName:'pd_pd_doc_d', logicalTableName:bxMsg('pd_pd_doc_d')},
    {tableName:'pd_pd_dtl_typ_m', logicalTableName:bxMsg('pd_pd_dtl_typ_m')},
    {tableName:'pd_pd_empl_r', logicalTableName:bxMsg('pd_pd_empl_r')},
    {tableName:'pd_pd_fee_cnd_d', logicalTableName:bxMsg('pd_pd_fee_cnd_d')},
    {tableName:'pd_pd_int_cnd_d', logicalTableName:bxMsg('pd_pd_int_cnd_d')},
    {tableName:'pd_pd_lst_cnd_d', logicalTableName:bxMsg('pd_pd_lst_cnd_d')},
    {tableName:'pd_pd_m', logicalTableName:bxMsg('pd_pd_m')},
    {tableName:'pd_pd_nm_d', logicalTableName:bxMsg('pd_pd_nm_d')},
    {tableName:'pd_pd_psbk_prnt_d', logicalTableName:bxMsg('pd_pd_psbk_prnt_d')},
    {tableName:'pd_pd_r', logicalTableName:bxMsg('pd_pd_r')},
    {tableName:'pd_pd_rng_cnd_d', logicalTableName:bxMsg('pd_pd_rng_cnd_d')},
    //{tableName:'pd_pd_sts_h', logicalTableName:bxMsg('pd_pd_sts_h')},
    {tableName:'pd_pd_typ_m', logicalTableName:bxMsg('pd_pd_typ_m')},
    {tableName:'pd_pdt_cgt_r', logicalTableName:bxMsg('pd_pdt_cgt_r')},
    {tableName:'pd_pdt_m', logicalTableName:bxMsg('pd_pdt_m')},
    {tableName:'pd_pirt_r', logicalTableName:bxMsg('pd_pirt_r')},
    //{tableName:'pd_prvd_cnd_m', logicalTableName:bxMsg('pd_prvd_cnd_m')},
    //{tableName:'pd_prvd_list_cnd_d', logicalTableName:bxMsg('pd_prvd_list_cnd_d')},
    {tableName:'pd_rng_ct_d', logicalTableName:bxMsg('pd_rng_ct_d')},
    {tableName:'pd_bnft_prvd_cnd_add_info_d', logicalTableName:bxMsg('pd_bnft_prvd_cnd_add_info_d')},
    {tableName:'pd_cl_cnd_m', logicalTableName:bxMsg('pd_cl_cnd_m')},
    {tableName:'pd_cl_cx_lst_cnd_d', logicalTableName:bxMsg('pd_cl_cx_lst_cnd_d')},
    {tableName:'pd_cl_cx_rng_cnd_d', logicalTableName:bxMsg('pd_cl_cx_rng_cnd_d')},
    {tableName:'pd_cl_lst_cnd_d', logicalTableName:bxMsg('pd_cl_lst_cnd_d')},
    {tableName:'pd_cl_rng_cnd_d', logicalTableName:bxMsg('pd_cl_rng_cnd_d')},
    //{tableName:'pd_mrchnt_grp_m', logicalTableName:bxMsg('pd_mrchnt_grp_m')},
    //{tableName:'pd_mrchnt_grp_mrchnt_r', logicalTableName:bxMsg('pd_mrchnt_grp_mrchnt_r')},
    //{tableName:'pd_pd_biz_ctgry_r', logicalTableName:bxMsg('pd_pd_biz_ctgry_r')},
    //{tableName:'pd_pd_mrchnt_r', logicalTableName:bxMsg('pd_pd_mrchnt_r')},
    {tableName:'pd_fee_dc_intg_limit_m', logicalTableName:bxMsg('pd_fee_dc_intg_limit_m')},
    {tableName:'pd_fee_dc_intg_limit_fee_dc_r', logicalTableName:bxMsg('pd_fee_dc_intg_limit_fee_dc_r')},
    {tableName:'pd_int_rt_strctr_m', logicalTableName:bxMsg('pd_int_rt_strctr_m')},
    {tableName:'pd_pd_int_rt_strctr_r', logicalTableName:bxMsg('pd_pd_int_rt_strctr_r')}
);
var tableMap = PFUtil.convertArrayToMap(tables, 'tableName', 'logicalTableName', 'table');

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el);

onEvent('click', 'a', function(e) { e.preventDefault(); });

// 조회버튼클릭처리
onEvent('click', '.cnstncy-chk-search-btn', function() {
    var requestData = cnstncyChkForm.getData();

    if(requestData && requestData.cnstncyChkExecEndTimestamp) {
    	requestData.cnstncyChkExecEndTimestamp = requestData.cnstncyChkExecEndTimestamp.substr(0,10)+' 23:59:59';
    }

    var statusListString;
    if(requestData.cnstncyChkStsCd.length > 0) {
        statusListString = ""
        for (var i = 0; i < requestData.cnstncyChkStsCd.length; i++) {
            statusListString += requestData.cnstncyChkStsCd[i] + ",";
        }
        requestData.statusList = statusListString.substr(0, statusListString.length - 1);
    }
    delete requestData.cnstncyChkStsCd;

    var tpDscdListString;
    if(requestData.cnstncyChkTpDscd.length > 0) {
    	tpDscdListString = ""
        for (var i = 0; i < requestData.cnstncyChkTpDscd.length; i++) {
        	tpDscdListString += requestData.cnstncyChkTpDscd[i] + ",";
        }
        requestData.tpDscdList = tpDscdListString.substr(0, tpDscdListString.length - 1);
    }
    delete requestData.cnstncyChkTpDscd;

    PFRequest.get('/cnstncychk/queryCnstncyChkBaseInfoForList.json' , requestData, {
        success: function(responseData) {
        	cnstncyChkGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ConsistencyCheckService',
            operation: 'queryCnstncyChkBaseInfoForList'
        }
    });
});

// 신규버튼클릭처리
onEvent('click', '.cnstncy-chk-new-btn', function(e) {
	// 상세정보 팝업 호출
    renderCnstncyChkDetailPopup();
});

// 초기화 버튼 입력 처리
onEvent('click', '.cnstncy-chk-init-btn', function(e) {
    // CnstncyChk Main Clear
    cnstncyChkForm.reset();
    $('.cnstncy-chk-status-code-list').val('');
    $('.cnstncy-chk-type-dscd-list').val('');
    
    // 멀티선택 처리
    $('select[multiple]').multiselect('reload', '');
    
    cnstncyChkGrid.setData([]);
    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
});

/**
 * Rendering CnstncyChk Base Start
 */
function renderCnstncyChkBase() {
    $el.find('.pf-page-conts').html(cnstncyChkFormTpl());
    cnstncyChkForm = PFComponent.makeYGForm($('.pf-cnstncy-chk-list-form'));

    PFUtil.getDatePicker();

    // 정합성체크상태 콤보조립
    makeComboBox('CnstncyChkStatusCode', '.cnstncy-chk-status-code-list');
    // 정합성체크유형 콤보조립
    makeComboBox('CnstncyChkTpDscd', '.cnstncy-chk-type-dscd-list');
    // 멀티선택 처리
    $('select[multiple]').multiselect();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
}

/**
 * 콤보조립을 위한 함수
 * @param codeName
 * @param renderTo
 */
function makeComboBox(codeName, renderTo) {
	if(!codeName || !renderTo) return;

    var options = [];
    var $defaultOption = $('<option>');
    $.each(codeMapObj[codeName], function(key,value){
        var $option = $('<option>');
        $option.val(key);
        $option.text(value);

        options.push($option);
    });
    $(renderTo).html(options);
}

/***********************************************************************************************************************
 *  그리드 함수
 **********************************************************************************************************************/
// 정합성검증 메인 그리드
function renderCnstncyChkGrid() {
	cnstncyChkGrid = PFComponent.makeExtJSGrid({
    	// 정합성체크ID, 수행시작일자, 수행종료일자, 정합성체크유형, 정합성체크상태
        fields: ['cnstncyChkId', 'execSeqNbr', 'cnstncyChkExecStartTimestamp', 'cnstncyChkExecEndTimestamp', 'cnstncyChkTpDscd', 'cnstncyChkStsCd' ,
                {
            		name: 'cnstncyChkTpName',
            		convert: function(newValue, record) {
            			var cnstncyChkTpName = codeMapObj.CnstncyChkTpDscd[record.get('cnstncyChkTpDscd')];
            			return cnstncyChkTpName;
            		}
                },
        		{
	                name: 'cnstncyChkStsName',
	                convert: function(newValue, record) {
	                    var cnstncyChkStsName = codeMapObj.CnstncyChkStatusCode[record.get('cnstncyChkStsCd')];
	                    return cnstncyChkStsName;
	                }
                }
        ],
        gridConfig: {
            renderTo: '.pf-cnstncy-chk .pf-cnstncy-chk-grid',
            columns: [
                // 1. 정합성체크ID
                // 2. 실행일련번호
                // 3. 수행시작일자
                // 4. 수행종료일자
                // 5. 정합성체크유형
                // 6. 정합성체크상태
                {text: bxMsg('cnstncyChkId'), flex: 1, dataIndex: 'cnstncyChkId', style: 'text-align:center', align: 'center'},
                {text: bxMsg('execSeqNbr'), flex: 1, dataIndex: 'execSeqNbr', style: 'text-align:center', align: 'center'},
                {text: bxMsg('performStartDate'), flex: 1, dataIndex: 'cnstncyChkExecStartTimestamp', style: 'text-align:center', align: 'center'},
                {text: bxMsg('performEndDate'), flex: 1, dataIndex: 'cnstncyChkExecEndTimestamp', style: 'text-align:center', align: 'center'},
                {text: bxMsg('cnstncyChkTpDscd'), flex: 1, dataIndex: 'cnstncyChkTpName', style: 'text-align:center',  align: 'center'},
                {text: bxMsg('cnstncyChkStatus'), flex: 1, dataIndex: 'cnstncyChkStsName', style: 'text-align:center',  align: 'center'}
            ],
            // 이벤트처리
            listeners: {
                scope: this,
                itemdblclick: function (tree, record) {
                	var requestParam = {
                        "cnstncyChkId" : record.data.cnstncyChkId,
                        "execSeqNbr" : record.data.execSeqNbr
                    }
                	//requestParam = PFComponent.makeYGForm($('.pf-cnstncy-chk-list-form'));
                    PFRequest.get('/cnstncychk/queryCnstncyChkBaseInfo.json', requestParam, {
                        success : function(responseData) {
                        	cnstncyChkResponseData = responseData;
                            // 정합성체크 상세 팝업
                        	renderCnstncyChkDetailPopup(cnstncyChkResponseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ConsistencyCheckService',
                            operation: 'queryCnstncyChkBaseInfo'
                        }
                    });
                }
            }
        }
    });
}



/**
 * 정합성체크결과 그리드
 */
function renderCnstncyChkRsltGrid(responseData) {
    // Grid Empty
    $('.pf-cnstncy-chk-target-sys-grid').empty();
    cnstncyChkResultInfoGrid = PFComponent.makeExtJSGrid({
        fields: ["tntInstId", "cnstncyChkId", "sysCd", "sysEnvrnmntDscd", "execSeqNbr", "seqNbr", "cnstncyChkExecStartTimestamp", "cnstncyChkExecEndTimestamp", "cnstncyChkStsCd", "sysNm", "sysEnvrnmntNm",
         		{
 	                name: 'cnstncyChkStsName',
 	                convert: function(newValue, record) {
 	                    var cnstncyChkStsName = codeMapObj.CnstncyChkStatusCode[record.get('cnstncyChkStsCd')];
 	                    return cnstncyChkStsName;
 	                }
                 }],
        gridConfig: {
            renderTo: '.pf-cnstncy-chk-result-grid',
            columns: [
                // 1. 정합성체크시스템
                // 2. 정합성체크시스템환경
                // 3. 정합성체크수행시작
                // 4. 정합성체크수행종료
                // 5. 정합성체크상태
                {text: bxMsg('cnstncyChkSystem'), flex: 1, dataIndex: 'sysNm', style: 'text-align:center', align: 'center'},
                {text: bxMsg('cnstncyChkSystemEnvr'), flex: 1, dataIndex: 'sysEnvrnmntDscd', style: 'text-align:center', align: 'left',
                	renderer: function(value, p, record) {
                    	return codeMapObj.SystemEnvironmentDistinctionCode[value] || value;;
                    }
                },
                {text: bxMsg('cnstncyChkStartDt'), flex: 1, dataIndex: 'cnstncyChkExecStartTimestamp', style: 'text-align:center', align: 'center'},
                {text: bxMsg('cnstncyChkEndDt'), flex: 1, dataIndex: 'cnstncyChkExecEndTimestamp', style: 'text-align:center', align: 'center'},
                {text: bxMsg('cnstncyChkStatus'), flex: 1, dataIndex: 'cnstncyChkStsName', style: 'text-align:center', align: 'center'},
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
                itemdblclick : function(_this, record, item, index){

                	// 정합성체크결과상세 목록조회
                    var requestParam = {
                        tntInstId: record.getData().tntInstId,
                        cnstncyChkId: record.getData().cnstncyChkId,
                        sysCd: record.getData().sysCd,
                        sysEnvrnmntDscd: record.getData().sysEnvrnmntDscd,
                        execSeqNbr : record.getData().execSeqNbr
                    };

                    PFRequest.get('/cnstncychk/queryCnstncyChkResultListInfo.json',requestParam, {
                        success: function (responseData) {
                            if(responseData) {
                            	cnstncyChkResultDetailInfoGrid.setData(responseData);
                            }
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ConsistencyCheckService',
                            operation: 'queryCnstncyChkResultListInfo'
                        }
                    });

                }
            }
        }

    });
    if(responseData) {
    	cnstncyChkResultInfoGrid.setData(responseData);
    }
}

/**
 * 정합성체크결과상세 그리드
 */
function renderCnstncyChkRsltDetailGrid(responseData) {
    // Grid Empty
    $('.pf-cnstncy-chk-target-sys-grid').empty();
    cnstncyChkResultDetailInfoGrid = PFComponent.makeExtJSGrid({
        fields: ["cnstncyChkId", "sysCd", "sysEnvrnmntDscd", "cnstncyChkTrgtTblNm", "execSeqNbr", "seqNbr", "cnstncyChkRsltCd"
                 , "cnstncyChkSrcCntnt", "cnstncyChkTrgtCntnt", "cnstncyChkUnmtchdCntnt",
          		{
  	                name: 'cnstncyChkRsltStsName',
  	                convert: function(newValue, record) {
  	                	var cnstncyChkRsltStsName = '';
  	                	if (record.data.seqNbr > 1) {
  	                		// OHS20180403 수정 - 컬럼 스타일은 renderer 에서 처리하도록 함.
  	                		return bxMsg('checkForDetailPopup');
  	                	}
  	                	else {
  	                		cnstncyChkRsltStsName = codeMapObj.CnstncyChkResultStatusCode[record.get('cnstncyChkRsltCd')];
  	                	}

  	                    return cnstncyChkRsltStsName;
  	                }
                  }],
        gridConfig: {
            renderTo: '.pf-cnstncy-chk-result-detail-grid',
            columns: [
                // 1. 대상테이블명
                // 2. 정합성체크결과상태
                // 3. 불일치건수
                {text: bxMsg('cnstncyChkTrgtTableNm'), flex: 1, dataIndex: 'cnstncyChkTrgtTblNm', style: 'text-align:center', align: 'left'},
                {text: bxMsg('cnstncyChkResultStatus'), flex: 1, dataIndex: 'cnstncyChkRsltStsName', style: 'text-align:center',  align: 'left', 
                    renderer: function(value, p, record, rowIndex, store, view) {
                    	// OHS20180403 수정 - 컬럼 스타일은 renderer 에서 처리하도록 함.
                    	p.style = "color:red;";
                    	return value;
                    }
                },
                {text: bxMsg('cnstncyChkUnMatchCnt'), flex: 1, dataIndex: 'seqNbr', style: 'text-align:center',  align: 'center'}
            ],
            listeners: {
                scope: this,
                itemdblclick : function(_this, record, item, index){

                	// 정합성체크대상결과 상세조회(상세팝업)
                    var requestParam = {
                        tntInstId: record.getData().tntInstId,
                        cnstncyChkId: record.getData().cnstncyChkId,
                        sysCd: record.getData().sysCd,
                        sysEnvrnmntDscd: record.getData().sysEnvrnmntDscd,
                        execSeqNbr : record.getData().execSeqNbr,
                        cnstncyChkTrgtTblNm : record.getData().cnstncyChkTrgtTblNm
                    };

                    PFRequest.get('/cnstncychk/queryCnstncyChkObjResultDetailInfo.json',requestParam, {
                        success: function (responseData) {
                            if(responseData) {
                              renderCnstncyChkObjResultDetailPopup(responseData);
                            }
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ConsistencyCheckService',
                            operation: 'queryCnstncyChkObjResultDetailInfo'
                        }
                    });

                }
            }
        }
    });
    if(responseData) {
    	cnstncyChkResultDetailInfoGrid.setData(responseData);
    }
}
