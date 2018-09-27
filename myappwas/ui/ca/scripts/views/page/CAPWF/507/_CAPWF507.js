define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPWF/507/_CAPWF507.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPCM/popup-aprvlTmplt'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , popupService
        , commonInfo
        , popupAprvlTmplt
        ) {


    	  var chkAddCol = false;
        /**
         * Backbone
         */
        var CAPWF507View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPWF507-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'fn_enter'

            		, 'click #btn-service-search': 'popServiceSrch'
            		, 'click #btn-aprvlTemplt-search' : 'popupAprvlTempltSrch'
                    , 'click #btn-base-reset': 'clickResetBaseArea'
                	, 'click #btn-base-search': 'inquiryBaseData'
            		, 'click #btn-base-delete': 'clickDeleteBase'
                	, 'click #btn-base-search-modal': 'baseSearchModal'
        			, 'click #btn-mltLng': 'openPage'


        			, 'click #btn-CAPWF507-grid-save': 'clickSaveGrid'
        			, 'click #btn-CAPWF507-grid-excel': 'gridExcel'
    				, 'click #btn-CAPWF507-grid-add': 'addGrid'
					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'
                }


//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    // 왼쪽 트리 생성
                    that.fn_createTree();


                    // 콤보조회 서비스호출 준비
                    var sParam = {};


                    // 콤보조회 서비스호출 준비
                    var sParam = {};


                    // 결재사유코드
                    sParam = {};
                    sParam.cdNbr = "12303";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    // 결재패턴구분코드
                    sParam = {};
                    sParam.cdNbr = "12302";
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    // 결재조건상태코드
                    sParam = {};
                    sParam.cdNbr = "12307";
                    var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

                    /* ========================================================== */
                    bxProxy.all([
                        /* ========================================================== */
                        // 결재사유코드콤보로딩
                        {
                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                            if (!responseData.header.errorMessageProcessed) {
                                comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                        }
                        // 결재패턴구분코드콤보로딩
                        , {
                            url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                if (!responseData.header.errorMessageProcessed) {
                                    comboStore2 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm'],
                                        data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                    });
                                }
                            }
                        }
                        // 결재조건상태코드콤보로딩
                        , {
                            url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
                                if (!responseData.header.errorMessageProcessed) {
                                    comboStore3 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm'],
                                        data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                    });
                                }
                            }
                        }
                    ], {
                            success: function () {
                                that.CAPWF507Grid = new ExtGrid({
                                    /* ------------------------------------------------------------ */
                                    // 단일탭 그리드 컬럼 정의
                                    fields: ['rowIndex', 'aprvlCndNbr', 'srvcCd', 'srvcNm', 'aprvlRsnCd', 'aprvlPtrnDscd', 'aprvlTmpltId', 'stsCd']
                                    , id: 'CAPWF507Grid'
                                    , columns: [
                                        {
                                            text: 'No.'
                                            , dataIndex: 'rowIndex'
                                            , sortable: false
                                            , width: 30
                                            , height: 25
                                            , style: 'text-align:right', align: 'center'
                                            // other config you need....
                                            , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                            	return rowIndex + 1;
                                            }
                                        }
                                        , {
                                            text: bxMsg('cbb_items.AT#aprvlCndNbr'),
                                            width: 120,
                                            dataIndex: 'aprvlCndNbr',
                                            editor: 'textfield',
                                            style: 'text-align:center',
                                            align: 'left'
                                        }
                                        , {
                                            text: bxMsg('cbb_items.AT#srvcCd'),
                                            width: 100,
                                            dataIndex: 'srvcCd',
                                            editor: 'textfield',
                                            style: 'text-align:center',
                                            align: 'center',
                                            flex: 1
                                        }
                                        , {
                                            text: bxMsg('cbb_items.AT#srvcNm'),
                                            width: 170,
                                            dataIndex: 'srvcNm',
                                            editor: 'textfield',
                                            style: 'text-align:center',
                                            flex: 1
                                        }
                                        , {
                                            text: bxMsg('cbb_items.AT#aprvlRsnCd'),
                                            width: 130,
                                            dataIndex: 'aprvlRsnCd',
                                            style: 'text-align:center',
                                            align: 'left'
                                            ,
                                            editor: {
                                                xtype: 'combobox'
                                                , store: comboStore1
                                                , displayField: 'cdNm'
                                                , valueField: 'cd'
                                            }
                                            ,
                                            renderer: function (val) {
                                                index = comboStore1.findExact('cd', val);
                                                if (index != -1) {
                                                    rs = comboStore1.getAt(index).data;
                                                    return rs.cdNm
                                                }
                                            } // end of render
                                        } // end of aprvlRsnCd
                                        , {
                                            text: bxMsg('cbb_items.AT#aprvlPtrnDscd'),
                                            width: 120,
                                            hidden: true,
                                            dataIndex: 'aprvlPtrnDscd',
                                            style: 'text-align:center',
                                            align: 'left'
                                            ,
                                            editor: {
                                                xtype: 'combobox'
                                                , store: comboStore2
                                                , displayField: 'cdNm'
                                                , valueField: 'cd'
                                            }
                                            ,
                                            renderer: function (val) {
                                                index = comboStore2.findExact('cd', val);
                                                if (index != -1) {
                                                    rs = comboStore2.getAt(index).data;
                                                    return rs.cdNm
                                                }
                                            } // end of render
                                        } // end of aprvlPtrnDscd
                                        , {
                                            text: bxMsg('cbb_items.AT#aprvlTmpltId'),
                                            width: 200,
                                            dataIndex: 'aprvlTmpltId',
                                            editor: 'textfield',
                                            style: 'text-align:center',
                                            flex: 1
                                        }
                                        , {
                                            text: bxMsg('cbb_items.AT#stsCd'),
                                            width: 120,
                                            flex :1,
                                            dataIndex: 'stsCd',
                                            style: 'text-align:center',
                                            align: 'left'
                                            ,
                                            editor: {
                                                xtype: 'combobox'
                                                , store: comboStore3
                                                , displayField: 'cdNm'
                                                , valueField: 'cd'
                                            }
                                            ,
                                            renderer: function (val) {
                                                index = comboStore3.findExact('cd', val);
                                                if (index != -1) {
                                                    rs = comboStore3.getAt(index).data;
                                                    return rs.cdNm
                                                }
                                            } // end of render
                                        } // end of stsCd
                                    ] // end of columns
                                    , listeners: {
                                        dblclick: {
                                            element: 'body',
                                            fn: function () {
                                                /**
                                                 * @type            - 'open-conts-page' 이벤트는 페이지 이동 이벤트 ('libs/bx/bx-frame/views/workspace.js' 에서 처리)
                                                 * @pageHandler     - 이동할 페이지 핸들러명 ('scripts/views/main.js'의 pageSrcMap 참고)
                                                 * @pageDPName      - 새로 추가될 탭 명
                                                 * @pageInitialize  - 페이지 초기화 여부
                                                 * @pageRenderInfo  - 초기화할때 전달할 인자, ('scripts/views/test/excel-test/_excel-test.js' 의 initialize 메소드 참고)
                                                 */
                                                var selectedRecord = that.CAPWF507Grid.grid.getSelectionModel().selected.items[0];
                                                if (!selectedRecord) {
                                                    return;
                                                } else {
                                                    var aprvlCndNbr = selectedRecord.data.aprvlCndNbr;


                                                    that.$el.trigger({
                                                        type: 'open-conts-page',
                                                        pageHandler: 'CAPWF508',
                                                        pageDPName: bxMsg('cbb_items.SCRN#CAPWF508'),
                                                        pageInitialize: true,
                                                        pageRenderInfo: {
                                                            aprvlCndNbr: aprvlCndNbr
                                                            , aprvlCndDstnctnCd: "02"
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }




                                });
                                // 단일탭 그리드 렌더
                                that.createGrid();


                            } // end of success:.function
                        }); // end of bxProxy.all
                }


//
//
//
                , render: function () {
                    var that = this;


                    // hidden필드 셋팅
                    //aprvlPtrnDscd
                    // 콤보데이터 로딩
                    var sParam;


                    //결재사유코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF507-aprvlRsnCd-wrap";
                    sParam.targetId = "aprvlRsnCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "12303";
                    fn_getCodeList(sParam, this);


//                    sParam = {};
//                    //결재패턴구분코드
//                    sParam = {};
//                    selectStyle = {};
//                    sParam.className = "CAPWF507-aprvlPtrnDscd-wrap";
//                    sParam.targetId = "aprvlPtrnDscd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
//                    sParam.cdNbr = "12302";
//                    fn_getCodeList(sParam, this);

                    sParam = {};
                    //컴포넌트
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF507-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "11603";
                    fn_getCodeList(sParam, this);
                    
                    // 기본부 초기화
                    that.resetBaseArea(this);
                    
                    return this.$el;
                }

                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPWF507Tree'] = new bxTree({
                   	   fields: {id: 'nodeId', value: 'nodeNm'},
                       // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                           	   if(itemData.cdNm == null) {
                           		   that.inquiryBaseData(itemData);
                           	   }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPWF507Tree'].render());


                     //that.selectTree();
                }


//
//
//
                , selectTree : function() {
                	var that = this;
                	that.treeList = [];


                    var sParam = {};
                    if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    var linkData = {"header" : fn_getHeader("PSV0048402") , "SrvcMgmtSvcGetInstSrvcTreeIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		   that.subViews['CAPWF507Tree'].renderItem(responseData.SrvcMgmtSvcGetInstSrvcTreeOut.tblNm);
                     		   that.treeList = responseData.SrvcMgmtSvcGetInstSrvcTreeOut.tblNm;


                     		  if(that.initData.param) {
                     			  if(that.initData.param.scrnNm) {
                     				  that.initTreeList();
                     			  }
                     		  }
                     	   }
                        }
                    });
                }


                // 화면현황에서 넘어 왔을떄 호출 한다.
                , initTreeList : function() {
                	var that = this;
                	that.$el.find('[data-form-param="searchKey"]').val(that.initData.param.scrnNm);


                	that.loadTreeList();


                	if(that.initData.param.scrnNm && that.initData.param.scrnId) {
                		that.subViews['CAPWF507Tree'].selectItem(that.initData.param.scrnId, false);
                		// 상세조회
                		var sParam = {};
                		if(commonInfo.getInstInfo().instCd) {
                    		sParam.instCd = commonInfo.getInstInfo().instCd;
                    	}
                    	else {
                    		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    	}
                		sParam.scrnId = that.initData.param.scrnId;
                		that.inquiryBaseData(sParam); // 조회
                	}
                }
//
//
//
                , loadTreeList : function() {
             	   var that = this;


             	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


             	   var searchMenuList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPWF507Tree'].renderItem(that.treeList);
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchMenuList = that.selectMenu(searchMenuList, data, searchKey);
             	   });


             	   that.subViews['CAPWF507Tree'].renderItem(searchMenuList);
                }


                , selectMenu : function(searchMenuList, obj,  inputValue) {


                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];


                			if(temp001.cdNm == null) {
	 	           				if(temp001.scrnNm.indexOf(inputValue) > -1 || temp001.scrnId.indexOf(inputValue) > -1) {
	 	           					searchMenuList[searchMenuList.length] = temp001;
	 	           				}
	 	           			}
                		}


                	return searchMenuList;
                }


//
//
//
                , fn_enter : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		this.loadTreeList();
          	      	}
                }


//
//
//
                , openPage : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page',
                        pageHandler: 'CAPCM190',
                        pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                        pageInitialize: true,
                        pageRenderInfo: {
                        	trnsfrKnd : "SCRN_NAME" // 화면명
                    		, trnsfrOriginKeyVal : that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val() // 화면식별자
                        }
                    });
                }
                , clickResetBaseArea : function() {
                	this.resetBaseArea(this);
                }
//
//
//
                , resetBaseArea: function (that) {


                    that.$el.find('.CAPWF507-base-table [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val("");
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnNbr"]').val("");
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnNm"]').val("");
                    that.$el.find('.CAPWF507-base-table [data-form-param="menuTrgtScrnYn"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnUseYn"]').prop("checked", false);
                    that.$el.find('.CAPWF507-base-table [data-form-param="popupScrnYn"]').prop("checked", false);
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnUrlAddr"]').val("");


                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').prop("readonly", false);
                    that.$el.find('.CAPWF507-base-table [data-form-param="scrnNbr"]').prop("readonly", false);
                }


//
//
//
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};
                    //var param = this.settedParam;
                    // 입력 Key값 set
                    sParam.cmpntCd = that.$el.find('.CAPWF507-base-table [data-form-param="cmpntCd"]').val();
                    
                    sParam.srvcCd = that.$el.find('.CAPWF507-base-table [data-form-param="srvcCd"]').val();
                    //sParam.srvcNm = that.$el.find('.CAPWF507-base-table [data-form-param="srvcNm"]').val();
                    sParam.aprvlRsnCd = that.$el.find('.CAPWF507-base-table [data-form-param="aprvlRsnCd"]').val();
                    sParam.aprvlPtrnDscd = '';
                    sParam.aprvlTmpltId = that.$el.find('.CAPWF507-base-table [data-form-param="aprvlTmpltId"]').val();
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드

                    var linkData = {"header": fn_getHeader("CAPWF4018401"), "AprvlCndMgmtSvcGetAprvlCndListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        //loading 설정
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.AprvlCndMgmtSvcGetAprvlCndListOut.cndList;
                                if (tbList != null || tbList.length > 0) {
                                    that.CAPWF507Grid.setData(tbList);
                                }
                                else {
                                    that.CAPWF507Grid.resetData();
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end


//
//
//
				, clickBaseSearch : function() {
//                   var that = this;
//                   var param = {};
//   	        	   var instInfo = commonInfo.getInstInfo();
//   	        	   instCdBase = instInfo.instCd;
//
//
//                   if (!instCdBase ) {
//                       alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
//
//
//                       return;
//                   }
//
//
//                   // 조회 key값 set
//   	        	   param.instCd = instCdBase;
//                   param.aprvlRsnCd = this.$el.find('[data-form-param="aprvlRsnCd"]').val(); // 결재사유코드
//                   param.aprvlPtrnDscd = this.$el.find('[data-form-param="aprvlPtrnDscd"]').val(); // 결재패턴구분코드
//                   param.aprvlTmpltId = this.$el.find('[data-form-param="aprvlTmpltId"]').val(); // 결재탬플릿식별자
//                   this.$el.find('[data-form-param="aprvlTmpltId"]').prop("disabled", true);
//                   param.cmpntCd = this.$el.find('[data-form-param="cmpntCd"]').val(); // 컴포넌트코드
//                   param.srvcCd = this.$el.find('[data-form-param="srvcCd"]').val(); // 서비스코드
//                   param.aprvlCndDstnctnCd = "01";
//
//
//                   that.trigger('loadData', param);
					
	                chkAddcol = false;
	                var that = this;
	                var sParam = {};
	                var param = this.settedParam;


	                // 입력 Key값 set
	                sParam.aprvlRsnCd = param.aprvlRsnCd;  // 결재사유코드
	                sParam.aprvlPtrnDscd = param.aprvlPtrnDscd;  // 결재패턴구분코드
	                sParam.aprvlTmpltId = param.aprvlTmpltId;  // 워크플로우식별자
	                sParam.cmpntCd = param.cmpntCd;  // 컴포넌트코드
	                sParam.srvcCd = param.srvcCd;  // 서비스코드
	                sParam.instCd = param.instCd; // 기관코드


	                var linkData = {"header": fn_getHeader("CAPWF4018401"), "AprvlCndMgmtSvcGetAprvlCndListIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    //loading 설정
	                    enableLoading: true,
	                    success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            var tbList = responseData.AprvlCndMgmtSvcGetAprvlCndListOut.cndList;
	                            if (tbList != null || tbList.length > 0) {
	                                that.PWF507Grid.setData(tbList);
	                            }
	                            else {
	                                that.PWF507Grid.resetData();
	                            }
	                        }
	                    }   // end of suucess: fucntion
	                });     // end of bxProxy

				}


//
//
//
				, saveBase : function(that) {


					var sParam = {};
					sParam.cmpntCd = that.$el.find('.CAPWF507-base-table [data-form-param="cmpntCd"]').val();


					var scrnNbr = that.$el.find('.CAPWF507-base-table [data-form-param="scrnNbr"]').val();
					sParam.scrnNbr = scrnNbr;
					that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val(scrnNbr);
					sParam.scrnId = scrnNbr;


					sParam.scrnNm = that.$el.find('.CAPWF507-base-table [data-form-param="scrnNm"]').val();
					sParam.menuTrgtScrnYn = that.$el.find('.CAPWF507-base-table [data-form-param="menuTrgtScrnYn"]').val();


					if(that.$el.find('.CAPWF507-base-table [data-form-param="scrnUseYn"]').is(":checked")) {
						sParam.scrnUseYn = "Y";
					}
					else {
						sParam.scrnUseYn = "N";
					}


					if(that.$el.find('.CAPWF507-base-table [data-form-param="popupScrnYn"]').is(":checked")) {
						sParam.popupScrnYn = "Y";
					}
					else {
						sParam.popupScrnYn = "N";
					}


					sParam.scrnUrlAddr = that.$el.find('.CAPWF507-base-table [data-form-param="scrnUrlAddr"]').val();


					for (var sParamVal in sParam) {
						if (sParam[sParamVal] == '') {
							fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
							return;
						}
					}


					if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


					sParam.srvcList = [];


					if(that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').prop("readonly")) {
						// 수정
						sParam.saveStsCd = 'update';
					}
					else {
						// 등록
						sParam.saveStsCd = 'insert';
					}


					var linkData = {"header": fn_getHeader("CAPSV0518501"), "CaScrnMgmtSvcSaveScrnInfoIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								that.inquiryBaseData(sParam);
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}


//
//
//
				, clickDeleteBase : function(event) {
					if(!this.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').prop("readonly")) {
						return;
					}
					fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteBase, this);
				}


//
//
//
				, deleteBase : function(that) {


					var sParam = {};


					if(!that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').prop("readonly")) {
						return;
					}


					sParam.scrnId = that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val();


					if(fn_isNull(sParam.scrnId)) {
						fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
					}


					var linkData = {"header": fn_getHeader("CAPSV0518301"), "CaScrnMgmtSvcRemoveScrnInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	// tree 재조회
                            	that.selectTree();


                            	// 전체 초기화
                            	that.resetBaseArea(that);
                            	that.CAPWF507Grid.resetData();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
				}




//
//
//
                , clickSaveGrid : function(event) {
                	if(!this.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val()) {
                		return;
                	}


                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
                } 

                , clickExcelGrid : function() {
                	var that = this;
                	that.CAPSV302Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPWF507')+"_"+getCurrentDate("yyyy-mm-dd"));
                }

//
//
//
                , saveGrid : function(that) {
                	var srvcList = [];
                	var sParam = {};
                	sParam.scrnId = that.$el.find('.CAPWF507-base-table [data-form-param="scrnId"]').val();


                	$(that.CAPWF507Grid.getAllData()).each(function(idx, data) {
                		var srvcParam = {};
                		srvcParam.srvcCd = data.srvcCd;
                		srvcList.push(srvcParam);
                	});


                	sParam.srvcList = srvcList;


                	var linkData = {"header": fn_getHeader("CAPSV0518502"), "CaScrnMgmtSvcSaveScrnInfoIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                				if(commonInfo.getInstInfo().instCd) {
                            		sParam.instCd = commonInfo.getInstInfo().instCd;
                            	}
                            	else {
                            		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                            	}
                				that.inquiryBaseData(sParam);
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy


                }


//
//
//
                , createGrid: function () {
                    var girdArea = this.$el.find(".CAPWF507-grid");

                    girdArea.html(this.CAPWF507Grid.render({'height': CaGridHeight}));
                } // end of createGrid
                
//
//
//
                , addGrid : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page',
                        pageHandler: 'CAPWF508',
                        pageDPName: bxMsg('cbb_items.SCRN#CAPWF508'),
                        pageInitialize: true,
                        pageRenderInfo: {
                        	trnsfrKnd : "SCRN_NAME" // 화면명
                    		, trnsfrOriginKeyVal : 'CAPWF508' // 화면식별자
                        }
                    });
//                	var that = this;
//
//
//                	var popupService = new PopupService();
//                	popupService.render();
//
//
//                	popupService.on('popUpSetData', function (data) {
////                		record.set("srvcCd", data.srvcCd); 
////                		record.set("cmpntCd", data.cmpntCd); 
////                		record.set("srvcNm", data.srvcNm); 
//
//
//                		that.CAPWF507Grid.addData({"srvcCd" : data.srvcCd, "cmpntCd" : data.cmpntCd, "srvcNm" : data.srvcNm});
//                    });




                }
//
//
//
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPWF507-base-table", this.$el.find("#btn-base-search-modal"));
                }


//
//
//
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPWF507-grid", this.$el.find("#btn-up-grid"));
                }


//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.CAPWF507Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPWF507')+"_"+getCurrentDate("yyyy-mm-dd"));
                }


//
//
//
                , showTree: function () {
                    var that = this;
                    that.$el.find('.col1').show();
                    that.$el.find('.col2').css('left', '260px');
                    that.$el.find('#btn-tree-show').hide();
                }


//
//
//
                , hideTree: function () {
                    var that = this;
                    that.$el.find('.col1').hide();
                    that.$el.find('.col2').css('left', '30px');
                    that.$el.find('#btn-tree-show').show();
                }
                
                , popServiceSrch: function () {
    				var that = this;
    				var param = {};
    				param.instCd = that.instCd;
    			   this.popupService = new popupService(param);


    			    this.popupService.render();
    			    this.popupService.on('popUpSetData', function (param) {
    			    	that.$el.find('.CAPWF507-base-table [data-form-param="srvcCd"]').val(param.srvcCd);
    			    	that.$el.find('.CAPWF507-base-table [data-form-param="srvcNm"]').val(param.srvcNm);
    			    });

                }
                
                , popupAprvlTempltSrch: function () {
                	var that = this;
                    var param = {};

                    this.popupAprvlTmplt = new popupAprvlTmplt(param);
                    this.popupAprvlTmplt.render();
                    this.popupAprvlTmplt.on('popUpSetData', function (data) {
                		that.$el.find('.CAPWF507-base-table [data-form-param="aprvlTmpltId"]').val(data.aprvlTmpltId);
                		that.$el.find('.CAPWF507-base-table [data-form-param="aprvlTmpltNm"]').val(data.aprvlTmpltNm);
                    });
                }

            })
            ; // end of Backbone.View.extend({


        return CAPWF507View;
    } // end of define function
)
; // end of define
