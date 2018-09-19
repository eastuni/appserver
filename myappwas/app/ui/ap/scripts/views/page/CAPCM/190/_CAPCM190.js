define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/190/_CAPCM190.html'
        , 'bx-component/ext-grid/_ext-grid'
    ]
    , function (config
        , tpl
        , ExtGrid
        ) {


        /**
         * Backbone
         */
        var CAPCM190View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM190-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


                	, 'change .CAPCM190-base-trnsfrKnd-wrap' : 'changeTrnsfrKnd'	


        			, 'click #btn-CAPCM190-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM190-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-detail-modal': 'detailAreaModal'
    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'change .CAPCM190-detail-trnsfrKnd-wrap' : 'changeDetailTrnsfrKnd'
					, 'keydown #searchKey' : 'fn_enter'
                }




//
//
//
                , initialize: function (initData) {
                	// 다른페이지에서 오픈시 필수 입력값
                	/**
                	 * trnsfrKnd : 변환종류코드
                	 * TRNSFR_KND	        TRNSFR_RSLT_VAL
                	 * ABRVTN_NAME           약어명
                	 * AT_NAME                    속성명
                	 * BATCH_JOB_NAME       배치작업명
                	 * CDVAL_NAME               코드값명
                	 * CD_NAME                    코드명
                	 * CLASS_NAME               클래스명
                	 * CL_HRARCY_NAME	       분류체계명
                	 * CL_NAME                      분류명
                	 * DOC_NAME                   문서명
                	 * MENU_NAME                  메뉴명
                	 * MSG_TRNSFRM_NAME	전문변환명
                	 * PDCND_NAME                상품조건명
                	 * PDMDL_NAME	                상품중분류명
                	 * PDTMPLT_NAME              상품템플릿명
                	 * PD_NAME                       상품명
                	 * SCRNITM_NAME             화면항목명
                	 * SCRN_DESC                   화면설명
                	 * SCRN_NAME                   화면명
                	 * SRVC_NAME                   서비스명
                	 * SYS_INTRFC_NAME        인터페이스명
                	 */
                	// trnsfrOriginKeyVal : 변환원천키값




                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;

                    
                    // 2018.05.29  keewoong.hong  Subtask #10531 [CAS-Multilingual] (BPI 지원) 다국어 언어 추가 요청 (따갈로그어, 세부아노어)
                    // 관리 하고자 하는 언어 1, 2, 3 선택                      
                	var sParam = {};
                	sParam.instCd  = $.sessionStorage('headerInstCd');
                	sParam.cdNbr   = "10005";

            		var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

                    that.lngCd1 = "";
                    that.lngCd2 = "";
                    that.lngCd3 = "";
                    
            		var lngCd1 = "";
            		var lngCd2 = "";
            		var lngCd3 = "";

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: false
                        , success: function (responseData) {

                        	if(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm.length > 0) {
                        		$(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function(idx, data) {
                    				if(idx == 0) {
                    					lngCd1 = data.cdNm;
                    					that.lngCd1 = data.cd;
                    				} else if(idx == 1) {
                    					lngCd2 = data.cdNm;
                    					that.lngCd2 = data.cd;
                    				} else if(idx == 2) {
                    					lngCd3 = data.cdNm;
                    					that.lngCd3 = data.cd;
                    				}
                        		});
                        		
                        		// 하단 상세 항목 타이틀 변경
                        		that.$el.find("#CAPCM190-detail-table #label_trnsfrRsltVal1").text(lngCd1);
                        		that.$el.find("#CAPCM190-detail-table #label_trnsfrRsltVal2").text(lngCd2);
                        		that.$el.find("#CAPCM190-detail-table #label_trnsfrRsltVal3").text(lngCd3);
                        		
                        		// 하단 상세 항목필드 placeholer 변경
                        		that.$el.find('#CAPCM190-detail-table [data-form-param="trnsfrRsltVal1"]').prop("placeholder", lngCd1);
                        		that.$el.find('#CAPCM190-detail-table [data-form-param="trnsfrRsltVal2"]').prop("placeholder", lngCd2);
                        		that.$el.find('#CAPCM190-detail-table [data-form-param="trnsfrRsltVal3"]').prop("placeholder", lngCd3);
                        		
                        		// 중단 그리드 Title명 변경
                        		that.CAPCM190Grid.columns[2].text = lngCd1;
                        		that.CAPCM190Grid.columns[3].text = lngCd2;
                        		that.CAPCM190Grid.columns[4].text = lngCd3;
                        		
                        	}
                        }   // end of suucess: fucntion
                    }); // end of bxProxy


                    
                    /* ------------------------------------------------------------ */
                    that.CAPCM190Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'trnsfrOriginKeyVal', 'trnsfrRsltVal1', 'trnsfrRsltVal2', 'trnsfrRsltVal3', 'trnsfrKndCd']
                        , id: 'CAPCM190Grid'
                        , columns: [
							{
								text: 'No.'
							    , dataIndex: 'rowIndex'
							    , sortable: false
							    , width : 80
                                , height: 25
							    , style: 'text-align:center'
							    , align: 'center'
							    // other config you need....
							    , renderer: function (value, metaData, record, rowIndex) {
							        return rowIndex + 1;
							    }
							}
                            , {text: bxMsg('cbb_items.SCRNITM#trnsfrOriginKeyVal'),width: 160,flex: 1, dataIndex: 'trnsfrOriginKeyVal', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#lngCd')+'1',width: 160,flex: 2,dataIndex: 'trnsfrRsltVal1', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#lngCd')+'2',width: 160,flex: 2,dataIndex: 'trnsfrRsltVal2', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#lngCd')+'3',width: 160,flex: 2,dataIndex: 'trnsfrRsltVal3', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#trnsfrTrgtKnd') ,dataIndex: 'trnsfrKnd', hidden : true}
                            , {
                             	xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                             	, items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  that.deleteList.push(record.data);
													  grid.store.remove(record);
												  }
												}
                             	        ]
                             }
                        ] // end of columns


                        // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                        , gridConfig: {
                        	// 셀 에디팅 플러그인
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 2
                                    , listeners: {
                                    	'beforeedit': function (editor, e) {
                                            return false;
                                        } // end of edit
                                    } // end of listners
                                }) // end of Ext.create
                            ] // end of plugins
                        } // end of gridConfig
                        , listeners: {
                            click: {
                                element: 'body'
                                , fn: function () {
                                    //더블클릭시 이벤트 발생
                                    that.doubleiClickGrid();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.createGrid("single");


                    if(that.initData.param) {
                    	if(that.initData.param.trnsfrOriginKeyVal) {
                    		that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrOriginKeyVal"]').val(that.initData.param.trnsfrOriginKeyVal);
                    		
                    		// 조회
                    		// trnsfrKnd 변환유형코드 콤보박스가 다 그려 졌는지 확인 한다.
                    		// 타이머설정
                            var timer = setInterval(function () {
                                if (that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').children().length != 0) {
                                    clearInterval(timer);
                                    var param = {};
                                    //역할분류관계조회
                                    that.queryBaseArea(param);
                                }
                            }, 100);


                    	}
                    }
                    
                    
                }






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  render                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;
                    that.$el.find('.CAPCM190-base-table #trnsfrKndNm').html("ABRVTN_NAME");


                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = "CAPCM190-base-trnsfrKnd-wrap";
                    sParam.targetId = "trnsfrKnd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";


                    // 다른 페이지에서 호출시 해당 값이 있으면 콤보박스를 해당값으로 선택 해 준다.
                    if(that.initData.param) {
                    	if(that.initData.param.trnsfrKnd || that.initData.param.trnsfrKndCd) {
                    		sParam.selectVal = that.initData.param.trnsfrKnd == null ?  that.initData.param.trnsfrKndCd : that.initData.param.trnsfrKnd;
                    		that.$el.find('.CAPCM190-base-table #trnsfrKndNm').html(sParam.selectVal);
                    	}
                    }


                    sParam.cdNbr = "11913";
                    fn_getCodeList(sParam, that);


                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM190-base-noWrdQryDscd-wrap';
                    sParam.targetId = "noWrdQryDscd";
                    sParam.nullYn = "N";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "10000";
                    fn_getCodeList(sParam, that);


                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM190-base-lngCd-wrap';
                    sParam.targetId = "lngCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#nonSelect'); // 선택 안함
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "10005";
                    fn_getCodeList(sParam, that);


                    // 상세 영역
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = "CAPCM190-detail-trnsfrKnd-wrap";
                    sParam.targetId = "trnsfrKnd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = ""; // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11913";
                    fn_getCodeList(sParam, that);
                    that.$el.find('.CAPCM190-detail-table #trnsfrKndNm').html("ABRVTN_NAME");

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM190-wrap #btn-CAPCM190-grid-delete')
                                        		,this.$el.find('.CAPCM190-wrap #btn-detail-save')
                                        			   ]);
                    
                    return that.$el;
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM190-base-table #trnsfrKndNm').html("ABRVTN_NAME");
                    that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrOriginKeyVal"]').val("");
                    that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrRsltVal"]').val("");
                    that.$el.find('.CAPCM190-base-table [data-form-param="lngCd"] option:eq(0)').attr("selected", "selected");


                    that.CAPCM190Grid.resetData();
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrKnd"] option:eq(0)').attr("selected", "selected");
                	that.$el.find('.CAPCM190-detail-table #trnsfrKndNm').html("ABRVTN_NAME");
                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrOriginKeyVal"]').val("");
                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal1"]').val("");
                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal2"]').val("");
                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal3"]').val("");


                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrKnd"]').prop("disabled", false);
                    that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrOriginKeyVal"]').prop("readonly", false);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본조회                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , queryBaseArea: function (sParams) {
                    var that = this;
                    that.inquiryBaseData(sParams);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본조회                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , inquiryBaseData: function (sParams) {
                	var that = this;
                    var sParam = {};


                    if(!fn_isNull(sParams)&& !fn_isNull(sParams.trnsfrKnd)){
                    	sParam.trnsfrKndCd = sParams.trnsfrKnd;
                    }else{
                    	sParam.trnsfrKndCd = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').val();
                    }




                    if(!sParam.trnsfrKndCd) {
                    	fn_alertMessage("", "["+bxMsg('cbb_items.SCRNITM#trnsfrTrgtKnd')+"]"+bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg'));
                    	return;
                    }


                    if( !fn_isNull(sParams)&& !fn_isNull(sParams.trnsfrOriginKeyVal)){
                    	sParam.trnsfrOriginKeyVal = sParams.trnsfrOriginKeyVal;
                    }else{
                    	 sParam.trnsfrOriginKeyVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrOriginKeyVal"]').val();
                    }


                    if( !fn_isNull(sParams)&& !fn_isNull(sParams.trnsfrRsltVal)){
                    	sParam.trnsfrRsltVal = sParams.trnsfrRsltVal;
                    }else{
                    	 sParam.trnsfrRsltVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrRsltVal"]').val();
                    }


                    sParam.lngCd = that.$el.find('.CAPCM190-base-table [data-form-param="lngCd"]').val();


                    if(fn_isNull(sParam.lngCd)) {
                    	sParam.noWrdQryDscd = "N";
                    }
                    else {
                    	sParam.noWrdQryDscd = "Y";              	
                    }


                    var linkData = {"header": fn_getHeader('CAPCM0608401'), "CaMltLngTrnsfrMgmtSvcGetMltLngTrnsfrListIn": sParam};


                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaMltLngTrnsfrMgmtSvcGetMltLngTrnsfrListOut.mltLngGroupList;
                                    var totalCount = responseData.CaMltLngTrnsfrMgmtSvcGetMltLngTrnsfrListOut.totCnt;
                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPCM190Grid.setData(tbList);
                                        that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                        // 삭제 로우 초기화
                                        that.deleteList = [];
                                        //상세부 초기화
                                        that.resetDetailArea();
                                        // 검색결과 설정


                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 저장(삭제)버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , clickDeleteGrid : function(event) {
                	if(this.deleteList.length < 1) {
                		return;
                	}
                	
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteGrid, this);
                } 




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 삭제                 /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , deleteGrid : function(that) {
                	var sParam = {};
                	sParam.mltLngDtlList = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.trnsfrKndCd = data.trnsfrKndCd;
                			delParam.trnsfrOriginKeyVal = data.trnsfrOriginKeyVal;
                			sParam.mltLngDtlList.push(delParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPCM0608301"), "CaMltLngTrnsfrMgmtSvcRegisterMltLngTrnsfrIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.queryBaseArea();
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
                	}


                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장 버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , clickSaveDetail : function(event) {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , saveDetail : function(that) {


                	 var sParam = {};
                	 sParam.mltLngDtlList = [];


                    var trnsfrKnd = that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrKnd"]').val();
                    var trnsfrOriginKeyVal =  that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrOriginKeyVal"]').val();
                    var trnsfrRsltVal1 = that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal1"]').val(); // 한국어
                    var trnsfrRsltVal2 = that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal2"]').val(); // 영어
                    var trnsfrRsltVal3 = that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal3"]').val(); // 중국어

                    if (trnsfrKnd == "" || trnsfrOriginKeyVal == "") {
                    	return;
                    }

                    var mltLngDtl = {};
                	mltLngDtl = {};
                    mltLngDtl.trnsfrKndCd = trnsfrKnd;
                    mltLngDtl.trnsfrOriginKeyVal = trnsfrOriginKeyVal;
                    mltLngDtl.lngCd = that.lngCd1;
                    mltLngDtl.trnsfrRsltVal = trnsfrRsltVal1;
                    sParam.mltLngDtlList.push(mltLngDtl);


                    // 한국어
                   // if(!fn_isNull(koNm)) {
                    	mltLngDtl = {};
                        mltLngDtl.trnsfrKndCd = trnsfrKnd;
                        mltLngDtl.trnsfrOriginKeyVal = trnsfrOriginKeyVal;
                        mltLngDtl.lngCd = that.lngCd2;
                        mltLngDtl.trnsfrRsltVal = trnsfrRsltVal2;


                        sParam.mltLngDtlList.push(mltLngDtl);
                    //}


                    // 중국어
                   // if(!fn_isNull(chNm)) {
                    	mltLngDtl = {};
                    	mltLngDtl.trnsfrKndCd = trnsfrKnd;
                    	mltLngDtl.trnsfrOriginKeyVal = trnsfrOriginKeyVal;
                    	mltLngDtl.lngCd = that.lngCd3;
                    	mltLngDtl.trnsfrRsltVal = trnsfrRsltVal3;


                    	sParam.mltLngDtlList.push(mltLngDtl);
                  //  }


                     var linkData = {"header": fn_getHeader("CAPCM0608101"),"CaMltLngTrnsfrMgmtSvcRegisterMltLngTrnsfrIn": sParam};
                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                 var trnsfrKnd = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').val();
                                 var trnsfrOriginKeyVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrOriginKeyVal"]').val();
                                 var trnsfrRsltVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrRsltVal"]').val();


                                 if (fn_isEmpty(trnsfrKnd) && fn_isEmpty(trnsfrOriginKeyVal) && fn_isEmpty(trnsfrRsltVal)) {
                                     return;
                                 }
                                 else {
                                	 // 재조회
                                	 var sParams = {};

                                	 
                                	 if( trnsfrKnd != sParam.mltLngDtlList[0].trnsfrKndCd ){
                                    	 sParams.trnsfrOriginKeyVal = sParam.mltLngDtlList[0].trnsfrOriginKeyVal;
                                    	 sParams.trnsfrRsltVal = sParam.mltLngDtlList[0].trnsfrRsltVal;
                                    	 sParams.trnsfrKndCd = sParam.mltLngDtlList[0].trnsfrKndCd;
                                    	 sParams.trnsfrKnd = sParam.mltLngDtlList[0].trnsfrKndCd;
                                	 }else{
                                    	 sParams.trnsfrKndCd = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').val();
                                    	 sParams.trnsfrOriginKeyVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrOriginKeyVal"]').val();
                                    	 sParams.trnsfrRsltVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrRsltVal"]').val();
                                    	 console.log('detail' + sParams);
                                	 }

                                	 
                                	 that.queryBaseArea(sParams);
                                 }


                             }
                         }
                     });
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPCM190-grid").html(this.CAPCM190Grid.render({'height': CaGridHeight}));
                } // end of createGrid




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 행 더블클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM190Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrKnd"]').val(selectedRecord.data.trnsfrKndCd);
                    	that.$el.find('.CAPCM190-detail-table #trnsfrKndNm').text(selectedRecord.data.trnsfrKndCd);
                        that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrOriginKeyVal"]').val(selectedRecord.data.trnsfrOriginKeyVal);
                        that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal1"]').val(selectedRecord.data.trnsfrRsltVal1);
                        that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal2"]').val(selectedRecord.data.trnsfrRsltVal2);
                        that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrRsltVal3"]').val(selectedRecord.data.trnsfrRsltVal3);


                        this.$el.find('#CAPCM190-detail-table [data-form-param="trnsfrKnd"]').prop("disabled", true);
                        this.$el.find('#CAPCM190-detail-table [data-form-param="trnsfrOriginKeyVal"]').prop("readonly", true);
                        
                    }
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  변환종류 변경시 옆의 텍스트를 변경 한다.                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , changeTrnsfrKnd : function() {
                	var that = this;
                	var trnsfrKndVal = that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').val();
                	that.$el.find('.CAPCM190-base-table #trnsfrKndNm').text(trnsfrKndVal);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 변환종류 변경시 옆의 텍스트를 변경 한다.                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , changeDetailTrnsfrKnd : function() {
                	var that = this;
                	var trnsfrKndVal = that.$el.find('.CAPCM190-detail-table [data-form-param="trnsfrKnd"]').val();
                	that.$el.find('.CAPCM190-detail-table #trnsfrKndNm').text(trnsfrKndVal);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  조회조건영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , baseSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM190-base-table", this.$el.find("#btn-base-search-modal"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM190-grid", this.$el.find("#btn-up-grid"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , detailAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM190-detail-table", this.$el.find("#btn-detail-modal"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 내용 엑셀 다운로드                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM190Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM190')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                /**
                 * 엔터 입력 처리를 위한 콜백함수
                 */
                ,fn_enter: function (event) {
	                var that = this;
                    var event = event || window.event;
                    var keyID = (event.which) ? event.which : event.keyCode;
                    if(keyID == 13) { //enter
                    	that.queryBaseArea();
                    }
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM190View;
    } // end of define function
)
; // end of define
