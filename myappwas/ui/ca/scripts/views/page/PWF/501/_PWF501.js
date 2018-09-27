/*
@Screen number  PWF501
@brief          결재탬플릿관리
@author         youngjoo.lee
@history        2015.11.18      생성
*/
define(
    [
        'bx/common/config'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
        , 'bx-component/message/message-confirm'
        , 'app/views/page/popup/popup-roleId'
        , 'app/views/page/popup/popup-brnchCd'
        , 'app/views/page/popup/CAPCM/popup-aprvlTmplt'
        , 'text!app/views/page/PWF/501/_PWF501.html'
    ]
    , function (config
    	, ExtGrid
        , ExtTreeGrid
        , alertMessage
        , commonInfo
        , confirmMessage
        , PopupRoleList
        , PopupDeptId
        , PopupAprvlTmplt
        , tpl) {


        var PWF501View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container PWF501-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                'click .PWF501-base-browse-button': 'browseBaseArea'
            	, 'click #PWF501-detail-delete-button' : 'fn_detailDelete'
    			, 'click #PWF501-detail-reset-button' : 'fn_resetDetailGrid'
				, 'click #PWF501-detail-save-button' : 'fn_detailSave'
            	, 'click .rolePop' : 'fn_popRoleList'
            	, 'click .searchDept-btn': 'fn_popDept'
        		, 'click .aprvlTmplt-btn': 'fn_Test'
        		, 'change #baseAprvlRoleId' : 'fn_changeRoleId'
    			, 'change #baseAprvlDeptId' : 'fn_changeDeptId'
				, 'change #detailAprvlRoleId' : 'fn_changeRoleId'
				, 'change #detailAprvlDeptId' : 'fn_changeDeptId'
//				, 'change .othrDeptAprvlYn-wrap' : 'fn_changeOthrDeptAprvlYn'
            }


//            , fn_changeOthrDeptAprvlYn : function() {
//            	var that = this;
//            	var checkVal = $(':radio[name="othrDeptAprvlYn"]:checked').val();
//
//            	if(checkVal == "N") {
//            		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//          	  		that.$el.find('.PWF501-detail-table .searchDept-btn').hide();
//
//          	  		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val($.sessionStorage('deptId'));
//          	  		that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').val($.sessionStorage('deptNm'));
//
//            	}
//            	else {
//            		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", false);
//          	  		that.$el.find('.PWF501-detail-table .searchDept-btn').show();
//            	}
//
//            }


            // 부서팝업
            , fn_Test: function(event){
            	var id = event.currentTarget.id;


				var that = this;
				var param = {};
				param.instCd = that.instCd;
				param.gridType = 'tree';
				param.deptOrgnztnRelCd = '01';


			    var popupAprvlTmplt = new PopupAprvlTmplt(param);


			    popupAprvlTmplt.render();
			    popupAprvlTmplt.on('popUpSetData', function (param) {
			    	console.log(param);
			    	that.$el.find('.PWF501-'+id+'-table [data-form-param="aprvlTmpltId"]').val(param.aprvlTmpltId);
			    	that.$el.find('.PWF501-'+id+'-table [data-form-param="aprvlTmpltNm"]').val(param.aprvlTmpltNm);
			    });
			}


            , initialize: function (initParam) {
                var that = this;


                $.extend(that, initParam);
                that.$el.html(that.tpl());
                that.$el.attr('data-page', that.pageHandler);


                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    that.instCd = "";
                }
                that.createBaseGrid(); // 기본 생성
                that.createDetailGrid(); // 상세 그리드 생성


                that.defalutContents = {"aprvlTmpltId":"", "aprvlTmpltNm":"", "deptId":"", "deptNm":"", "roleId":"", "roleNm":"", "instCd":that.instCd, "othrDeptAprvlYn":"", "upAprvlTmpltId":"", "mostLowrLvlYn":"", "aprvlTmpltLvl":""};
            }


            , render: function () {
            	var that = this;


                // 콤보데이터 로딩
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "othrDeptAprvlYn-wrap";
                sParam.targetId = "othrDeptAprvlYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000";
                sParam.inputMarginRight = "5px";
                sParam.labelMarginRight = "30px";


                // 라디오박스 생성
                fn_makeRadio(sParam, that);


                that.resetBaseArea();
                that.resetDetailArea();


                return that.$el;
            }


/* ======================================================================== */
/* 그리드생성 */
/* ======================================================================== */
            // 기본그리드생성
            , createBaseGrid : function() {
            	var that = this;
                var sParam = {};


				  //  그리드 컬럼 정의
	    		  that.PWF501BaseGrid = new ExtGrid({
	    			  fields: ['chkYn', 'instCd', 'aprvlTmpltId', 'aprvlTmpltNm', 'othrDeptAprvlYn', 'aprvlDeptId', 'deptNm'
	    			           , 'aprvlRoleId', 'roleNm', 'upAprvlTmpltId', 'mostLowrLvlYn', 'aprvlTmpltLvl']
	    		  		, id: 'PWF501BaseGrid'
	    		  		, columns: [
	    			          // 결재템플릿식별자
	    			          {text:bxMsg('cbb_items.AT#aprvlTmpltId'), width: 150, dataIndex: 'aprvlTmpltId', style: 'text-align:center', align: 'left'}
	    			          // 결재템플릿명
	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltNm'), width: 200, dataIndex: 'aprvlTmpltNm', style: 'text-align:center', align: 'left', flex : 1}
	    			          // 승인부서식별자
	    			          ,{text:bxMsg('cbb_items.AT#deptId'), width: 100, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'left'}
	    			          // 부서명
	    			          ,{text:bxMsg('cbb_items.AT#deptNm'), width: 200, dataIndex: 'deptNm', style: 'text-align:center', align: 'left'}
	    			          // 승인역할식별자
	    			          ,{text:bxMsg('cbb_items.AT#roleId'), width: 100, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
	    			          // 역할명
	    			          ,{text:bxMsg('cbb_items.AT#roleNm'), width: 200, dataIndex: 'roleNm', style: 'text-align:center', align: 'left'}


	    			          ,{text:bxMsg('cbb_items.AT#instCd'), width: 200, dataIndex: 'instCd', style: 'text-align:center', align: 'left', hidden :true}
	    			          ,{text:bxMsg('cbb_items.AT#othrDeptAprvlYn'), width: 200, dataIndex: 'othrDeptAprvlYn', style: 'text-align:center', align: 'left', hidden :true}
	    			          ,{text:bxMsg('cbb_items.AT#upAprvlTmpltId'), width: 200, dataIndex: 'upAprvlTmpltId', style: 'text-align:center', align: 'left', hidden :true}
	    			          ,{text:bxMsg('cbb_items.AT#mostLowrLvlYn'), width: 200, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'left', hidden :true}
	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltLvl'), width: 200, dataIndex: 'aprvlTmpltLvl', style: 'text-align:center', align: 'left', hidden :true}


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
//				  				, selType: 'checkboxmodel'
//				  				, rowModel: { mode: 'MULTI'}
			    		  } // end of gridConfig
	                	  , listeners: {
		                    	dblclick: {
		                   			element: 'body',
		                   			fn: function(_this, cell, rowIndex, eOpts) {
		                   				that.selectBaseRecord();
		                   			}
		                   		}
		                   	}
	               });
//	              // 그리드 렌더
	              that.$el.find(".PWF501-base-grid").html(that.PWF501BaseGrid.render({'height': "200px"}));
	              that.PWF501BaseGrid.resetData();
            }


            // 상세 그리드 생성
            , createDetailGrid : function() {
            	var that = this;
            	var sParam = {};
            	// 역할상태코드


            	//  그리드 컬럼 정의
            	that.PWF501DetailGrid = new ExtTreeGrid({
            		fields: ['instCd', 'aprvlTmpltId', 'aprvlTmpltNm', 'othrDeptAprvlYn', 'aprvlDeptId', 'deptNm'
	    			           , 'aprvlRoleId', 'roleNm', 'upAprvlTmpltId', 'mostLowrLvlYn', 'aprvlTmpltLvl', 'children']
            		, id: 'PWF501DetailGrid'
            		, expanded: true
            		, columns: [
            		            {text:bxMsg('cbb_items.SCRNITM#hrarcyLvl'), xtype: 'treecolumn', width : 80, style: 'text-align:center'}
	            		         // 결재템플릿식별자
	  	    			         , {text:bxMsg('cbb_items.AT#aprvlTmpltId'), width: 150, dataIndex: 'aprvlTmpltId', style: 'text-align:center', align: 'left'}
	  	    			         // 결재템플릿명
	  	    			         ,{text:bxMsg('cbb_items.AT#aprvlTmpltNm'), width: 200, dataIndex: 'aprvlTmpltNm', style: 'text-align:center', align: 'left', flex : 1}
	  	    			         // 승인부서식별자
	  	    			         ,{text:bxMsg('cbb_items.AT#deptId'), width: 100, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'left'}
	  	    			         // 부서명
	  	    			         ,{text:bxMsg('cbb_items.AT#deptNm'), width: 150, dataIndex: 'deptNm', style: 'text-align:center', align: 'left'}
	  	    			         // 승인역할식별자
	  	    			         ,{text:bxMsg('cbb_items.AT#roleId'), width: 100, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
	  	    			         // 역할명
	  	    			         ,{text:bxMsg('cbb_items.AT#roleNm'), width: 150, dataIndex: 'roleNm', style: 'text-align:center', align: 'left'}


	  	    			         ,{text:bxMsg('cbb_items.AT#instCd'), width: 200, dataIndex: 'instCd', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#othrDeptAprvlYn'), width: 200, dataIndex: 'othrDeptAprvlYn', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#upAprvlTmpltId'), width: 200, dataIndex: 'upAprvlTmpltId', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#mostLowrLvlYn'), width: 200, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#aprvlTmpltLvl'), width: 200, dataIndex: 'aprvlTmpltLvl', style: 'text-align:center', align: 'left', hidden :true}




	  	    			       , {
	                                 xtype: 'actioncolumn', id: 'tmlayout-actioncolumn', align: 'center', width : 70
	                                 , style: 'text-align:center'
	                                 , items: [
	                                     {
	                                         icon: 'images/icon/plus-add-16.png'
	                                         , tooltip: bxMsg('tm-layout.add-child-field')
	                                         , getClass: function (value, meta, record) {
	                                     }
	                                         , handler: function (grid, rowIndex, colIndex, item, e, record) {


	                                        	 if(record.data.aprvlTmpltId != null && record.data.aprvlTmpltId != "") {
	                                        		 // 기존 데이터의 최하위레벨여부를 N 으로 변경
		                                        	 record.set("mostLowrLvlYn", "N")


		                                        	 var contents = that.defalutContents;
		                                        	 contents.children = null;
		                                        	 contents.mostLowrLvlYn = "Y";
		                                        	 // 기존 결재탬플릿식별자를 추가 하는 상위결재탬플릿식별자로 셋팅
		                                        	 contents.upAprvlTmpltId = record.data.aprvlTmpltId;


		                                             record.appendChild(contents);
		                                             record.data.leaf = false;
		                                             record.commit();
		                                             record.expand();


		                                             grid.getSelectionModel().select(rowIndex+1);
		                                             that.selectDetailRecord();
	                                        	 }
		                                     }
	                                     }
//	                                     , {
//	                                         icon: 'images/icon/x-delete-16.png'
//	                                         , tooltip: bxMsg('tm-layout.delete-field')
//	                                         , handler: function (grid, rowIndex, colIndex, item, e, record) {
//	                                             if (record.childNodes.length !== 0) {
//	                                                 alertMessage.error(bxMsg('cbb_err_msg.AUICME0029'));
//	                                                 return;
//	                                             }
//	                                             // 삭제시 상위 가 있으면 상위에 최하위레벨여부를 Y 로 변경
//	                                             record.destroy();
//	                                         }
//	                                     }
	                                 ]
	                             }


            		            ] // end of columns
            	, listeners: {
            		dblclick: {
            			element: 'body',
            			fn: function(_this, cell, rowIndex, eOpts) {
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
            	});


            	// 그리드 렌더
            	that.$el.find(".PWF501-detail-grid").html(that.PWF501DetailGrid.render({'height': "200px"}));
            }


/* ======================================================================== */
/* 조회 */
/* ======================================================================== */
            , browseBaseArea: function () {
                var that = this;
                var sParam = {};


                if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


                sParam.instCd = that.instCd;
                sParam.aprvlTmpltId = that.$el.find('.PWF501-base-table [data-form-param="aprvlTmpltId"]').val();
                sParam.aprvlTmpltNm = that.$el.find('.PWF501-base-table [data-form-param="aprvlTmpltNm"]').val();
                sParam.aprvlDeptId = that.$el.find('.PWF501-base-table [data-form-param="aprvlDeptId"]').val();
                sParam.aprvlRoleId = that.$el.find('.PWF501-base-table [data-form-param="aprvlRoleId"]').val();




                var linkData = {"header": fn_getHeader("PWF5018401"), "AprvlTmpltSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                	enableLoading: true,
                	success: function (responseData) {
                		if (fn_commonChekResult(responseData)) {
                			var tbList = responseData.AprvlTmpltSvcListOut.tbl;


                			if (tbList != null && tbList.length > 0) {
                				that.PWF501BaseGrid.setData(tbList);
                			} else {
                				that.PWF501BaseGrid.resetData();
                			}
                			that.PWF501DetailGrid.reloadData();
                			that.resetDetailArea();
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


            	sParam.instCd = data.instCd;
            	sParam.aprvlTmpltId = data.aprvlTmpltId;




            	var linkData = {"header": fn_getHeader("PWF5018402"), "AprvlTmpltSvcIn": sParam};


            	//ajax 호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		enableLoading: true,
            		success: function (responseData) {
            			if (fn_commonChekResult(responseData)) {
            				var tbList = responseData.AprvlTmpltSvcTreeListOut.tbl;
            				that.PWF501DetailGrid.setStoreRootNode(tbList);
            				that.PWF501DetailGrid.expandAll();
            				that.resetDetailArea();
            			}
            		}   // end of suucess: fucntion
            	});
            }
/* ======================================================================== */
/* 결재탬플릿명세 삭제 */
/* ======================================================================== */
         , fn_detailDelete : function() {
        	 var that = this;
        	 var param = {};


        	 if(that.instCd == "") {
         		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
         		return;
        	 }
        	 var children = that.$el.find('.PWF501-detail-table [data-form-param="children"]').val();
             if (children != 0) {
            	 alertMessage.error(bxMsg('cbb_err_msg.AUICME0029'));
            	 return;
             }
             param.instCd = that.$el.find('.PWF501-detail-table [data-form-param="instCd"]').val();
        	 param.aprvlTmpltId = that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltId"]').val();


             // 삭제
             var linkData = {"header": fn_getHeader("PWF5018301"), "AprvlTmpltSvcIn": param};


             // ajax호출
             bxProxy.post(sUrl, JSON.stringify(linkData), {
                 enableLoading: true,
                 success: function (responseData) {
                     if (fn_commonChekResult(responseData)) {
                         alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                         that.browseBaseArea(); //조회
                     }
                 }   // end of suucess: fucntion
             });     // end of bxProxy
         }
 /* ======================================================================== */
 /* 상세 저장 */
 /* ======================================================================== */
         , fn_detailSave : function() {
        	 var that = this;
        	 var param = {};
        	 param.instCd = that.$el.find('.PWF501-detail-table [data-form-param="instCd"]').val();
        	 param.aprvlTmpltId = that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltId"]').val();
        	 param.aprvlTmpltNm = that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltNm"]').val();
        	 param.aprvlDeptId = that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val();
        	 param.aprvlRoleId = that.$el.find('.PWF501-detail-table [data-form-param="aprvlRoleId"]').val();
        	 param.othrDeptAprvlYn = $(':radio[name="othrDeptAprvlYn"]:checked').val();
        	 param.aprvlTmpltLvl = that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltLvl"]').val();
        	 if(param.aprvlTmpltLvl == "" || param.aprvlTmpltLvl == null) {
        		 param.aprvlTmpltLvl = 0;
        	 }


        	 param.mostLowrLvlYn = that.$el.find('.PWF501-detail-table [data-form-param="mostLowrLvlYn"]').val();
        	 param.upAprvlTmpltId = that.$el.find('.PWF501-detail-table [data-form-param="upAprvlTmpltId"]').val();


        	 var linkData = {"header": fn_getHeader("PWF5018101"), "AprvlTmpltSvcSaveIn": param};
             // ajax호출
             bxProxy.post(sUrl, JSON.stringify(linkData), {
                 enableLoading: true,
                 success: function (responseData) {
                     if (fn_commonChekResult(responseData)) {
                         alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                         that.browseBaseArea(); //조회
                     }
                 }   // end of suucess: fucntion
             });     // end of bxProxy
         }
/* ======================================================================== */
/* 그리드 더블클릭 */
/* ======================================================================== */
            , selectBaseRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF501BaseGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	// 하위 조회 태워야 한다.
                	that.browseDetailArea(selectedRecord.data);
                }
            }


            // 상세 그리드 더블클릭
            , selectDetailRecord: function (e) {
                var that = this;
                var selectedRecord = that.PWF501DetailGrid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.find('.PWF501-detail-table [data-form-param="instCd"]').val(selectedRecord.data.instCd);
                	that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltId"]').val(selectedRecord.data.aprvlTmpltId);
                	that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltNm"]').val(selectedRecord.data.aprvlTmpltNm);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val(selectedRecord.data.aprvlDeptId);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').val(selectedRecord.data.deptNm);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="aprvlRoleId"]').val(selectedRecord.data.aprvlRoleId);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="roleNm"]').val(selectedRecord.data.roleNm);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val(selectedRecord.data.othrDeptAprvlYn);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltLvl"]').val(selectedRecord.data.aprvlTmpltLvl);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="mostLowrLvlYn"]').val(selectedRecord.data.mostLowrLvlYn);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="upAprvlTmpltId"]').val(selectedRecord.data.upAprvlTmpltId);
              	  	that.$el.find('.PWF501-detail-table [data-form-param="children"]').val(selectedRecord.data.children.length);


              	  $('input:radio[name="othrDeptAprvlYn"]:input[value="'+selectedRecord.data.othrDeptAprvlYn+'"]').prop("checked", true);


              	  	if(selectedRecord.data.children.length > 0) {
              	  		that.$el.find('#PWF501-detail-delete-button').prop("disabled", true);
              	  	}
              	  	else {
              	  		that.$el.find('#PWF501-detail-delete-button').prop("disabled", false);
              	  	}


              	  	that.$el.find('#PWF501-detail-save-button').prop("disabled", false);


//              	  	if(selectedRecord.data.othrDeptAprvlYn == "Y") {
//              	  		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", false);
//              	  		that.$el.find('.PWF501-detail-table .searchDept-btn').show();
//              	  	}
//              	  	else {
//              	  		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//              	  		that.$el.find('.PWF501-detail-table .searchDept-btn').hide();
//              	  	}


                }
            }


/* ======================================================================== */
/* Popup 창 */
/* ======================================================================== */
            // 역할 팝업
            , fn_popRoleList : function(event) {
            	var that = this;
            	var id = event.currentTarget.id;


            	if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


            	var param = {};
            	param.instCd = that.instCd;
				param.deptId = that.$el.find('.PWF501-'+id+'-table [data-form-param="aprvlDeptId"]').val();


				if(param.deptId == ""){
			    	alertMessage.error(bxMsg('cbb_items.SCRNITM#inputDept'));
			    	return;
			    }


            	var popupRoleList = new PopupRoleList(param); // 팝업생성
            	popupRoleList.render();


            	popupRoleList.on('popUpSetData', function(param) {
            		that.$el.find('.PWF501-'+id+'-table [data-form-param="aprvlRoleId"]').val(param.roleId);
            		that.$el.find('.PWF501-'+id+'-table [data-form-param="roleNm"]').val(param.roleNm);
            	});
            }


            // 부서팝업
            , fn_popDept: function(event){
            	var id = event.currentTarget.id;


				var that = this;
				var param = {};
				param.instCd = that.instCd;
				param.gridType = 'tree';
				param.deptOrgnztnRelCd = '01';


			    var popDeptIdObj = new PopupDeptId(param);


			    popDeptIdObj.render();
			    popDeptIdObj.on('popUpSetData', function (param) {
			    	that.$el.find('.PWF501-'+id+'-table [data-form-param="aprvlDeptId"]').val(param.brnchCd);
			    	that.$el.find('.PWF501-'+id+'-table [data-form-param="deptNm"]').val(param.brnchNm);
			    });
			}
/* ======================================================================== */
/* 초기화 */
/* ======================================================================== */
            // 상세 그리드 초기화
            , fn_resetDetailGrid : function() {
            	var that = this;
            	that.PWF501DetailGrid.reloadData();
            	var contents = that.defalutContents;
            	contents.children = [];
            	contents.mostLowrLvlYn = "Y";
            	contents.aprvlTmpltLvl = 0;
            	contents.othrDeptAprvlYn = "N";
            	that.$el.find('#PWF501-detail-save-button').prop("disabled", false);
            	that.$el.find('#PWF501-detail-delete-button').prop("disabled", true);


//            	contents.aprvlDeptId = $.sessionStorage('deptId');
//            	contents.deptNm = $.sessionStorage('deptNm');


//          	  	that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//          	  	that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').prop("disabled", true);
//          	  	that.$el.find('.PWF501-detail-table .searchDept-btn').hide();


            	that.PWF501DetailGrid.addField(contents);
            	that.PWF501DetailGrid.grid.getSelectionModel().select(0);
            	that.selectDetailRecord();


            }


            , refresh : function() {
            	  var that = this;
            	  that.resetBaseArea();
            	  that.PWF501BaseGrid.resetData();
            	  that.PWF501DetailGrid.reloadData();
            	  that.resetDetailArea();
              }


              // 기본부초기화
              , resetBaseArea: function () {
                  var that = this;


                  that.$el.find('.PWF501-base-table [data-form-param="aprvlTmpltId"]').val("");
                  that.$el.find('.PWF501-base-table [data-form-param="aprvlTmpltNm"]').val("");
                  that.$el.find('.PWF501-base-table [data-form-param="aprvlDeptId"]').val("");
                  that.$el.find('.PWF501-base-table [data-form-param="deptNm"]').val("");
                  that.$el.find('.PWF501-base-table [data-form-param="aprvlRoleId"]').val("");
                  that.$el.find('.PWF501-base-table [data-form-param="roleNm"]').val("");
              }


              // 상세부초기화
              , resetDetailArea: function () {
            	  var that = this;


            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltId"]').val("");
            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltNm"]').val("");


//            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val($.sessionStorage('deptId'));
            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val("");
//            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//            	  that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').val($.sessionStorage('deptNm'));
            	  that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').val("");
//            	  that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').prop("disabled", true);
//            	  that.$el.find('.PWF501-detail-table .searchDept-btn').hide();


            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlRoleId"]').val("");
            	  that.$el.find('.PWF501-detail-table [data-form-param="roleNm"]').val("");


            	  $('input:radio[name="othrDeptAprvlYn"]:input[value="N"]').prop("checked", true);


            	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlTmpltLvl"]').val("0");
            	  that.$el.find('.PWF501-detail-table [data-form-param="mostLowrLvlYn"]').val("");
            	  that.$el.find('.PWF501-detail-table [data-form-param="children"]').val("");
            	  that.$el.find('.PWF501-detail-table [data-form-param="instCd"]').val("");


            	  that.$el.find('#PWF501-detail-save-button').prop("disabled", true);
            	  that.$el.find('#PWF501-detail-delete-button').prop("disabled", true);
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


            	  var rolId = that.$el.find('.PWF501-'+target+'-table [data-form-param="aprvlRoleId"]').val();
            	  if(rolId == "") {
            		  that.$el.find('.PWF501-'+target+'-table [data-form-param="roleNm"]').val("");
            	  }
              }


              // 부서식별자 변경시 부서명을 초기화 한다.
              , fn_changeDeptId : function(event) {
            	  var that = this;
            	  var id = event.currentTarget.id;
            	  var target = "";
            	  if(id == "baseAprvlDeptId") {
            		  target = "base";
            	  }
            	  else {
            		  target = "detail";
            	  }


            	  var aprvlDeptId = that.$el.find('.PWF501-'+target+'-table [data-form-param="aprvlDeptId"]').val();
            	  if(aprvlDeptId == "") {
            		  that.$el.find('.PWF501-'+target+'-table [data-form-param="deptNm"]').val("");
            	  }
              }
        }); // end of Backbone.View.extend({


        return PWF501View;
    } // end of define function
); // end of define
