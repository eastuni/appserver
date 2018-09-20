define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAS/020/_CAPAS020.html',
        'bx-component/ext-grid/_ext-grid',
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {

        var comboStore1 = {};
        var comboStore2 = {};
        var comboStore3 = {};
        var comboStore4 = {};
        var comboStore5 = {};
        var comboStore6 = {};
        var deleteList = [];
        var loadParam = {};
        var initFlag = true;

        /**
         * Backbone
         */
        var CAPAS020View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAS020-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            
            // set Events
            events: {
                /*
                 * search-condition-area
                 */
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireSearchCondition',
                'click #btn-search-condition-toggle': 'toggleSearchCondition',

                /*
                 * search-result-area
                 */
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',

                /*
                 * detail-information-area
                 */
                'click #btn-detail-information-reset': 'resetDetailInformation',
                'click #btn-detail-information-save': 'saveDetailInformation',
                'click #btn-detail-information-toggle': 'toggleDetailInformation',
                
                // 값변경 이벤트 
                'change .CAPAS020-assetAddrRegionClCrtrCd-wrap': 'changeAssetAddrRegionClCrtrCd',
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);

                this.initData = initData;
                this.setComboStore();
                this.initFlag = true;
                this.createGrid();
                
                this.resetSearchCondition();
                this.resetSearchResult();
                this.resetDetailInformation();
            },
            
            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPAS020Grid").html(this.CAPAS020Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAS020-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAS020-wrap #btn-detail-information-save')
                                    			   ]);
                return this.$el;
            },  

            /*
             *  Set combo store
             */
            setComboStore: function () {
          
                var sParam = {};

                // 지역분류유형코드
                sParam = {};
                sParam.cdNbr = "A0334";
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
                // 담보인정비율지역
                sParam = {};
                sParam.cdNbr = "A0333";
                var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
             // 상가임대차지역
                sParam = {};
                sParam.cdNbr = "A0335";
                var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
             // 주택임대차지역
                sParam = {};
                sParam.cdNbr = "A0336";
                var linkData4 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
             // DTI지역
                sParam = {};
                sParam.cdNbr = "A1060";
                var linkData5 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
             // LTV지역
                sParam = {};
                sParam.cdNbr = "A1061";
                var linkData6 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
                bxProxy.all([                             
                            // 지역분류유형코드
							{
							    url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore1 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							},
							// 담보인정비율지역
							{
							    url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore2 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							},
							// 상가임대차지역
							{
							    url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore3 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							},
							// 주택임대차지역
							{
							    url: sUrl, param: JSON.stringify(linkData4), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore4 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							},
							// DTI지역
							{
							    url: sUrl, param: JSON.stringify(linkData5), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore5 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							},
							// LTV지역
							{
							    url: sUrl, param: JSON.stringify(linkData6), success: function (responseData) {
							        if (!responseData.header.errorMessageProcessed) {
							            comboStore6 = new Ext.data.Store({
							                fields: ['cd', 'cdNm'],
							                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
							            });
							        }
							    }
							}
  	          ], 
  	          {
                success: function () {}
                });
            },          
            
            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;
        	
                this.CAPAS020Grid = new ExtGrid({
                //  그리드 컬럼 정의
                fields: ['No', 'assetAddrRegionClCrtrCd', 'addrId', 'cityPrvncAddr', 'cityGunGuAddr', 'emdongAddr', 'adriAddr', 'aplyStartDt', 'aplyEndDt', 'assetAddrRegionClCd'],


                id: 'CAPAS020Grid',
                columns: [
                        {
                        	text: bxMsg('cbb_items.SCRNITM#No'),
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center'
                                // other config you need.. 
                                ,
                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                return rowIndex + 1;
                            }
            			},

            			// 자산지역분류기준코드
                        {
                            text: bxMsg('cbb_items.AT#assetAddrRegionClCrtrCd'),
                            hidden:true,
                            //width: 80,
                            flex: 0,
                            dataIndex: 'assetAddrRegionClCrtrCd',
                            style: 'text-align:center',
                            align: 'center',
                        },
                        
                        // 법정동코드
                        {
                            text: bxMsg('cbb_items.SCRNITM#stutDong'),
                            //width: 100,
                            flex: 1,
                            dataIndex: 'addrId',
                            style: 'text-align:center',
                            align: 'center',
                        },
                        
                        // 시도
                        {
                            text: bxMsg('cbb_items.AT#cityPrvncAddr'),
                            //width: 100,
                            dataIndex: 'cityPrvncAddr',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },
                        
                        // 군구
                        {
                            text: bxMsg('cbb_items.AT#cityGunGuAddr'),
                            //width: 100,
                            dataIndex: 'cityGunGuAddr',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },
                        
                        // 읍면동
                        {
                            text: bxMsg('cbb_items.AT#emdongAddr'),
                            //width: 100,
                            dataIndex: 'emdongAddr',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },
                        
                        // 리
                        {
                            text: bxMsg('cbb_items.AT#adriAddr'),
                            //width: 100,
                            dataIndex: 'adriAddr',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },
                        
                        // 적용시작년월일 
                        {
                            text: bxMsg('cbb_items.AT#aplyStartDt'),
                            //width: 100,
                            dataIndex: 'aplyStartDt',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                         	renderer : function(val,metaData, record) {
  		                		return XDate(val).toString('yyyy-MM-dd');
                  	        }
                        },

                        // 적용종료년월일 
                        {
                            text: bxMsg('cbb_items.AT#aplyEndDt'),
                            //width: 100,
                            dataIndex: 'aplyEndDt',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                         	renderer : function(val,metaData, record) {
  		                		return XDate(val).toString('yyyy-MM-dd');
                  	        }
                        },
                        
                        // 임대차지역구분코드
                        {
                            text: bxMsg('cbb_items.AT#assetAddrRegionClCd'),
                            width: 130,
                            dataIndex: 'assetAddrRegionClCd',
                            style: 'text-align:center',
                            align: 'center'
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
                        },
                        
                        // 삭제아이콘
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                    {
                                        //  icon: 'images/icon/x-delete-16.png'
                                        iconCls: "bw-icon i-25 i-func-trash",
                                        tooltip: bxMsg('tm-layout.delete-field'),
                                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                                                     that.deleteList.push(record.data);
                                                     grid.store.remove(record);
                                                 }
                                    }
                                   ]
                        }
                ] // end of columns                    
                ,
                listeners: {
                    	click: {
	                        element: 'body',
	                        fn: function () {
	                            //클릭시 이벤트 발생
	                            that.selectRecord();
	                        }
                    	},
	                    viewready: function(grid, eOpts){
	                        grid.view.getEl().on( 'scroll', function(event, target) {
	                        	
	                            var viewEndPosition = target.scrollHeight - target.offsetHeight;
	                            if ((viewEndPosition > 1) && (viewEndPosition <= target.scrollTop)){
	                            	if(that.loadParam) {
	                            		that.loadParam.pgNbr = that.loadParam.pgNbr + that.loadParam.pgCnt;
	                            		that.loadParam.totCntInqryYn = "N"; // 전체건수조회여부
	                            		
	                            		that.execLoadList(that.loadParam);
	                            	}
	                            }
	                        });
	                	}
                    }	                
        		});
            },
            
            /**
             *  Set Combo boxes
             */
            setComboBoxes: function () {

                var sParam = {};

                /*
                 *  자산유형
                 */
                sParam = {};
                sParam.className = "CAPAS020-assetAddrRegionClCrtrCd-wrap";
                sParam.targetId = "assetAddrRegionClCrtrCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#check');
                sParam.cdNbr = "A0334";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);
                
                /*
                 *  자산유형
                 */
                sParam = {};
                sParam.className = "CAPAS020-assetAddrRegionClCd-wrap";
                sParam.targetId = "assetAddrRegionClCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#check');
                sParam.cdNbr = "A0333";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);

            },

            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]'), '9999-12-31');
                fn_makeDatePicker(this.$el.find('#search-condition-area [data-form-param="baseDt"]'));
            },

            /*
             * select record
             */
            selectRecord: function () {
                var that = this;

                if(!this.CAPAS020Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAS020Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                
                that.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').val(selectedRecord.assetAddrRegionClCrtrCd);
                that.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').prop("disabled", true);
                
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(XDate(selectedRecord.aplyStartDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
                
                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val(XDate(selectedRecord.aplyEndDt).toString('yyyy-MM-dd'));
//                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", true);
                
                that.$el.find('#detail-information-area [data-form-param="stutDongCd"]').val(selectedRecord.addrId);
//                that.$el.find('#detail-information-area [data-form-param="stutDongCd"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="stutDongAddrCntnt"]').val(selectedRecord.cityPrvncAddr + ' ' + selectedRecord.cityGunGuAddr
                																	 + ' ' + selectedRecord.emdongAddr + ' ' + selectedRecord.adriAddr);
                
                that.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCd"]').val(selectedRecord.assetAddrRegionClCd);
//                that.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCd"]').prop("disabled", false);
            },

            /*
             * Inquire with search conditions
             */
            inquireSearchCondition: function () {
            	
            	this.resetDetailInformation();

                var that = this;
                var sParam = {};

                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.baseDt = fn_getDateValue(this.$el.find('#search-condition-area  [data-form-param="baseDt"]').val());
                sParam.assetAddrRegionClCrtrCd = this.$el.find('#search-condition-area  [data-form-param="assetAddrRegionClCrtrCd"]').val();


                sParam.pgCnt = 100;
                sParam.pgNbr = 0;
                sParam.totCntInqryYn = "Y"; // 전체건수조회여부  

                that.loadParam = sParam;

                //load list
                that.execLoadList(sParam);
            },

            /*
             * Confirm delete item
             */
            saveSearchResult: function(){
            	var that = this;

             	/*
            	 * if delete list is empty
            	 */
            	if(that.deleteList.length == 0){
            		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-input-data-msg'));
            		return;
            	}
            	
            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var table = [];
                    var sParam = {};
                    
                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.addrId = data.addrId;
                        sub.assetAddrRegionClCrtrCd = data.assetAddrRegionClCrtrCd;
                        sub.assetAddrRegionClCd = data.assetAddrRegionClCd;                        
                        sub.aplyStartDt = data.aplyStartDt;
                        sub.aplyEndDt = data.aplyEndDt;
                        table.push(sub);					
                    });

                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.assetRegionList = table;

                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAS0200501"), "CaAssetRegionMgmtSvcDelIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

                                that.deleteList = [];
                                that.inquireSearchCondition();
                                that.resetDetailInformation();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }

                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },
            
            /*
             *  Add new amount type
             */
            saveDetailInformation: function(){


            		var that = this;
	                var sParam = {};
	                // 변경 
	                var srvcCd = "CAPAS0200101";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                
	                var selectedRecord = this.CAPAS020Grid.grid.getSelectionModel().selected.items[0];	                
	                if(selectedRecord) {	                	
	                	if(selectedRecord.data.aplyStartDt == this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val()) {
	                		return;
	                	}	                	
	                }
	                
	                sParam.instCd = $.sessionStorage('headerInstCd');
	                sParam.assetAddrRegionClCrtrCd = this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').val();
	                sParam.aplyStartDt = fn_getDateValue(this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val());
	                sParam.aplyEndDt = fn_getDateValue(this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val());
	                sParam.addrId = this.$el.find('#detail-information-area [data-form-param="stutDongCd"]').val();
	                sParam.assetAddrRegionClCd =  this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCd"]').val();  

	                var linkData = {"header": fn_getHeader(srvcCd), "CaAssetRegionMgmtSvcSaveIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

	                            that.resetDetailInformation();
	                            that.inquireSearchCondition();


	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);
            },

            /*
             * Toggle 
             */
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find("#btn-search-condition-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            toggleDetailInformation: function () {
                fn_pageLayerCtrl(this.$el.find('#detail-information-area'), this.$el.find("#btn-detail-information-toggle"));
            },

            /*
             * Reset
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
                this.$el.find('#search-condition-area [data-form-param="assetAddrRegionClCrtrCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="baseDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPAS020Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.deleteList = [];
            	this.initFlag = true;
            	
            	this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').val("");
            	this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').prop("disabled", false);
                
                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            	
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val("9999-12-31");
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);
                
                this.$el.find('#detail-information-area [data-form-param="stutDongCd"]').val("");
                this.$el.find('#detail-information-area [data-form-param="stutDongCd"]').prop("disabled", false);
                
                this.$el.find('#detail-information-area [data-form-param="stutDongAddrCntnt"]').val("");
                this.$el.find('#detail-information-area [data-form-param="stutDongAddrCntnt"]').prop("disabled", true);

                this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCd"]').val("");
                this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCd"]').prop("disabled", false);
                
//                this.CAPAS020Grid.grid.getSelectionModel().deselectAll();
            },
            
            changeAssetAddrRegionClCrtrCd: function () {
            	
            	var regionClCd = this.$el.find('#detail-information-area [data-form-param="assetAddrRegionClCrtrCd"]').val();
            	
            	if(regionClCd.length > 0) {
	            	sParam = {};
	                sParam.className = "CAPAS020-assetAddrRegionClCd-wrap";
	                sParam.targetId = "aaaa";
	                sParam.nullYn = "N";
	                sParam.allNm = bxMsg('cbb_items.SCRNITM#check');
	                sParam.cdNbr = regionClCd;
	                sParam.viewType = "ValNm"
	                fn_getCodeList(sParam, this);
            	}
            	
            	regionClCd = this.$el.find('#search-condition-area [data-form-param="assetAddrRegionClCrtrCd"]').val();
            	if(regionClCd.length > 0) {
	        		if(regionClCd == "A0335") {
	        			comboStore2 = comboStore3; 
	        		}
	        		else if(regionClCd == "A0336") {
	        			comboStore2 = comboStore4; 
	        		}
	        		else if(regionClCd == "A1060") {
	        			comboStore2 = comboStore5; 
	        		}
	        		else if(regionClCd == "A1061") {
	        			comboStore2 = comboStore6; 
	        		}
	        		this.CAPAS020Grid.grid.getStore().removeAll();
	        		this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
	        		this.CAPAS020Grid.grid.refresh();
            	}
            },
            
            execLoadList: function (sParam) {
            	
            	var that = this;
            	
            	var linkData = {
                        "header": fn_getHeader("CAPAS0200401"),
                        "CaAssetRegionMgmtSvcGetIn": sParam
                };

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAssetRegionMgmtSvcGetOut.assetRegionList) {
                                var tbList = responseData.CaAssetRegionMgmtSvcGetOut.assetRegionList;
                                var totCnt = tbList.length;

                                if (tbList != null || tbList.length > 0) {
                                	that.CAPAS020Grid.setData(tbList);
                                	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");
                                }
                            }
                        }
                    }
                });
            }
        }); // end of Backbone.View.extend({


        return CAPAS020View;
    } // end of define function
); // end of define
