define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/024/_CAPMT024.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPAT/popup-staffId'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupStaffId
        ) {


        /**
		 * Backbone
		 */
        var CAPMT024View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT024-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                'click #btn-base-section-reset'		: 'resetBase'
              , 'click #btn-base-section-inquiry'		: 'query'
              , 'click #btn-base-section-save'		: 'saveData'
              , 'click #btn-base-section-del'		: 'deleteData'
              , 'click #btn-base-section-exctn'			: 'runInstance'
              , 'click #btn-popup-frstOprtnStaffId' : 'popupSearchStaff1'
              , 'click #btn-popup-scndryOprtnStaffId' : 'popupSearchStaff2'
              , 'click #btn-base-section-toggle': 'fn_base_toggle'
              , 'click #btn-grid-section-toggle': 'fn_grid_toggle'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                //that.isModify=false;


                $.extend(that, initData);


                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());
                that.textfield= Ext.create('Ext.grid.CellEditor', {
                	field: Ext.create('Ext.form.field.Text')
                });




                var sParam1 = {cdNbr:"30009"}; // 배치작업주기코드
                var sParam3 = {cdNbr:"10000"}; // 재실행가능여부
                var sParam4 = {cdNbr:"A0124"}; // 로그레벨
                var sParam5 = {cdNbr:"A0217"}; // 배치컴포넌트코드
                var sParam6 = {cdNbr:"A0207"}; // 논리실행시스템  


                bxProxy.all([{
                        // 배치작업주기코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore741 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
                  , {
	                    // 재실행가능여부
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam3}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore743 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
	            	}
  	              , {
	                    // 배치컴포넌트 코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam5}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore745 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
	            	}
  	            , {
                    // 논리실행시스템
                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam6}), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore746 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                            });
                        }
                    }
            	}
	                , {
	                    // 로그레벨
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam4}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore744 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
	            	}
                ]
                    , {
                        success: function () {
                        	
                        } // end of success:.function
                    }); // end of bxProxy.all
                
                that.CAPMT024Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['seqNbr', 'parmAtrbtNm', 'parmExplntnCntnt', 'parmVal']


                    , id: 'CAPMT024Grid'
                    , columns: [{
                        text: bxMsg('cbb_items.AT#seqNbr')
                        , dataIndex: 'seqNbr'
                        , flex: 2
                        , height: 25
                        , style: 'text-align:center'
                        , align: 'center'
                        }
                		, { //속성명
                            text: bxMsg('cbb_items.AT#atrbtNm')
                            , flex: 3
                            , dataIndex: 'parmAtrbtNm'
                            , style: 'text-align:center'
                            , align: 'left'
                           // , editor: 'textfield'
                        }
                		, { //속성설명
                            text: bxMsg('cbb_items.AT#atrbtDescCntnt')
                            , flex: 7
                            , dataIndex: 'parmExplntnCntnt'
                            , style: 'text-align:center'
                            , align: 'left'
                           // ,editor: 'textfield'


                        }
                		, { //속성값
                            text: bxMsg('cbb_items.AT#atrbtVal')
                            , flex: 3
                            , dataIndex: 'parmVal'
                            , style: 'text-align:center'
                            , align: 'left'
                            ,editor: 'textfield'


                        }


                    ] // end of columns




                // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                , gridConfig: {
	                    // 셀 에디팅 플러그인
	                    plugins: [
	                        Ext.create('Ext.grid.plugin.CellEditing', {
	                            // 2번 클릭시, 에디팅할 수 있도록 처리
	                            clicksToEdit: 1
	                        }) // end of Ext.create
	                    ] // end of plugins
	                } // end of gridConfig
	             });


                // 단일탭 그리드 렌더
                that.createGrid();
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;
                that.isInitDirty = false;


                // 데이터 피커 로드
                this.loadDatePicker();


                // 배치컴포넌트코드    콤보박스를 disable시키기
                fn_getCodeList({className:"CAPMT024-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217", disabled:"true"}, this);


                // 배치작업주기코드
                fn_getCodeList({className:"CAPMT024-batchJobCyclCd-wrap",targetId:"batchJobCyclCd",nullYn:"Y",cdNbr:"30009"}, this);


                //논리실행시스템
                fn_getCodeList({className:"CAPMT024-lgclExctnSysId-wrap",targetId:"lgclExctnSysId",nullYn:"Y",cdNbr:"A0207"}, this);


                //재실행가능여부
                fn_getCodeList({className:"CAPMT024-reExctnAblYn-wrap",targetId:"reExctnAblYn",nullYn:"Y",cdNbr:"10000"}, this);


                //로그레벨
                fn_getCodeList({className:"CAPMT024-logLvl-wrap",targetId:"logLvlCd",nullYn:"Y",cdNbr:"A0124"}, this);




                if(that.param){
                	if(that.param.origin=="CAPMT023"){
                		that.$el.find('#btn-base-section-exctn').prop("disabled", true).addClass("on");
                	}
                	else{ //배치작업 실행에서 넘어온 경우
                		that.$el.find('#btn-base-section-reset').prop("disabled", true);
                		that.$el.find('#btn-base-section-save').prop("disabled", true);
                		that.$el.find('#btn-base-section-del').prop("disabled", true);
                		/* 2015.12.4  실행으로 고정함
                		if(that.param.jobStatus != "08") {// 미실행이 아니므로 -> 버튼의 label을 재실행으로
                			//재실행으로 설정,  현재 속성이 정의되어 있지 않음
                			that.$el.find('.CAPMT024-grid-exctn-btn').prop("innerHTML",bxMsg('cbb_items.CDVAL#A022203') );
                		}
                		else { //실행으로 설정
                			that.$el.find('.CAPMT024-grid-exctn-btn').prop("innerHTML", bxMsg('cbb_items.ABRVTN#exctn'));
                		}
                			*/


                	}


                	var sParam={};
            		sParam.instCd=that.param.instCd;
            		sParam.batchJobId=that.param.batchJobId;
            		if(that.param.batchJobNm){sParam.batchJobNm=that.param.batchJobNm;}


                	if(that.param.batchJobInstncId){  // 023에서 더블클릭한 경우
                		sParam.batchJobInstncId=that.param.batchJobInstncId;


                		that.inquiryBaseData(sParam);
                		that.isModify=true;  //batchJobId 값을 받아 조회하므로 수정된 것임
                		this.setBaseData(this, "", "X");


                		//배치작업 식별자, 배치작업명, 배치작업인스턴스식별자 3개의 값으로 조회를 수행함
                		that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val(sParam.batchJobId);
                        that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').val(sParam.batchJobNm);
                        that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val(sParam.batchJobInstncId);
                        that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').prop("disabled", true);




                	}
                	else{  //023에서 추가버튼을 누른 경우  isModify=false이어야 함
                		   //배치작업관련 기본정보가 전달되어야 함 ,
                		that.inquiryNewData(sParam);  // 배치작업 식별자, 기관코드로 조회하기
                		   //배치작업식별자, 배치작업명, 적용시작일, 1차운영자, 2차 운영자
                		that.isModify=false;


                		this.setBaseData(this, "", "X");
                		if(that.param.batchJobId) {
                            that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val(sParam.batchJobId); //배치작업 식별자
                            that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').val(sParam.batchJobNm); //배치작업명


                            //배치작업인스턴스 식별자는 새로 입력해야 함
                			that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').prop("disabled", false);
                			that.$el.find('.CAPMT024-base-section [data-form-param="batchAplctnNm"]').val(sParam.batchAplctnNm); //배치컴포넌트코드
                			that.$el.find('.CAPMT024-base-section [data-form-param="aplyStartDt"]').val(sParam.aplyStartDt); //적용시작일
                			that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').val(sParam.frstOprtnStaffId); //1차운영자
                			that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').val(sParam.scndryOprtnStaffId);   //2차 운영자
                		}
                	}
                }
                else{  //메뉴에서 직접 선택한 경우,  <- 2015.11.27 메뉴에서 삭제하기로 함
            		this.setBaseData(this, "", "");
            		that.isModify=false;
                }


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                //disable 시키는 영역 설정
                if(type =="X"){
	                that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').prop("disabled", true); //배치작업식별자
	                that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').prop("disabled", true); //배치작업명
	                that.$el.find('.CAPMT024-base-section [data-form-param="batchAplctnNm"]').prop("disabled", true); //배치작업 컴포넌트
	                that.$el.find('.CAPMT024-base-section [data-form-param="aplyStartDt"]').prop("disabled", true); //적용시작일
	                that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').prop("disabled", true); //1차운영자
	                that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').prop("disabled", true); //2차 운영자
            	}






                //if (type == "X") { 
                    //that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val("");
                    //that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').val("");
                    //that.$el.find('.CAPMT024-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchJobCyclCd"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="lgclExctnSysId"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="reExctnAblYn"]').val("");
                    that.$el.find('.CAPMT024-base-section [data-form-param="logLvlCd"]').val("");


                    if(!that.isModify)
                    {
                        that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val("");
                        that.$el.find('.CAPMT024-base-section [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                        that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val("");
                    }
                //}
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {  //초기화 버튼을 누른 경우
            	that = this;
            	//새로 등록
            	that.isModify=false;


            	that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').prop("disabled", false);
            	that.setBaseData(this, "", "X");


                that.CAPMT024Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT024-base-section'));
                //that.pgNbr=1;
                that.inquiryBaseData(sParam);
            }




            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                sParam.instCd = commonInfo.getInstInfo().instCd;


                //날짜 형태가 yyyy-mm-dd 형태로 존재하면 yyyymmdd로 변경
                if(sParam.aplyStartDt){
                	sParam.aplyStartDt = sParam.aplyStartDt.replace(/-/gi,"");
                }


                var linkData = {"header": fn_getHeader("PMT0248401"), "InstBatchJobInstncSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                        	that.setBaseDataFromDB(responseData.InstBatchJobInstncSvcIO);
                        	var tbList = responseData.InstBatchJobInstncSvcIO.batchAtrbt;


                            if (tbList != null || tbList.length > 0) {
                               // if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT024Grid.setData(tbList);
                                //} else {
                                    // 다음 조회
                                 //   that.CAPMT024Grid.addData(tbList);
                                  //  that.CAPMT024Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                               // }
                            }else{
                            	that.CAPMT024Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            , inquiryNewData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                //배치작업식별자와 기관코드는 param으로 전달됨


                var linkData = {"header": fn_getHeader("PMT0228402"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            //첫번째 행에 대해서만 처리
                            var tbList = responseData.InstBatchJobMgntSvcListOut.outList;
                            if (tbList != null && tbList.length > 0) {
                                 //that.PMT022Grid.setData(tbList);
                                inputParm=tbList[0];


                                that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').val(inputParm.batchJobNm);
                                that.$el.find('.CAPMT024-base-section [data-form-param="batchAplctnNm"]').val(inputParm.batchAplctnNm);
                                that.$el.find('.CAPMT024-base-section [data-form-param="aplyStartDt"]').val(inputParm.aplyStartDt);
                                that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').val(inputParm.frstOprtnStaffId);
                                that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').val(inputParm.scndryOprtnStaffId);


                                //그리드 데이터 채우기
                                that.inquiryNewGridData(sParam);
                            }else{
                                //CAPMT023 에서 추가버튼을 눌러 진입한 경우
                                if(that.param.origin=="CAPMT023"&&!that.isModify&&!that.isInitDirty)
                                {
                                    fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0051"));
                                }
                            }
                        }
                        if(!that.isInitDirty){that.isInitDirty=true;}
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            , inquiryNewGridData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};
                sParam.batchJobId=param.batchJobId;


                var linkData = {"header": fn_getHeader("PMT0218401"), "BatchJobMgntSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	var tbList = responseData.BatchJobMgntSvcOut.batchAtrbt;
                            if (tbList != null || tbList.length > 0) {
                                    // 조회
                                    that.CAPMT024Grid.setData(tbList);
                            }else{
                            	that.CAPMT024Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            , runInstance: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd=commonInfo.getInstInfo().instCd;
                sParam.batchJobId=that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val();
                sParam.batchJobInstncId=that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val();


                var linkData = {"header": fn_getHeader("PMT0158101"), "BatchJobExctnMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                            //that.query();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end




            /**
			 * 기본부 초기화
			 */
            , setBaseDataFromDB: function (inputParm) {
                var that = this;
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val(inputParm.batchJobId);
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchJobNm"]').val(inputParm.batchJobNm);
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchAplctnNm"]').val(inputParm.batchAplctnNm);
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val(inputParm.batchJobInstncId);
                    that.$el.find('.CAPMT024-base-section [data-form-param="aplyStartDt"]').val(inputParm.aplyStartDt);
                    that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').val(inputParm.frstOprtnStaffId);
                    that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').val(inputParm.scndryOprtnStaffId);
                    that.$el.find('.CAPMT024-base-section [data-form-param="batchJobCyclCd"]').val(inputParm.batchJobCyclCd);
                    that.$el.find('.CAPMT024-base-section [data-form-param="lgclExctnSysId"]').val(inputParm.lgclExctnSysId);
                    that.$el.find('.CAPMT024-base-section [data-form-param="reExctnAblYn"]').val(inputParm.reExctnAblYn);
                    that.$el.find('.CAPMT024-base-section [data-form-param="logLvlCd"]').val(inputParm.logLvlCd);


            }
            /**
			 * 저장 버튼
			 */
            , saveData: function (param) {
                var that = this;


                var sParam = bxUtil.makeParamFromForm($('.CAPMT024-base-section'));
                sParam.instCd=commonInfo.getInstInfo().instCd;


                if(sParam.aplyStartDt)
                {
                    sParam.aplyStartDt = fn_getDateValue(sParam.aplyStartDt);
                }


                if(that.isModify){
                	that.modifyBase(sParam);
                }else{
                	that.addBase(sParam);
                }
            } // end


            /**
			 *  기본부 정보 추가
			 */
            , addBase: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                sParam.batchAtrbt = that.CAPMT024Grid.getAllData();
                /*
                if(!sParam.batchAtrbt || sParam.batchAtrbt.length == 0){
                	return;
                }*/


                //날짜 형태가 yyyy-mm-dd 형태로 존재하면 yyyymmdd로 변경
                if(sParam.aplyStartDt){
                	sParam.aplyStartDt = sParam.aplyStartDt.replace(/-/gi,"");
                }




                var linkData = {"header": fn_getHeader("PMT0248101"), "InstBatchJobInstncSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	//that.queryBase();
                        	that.query();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 기본부 정보 변경
			 */
            , modifyBase: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                sParam.batchAtrbt = that.CAPMT024Grid.getAllData();
              //날짜 형태가 yyyy-mm-dd 형태로 존재하면 yyyymmdd로 변경
                if(sParam.aplyStartDt){
                	sParam.aplyStartDt = sParam.aplyStartDt.replace(/-/gi,"");
                }


                var linkData = {"header": fn_getHeader("PMT0248201"), "InstBatchJobInstncSvcIO": sParam};




                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	//that.queryBase();
                        	that.query();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 기본부 정보 삭제
			 */
            , deleteData: function () {
                // header 정보 set
                var that = this;
                if(!that.isModify) return;


                //삭제하기 위한 batchJobId 호출
                var sParam = {"batchJobId": that.$el.find('.CAPMT024-base-section [data-form-param="batchJobId"]').val()};
                sParam.instCd=commonInfo.getInstInfo().instCd;
                //배치작업 식별자
                sParam.batchJobInstncId= that.$el.find('.CAPMT024-base-section [data-form-param="batchJobInstncId"]').val();




                //batchJobId 의 값이 존재하는지 여부 체크 방법
                // TODO 수정할 것   값이 없으면 return 할 것




                var linkData = {"header": fn_getHeader("PMT0248301"), "InstBatchJobInstncSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	that.resetBase();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
                fn_makeDatePicker(this.$('.CAPMT024-base-section [data-form-param="aplyStartDt"]'));
            }


            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT024-grid-section").html(this.CAPMT024Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */
            , doubleiClickGrid: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT024-base-section'));
                var selectedRecord = that.CAPMT024Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    var sParam = {};
                    sParam.sysIntrfcId = selectedRecord.data.sysIntrfcId;
                    that.inquiryDetail(sParam);
                }


            }


            , popupSearchStaff1 : function() {
    			var that = this;
    			var param = {};
    			param.instCd = that.instCd;
    			param.type = "03";
    			//param.data = that.$el.find(".staffNm-wrap").html();
    			var popupStaffIdObj = new PopupStaffId(param);
    			popupStaffIdObj.render();
    			popupStaffIdObj.on('popUpSetData', function(param) {
    				that.$el.find('.CAPMT024-base-section [data-form-param="frstOprtnStaffId"]').val(param.staffId);
    			});
    		}
            , popupSearchStaff2 : function() {
    			var that = this;
    			var param = {};
    			param.instCd = that.instCd;
    			param.type = "03";


    			var popupStaffIdObj = new PopupStaffId(param);
    			popupStaffIdObj.render();
    			popupStaffIdObj.on('popUpSetData', function(param) {
    				that.$el.find('.CAPMT024-base-section [data-form-param="scndryOprtnStaffId"]').val(param.staffId);
    			});
    		}


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT024-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT024-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT024View;
    } // end of define function
); // end of define
