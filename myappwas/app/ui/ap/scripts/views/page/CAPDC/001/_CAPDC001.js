define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPDC/001/_CAPDC001.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPDC/popup-previewDoc'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , commonInfo
        , popupPreivewDoc
        ) {


    	var docbookDefaultXml = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
		'<section xml:lang="en"  xmlns="#{RSRV_WORD.CBPBOOK_XMLNS}" version="5.0" ' + 
		'xmlns:xi="http://www.w3.org/2001/XInclude" ' + 
		'xmlns:xl="http://www.w3.org/1999/xlink" ' +
		'xmlns:xml="http://www.w3.org/XML/1998/namespace"> ' + '\n</section>';
	
	var docbookStylesheetDefaultXml = '<?xml version="1.0" encoding="ASCII"?>\n' +
	'<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ng="http://docbook.org/docbook-ng"  ' +
	'xmlns:db="http://docbook.org/ns/docbook" xmlns:exsl="http://exslt.org/common" xmlns:exslt="http://exslt.org/common" ' +
	'xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="db ng exsl exslt" version="1.0"> \n\n' +
	'  <xsl:include href="#{RSRV_WORD.CBPBOOK_XSL_INCLUDE}"/> \n\n' +
	'  <!-- define parameter --> \n' +
	'  <xsl:param name="table.frame.border.thickness">2</xsl:param> \n\n' +
	'  <!-- define : cbp parameter --> \n' +
	'  <xsl:param name="cbp.print.section.title">1</xsl:param> <!-- if param value is 0, print table\'s format title. otherwise print table title  --> \n' +
	'  <xsl:param name="cbp.css.source"></xsl:param> <!-- if param value is 0, print section title. otherwise don\'t print section title  --> \n\n' +
	'</xsl:stylesheet>';


        /**
         * Backbone
         */
        var CAPDC001View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPDC001-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'keyDownSearchKey'
            		, 'change #docId' : 'changeDocId'


                    , 'click #btn-base-reset': 'resetBaseArea'
                	, 'click #btn-base-save': 'clickSaveBase'
                	, 'click #btn-base-trash': 'clickDeleteBase'
                	, 'click #btn-base-search-modal': 'baseAreaModal'
            		, 'click #btn-CAPDC001-mltLngBtn': 'openPage'                		


                	, 'click #btn-tmplt-reset': 'resetDetailArea'	
                	, 'click #btn-tmplt-modal': 'tmpltAreaModal'
                	, 'click #btn-tmplt-save': 'clickSaveTmplt'


					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'


					, 'click #btn-CAPDC001-verifyBtn': 'verifyTmpltCntnt'
					, 'click #btn-CAPDC001-previewBtn': 'preivewTmpltCntnt'
					, 'change #docMkngTpCd': 'setDefaultDocCntnt'
                }
                /**
                 * 초기화 
                 */
                , initialize: function (initData) {
                    var that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    if(commonInfo.getInstInfo().instCd) {
                		that.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		that.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    // 기본정보 set
                    that.newSaveYn = "Y";
                    that.newSaveYnForTmplt = "Y";


                    // 현재일자
		            that.currDate = getCurrentDate("yyyymmdd");


                    // 왼쪽 트리 생성
                    that.fn_createTree();


                    that.CAPDC001Grid = new ExtGrid({
                        // 그리드 컬럼 정의
                    	fields: ['instDv', 'efctvStartDt', 'efctvEndDt', 'docStylesheetCntnt', 'docId', 'instCd']
                        , id: 'CAPDC001Grid'
                        , columns: [{text:bxMsg("cbb_items.SCRNITM#dstnctn"), flex : 1, dataIndex: 'instCd', style: 'text-align:center', align: 'center', height : 25
  			                    	  ,renderer: function(val) {
  			                     		   if(val == constantAdminInstCd) {
  			                     			   return bxMsg('cbb_items.SCRNITM#std');
  			                     		   }
  			                     		   else {
  			                     			   return bxMsg('cbb_items.ABRVTN#inst');
  			                     		   }
  			                     	   } // end of render
                                    }
                                   ,{text:bxMsg('cbb_items.AT#efctvStartDt'), flex : 2, dataIndex: 'efctvStartDt', style: 'text-align:center', align: 'center'
                                  	 , renderer : function(val,metaData, record) {
           		                		return XDate(val).toString('yyyy-MM-dd');
                           	         }
                                    }
                                   ,{text:bxMsg('cbb_items.AT#efctvEndDt'), flex : 2, dataIndex: 'efctvEndDt', style: 'text-align:center', align: 'center'
                                  	 , renderer : function(val,metaData, record) {
            		                		return XDate(val).toString('yyyy-MM-dd');
                            	         }
                                    }
                                   ,{text:bxMsg('cbb_items.SCRNITM#docStylesheet'), flex : 3, dataIndex: 'docStylesheetCntnt', style: 'text-align:center', align: 'left'}
                                   ,{text:bxMsg('cbb_items.AT#docId'), hidden: true, dataIndex: 'docId'}
                                   ,{text:bxMsg('cbb_items.AT#instCd'), hidden: true, dataIndex: 'instCd'}
                        ] // end of columns
                        , listeners: {
                        	click: {
                                element: 'body'
                                , fn: function (e, obj) {
                                	that.clickGrid();
                                }
                            }
                        }
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
                    var sParam;


                    // 컴포넌트코드 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-cmpntCd-wrap";
                    sParam.cdNbr = "11603";
                    sParam.viewType = "ValNm";
                    fn_getCodeList(sParam, this);


                    // 문서상태 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-docStsCd-wrap";
                    sParam.cdNbr = "A0563";
                    sParam.viewType = "ValNm";
                    sParam.disabled = true;
                    fn_getCodeList(sParam, this);


                    // 문서유형코드 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-docTypeCd-wrap";
                    sParam.cdNbr = "A0047";
                    sParam.viewType = "ValNm";
                    fn_getCodeList(sParam, this);


                    // 문서작성유형코드 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-docMkngTpCd-wrap";
                    sParam.cdNbr = "A0488";
                    sParam.viewType = "ValNm";
                    fn_getCodeList(sParam, this);


                    // 언어코드 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-previewLngCd-wrap";
                    sParam.cdNbr = "10005";
                    sParam.viewType = "ValNm";
                    fn_getCodeList(sParam, this);


                    // 스타일시트문서식별자 combobox 정보 셋팅
                    sParam = {};
                    sParam.className = "CAPDC001-stylesheetDocId-wrap";
                    sParam.cdNbr = "A0493";
                    sParam.viewType = "ValNm";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#na');
                    fn_getCodeList(sParam, this);


                    // set 날짜 입력박스
                    that.setDatePicker();


                    // 기본부 초기화
                    that.resetBaseArea();

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPDC001-wrap #btn-base-save')
                                        		,this.$el.find('.CAPDC001-wrap #btn-base-trash')
                                        		,this.$el.find('.CAPDC001-wrap #btn-tmplt-save')
                                        			   ]);
                    return this.$el;
                }
                /**
                 * Tree 생성 
                 */
                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPDC001Tree'] = new bxTree({
                   	   fields: {id: 'docId', value: 'docNm'},
                   	   	  // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                           	      if(itemData.docStsCd) {
                           		      that.inquiryBaseData(itemData);
                           	      }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPDC001Tree'].render());


                     that.selectTree();
                }
                /**
                 * 문서템플릿적용이력 Grid click 
                 */
                , clickGrid : function() {


                    var that = this;
                    var selectedRecord = that.CAPDC001Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	// 문서템플릿정보 조회
                    	that.selectTmpltDtl(selectedRecord.data);
                    }
                }
                /**
                 * 문서템플릿정보 조회
                 */
                , selectTmpltDtl : function(param) {
                	var that = this;


                	// 문서템플릿속성정보 reset 
                	that.resetDetailArea();


                	var sParam = {};
                	sParam.instCd = that.instCd;
                	sParam.docId = param.docId;
                	sParam.efctvStartDt = param.efctvStartDt;


                    var linkData = {"header" : fn_getHeader("CAPDC0028402") , "CaDocSrchSvcGetTmpltDtlIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		  that.resetDetailArea();
                     		  that.setDocTmpltDtl(responseData.CaDocSrchSvcGetTmpltDtlOut);
                     	   }
                        }
                    });
                }
                /**
                 * tree 목록 조회    
                 */
                , selectTree : function(searchKey) {
                	var that = this;
                	that.treeList = [];


                    var linkData = {"header" : fn_getHeader("CAPDC0018402") , "DummyIO" : {}};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		   that.subViews['CAPDC001Tree'].renderItem(responseData.CaDocSrchSvcGetDocTreeListOut.docTree);
                     		   that.treeList = responseData.CaDocSrchSvcGetDocTreeListOut.docTree;


                     		   if(searchKey) {
                     			  that.$el.find('[data-form-param="searchKey"]').val(searchKey);
                     			  that.loadTreeList();
                     		   }
                     		   else {
                    			   that.subViews['CAPDC001Tree'].expandAll();
                    		   }                     		   
                     	   }
                        }
                    });
                }
                /**
                 * 트리 조회버튼 클릭 
                 */
                , loadTreeList : function() {
             	   var that = this;


             	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


             	   var searchDocList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPDC001Tree'].renderItem(that.treeList);
             		   that.subViews['CAPDC001Tree'].expandAll();
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchDocList = that.selectDoc(searchDocList, data, searchKey);
             	   });


             	   that.subViews['CAPDC001Tree'].renderItem(searchDocList);
                }  
                /**
                 * 트리에서 문서명으로 검색 
                 */
                , selectDoc : function(searchDocList, obj,  inputValue) {


                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];


                			if(temp001.docStsCd) {
	 	           				if(temp001.docNm.indexOf(inputValue) > -1 || temp001.docId.indexOf(inputValue) > -1) {
	 	           					searchDocList[searchDocList.length] = temp001;
	 	           				}
	 	           			}
                		}


                	return searchDocList;
                }
                /**
                 * 문서Tree검색정보 입력 시 실행 
                 */
                , keyDownSearchKey : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		this.loadTreeList();
          	      	}
                }
                /**
                 * 문서식별자값 변경 시 실행 
                 */
                , changeDocId : function(event) {
                	if(this.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val() != "") {
                		this.$el.find("#btn-CAPDC001-mltLngBtn").show();
                	}
                	else {
                		this.$el.find("#btn-CAPDC001-mltLngBtn").hide();
                	}
                }
                /**
                 * 다국어등록화면으로 이동 
                 */
                , openPage : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page',
                        pageHandler: 'CAPCM190',
                        pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                        pageInitialize: true,
                        pageRenderInfo: {
                        	trnsfrKnd : "DOC_NAME" // 문서명 
                    	  , trnsfrOriginKeyVal : that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val()
                        }
                    });
                }
                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPDC001-base-table input').val("");
                    that.$el.find('.CAPDC001-base-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                    that.setDisableInputArea(false);


                    that.$el.find('#btn-base-trash').prop("disabled", true);
                    that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').prop("disabled", false);
                    that.$el.find('.CAPDC001-base-table [data-form-param="docStsCd"]').prop("disabled", true);


                    that.$el.find("#btn-CAPDC001-mltLngBtn").hide();
                    if(that.CAPDC001Grid) that.CAPDC001Grid.resetData();


                    that.resetDetailArea();


                	that.newSaveYn = "Y";
                }
                /**
                 * 상세부 초기화
                 */
                , resetDetailArea : function() {
                	var that = this;
                	that.$el.find('.CAPDC001-tmplt-table input').val("");
                	that.$el.find('.CAPDC001-tmplt-table textarea').val("");
                	that.$el.find('.CAPDC001-tmplt-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                	that.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvStartDt"]').val(XDate(that.currDate).toString('yyyy-MM-dd'));
                	that.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvEndDt"]').val("9999-12-31");


                	// 폐기상태인 경우 템플릿 속성 입력 area 비활성화 
                	if(that.$el.find('.CAPDC001-base-table [data-form-param="docStsCd"]').val() == "02") {
	                	that.setDisableTmpltInputArea(true);
	                	that.$el.find('#btn-tmplt-reset').prop("disabled", true);                		
                	}
                	else {
	                	that.setDisableTmpltInputArea(false);
	                	that.$el.find('#btn-tmplt-reset').prop("disabled", false);
                	}


                	that.newSaveYnForTmplt = "Y";


		        	// 문서 내용 set
                	that.setDefaultDocCntnt();                	
                }    
                /**
                 * 문서기본작성내용 set
                 */
                , setDefaultDocCntnt : function() {
                	var that = this;


                	if(that.newSaveYnForTmplt == "Y") {
	                	var docMkngTpCd = that.$el.find('.CAPDC001-base-table [data-form-param="docMkngTpCd"]').val();


	                	// 문서 내용 default값 set 
	                	if(docMkngTpCd == null || docMkngTpCd == "01") {
			        		that.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val(docbookDefaultXml);
			        	}
			        	else if(docMkngTpCd == "02") {
			        		that.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val(docbookStylesheetDefaultXml);
			        	}
			        	else {
			        		that.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val("");
			        	}
                	}
                }
                /**
                 * 문서정보조회 
                 */
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;


                    // 이전 정보 clear 
                    that.resetBaseArea();


                    var sParam = {};
                    sParam.instCd = that.instCd;
                    sParam.docId = param.docId;


                    var linkData = {"header": fn_getHeader("CAPDC0018403"), "CaDocSrchSvcGetDocDtlIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var docInfo = responseData.CaDocSrchSvcGetDocDtlListOut;


                            	// 기본설정
                            	that.$el.find('.CAPDC001-base-table [data-form-param="cmpntCd"]').val(docInfo.cmpntCd);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val(docInfo.docId);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docNm"]').val(docInfo.docNm);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docStsCd"]').val(docInfo.docStsCd);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docTypeCd"]').val(docInfo.docTpCd);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docMkngTpCd"]').val(docInfo.docMkngTpCd);


                                that.$el.find('#btn-base-trash').prop("disabled", false);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').prop("disabled", true);


                                // 폐기상태인 경우 
                                if(docInfo.docStsCd == "02") {
                                	that.setDisableInputArea(true);
                                	that.$el.find('#btn-tmplt-reset').prop("disabled", true);                                	
                                }
                                that.$el.find('#btn-base-save').prop("disabled", false);
                                that.$el.find('.CAPDC001-base-table [data-form-param="docStsCd"]').prop("disabled", false);


                            	// 문서템플릿적용이력 set 
                                if (docInfo.docTmpltHist != null || docInfo.docTmpltHist.length > 0) {
                                    that.CAPDC001Grid.setData(docInfo.docTmpltHist);
                                    that.CAPDC001Grid.grid.getSelectionModel().select(0, true); 
                                }


                                // 문서템플릿속성 set 
                                if(docInfo.docTmpltDtl) {
                                	that.setDocTmpltDtl(docInfo.docTmpltDtl);
                                }


                                // 다국어등록화면 이동 버튼 show 
                                that.$el.find("#btn-CAPDC001-mltLngBtn").show();

                                if (docInfo.docTmpltDtl && docInfo.docTmpltDtl.instCd == 'STDA'){
                                	that.newSaveYn = "Y";
                                } else {
                                	that.newSaveYn = "N";
                            	}
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end
                /**
                 * 입력영역 disbled 상태 변경 
                 */
                , setDisableInputArea : function(isDisabled) {
                	var that = this;


                	that.$el.find('#btn-base-save').prop("disabled", isDisabled);
                	that.$el.find('#btn-CAPDC001-mltLngBtn').prop("disabled", isDisabled);
                	that.$el.find('.CAPDC001-base-table input').prop("disabled", isDisabled);
                	that.$el.find('.CAPDC001-base-table select').not('.CAPDC001-base-table  [data-form-param="docStsCd"]').prop("disabled", isDisabled);


                	that.setDisableTmpltInputArea(isDisabled);
                }
                /**
                 * 템플릿 입력영역 disbled 상태 변경 
                 */
                , setDisableTmpltInputArea : function(isDisabled) {
                	var that = this;


                	that.$el.find('#btn-tmplt-save').prop("disabled", isDisabled);
                	that.$el.find('.CAPDC001-tmplt-table input').prop("disabled", isDisabled);
                	that.$el.find('.CAPDC001-tmplt-table select').prop("disabled", isDisabled);
                	that.$el.find('.CAPDC001-tmplt-table textarea').prop("readonly", isDisabled);
                }
                /**
                 * 문서템플릿속성 정보 set 
                 */
                , setDocTmpltDtl : function(docTmpltInfo) {
                	var that = this;

                	this.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvStartDt"]').val(XDate(docTmpltInfo.efctvStartDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvEndDt"]').val(XDate(docTmpltInfo.efctvEndDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val(docTmpltInfo.docCntnt);
                	this.$el.find('.CAPDC001-tmplt-table [data-form-param="docStylesheetCntnt"]').val(docTmpltInfo.docStylesheetCntnt);


                	// 과거날짜의 정보인 경우 비활성화 
                	if(docTmpltInfo.efctvEndDt < this.currDate) {
	                	this.setDisableTmpltInputArea(true);             		
                	}


                	this.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvStartDt"]').prop("disabled", true);
                	if(that.instCd != "STDA" && docTmpltInfo.instCd == "STDA"){
                		this.newSaveYnForTmplt = "Y";
                	} else {
                		this.newSaveYnForTmplt = "N";
                	}
                }
                /**
                 * 기본 삭제 버튼 클릭
                 */
                , clickDeleteBase : function(event) {
    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#del'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteBase, this);
                }
                /**
                 * 기본 삭제
                 */
                , deleteBase : function(that) {
					var sParam = {};
					sParam.docId = that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val();


					var linkData = {"header": fn_getHeader("CAPDC0038401"), "CaDocRgstSvcBsicDeleteIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


								that.selectTree();
								that.resetBaseArea();
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy					
                }
                /**
                 * 기본 저장 버튼 클릭
                 */
				, clickSaveBase : function(event) {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveBase, this);
				}
				/**
				 * 기본 저장
				 */
				, saveBase : function(that) {
					var sParam = {};
					sParam.cmpntCd = that.$el.find('.CAPDC001-base-table [data-form-param="cmpntCd"]').val();
					sParam.docId = that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val();
					sParam.docNm = that.$el.find('.CAPDC001-base-table [data-form-param="docNm"]').val();
					sParam.docTpCd = that.$el.find('.CAPDC001-base-table [data-form-param="docTypeCd"]').val();
					sParam.docMkngTpCd = that.$el.find('.CAPDC001-base-table  [data-form-param="docMkngTpCd"]').val();


					var linkData = null;


					if(that.newSaveYn == "Y") {
						linkData = {"header": fn_getHeader("CAPDC0038101"), "CaDocRgstSvcBsicRgstIn": sParam};
					}
					else {
						sParam.docStsCd = that.$el.find('.CAPDC001-base-table  [data-form-param="docStsCd"]').val();
						linkData = {"header": fn_getHeader("CAPDC0038201"), "CaDocRgstSvcBsicModifyIn": sParam};
					}


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


								if(that.newSaveYn == "Y") {
									that.selectTree(sParam.docId);
								}


								that.inquiryBaseData(sParam);
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}
                /**
                 * 템플릿 저장 버튼 클릭
                 */
				, clickSaveTmplt : function(event) {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveTmplt, this);
				}
				/**
				 * 템플릿 저장
				 */
				, saveTmplt : function(that) {
					var sParam = {};
					sParam.instCd = that.instCd;
					sParam.docId = that.$el.find('.CAPDC001-base-table [data-form-param="docId"]').val();
					sParam.efctvStartDt = that.$el.find('.CAPDC001-tmplt-table [data-form-param="efctvStartDt"]').val().replace(/\-/g, "");
					sParam.docCntnt = that.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val();
					sParam.docStylesheetCntnt = that.$el.find('.CAPDC001-tmplt-table [data-form-param="docStylesheetCntnt"]').val();


					var linkData = null;


					// 신규저장
					if(that.newSaveYnForTmplt == "Y") {
						linkData = {"header": fn_getHeader("CAPDC0028101"), "CaDocRgstSvcRgstTmpltIn": sParam};
					}
					// 변경저장 
					else {
						linkData = {"header": fn_getHeader("CAPDC0028201"), "CaDocRgstSvcModifyTmpltIn": sParam};
					}


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
                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPDC001-grid").html(this.CAPDC001Grid.render({'height': 122}));
                } // end of createGrid
                /**
                 * 조회조건영역 toggle 
                 */
                , baseAreaModal : function() {
                	fn_pageLayerCtrl("#CAPDC001-base-table");
                }
                /**
                 * 템플릿영역 toggle
                 */
                , tmpltAreaModal : function() {
                	fn_pageLayerCtrl("#CAPDC001-tmplt-table");
                }                
                /**
                 * 그리드영역 toggle
                 */
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPDC001-grid");
                }
                /**
                 * 그리드 내용 엑셀 다운로드
                 */
                , gridExcel : function() {
                	var that = this;
                	that.CAPDC001Grid.exportCsvFile(bxMsg('cbb_items.SCRNITM#CAPDC001-TMPLT-APLY-HIST')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                /**
                 * 트리 열기 
                 */
                , showTree: function () {
                    var that = this;
                    that.$el.find('.col1').show();
                    that.$el.find('.col2').css('left', '260px');
                    that.$el.find('#btn-tree-show').hide();
                }
                /**
                 * 트리 접기 
                 */
                , hideTree: function () {
                    var that = this;
                    that.$el.find('.col1').hide();
                    that.$el.find('.col2').css('left', '30px');
                    that.$el.find('#btn-tree-show').show();
                }
                /**
                 * 날짜입력박스를 데이터피커 set 
                 */
                , setDatePicker: function () {
                    fn_makeDatePicker(this.$el.find('#CAPDC001-tmplt-table [data-form-param="efctvStartDt"]'));


                    var ttObj = this.$el.find('#CAPDC001-tmplt-table [data-form-param="efctvStartDt"]');


                }  
                /**
                 * 문서템플릿내용검증
                 */
                , verifyTmpltCntnt : function() {


		            var param = new Object();
		            param.docCntnt = this.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val(); 
		            param.docMkngTpCd = this.$el.find('.CAPDC001-base-table [data-form-param="docMkngTpCd"]').val();


		            var linkData = {"header": fn_getHeader("CAPDC0028403"), "CaDocSrchSvcVerifyDocTmpltIn": param};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData),{
		            	enableLoading: true,
		                success: function(responseData){
		                	if(fn_commonChekResult(responseData)) {
		                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy		
                }
                /**
                 * 문서템플릿내용미리보기 
                 */
                , preivewTmpltCntnt : function() {
					var that = this;
		            var param = new Object();
		            param.docCntnt = this.$el.find('.CAPDC001-tmplt-table [data-form-param="docCntnt"]').val();
		            param.docStylesheetCntnt = this.$el.find('.CAPDC001-tmplt-table [data-form-param="docStylesheetCntnt"]').val();
		            param.lngCd = this.$el.find('.CAPDC001-tmplt-table [data-form-param="previewLngCd"]').val();
		            param.docMkngTpCd = this.$el.find('.CAPDC001-base-table [data-form-param="docMkngTpCd"]').val();


		            var linkData = {"header": fn_getHeader("CAPDC0028404"), "CaDocSrchSvcPreviewDocIn": param};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData),{
		            	enableLoading: true,
		                success: function(responseData){
		                	if(fn_commonChekResult(responseData)) {
		                		if(responseData.CaDocSrchSvcPreviewDocOut) {
		                			that.popupPreview(responseData.CaDocSrchSvcPreviewDocOut.docCntnt, param.docMkngTpCd);
		            			}		                          
		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy		
                }
                /**
                 * 문서템플릿 미리보기 팝업 오픈 
                 */
                , popupPreview : function(previewCntnt, docMkngTpCd) {


	                var that = this;
	                var param = {};
	                param.previewCntnt = previewCntnt;
	                param.docMkngTpCd = docMkngTpCd;


	                var popupPreivewDocObj = new popupPreivewDoc(param);
	                popupPreivewDocObj.render();
	            }
            })
            ; // end of Backbone.View.extend({


        return CAPDC001View;
    } // end of define function
)
; // end of define
