/*
@Screen number  PWF505
@brief          승인실행
@author         shingee.gang
@history        2016.04.05      생성
*/
define(
    [
        'bx/common/config'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
        , 'bx-component/message/message-confirm'
        , 'app/views/page/popup/popup-roleList'
        , 'app/views/page/popup/popup-staffId'
        , 'app/views/page/popup/popup-roleStaff'
        , 'bx-component/date-picker/_date-picker'
        , 'text!app/views/page/PWF/505/_PWF505.html'
        , 'app/views/page/popup/CAPCM/popup-cntct-aprvl-nonactiviti'
    ]
    , function (config
    	, ExtGrid
    	, ExtTreeGrid
        , alertMessage
        , commonInfo
        , confirmMessage
        , PopupRoleList
        , PopupStaffId
        , PopupRoleStaff
        , DatePicker
        , tpl
        , PopupCntctAprvlNonactiviti
        ) {


    	/*
    	 * 저장 버튼 모드 상수
    	 */
    	var SAVE_BUTTON_REGT = "regt"; // 등록 모드
    	var SAVE_BUTTON_UPDT = "updt"; // 수정 모드


    	var comboAprvlRsnCd = {}; // 결재사유코드
    	var comboAprvlStsCd = {}; // 승인상태코드


        var PWF505View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container PWF505-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
				'click .PWF505-detail-accept-button' : 'fn_detailAccept' //승인 버튼 클릭
				, 'click .PWF505-detail-rjct-button' : 'fn_detailRjct' //거절 버튼 클릭
            }
            , initialize: function (initParam) {
                var that = this;


                $.extend(that, initParam);
                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함
                that.$el.attr('data-page', that.pageHandler);


                //기관코드 설정
                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    that.instCd = "";
                }


                this.$el.find('.PWF505-base-area [data-form-param="aprvlId"]').val(initParam.param.aprvlId);
                this.$el.find('.PWF505-base-area [data-form-param="seqNbr"]').val(initParam.param.seqNbr);


                that.createBaseGrid(); // 기본 그리드 생성
                that.createDetailGrid(); // 상세 트리 그리드 생성
            }
            , render: function () {
            	var that = this;


//				that.loadDatePicker(); 
				that.renderCombo(); // 콤보 박스 그리기


                return that.$el;
            }
            // 콤보 박스 그리기
            , renderCombo : function (){
            	var selectStyle;
            	var sParam;


            	/*
            	 * 상세 영역
            	 */
                selectStyle = {"width": '100%'}; //스타일 초기화
                sParam = {}; //데이터 초기화
                //combobox 정보 셋팅
                sParam.className = "PWF505-aprvlStsCd-wrap";
                sParam.targetId = "aprvlStsCd";
                sParam.nullYn = "Y";
                sParam.disabled = true;
                //inData 정보 셋팅
                sParam.cdNbr = "A0452"; //승인상태코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this, selectStyle);
            }


/* ======================================================================== */
/* 그리드생성 */
/* ======================================================================== */
            // 기본그리드생성
            , createBaseGrid : function() {


                // 콤보조회 서비스호출 준비
                var sParam = {};


                // 컴포넌트
                sParam = {};
                sParam.cdNbr = "12303";
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


            	var that = this;
                var sParam = {};


				that.PWF505BaseGrid = new ExtGrid({
					fields: [
					    'chkYn'
					    , 'lblNm'               //결재사유명
					    , 'cntnt'               //내용
					]
					, id: 'PWF505BaseGrid'
					, columns: [
						// 결재사유명
						{text:bxMsg('cbb_items.AT#aprvlRsnNm'), flex : 1 , dataIndex: 'lblNm', style: 'text-align:center', align: 'center'}
						, {text:bxMsg('cbb_items.AT#cntnt'), flex : 1 , dataIndex: 'cntnt', style: 'text-align:center', align: 'center'}
					] // end of columns
				});


				that.$el.find(".PWF505-base-grid").html(that.PWF505BaseGrid.render({'height': "100px"}));
				that.PWF505BaseGrid.resetData();
            }
            // 상세그리드생성
            , createDetailGrid : function() {


                // 콤보조회 서비스호출 준비
                var sParam = {};


                // 컴포넌트
                sParam = {};
                sParam.cdNbr = "A0452";
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


            	var that = this;
                var sParam = {};


                bxProxy.all([
						{
						    url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
						       if (!responseData.header.errorMessageProcessed) {
						    	   comboAprvlStsCd = new Ext.data.Store({
						               fields: ['cd', 'cdNm'],
						               data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
						           });
						       }
						    }
						}
					], {
						success: function () {
							//  그리드 컬럼 정의
							that.PWF505DetailGrid = new ExtTreeGrid({
								fields: [
								    'chkYn'
								    , 'instCd'               //기관코드
								    , 'aprvlTmpltId'         //결재템플릿식별자
								    , 'aprvlTmpltNm'         //결재템플릿명
								    , 'othrDeptAprvlYn'      //타부서승인여부
								    , 'aprvlDeptId'          //승인부서식별자
								    , 'aprvlDeptNm'          //승인부서명
								    , 'aprvlRoleId'          //승인역할식별자
								    , 'aprvlRoleNm'          //승인역할명
								    , 'upAprvlTmpltId'       //상위결재템플릿식별자
								    , 'mostLowrLvlYn'        //최하위레벨여부
								    , 'aprvlTmpltLvl'        //결재템플릿레벨
								    , 'aprvlId'              //승인식별자
								    , 'seqNbr'               //일련번호
								    , 'aprvlStsCd'           //승인상태코드
								    , 'deptId'               //부서식별자
								    , 'aprvlStaffId'         //승인스태프식별자
								    , 'aprvlStaffNm'         //승인스태프명
								    , 'dlgtnDeptId'          //위임부서식별자
								    , 'dlgtnAprvlStaffId'    //위임승인스태프식별자
								    , 'dlgtnAprvlStaffNm'    //위임승인스태프명
								    , 'aprvlCntnt'           //승인내용
								    , 'aprvlDt'              //승인년월일
								]
								, id: 'PWF505DetailGrid'
			            		, expanded: true
								, columns: [
								    //계층단계
									{text:bxMsg('cbb_items.SCRNITM#hrarcyLvl')
										, xtype: 'treecolumn', width : 80, style: 'text-align:center'}
									// 승인스태프식별자
									, {text:bxMsg('cbb_items.AT#aprvlStaffId'), width: '80'
										, dataIndex: 'aprvlStaffId', style: 'text-align:center', align: 'center'}
									// 승인스태프명
									, {text:bxMsg('cbb_items.AT#aprvlStaffNm'), width: '120'
										, dataIndex: 'aprvlStaffNm', style: 'text-align:center', align: 'left'}
									// 위임승인스태프식별자
									, {text:bxMsg('cbb_items.AT#dlgtnAprvlStaffId'), width: '80'
										, dataIndex: 'dlgtnAprvlStaffId', style: 'text-align:center', align: 'center'}
									// 위임승인스태프명
									, {text:bxMsg('cbb_items.AT#dlgtnAprvlStaffNm'), width: '120'
										, dataIndex: 'dlgtnAprvlStaffNm', style: 'text-align:center', align: 'left'}
									// 승인년월일
	                                , {text: bxMsg('cbb_items.AT#aprvlDt'), width: 160
	                                    , dataIndex: 'aprvlDt', style: 'text-align:center', align: 'center'
	                                    , renderer: function (val) {
	                                        return that.setGridDate(val);
	                                    }
	                                }
									// 승인상태명
									, {
										text: bxMsg('cbb_items.SCRNITM#aprvSts'), width: '80'
										, dataIndex: 'aprvlStsCd', style: 'text-align:center', align: 'left'
										, editor: {
											xtype: 'combobox'
											, store: comboAprvlStsCd
											, displayField: 'cdNm'
											, valueField: 'cd'
										}
										, renderer: function (val) {
											index = comboAprvlStsCd.findExact('cd', val);
											if (index != -1) {
												rs = comboAprvlStsCd.getAt(index).data;
												return rs.cdNm;
											}
										} // end of render
									}
								] // end of columns
				            	, listeners: {
				            		click: {
				            			element: 'body'
				            			, fn: function(_this, cell, rowIndex, eOpts) {
				            				that.selectDetailRecord();
				            			}
				            		}
				            	}
				            	, viewConfig: {
				            		toggleOnDblClick: false
				            		, plugins: {
				            			ptype: 'treeviewdragdrop'
				        				, containerScroll: true
				            		}
				            	}
							}); // end of ExtTreeGrid
							// 그리드 렌더
							that.$el.find(".PWF505-detail-grid").html(that.PWF505DetailGrid.render({'height': "100px"}));
//							that.PWF505DetailGrid.resetData();
							that.fn_loadBase();
						}
					} // end of success:.function
                ); // end of bxProxy.all


            }
            // 그리드의 날짜컬럼의 포맷변경 yyyymmdd ==> yyyy-mm-dd
            , setGridDate: function (val) {
                var returnVal = "";


                if (val == null || val.length != 8) {
                    return null;
                }


                returnVal = val.substring(0, 4) + "-" + val.substring(4, 6) + "-" + val.substring(6, 8);


                return returnVal;
            }


            // 그리드의 날짜컬럼의 포맷 변경 yyyy-mm-dd ==> yyyymmdd
            , getGridDate: function (val) {
                var returnVal = "";
                returnVal = val.replace(/-/gi, '');


                return returnVal;
            }


/* ======================================================================== */
/* 조회 */
/* ======================================================================== */
            //결재요청내용
            , fn_loadBase: function () {
                var that = this;


                var aprvlId = that.$el.find('[data-form-param="aprvlId"]').val();
                if (aprvlId == "" || aprvlId == null) {
                	return;
                }


                sParam = {};


                sParam.instCd = that.instCd;
                sParam.aprvlId = aprvlId;


                var linkData = {"header": fn_getHeader("PWF5058401"), "ToDoMgmtSvcGetToDoMgmtListNonActivitiIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        if (fn_commonChekResult(responseData)) {
                            // 정상처리 메시지 출력
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));




                            var outData = responseData.ToDoMgmtSvcGetToDoMgmtListNonActivitiOut;


                			that.$el.find('[data-form-param="aprvlAplctnDt"]').val(outData.aprvlAplctnDt);       //승인신청년월일
                            that.$el.find('[data-form-param="aprvlDemandStaffId"]').val(outData.aprvlDemandStaffId);       //승인요청스태프식별자
                            that.$el.find('[data-form-param="aprvlDemandStaffNm"]').val(outData.aprvlDemandStaffNm);       //승인요청스태프명
                            that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val(outData.aprvlAplctnCntnt);       //승인신청내용


                        	/*
                        	 * 결재사유정보 할당
                        	 */
                            var tbList = outData.aprvlRsnCdList;


                			if (tbList != null && tbList.length > 0) {
                				that.PWF505BaseGrid.setData(tbList);
                			} else {
                				that.PWF505BaseGrid.resetData();
                			}


                			/*
                			 * 결재템플릿 정보 할당
                			 */
                            tbList = outData.aprvlDtlTmpltList;


                			if (tbList != null && tbList.length > 0) {
                				that.PWF505DetailGrid.setStoreRootNode(tbList);


                				//tree grid 렌더링 전
                		    	var timer = setInterval(function () {
                		        	if (that.PWF505DetailGrid.grid.getSelectionModel() != null) {
                		        		clearInterval(timer);
                		        		that.PWF505DetailGrid.expandAll();


                		        		var seqNbr = that.$el.find('.PWF505-base-area [data-form-param="seqNbr"]').val();
                		        		if(seqNbr == null){
                		        			seqNbr = 1;
                		        		}
                		        		that.PWF505DetailGrid.grid.getSelectionModel().select(seqNbr-1);
                		        		that.PWF505DetailGrid.listeners.click.fn();
                		        	}
                		        }, 300);


//                				setTimeout(that.selectTreeGridRow(), 2000);


//                				that.PWF505DetailGrid.grid.fireEvent("click", that.PWF505DetailGrid.grid, 0);
//
//                				that.PWF505DetailGrid.grid.select(0);


//                				that.PWF505DetailGrid.select();


//                				that.PWF505DetailGrid.grid.getSelectionModel().select(0);
//                				that.PWF505DetailGrid.grid.fireEvent("click"
//                						, that.PWF505DetailGrid.grid
//                						, that.PWF505DetailGrid.grid.getSelectionModel().getLastSelected());
                			} else {
                				that.PWF505DetailGrid.resetData();
                			}


                        }
                    } // end of success: function.....
                }); // end of bxProxy.post....
            }
            , selectTreeGridRow(){
            	var that = this;


				//select & click
				for(var i=0; i<2;i++){
					that.PWF505DetailGrid.grid.getSelectionModel().select(0);
    				that.PWF505DetailGrid.grid.fireEvent("click"
    						, that.PWF505DetailGrid.grid.getView()
    						, that.PWF505DetailGrid.grid.getSelectionModel().selected.items[0]);
				}
            }




            , browseBaseArea: function () {
                var that = this;
                var sParam = {};


                if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


                sParam.instCd = that.instCd;
                //부서
                sParam.dlgtnDeptId = that.$el.find('.PWF505-base-table [data-form-param="dlgtnDeptId"]').val();
                sParam.dlgtnDeptNm = that.$el.find('.PWF505-base-table [data-form-param="dlgtnDeptNm"]').val();


                //역할
                sParam.roleId = that.$el.find('.PWF505-base-table [data-form-param="roleId"]').val();
                sParam.roleNm = that.$el.find('.PWF505-base-table [data-form-param="roleNm"]').val();


                //위임스태프
                sParam.dlgtnStaffId = that.$el.find('.PWF505-base-table [data-form-param="dlgtnStaffId"]').val();
                sParam.dlgtnStaffNm = that.$el.find('.PWF505-base-table [data-form-param="dlgtnStaffNm"]').val();


                //위임받는 스태프
                sParam.staffId = that.$el.find('.PWF505-base-table [data-form-param="staffId"]').val();
                sParam.staffNm = that.$el.find('.PWF505-base-table [data-form-param="staffNm"]').val();


                sParam.dlgtnStsCd = that.$el.find('.PWF505-base-table [data-form-param="dlgtnStsCd"]').val();


                var linkData = {"header": fn_getHeader("PWF5058401"), "DlgtnRoleMgmtSvcStaffDlgtnRoleIO": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                	enableLoading: true,
                	success: function (responseData) {
                		if (fn_commonChekResult(responseData)) {
                			var tbList = responseData.DlgtnRoleMgmtSvcStaffDlgtnRoleListIO.list;


                			that.resetDetailArea();
                			if (tbList != null && tbList.length > 0) {
                				that.PWF505BaseGrid.setData(tbList);
                			} else {
                				that.PWF505BaseGrid.resetData();
                			}
                		}
                	}   // end of suucess: fucntion
                });
            }
            // 상세 조회
            , browseDetailArea: function (data) {
            	var that = this;
            	var sParam = {};


            	if(data.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


            	that.resetDetailArea();
            	that.setDetailArea(data);
            }
            , setDetailArea(rec){
            	var that = this;


            	that.$el.find('.PWF505-detail-table [data-form-param="roleNm"]').val(rec.roleNm);
				that.$el.find('.PWF505-detail-table [data-form-param="roleId"]').val(rec.roleId);
				that.$el.find('.PWF505-detail-table [data-form-param="dlgtnDeptNm"]').val(rec.dlgtnDeptNm);
				that.$el.find('.PWF505-detail-table [data-form-param="dlgtnDeptId"]').val(rec.dlgtnDeptId);
				that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStaffNm"]').val(rec.dlgtnStaffNm);
				that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStaffId"]').val(rec.dlgtnStaffId);


				that.$el.find('.PWF505-detail-table [data-form-param="deptNm"]').val(rec.deptNm);
				that.$el.find('.PWF505-detail-table [data-form-param="deptId"]').val(rec.deptId);
				that.$el.find('.PWF505-detail-table [data-form-param="staffNm"]').val(rec.staffNm);
				that.$el.find('.PWF505-detail-table [data-form-param="staffId"]').val(rec.staffId);


				var efctvStartDt = (rec.efctvStartDt) ? XDate(rec.efctvStartDt).toString('yyyy-MM-dd') : '';
				var efctvEndDt = (rec.efctvEndDt) ? XDate(rec.efctvEndDt).toString('yyyy-MM-dd') : '';


				that.subViews['efctvStartDt'].setValue(rec.efctvStartDt);
				that.subViews['efctvEndDt'].setValue(rec.efctvEndDt);


				that.$el.find('.PWF505-detail-table [data-form-param="chngRsnCntnt"]').val(rec.chngRsnCntnt);


				that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStsCd"]').val(rec.dlgtnStsCd);
            }
		 /* ======================================================================== */
		 /* 승인 */
		 /* ======================================================================== */
         , fn_detailAccept : function() {
        	 var that = this;
        	 that.fn_detailSave("01");
         }
         /* ======================================================================== */
         /* 거절 */
         /* ======================================================================== */
         , fn_detailRjct : function() {
        	 var that = this;
        	 that.fn_detailSave("02");
         }
         /* ======================================================================== */
         /* 저장 */
         /* ======================================================================== */
         , fn_detailSave : function(aprvlStsCd) {
        	 var that = this;
        	 var param = {};


        	 param.instCd = that.instCd;
        	 param.aprvlId = that.$el.find('.PWF505-base-area [data-form-param="aprvlId"]').val();


        	 param.seqNbr = that.$el.find('.PWF505-detail-area [data-form-param="seqNbr"]').val();
        	 param.aprvlTmpltId = that.$el.find('.PWF505-detail-area [data-form-param="aprvlTmpltId"]').val();
//        	 param.aprvlStsCd = that.$el.find('.PWF505-detail-area [data-form-param="aprvlStsCd"]').val();
        	 param.aprvlStsCd = aprvlStsCd;
        	 param.aprvlCntnt = that.$el.find('.PWF505-detail-area [data-form-param="aprvlCntnt"]').val();


        	 var linkData = {"header": fn_getHeader("PWF5058501"), "ToDoMgmtSvcExecuteToDoNonActivitiIn": param};


             // ajax호출
             bxProxy.post(sUrl, JSON.stringify(linkData), {
                 enableLoading: true,
                 success: function (responseData) {
                     if (fn_commonChekResult(responseData)) {
                         alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
//                         that.browseBaseArea(); //조회


                         var resData = responseData.ToDoMgmtSvcExecuteToDoNonActivitiOut;
                         var nxtAprvlExstncYn = resData.nxtAprvlExstncYn;


                         if(nxtAprvlExstncYn == 'Y'){ //다음 단계 승인 필요
                             var aprvlId = resData.aprvlId;
                             var seqNbr = resData.seqNbr;
                             that.popupCntctAprvlNonactiviti(aprvlId, seqNbr);
                         }else{
                        	 that.fn_loadBase();
                         }
                     }
                 }   // end of suucess: fucntion
             });     // end of bxProxy


         }
/* ======================================================================== */
/* 그리드 더블클릭 */
/* ======================================================================== */
            , selectBaseRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF505BaseGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	// 하위 조회 태워야 한다.
                	that.browseDetailArea(selectedRecord.data);
                }
            }


            , selectDetailRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF505DetailGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
//                	that.$el.find('.PWF505-detail-area [data-form-param="instCd"]').val(selectedRecord.data.instCd);
                	that.$el.find('.PWF505-detail-area [data-form-param="aprvlDeptNm"]').val(selectedRecord.data.aprvlDeptNm);
                	that.$el.find('.PWF505-detail-area [data-form-param="aprvlDeptId"]').val(selectedRecord.data.aprvlDeptId);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlRoleNm"]').val(selectedRecord.data.aprvlRoleNm);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlRoleId"]').val(selectedRecord.data.aprvlRoleId);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlDt"]').val(selectedRecord.data.aprvlDt);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="dlgtnAprvlStaffNm"]').val(selectedRecord.data.dlgtnAprvlStaffNm);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="dlgtnAprvlStaffId"]').val(selectedRecord.data.dlgtnAprvlStaffId);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlStaffNm"]').val(selectedRecord.data.aprvlStaffNm);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlStaffId"]').val(selectedRecord.data.aprvlStaffId);


             	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlStsCd"]').val(selectedRecord.data.aprvlStsCd);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlCntnt"]').val(selectedRecord.data.aprvlCntnt);


              	  	that.$el.find('.PWF505-detail-area [data-form-param="seqNbr"]').val(selectedRecord.data.seqNbr);
              	  	that.$el.find('.PWF505-detail-area [data-form-param="aprvlTmpltId"]').val(selectedRecord.data.aprvlTmpltId);


                }
            }


/* ======================================================================== */
/* Popup 창 */
/* ======================================================================== */
            //접촉승인(승인요청) 팝업
            , popupCntctAprvlNonactiviti: function (_aprvlId, _seqNbr) {
            	var that = this;


            	var param = {};
    			param.data = _aprvlId;
    			param.seqNbr = _seqNbr;


    			/*
    			 * todo 목록조회에서 더블클릭 시 해당 업무화면으로 이동하여 초기화할 값 승인요청(접촉승인) UI에 전달 값
    			 *
    			 * 이동화면(ex SXX008)에서 initialize: function (initData)에서 받을 값
    			 */
//    			param.initzData = {};
//    			param.initzData.acctNbr = that.$el.find('[data-form-param="acctNbr"]:eq(0)').val();
//    			param.initzData.pswd = that.$el.find('[data-form-param="pswd"]').val();
//    			param.initzData.crncyCd = that.$el.find('[data-form-param="crncyCd"]').val();
//    			param.initzData.txAmt = that.$el.find('[data-form-param="txAmt"]:eq(0)').val();


    			var popupCntctAprvlNonactiviti = new PopupCntctAprvlNonactiviti(param); // 팝업생성
    			popupCntctAprvlNonactiviti.render();


    			popupCntctAprvlNonactiviti.on('popUpSetData', function(param) { //callback function
//    				globalAprvlId = param.aprvlId; 
//
//    				console.log("globalAprvlId="+globalAprvlId);


    				that.fn_loadBase();
                });
            }


/* ======================================================================== */
/* 초기화 */
/* ======================================================================== */


            , refresh : function() {
            	  var that = this;


            	  that.fn_loadBase();


//            	  that.resetBaseArea();
//            	  that.PWF505BaseGrid.resetData();
//            	  that.PWF505DetailGrid.reloadData();
//            	  that.resetDetailArea();
              }


              // 기본부초기화
              , resetBaseArea: function () {
                  var that = this;


//                  that.$el.find('.PWF505-base-table [data-form-param="aprvlTmpltId"]').val("");
//                  that.$el.find('.PWF505-base-table [data-form-param="aprvlTmpltNm"]').val("");
//                  that.$el.find('.PWF505-base-table [data-form-param="aprvlDeptId"]').val("");
//                  that.$el.find('.PWF505-base-table [data-form-param="deptNm"]').val("");
//                  that.$el.find('.PWF505-base-table [data-form-param="aprvlRoleId"]').val("");
//                  that.$el.find('.PWF505-base-table [data-form-param="roleNm"]').val("");
              }


              // 상세부초기화
              , resetDetailArea: function () {
            	  var that = this;


            	  that.$el.find('.PWF505-detail-table [data-form-param="roleNm"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="roleId"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="dlgtnDeptNm"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="dlgtnDeptId"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStaffNm"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStaffId"]').val("");


            	  that.$el.find('.PWF505-detail-table [data-form-param="deptNm"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="deptId"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="staffNm"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="staffId"]').val("");


            	  that.$el.find('.PWF505-detail-table [data-form-param="efctvStartDt"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="efctvEndDt"]').val("");
            	  that.$el.find('.PWF505-detail-table [data-form-param="chngRsnCntnt"]').val("");


            	  that.$el.find('.PWF505-detail-table [data-form-param="dlgtnStsCd"]').val("");


              }


        }); // end of Backbone.View.extend({


        return PWF505View;
    } // end of define function
); // end of define
