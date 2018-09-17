define(
    [
     	'common/util',
     	'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
     	'views/online/trx-parameter/trx-parameter-popup',
     	'text!views/online/trx-parameter/component/trx-search-form.html',
     	'text!views/online/trx-parameter/component/trx-search-form-no-trxCd.html',
     	'text!views/online/trx-parameter/_trx-parameter-tpl.html'
    ],
    function(
    	commonUtil,
    	commonConfig,
    	ExtGrid,
    	LoadingBar,
    	TrxParameterPopup,
    	searchForm,
    	searchFormNoTrxCd,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl,
                'searchForm': commonConfig.useTrxCd ? searchForm : searchFormNoTrxCd
            },

            events: {
            	'click .reset-search-btn': 'resetSearch',
            	'click .search-btn': 'loadTrxParamList',
            	'enter-component .trx-parameter-search input': 'loadTrxParamList',

            	'click .del-trxparam-btn': 'deleteTrxParam',
            	'click .edit-trxparam-btn': 'showEditTrxParamPopup',

                'click .detail-search-wrap .expand-detail-btn': 'expandAllDetail',
                'click .detail-search-wrap .collapse-detail-btn': 'collapseAllDetail'
            },

            trxCd: null,
            bxmAppId: null,
            svcNm: null,
            opNm: null,
            detailData: null,

            initialize: function() {

            	var that = this;

            	// Set Page
                that.$el.html(that.tpl());
                if(!commonConfig.useTrxCd) {
                	that.$el.find('li.trx-code').hide();
                }

                // Set searchForm
                that.$trxParameterSearch = that.$el.find('.trx-parameter-search');
                that.$trxParameterSearch.html(that.searchForm());

                // Set SubViews
                that.subViews['trxParameterPopup'] = new TrxParameterPopup();

                that.subViews['trxParameterPopup'].on('edit-trxparam', function(){
                	var selectedIdx = that.trxParameterGrid.getSelectedRowIdx();

                	that.trxParameterGrid.reloadData(function(){
                		if(selectedIdx === -1){

                			that.loadTrxParam({
                				trxCd: that.trxCd,
                				bxmAppId: that.bxmAppId,
                				svcNm: that.svcNm,
                				opNm: that.opNm
                			});
                		} else {
                			that.trxParameterGrid.setSelectedRowIdx(selectedIdx);
                		}
                	});
                });

                that.subViews['trxParameterPopup'].on('add-trxparam', function(){
                	that.trxParameterGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();


                var fieldsAndColumns = {};

            	if(commonConfig.useTrxCd){
            		fieldsAndColumns = {
						fields: ['trxNm', 'trxCd', 'bxmAppId', 'svcNm', 'opNm', 'regUserId', 'regOccurDttm'],

						columns: [
            		          {text: bxMsg('online.trx-name'), flex: 1, dataIndex: 'trxNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.trx-code'), flex: 0.5, dataIndex: 'trxCd', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.application'), flex: 0.5, dataIndex: 'bxmAppId', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.service'), flex: 0.5, dataIndex: 'svcNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.operation'), flex: 0.5, dataIndex: 'opNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.register-id'), flex: 0.25, dataIndex: 'regUserId', align:'center'},
            		          {text: bxMsg('online.register-date'), flex: 0.6, dataIndex: 'regOccurDttm', align:'center'},
            		          {
            		        	  text:bxMsg('common.del'),
            		        	  renderer: function (value, p, record, idx) {
            		        		  return Ext.String.format(
            		        				  '<button type="button" class="bw-btn del-trxparam-btn" data-app-id="{0}" data-svc-nm="{1}" data-op-nm="{2}" data-trx-cd="{3}"><i class="bw-icon i-20 i-func-trash"></i></button>',
            		        				  record.get('bxmAppId'),
            		        				  record.get('svcNm'),
            		        				  record.get('opNm'),
            		        				  record.get('trxCd')
            		        		  );
            		        	  },
            		        	  sortable: false,
            		        	  align: 'center',
            		        	  width: 50
            		          }
            		          ]
            		};

            	} else {
            		fieldsAndColumns = {
						fields: ['trxNm', 'trxCd', 'bxmAppId', 'svcNm', 'opNm', 'regUserId', 'regOccurDttm'],

						columns: [
            		          {text: bxMsg('online.trx-name'), flex: 0.6, dataIndex: 'trxNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.application'), flex: 1, dataIndex: 'bxmAppId', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.service'), flex: 0.7, dataIndex: 'svcNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.operation'), flex: 0.7, dataIndex: 'opNm', style: 'text-align:center', tdCls: 'left-align'},
            		          {text: bxMsg('online.register-id'), width: 100, dataIndex: 'regUserId', align:'center'},
            		          {text: bxMsg('online.register-date'), width: 140, dataIndex: 'regOccurDttm', align:'center'},
            		          {
            		        	  text:bxMsg('common.del'),
            		        	  renderer: function (value, p, record, idx){
            		        		  return Ext.String.format(
            		        				  '<button type="button" class="bw-btn del-trxparam-btn" data-app-id="{0}" data-svc-nm="{1}" data-op-nm="{2}" data-trx-cd="{3}"><i class="bw-icon i-20 i-func-trash"></i></button>',
            		        				  record.get('bxmAppId'),
            		        				  record.get('svcNm'),
            		        				  record.get('opNm'),
            		        				  record.get('trxCd')
            		        		  );
            		        	  },

            		        	  sortable: false,
            		        	  align: 'center',
            		        	  width: 50
            		          }
            		    ]
					};
            	}

                // Set Grid
                that.trxParameterGrid = new ExtGrid($.extend({

                	requestParam: {
                		obj: commonUtil.getBxmReqData('TrxInfoService', 'getTrxInfoList', 'TrxInfoSearchConditionOMM'),
                		key: 'TrxInfoSearchConditionOMM'
                	},

                	responseParam: {
                		objKey: 'TrxInfoListOMM',
                		key: 'trxInfoList'
                	},

                	header: {
                		pageCount: true,
                		button: [
                		    {
                		    	html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                		    		+ bxMsg('common.add') + '"></i></button>',
                		    	event: function() {
                		    		that.subViews['trxParameterPopup'].render();
                		    	}
                		    },

                		    {
                		    	html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="'
                		    		+ bxMsg('common.excel-download') + '"></i></button>',
                		    	event: function() {
                		    		swal({
                		    				title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                		    		},
                		    		function(){
                		    			// 요청 객체 생성
                		    			var requestParam = commonUtil.getBxmReqData('TrxInfoService', 'trxInfoExcelExport', 'TrxInfoOMM');

                		    			// Ajax 요청
                		    			commonUtil.requestBxmAjax(requestParam, {
                		    				success: function(response) {
                		    					var filePath = response.ExcelExportOMM.filePath;

                		    					commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                		    				}
                		    			});
                		    		});
                		    	}
                		    }
                		]
                	},

                	paging: true,

                	 listeners: {
                		 select: function(_this, record){
                			 that.loadTrxParam({trxCd: record.get('trxCd'), bxmAppId: record.get('bxmAppId'), svcNm: record.get('svcNm'), opNm: record.get('opNm')});
                		 }
                	 }
                }, fieldsAndColumns));
                
                
                //interface mapping input grid
            	that.infGrid = new ExtGrid({
                    header: {},
                    pageCountDefaultVal: 3,
                    gridToggle: false,

                    fields: ['chlTypeCd', 'inputMappingRuleType', 'inputMapId', 'inputClassNm', 'outputMappingRuleType', 'outputMapId', 'outputClassNm'],
                    columns: [
                        {text: bxMsg('online.channel-type-cd'), flex: 1, sortable: false, dataIndex: 'chlTypeCd', align:'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMDT0001'][value];
                        	}
                        },
                        {text: bxMsg('online.interface-input-mapping-type'), flex: 1, sortable: false, dataIndex: 'inputMappingRuleType', align:'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMAD0038'][value];
                        	}
                        },
                        {text: bxMsg('online.interface-input-map-id'), flex: 2, sortable: false, dataIndex: 'inputMapId', align:'center'},
                        {text: bxMsg('online.interface-input-fqn'), flex: 3, sortable: false, dataIndex: 'inputClassNm', align:'center'},
                        {text: bxMsg('online.interface-output-mapping-type'), flex: 1, sortable: false, dataIndex: 'outputMappingRuleType', align:'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMAD0038'][value];
                        	}
                        },
                        {text: bxMsg('online.interface-output-map-id'), flex: 2, sortable: false, dataIndex: 'outputMapId', align:'center'},
                        {text: bxMsg('online.interface-output-fqn'), flex: 3, sortable: false, dataIndex: 'outputClassNm', align:'center'}
                    ]
            	});
            	
                // DOM Element Cache
                that.$trxParameterGrid = that.$el.find('.trx-parameter-grid');
                that.$trxParameterDetail = that.$el.find('.trx-parameter-detail');
                that.$infMappingGrid = that.$trxParameterDetail.find('.interface-grid');
                that.$trxParameterDetailTitle = that.$el.find('h3 > .trx-parameter-detail-title');
                that.$detailAccordionWrap = that.$el.find('.trx-param-accordion');

                // apply accordion format
                commonUtil.setExpandAccordion(that.$detailAccordionWrap, {
					slideDownFn: function(param) {
						// 인터페이스 맵핑 설정 탭일 경우 그리드 리사이즈 처리
						if(param.currContent.find('.interface-grid').length !== 0){
							that.infGrid.resizeGrid();
						}
					}
				});
                
                // scroll to the clicked accordion content when it expanded for better UX
                that.$detailAccordionWrap.children('div').on('doneSlideDown', function () {
                    // When accordions are expanding, only the first accordion animates scrolling down.
                    // Encountered the last accordion means accordion expanding finished(allAccordionExpanding = false).
                    if (that.allAccordionExpanding) {
                        if (!$(this).prev().prev().length) {
                            that.$el.parent().animate({ scrollTop: $(this).position().top + 574 });
                        } else if (!$(this).next().length) {
                            that.allAccordionExpanding = false;
                        }
                        return;
                    }
                    that.$el.parent().animate({ scrollTop: $(this).position().top + 574 });
                });
            },

            render: function() {
            	var that = this;

            	// Set linked-flow & inf-mapping field
//                if(commonConfig.extraOption['linkedFlow'] == 'false') {
//                	that.$detailAccordionWrap.find('.linked-flow').remove();
//                }
//                if(commonConfig.extraOption['infMapping'] == 'false') {
//                	that.$detailAccordionWrap.find('.inf-mapping').remove();
//                } else {
//                	that.$infMappingGrid.html(that.infGrid.render());
//                }
            	if(commonConfig.extraOption['bxm.system.enable.incubating.feature'] === 'false') {
            		that.$detailAccordionWrap.find('.linked-flow').remove();
                	that.$detailAccordionWrap.find('.inf-mapping').remove();
            	} else {
            		that.$infMappingGrid.html(that.infGrid.render());
            	}
                
            	that.$trxParameterGrid.html(that.trxParameterGrid.render(function(){that.loadTrxParamList();}));
            	that.$trxParameterDetail.append(that.subViews['detailLoadingBar'].render());

                return this.$el;
            },

            resetSearch: function() {
            	this.$trxParameterSearch.find('input[data-form-param]').val('');
            },

            loadTrxParamList: function() {
            	var that= this,
            		params =commonUtil.makeParamFromForm(this.$trxParameterSearch);
            	this.trxParameterGrid.loadData(params, function(data) {
            		data = data['trxInfoList'];
            		if(data && data.length) {
            			that.$trxParameterGrid.find('tbody tr:first-child').click();
            		} else {
            			that.$trxParameterDetail.find('[data-form-param]').val('');
            			that.$trxParameterDetailTitle.text('');
            		}
            		
            	}, true);
            },

            deleteTrxParam: function(e){
            	var that = this,
            		$target = $(e.currentTarget),
            		requestParam;

            	swal({
            			title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
            	},
            	function() {
            		//요청객체 생성
            		requestParam = commonUtil.getBxmReqData(
            			'TrxInfoService', 'removeTrxInfo', 'TrxInfoOMM',
            			{
            				trxCd: $target.attr('data-trx-cd'),
            				bxmAppId: $target.attr('data-app-id'),
            				svcNm: $target.attr('data-svc-nm'),
            				opNm: $target.attr('data-op-nm')
            			}
            		);

            		// Ajax 요청
            		commonUtil.requestBxmAjax(requestParam, {
            			success: function(response) {
            				var code = response.ResponseCode.code;

            				if(code === 200){
            					swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

            					//그리드 reload
            					that.trxParameterGrid.reloadData();

            					//상세 초기화
            					that.$trxParameterDetailTitle.text('');
            					that.$trxParameterDetail.find('[data-form-param]').val('');
            				} else if(code === 201) {
            					swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            				}
            			}
            		});
            	});
            },

            showEditTrxParamPopup: function(){
            	var renderData = commonUtil.makeParamFromForm(this.$trxParameterDetail);

            	if(!renderData.bxmAppId) {
            		swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            		return;
            	}

            	renderData.infMapping = this.detailData['infMapping'];
            	
            	this.subViews['trxParameterPopup'].render(renderData);
            },

            expandAllDetail: function () {
                var that = this;

                // When all accordion are expanding, animations for each accordion are disabled but the last one.
                that.allAccordionExpanding = true;
                that.$detailAccordionWrap.children('h3').each(function(i, item) {
                    var $item = $(item);

                    if (!$item.hasClass('accordion-header-active')) {
                        $item.trigger('click');
                    }
                });
            },

            collapseAllDetail: function () {
                this.$detailAccordionWrap.children('h3').each(function(i, item) {
                    var $item = $(item);

                    if ($item.hasClass('accordion-header-active')) {
                        $item.trigger('click');
                    }
                });
            },

            loadTrxParam: function(param){
            	var that = this,
            		requestParam;

            	that.trxCd = param.trxCd;
            	that.bxmAppId = param.bxmAppId;
            	that.svcNm = param.svcNm;
            	that.opNm = param.opNm;

            	//요청 객체 생성
            	requestParam = commonUtil.getBxmReqData(
            			'TrxInfoService', 'getTrxInfo', 'TrxInfoOMM',
            			{
            				trxCd: param.trxCd,
            				bxmAppId: param.bxmAppId,
            				svcNm: param.svcNm,
            				opNm: param.opNm
            			}
            		);

            	//Ajax 요청
            	commonUtil.requestBxmAjax(requestParam, {
            		beforeSend: function(){
            			that.subViews['detailLoadingBar'].show();
            		},
            		success: function(response) {
            			var trxInfoOMM = response.TrxInfoOMM;
            			that.detailData = $.extend(true, {}, trxInfoOMM);
            			
            			if(commonConfig.useTrxCd){
            				that.$trxParameterDetailTitle.text(trxInfoOMM.trxCd);
            			}
            			
                        trxInfoOMM.daySuspStartTime = trxInfoOMM.daySuspStartTime && commonUtil.changeStringToTimeString(trxInfoOMM.daySuspStartTime);
                        trxInfoOMM.daySuspEndTime = trxInfoOMM.daySuspEndTime && commonUtil.changeStringToTimeString(trxInfoOMM.daySuspEndTime);
                        trxInfoOMM.trxCtrlStartDttm = trxInfoOMM.trxCtrlStartDttm && commonUtil.changeStringToFullTimeString(trxInfoOMM.trxCtrlStartDttm);
                        trxInfoOMM.trxCtrlEndDttm = trxInfoOMM.trxCtrlEndDttm && commonUtil.changeStringToFullTimeString(trxInfoOMM.trxCtrlEndDttm);
            			commonUtil.makeFormFromParam(that.$trxParameterDetail, trxInfoOMM);
            			that.infGrid.loadData(requestParam, getSetGridHeightFunc(), true, trxInfoOMM, 'infMapping');
            		
            			// closure
                        function getSetGridHeightFunc() {
                            return function () {
                            	that.infGrid.setGridHeight(trxInfoOMM.infMapping.length);
                            }
                        }
            		},
            		complete: function(){
            			that.subViews['detailLoadingBar'].hide();
            		}
            	});
            }
        });
    }
);