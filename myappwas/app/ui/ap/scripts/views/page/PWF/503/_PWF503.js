/*
@Screen number  PWF503
@brief          위임역할관리
@author         shingee.gang
@history        2016.03.25      생성
*/
define(
    [
        'bx/common/config'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
        , 'bx-component/message/message-confirm'
        , 'app/views/page/popup/popup-roleList'
        , 'app/views/page/popup/popup-staffId'
        , 'app/views/page/popup/popup-roleStaff'
        , 'bx-component/date-picker/_date-picker'
        , 'text!app/views/page/PWF/503/_PWF503.html'
    ]
    , function (config
    	, ExtGrid
        , alertMessage
        , commonInfo
        , confirmMessage
        , PopupRoleList
        , PopupStaffId
        , PopupRoleStaff
        , DatePicker
        , tpl
        ) {


    	/*
    	 * 저장 버튼 모드 상수
    	 */
    	var SAVE_BUTTON_REGT = "regt"; // 등록 모드
    	var SAVE_BUTTON_UPDT = "updt"; // 수정 모드


        var PWF503View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container PWF503-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                'click .PWF503-base-browse-button': 'browseBaseArea' //조회 버튼 클릭
            	, 'click #PWF503-base-delete-button' : 'fn_deleteBase' //중단 버튼 클릭
    			, 'click .PWF503-detail-reset-button' : 'resetDetailArea' //초기화 버튼 클릭
				, 'click #PWF503-detail-save-button' : 'fn_detailSave' //저장 버튼 클릭
            	, 'click .rolePop' : 'popupRole' //역할 팝업
                , 'click .searchDlgtnStaff-btn' : 'popupDlgtnRoleStaff' //위임(하는) 역할스태프 팝업
                , 'click .searchStaff-btn' : 'popupAcptncStaff' //위임받는 스태프 팝업
        		, 'change #baseAprvlRoleId' : 'fn_changeRoleId'
            }
            , initialize: function (initParam) {
                var that = this;


                $.extend(that, initParam);
                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_PWF504.js파일)
                that.$el.attr('data-page', that.pageHandler);


                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    that.instCd = "";
                }


                /*
                 * 초기화
                 */
                that.saveButtonMode = SAVE_BUTTON_REGT;
            }
            , render: function () {
            	var that = this;


				that.loadDatePicker(); // 데이터 피커 로드
				that.renderCombo(); // 콤보 박스 그리기


                that.createBaseGrid(); // 기본 생성


                return that.$el;
            }
            // 콤보 박스 그리기
            , renderCombo : function (){
            	var selectStyle;
            	var sParam;


            	/*
            	 * 검색조건 영역
            	 */
                selectStyle = {"width": '100%'}; //스타일 초기화
                sParam = {}; //데이터 초기화
                //combobox 정보 셋팅
                sParam.className = "PWF503-dlgtnStsCd-wrap";
                sParam.targetId = "dlgtnStsCd";
                sParam.nullYn = "Y";
                //inData 정보 셋팅
                sParam.cdNbr = "A0470"; //위임상태코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this, selectStyle);


                /*
                 * 상세 영역
                 */
                selectStyle = {"width": '100%'}; //스타일 초기화
                sParam = {}; //데이터 초기화
                //combobox 정보 셋팅
                sParam.className = "PWF503-detail-dlgtnStsCd-wrap";
                sParam.targetId = "dlgtnStsCd";
                sParam.nullYn = "Y";
                //inData 정보 셋팅
                sParam.cdNbr = "A0470"; //위임상태코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this, selectStyle);
            }


            , loadDatePicker: function () {
         	    this.subViews['efctvStartDt'] && this.subViews['efctvStartDt'].remove();
                this.subViews['efctvEndDt'] && this.subViews['efctvEndDt'].remove();


                this.subViews['efctvStartDt'] = new DatePicker({
             	   inputAttrs: { 'data-form-param': 'efctvStartDt'},
             	   setTime: false
                });


                this.subViews['efctvEndDt'] = new DatePicker({
             	   inputAttrs: { 'data-form-param': 'efctvEndDt' },
             	   setTime: false
                });


                // 데이터 피커 렌더
                this.$el.find('.efctvStartDt-wrap').html(this.subViews['efctvStartDt'].render());
                this.$el.find('.efctvEndDt-wrap').html(this.subViews['efctvEndDt'].render());
            }


/* ======================================================================== */
/* 그리드생성 */
/* ======================================================================== */
            // 기본그리드생성
            , createBaseGrid : function() {
            	var that = this;
                var sParam = {};


				  //  그리드 컬럼 정의
	    		  that.PWF503BaseGrid = new ExtGrid({
	    			  fields: ['chkYn'
	    			           , 'instCd'               //기관코드
	    			           , 'staffId'              //스태프식별자
	    			           , 'staffNm'              //스태프명
	    			           , 'roleId'               //위임역할식별자
	    			           , 'roleNm'               //위임역할명
	    			           , 'efctvStartDt'         //유효시작년월일
	    			           , 'efctvEndDt'           //유효종료년월일
	    			           , 'dlgtnStsCd'           //위임상태코드
	    			           , 'deptId'               //부서식별자
	    			           , 'deptNm'               //부서명
	    			           , 'dlgtnDeptId'          //위임부서식별자
	    			           , 'dlgtnDeptNm'          //위임부서명
	    			           , 'dlgtnStaffId'         //위임스태프식별자
	    			           , 'dlgtnStaffNm'         //위임스태프명
	    			           , 'chngRsnCntnt'         //위임내용
	    			           , 'lastChngTmstmp'       //최종변경일시
	    			           , 'lastChngGuid'         //최종변경GUID
	    			          ]
	    		  		, id: 'PWF503BaseGrid'
	    		  		, columns: [
  	    			          // 위임부서식별자
	    			          {text:bxMsg('cbb_items.AT#deptId'), width: 80, dataIndex: 'dlgtnDeptId', style: 'text-align:center', align: 'center'}
	    			          // (위임)부서명
	    			          ,{text:bxMsg('cbb_items.AT#deptNm'), width: 120, dataIndex: 'dlgtnDeptNm', style: 'text-align:center', align: 'left', flex : 1}
	    			          // (위임)역할식별자
	    			          ,{text:bxMsg('cbb_items.AT#roleId'), width: 80, dataIndex: 'roleId', style: 'text-align:center', align: 'center'}
	    			          // (위임)역할명
	    			          ,{text:bxMsg('cbb_items.AT#roleNm'), width: 120, dataIndex: 'roleNm', style: 'text-align:center', align: 'left'}
	    			          // 위임스태프식별자
	    			          ,{text:bxMsg('cbb_items.AT#dlgtnStaffId'), width: 140, dataIndex: 'dlgtnStaffId', style: 'text-align:center', align: 'center'}
	    			          // 위임스태프명
	    			          ,{text:bxMsg('cbb_items.SCRNITM#dlgtnStaffNm'), width: 140, dataIndex: 'dlgtnStaffNm', style: 'text-align:center', align: 'left'}
	    			          // 수임스태프식별자
	    			          ,{text:bxMsg('cbb_items.SCRNITM#acptncStaffId'), width: 140, dataIndex: 'staffId', style: 'text-align:center', align: 'center'}
	    			          // 수임스태프명
	    			          ,{text:bxMsg('cbb_items.SCRNITM#acptncStaffNm'), width: 140, dataIndex: 'staffNm', style: 'text-align:center', align: 'left'}
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
				  				, selType: 'checkboxmodel'
				  				, rowModel: { mode: 'MULTI'}
			    		  } // end of gridConfig
	                	  , listeners: {
//		                    	click: {
//		                   			element: 'body',
//		                   			fn: function(constructor, htmlTag, _this) {
//		                   				that.selectBaseRecord();
//		                   			}
//		                   		}
	                	  		cellclick: function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts ){
	                	  			if(rowIndex != null) //스크립트에서 선택 클릭 시 값이 없어서 - 이전 값 유지
	                	  				that.gridRowIndex = rowIndex;


	                	  			that.selectBaseRecord();
	                	  		}
		                   	}
	               });
//	              // 그리드 렌더
	              that.$el.find(".PWF503-base-grid").html(that.PWF503BaseGrid.render({'height': "200px"}));
	              that.PWF503BaseGrid.resetData();
            }


/* ======================================================================== */
/* 조회 */
/* ======================================================================== */
            , browseBaseArea: function (event) { //조회 버튼 클릭
            	var that = this;


            	that.gridRowIndex = null;
            	that.selectGrid();
            }
            , selectGrid: function () { //조회 처리
                var that = this;
                var sParam = {};


                if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


                sParam.instCd = that.instCd;
                //부서
                sParam.dlgtnDeptId = that.$el.find('.PWF503-base-table [data-form-param="dlgtnDeptId"]').val();
                sParam.dlgtnDeptNm = that.$el.find('.PWF503-base-table [data-form-param="dlgtnDeptNm"]').val();


                //역할
                sParam.roleId = that.$el.find('.PWF503-base-table [data-form-param="roleId"]').val();
                sParam.roleNm = that.$el.find('.PWF503-base-table [data-form-param="roleNm"]').val();


                //위임스태프
                sParam.dlgtnStaffId = that.$el.find('.PWF503-base-table [data-form-param="dlgtnStaffId"]').val();
                sParam.dlgtnStaffNm = that.$el.find('.PWF503-base-table [data-form-param="dlgtnStaffNm"]').val();


                //위임받는 스태프
                sParam.staffId = that.$el.find('.PWF503-base-table [data-form-param="staffId"]').val();
                sParam.staffNm = that.$el.find('.PWF503-base-table [data-form-param="staffNm"]').val();


                sParam.dlgtnStsCd = that.$el.find('.PWF503-base-table [data-form-param="dlgtnStsCd"]').val();


                var linkData = {"header": fn_getHeader("PWF5038401"), "DlgtnRoleMgmtSvcGetDelegationRoleListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                	enableLoading: true,
                	success: function (responseData) {
                		if (fn_commonChekResult(responseData)) {
                			var tbList = responseData.DlgtnRoleMgmtSvcStaffDlgtnRoleListIO.list;


                			that.resetDetailArea();
                			if (tbList != null && tbList.length > 0) {
                				that.PWF503BaseGrid.setData(tbList);
                			} else {
                				that.PWF503BaseGrid.resetData();
                			}


                			that.resetDetailArea();


                			if(that.gridRowIndex != null){
        						that.PWF503BaseGrid.grid.getSelectionModel().select(that.gridRowIndex);
        					}else{
        						that.PWF503BaseGrid.getSelectedRow(0);
        					}


//                			that.PWF503BaseGrid.listeners.click.fn();
                			that.PWF503BaseGrid.grid.fireEvent("cellclick"
                					, that.PWF503BaseGrid.grid.getView()
                					, that.PWF503BaseGrid.grid.getSelectionModel().selected.items[0]);
//                			that.PWF503BaseGrid.trigger("click");
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


            	that.saveButtonMode = SAVE_BUTTON_UPDT;
            	that.$el.find('.searchDlgtnStaff-btn').hide();
            	that.$el.find('.searchStaff-btn').hide();


            	this.subViews['efctvStartDt'].$el.find("input").prop("disabled", "disabled");
            	$.each(this.subViews['efctvStartDt'].$el.find("i"), function(index, obj){
            		$(obj).hide();
            	});




//            	sParam.instCd = data.instCd;
//            	sParam.staffId = data.staffId;
//            	sParam.roleId = data.roleId;
//            	sParam.efctvStartDt = data.efctvStartDt;
//
//
//            	var linkData = {"header": fn_getHeader("PWF5038402"), "DlgtnRoleMgmtSvcStaffDlgtnRoleIO": sParam};
//
//            	//ajax 호출
//            	bxProxy.post(sUrl, JSON.stringify(linkData), {
//            		enableLoading: true,
//            		success: function (responseData) {
//            			if (fn_commonChekResult(responseData)) {
//            				var rec = responseData.DlgtnRoleMgmtSvcStaffDlgtnRoleIO;
//            				that.resetDetailArea();
//            				that.setDetailArea(rec);
//            			}
//            		}   // end of suucess: fucntion
//            	});
            }
            /*
             * 상세조회 처리
             */
            , setDetailArea(rec){
            	var that = this;


            	that.$el.find('.PWF503-detail-table [data-form-param="roleNm"]').val(rec.roleNm);
				that.$el.find('.PWF503-detail-table [data-form-param="roleId"]').val(rec.roleId);
				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptNm"]').val(rec.dlgtnDeptNm);
				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptId"]').val(rec.dlgtnDeptId);
				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffNm"]').val(rec.dlgtnStaffNm);
				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffId"]').val(rec.dlgtnStaffId);


				that.$el.find('.PWF503-detail-table [data-form-param="deptNm"]').val(rec.deptNm);
				that.$el.find('.PWF503-detail-table [data-form-param="deptId"]').val(rec.deptId);
				that.$el.find('.PWF503-detail-table [data-form-param="staffNm"]').val(rec.staffNm);
				that.$el.find('.PWF503-detail-table [data-form-param="staffId"]').val(rec.staffId);


				var efctvStartDt = (rec.efctvStartDt) ? XDate(rec.efctvStartDt).toString('yyyy-MM-dd') : '';
				var efctvEndDt = (rec.efctvEndDt) ? XDate(rec.efctvEndDt).toString('yyyy-MM-dd') : '';


				that.subViews['efctvStartDt'].setValue(rec.efctvStartDt);
				that.subViews['efctvEndDt'].setValue(rec.efctvEndDt);
//				that.$el.find('.PWF503-detail-table [data-form-param="efctvStartDt"]').val(rec.efctvStartDt);
//				that.$el.find('.PWF503-detail-table [data-form-param="efctvEndDt"]').val(rec.efctvEndDt);


				that.$el.find('.PWF503-detail-table [data-form-param="chngRsnCntnt"]').val(rec.chngRsnCntnt);


				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStsCd"]').val(rec.dlgtnStsCd);
            }
/* ======================================================================== */
/* 위임역할상태 목록 변경(중단) */
/* ======================================================================== */
         , fn_deleteBase : function() {
        	 var that = this;


             var sParam = {};
             var list = [];
//             var checkdedAllData = that.PWF503BaseGrid.getFilteredRecords('chkYn', true); // 체크된 데이터 가지고 오기


             var checkdedAllData = that.PWF503BaseGrid.getCheckRecords(); // 체크된 데이터 가지고 오기


             if (checkdedAllData.length == 0) {
             	alertMessage.error(bxMsg('cbb_err_msg.AUICME0034'));
             	return;
             }


             for (var idx in checkdedAllData) {
                 var row = {};
                 row.instCd = checkdedAllData[idx].instCd; //기관코드
                 row.staffId = checkdedAllData[idx].staffId; //스태프식별자
                 row.roleId = checkdedAllData[idx].roleId; //위임역할식별자
                 row.efctvStartDt = checkdedAllData[idx].efctvStartDt; //유효시작년월일


                 list.push(row);
             }


             sParam.list = list;


//             return;


             var linkData = {"header": fn_getHeader("PWF5038202"), "DlgtnRoleMgmtSvcModifyDelegationRoleStatusListIn": sParam};


             //ajax 호출
             bxProxy.post(sUrl, JSON.stringify(linkData), {
                 success: function (responseData) {
                     if (fn_commonChekResult(responseData)) {
                         alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                         that.$el.find(".PWF503-base-browse-button").click(); //조회
                     }
                 }
             });
         }
 /* ======================================================================== */
 /* 상세 저장 */
 /* ======================================================================== */
         , fn_detailSave : function() {
        	 var that = this;
        	 var param = {};


        	 param.instCd = that.instCd;
        	 param.roleId = that.$el.find('.PWF503-detail-table [data-form-param="roleId"]').val();
        	 param.dlgtnDeptId = that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptId"]').val();
        	 param.dlgtnStaffId = that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffId"]').val();


        	 param.deptId = that.$el.find('.PWF503-detail-table [data-form-param="deptId"]').val();
        	 param.staffId = that.$el.find('.PWF503-detail-table [data-form-param="staffId"]').val();


        	 param.efctvStartDt = that.subViews['efctvStartDt'].getValue();
        	 param.efctvEndDt = that.subViews['efctvEndDt'].getValue();
        	 param.chngRsnCntnt = that.$el.find('.PWF503-detail-table [data-form-param="chngRsnCntnt"]').val();


        	 param.dlgtnStsCd = that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStsCd"]').val();


        	 var linkData;
        	 if(that.saveButtonMode === SAVE_BUTTON_REGT){
        		 linkData = {"header": fn_getHeader("PWF5038101"), "DlgtnRoleMgmtSvcStaffDlgtnRoleIO": param};
        	 }else{
        		 linkData = {"header": fn_getHeader("PWF5038201"), "DlgtnRoleMgmtSvcStaffDlgtnRoleIO": param};
        	 }


             // ajax호출
             bxProxy.post(sUrl, JSON.stringify(linkData), {
                 enableLoading: true,
                 success: function (responseData) {
                     if (fn_commonChekResult(responseData)) {
                         alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
//                         that.$el.find(".PWF503-base-browse-button").click(); //조회
                         if(that.saveButtonMode === SAVE_BUTTON_REGT){
                        	 that.gridRowIndex = null;
                         }
                         that.selectGrid();
                     }
                 }   // end of suucess: fucntion
             });     // end of bxProxy


         }
/* ======================================================================== */
/* 그리드 클릭 */
/* ======================================================================== */
            , selectBaseRecord: function () {
                var that = this;
                var selectedRecord = that.PWF503BaseGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	// 하위 조회 태워야 한다.
                	that.browseDetailArea(selectedRecord.data);
                }
            }


/* ======================================================================== */
/* Popup 창 */
/* ======================================================================== */
            // 역할 팝업
            , popupRole : function(event) {
            	var that = this;
            	var id = event.currentTarget.id;


            	if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


            	var param = {};
            	param.instCd = that.instCd;


            	var popupRoleList = new PopupRoleList(param); // 팝업생성
            	popupRoleList.render();


            	popupRoleList.on('popUpSetData', function(param) {
            		that.$el.find('.PWF503-base-table [data-form-param="roleId"]').val(param.roleId);
    				that.$el.find('.PWF503-base-table [data-form-param="roleNm"]').val(param.roleNm);
            	});
            }


    		, popupDlgtnRoleStaff : function() { //위임(하는) 역할스태프 팝업


                var that = this;
                var param = {};
//                param.data = that.$el.find('[data-form-param="staffId"]').val();


                var popupRoleStaff = new PopupRoleStaff(param);
                popupRoleStaff.render();
                popupRoleStaff.on('popUpSetData', function(param) {
    				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffId"]').val(param.staffId);
    				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffNm"]').val(param.staffNm);
    				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptId"]').val(param.deptId);
    				that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptNm"]').val(param.deptNm);
    				that.$el.find('.PWF503-detail-table [data-form-param="roleId"]').val(param.roleId);
    				that.$el.find('.PWF503-detail-table [data-form-param="roleNm"]').val(param.roleNm);
                });
    		}
    		, popupAcptncStaff : function() { //위임받는 스태프 팝업
    			var that = this;
    			var param = {};
    			param.instCd = that.instCd;
    			param.type = "03";
//    			param.data = that.$el.find(".staffNm-wrap").html();
    			param.actorTpCd = "12"; // 액터유형코드 12: Staff


    			var popupStaffIdObj = new PopupStaffId(param);
    			popupStaffIdObj.render();
    			popupStaffIdObj.on('popUpSetData', function(param) {
    				that.$el.find('.PWF503-detail-table [data-form-param="staffId"]').val(param.staffId);
    				that.$el.find('.PWF503-detail-table [data-form-param="staffNm"]').val(param.staffNm);
    				that.$el.find('.PWF503-detail-table [data-form-param="deptId"]').val(param.deptId);
    				that.$el.find('.PWF503-detail-table [data-form-param="deptNm"]').val(param.deptNm);
    			});
    		}


/* ======================================================================== */
/* 초기화 */
/* ======================================================================== */


            , refresh : function() {
            	  var that = this;
            	  that.resetBaseArea();
            	  that.PWF503BaseGrid.resetData();
//            	  that.PWF503DetailGrid.reloadData();
            	  that.resetDetailArea();
              }


              // 기본부초기화
              , resetBaseArea: function () {
                  var that = this;


                  that.$el.find('.PWF503-base-table [data-form-param="dlgtnDeptId"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="dlgtnDeptNm"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="roleId"]').val("");


                  that.$el.find('.PWF503-base-table [data-form-param="dlgtnStaffId"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="dlgtnStaffNm"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="roleNm"]').val("");


                  that.$el.find('.PWF503-base-table [data-form-param="staffId"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="staffNm"]').val("");
                  that.$el.find('.PWF503-base-table [data-form-param="dlgtnStsCd"]').val("");


                  that.saveButtonMode = SAVE_BUTTON_REGT;
              }


              // 상세부초기화
              , resetDetailArea: function () {
            	  var that = this;


            	  that.$el.find('.PWF503-detail-table [data-form-param="roleNm"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="roleId"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptNm"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="dlgtnDeptId"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffNm"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStaffId"]').val("");


            	  that.$el.find('.PWF503-detail-table [data-form-param="deptNm"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="deptId"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="staffNm"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="staffId"]').val("");


            	  that.$el.find('.PWF503-detail-table [data-form-param="efctvStartDt"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="efctvEndDt"]').val("");
            	  that.$el.find('.PWF503-detail-table [data-form-param="chngRsnCntnt"]').val("");


            	  that.$el.find('.PWF503-detail-table [data-form-param="dlgtnStsCd"]').val("");


            	  that.saveButtonMode = SAVE_BUTTON_REGT;
              	  that.$el.find('.searchDlgtnStaff-btn').show();
            	  that.$el.find('.searchStaff-btn').show();


            	  //위임년월일
              	  this.subViews['efctvStartDt'].$el.find("input").prop("disabled", "");
            	  $.each(this.subViews['efctvStartDt'].$el.find("i"), function(index, obj){
            	  	$(obj).show();
            	  });
              }


              // 역할식별자 변경시 역할명을 초기화 한다.
              , fn_changeRoleId : function(event) {
            	  var that = this;
            	  var id = event.currentTarget.id;
            	  var target = "";
            	  if(id == "baseAprvlRoleId") {
            		  target = "base";
            	  }
            	  else {
            		  target = "detail";
            	  }


            	  var rolId = that.$el.find('.PWF503-'+target+'-table #baseAprvlRoleId').val();
            	  if(rolId == "") {
            		  that.$el.find('.PWF503-'+target+'-table [data-form-param="roleNm"]').val("");
            	  }
              }
        }); // end of Backbone.View.extend({


        return PWF503View;
    } // end of define function
); // end of define
