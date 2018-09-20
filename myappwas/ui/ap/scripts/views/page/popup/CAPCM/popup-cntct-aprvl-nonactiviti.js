define(
    [
        'bx-component/popup/popup'
        , 'bx-component/message/message-alert'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'text!app/views/page/popup/CAPCM/popup-cntct-aprvl-nonactiviti-tpl.html'
        , 'bx/common/common-message'
        , 'bx/common/common-info'
    ],
    function (Popup
        , alertMessage
        , ExtGrid
        , ExtTreeGrid
        , tpl
        , PopupMessage
        , commonInfo
        ) {


        var APRVL_STS_CD_DEMAND = "00"; //승인상태코드-요청


    	var comboAprvlRsnCd = {}; // 결재사유코드
    	var comboAprvlStsCd = {}; // 승인상태코드


    	var selectedTmpltAprvlDtlRecord; //선택된 템플릿정보/승인상세정보
    	var selectedStaffRecord; //선택된 승인자
    	var aprvlTrgtBizIdCntnt; //승인대상업무식별키내용(부모창 업무 화면 로딩 시 사용할 값)


    	var isAprvlDemand = false; //승인요청여부


        var BxpAprvlPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section',


            //클래스 이름 설정
            className: 'popup-page',


            //템플릿설정
            templates: {
                'tpl': tpl
            }


            , attributes: {
                'style': 'width: 625px; height: 650px;'
            }


            , events: {
               	'click .close-btn': 'fn_close'
                , 'click .aprvl-btn': 'fn_cnctAprvl'
            }


            , initialize: function (initConfig) {
                var that = this;


                // Set Page
                this.$el.html(this.tpl());


                // Set Page modal 설정
                that.enableDim = true;
                that.oAprvlTrgtBizIdCntnt = "";


                //기관코드 설정
                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    that.instCd = "";
                }


                /*
                 * 전역변수 초기화
                 */
                selectedTmpltAprvlDtlRecord = null; //선택된 템플릿정보/승인상세정보 초기화
                selectedStaffRecord = null; //선택된 승인자 초기화
                aprvlTrgtBizIdCntnt = null; //선택된 스태프 초기화
                isAprvlDemand = false; //승인요청여부


                this.$el.find('[data-form-param="aprvlId"]').val(initConfig.data); //승인식별자
                that.$el.find('[data-form-param="seqNbr"]').val(initConfig.seqNbr); //일련번호


                aprvlTrgtBizIdCntnt = initConfig.initzData; //부모창 업무 화면 로딩 시 사용할 값


            }//end of initialize


            , render: function () {
                var that = this;


                that.createBaseGrid(); //기본그리드생성
                that.createDetailGrid(); //상세그리드생성
                that.createStaffDetailGrid(); //스태프상세그리드생성


                var aprvlId = this.$el.find('[data-form-param="aprvlId"]').val();


                if (aprvlId != "" || aprvlId != null) {
                    this.fn_loadBase();
                } else {
                    this.setSUP300BaseData(that, "", "X");
                }
                that.show();
            }


            // 기본그리드생성
            , createBaseGrid : function() {
            	var that = this;
            //  그리드 컬럼 정의
				that.PWF506BaseGrid = new ExtGrid({
					fields: [
					    'chkYn'
					    , 'lblNm'               //결재사유명
					    , 'cntnt'               //내용
					]
					, id: 'PWF506BaseGrid'
					, columns: [
						// 결재사유명
						{text:bxMsg('cbb_items.AT#aprvlRsnNm'), flex : 1 , dataIndex: 'lblNm', style: 'text-align:center', align: 'center'}
						, {text:bxMsg('cbb_items.AT#cntnt'), flex : 1 , dataIndex: 'cntnt', style: 'text-align:center', align: 'center'}
					] // end of columns
				});
				// 그리드 렌더
				that.$el.find(".PWF506-base-grid").html(that.PWF506BaseGrid.render({'height': "80px"}));
				that.PWF506BaseGrid.resetData();
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
							that.PWF506DetailGrid = new ExtTreeGrid({
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
								    , 'dlgtnDeptId'          //위임부서식별자
								    , 'dlgtnAprvlStaffId'    //위임승인스태프식별자
								    , 'aprvlCntnt'           //승인내용
								    , 'aprvlDt'              //승인년월일
								    , 'lmtDscd'              //한도구분코드
								    , 'crncyCd'              //통화코드
								    , 'maxAmt'               //최대금액
								]
								, id: 'PWF506DetailGrid'
			            		, expanded: true
								, columns: [
								    //계층단계
								    {text:bxMsg('cbb_items.SCRNITM#hrarcyLvl')
								    	, xtype: 'treecolumn', width : 80, style: 'text-align:center'}
									// 승인부서식별자
									, {text:bxMsg('cbb_items.AT#aprvlDeptId'), width: '80'
										, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'center'}
									// 승인부서명
									, {text:bxMsg('cbb_items.AT#aprvlDeptNm'), width: '120'
										, dataIndex: 'aprvlDeptNm', style: 'text-align:center', align: 'left'}
									// 승인역할식별자
									, {text:bxMsg('cbb_items.AT#aprvlRoleId'), width: '80'
										, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
									// 승인역할명
									, {text:bxMsg('cbb_items.AT#aprvlRoleNm'), width: '120'
										, dataIndex: 'aprvlRoleNm', style: 'text-align:center', align: 'left'}
									// 최대금액(결재한도)
									, {text:bxMsg('cbb_items.AT#maxAmt'), width: '120'
										, dataIndex: 'maxAmt', style: 'text-align:center', align: 'right'}
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
							}); // end og ExtTreeGrid
							// 그리드 렌더
							that.$el.find(".PWF506-detail-grid").html(that.PWF506DetailGrid.render({'height': "100px"}));
						}
					} // end of success:.function
                ); // end of bxProxy.all
            }


            // 스태프상세그리드생성
            , createStaffDetailGrid : function() {
            	var that = this;


				//  그리드 컬럼 정의
				that.PWF506StaffDetailGrid = new ExtGrid({
					fields: [
					    'chkYn'
					    , 'instCd'          //기관코드
					    , 'seqNbr'          //일련번호
					    , 'deptId'          //부서식별자
					    , 'roleId'          //역할식별자
					    , 'staffId'         //스태프식별자
					    , 'staffNm'         //스태프명
					    , 'dlgtnRoleId'     //위임역할식별자
					    , 'dlgtnDeptId'     //위임부서식별자
					    , 'dlgtnStaffId'    //위임스태프식별자
					    , 'dlgtnStaffNm'    //위임스태프명
					]
					, id: 'PWF506StaffDetailGrid'
					, columns: [
						// 스태프식별자
						{text:bxMsg('cbb_items.AT#staffId'), width: '80'
							, dataIndex: 'staffId', style: 'text-align:center', align: 'center'}
						// 스태프명
						, {text:bxMsg('cbb_items.AT#staffNm'), width: '120'
							, dataIndex: 'staffNm', style: 'text-align:center', align: 'left'}
						// 위임스태프식별자
						, {text:bxMsg('cbb_items.AT#dlgtnStaffId'), width: '80'
							, dataIndex: 'dlgtnStaffId', style: 'text-align:center', align: 'left'}
						// 위임스태프명
						, {text:bxMsg('cbb_items.AT#dlgtnStaffNm'), width: '120'
							, dataIndex: 'dlgtnStaffNm', style: 'text-align:center', align: 'left'}
					] // end of columns
					,gridConfig: {
						// 셀 에디팅 플러그인
						// 2번 클릭시, 에디팅할 수 있도록 처리
						plugins: [
							Ext.create('Ext.grid.plugin.CellEditing', {
								clicksToEdit : 2
								, listeners : {
									'beforeedit': function(editor, e) {
										return false;
									}
							}}) // end of Ext.create
						] // end of plugins
					} // end of gridConfig
					, listeners: {
						click: {
							element: 'body'
							, fn: function(_this, cell, rowIndex, eOpts) {
								that.selectStaffBaseRecord();
							}
						}
					}
				});


				// 그리드 렌더
				that.$el.find(".PWF506-StaffBase-grid").html(that.PWF506StaffDetailGrid.render({'height': "120px"}));
				that.PWF506StaffDetailGrid.resetData();
            }


            , setSUP300BaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {  // 초기화


                	that.PWF506BaseGrid.resetData(); //결재사유정보 초기화
                	that.PWF506DetailGrid.resetData(); //결재템플릿정보 초기화


                    that.$el.find('[data-form-param="demandScrnId"]').val("");       //요청화면코드
                    that.$el.find('[data-form-param="demandScrnNm"]').val("");       //요청화면명
                    that.$el.find('[data-form-param="aprvlTrgtSrvcCd"]').val("");       //요청서비스코드
                    that.$el.find('[data-form-param="srvcNm"]').val("");      //요청서비스명
                    that.$el.find('[data-form-param="demandStaffCntnt"]').val("");       //요청스테프식별자내용
                    that.$el.find('[data-form-param="aprvlAplctnDt"]').val("");       //승인요청년월일
                    that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val("");       //승인신청내용


                }
                else {


                	var outData = responseData.AprvlDemandNonActivitiSvcGetSpvsrOut;


                	/*
                	 * 결재사유정보 할당
                	 */
                    var tbList = outData.aprvlRsnCdList;


        			if (tbList != null && tbList.length > 0) {
        				that.PWF506BaseGrid.setData(tbList);
        			} else {
        				that.PWF506BaseGrid.resetData();
        			}


        			/*
        			 * 결재템플릿 정보 할당
        			 */
                    tbList = outData.aprvlTmpltDtlList;


        			if (tbList != null && tbList.length > 0) {
        				var treeGrid = that.PWF506DetailGrid;
        				treeGrid.setStoreRootNode(tbList);


        				//tree grid 렌더링 전
        		    	var timer = setInterval(function () {
        		        	if (treeGrid.grid.getSelectionModel() != null) {
        		        		clearInterval(timer);
        		        		treeGrid.expandAll();


        		        		var seqNbr = that.$el.find('[data-form-param="seqNbr"]').val();
        		        		if(seqNbr == null){
        		        			seqNbr = 1;
        		        		}
        		        		treeGrid.grid.getSelectionModel().select(seqNbr-1);
        		        		treeGrid.listeners.click.fn();
        		        	}
        		        }, 300);


        			} else {
        				that.PWF506DetailGrid.resetData();
        			}




                    that.$el.find('[data-form-param="demandScrnId"]').val(outData.demandScrnId);       //요청화면코드
                    that.$el.find('[data-form-param="demandScrnNm"]').val(outData.demandScrnNm);       //요청화면명
                    that.$el.find('[data-form-param="aprvlTrgtSrvcCd"]').val(outData.aprvlTrgtSrvcCd);       //요청서비스코드
                    that.$el.find('[data-form-param="srvcNm"]').val(outData.srvcNm);       //요청서비스명
                    that.$el.find('[data-form-param="demandStaffCntnt"]').val(outData.demandStaffCntnt);  //요청스테프식별자내용
                    that.$el.find('[data-form-param="aprvlAplctnDt"]').val(outData.aprvlAplctnDt);       //승인요청년월일
                    that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val(outData.aprvlAplctnCntnt);       //승인신청내용
                    that.oAprvlTrgtBizIdCntnt = outData.aprvlTrgtBizIdCntnt.replace("\\", "");
                }
            }
            //(부서)역할 선택 시
            , selectDetailRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF506DetailGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	selectedTmpltAprvlDtlRecord = selectedRecord.data; //선택된 템플릿정보/승인상세정보 할당
                	selectedStaffRecord = null; //선택된 스태프 초기화
                	that.browseDetailArea(selectedRecord.data);
                }
            }
            // 부서역할 선택 시 - 상세 조회
            , browseDetailArea: function (data) {
            	var that = this;
            	var sParam = {};


            	if(data.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


            	sParam.instCd = data.instCd;
            	sParam.deptId = data.aprvlDeptId;
            	sParam.roleId = data.aprvlRoleId;


            	var linkData = {"header": fn_getHeader("PWF5058403"), "AprvlDemandNonActivitiSvcGetStaffListByRoleIn": sParam};


            	//ajax 호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		enableLoading: true,
            		success: function (responseData) {
            			if (fn_commonChekResult(responseData)) {
            				var tbList = responseData.AprvlDemandNonActivitiSvcGetStaffListByRoleOut.tbl;


                			if (tbList != null && tbList.length > 0) {
                				that.PWF506StaffDetailGrid.setData(tbList);
                			} else {
                				that.PWF506StaffDetailGrid.resetData();
                			}
            			}
            		}   // end of suucess: fucntion
            	});
            }
            //스태프 선택 시
            , selectStaffBaseRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF506StaffDetailGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                	selectedStaffRecord = null; //선택된 스태프 초기화
                    return;
                } else {
                	selectedStaffRecord = selectedRecord.data;
                }
            }


            //결재요청내용
            , fn_loadBase: function () {
                var that = this;


                sParam = {};


                //승인기본
                sParam.instCd = that.instCd;
                sParam.aprvlId = that.$el.find('[data-form-param="aprvlId"]').val();


                //승인상세
                sParam.aprvlDtl ={};
                sParam.aprvlDtl.seqNbr = that.$el.find('[data-form-param="seqNbr"]').val();
                if(sParam.aprvlDtl.seqNbr == null){
                	sParam.aprvlDtl.seqNbr = '1';
                }


                var linkData = {"header": fn_getHeader("PWF5068401"), "AprvlDemandNonActivitiSvcGetSpvsrIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        if (fn_commonChekResult(responseData)) {
                            // 정상처리 메시지 출력
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                            // 기본부 항목 set
                            that.setSUP300BaseData(that, responseData, "R");
                        }
                    } // end of success: function.....
                }); // end of bxProxy.post....
            }


            //승인요청
            , fn_cnctAprvl: function () {
                var that = this;


                if (!selectedStaffRecord) {
                	alertMessage.error(bxMsg('cbb_err_msg.AUICME0014'));
                	return;
                }


                sParam = {};


                /*
                 * 승인 정보
                 */
                sParam.instCd = that.instCd;
                sParam.aprvlId = that.$el.find('[data-form-param="aprvlId"]').val();
                sParam.aprvlTrgtBizIdCntnt = JSON.stringify(aprvlTrgtBizIdCntnt);
                console.log(that.oAprvlTrgtBizIdCntnt);
                that.oAprvlTrgtBizIdCntnt = that.oAprvlTrgtBizIdCntnt.replace("\\", "");
                sParam.aprvlTrgtBizIdCntnt = JSON.stringify(that.oAprvlTrgtBizIdCntnt);


                /*
                 * 승인상세 정보
                 */
                sParam.aprvlDtl ={};
                sParam.aprvlDtl.instCd = selectedStaffRecord.instCd;
                sParam.aprvlDtl.aprvlId = sParam.aprvlId;
                sParam.aprvlDtl.seqNbr = that.$el.find('[data-form-param="seqNbr"]').val();
                if(sParam.aprvlDtl.seqNbr == null){
                	sParam.aprvlDtl.seqNbr = '1';
                }
                //승인스태프
                sParam.aprvlDtl.deptId = selectedStaffRecord.deptId;
                sParam.aprvlDtl.aprvlStaffId = selectedStaffRecord.staffId;


                //위임승인스태프
                sParam.aprvlDtl.dlgtnDeptId = selectedStaffRecord.dlgtnDeptId;
                sParam.aprvlDtl.dlgtnAprvlStaffId = selectedStaffRecord.dlgtnStaffId;


                var linkData = {"header": fn_getHeader("PWF5068501"), "AprvlDemandSvcGetSpvsrIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {


                        // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        if (fn_commonChekResult(responseData)) {
                            // 정상처리 메시지 출력
                            alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));


                            that.fn_sendAprvlId();
                            isAprvlDemand = true;


                            that.fn_loadBase();


                        }//end of if
                    }//end of success
                });//end of bxProxy
            }


            //닫기 버튼 클릭
            , fn_close: function () {
            	var that = this;
            	if(isAprvlDemand){
                	that.fn_sendAprvlId();
            	}
                this.close();
            }
            , fn_sendAprvlId: function () {
            	var param = {};
            	param.aprvlId = this.$el.find('[data-form-param="aprvlId"]').val();
            	this.trigger('popUpSetData', param);
            }
        });


        return BxpAprvlPopup;
    }
);
