define(
	[
	 	'common/util',
	 	'common/config',
        'common/component/ext-grid/_ext-grid',
	 	'common/component/popup/popup',
        'text!views/online/trx-parameter/trx-parameter-popup-tpl.html'
	 ],
	 function(
		commonUtil,
		commonConfig,
		ExtGrid,
		Popup,
		tpl
	) {
	    return Popup.extend({

			className: 'md-large trx-param-popup',

			templates: {
				'tpl': tpl
			},

			events: {
				'click .detail-search-wrap .expand-detail-btn': 'expandAllDetail',
				'click .detail-search-wrap .collapse-detail-btn': 'collapseAllDetail',

				'change .channel-change': 'changeChannel',
				'change .branch-change': 'changeBranch',
				'change .manager-change': 'changeManager',
				'change .ip-control-change': 'changeIpControl',
				'change .ctrl-change': 'changeCtrl',
				'change .logf-change': 'changeLogf',
				'change .link-type-change' : 'changeLinkType',

				'click .save-trxparam-btn': 'saveTrxParameter',
				'click .cancel-btn': 'close'
			},

			mode: '',

			gridHeight: 0,
			initialize: function() {},
			
            render: function(trxParamData) {
			    var that = this;

				that.mode = trxParamData ? 'edit' : 'add';

				that.$el.html(that.tpl(trxParamData));
				that.initializeView(trxParamData);

				if(!commonConfig.useTrxCd) {
					that.$el.find('li.trx-code').hide();
				}

				that.renderDatePicker();
                that.loadCode(trxParamData);

				that.changeChannel();
				that.changeBranch();
				that.changeManager();
				that.changeIpControl();
				that.changeCtrl();
				that.changeLogf();
				that.changeLinkType();

				that.setDraggable();

				that.show();

//				commonUtil.setExpandAccordion(that.$detailAccordionWrap);

				// apply accordion format
                commonUtil.setExpandAccordion(that.$detailAccordionWrap, {
					slideDownFn: function(param) {
						// 인터페이스 맵핑 설정 탭일 경우 그리드 리사이즈 처리
						if(param.currContent.find('.interface-input-grid').length !== 0){
							that.infInputGrid.resizeGrid();
						}
					}
				});
				
                // scroll to the clicked accordion content when it expanded for better UX
                that.$detailWrap.children('div').on('doneSlideDown', function (e, header) {
                    // When accordions are expanding, only the first accordion animates scrolling down.
                    // Encountered the last accordion means accordion expanding finished(allAccordionExpanding = false).
                    if (that.allAccordionExpanding) {
                        if (!$(header).prev().length) {
                            that.$detailWrap.animate({ scrollTop: that.$detailWrap.scrollTop() + (header ? $(header).position().top : 1000) - 65 });
                        } else if (!$(header).next().next().length) {
                            that.allAccordionExpanding = false;
                        }
                        return;
                    }
                    that.$detailWrap.animate({ scrollTop: that.$detailWrap.scrollTop() + (header ? $(header).position().top : 1000) - 65 });
                });
            },

            initializeView: function() {
            	var that = this;

            	//grids
            	that.infInputGrid = new ExtGrid({
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                	that.gridHeight = that.infInputGrid.getAllData().length;
                                    that.infInputGrid.addData({inputMappingRuleType: 'A', outputMappingRuleType: 'A', chlTypeCd: 'A0'}); //dependent common code (BXMDT0001)
                                    that.infInputGrid.update();
                                    that.infInputGrid.setGridHeight(that.gridHeight + 1);
                                }
                            }
                        ]
                    },
                    pageCountDefaultVal: 4,
                    gridToggle: false,

                    fields: ['chlTypeCd', 'inputMappingRuleType', 'inputMapId', 'inputClassNm', 'outputMappingRuleType', 'outputMapId', 'outputClassNm'],
                    columns: [
						{text: bxMsg('online.channel-type-cd'), flex: 1, dataIndex: 'chlTypeCd', align:'center',
							editor : {
                                xtype : 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(commonConfig.comCdList['BXMDT0001'])
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function(value) {
                            	return commonConfig.comCdList['BXMDT0001'][value];
                            }
						},
						{text: bxMsg('online.interface-input-mapping-type'), flex: 1, dataIndex: 'inputMappingRuleType', align:'center',
							editor : {
                                xtype : 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(commonConfig.comCdList['BXMAD0038'])
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function(value) {
                            	return commonConfig.comCdList['BXMAD0038'][value];
                            }
						},
						{text: bxMsg('online.interface-input-map-id'), flex: 2, dataIndex: 'inputMapId', align:'center',
							editor : {
                                xtype : 'textfield',
                                allowBlank :false
                            }
						},
						{text: bxMsg('online.interface-input-fqn'), flex: 3, dataIndex: 'inputClassNm', align:'center',
							editor : {
                                xtype : 'textfield',
                                allowBlank :false
                            }	
						},
						{text: bxMsg('online.interface-output-mapping-type'), flex: 1, dataIndex: 'outputMappingRuleType', align:'center',
							editor : {
                                xtype : 'combobox',
                                allowBlank: false,
                                forceSelection: true,
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['key', 'value'],
                                    data: commonUtil.convertObjectToKeyValueArray(commonConfig.comCdList['BXMAD0038'])
                                }),
                                displayField: 'value',
                                valueField: 'key'
                            },
                            renderer: function(value) {
                            	return commonConfig.comCdList['BXMAD0038'][value];
                            }
						},
						{text: bxMsg('online.interface-output-map-id'), flex: 2, dataIndex: 'outputMapId', align:'center',
							editor : {
                                xtype : 'textfield',
                                allowBlank :false
                            }
						},
						{text: bxMsg('online.interface-output-fqn'), flex: 3, dataIndex: 'outputClassNm', align:'center',
							editor : {
                                xtype : 'textfield',
                                allowBlank :false
                            }	
						},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (){
                                return '<button type="button" class="bw-btn grid-del-btn"><i class="bw-icon i-20 i-func-trash"></i></button>'
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        cellclick: function(_this, td, cellIndex, record, tr, rowIndex) {
                            if (cellIndex === 7) {
                                that.infInputGrid.store.removeAt(rowIndex);
                                that.infInputGrid.setGridHeight(that.infInputGrid.getAllData().length);
                            }
                        }
                    },
                    gridConfig: {
//                        hidden: true,
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
            	});
            	
            	that.$detailWrap = that.$el.find('.trx-parameter-form');
            	that.$detailAccordionWrap = that.$el.find('.trx-param-pop-accordion');
                that.$trxCtrlStartDttm = that.$detailWrap.find('input[data-form-param="trxCtrlStartDttm"]');
                that.$trxCtrlStartTime = that.$detailWrap.find('.trx-ctrl-start-time');
                that.$trxCtrlEndDttm = that.$detailWrap.find('input[data-form-param="trxCtrlEndDttm"]');
                that.$trxCtrlEndTime = that.$detailWrap.find('.trx-ctrl-end-time');
                that.$infInputMappingGrid = that.$detailAccordionWrap.find('.interface-input-grid');
            
                
            	// Set linked-flow & inf-mapping field
//                if(commonConfig.extraOption['linkedFlow'] == 'false') {
//                	that.$detailAccordionWrap.find('.linked-flow').hide();
//                }
//                if(commonConfig.extraOption['infMapping'] == 'false') {
//                	that.$detailAccordionWrap.find('.inf-mapping').hide();
//                } else {
//                	//render Grid
//                	that.$infInputMappingGrid.html(that.infInputGrid.render());
//                }
                
                if(commonConfig.extraOption['bxm.system.enable.incubating.feature'] === 'false') {
                	that.$detailAccordionWrap.find('.inf-mapping').hide();
                	that.$detailAccordionWrap.find('.linked-flow').hide();
                } else {
                	that.$infInputMappingGrid.html(that.infInputGrid.render());
                }
            },
            
			loadCode: function(trxParamData) {

				var that= this,
					$logLevelSelect,

					$frcdTransYn,
					$trxLogSkipYn,
					$imgLogSkipYn,
					$bizLogTrxType,

					$channelCtrlSelect,
					$branchCtrlSelect,
					$managerCtrlSelect,
                    $ipCtrlListTypeCdSelect,

					$linkTrxYn,
					$holidayTrxYn,
					$afterEndTrxYn,

					$trxCtrlCdSelect,
					$frcdLogCtrlSelect,
					$frcdLogLevelSelect,
					
					$linkTrxTypeCd,
					
					$infInputMappingType,
					$infOutputMappingType;

				//// 로그레벨 코드 ////
				$logLevelSelect = that.$el.find('select[data-form-param="logLvNm"]');
				$logLevelSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0009']));

				$frcdTransYn = that.$el.find('select[data-form-param="frcdTranYn"]');
				$trxLogSkipYn = that.$el.find('select[data-form-param="trxLogSkipYn"]');
				$imgLogSkipYn = that.$el.find('select[data-form-param="imgLogSkipYn"]');

				$bizLogTrxType = that.$el.find('select[data-form-param="bizLogTrxTypeCd"]');
				$bizLogTrxType.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0039']));																				
	
				//// 거래제어 속성 코드 - 채널 ////
				$channelCtrlSelect = that.$el.find('select[data-form-param="chlCtrlListTypeCd"]');
				$channelCtrlSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0007']));

				//// 거래제어 속성 코드 - 영업점 ////
				$branchCtrlSelect = that.$el.find('select[data-form-param="branchCtrlListTypeCd"]');
				$branchCtrlSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0007']));

				//// 거래제어 속성 코드 - 조작자 ////
				$managerCtrlSelect = that.$el.find('select[data-form-param="userCtrlListTypeCd"]');
				$managerCtrlSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0007']));

                $ipCtrlListTypeCdSelect = that.$el.find('select[data-form-param="ipCtrlListTypeCd"]');
                $ipCtrlListTypeCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0007']));

                $linkTrxYn = that.$el.find('select[data-form-param="linkTrxUseYn"]');
				$holidayTrxYn = that.$el.find('select[data-form-param="hdayTrxUseYn"]');
				$afterEndTrxYn = that.$el.find('select[data-form-param="edayTrxUseYn"]');

				//// 거래제어 사유 코드 ////
				$trxCtrlCdSelect = that.$el.find('select[data-form-param="trxCtrlCd"]');
				$trxCtrlCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0005']));

				//// 강제 로그 제어 코드 ////
				$frcdLogCtrlSelect = that.$el.find('select[data-form-param="logfTypeCd"]');
				$frcdLogCtrlSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0004']));

				//// 강제 로그 레벨 코드 ////
				$frcdLogLevelSelect = that.$el.find('select[data-form-param="logfLogLvNm"]');
				$frcdLogLevelSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0009']));

				$linkTrxTypeCd = that.$el.find('select[data-form-param="linkTrxTypeCd"]');
				$linkTrxTypeCd.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0034']));

				$infInputMappingType = that.$el.find('select[data-form-param="infInputMappingRuleType"]');
				$infInputMappingType.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0038']));
				
				$infOutputMappingType = that.$el.find('select[data-form-param="infOutputMappingRuleType"]');
				$infOutputMappingType.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0038']));
				
				if(that.mode === 'edit') {
					
					that.infInputGrid.loadData({}, getSetGridHeightFunc('input'), true, trxParamData, 'infMapping');

					$logLevelSelect.val(trxParamData.logLvNm);
					$frcdTransYn.val(trxParamData.frcdTranYn);
					$trxLogSkipYn.val(trxParamData.trxLogSkipYn);
					$imgLogSkipYn.val(trxParamData.imgLogSkipYn);
					$bizLogTrxType.val(trxParamData.bizLogTrxTypeCd);
					$channelCtrlSelect.val(trxParamData.chlCtrlListTypeCd);
					$branchCtrlSelect.val(trxParamData.branchCtrlListTypeCd);
					$managerCtrlSelect.val(trxParamData.userCtrlListTypeCd);
                    $ipCtrlListTypeCdSelect.val(trxParamData.ipCtrlListTypeCd);
					$linkTrxYn.val(trxParamData.linkTrxUseYn);
					$holidayTrxYn.val(trxParamData.hdayTrxUseYn);
					$afterEndTrxYn.val(trxParamData.edayTrxUseYn);
					$trxCtrlCdSelect.val(trxParamData.trxCtrlCd);
					$frcdLogCtrlSelect.val(trxParamData.logfTypeCd);
					$frcdLogLevelSelect.val(trxParamData.logfLogLvNm);
					$linkTrxTypeCd.val(trxParamData.linkTrxTypeCd);

					that.$trxCtrlStartDttm.datepicker('setDate', trxParamData.trxCtrlStartDttm.substring(0, 10));
					that.$trxCtrlStartTime.val(trxParamData.trxCtrlStartDttm.substring(11));
					that.$trxCtrlEndDttm.datepicker('setDate', trxParamData.trxCtrlEndDttm.substring(0, 10));
					that.$trxCtrlEndTime.val(trxParamData.trxCtrlEndDttm.substring(11));
                } else {
					$logLevelSelect.val('DEFAULT');
					$frcdTransYn.val('N');
					$trxLogSkipYn.val('N');
					$imgLogSkipYn.val('N');
					$bizLogTrxType.val('0');		 
					$channelCtrlSelect.val('0');
					$branchCtrlSelect.val('0');
					$managerCtrlSelect.val('0');
                    $ipCtrlListTypeCdSelect.val('0');
					$linkTrxYn.val('N');
					$holidayTrxYn.val('N');
					$afterEndTrxYn.val('N');
					$trxCtrlCdSelect.val('0');
					$frcdLogCtrlSelect.val('0');
					$frcdLogLevelSelect.val('DEFAULT');
					$linkTrxTypeCd.val('B');
				};
				
				
//				that.infOutputGrid.loadData({}, getSetGridHeightFunc('output'), true, trxParamData, 'infMapping');
				
				// closure
                function getSetGridHeightFunc(key) {
                    return function () {
                    	if(key === 'input') {
                    		that.infInputGrid.setGridHeight(trxParamData.infMapping.length);
                    	}
//                    	else if(key ==='output') {
//                    		that.infOutputGrid.setGridHeight(trxParamData.infMapping.length);
//                    	}
                    }
                }
			},

             expandAllDetail: function () {
                 var that = this;

                 // When all accordion are expanding, animations for each accordion are disabled but the last one.
                 that.allAccordionExpanding = true;
                 that.$detailAccordionWrap.children('h3').each(function(i, item) {
                     var $item = $(item);

                     if (!$item.hasClass('accordion-header-active')) {
                         $item.trigger('click');
                         
                         //to remove add-bd2-t css....
                         if($item.hasClass('inf-mapping') && commonConfig.extraOption['bxm.system.enable.incubating.feature'] === 'false') {
                          	$item.trigger('click');
                          	}
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

			changeChannel: function() {
				var $target = this.$el.find('.channel-change option:selected').val(),
                    $chlCtrlList = this.$el.find('.trx-parameter-form').find('input[data-form-param="chlCtrlList"]');

                if($target == 0){
                	$chlCtrlList.val('').prop('readonly', true);
                }else{
                	$chlCtrlList.prop('readonly', false);
                }
            },

            changeBranch: function() {
            	var $target = this.$el.find('.branch-change option:selected').val(),
            		$branchCtrlList = this.$el.find('.trx-parameter-form').find('input[data-form-param="branchCtrlList"]');

            	if($target == 0){
            		$branchCtrlList.val('').prop('readonly', true);
            	}else{
            		$branchCtrlList.prop('readonly', false);
            	}
            },

            changeManager: function() {
            	var $target = this.$el.find('.manager-change option:selected').val(),
            		$userCtrlList = this.$el.find('.trx-parameter-form').find('input[data-form-param="userCtrlList"]');

            	if($target == 0){
            		$userCtrlList.val('').prop('readonly', true);
            	}else{
            		$userCtrlList.prop('readonly', false);
            	}
            },

            changeIpControl: function () {
                var $target = this.$el.find('.ip-control-change option:selected').val(),
                    $ipCtrlList = this.$el.find('.trx-parameter-form').find('input[data-form-param="ipCtrlList"]');

                if($target === '0'){
                    $ipCtrlList.val('').prop('readonly', true);
                }else{
                    $ipCtrlList.prop('readonly', false);
                }
            },

            changeCtrl: function() {
            	var $target = this.$el.find('.ctrl-change option:selected').val(),
            		$trxCtrlStartDttm = this.$el.find('.trx-parameter-form').find('input[data-form-param="trxCtrlStartDttm"]'),
            		$trxCtrlStartTime = this.$el.find('.trx-ctrl-start-time'),
            		$trxCtrlEndDttm = this.$el.find('.trx-parameter-form').find('input[data-form-param="trxCtrlEndDttm"]'),
            		$trxCtrlEndTime = this.$el.find('.trx-ctrl-end-time');

            	if($target != 8){
            		$trxCtrlStartDttm.val('').prop('readonly', true);
            		$trxCtrlStartTime.val('').prop('readonly', true);
            		$trxCtrlEndDttm.val('').prop('readonly', true);
            		$trxCtrlEndTime.val('').prop('readonly', true);
            		$trxCtrlStartDttm.val('').prop('disabled', true);
            		$trxCtrlStartTime.val('').prop('disabled', true);
            		$trxCtrlEndDttm.val('').prop('disabled', true);
            		$trxCtrlEndTime.val('').prop('disabled', true);
            	} else {
            		$trxCtrlStartDttm.prop('readonly', false);
            		$trxCtrlStartTime.prop('readonly', false);
            		$trxCtrlEndDttm.prop('readonly', false);
            		$trxCtrlEndTime.prop('readonly', false);
            		$trxCtrlStartDttm.prop('disabled', false);
            		$trxCtrlStartTime.prop('disabled', false);
            		$trxCtrlEndDttm.prop('disabled', false);
            		$trxCtrlEndTime.prop('disabled', false);
            	}
            },

            changeLogf: function() {
            	var $target = this.$el.find('.logf-change option:selected').val(),
            		$logfLogLvNm = this.$el.find('.trx-parameter-form').find('select[data-form-param="logfLogLvNm"]'),
            		$logfIp = this.$el.find('.trx-parameter-form').find('input[data-form-param="logfIp"]'),
            		$logfBranchNo = this.$el.find('.trx-parameter-form').find('input[data-form-param="logfBranchNo"]'),
            		$logfTerminalNo = this.$el.find('.trx-parameter-form').find('input[data-form-param="logfTerminalNo"]');

            	if($target == 0){
            		//미사용
            		$logfLogLvNm.prop('readonly', true);
            		$logfIp.val('').prop('readonly', true);
            		$logfBranchNo.val('').prop('readonly', true);
            		$logfTerminalNo.val('').prop('readonly', true);
            	} else if($target == 1){
            		//거래 점번, 거래 기번만 disabled
            		$logfLogLvNm.prop('readonly', false);
            		$logfIp.prop('readonly', false);
            		$logfBranchNo.val('').prop('readonly', true);
            		$logfTerminalNo.val('').prop('readonly', true);
            	} else if($target == 2){
            		// IP 주소 패턴만 disabled
            		$logfLogLvNm.prop('readonly', false);
            		$logfIp.val('').prop('readonly', true);
            		$logfBranchNo.prop('readonly', false);
            		$logfTerminalNo.prop('readonly', false);
            	}

            },
            
            changeLinkType : function() {
            	var $target = this.$el.find('.link-type-change option:selected').val(),
            		$linkCtrlFqn = this.$el.find('.trx-parameter-form').find('input[data-form-param="linkCtrlFqn"]');
            	
            	if($target === 'C') {
            		$linkCtrlFqn.prop('readonly', false);
            	} else {
            		$linkCtrlFqn.val('').prop('readonly', true);
            	}
            },

            renderDatePicker: function() {
                commonUtil.setDatePicker(this.$el.find('input[data-form-param="trxCtrlStartDttm"]'), 'yy-mm-dd');
                commonUtil.setDatePicker(this.$el.find('input[data-form-param="trxCtrlEndDttm"]'), 'yy-mm-dd');
            },

			saveTrxParameter: function() {
				var that = this,
					operation,
					requestParam,
					$trxParamForm = that.$detailWrap,
					formParam,
					$askFormItems,
                    $checkItem,
                    checkItemVal,
                    isFormat,
                    checkItemTitle,
                    $checkItemStart,
                    $checkItemEnd,
                    checkItemValStart,
                    checkItemValEnd;

                // util 의 makeParamFromForm 사용, form 변수는 상단에 정의
				formParam = commonUtil.makeParamFromForm($trxParamForm);
                formParam.trxCtrlStartDttm = commonUtil.changeDateStringToString(that.$trxCtrlStartDttm.val())
                    + commonUtil.changeTimeStringToString(that.$trxCtrlStartTime.val());
                formParam.trxCtrlEndDttm = commonUtil.changeDateStringToString(that.$trxCtrlEndDttm.val())
                    + commonUtil.changeTimeStringToString(that.$trxCtrlEndTime.val());

				if(!commonConfig.useTrxCd) {
					$trxParamForm.find('input[data-form-param="trxCd"]').parent().removeClass('asterisk');
				}

				$askFormItems = $trxParamForm.find('.asterisk');

				for(var i = 0 ; i < $askFormItems.length ; i++){
					var $askFormItem = $($askFormItems[i]),
						key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
						msg = $askFormItem.find('.bw-label').text();

					if(!formParam[key]){
						swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}

				
				$checkItem = $trxParamForm.find('[data-form-param="linkCtrlFqn"]');
				checkItemVal = $checkItem.val().trim();
				
				if($trxParamForm.find('[data-form-param="linkTrxTypeCd"]').val() === 'C' && checkItemVal === '') {
					checkItemTitle = $checkItem.parent().find('.bw-label').text() + bxMsg('common.type-value-msg');
					swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
					return;
				}
				
				/*
				 * 출력 전문 최대 크기 포맷 체크
				 * Format = 숫자만 가능
				 * Warning message = 출력 전문 최대 크기 : 숫자로 입력해주세요.
				 */
				$checkItem = $trxParamForm.find('[data-form-param="outputMsgMaxLen"]');
                checkItemVal = $checkItem.val().trim();

				if(checkItemVal){
					isFormat = /^[0-9]+$/;
					checkItemTitle = $checkItem.parent().find('.bw-label').text() + bxMsg('common.number-value-msg');

					if(!isFormat.test(checkItemVal)){
						swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}

				/*
				 * 강제 타임아웃 시간 체크
				 * Format = 숫자만 가능
				 * Warning message = 강제 타임아웃 시간 : 숫자로 입력해주세요.
				 */
				$checkItem = $trxParamForm.find('[data-form-param="frcdTimeoutMills"]');
                checkItemVal = $checkItem.val().trim();

				if(checkItemVal){
					isFormat = /^[0-9]+$/;
					checkItemTitle = $checkItem.parent().find('.bw-label').text() + bxMsg('common.number-value-msg');

					if(!isFormat.test(checkItemVal)){
						swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}

				/*
				 * 일별 거래 불가 시간 포맷 체크
				 * Format = 000000 (숫자 6자리)
				 * Warning message = 일별 거래 불가 시간 (예시:223000~235500) 포맷으로 입력해주세요.
				 */
				$checkItemStart = $trxParamForm.find('[data-form-param="daySuspStartTime"]');
                $checkItemEnd = $trxParamForm.find('[data-form-param="daySuspEndTime"]');
                checkItemValStart = formParam.daySuspStartTime;
                checkItemValEnd = formParam.daySuspEndTime;

				if(checkItemValStart || checkItemValEnd){
					isFormat = /^\d{2}:\d{2}:\d{2}$/;
//					isFormat = /^\d{6}$/;
					checkItemTitle = $checkItemStart.parent().find('.bw-label').text() + ' ' + $checkItemStart.parent().find('.fa-question-circle').attr('title');

					if(!isFormat.test(checkItemValStart) || !isFormat.test(checkItemValEnd)){
						swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}
				
				checkItemValStart = commonUtil.changeTimeStringToString(formParam.daySuspStartTime);
				checkItemValEnd = commonUtil.changeTimeStringToString(formParam.daySuspEndTime);
				
				if(checkItemValStart > checkItemValEnd) {
					swal({type: 'warning', title: '', text: $checkItemStart.parent().find('.bw-label').text() + ' ' + bxMsg('common.check-date-value'), timer: 2300, showConfirmButton: false});
					return;
				}

				$checkItemStart = $trxParamForm.find('[data-form-param="trxCtrlStartDttm"]');
                $checkItemEnd = $trxParamForm.find('[data-form-param="trxCtrlEndDttm"]');
                checkItemValStart = formParam.trxCtrlStartDttm;
                checkItemValEnd = formParam.trxCtrlEndDttm;

                if(that.$trxCtrlStartTime.val() || that.$trxCtrlEndTime.val()) {
                	isFormat = /^\d{2}:\d{2}:\d{2}$/;
                	
                	if(!isFormat.test(that.$trxCtrlStartTime.val()) || !isFormat.test(that.$trxCtrlEndTime.val())) {
                		swal({type: 'warning', title: '', text: bxMsg('online.check-trx-ctrl-time'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                		return;
                	}
                }
                
				if(checkItemValStart > checkItemValEnd) {
					swal({type: 'warning', title: '', text: $checkItemStart.parent().find('.bw-label').text() + ' ' + bxMsg('common.check-date-value'), timer: 2300, showConfirmButton: false});
					return;
				}
				/*
				 * IP주소 패턴 포맷 체크
				 * Format = 000.000.000.000
				 * Waring message = IP 주소 패턴 (예시:192.168.100.10) 형태로 입력해주세요.
				 */
				/*
				 * 거래 점번, 거래 기번 포맷 체크 (숫자)
				 * Format = 숫자만 가능
				 * Warning message = 거래 점번, 거래 기번 : 숫자로 입력해주세요.
				 */
				if($trxParamForm.find('.logf-change').val() == 1) {
					isFormat = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/;
					$checkItem = $trxParamForm.find('[data-form-param="logfIp"]');
					checkItemVal = $checkItem.val().trim();
					checkItemTitle = $checkItem.parent().find('.bw-label').text() + ' ' + bxMsg('online.ex-logf-ip');

					if(!isFormat.test(checkItemVal)){
						swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}

				} else if ($trxParamForm.find('.logf-change').val() == 2) {
					isFormat = /^[0-9]+$/;
					var $checkItemBranch = $trxParamForm.find('[data-form-param="logfBranchNo"]'),
                        $checkItemTerminal = $trxParamForm.find('[data-form-param="logfTerminalNo"]'),
                        checkItemValBranch = $checkItemBranch.val().trim(),
                        checkItemValTerminal = $checkItemTerminal.val().trim();
					checkItemTitle = $checkItemBranch.parent().find('.bw-label').text() + ', '
					+ $checkItemTerminal.parent().find('.bw-label').text() + bxMsg('common.number-value-msg');

					if(!isFormat.test(checkItemValBranch) || !isFormat.test(checkItemValTerminal)){
						swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}

				/*
				 * 거래 제어 사유가 지정기간거래불가(value = 8)이 아닐 때, 거래 불가 일시를 start와 end time 둘 다 필수 기입하게 제어
				 */
				if($trxParamForm.find('.ctrl-change').val() == 8){
					var $trxCtrlStartDttm = $trxParamForm.find('[data-form-param="trxCtrlStartDttm"]'),
                        $trxCtrlEndDttm = $trxParamForm.find('[data-form-param="trxCtrlEndDttm"]'),
                        trxCtrlStartVal = $trxCtrlStartDttm.val().trim(),
                        trxCtrlEndVal = $trxCtrlEndDttm.val().trim(),
                        trxCtrlTitle = $trxCtrlStartDttm.parent().find('.bw-label').text() + ' ' + bxMsg('common.type-value-msg');

					if(!trxCtrlStartVal || !trxCtrlEndVal){
						swal({type: 'warning', title: '', text: trxCtrlTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						return;
					}
				}

				formParam.daySuspStartTime = commonUtil.changeTimeStringToString(formParam.daySuspStartTime);
				formParam.daySuspEndTime = commonUtil.changeTimeStringToString(formParam.daySuspEndTime);
				
				//interface mapping save
				tempArray = [];
				that.infInputGrid.getAllData().forEach(function (item) {
					tempArray.push({
						trxCd: formParam.trxCd,
						chlTypeCd: item.chlTypeCd,
						outputMappingRuleType: item.outputMappingRuleType,
						outputMapId: item.outputMapId,
						outputClassNm: item.outputClassNm,
						inputMappingRuleType: item.inputMappingRuleType,
						inputMapId: item.inputMapId,
						inputClassNm: item.inputClassNm
					})
				})
				formParam['infMapping'] = tempArray;
				
				//요청 객체 생성
				operation = (that.mode === 'edit') ? 'editTrxInfo' : 'addTrxInfo';

				requestParam = commonUtil.getBxmReqData('TrxInfoService', operation, 'TrxInfoOMM', formParam);

				commonUtil.requestBxmAjax(requestParam, {
					success: function(response) {
						var code = response.ResponseCode.code;

						if(code === 200){
							swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
							(that.mode === 'edit') ? that.trigger('edit-trxparam') : that.trigger('add-trxparam');
							that.close();
						} else if(code === 201){
							swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						} else if(code === 202){
							swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
						}
					}
				});
			}
		});
	}
);
