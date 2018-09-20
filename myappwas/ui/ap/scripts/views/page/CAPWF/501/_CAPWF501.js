define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPWF/501/_CAPWF501.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
        , 'bx-component/message/message-confirm'
        , 'app/views/page/popup/CAPAT/popup-brnchCd'
        , 'app/views/page/popup/CAPCM/popup-role-search'
        , 'app/views/page/popup/CAPCM/popup-aprvlTmplt'
    ]
    , function (config
        , tpl
        , ExtGrid
        , ExtTreeGrid
        , alertMessage
        , commonInfo
        , confirmMessage
        , popupDeptId
        , popupRoleSrch
        , popupAprvlTmplt
        ) {


        /**
         * Backbone
         */
        var CAPWF501View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPWF501page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	//search condition area
                	'click #btn-base-search': 'browseBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'
                	, 'click #btn-base-reset': 'fn_resetBaseArea'
                	, 'click #btn-base-save': 'fn_saveBase'
                	,'click #btn-base-delete': 'fn_deleteBase'
                	/*base table area*/
        			, 'click #btn-CAPWF501-grid-delete': 'deleteBaseGrid'
    				, 'click #btn-CAPWF501-base-grid-excel': 'excelBaseGrid'
    				, 'click .searchDept-btn': 'fn_popDept'
    				, 'click .searchRole-btn': 'fn_popRole'
    				, 'click .searchAprvlTmplt-btn': 'fn_popAprvlTmplt'
    				, 'click #btn-up-grid-base': 'baseGridModal'

    				//detail table area
    				, 'click #btn-CAPWF501-detail-refresh': 'fn_resetDetailGrid'
					, 'click #btn-CAPWF501-detail-grid-save': 'fn_detailSave'
					, 'click #btn-CAPWF501-detail-grid-excel': 'excelDetailGrid'
					, 'click #btn-CAPWF501-detail-grid-delete': 'fn_detailDelete'
					, 'click #btn-up-grid-detail': 'fn_detailGridModal'
					, 'click #btn-CAPWF501-detail-grid-toggle': 'fn_detailToggle'
					//common
					, 'keydown #searchKey' : 'fn_enter'
	        		, 'change #baseAprvlRoleId' : 'fn_changeRoleId'
	        		, 'change #baseAprvlDeptId' : 'fn_changeDeptId'
	    			, 'change #detailAprvlRoleId' : 'fn_changeRoleId'
	    			, 'change #detailAprvlDeptId' : 'fn_changeDeptId'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = [];

                    
                    $.extend(that, initData);
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


                    that.defalutContents = {"aprvlTmpltId":"", "aprvlTmpltNm":"", "deptId":"", "deptNm":"", "roleId":"", "roleNm":"", "instCd":that.instCd, "othrDeptAprvlYn":"", "aprvlTmpltDscd":"", "aprvlCndUseYn":"", "upAprvlLvlNbr":"", "mostLowrLvlYn":"", "aprvlLvlNbr":""};
                }
                
                // 부서팝업
                , fn_popDept: function(event){
                	var id = event.currentTarget.id;

    				var that = this;
    				var param = {};
    				param.instCd = that.instCd;
//    				param.gridType = 'tree';
//    				param.deptOrgnztnRelCd = '01';
    				param.dtogRelCd = '01'; //기본조직

    			    var popDeptIdObj = new popupDeptId(param);


    			    popDeptIdObj.render();
    			    popDeptIdObj.on('popUpSetData', function (param) {
    			    	that.$el.find('.CAPWF501-'+id+'-table [data-form-param="aprvlDeptId"]').val(param.brnchCd);
    			    	that.$el.find('.CAPWF501-'+id+'-table [data-form-param="deptNm"]').val(param.brnchNm);
    			    });
    			}
                
                ,fn_popRole: function (event) {
                    var that = this;
                	var id = event.currentTarget.id;
                    var param = {};
                    // var roleNm = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                    //
                    // if(roleNm) {
                    //     param.roleNm = roleNm;
                    // }
                	if(that.instCd == "") {
                		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                		return;
                	}

                    this.popupRoleSrch = new popupRoleSrch(param);
                    this.popupRoleSrch.render();
                    this.popupRoleSrch.on('popUpSetData', function (data) {
                		that.$el.find('.CAPWF501-'+id+'-table [data-form-param="aprvlRoleId"]').val(data.roleId);
                		that.$el.find('.CAPWF501-'+id+'-table [data-form-param="roleNm"]').val(data.roleNm);
                    });
                }
                
                ,fn_popAprvlTmplt: function (event) {
                    var that = this;
                	var id = event.currentTarget.id;
                    var param = {};
                    // var roleNm = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                    //
                    // if(roleNm) {
                    //     param.roleNm = roleNm;
                    // }
                	if(that.instCd == "") {
                		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                		return;
                	}

                    this.popupAprvlTmplt = new popupAprvlTmplt(param);
                    this.popupAprvlTmplt.render();
                    this.popupAprvlTmplt.on('popUpSetData', function (data) {
                		that.$el.find('.CAPWF501-'+id+'-table [data-form-param="aprvlTmpltId"]').val(data.aprvlTmpltId);
                		that.$el.find('.CAPWF501-'+id+'-table [data-form-param="aprvlTmpltNm"]').val(data.aprvlTmpltNm);
                    });
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


              	  var aprvlDeptId = that.$el.find('.CAPWF501-'+target+'-table [data-form-param="aprvlDeptId"]').val();
              	  if(aprvlDeptId == "") {
              		  that.$el.find('.CAPWF501-'+target+'-table [data-form-param="deptNm"]').val("");
              	  }
                }
                
                /* ======================================================================== */
                /* 초기화 */
                /* ======================================================================== */
                //기본 그리두 초기화
                , fn_resetBaseArea : function() {
                	var that = this;
                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val("");
                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltNm"]').val("");
                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltDscd"]').val("");
                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlCndUseYn"]').val("");
//                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlDeptId"]').val("");
//                	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlRoleId"]').val("");
//                	that.$el.find('.CAPWF501-base-table [data-form-param="roleNm"]').val("");
//                	that.$el.find('.CAPWF501-base-table [data-form-param="deptNm"]').val("");

                }
                // 상세 그리드 초기화
                , fn_resetDetailGrid : function() {
                	var that = this;
//                	that.CAPWF501DetailGrid.reloadData();
//                	that.CAPWF501DetailGrid.resetData();
                	var contents = that.defalutContents;
                	contents.children = [];
                	contents.mostLowrLvlYn = "Y";
                	contents.aprvlTmpltLvlCd = 0;
                	contents.othrDeptAprvlYn = "N";
                	contents.aprvlCndUseYn = "N";
                	that.$el.find('#CAPWF501-detail-save-button').prop("disabled", false);
                	that.$el.find('#CAPWF501-detail-delete-button').prop("disabled", true);


//                            	contents.aprvlDeptId = $.sessionStorage('deptId');
//                            	contents.deptNm = $.sessionStorage('deptNm');


//                          	  	that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//                          	  	that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').prop("disabled", true);
//                          	  	that.$el.find('.PWF501-detail-table .searchDept-btn').hide();


                	//that.CAPWF501DetailGrid.addField(contents);
                	//that.CAPWF501DetailGrid.grid.getSelectionModel().select(0);
                	that.selectDetailRecord();
                	that.$el.find('.CAPWF501-detail-table [data-form-param="instCd"]').val('');
                	that.$el.find('.CAPWF501-detail-table [data-form-param="seqNbr"]').val('');
                	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltId"]').val('');
                	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltNm"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlDeptId"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="deptNm"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlRoleId"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="roleNm"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val('N');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlCndUseYn"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltDscd"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlLvlNbr"]').val('0');
//              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltLvlCd"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="mostLowrLvlYn"]').val('');
              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="upAprvlLvlNbr"]').val('');
//              	  	that.$el.find('.CAPWF501-detail-table [data-form-param="upAprvlTmpltId"]').val('');
              	  //	that.$el.find('.CAPWF501-detail-table [data-form-param="children"]').val('');
//              	    that.$el.find('.CAPWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val('');

//              	  	that.resetDetailArea();

                }

                /* ======================================================================== */
                /* 그리드생성 */
                /* ======================================================================== */
                // 기본그리드생성
                , createBaseGrid : function() {
                	var that = this;
                    var sParam = {};
//                    sParam.cdNbr = "A1123";
//                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                      // 결재템플릿 기본
    				  //  그리드 컬럼 정의
    	    		  that.CAPWF501BaseGrid = new ExtGrid({
    	    			  fields: ['rowIndex','chkYn', 'instCd', 'aprvlTmpltId', 'aprvlTmpltNm', 'othrDeptAprvlYn', 'aprvlDeptId', 'deptNm'
    	    			           , 'aprvlRoleId', 'roleNm', 'upAprvlLvlNbr', 'mostLowrLvlYn', 'aprvlLvlNbr', 'aprvlTmpltDscd', 'aprvlCndUseYn']
    	    		  		, id: 'CAPWF501BaseGrid'
    	    		  		, columns: [
                                    {
                                        text: 'No.'
                                        , dataIndex: 'rowIndex'
                                        , sortable: false
                                        , width: 40
                                        , height: 25
                                        , style: 'text-align:right', align: 'center'
                                        // other config you need....
                                        , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        	return rowIndex + 1;
                                        }
                                    }
    	    			          // 결재템플릿식별자
    	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltId'), width: 200, dataIndex: 'aprvlTmpltId', style: 'text-align:center', align: 'center'}
    	    			          // 결재템플릿명
    	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltNm'), width: 250, dataIndex: 'aprvlTmpltNm', style: 'text-align:center', align: 'center', flex : 1}
    	    			          // 승인부서식별자 -> 템플릿구분코드
    	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltDscd'), width: 150, dataIndex: 'aprvlTmpltDscd', style: 'text-align:center', align: 'center'}
//    	    			          ,{
//                                      text: bxMsg('cbb_items.AT#aprvlTmpltDscd'),
//                                      width: 120,
//                                      flex :1,
//                                      dataIndex: 'stsCd',
//                                      style: 'text-align:center',
//                                      align: 'left'
//                                      ,
//                                      editor: {
//                                          xtype: 'combobox'
//                                          , store: comboStore3
//                                          , displayField: 'cdNm'
//                                          , valueField: 'cd'
//                                      }
//                                      ,
//                                      renderer: function (val) {
//                                          index = comboStore3.findExact('cd', val);
//                                          if (index != -1) {
//                                              rs = comboStore3.getAt(index).data;
//                                              return rs.cdNm
//                                          }
//                                      } // end of render
//                                  } // end of stsCd
//    	    			          ,{text:bxMsg('cbb_items.AT#deptId'), width: 100, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'left'}
    	    			          // 부서명 -> 결재조건사용여부
    	    			          ,{text:bxMsg('cbb_items.AT#aprvlCndUseYn'), width: 150, dataIndex: 'aprvlCndUseYn', style: 'text-align:center', align: 'center'}
//    	    			          ,{text:bxMsg('cbb_items.AT#deptNm'), width: 200, dataIndex: 'deptNm', style: 'text-align:center', align: 'left'}
    	    			          // 승인역할식별자
//    	    			          ,{text:bxMsg('cbb_items.AT#roleId'), width: 100, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
    	    			          // 역할명
//    	    			          ,{text:bxMsg('cbb_items.AT#roleNm'), width: 200, dataIndex: 'roleNm', style: 'text-align:center', align: 'left'}


    	    			          ,{text:bxMsg('cbb_items.AT#instCd'), width: 200, dataIndex: 'instCd', style: 'text-align:center', align: 'left', hidden :true}
//    	    			          ,{text:bxMsg('cbb_items.AT#othrDeptAprvlYn'), width: 200, dataIndex: 'othrDeptAprvlYn', style: 'text-align:center', align: 'left', hidden :true}
//    	    			          ,{text:bxMsg('cbb_items.AT#upAprvlTmpltId'), width: 200, dataIndex: 'upAprvlTmpltId', style: 'text-align:center', align: 'left', hidden :true}
//    	    			          ,{text:bxMsg('cbb_items.AT#mostLowrLvlYn'), width: 200, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'left', hidden :true}
//    	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltLvlCd'), width: 200, dataIndex: 'aprvlTmpltLvlCd', style: 'text-align:center', align: 'left', hidden :true}


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
//                				  				, selType: 'checkboxmodel'
//                				  				, rowModel: { mode: 'MULTI'}
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
//                	              // 그리드 렌더
    	              
                     // var girdArea = this.$el.find(".CAPWF501-base-grid");

                     // girdArea.html(this.CAPWF501BaseGrid.render({'height': CaGridHeight}));
    	    		  this.$el.find(".CAPWF501-base-grid").html(this.CAPWF501BaseGrid.render({'height': CaGridHeight}));
    	    		  that.CAPWF501BaseGrid.resetData();
                }

                /* ======================================================================== */
                /* 그리드 더블클릭 */
                /* ======================================================================== */
                , selectBaseRecord: function (e) {
                    var that = this;
                    var selectedRecord = that.CAPWF501BaseGrid.grid.getSelectionModel().selected.items[0];
                    
                    console.log(selectedRecord);

                    if (!selectedRecord) {
                        return;
                    } else {
                    	// 하위 조회 태워야 한다.
	                	var that = this;
	                    if (!selectedRecord) {
	                        return;
	                    } else {
	                    	that.$el.find('.CAPWF501-base-table [data-form-param="instCd"]').val(selectedRecord.data.instCd);
	                    	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val(selectedRecord.data.aprvlTmpltId);
	                    	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltNm"]').val(selectedRecord.data.aprvlTmpltNm);
	                    	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltDscd"]').val(selectedRecord.data.aprvlTmpltDscd);
	                    	that.$el.find('.CAPWF501-base-table [data-form-param="aprvlCndUseYn"]').val(selectedRecord.data.aprvlCndUseYn);
//	                  	  	that.$el.find('#CAPWF501-detail-save-button').prop("disabled", false);
	                    	that.browseDetailArea(selectedRecord.data);
	                    }
                    }
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




                	var linkData = {"header": fn_getHeader("CAPWF5018403"), "AprvlTmpltSvcIn": sParam};


                	//ajax 호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true,
                		success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				var tbList = responseData.AprvlTmpltSvcListOut.tblNm;
//                				that.CAPWF501DetailGrid.setStoreRootNode(tbList);
//                				that.CAPWF501DetailGrid.expandAll();

                    			console.log(tbList);

                    			if (tbList != null && tbList.length > 0) {
                    				that.CAPWF501DetailGrid.setData(tbList);
                    				
                    				that.fn_resetDetailGrid();
                    				//마지막 결재레벨번호 셋팅 
                    				var lastAprvlLvl = parseInt(tbList[tbList.length-1].aprvlLvlNbr)+1;
                    				that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlLvlNbr"]').val(lastAprvlLvl);
                    			} else {
                    				that.CAPWF501DetailGrid.resetData();
                    				that.fn_resetDetailGrid();
                    			}
                    			
                    			
                			}
                		}   // end of suucess: fucntion
                	});
                }
                // 상세 그리드 생성
                , createDetailGrid : function() {
                	var that = this;
                	var sParam = {};
                	// 역할상태코드

                	//결재템플릿 역할정보 ( 결재템플릿 명세 )
                	//  그리드 컬럼 정의
                	that.CAPWF501DetailGrid = new ExtGrid({
            		fields: ['rowIndex','instCd', 'seqNbr', 'aprvlTmpltId', 'aprvlTmpltNm', 'othrDeptAprvlYn', 'aprvlDeptId', 'deptNm'
	    			           , 'aprvlRoleId', 'roleNm', 'upAprvlLvlNbr', 'mostLowrLvlYn', 'aprvlLvlNbr', 'children']
            		, id: 'CAPWF501DetailGrid'
            		, expanded: true
            		, columns: [
//                                {
//                                    text: 'No.'
//                                    , dataIndex: 'rowIndex'
//                                    , sortable: false
//                                    , hidden : true
//                                    , width: 40
//                                    , height: 25
//                                    , style: 'text-align:right', align: 'center'
//                                    // other config you need....
//                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
//                                    	return rowIndex + 1;
//                                    }
//                                }
//            		             ,{text:bxMsg('cbb_items.SCRNITM#hrarcyLvl'), xtype: 'treecolumn', width : 100, style: 'text-align:center', height : 25}
	            		         // 결재템플릿식별자
//	  	    			         , {text:bxMsg('cbb_items.AT#aprvlTmpltId'), width: 200, dataIndex: 'aprvlTmpltId', style: 'text-align:center', align: 'left'}
//	  	    			         // 결재템플릿명
//	  	    			         ,{text:bxMsg('cbb_items.AT#aprvlTmpltNm'), width: 250, dataIndex: 'aprvlTmpltNm', style: 'text-align:center', align: 'left', flex : 1}
								// 템플릿레벨번호
								 {text:bxMsg('cbb_items.AT#aprvlLvlNbr'), width: 100, dataIndex: 'aprvlLvlNbr', style: 'text-align:center', align: 'center', height : 25}
	  	    			         // 승인역할식별자
	  	    			         ,{text:bxMsg('cbb_items.AT#roleId'), width: 150, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
	  	    			         // 역할명
	  	    			         ,{text:bxMsg('cbb_items.AT#roleNm'), width: 250, dataIndex: 'roleNm', style: 'text-align:center', align: 'center' , flex : 1}
	  	    			         // 승인부서식별자
	  	    			         ,{text:bxMsg('cbb_items.AT#deptId'), width: 200, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'center'}
	  	    			         // 부서명 
	  	    			         ,{text:bxMsg('cbb_items.AT#deptNm'), width: 250, dataIndex: 'deptNm', style: 'text-align:center', align: 'center', flex : 1}

	  	    			         ,{text:bxMsg('cbb_items.AT#instCd'), width: 200, dataIndex: 'instCd', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#seqNbr'), width: 200, dataIndex: 'seqNbr', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#othrDeptAprvlYn'), width: 200, dataIndex: 'othrDeptAprvlYn', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#upAprvlLvlNbr'), width: 200, dataIndex: 'upAprvlLvlNbr', style: 'text-align:center', align: 'left', hidden :true}
//	  	    			         ,{text:bxMsg('cbb_items.AT#upAprvlTmpltId'), width: 200, dataIndex: 'upAprvlTmpltId', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         ,{text:bxMsg('cbb_items.AT#mostLowrLvlYn'), width: 200, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'left', hidden :true}
//	  	    			         ,{text:bxMsg('cbb_items.AT#aprvlTmpltLvlCd'), width: 200, dataIndex: 'aprvlTmpltLvlCd', style: 'text-align:center', align: 'left', hidden :true}
	  	    			         
	  	    			         //동적 + 버튼
//	  	    			       , {
//	                                 xtype: 'actioncolumn', id: 'tmlayout-actioncolumn', align: 'center', width : 70
//	                                 , style: 'text-align:center'
//	                                 , items: [
//	                                     {
//	                                         icon: 'images/icon/plus-add-16.png'
//	                                         , tooltip: bxMsg('tm-layout.add-child-field')
//	                                         , getClass: function (value, meta, record) {
//	                                     }
//	                                         , handler: function (grid, rowIndex, colIndex, item, e, record) {
//	                                        	 
//	                                        	 if(record.data.aprvlTmpltId != null && record.data.aprvlTmpltId != "") {
//	                                        		 // 기존 데이터의 최하위레벨여부를 N 으로 변경
//		                                        	 record.set("mostLowrLvlYn", "N");
//
//
//		                                        	 var contents = that.defalutContents;
//		                                        	 contents.children = null;
//		                                        	 contents.mostLowrLvlYn = "Y";
//		                                        	 // 기존 결재탬플릿식별자를 추가 하는 상위결재탬플릿식별자로 셋팅
//		                                        	 contents.upAprvlLvlNbr = record.data.aprvlLvlNbr;
//		                                        	 record.set("upAprvlLvlNbr", contents.upAprvlLvlNbr);
//		                                        	 
//		                                        	 record.appendChild(contents);
//		                                             record.data.leaf = false;
//		                                             record.commit();
//		                                             record.expand();
//
//
//		                                             grid.getSelectionModel().select(rowIndex+1);
//		                                             that.selectDetailRecord();
//	                                        	 }
//		                                     }
//	                                     }
////                	                                     , {
////                	                                         icon: 'images/icon/x-delete-16.png'
////                	                                         , tooltip: bxMsg('tm-layout.delete-field')
////                	                                         , handler: function (grid, rowIndex, colIndex, item, e, record) {
////                	                                             if (record.childNodes.length !== 0) {
////                	                                                 alertMessage.error(bxMsg('cbb_err_msg.AUICME0029'));
////                	                                                 return;
////                	                                             }
////                	                                             // 삭제시 상위 가 있으면 상위에 최하위레벨여부를 Y 로 변경
////                	                                             record.destroy();
////                	                                         }
////                	                                     }
//	                                 ]
//	                             }


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
                	//this.$el.find(".CAPWF501-detail-grid").html(this.CAPWF501DetailGrid.render({'height': 122}));
                   var girdArea = this.$el.find(".CAPWF501-detail-grid");

                    girdArea.html(this.CAPWF501DetailGrid.render({'height': CaGridHeight}));
                }
                
                // 상세 그리드 더블클릭
                , selectDetailRecord: function (e) {
                    var that = this;
                    var selectedRecord = that.CAPWF501DetailGrid.grid.getSelectionModel().selected.items[0];
//          	  	console.log("selectedRecord Detail data");
//          	    console.log(selectedRecord);
                    
                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="instCd"]').val(selectedRecord.data.instCd);
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="seqNbr"]').val(selectedRecord.data.seqNbr);
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltId"]').val(selectedRecord.data.aprvlTmpltId);
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltNm"]').val(selectedRecord.data.aprvlTmpltNm);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlDeptId"]').val(selectedRecord.data.aprvlDeptId);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="deptNm"]').val(selectedRecord.data.deptNm);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlRoleId"]').val(selectedRecord.data.aprvlRoleId);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="roleNm"]').val(selectedRecord.data.roleNm);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val(selectedRecord.data.othrDeptAprvlYn);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlLvlNbr"]').val(selectedRecord.data.aprvlLvlNbr);
//                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltLvlCd"]').val(selectedRecord.data.aprvlTmpltLvlCd);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="mostLowrLvlYn"]').val(selectedRecord.data.mostLowrLvlYn);
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="upAprvlLvlNbr"]').val(selectedRecord.data.upAprvlLvlNbr);
//                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="upAprvlTmpltId"]').val(selectedRecord.data.upAprvlTmpltId);
//                  	  	if(selectedRecord.data.children.length!=null){
//                  	  		that.$el.find('.CAPWF501-detail-table [data-form-param="children"]').val(selectedRecord.data.children.length);
//                  	  	}
                  	  	that.$el.find('.CAPWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val(selectedRecord.data.othrDeptAprvlYn);

                  	 //$('input:radio[name="othrDeptAprvlYn"]:input[value="'+selectedRecord.data.othrDeptAprvlYn+'"]').prop("checked", true);


//                  	  	if(selectedRecord.data.children.length > 0) {
//                  	  		that.$el.find('#CAPWF501-detail-delete-button').prop("disabled", true);
//                  	  	}
//                  	  	else {
//                  	  		that.$el.find('#CAPWF501-detail-delete-button').prop("disabled", false);
//                  	  	}


                  	  	that.$el.find('#CAPWF501-detail-save-button').prop("disabled", false);


//                  	  	if(selectedRecord.data.othrDeptAprvlYn == "Y") {
//                  	  		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", false);
//                  	  		that.$el.find('.PWF501-detail-table .searchDept-btn').show();
//                  	  	}
//                  	  	else {
//                  	  		that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//                  	  		that.$el.find('.PWF501-detail-table .searchDept-btn').hide();
//                  	  	}


                    }
                }
                /**
                 * render
                 */
                , render: function () {

                	this.setComboBoxes();
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPWF501-wrap #btn-CAPWF501-detail-grid-save')
                                        		,this.$el.find('.CAPWF501-wrap #btn-CAPWF501-detail-grid-delete')
                                        		,this.$el.find('.CAPWF501-wrap #btn-base-save')
                                        		,this.$el.find('.CAPWF501-wrap #btn-base-delete')
                                        			   ]);
                    return this.$el;
                }
               
                // 상세부초기화
                , resetDetailArea: function () {
              	  var that = this;

//              	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').val($.sessionStorage('deptId'));
//              	  that.$el.find('.PWF501-detail-table [data-form-param="aprvlDeptId"]').prop("disabled", true);
//              	  that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').val($.sessionStorage('deptNm'));
//              	  that.$el.find('.PWF501-detail-table [data-form-param="deptNm"]').prop("disabled", true);
//              	  that.$el.find('.PWF501-detail-table .searchDept-btn').hide();

              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlLvlNbr"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltId"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltNm"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlDeptId"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="deptNm"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlRoleId"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="roleNm"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="mostLowrLvlYn"]').val("");

             	//  $('input:radio[name="othrDeptAprvlYn"]:input[value="N"]').prop("checked", true);
//              	  that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltLvlCd"]').val("0");
//              	  that.$el.find('.CAPWF501-detail-table [data-form-param="children"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="instCd"]').val("");
              	  that.$el.find('.CAPWF501-detail-table [data-form-param="seqNbr"]').val("");


              	  that.$el.find('#CAPWF501-detail-save-button').prop("disabled", true);
              	  that.$el.find('#CAPWF501-detail-delete-button').prop("disabled", true);
                }
                 /**
                 * 엔터 입력 처리를 위한 콜백함수
                 */
                ,fn_enter: function (event) {
	                var that = this;
                    var event = event || window.event;
                    var keyID = (event.which) ? event.which : event.keyCode;
                    if(keyID == 13) { //enter
                    	that.browseBaseArea();
                    }
                }
                
                ,setComboBoxes: function () {
                    var sParam = {};

                    sParam = {};
                    sParam.className = "CAPWF501-othrDeptAprvlYn-wrap";
                    sParam.targetId = "othrDeptAprvlYn";
                    sParam.nullYn = "N";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "10000";
                    fn_getCodeList(sParam, this);   // 속성타입코드]
                    
                    var sParam = {};

                    sParam = {};
                    sParam.className = "CAPWF501-aprvlTmpltDscd-wrap";
                    sParam.targetId = "aprvlTmpltDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A1123";
                    fn_getCodeList(sParam, this);   // 속성타입코드]
                    
                    var sParam = {};

                    sParam = {};
                    sParam.className = "CAPWF501-aprvlCndUseYn-wrap";
                    sParam.targetId = "aprvlCndUseYn";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "10000";
                    fn_getCodeList(sParam, this);   // 속성타입코드]
                }
                
                /**
                 * 입력 length 체크
                 */
                ,pressInputLengthChk: function (event) {
	                var that = this;
                    var targetValue = event.target.value;
                    if(targetValue.length >= 10){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="stdEngAbrvtnNm"]').val(targetValue.substring(0,5));
                    	return;
                    }




                }


                /**
                 * 기본부 초기화 - 없는 param : 삭제예정
                 */
//                , resetBaseArea: function () {
//                    var that = this;
//
//
//                    that.$el.find('.CAPWF501-base-table [data-form-param="abrvtnDmnGrpCd"]').val("");
//                    that.$el.find('.CAPWF501-base-table [data-form-param="dmnNm"]').val("");
//                    that.$el.find('.CAPWF501-base-table [data-form-param="atrbtDmnEngNm"]').val("");
//                    that.$el.find('.CAPWF501-base-table [data-form-param="loginLngDmn"]').val("");
//
//
//                    that.CAPWF501BaseGrid.resetData();
//                }


                //상세부 초기화 - 중복코드:삭제예정
//                , resetDetailArea : function() {
//                	var that = this;
//
//
//                	that.$el.find('.CAPWF501-detail-table [data-form-param="abrvtnDmnGrpCd"]').val("");
//                	that.$el.find('.CAPWF501-detail-table [data-form-param="dmnNm"]').val("");
//                	that.$el.find('.CAPWF501-detail-table [data-form-param="atrbtDmnEngNm"]').val("");
//
//
//                	that.$el.find('.CAPWF501-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
//                	that.$el.find('.CAPWF501-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
//                	that.$el.find('.CAPWF501-detail-table #btn-CAPWF501-stdAbrvtn').show();
//
//
//                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , browseBaseArea: function () {
                    var that = this;
                    var sParam = {};

                    if(that.instCd == "") {
                		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                		return;
                	}

                    sParam.instCd = that.instCd;
                    sParam.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
                    sParam.aprvlTmpltNm = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltNm"]').val();
                    sParam.aprvlTmpltDscd = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltDscd"]').val();
                    sParam.aprvlCndUseYn = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlCndUseYn"]').val();


                    var linkData = {"header": fn_getHeader("CAPWF5018401"), "AprvlTmpltSvcIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                    	success: function (responseData) {
                    		if (fn_commonChekResult(responseData)) {
                            	console.log(JSON.stringify(linkData));
                    			console.log(responseData);
                    			var tbList = responseData.AprvlTmpltSvcListOut.tblNm;


                    			if (tbList != null && tbList.length > 0) {
                    				that.CAPWF501BaseGrid.setData(tbList);
                    			} else {
                    				that.CAPWF501BaseGrid.resetData();
                    			}
                    			that.CAPWF501DetailGrid.resetData();
                    			that.fn_resetDetailGrid();
//                    			that.CAPWF501DetailGrid.reloadData();
                    		}
                    	}   // end of suucess: fucntion
                    });
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (param) {
                    var that = this;
                    var sParam = {};


                    if(that.instCd == "") {
                		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                		return;
                	}


                    sParam.instCd = that.instCd;
                    sParam.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
                    sParam.aprvlTmpltNm = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltNm"]').val();
                    sParam.aprvlTmpltDscd = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltDscd"]').val();
                    sParam.aprvlCndUseYn = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlCndUseYn"]').val();


                    var linkData = {"header": fn_getHeader("CAPWF5018401"), "AprvlTmpltSvcIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                    	success: function (responseData) {
                    		if (fn_commonChekResult(responseData)) {
                    			var tbList = responseData.AprvlTmpltSvcListOut.tblNm;


                    			if (tbList != null && tbList.length > 0) {
                    				that.CAPWF501BaseGrid.setData(tbList);
                    			} else {
                    				that.CAPWF501BaseGrid.resetData();
                    			}
//                    			that.CAPWF501DetailGrid.reloadData();
                    			that.CAPWF501DetailGrid.resetData();
                    			that.fn_resetDetailGrid();
                    		}
                    	}   // end of suucess: fucntion
                    });
                } // end
                
                /* ======================================================================== */
                /* 결재탬플릿기본 삭제 */
                /* ======================================================================== */
	             , fn_deleteBase : function() {
	            	 var that = this;
	            	 var param = {};
	
	 				//배포처리[과제식별자 체크]
	                 if (!fn_headerTaskIdCheck()){
	                     return;
	                 }
	                 param.instCd = $.sessionStorage('headerInstCd');
	            	 param.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
	
	            	 
	                 // 삭제
	                 var linkData = {"header": fn_getHeader("CAPWF5018302"), "AprvlTmpltSvcIn": param};
	
	                 // ajax호출
	                 bxProxy.post(sUrl, JSON.stringify(linkData), {
	                     enableLoading: true,
	                     success: function (responseData) {
	                         if (fn_commonChekResult(responseData)) {
	                             alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
	                             that.browseBaseArea(); //조회
	                             that.fn_resetDetailGrid();
	                         }
	                     }   // end of suucess: fucntion
	                 });     // end of bxProxy
	             }

                /* ======================================================================== */
                /* 결재템플릿 기본 저장 */
                /* ======================================================================== */
                , fn_saveBase : function() {
               	 var that = this;
               	 var param = {};
               	 
 				//배포처리[과제식별자 체크]
                 if (!fn_headerTaskIdCheck()){
                     return;
                 }
               	 param.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
               	 param.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
               	 param.aprvlTmpltNm = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltNm"]').val();
               	 param.aprvlCndUseYn = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlCndUseYn"]').val();
               	 param.aprvlTmpltDscd = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltDscd"]').val();
               	 param.lastChngId = $.sessionStorage('staffId');

               	 var linkData = {"header": fn_getHeader("CAPWF5018102"), "AprvlTmpltMSvcSaveIn": param};
                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                                that.fn_resetBaseArea();
                                that.browseBaseArea(); //조회
                                that.selectBaseRecord();
                                that.fn_resetBaseArea();
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
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
//	            	 var children = that.$el.find('.CAPWF501-detail-table [data-form-param="children"]').val();
//	                 if (children != 0) {
//	                	 alertMessage.error(bxMsg('cbb_err_msg.AUICME0029'));
//	                	 return;
//	                 }
	                 
	 				//배포처리[과제식별자 체크]
	                 if (!fn_headerTaskIdCheck()){
	                     return;
	                 }
//	                 param.instCd = that.$el.find('.CAPWF501-detail-table [data-form-param="instCd"]').val();
	                 param.instCd = $.sessionStorage('headerInstCd');
	                 param.seqNbr = that.$el.find('.CAPWF501-detail-table [data-form-param="seqNbr"]').val();
	            	 param.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
	            	 
	            	 console.log("delete param check");
	            	 console.log(param);
	                 // 삭제
	                 var linkData = {"header": fn_getHeader("CAPWF5018301"), "AprvlTmpltSvcIn": param};
	
	
	                 // ajax호출
	                 bxProxy.post(sUrl, JSON.stringify(linkData), {
	                     enableLoading: true,
	                     success: function (responseData) {
	                         if (fn_commonChekResult(responseData)) {
	                             alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
	                             that.selectBaseRecord();
//	                             that.browseBaseArea(); //조회
//	                             that.fn_resetDetailGrid();
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
               	 
 				//배포처리[과제식별자 체크]
                 if (!fn_headerTaskIdCheck()){
                     return;
                 }
               	// param.instCd = that.$el.find('.CAPWF501-detail-table [data-form-param="instCd"]').val();
               	 param.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
               	 param.aprvlTmpltId = that.$el.find('.CAPWF501-base-table [data-form-param="aprvlTmpltId"]').val();
               	 param.seqNbr = that.$el.find('.CAPWF501-detail-table [data-form-param="seqNbr"]').val();
               	 param.aprvlLvlNbr = that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlLvlNbr"]').val();
               	 param.aprvlDeptId = that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlDeptId"]').val();
               	 param.aprvlRoleId = that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlRoleId"]').val();
               	 param.othrDeptAprvlYn = that.$el.find('.CAPWF501-detail-table [data-form-param="othrDeptAprvlYn"]').val();
               	 param.lastChngId = $.sessionStorage('staffId');
//               	 param.aprvlTmpltLvlCd = that.$el.find('.CAPWF501-detail-table [data-form-param="aprvlTmpltLvlCd"]').val();
//               	 if(param.aprvlTmpltLvlCd == "" || param.aprvlTmpltLvlCd == null) {
//               		 param.aprvlTmpltLvlCd = 0;
//               	 }
	           	 
               	 //2017.10.11 aprvlLvl을 입력받는 것으로 변경
//               	 param.mostLowrLvlYn = that.$el.find('.CAPWF501-detail-table [data-form-param="mostLowrLvlYn"]').val();
//               	 param.upAprvlLvlNbr = that.$el.find('.CAPWF501-detail-table [data-form-param="upAprvlLvlNbr"]').val();
//               	 if(param.upAprvlLvlNbr == "" || param.upAprvlLvlNbr == null) {
//               		 param.aprvlLvlNbr = 0;
//               		 param.upAprvlLvlNbr = null;
//               		 param.mostLowrLvlYn = "Y";
//               	 }else{
//               		var tmpUpAprvlLvlNbr = param.upAprvlLvlNbr;
//               		tmpUpAprvlLvlNbr *= 1;
//               		param.aprvlLvlNbr = tmpUpAprvlLvlNbr+1;
//               	 }
               	
               	 console.log("check param");
               	 console.log(param);

               	 var linkData = {"header": fn_getHeader("CAPWF5018101"), "AprvlTmpltSvcSaveIn": param};
                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));
                              //  that.browseBaseArea(); //조회
                                that.selectBaseRecord();
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                }
                

                // 그리드 저장(삭제)버튼 클릭
                , clickDeleteGrid : function(event) {
                	if(this.deleteList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteGrid, this);
                } 


                // 그리드 삭제
                , deleteGrid : function(that) {
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.atrbtDmnNm = data.atrbtDmnNm;
                			delParam.atrbtDmnEngNm = data.atrbtDmnEngNm;
                			tbl.push(delParam);
                		});


                		sParam.tblNm = tbl;


                		var linkData = {"header": fn_getHeader("CAPCM0198401"), "CaDmnMgmtSvcListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.browseBaseArea();
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
                	}


                }


                // 상세 저장 버튼 클릭
                , clickSaveDetail : function(event) {
                 	if($.sessionStorage('staffId') !="0000000002" && $.sessionStorage('staffId') !="0000000214" && $.sessionStorage('staffId') !="000000000001210"  ){
                		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0060'));
                		return;
                	}
                 	
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


                // 상세 저장
                , saveDetail : function(that) {


                	 var sParam = {};
                	 var srvcCd = "CAPCM0198201";
                     
                     sParam.atrbtDmnNm = that.$el.find('.CAPWF501-detail-table [data-form-param="dmnNm"]').val(); // 도메인명
                     sParam.atrbtDmnGrpCd = that.$el.find('.CAPWF501-detail-table [data-form-param="abrvtnDmnGrpCd"]').val(); // 도메인그룹코드
                     sParam.atrbtDmnEngNm = that.$el.find('.CAPWF501-detail-table [data-form-param="atrbtDmnEngNm"]').val(); // 속성영문명

                     var linkData = {"header": fn_getHeader(srvcCd), "CaDmnMgmtSvcIn": sParam};


                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	 that.browseBaseArea();

                             }
                         }
                     });
                }


                //약어명 생성 Btn click
                , fn_createStdAbrvtn: function () {
                    var that = this;
                    var sParam = {};


                    // 영문단어명 뺴고 초기화
                    that.$el.find('.CAPWF501-detail-table [data-form-param="stdEngAbrvtnNm"]').val("");
                	that.$el.find('.CAPWF501-detail-table [data-form-param="koreanNm"]').val("");
                	that.$el.find('.CAPWF501-detail-table [data-form-param="chineseNm"]').val("");


                	that.$el.find('.CAPWF501-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
                	that.$el.find('.CAPWF501-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
                	that.$el.find('.CAPWF501-detail-table #btn-CAPWF501-stdAbrvtn').show();


                    //서비스 개별부 set
                    sParam.engWrdNm = that.$el.find('.CAPWF501-detail-table [data-form-param="engWrdNm"]').val();


                    var linkData = {"header": fn_getHeader("CAPWF5018402"), "StdAbrvtnMgmtSvcCofirmStdAbrvtnIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                        success: function (responseData) {


                            if (fn_commonChekResult(responseData)) {
                                var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;


                                if (!fn_isNull(cofirmStdAbrvtnOut) && !fn_isNull(cofirmStdAbrvtnOut.stdEngAbrvtnNm)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    that.$el.find('.CAPWF501-detail-table [data-form-param="stdEngAbrvtnNm"]').val(cofirmStdAbrvtnOut.stdEngAbrvtnNm);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                }


                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPWF501-grid").html(this.CAPWF501Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPWF501Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="abrvtnDmnGrpCd"]').val(selectedRecord.data.atrbtDmnGrpCd);
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="dmnNm"]').val(selectedRecord.data.atrbtDmnNm);
                    	that.$el.find('.CAPWF501-detail-table [data-form-param="atrbtDmnEngNm"]').val(selectedRecord.data.atrbtDmnEngNm);
                    }
                }


                // 조회조건영역 toggle
                , baseSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#search-area", this.$el.find("#btn-base-search-modal"));
                }


                // 그리드영역 toggle
                , baseGridModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPWF501-base-grid", this.$el.find("#btn-up-grid-base"));
                }
                
                // 그리드영역 toggle
                , fn_detailGridModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPWF501-detail-grid", this.$el.find("#btn-up-grid-detail"));
                }


                // 상세영역 toggle
                , fn_detailToggle : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPWF501-detail-table", this.$el.find("#btn-detail-modal"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPWF501Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPWF501')+"_"+getCurrentDate("yyyy-mm-dd"));
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


              	  var aprvlDeptId = that.$el.find('.CAPWF501-'+target+'-table [data-form-param="aprvlDeptId"]').val();
              	  if(aprvlDeptId == "") {
              		  that.$el.find('.CAPWF501-'+target+'-table [data-form-param="deptNm"]').val("");
              	  }
                }
            })
            ; // end of Backbone.View.extend({


        return CAPWF501View;
    } // end of define function
)
; // end of define
