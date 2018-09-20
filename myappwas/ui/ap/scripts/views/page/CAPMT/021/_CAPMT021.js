define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/021/_CAPMT021.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPMT/popup-searchBatchJob'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupBtchJb
        ) {


        /**
		 * Backbone
		 */
        var CAPMT021View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT021-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-base-section-save'		: 'saveData'
                , 'click #btn-base-section-delete'		: 'deleteData'
                , 'click #btn-popup-batchJobId': 'popupBatchJbIdSearchSrvc'
                , 'click #btn-grid-section-add': 'addRowRefAtrbt'
                , 'click #btn-grid-section-del': 'delRowRefAtrbt'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;

                $.extend(that, initData);

                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());

                that.textfield= Ext.create('Ext.grid.CellEditor', {
                	field: Ext.create('Ext.form.field.Text')
                });

                var sParam1 = {cdNbr:"A0217"}; // 배치컴포넌트코드
                var sParam2 = {cdNbr:"30008"}; // 배치작업유형코드

                bxProxy.all(
                	[{
                        // 시스템인터페이스 상태코드 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore711 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	},{// 컴포넌트코드콤보 로딩
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore712 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
		            }]
                    ,{
                        success: function () {
                        } // end of success:.function
                    }
                ); // end of bxProxy.all
                
            	that.CAPMT021Grid = new ExtGrid({
            		// 그리드 컬럼 정의
            		fields: ['seqNbr', 'parmAtrbtNm', 'parmExplntnCntnt' ]

                	, id: 'CAPMT021Grid'
                	, columns: [
                	    { text: bxMsg('cbb_items.AT#seqNbr')
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
                        , editor: 'textfield'
                    }
            		, { //속성설명
                        text: bxMsg('cbb_items.AT#atrbtDescCntnt')
                        , flex: 7
                        , dataIndex: 'parmExplntnCntnt'
                        , style: 'text-align:center'
                        , align: 'left'
                        ,editor: 'textfield'
                    }
            		] // end of columns
            	
                	/*
                    , listeners: {
                        dblclick: {
                            element: 'body'
                            , fn: function () {
                                // 더블클릭시 이벤트 발생
                                that.doubleiClickGrid();
                            }
                        }
                    } */

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

                // 콤보데이터 로딩

                // 배치컴포넌트 코드
                fn_getCodeList({className:"CAPMT021-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);

                // 배치작업유형 코드
                fn_getCodeList({className:"CAPMT021-batchJobTpCd-wrap",targetId:"batchJobTpCd",nullYn:"Y",cdNbr:"30008",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);

                //로직을  수정할 것 if - then else 구조가 이상함
                if(that.param){ //메뉴에서 직접 선택하면 param이 없음
                	if(that.param.batchJobId){
                		that.inquiryBaseData(that.param);
                		that.isModify=true;  //batchJobId 값을 받아 조회하므로 수정된 것임
                	}
                	else{
                		this.setBaseData(this, "", "X");
                		that.isModify=false;
                	}
                }
                else{
            		this.setBaseData(this, "", "X");
            		that.isModify=false;
                }

                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                	that.$el.find('.CAPMT021-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobEngNm"]').val("");
                    that.$el.find('.CAPMT021-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobTpCd"]').val("");
                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobDescCntnt"]').val("");
                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.isModify=false;  //초기화버튼을 누른 경우

            	that.$el.find('.CAPMT021-base-section [data-form-param="batchJobId"]').val("");
                that.$el.find('.CAPMT021-base-section [data-form-param="batchJobNm"]').val("");
                that.$el.find('.CAPMT021-base-section [data-form-param="batchJobEngNm"]').val("");
                that.$el.find('.CAPMT021-base-section [data-form-param="batchAplctnNm"]').val("");
                that.$el.find('.CAPMT021-base-section [data-form-param="batchJobTpCd"]').val("");
                that.$el.find('.CAPMT021-base-section [data-form-param="batchJobDescCntnt"]').val("");

                that.CAPMT021Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT021-base-section'));

                that.inquiryBaseData(sParam);

                if(that.param){ //메뉴에서 직접 선택하면 param이 없음
                	if(that.param.batchJobId){
                		that.isModify=true;  //batchJobId 값을 받아 조회하므로 수정된 것임
                	}
                }
            }


            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT021-base-section'));

                that.inquiryBaseData(sParam);
            }


            /**
			 * 저장 버튼
			 */
            , saveData: function (param) {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT021-base-section'));
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
                sParam.batchAtrbt = that.CAPMT021Grid.getAllData();
                /*
                if(!sParam.batchAtrbt || sParam.batchAtrbt.length == 0){
                	return;
                }*/

                var linkData = {"header": fn_getHeader("PMT0218101"), "BatchJobMgntSvcIn": sParam};

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

                sParam.batchAtrbt = that.CAPMT021Grid.getAllData();
                var linkData = {"header": fn_getHeader("PMT0218201"), "BatchJobMgntSvcIn": sParam};


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
                var sParam = {"batchJobId": that.$el.find('.CAPMT021-base-section [data-form-param="batchJobId"]').val()};
                //batchJobId 의 값이 존재하는지 여부 체크 방법
                // TODO 수정할 것   값이 없으면 return 할 것

                var linkData = {"header": fn_getHeader("PMT0218301"), "BatchJobMgntSvcIn": sParam};

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
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                var linkData = {"header": fn_getHeader("PMT0218401"), "BatchJobMgntSvcIn": sParam};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            //var tbList = responseData.BatchJobMgntSvcOut.getBatchAtrbt;
                        	var tbList = responseData.BatchJobMgntSvcOut.batchAtrbt;
                            if (tbList != null || tbList.length > 0) {


                                    // 조회
                                    that.CAPMT021Grid.setData(tbList);
                                    // double click으로 들어온 경우 처리
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobId"]').val(responseData.BatchJobMgntSvcOut.batchJobId);
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobNm"]').val(responseData.BatchJobMgntSvcOut.batchJobNm);
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobEngNm"]').val(responseData.BatchJobMgntSvcOut.batchJobEngNm);
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchAplctnNm"]').val(responseData.BatchJobMgntSvcOut.batchAplctnNm);
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobTpCd"]').val(responseData.BatchJobMgntSvcOut.batchJobTpCd);
                                    that.$el.find('.CAPMT021-base-section [data-form-param="batchJobDescCntnt"]').val(responseData.BatchJobMgntSvcOut.batchJobDescCntnt);
                                    that.$('#rsltCnt').html(tbList.length);
                            }else{
                            	that.CAPMT021Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                                that.$('#rsltCnt').html('0');
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end

            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT021-grid-section").html(this.CAPMT021Grid.render({'height': '450px'}));
            } // end of createGrid

            /**
             * 그리드 행 추가
             */
            , addRowRefAtrbt: function () {
                var that = this;


                that.CAPMT021Grid.addData({});
            }

            /**
             * 그리드 행 삭제
             * 그리드의 행을 선택해야 삭제됨
             */
            , delRowRefAtrbt: function () {
                var that = this;

                var gridAllData = that.CAPMT021Grid.getAllData();
                var selectedRows = that.CAPMT021Grid.getSelectedItemRow();


                if (gridAllData.length === 0 || selectedRows.length === 0) {
                    return;
                }

                that.CAPMT021Grid.store.remove(selectedRows[0]);
            }




           /**
            *  배치작업식별자 팝업
            */
           , popupBatchJbIdSearchSrvc: function () {
               var that = this;
               var popupBtchJb = new PopupBtchJb(); // 팝업생성

               popupBtchJb.render();
               popupBtchJb.on('popUpSetData', function (param) {
                   that.$el.find('.CAPMT021-base-section [data-form-param="batchJobId"]').val(param.batchJobId); //배치작업 식별자
                 //  that.$el.find('[data-form-param="batchJobNm"]').val(param.batchJobNm); 
                  // 2016.2.29 임시로 막음.  현재 배치작업 등록시 다국어가 등록되지 않고 있음
                   that.$el.find('.CAPMT021-base-section [data-form-param="batchAplctnNm"]').val(param.batchAplctnNm); //배치작업명
               });
           }
           
        }); // end of Backbone.View.extend({
        
        return CAPMT021View;
    } // end of define function
); // end of define
