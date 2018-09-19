define(
    [
     	'common/util',
     	'common/config',
     	'common/component/ext-grid/_ext-grid',
     	'common/component/loading-bar/_loading-bar',
     	'views/setting/ondemandurl-setting/ondemandurl-setting-popup',
        'text!views/setting/ondemandurl-setting/_ondemandurl-setting-tpl.html'
    ],
    function(
    	commonUtil,
    	commonConfig,
    	ExtGrid,
    	LoadingBar,
    	BatchUrlSettingPopup,
        tpl

    ) {

        var OndemandurlSettingView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },
            
            events: {
            	
            	'click .del-batchurl-btn': 'deleteBatchUrl',
            	'click .edit-batchurl-btn': 'showEditBatchUrlPopup'
            		
            },
            
            batchUrl: null,

            initialize: function() {
            	
            	var that = this;
            	
                // Set Page
                that.$el.html(that.tpl());
                
                // Set SubViews
                that.subViews['batchUrlSettingPopup'] = new BatchUrlSettingPopup();
                
                that.subViews['batchUrlSettingPopup'].on('edit-batchurl', function(){
                	
                	var selectedIdx = that.batchUrlSettingGrid.getSelectedRowIdx();
                	
                	that.batchUrlSettingGrid.reloadData(function(){
                		if(selectedIdx === -1){
                			that.loadBatchUrl({batchUrl: that.batchUrl});
                		}else{
                			that.batchUrlSettingGrid.setSelectedRowIdx(selectedIdx);
                		}
                	});
                });
                
                that.subViews['batchUrlSettingPopup'].on('add-batchurl', function(){
                	that.batchUrlSettingGrid.reloadData();
                });
                
                that.subViews['detailLoadingBar'] = new LoadingBar();
                
                // Set Grid
                that.batchUrlSettingGrid = new ExtGrid({
                	
                	// ------------admin 옵션--------------
                	requestParam: {
                		obj: commonUtil.getBxmReqData('BatchUrlService', 'getBatchUrlList', 'PageCountOMM'),
                		key: 'PageCountOMM'
                	},
                	
                	responseParam: {
                		objKey: 'BatchUrlListOMM',
                		key: 'batchUrlList'
                	},
                	
                	paging: true,
                	
                	header: {
                		pageCount: true,
                		button: [{
                			html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                			event: function() {
                				that.subViews['batchUrlSettingPopup'].render();
                			}
                		}]
                	},
                	
                	// -------------ext 옵션-------------
                	fields: ['urlTypeCd','batchUrl', 'batchUrlDesc', 'useYn', 'regUserId', 'regOccurDttm'],
                	
                	columns: [
                	          {text: bxMsg('setting.url-type'), flex: 0.3, dataIndex: 'urlTypeCd', align: 'center',
                	        	 renderer: function(value) {
                	        		 return commonConfig.comCdList['BXMAD0041'][value];
                	        	 }
                	          },
                	          {text: bxMsg('setting.batch-driving-url'), flex: 1, dataIndex: 'batchUrl', style: 'text-align:center', tdCls: 'left-align'},
                	          {text: bxMsg('setting.description'), flex: 0.7, dataIndex: 'batchUrlDesc', style: 'text-align:center', tdCls: 'left-align'},
                	          {text: bxMsg('setting.use-yn'), width: 90, dataIndex: 'useYn', align: 'center'},
                	          {text: bxMsg('setting.register-id'), width: 100, dataIndex: 'regUserId', align: 'center'},
                	          {text: bxMsg('setting.register-date'), width: 140, dataIndex: 'regOccurDttm', align: 'center'},
                	          {
                	        	  text: bxMsg('common.del'),
                	        	  renderer: function (value, p, record, idx){
                	        		  return Ext.String.format(
                	        			  '<button type="button" class="bw-btn del-batchurl-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                	        			  record.get('batchUrl')
                	        		  );
                	        	  },
                	        	  sortable: false,
                	        	  menuDisabled: true,
                	        	  align: 'center',
                	        	  width: 50
                	          }
                	          ],
                	 listeners: {
                		 select: function(_this, record){
                			 that.loadBatchUrl({batchUrl: record.get('batchUrl')});
                		 }
                	 }
                });
                
                // DOM Element Cache
                that.$batchUrlSettingGrid = that.$el.find('.batchurl-setting-grid');
                that.$batchUrlSettingDetail = that.$el.find('.batchurl-setting-detail');
                that.$batchUrlSettingDetailTitle = that.$el.find('h3 > .batchurl-setting-detail-title');
            },

            render: function() {
            	var that = this;
            	
            	that.$batchUrlSettingGrid.html(that.batchUrlSettingGrid.render(function(){that.loadBatchUrlList();}));
            	that.$batchUrlSettingDetail.append(that.subViews['detailLoadingBar'].render());
            	
                return that.$el; 
            },

           
            loadBatchUrlList: function(){
            	var that = this;
            	/*
            	 *this.batchUrlSettingGrid.loadData(bodyParam, loadAfter, initActivePaging) 에서 bodyParam이 들어갈 곳
             	 *Search 조건을 찾아서 그리는 건데, BatchUrl에는 Search조건이 없음.
             	 *Object()라고 빈 값을 넣어주면 _ext-grid.js의 loadData에서 처리함
            	 */
            	this.batchUrlSettingGrid.loadData(null, function(data) {
            		data = data['batchUrlList'];
            		if(data && data.length) {
            			that.$batchUrlSettingGrid.find('tbody tr:first-child').click();
            		}
            	}, true);

            },
            
            deleteBatchUrl: function(e){
            	var that = this,
            		$target = $(e.currentTarget),
            		requestParam;
            	
            	swal(
            			{title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false},
            		
            		function(){
            			swal({
            					title: '', text: bxMsg('common.password-msg'), type: "input", inputType: 'password',
            					showCancelButton: true, closeOnConfirm: false, inputPlaceholder: bxMsg('setting.pwd')
            				},
            				function(inputValue){
            					if (inputValue === false) return false;
            					
            					if (inputValue.trim() === "") {
            						swal.showInputError(bxMsg('common.password-msg'));
            						return false;
            					}
            					
            					// 요청 객체 생성
            					requestParam = commonUtil.getBxmReqData(
            							'BatchUrlService', 'removeBatchUrl', 'BatchUrlPwdOMM',
            							{
            								batchUrl: $target.attr('data-id'),
            								password: inputValue
            							}
            						);
            					
            					// Ajax 요청
            					commonUtil.requestBxmAjax(requestParam, {
            						success: function(response) {
            							var code = response.ResponseCode.code;
            							
            							if(code ===200) {
            								swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            								
            								// 그리드 reload
            								that.batchUrlSettingGrid.reloadData();
            								
            								// 상세 초기화
            								that.$batchUrlSettingDetailTitle.text('');
            								that.$batchUrlSettingDetail.find('input[data-form-param]').val('');
            							}else if(code === 205){
            								swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
            							}
            						}
            					});
            				});
            		}
            	);
            },
            
            showEditBatchUrlPopup: function(){
            	var renderData = commonUtil.makeParamFromForm(this.$batchUrlSettingDetail);
            	
            	if(!renderData.batchUrl) {
            		swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer:500, showConfirmButton: false});
            		return;
            	}
            	
            	this.subViews['batchUrlSettingPopup'].render(renderData);
            },
            
            loadBatchUrl: function(param) {
            	var that = this,
            		requestParam;
            	
            	that.batchUrl = param.batchUrl;
            	
            	//요청 객체 생성
            	requestParam = commonUtil.getBxmReqData(
            		'BatchUrlService', 'getBatchUrlInfo', 'BatchUrlOMM',
            		{
            			batchUrl: param.batchUrl
            		}
            	);
            	
            	//Ajax 요청
            	commonUtil.requestBxmAjax(requestParam, {
            		beforeSend: function(){
            			that.subViews['detailLoadingBar'].show();
            		},
            		success: function(response){
            			var batchUrlOMM = response.BatchUrlOMM;
            			
            			that.$batchUrlSettingDetailTitle.text(batchUrlOMM.batchUrl);
            			commonUtil.makeFormFromParam(that.$batchUrlSettingDetail, batchUrlOMM);
            			
            			/*
            			 * makeFormFromParam에 data-value 값을 넣어 주면 data-form-param 값이 아닌 value 값이 화면에 뜨게 만듦.
            			 */
//            			if (batchUrlOMM.batchUrlTypeCd === 1) {
//            				that.$el.find('input[data-form-param="batchUrlTypeCd"]').val('온라인→배치 호출 URL');
//            			} else if (batchUrlOMM.batchUrlTypeCd === 2) {
//            				that.$el.find('input[data-form-param="batchUrlTypeCd"]').val('배치→온라인 호출 URL');
//            			}
            			
            		},
            		complete: function(){
            			that.subViews['detailLoadingBar'].hide();
            		}
            	});
            }

        });

        return OndemandurlSettingView;
    }
);
