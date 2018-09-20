/*
@Screen number 
@brief          결재탬플릿팝업
@author         youngjoo.lee
@history        2015.11.18      생성
*/
define(
    [     	
         'bx/common/config'
        , 'bx-component/popup/popup'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx-component/message/message-alert'
        , 'bx/common/common-info'
        , 'bx-component/message/message-confirm'
        , 'text!app/views/page/popup/CAPCM/popup-aprvlTmplt.html'
//        , 'app/views/page/popup/CAPAT/popup-brnchCd'
      
    ]
    , function (config
    	, Popup
    	, ExtGrid
        , ExtTreeGrid
        , alertMessage
        , commonInfo
        , confirmMessage
//        , popupDeptId
        , tpl) {


        var popupAprvlTmpltSearch = Popup.extend({

            // 스타일 설정
        	 attributes: {
                'style': 'width: 1000px; height: 800px;'
            }


        	// 탬플릿 설정
        	, templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                'click #btn-search-condition-reset': 'refresh'
                ,'click #btn-search-condition-inquire': 'browseBaseArea'
				, 'click #btn-popup-cancel': 'close'
                , 'click #btn-popup-select': 'selectDetailRecord'
//                , 'click .searchDept-btn': 'fn_popDept'
            }


            , initialize: function (initParam) {
                var that = this;
                that.$el.html(that.tpl());
                that.enableDim = true;


                that.instCd = commonInfo.getInstInfo().instCd;


                if (!that.instCd) {
                    that.instCd = $.sessionStorage('headerInstCd');
                }
//                else {
//                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
//                    that.instCd = "";
//                }


                that.createBaseGrid(); // 기본 생성
                


            //    that.defalutContents = {"aprvlTmpltId":"", "aprvlTmpltNm":"", "deptId":"", "deptNm":"", "roleId":"", "roleNm":"", "instCd":that.instCd, "othrDeptAprvlYn":"", "upAprvlTmpltId":"", "mostLowrLvlYn":"", "aprvlTmpltLvl":""};


                that.show();
            }


            , render: function () {
            	var that = this;


                that.resetBaseArea();

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
	    		  that.baseGrid = new ExtGrid({
	    			  fields: ['rowIndex','instCd', 'aprvlTmpltId', 'aprvlTmpltNm', 'othrDeptAprvlYn', 'aprvlDeptId', 'deptNm'
	    			           , 'aprvlRoleId', 'roleNm', 'upAprvlTmpltId', 'mostLowrLvlYn', 'aprvlTmpltLvl', 'aprvlTmpltDscd', 'aprvlCndUseYn']
	    		  		, id: 'baseGrid'
	    		  		, columns: [
                                {
                                    text: 'No.'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , width: 50
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
	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltNm'), width: 200, dataIndex: 'aprvlTmpltNm', style: 'text-align:center', align: 'center', flex : 1
//	    			        	,editor: {
//                                    xtype: 'combobox',
//                                    store: that.comboStore1,
//                                    displayField: 'cdNm',
//                                    valueField: 'cd'
//                                }
//                                ,renderer: function (val) {
//                                        index = that.comboStore1.findExact('cd', val);
//                                        if (index != -1) {
//                                            rs = that.comboStore1.getAt(index).data;
//                                            var classNm = "s-no";
//                                            var val = rs.cd;
//
//                                            if (val == "Y") {
//                                                classNm = "s-yes";
//                                            }
//                                            return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
//                                        }
//                                    } // end of render  
	    			          }
//	    			          // 승인부서식별자
//	    			          ,{text:bxMsg('cbb_items.AT#deptId'), width: 100, dataIndex: 'aprvlDeptId', style: 'text-align:center', align: 'left'}
//	    			          // 부서명
//	    			          ,{text:bxMsg('cbb_items.AT#deptNm'), width: 200, dataIndex: 'deptNm', style: 'text-align:center', align: 'left'}
//	    			          // 승인역할식별자
//	    			          ,{text:bxMsg('cbb_items.AT#roleId'), width: 100, dataIndex: 'aprvlRoleId', style: 'text-align:center', align: 'center'}
//	    			          // 역할명
//	    			          ,{text:bxMsg('cbb_items.AT#roleNm'), width: 200, dataIndex: 'roleNm', style: 'text-align:center', align: 'left'}
	    			          
	    			          // 결재템플릿구분코드
	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltDscd'), width: 200, dataIndex: 'aprvlTmpltDscd', style: 'text-align:center', align: 'center'}
	    			          // 결재조건사용여부
	    			          ,{text:bxMsg('cbb_items.AT#aprvlCndUseYn'), width: 200, dataIndex: 'aprvlCndUseYn', style: 'text-align:center', align: 'center'}

	    			          ,{text:bxMsg('cbb_items.AT#instCd'), width: 0, dataIndex: 'instCd', style: 'text-align:center', align: 'left', hidden :true}
	    			          ,{text:bxMsg('cbb_items.AT#lastChngId'), width: 0, dataIndex: 'lastChngId', style: 'text-align:center', align: 'left', hidden :true}
//	    			          ,{text:bxMsg('cbb_items.AT#othrDeptAprvlYn'), width: 200, dataIndex: 'othrDeptAprvlYn', style: 'text-align:center', align: 'left', hidden :true}
//	    			          ,{text:bxMsg('cbb_items.AT#upAprvlTmpltId'), width: 200, dataIndex: 'upAprvlTmpltId', style: 'text-align:center', align: 'left', hidden :true}
//	    			          ,{text:bxMsg('cbb_items.AT#mostLowrLvlYn'), width: 200, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'left', hidden :true}
//	    			          ,{text:bxMsg('cbb_items.AT#aprvlTmpltLvl'), width: 200, dataIndex: 'aprvlTmpltLvl', style: 'text-align:center', align: 'left', hidden :true}


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
		                   			element: 'body',
		                   			fn: function(_this, cell, rowIndex, eOpts) {
		                   				//that.selectBaseRecord();
		                   			}
		                   		}
		                	  , dblclick: {
		                   			element: 'body',
		                   			fn: function(_this, cell, rowIndex, eOpts) {
		                   				that.selectDetailRecord();
		                   			}
		                   		}




		                   	}
	               });
//	              // 그리드 렌더
	              that.$el.find(".base-grid").html(that.baseGrid.render({'height': "450px"}));
	              that.baseGrid.resetData();
            }

/* ======================================================================== */
/* 조회 */
/* ======================================================================== */
            , browseBaseArea: function () {
                var that = this;
                var sParam = {};


//                alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'), "error");


//                confirmMessage.render(bxMsg('main.sign-out-msg'), function () {
//                	
//                }


                if(that.instCd == "") {
            		alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
            		return;
            	}


                sParam.instCd = that.instCd;
                sParam.aprvlTmpltId = that.$el.find('#search-condition-area [data-form-param="aprvlTmpltId"]').val();
                sParam.aprvlTmpltNm = that.$el.find('#search-condition-area [data-form-param="aprvlTmpltNm"]').val();
//                sParam.aprvlDeptId = that.$el.find('#search-condition-area [data-form-param="aprvlDeptId"]').val();


                var linkData = {"header": fn_getHeader("CAPWF5018401"), "AprvlTmpltSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                	enableLoading: true,
                	success: function (responseData) {
                		
                		console.log(responseData);
                		
                		if (fn_commonChekResult(responseData)) {
                			var tbList = responseData.AprvlTmpltSvcListOut.tblNm;


                			if (tbList != null && tbList.length > 0) {
                				that.baseGrid.setData(tbList);
                			} else {
                				that.baseGrid.resetData();
                			}
                		}
                	}   // end of suucess: fucntion
                });
            }
/* ======================================================================== */
/* 그리드 더블클릭 */
/* ======================================================================== */

            , selectDetailRecord: function (e) {
                var that = this;
                var selectedRecord = that.baseGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedRecord) {
                    return;
                } else {
                	param = selectedRecord.data;
                	console.log(param);
                	this.trigger('popUpSetData', param);
                    this.close();
                }
            }

/* ======================================================================== */
/* 초기화 */
/* ======================================================================== */

            , refresh : function() {
            	  var that = this;
            	  that.resetBaseArea();
            	  that.baseGrid.resetData();
              }          


              // 기본부초기화
              , resetBaseArea: function () {
                  var that = this;


                  that.$el.find('.search-condition-area [data-form-param="aprvlTmpltId"]').val("");
                  that.$el.find('.search-condition-area [data-form-param="aprvlTmpltNm"]').val("");
              }

              , afterClose: function () {
                  this.remove();
              }
              
//              , fn_popDept: function(event){
////              	var id = event.currentTarget.id;
//
//
//  				var that = this;
//  				var param = {};
//  				param.instCd = that.instCd;
////  				param.gridType = 'tree';
////  				param.deptOrgnztnRelCd = '01';
//  				param.dtogRelCd = '01'; //기본조직
//
//  			    var popDeptIdObj = new popupDeptId(param);
//
//
//  			    popDeptIdObj.render();
//  			    popDeptIdObj.on('popUpSetData', function (param) {
//  			    	that.$el.find('#search-condition-area [data-form-param="aprvlDeptId"]').val(param.brnchCd);
////  			    	that.$el.find('.CAPWF501-'+id+'-table [data-form-param="deptNm"]').val(param.brnchNm);
//  			    });
//  			}
        }); // end of Backbone.View.extend({


        return popupAprvlTmpltSearch;
    } // end of define function
); // end of define
