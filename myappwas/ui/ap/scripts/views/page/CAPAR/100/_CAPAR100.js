define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAR/100/_CAPAR100.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',        
        'app/views/page/popup/CAPCM/popup-class-search',
        'app/views/page/popup/CAPCM/popup-numbering-rule-search'
        
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupClassSearch,
        PopupNumberingRuleSearch
    ) {


        /**
         * Backbone
         */
        var CAPAR100View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAR100-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-external-id-number-info-reset': 'resetExtrnlIdNbrTpInfo',
                'click #btn-external-id-number-info-save': 'saveExtrnlIdNbrTpInfo',
                'click #btn-external-id-number-info-delete': 'deleteExtrnlIdNbrTpInfo',
                'click #btn-service-type-list-reset': 	'resetServiceTypeListArea',
                'click #btn-service-type-list-save': 	'saveServiceTypeListInfo',
                'click #btn-service-type-info-reset': 	'resetServiceTypeInfoArea',
                'click #btn-service-type-info-save': 	'saveServiceTypeInfo',                
                'click #btn-class-search': 'openClassSearchPopup',
                'click #btn-nbrg-rule-search': 'openNumberingRuleSearchPopup',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-external-id-number-info-toggle': 'toggleExtrnlIdNbrTpInfo',
                'click #btn-service-type-list-toggle': 'toggleServiceTypeList',
                'click #btn-service-type-info-toggle': 'toggleServiceTypeInfo'
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
                this.$el.find('.bx-tree-root').html(this.CAPAR100Tree.render());


                var sParam;


                sParam = {};


                sParam.className = "CAPAR100-extrnlIdNbrTpCd-wrap";
                sParam.targetId = "arrExtrnlIdNbrTpCd";
                sParam.viewType = "ValNm";
                sParam.cdNbr = "50010";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};


                sParam.className = "CAPAR100-srvcBlckngTpCd-wrap";
                sParam.targetId = "srvcBlckngTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#nonSelect'); // 전체
                sParam.cdNbr = "A0557";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                
                sParam = {};


                sParam.className = "CAPAR100-arrSrvcTpCd-wrap";
                sParam.targetId = "arrSrvcTpCd";
                sParam.cdNbr = "11973";
                sParam.nullYn = "Y"; 
                //sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                // 단일탭 그리드 렌더
                this.$el.find("#CAPAR100Grid-service-type").html(this.CAPAR100GridSrvcType.render({'height': '200px'}));


                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAR100-wrap #btn-external-id-number-info-save')
                                    		,this.$el.find('.CAPAR100-wrap #btn-external-id-number-info-delete')
                                    		,this.$el.find('.CAPAR100-wrap #btn-service-type-list-save')
                                    		,this.$el.find('.CAPAR100-wrap #btn-service-type-info-save')
                                    			   ]);
                
                return this.$el;
            },


            createTree: function () {
                var that = this;


                that.CAPAR100Tree = new bxTree({
                    fields: {id: 'arrExtrnlIdNbrTpCd', value: 'cdNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	that.inquireServiceData(itemData);
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


            openClassSearchPopup: function () {
               	var that = this;
               	var sParam = {};
               	sParam.cmpntCd = "ARB";
               	sParam.classLayerTp = "ARR_SRVC_CND";
             	sParam.classNm = that.$el.find('#external-id-number-info-area [data-form-param="classNm"]').val();


             	console.log(sParam);


               	var popupClassSearch = new PopupClassSearch(sParam);
               	popupClassSearch.render();


               	popupClassSearch.on('popUpSetData', function (data) {
               		that.$el.find('#external-id-number-info-area [data-form-param="classNm"]').val(data.classNm); //클래스명
               	});
            },
            
            
            openCodeSearchPopup: function () {
            	
            	var that = this;

            	var sParam = {};
            	sParam.code = '11973';

                this.popupCodeSearch = new PopupCodeSearch(sParam);
                this.popupCodeSearch.render();
                
                this.popupCodeSearch.on('popUpSetData', function (data) {
                	that.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val(data.cdNbr);
                    that.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').val(data.cdNm);
                });            	
            },


           /**
             * 그리드 생성
             */
            createGrid: function () {
                var that = this;


                this.CAPAR100GridSrvcType = new ExtGrid({   
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'arrSrvcTpCd', 'arrSrvcTpNm']
                    , id: 'CAPAR100Grid-service-type'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
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
                            text: bxMsg('cbb_items.AT#arrSrvcTpCd'),
                            flex: 1,
                            dataIndex: 'arrSrvcTpCd',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#arrSrvcTpNm'),
                            flex: 2,
                            dataIndex: 'arrSrvcTpNm',
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
//                    , gridConfig: {
//                        
//                        plugins: [
//                            Ext.create('Ext.grid.plugin.CellEditing', {
//                                
//                                clicksToEdit: 2
//                            }) 
//                        ] 
//                    } 
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
                                that.clickGridOfServiceTypeItem();
                            }
                        }
                    }
                });


            },


            /**
             * 서비스 입력 항목의 그리드 항목 클릭
             */
            clickGridOfServiceTypeItem: function () {
                var selectedRecord = this.CAPAR100GridSrvcType.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    this.setServiceTypeItem(selectedRecord.data);
                }
            },        


            /**
             * 서비스 입력 항목 영역을 받아온 데이터로 세팅
             * @param data 서버로부터 받아온 데이터
             */
            setServiceTypeItem: function (data) {
				this.typeChangeYn = 'Y';
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val(data.arrSrvcTpCd);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",true);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').val(data.arrSrvcTpNm);


            },


            setExtrnlIdNbrTpInfo: function (data) {
            	this.changeYn = 'Y';
                this.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val(data.arrExtrnlIdNbrTpCd);
                this.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').prop("disabled",true);
                this.$el.find('#external-id-number-info-area [data-form-param="srvcBlckngTpCd"]').val(data.arrIdNbrSrvcBlckngTpCd);
                this.$el.find('#external-id-number-info-area [data-form-param="nbrgAtrbtNm"]').val(data.nbrgAtrbtNm);
                this.$el.find('#external-id-number-info-area [data-form-param="classNm"]').val(data.classNm);


                if(data.reuseAblYn == 'Y') {
                    this.$el.find('#external-id-number-info-area [data-form-param="reuseAblYn"]').prop("checked", true);
                } else {
                    this.$el.find('#external-id-number-info-area [data-form-param="reuseAblYn"]').prop("checked", false);
                }
            },


            saveExtrnlIdNbrTpInfo: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};


                    sParam.instCd 					= that.instCd;
                    sParam.arrExtrnlIdNbrTpCd 	    = that.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val();
                    sParam.nbrgAtrbtNm 	    		= that.$el.find('#external-id-number-info-area [data-form-param="nbrgAtrbtNm"]').val();
                    sParam.classNm 	    			= that.$el.find('#external-id-number-info-area [data-form-param="classNm"]').val();
                    sParam.arrIdNbrSrvcBlckngTpCd 	= that.$el.find('#external-id-number-info-area [data-form-param="srvcBlckngTpCd"]').val();


                    if(sParam.arrExtrnlIdNbrTpCd == "") {
                		sParam = null;
                		return;
                	}


                    if(that.$el.find('#external-id-number-info-area [data-form-param="reuseAblYn"]').prop("checked")){
                    	sParam.reuseAblYn = "Y";
                    }else{
                    	sParam.reuseAblYn = "N";
                    }


                    var serviceCode;
					if(that.changeYn == "Y"){
						serviceCode = "CAPAR1008201";
					}else{
						serviceCode = "CAPAR1008101";
					}
                    var linkData = {"header": fn_getHeader(serviceCode), "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.resetExtrnlIdNbrTpInfo();
		    	                //트리다시 그리기
				                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },


            deleteExtrnlIdNbrTpInfo: function (event) {
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


		            sParam.instCd 			  = that.instCd;
					sParam.arrExtrnlIdNbrTpCd = that.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val();


		            var linkData = {"header": fn_getHeader("CAPAR1008301"), "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								that.resetExtrnlIdNbrTpInfo();
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


		            var linkData = {"header": fn_getHeader("CAPAR1008302"), "CaArrExtrnlIdNbrTpInfoMgmtSvcDeleteBlckngTrgtSrvcTpIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								var pParm = {};
								pParm.arrExtrnlIdNbrTpCd = sParam.arrExtrnlIdNbrTpCd;
                                that.inquireServiceData(pParm);
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


					var	serviceCode = "CAPAR1008102";
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
                                that.inquireServiceData(pParm);


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


                 var linkData = {"header" : fn_getHeader("CAPAR1008401") , "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn" : sParam};


                 that.treeList = [];


                 bxProxy.post(sUrl, JSON.stringify(linkData),{
                     enableLoading: true,
                     success: function (responseData) {
                         if(fn_commonChekResult(responseData)) {
                             that.CAPAR100Tree.renderItem(responseData.CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrListOut.arrExtrnlIdNbrTpList);
                             that.treeList = responseData.CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrListOut.arrExtrnlIdNbrTpList;
                         }
                     }
                 });
            },


            /**
             * search tree list with particular keyword
             */
            searchTreeList: function () {
                var searchKey = this.$el.find('[data-form-param="searchKey"]').val();
                var matchingItems;


                if(!searchKey) {
                    this.CAPAR100Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPAR100Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    var temp001 = data;
                    if (temp001.arrExtrnlIdNbrTpCd != null && temp001.cdNm != null) {
                        if ((temp001.arrExtrnlIdNbrTpCd.indexOf(key) > -1 || temp001.cdNm.indexOf(key) > -1)) {
                            searchTreeList.push(temp001);
                        }
                    }
                });


                return searchTreeList;
            },


            inquireServiceData: function (param) {
                 //header 정보 set
                 var that = this;
                 var sParam = {};


                 sParam.instCd 			   = that.instCd;
                 sParam.arrExtrnlIdNbrTpCd = param.arrExtrnlIdNbrTpCd;


                 if(sParam.arrExtrnlIdNbrTpCd == null){
                	 return;
                 }


                 var linkData = {"header": fn_getHeader("CAPAR1008402"), "CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoIn": sParam};


                 // ajax호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     enableLoading: true
                     , success: function (responseData) {
                         if (fn_commonChekResult(responseData)) {
                             var data = responseData.CaArrExtrnlIdNbrTpInfoMgmtSvcGetExtrnlIdNbrInfoOut;
                             // 목록이 1건만 나옴.
                             that.setExtrnlIdNbrTpInfo(data);




                            // 화면 제공 서비스 목록 설정
                             if (data.blckngTrgtSrvcTpList != null || data.blckngTrgtSrvcTpList.length > 0) {
                                 that.CAPAR100GridSrvcType.setData(data.blckngTrgtSrvcTpList);


                                 // 삭제 로우 초기화
                                 that.deleteList = [];
                             } 
                             that.resetServiceTypeInfoArea();                            
                         }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },


            resetExtrnlIdNbrTpInfo: function (data) {
            	this.changeYn = 'N';


            	this.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').prop("disabled",false);
                this.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#external-id-number-info-area [data-form-param="srvcBlckngTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#external-id-number-info-area [data-form-param="nbrgAtrbtNm"]').val("");
                this.$el.find('#external-id-number-info-area [data-form-param="classNm"]').val("");
                this.$el.find('#external-id-number-info-area [data-form-param="reuseAblYn"]').prop("checked", false);


                this.CAPAR100GridSrvcType.resetData();
                this.resetServiceTypeInfoArea();
            },


			resetServiceTypeListArea: function () {
				if(this.changeYn != 'Y'){
					return;
				}
				var pParm = {};
				pParm.arrExtrnlIdNbrTpCd = this.$el.find('#external-id-number-info-area [data-form-param="arrExtrnlIdNbrTpCd"]').val();
                this.inquireServiceData(pParm);				
			},


            resetServiceTypeInfoArea: function () {
                var that = this;
                this.typeChangeYn = 'N';
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val("");
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",false);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').val("");
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
            toggleExtrnlIdNbrTpInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#external-id-number-info-area"),this.$el.find('#btn-external-id-number-info-toggle'));
            },


            toggleServiceTypeList: function () {
                fn_pageLayerCtrl(this.$el.find("#service-type-area"),this.$el.find('#btn-service-type-list-toggle'));
                fn_pageLayerCtrl(this.$el.find("#service-type-info-area"));
            },


            toggleServiceTypeInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#service-type-info-area"),this.$el.find('#btn-service-type-info-toggle'));


            }
        }); // end of Backbone.View.extend({


        return CAPAR100View;
    } // end of define function
); // end of define


