define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAR/080/_CAPAR080.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree
    ) {


        /**
         * Backbone
         */
        var CAPAR080View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAR080-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-service-blocking-info-reset': 'resetServiceBlockingInfoBase',
                'click #btn-service-blocking-info-save': 'saveServiceBlockingInfoBase',
                'click #btn-service-blocking-info-delete': 'deleteServiceBlockingInfoBase',
                'click #btn-blocking-bizDscd-reset': 	'resetBusinessDistinctionArea',
                'click #btn-blocking-bizDscd-save': 	'saveBusinessDistinctionInfo',
                'click #btn-service-type-list-reset': 	'resetServiceTypeListArea',
                'click #btn-service-type-list-save': 	'saveServiceTypeListInfo',
                'click #btn-service-type-info-reset': 	'resetServiceTypeInfoArea',
                'click #btn-service-type-info-save': 	'saveServiceTypeInfo',
                
                
                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-service-blocking-info-toggle': 'toggleServiceBlockingBaseInfo',
                'click #btn-blocking-bizDscd-toggle': 'toggleServiceBlockingBizDscd',
                'click #btn-service-type-list-toggle': 'toggleServiceTypeList'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                var that = this;


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
                this.$el.find('.bx-tree-root').html(this.CAPAR080Tree.render());


                // 단일탭 그리드 렌더
                this.$el.find("#CAPAR080Grid-biz-dscd").html(this.CAPAR080GridBizDscd.render({'height': '240px'}));
                this.$el.find("#CAPAR080Grid-service-type").html(this.CAPAR080GridSrvcType.render({'height': '240px'}));


                this.loadTreeList();
                //TODO 팝업연길후 사용
				this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').prop("disabled",true);
				
				
				sParam = {};


                sParam.className = "CAPAR080-arrSrvcTpCd-wrap";
                sParam.targetId = "arrSrvcTpCd";
                sParam.cdNbr = "11973";
                sParam.nullYn = "Y"; 
                //sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                

				//배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAR080-wrap #btn-service-blocking-info-save')
                                    		,this.$el.find('.CAPAR080-wrap #btn-service-blocking-info-delete')
                                    		,this.$el.find('.CAPAR080-wrap #btn-service-type-list-save')
                                    		,this.$el.find('.CAPAR080-wrap #btn-service-type-info-save')
                                    		,this.$el.find('.CAPAR080-wrap #btn-blocking-bizDscd-save')
                                    			   ]);
                return this.$el;
            },


            createTree: function () {
                var that = this;


                that.CAPAR080Tree = new bxTree({
                    fields: {id: 'arrSrvcBlckngCd', value: 'cdNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	that.inquireServiceData(itemData);
                        }
                    }
                });
            },
           /**
             * 그리드 생성
             */
            createGrid: function () {
                var that = this;


                this.CAPAR080GridBizDscd = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'bizDscdNm', 'slctdYn','bizDscd',
                        {
                               name: 'checkSlctdYn',
                               type: 'boolean',
                               convert: function (value, record) {
                               return record.get('slctdYn') === 'Y';
                                    }
                                },
                    ]
                    , id: 'CAPAR080Grid-biz-dscd'
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
                            text: bxMsg('cbb_items.AT#bizDscd'),
                            flex: 1,
                            dataIndex: 'bizDscd',
                            style: 'text-align:center;',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#bizDstnctnNm'),
                            flex: 1,
                            dataIndex: 'bizDscdNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#slctdYn'),
                            flex: 1,
                            xtype: 'checkcolumn',
                            dataIndex: 'checkSlctdYn',
                            style: 'text-align:center',
                            align: 'center',
                              stopSelection: false
                                    ,
                                    listeners: {
                                        click: function (_this, cell, rowIndex, eOpts) {
                                            var currentRecord = that.CAPAR080GridBizDscd.store.getAt(rowIndex),
                                                changedChecked = !currentRecord.get('checkSlctdYn');
                                            currentRecord.set('slctdYn', changedChecked ? 'Y' : 'N');
                                            currentRecord.set('checkSlctdYn', changedChecked);
                                        }
                                    }                            
                        }
                    ] // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    // , gridConfig: {
                    //     
                    //     plugins: [
                    //         Ext.create('Ext.grid.plugin.CellEditing', {
                    //             
                    //             clicksToEdit: 2
                    //             , listeners: {
                    //                 'beforeedit': function (editor, e) {
                    //                     return false;
                    //                 } 
                    //             } 
                    //         }) 
                    //     ] 
                    // } 
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
//                                that.clickGridOfServiceInputItem();
                            }
                        }
                    }
                });




                this.CAPAR080GridSrvcType = new ExtGrid({   
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'arrSrvcTpCd', 'arrSrvcTpNm']
                    , id: 'CAPAR080Grid-service-type'
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
                            text: bxMsg('cbb_items.SCRNITM#srvcTpCd'),
                            flex: 1,
                            dataIndex: 'arrSrvcTpCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#srvcTpNm'),
                            flex: 2,
                            dataIndex: 'arrSrvcTpNm',
                            style: 'text-align:center',
                            align: 'center',
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
                var selectedRecord = this.CAPAR080GridSrvcType.grid.getSelectionModel().selected.items[0];


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
                this.$el.find('#service-type-info-area [id="btn-srvc-code-search"]').prop("disabled",true);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').val(data.arrSrvcTpNm);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').prop("disabled",true);


            },                
            setServiceBlockingInfoBase: function (data) {
            	this.changeYn = 'Y';
                this.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val(data.arrSrvcBlckngCd);
                this.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').prop("disabled",true);
                this.$el.find('#service-blocking-info-area [data-form-param="cdNm"]').val(data.cdNm);


                if(data.dplctnAblYn == 'Y') {
                    this.$el.find('#service-blocking-info-area [data-form-param="dplctnAblYn"]').prop("checked", true);
                } else {
                    this.$el.find('#service-blocking-info-area [data-form-param="dplctnAblYn"]').prop("checked", false);
                }
                if(data.amtNcsrYn == 'Y') {
                    this.$el.find('#service-blocking-info-area [data-form-param="amtNcsrYn"]').prop("checked", true);
                } else {
                    this.$el.find('#service-blocking-info-area [data-form-param="amtNcsrYn"]').prop("checked", false);
                }
                if(data.whdrwlAblBalInitzYn == 'Y') {
                    this.$el.find('#service-blocking-info-area [data-form-param="whdrwlAblBalInitzYn"]').prop("checked", true);
                } else {
                    this.$el.find('#service-blocking-info-area [data-form-param="whdrwlAblBalInitzYn"]').prop("checked", false);
                }
            },




            saveServiceBlockingInfoBase: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.arrSrvcBlckngCd 	    = that.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();
                    sParam.cdNm 				= that.$el.find('#service-blocking-info-area [data-form-param="cdNm"]').val();


                    if(that.$el.find('#service-blocking-info-area [data-form-param="dplctnAblYn"]').prop("checked")){
                    	sParam.dplctnAblYn = "Y";
                    }else{
                    	sParam.dplctnAblYn = "N";
                    }
                    if(that.$el.find('#service-blocking-info-area [data-form-param="amtNcsrYn"]').prop("checked")){
                    	sParam.amtNcsrYn = "Y";
                    }else{
                    	sParam.amtNcsrYn = "N";
                    }
                    if(that.$el.find('#service-blocking-info-area [data-form-param="whdrwlAblBalInitzYn"]').prop("checked")){
                    	sParam.whdrwlAblBalInitzYn = "Y";
                    }else{
                    	sParam.whdrwlAblBalInitzYn = "N";
                    }


                    console.log(sParam);


                    var serviceCode;
					if(that.changeYn == "Y"){
						serviceCode = "CAPAR0808201";
					}else{
						serviceCode = "CAPAR0808101";
					}
                    var linkData = {"header": fn_getHeader(serviceCode), "CaSrvcBlckngInfoMgmtSvcSrvcBlckngBaseIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

				                that.resetServiceTypeListArea();
		    	                //트리다시 그리기
				                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },


            saveBusinessDistinctionInfo: function (event) {
                var that = this;
                var checkAllData = this.CAPAR080GridBizDscd.getFilteredRecords('slctdYn','Y'); // 변경된 데이터 가져오기
                var sParam = {};
                var gridData = [];                

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {


                    var sParam = {};


                    sParam.arrSrvcBlckngCd 	    = that.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();


                    if (checkAllData.length >= 1) {
	                    for (var idx in checkAllData) {
	                        var sub = {};
	                        sub.bizDscd = checkAllData[idx].bizDscd;
	                        sub.pdTpCd = checkAllData[idx].pdTpCd;


	                        gridData.push(sub);
	                    }
                    }    


                    sParam.bizDscdInfoList = gridData;


                    console.log(sParam);


                    var serviceCode;
					if(that.changeYn == "Y"){
						serviceCode = "CAPAR0808102";
					}else{
						return;
					}
                    var linkData = {"header": fn_getHeader(serviceCode), "CaSrvcBlckngInfoMgmtSvcSaveBizDscdInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								//재조회
								var pParm = {};
								pParm.arrSrvcBlckngCd = sParam.arrSrvcBlckngCd;
                                that.inquireServiceData(pParm);


                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


           },


           deleteServiceBlockingInfoBase: function (event) {
           		if(this.changeYn != 'Y'){
           			return ;
           		}
           		//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
           		
	           	var that = this;
	           	function deleteData() {
		            var sParam = {};
					sParam.arrSrvcBlckngCd 	 = that.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();


		            console.log(sParam);


		            var linkData = {"header": fn_getHeader("CAPAR0808301"), "CaSrvcBlckngInfoMgmtSvcSrvcBlckngBaseIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								that.resetServiceBlockingInfoBase();
		    	                //트리다시 그리기
				                that.loadTreeList();								


		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy
	        	}


	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);


           }, 
           saveServiceTypeListInfo: function (event) {
	           	var that = this;
	          //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
	           	
	           	function deleteData() {
		            var table = [];
		            var sParam = {};
					sParam.arrSrvcBlckngCd 	 = that.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();


		            $(that.deleteList).each(function(idx, data) {
		                var arrSrvcTpCd = data.arrSrvcTpCd;
		                table.push(arrSrvcTpCd);
		            });


		            sParam.arrSrvcTpCd = table;


		            console.log(sParam);


		            var linkData = {"header": fn_getHeader("CAPAR0808302"), "CaSrvcBlckngInfoMgmtSvcDeleteServiceTypeIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.deleteList = [];
								var pParm = {};
								pParm.arrSrvcBlckngCd = sParam.arrSrvcBlckngCd;
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
				if(that.typeChangeYn == "Y"){
					return;
				}

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {


                    var sParam = {};


                    sParam.arrSrvcBlckngCd 	 = that.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();
                    sParam.arrSrvcTpCd 	 = that.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val();


                    console.log(sParam);


					var	serviceCode = "CAPAR0808103";
                    var linkData = {"header": fn_getHeader(serviceCode), "CaSrvcBlckngInfoMgmtSvcSaveServiceTypeIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								//재조회
								var pParm = {};
								pParm.arrSrvcBlckngCd = sParam.arrSrvcBlckngCd;
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
                 var linkData = {"header" : fn_getHeader("CAPAR0808401") , "DummyIO" : sParam};


                 that.treeList = [];


                 bxProxy.post(sUrl, JSON.stringify(linkData),{
                     enableLoading: true,
                     success: function (responseData) {
                         if(fn_commonChekResult(responseData)) {
                             that.CAPAR080Tree.renderItem(responseData.CaSrvcBlckngInfoMgmtSvcGetSrvcBlckngListOut.srvcBlckngCdList);
                             that.treeList = responseData.CaSrvcBlckngInfoMgmtSvcGetSrvcBlckngListOut.srvcBlckngCdList;
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
                    this.CAPAR080Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPAR080Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    var temp001 = data;
                    if (temp001.arrSrvcBlckngCd != null && temp001.cdNm != null) {
                        if ((temp001.arrSrvcBlckngCd.indexOf(key) > -1 || temp001.cdNm.indexOf(key) > -1)) {
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


                 sParam.arrSrvcBlckngCd = param.arrSrvcBlckngCd;


                 var linkData = {"header": fn_getHeader("CAPAR0808402"), "CaSrvcBlckngInfoMgmtSvcGetSrvcBlckngInfoIn": sParam};


                 // ajax호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     enableLoading: true
                     , success: function (responseData) {
                         if (fn_commonChekResult(responseData)) {
                             var data = responseData.CaSrvcBlckngInfoMgmtSvcGetSrvcBlckngInfoOut;
                             // 목록이 1건만 나옴.
                             that.setServiceBlockingInfoBase(data);


                             // 화면 제공 서비스 목록 설정
                             if (data.bizDscdList != null || data.bizDscdList.length > 0) {
                                 that.CAPAR080GridBizDscd.setData(data.bizDscdList);


                                 // 삭제 로우 초기화
                                 that.deleteList = [];
                             }
                            // 화면 제공 서비스 목록 설정
                             if (data.arrSrvcTpCdList != null || data.arrSrvcTpCdList.length > 0) {
                                 that.CAPAR080GridSrvcType.setData(data.arrSrvcTpCdList);


                                 // 삭제 로우 초기화
                                 that.deleteList = [];
                             } 
                             that.resetServiceTypeInfoArea();                            
                         }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },
            resetServiceBlockingInfoBase: function (data) {
            	this.changeYn = 'N';
                this.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val("");
                this.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').prop("disabled",false);
                this.$el.find('#service-blocking-info-area [data-form-param="cdNm"]').val("");
                this.$el.find('#service-blocking-info-area [data-form-param="dplctnAblYn"]').prop("checked", false);
                this.$el.find('#service-blocking-info-area [data-form-param="amtNcsrYn"]').prop("checked", false);
                this.$el.find('#service-blocking-info-area [data-form-param="whdrwlAblBalInitzYn"]').prop("checked", false);


                this.resetBusinessDistinctionArea();
                this.CAPAR080GridSrvcType.resetData();
                this.resetServiceTypeInfoArea();
            },
            resetBusinessDistinctionArea: function () {
            	for(var i = 0 ; i < this.CAPAR080GridBizDscd.store.getCount() ; i++){
	            	var currentRecord = this.CAPAR080GridBizDscd.store.getAt(i);
	                currentRecord.set('slctdYn','N');
	                currentRecord.set('checkSlctdYn', false);


            	}
            },


			resetServiceTypeListArea: function () {
				var pParm = {};
				pParm.arrSrvcBlckngCd = this.$el.find('#service-blocking-info-area [data-form-param="arrSrvcBlckngCd"]').val();
                this.inquireServiceData(pParm);				
			},


            resetServiceTypeInfoArea: function () {
                var that = this;
                this.typeChangeYn = 'N';
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').val("");
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",false);
                this.$el.find('#service-type-info-area [id="btn-srvc-code-search"]').prop("disabled",false);
                this.$el.find('#service-type-info-area [data-form-param="arrSrvcTpNm"]').val("");


            },


            deleteServiceProfileAttribute: function () {


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


            openStandardAttributeSearchPopup: function () {
                var that = this;


                this.popupStandardAttribute = new PopupStandardAttribute();
                this.popupStandardAttribute.render();
                this.popupStandardAttribute.on('popUpSetData', function (data) {
                    that.setServiceProfileAttribute(data);
                });
            },


            /**
             * show or hide service profile attribute section
             */
            toggleServiceBlockingBaseInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#service-blocking-info-area"),this.$el.find('#btn-service-blocking-info-toggle'));
            },


            toggleServiceBlockingBizDscd: function () {
                fn_pageLayerCtrl(this.$el.find("#biz-dscd-area"),this.$el.find('#btn-blocking-bizDscd-toggle'));
            },
            toggleServiceTypeList: function () {
                fn_pageLayerCtrl(this.$el.find("#service-type-area"),this.$el.find('#btn-service-type-list-toggle'));
                fn_pageLayerCtrl(this.$el.find("#service-type-info-area"));
            }
        }); // end of Backbone.View.extend({


        return CAPAR080View;
    } // end of define function
); // end of define


