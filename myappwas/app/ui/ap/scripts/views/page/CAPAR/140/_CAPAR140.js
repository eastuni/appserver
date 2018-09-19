define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAR/140/_CAPAR140.html',
        'bx-component/bx-tree/bx-tree',
        'bx-component/ext-grid/_ext-grid',        
        'bx/common/common-info',
        'app/views/page/popup/CAPCM/popup-class-search',
        'app/views/page/popup/CAPCM/popup-numbering-rule-search'
    ]
    , function (
        config,
        tpl,
        bxTree,
        ExtGrid,
        commonInfo,
        PopupClassSearch,
        PopupNumberingRuleSearch
    ) {


        /**
         * Backbone
         */
        var CAPAR140View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAR140-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',

                
                'click #combo-tree-search': 'searchTreeListByCombo',
                'click #btn-tree-search': 'searchTreeList',
                

                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',

                
                'click #btn-passbook-message-info-reset' : 'resetPsbkMsgInfo',
                'click #btn-passbook-message-info-save'  : 'savePsbkMsgInfo',
                'click #btn-passbook-message-info-delete': 'deletePsbkMsgInfo',
                'click #btn-psbk-bkg-yn-class-search'    : 'openBkgClassSearchPopup',
                'click #btn-psbk-msg-edit-class-search'  : 'openEditClassSearchPopup',


                'click #btn-CAPAR140-grid-add': 'addGrid',

                
                'click #btn-passbook-message-info-toggle': 'togglePassbookMessageInfo',
                'click #btn-passbook-message-list-toggle': 'togglePassbookMessageList'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                var that = this;


                // 기관코드
                if (commonInfo.getInstInfo().instCd) {
                	that.instCd = commonInfo.getInstInfo().instCd;
                }
                else {
                	that.instCd = $.sessionStorage('headerInstCd');
                }


                $.extend(that, initData);


				this.deleteList = [];
                that.createGrid();
                that.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPAR140Tree.render());


                var sParam;

                
                sParam = {};


                sParam.className = "CAPAR140-psbkMsgTpCd-search-wrap";
                sParam.targetId = "psbkMsgTpCd";
                sParam.cdNbr = "A0917";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                

                sParam = {};


                sParam.className = "CAPAR140-psbkMsgTpCd-wrap";
                sParam.targetId = "psbkMsgTpCd";
                sParam.cdNbr = "A0917";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};			


                sParam.className = "CAPAR140-psbkMsgDtlTpCd-wrap";
                sParam.targetId = "psbkMsgDtlTpCd";
                sParam.cdNbr = "A0918";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                // 단일탭 그리드 렌더
                this.$el.find("#CAPAR140Grid-psbk-msg").html(this.CAPAR140GridPsbkMsg.render({'height': CaGridHeight}));


                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAR140-wrap  #btn-passbook-message-info-save ')
                                    		,this.$el.find('.CAPAR140-wrap #btn-passbook-message-info-delete')
                                    		]);                
                return this.$el;
            },


            createTree: function () {
                var that = this;


                that.CAPAR140Tree = new bxTree({
                    fields: {id: 'psbkMsgNm', value: 'cdNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	that.getPsbkMsgInfo(itemData);
                        }
                    }
                });
            },


            openNumberingRuleSearchPopup: function () {
               	var that = this;
               	var sParam = {};


               	sParam.cmpntCd = "ARB";
               	sParam.nbrgAtrbtNm = that.$el.find('#external-id-number-info-area [data-form-param="nbrgAtrbtNm"]').val();


               	var popupNumberingRuleSearch = new PopupNumberingRuleSearch(sParam);
               	popupNumberingRuleSearch.render();


               	popupNumberingRuleSearch.on('popUpSetData', function (data) {
               		that.$el.find('#external-id-number-info-area [data-form-param="nbrgAtrbtNm"]').val(data.nbrgAtrbtNm); //클래스명
               	});
            }, 


            openEditClassSearchPopup: function () {
               	var that = this;
               	var sParam = {};
               	sParam.cmpntCd = "ARB";
//               	sParam.classLayerTp = "ARR_SRVC_CND";
             	sParam.classNm = that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgEditClassNm"]').val();

               	var popupClassSearch = new PopupClassSearch(sParam);
               	popupClassSearch.render();

               	popupClassSearch.on('popUpSetData', function (data) {
               		that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgEditClassNm"]').val(data.classNm); //클래스명
               	});
            }, 
            
            
            openBkgClassSearchPopup: function () {
               	var that = this;
               	var sParam = {};
               	sParam.cmpntCd = "ARB";
//               	sParam.classLayerTp = "ARR_SRVC_CND";
             	sParam.classNm = that.$el.find('#passbook-message-info-area [data-form-param="psbkBkgYnClassNm"]').val();

               	var popupClassSearch = new PopupClassSearch(sParam);
               	popupClassSearch.render();

               	popupClassSearch.on('popUpSetData', function (data) {
               		that.$el.find('#passbook-message-info-area [data-form-param="psbkBkgYnClassNm"]').val(data.classNm); //클래스명
               	});
            },




           /**
             * 그리드 생성
             */
            createGrid: function () {
                var that = this;


                this.CAPAR140GridPsbkMsg = new ExtGrid({   
                    // 그리드 컬럼 정의
                    fields: ['psbkMsgSeqNbr', 'psbkMsgCntnt']
                	, expanded: true
                    , id: 'CAPAR140Grid-service-type'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'psbkMsgSeqNbr',
                            sortable: false,
                            width : 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#msgCntnt'),
                            flex: 1,
                            dataIndex: 'psbkMsgCntnt',
                            style: 'text-align:center',
                            align: 'left',
                            editor: 'textfield'
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }                        




                    ] // end of columns
                    , gridConfig: {
                        
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                
                                clicksToEdit: 2
                            }) 
                        ] 
                    } 
//                    , listeners: {
//                        click: {
//                            element: 'body'
//                            , fn: function () {
//                           
//                            }
//                        }
//                    }
                });


            },


            


            setPsbkMsgInfo: function (data) {
            	this.changeYn = 'Y';
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgId"]').val(data.psbkMsgId);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgNm"]').val(data.psbkMsgNm);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgNm"]').prop("disabled",true);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgTpCd"]').val(data.psbkMsgTpCd);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgTpCd"]').prop("disabled",true);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgDtlTpCd"]').val(data.psbkMsgDtlTpCd);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgDtlTpCd"]').prop("disabled",true);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkBkgYnClassNm"]').val(data.psbkBkgYnClassNm);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgEditClassNm"]').val(data.psbkMsgEditClassNm);
              
            },


            savePsbkMsgInfo: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                	
                    var sParam = {};
                    sParam.instCd 					= that.instCd;
                    sParam.psbkMsgId 				= that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgId"]').val();
					sParam.psbkMsgNm                = that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgNm"]').val();
					sParam.psbkMsgTpCd              = that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgTpCd"]').val();
					sParam.psbkMsgDtlTpCd           = that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgDtlTpCd"]').val();
					sParam.psbkBkgYnClassNm         = that.$el.find('#passbook-message-info-area [data-form-param="psbkBkgYnClassNm"]').val();
					sParam.psbkMsgEditClassNm       = that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgEditClassNm"]').val();
					sParam.psbkMsgList				= [];
					
					that.CAPAR140GridPsbkMsg.getAllData().forEach(function(val, idx){
						var pParam = {};
						pParam.psbkMsgId 		= that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgId"]').val();
						pParam.psbkMsgSeqNbr	= val.psbkMsgSeqNbr != "" ? val.psbkMsgSeqNbr : idx+1;
						pParam.psbkMsgCntnt		= val.psbkMsgCntnt;
						sParam.psbkMsgList.push(pParam);
					});
					
                    

//                    var serviceCode;
//					if(that.changeYn == "Y"){
//						serviceCode = "CAPAR1408402";
//					}else{
//						serviceCode = "CAPAR1408101";
//					}
                    var linkData = {"header": fn_getHeader("CAPAR1408402"), "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.resetPsbkMsgInfo();
		    	                //트리다시 그리기
				                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },


            addGrid : function() { 
            	this.CAPAR140GridPsbkMsg.addData({ rowIndex: '', psbkMsgCntnt: ''});
            },

            
            deletePsbkMsgInfo: function (event) {
           		if(this.changeYn != 'Y'){
           			return ;
           		}
	           	var that = this;
	          //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
	           	
	           	function deleteData() {
		            var sParam = {};


		            sParam.instCd 			= that.instCd;
		            sParam.psbkMsgId		= that.$el.find('#passbook-message-info-area [data-form-param="psbkMsgId"]').val(); 					


		            var linkData = {"header": fn_getHeader("CAPAR1408403"), "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								that.resetPsbkMsgInfo();
		    	                //트리다시 그리기
				                that.loadTreeList();								


		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy
	        	}


	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);


           }, 


           saveServiceTypeListInfo: function (event) {


        	    if(this.changeYn != 'Y'){
          			return ;
          		}

        	  //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
	           	var that = this;
	           	function deleteData() {
		            var table = [];
		            var sParam = {};


		            sParam.instCd 				= that.instCd;
		            sParam.arrExtrnlIdNbrTpCd 	= that.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val();


		            $(that.deleteList).each(function(idx, data) {
		                var arrSrvcTpCd = data.arrSrvcTpCd;
		                table.push(arrSrvcTpCd);
		            });


		            sParam.arrSrvcTpCd = table;


		            var linkData = {"header": fn_getHeader("CAPAR1408302"), "CaArrExtrnlIdNbrTpInfoMgmtSvcDeleteBlckngTrgtSrvcTpIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								var pParm = {};
								pParm.arrExtrnlIdNbrTpCd = sParam.arrExtrnlIdNbrTpCd;
                                that.getPsbkMsgInfo(pParm);
		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy
	        	}


	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);


           }, 


           saveServiceTypeInfo: function (event) {
                var that = this;
                var sParam = {};          


                if(that.changeYn == "N"){
                	return;
                }


				if(that.typeChangeYn == "Y"){
					return;
				}

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {


                    var sParam = {};


                    sParam.instCd 				= that.instCd;
                    sParam.arrExtrnlIdNbrTpCd 	= that.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val();
                    sParam.arrSrvcTpCd 	 		= that.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val();


                    if(sParam.arrExtrnlIdNbrTpCd == "") {
                		sParam = null;
                		return;
                	}


                    if(sParam.arrSrvcTpCd == "") {
                		sParam = null;
                		return;
                	}


					var	serviceCode = "CAPAR1408102";
                    var linkData = {"header": fn_getHeader(serviceCode), "CaArrExtrnlIdNbrTpInfoMgmtSvcSaveBlckngTrgtSrvcTpIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								//재조회
								var pParm = {};
								pParm.arrExtrnlIdNbrTpCd = sParam.arrExtrnlIdNbrTpCd;
                                that.getPsbkMsgInfo(pParm);


                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },            
            /**
             * load all of tree list
             */
            loadTreeList: function () {
                 var that = this;
                 var sParam = {};


                 sParam.instCd = that.instCd;


                 var linkData = {"header" : fn_getHeader("CAPAR1408404") , "CaArrPsbkMsgMgmtSvcIn" : sParam};


                 that.treeList = [];


                 bxProxy.post(sUrl, JSON.stringify(linkData),{
                     enableLoading: true,
                     success: function (responseData) {
                         if(fn_commonChekResult(responseData)) {
                             that.CAPAR140Tree.renderItem(responseData.CaArrPsbkMsgMgmtSvcGetListPsbkMsgOut.psbkMsgList);
                             that.treeList = responseData.CaArrPsbkMsgMgmtSvcGetListPsbkMsgOut.psbkMsgList;
                         }
                     }
                 });
            },


            /**
             * search tree list with particular type
             */
            searchTreeListByCombo: function () {
                var searchType = this.$el.find('#combo-tree-search').val();
                var matchingItems;


                if(!searchType) {
                    this.CAPAR140Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItemsByType(searchType);
                this.CAPAR140Tree.renderItem(matchingItems);
            },
            
            
            /**
             * search tree list with particular keyword
             */
            searchTreeList: function () {
                var searchKey = this.$el.find('[data-form-param="searchKey"]').val();
                var matchingItems;


                if(!searchKey) {
                    this.CAPAR140Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPAR140Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items by type
             */
            findMatchingTreeItemsByType : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    var temp001 = data;
                    if (temp001.psbkMsgId != null && temp001.cdNm != null) {
                        if (temp001.psbkMsgTpCd.indexOf(key) > -1 ) {
                            searchTreeList.push(temp001);
                        }
                    }
                });


                return searchTreeList;
            },
            
            
            
            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    var temp001 = data;
                    if (temp001.psbkMsgId != null && temp001.cdNm != null) {
                        if ((temp001.psbkMsgId.indexOf(key) > -1 || temp001.cdNm.indexOf(key) > -1)) {
                            searchTreeList.push(temp001);
                        }
                    }
                });


                return searchTreeList;
            },


            getPsbkMsgInfo: function (param) {
                 //header 정보 set
                 var that = this;
                 var sParam = {};

                 sParam.instCd 	  = that.instCd;
                 sParam.psbkMsgId = param.psbkMsgId;

                 var linkData = {"header": fn_getHeader("CAPAR1408401"), "CaArrPsbkMsgMgmtSvcIn": sParam};

                 // ajax호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     enableLoading: true
                     , success: function (responseData) {
                         if (fn_commonChekResult(responseData)) {
                             var data = responseData.CaArrPsbkMsgMgmtSvcOut;
                             // 목록이 1건만 나옴.
                             that.setPsbkMsgInfo(data);

                            // 화면 제공 서비스 목록 설정
                             if (data.psbkMsgList != null || data.psbkMsgList.length > 0) {
                                 that.CAPAR140GridPsbkMsg.setData(data.psbkMsgList);

                                 // 삭제 로우 초기화
                                 that.deleteList = [];
                             }                          
                         }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },

            resetPsbkMsgInfo: function (data) {

            	this.changeYn = 'N';
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgId"]').val("");
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgNm"]').val("");
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgNm"]').prop("disabled",false);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgTpCd"]').val("");
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgTpCd"]').prop("disabled",false);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgDtlTpCd"]').val("");
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgDtlTpCd"]').prop("disabled",false);
                this.$el.find('#passbook-message-info-area [data-form-param="psbkBkgYnClassNm"]').val("");
                this.$el.find('#passbook-message-info-area [data-form-param="psbkMsgEditClassNm"]').val("");


                this.CAPAR140GridPsbkMsg.resetData();            
            },           
            


            /**
             * callback for enter input in tree
             */
            fn_enter: function (event) {
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                    this.searchTreeList();
                }
            },


            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            /**
             * show or hide service profile attribute section
             */
            togglePassbookMessageInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#epassbook-message-info-area"),this.$el.find('#btn-passbook-message-info-toggle'));
            },


            togglePassbookMessageList: function () {
                fn_pageLayerCtrl(this.$el.find("#passbook-message-list-area"),this.$el.find('#btn-passbook-message-list-toggle'));


            }
        }); // end of Backbone.View.extend({


        return CAPAR140View;
    } // end of define function
); // end of define


