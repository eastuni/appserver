/**
 * data migration execute java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
var $loadingDim = $('#loading-dim');

$(function() {

    // Rendering 데이터이행 메인
    renderMigration();

    // 초기조회
    $('.migration-search-btn').click();

    $('body').css('overflow-y', 'scroll');

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});
var tntInstId = getLoginTntInstId();

// Page Root jQuery Element
var $el = $('.pf-migration');

// migration Form
var migrationForm;

// 데이터이행정보 그리드
var migrationGrid;
// 데이터이행결과 그리드
var migrationResultInfoGrid;
// 데이터이행상세결과 그리드
var migrationResultDetailInfoGrid;

var migrationFormTpl = getTemplate('migrationFormTpl');

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el);

onEvent('click', 'a', function(e) { e.preventDefault(); });

// 조회버튼클릭처리
onEvent('click', '.migration-search-btn', function() {
});

// 신규버튼클릭처리
onEvent('click', '.migration-new-btn', function(e) {
	// 상세정보 팝업 호출
    renderMigrationDetailPopup();
});

// 초기화 버튼 입력 처리
onEvent('click', '.migration-init-btn', function(e) {
    // Migration Main Clear
    migrationForm.reset();
    $('.migration-status-code-list').val('');
    migrationGrid.setData([]);
    PFUtil.getDatePicker();
});

// 전체이력보기 클릭처리
onEvent('click', '.all-migration-history-search', function(e) {
	getMigrationHistoryInformation();
});

/**
 * 데이터이행 실행버튼클릭
 */
onEvent('click', '.migration-execute-btn', function(e) {
	doMigrationExecute();
});

/**
 * UI Test를위해 추가
 * 해당 Element를 클릭하면 이행수행여부를 상품조건만 남긴다.
 */
onEvent('click', '.hidden_check_flag_for_UITest', function(e) {
	if(migrationGrid && migrationGrid.getAllData().length > 0) {
		var gridData = migrationGrid.getAllData();
	    for(var i = 0; i < gridData.length; i++) {
	    	if(i == 0) {
	    		gridData[i].migrationId = $('.migration-id').val();
	    	}
	    	else {
	    		gridData[i].migrationId = '';
	    	}
	    }
	 	migrationGrid.setData(gridData);
	}
});

/**
 * UI Test를위해 추가
 * 해당 Element를 클릭하면 이행수행여부를 상품조건만 남긴다.
 */
onEvent('dblclick', '.hidden_check_flag_for_UITest', function(e) {
	if(migrationGrid && migrationGrid.getAllData().length > 0) {
		var gridData = migrationGrid.getAllData();
		for(var i = 0; i < gridData.length; i++) {
			if(i == 1) {
				gridData[i].migrationId = $('.migration-id').val();
			}
			else {
				gridData[i].migrationId = '';
			}
		}
		migrationGrid.setData(gridData);
	}
});

/**
 *  데이터이행 실행
 */
function doMigrationExecute() {
	// 데이터이행단계 그리드
	// 이행수행여부 체크가 한건도 없으면 실행할 수 없음
    var gridData = migrationGrid.getAllData();
    var selectedCheck = false;
    var doNotMigration = false;
    // 체크한 단계의 정보만 조립
    var newGridData = [];

	// 실패한건이있는데 체크하지 않았을경우 실행불가
	// 실행안한건이 있는데 체크하지 않았을경우 실행불가
    for(var i = 0; i < gridData.length; i++) {
    	if(i != 0) {

    		if(gridData[i].migrationId) {
    			if((!gridData[i - 1].resultCode || gridData[i - 1].resultCode == '02')
        				&& !gridData[i - 1].migrationId) {
        			doNotMigration = true;
        		}
    		}
    	}
    }
    if(doNotMigration) {
        PFComponent.showMessage(bxMsg('checkMigStep'), 'warning');
        return;
    }

    gridData.forEach(function (el) {
        if (el.migrationId) {
            selectedCheck = true;
            newGridData.push(el);
        }
    });
    if(!selectedCheck) {
        PFComponent.showMessage(bxMsg('oneMoreTableisMigExecuteMandatory'), 'warning');
        return;
    }

    var requestData = {};
    requestData.migrationList = newGridData;
    PFComponent.showConfirm(bxMsg('confirmDoMigration'), function() {
    	$loadingDim.show();
	    PFRequest.post('/migration/doMigration.json', requestData, {
	        async : true,
	        timeout : 100000000000000000000,
	        success: function(responseData) {
	            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
	            tab.setSelected(tab.getItemAt(0));
	            getMigrationFinalInformation();
	            $loadingDim.hide();
	        },
	        error : function(jqXHR) {
	        	console.log('aaa==' + jqXHR);
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'MigrationService',
	            operation: 'doMigration'
	        }
	    });
    });
}

/**
 * Get Migration Information
 */
function getMigrationFinalInformation() {
	var requestData = {};
	$loadingDim.show();
    PFRequest.get('/migration/getFinalMigration.json' , requestData, {
        success: function(responseData) {

            if(responseData && responseData.length > 0) {
            	for(var i = 0; i < responseData.length; i++) {
            		if(responseData[i].migrationId && responseData[i].migrationId != '') {

            			// 최종 데이터이행ID 세팅
            			$('.migration-id').val(responseData[i].migrationId);
            			break;
            		}
            	}
            }

        	// 데이터이행결과 탭을 disabled true 처리한다.
            var migrationExecuteYn = false;
            if(responseData && responseData.length > 0) {
            	for(var i = 0; i < responseData.length; i++) {
            		if(responseData[i].migrationId && responseData[i].migrationId != '') {
            			migrationExecuteYn = true;
            		}
            	}
            }

        	if(!migrationExecuteYn) {
        		if($('.pf-migration-main').find('.nav-tabs').find('li') && $('.pf-migration-main').find('.nav-tabs').find('li').length > 0) {
        			$.each($('.pf-migration-main').find('.nav-tabs').find('li'), function(idx, value) {

        				if((idx == 1) && tab) {
        					tab.getItemAt(idx).set('disabled', true);
        					$(value).css('opacity', '0.4');
        				}
        			});
        		}
        	}
        	else {
        		if($('.pf-migration-main').find('.nav-tabs').find('li') && $('.pf-migration-main').find('.nav-tabs').find('li').length > 0) {
        			$.each($('.pf-migration-main').find('.nav-tabs').find('li'), function(idx, value) {

        				if((idx == 1) && tab) {
        					tab.getItemAt(idx).set('disabled', false);
        					$(value).css('opacity', '100');
        				}
        			});
        		}
        	}

        	migrationGrid.setData(responseData);
        	$loadingDim.hide();

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'MigrationService',
            operation: 'getFinalMigration'
        }
    });
}

/**
 * Get List Migration Information
 */
function getMigrationHistoryInformation() {
	var requestData = {
			"migrationAllSearch" : $('.all-migration-history-search').prop('checked')
	};
	$loadingDim.show();
    PFRequest.get('/migration/getlMigrationHistory.json' , requestData, {
        success: function(responseData) {
        	migrationResultInfoGrid.setData(responseData);
        	$loadingDim.hide();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'MigrationService',
            operation: 'getlMigrationHistory'
        }
    });
}

/**
 * Rendering Migration Base Start
 */
var tab;
function renderMigration() {
    $el.find('.pf-page-conts').html(migrationFormTpl());
    PFUI.use(['pfui/tab','pfui/mask'],function(Tab){

        tab = new Tab.Tab({
            render : '.pf-migration-sub-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children : [
                {text:bxMsg('migrationInfo'), index:1},	// 데이터이행정보
                {text:bxMsg('migrationRsltInfo'), index:2}		// 데이터이행결과
            ]
        });

        $('.pf-migration-result').hide();
        tab.on('selectedchange',function (ev) {

            var item = ev.item;

            // 데이터이행상세정보 탭
            if (item.get('index') == 1) {
                $('.pf-migration-result').hide();		// 데이터이행결과
                $('.pf-migration-information').show();	// 데이터이행결과상세정보

                // 이행단계 그리드
            	renderMigrationStepGrid();

               	// Final 이행정보 조회
            	getMigrationFinalInformation();
            }
            // 데이터이행결과 탭
            else {
                $('.pf-migration-result').show();		// 데이터이행결과
                $('.pf-migration-information').hide();	// 데이터이행결과상세정보

                // 데이터이행결과 그리드
                renderMigrationRsltGrid();
                // 데이터이행상세결과 그리드
                renderMigrationRsltDetailGrid();
                // 이행결과 이력 조회
                getMigrationHistoryInformation();
            }

            // 권한이 없는 경우
            if(writeYn != 'Y'){
                $('.write-btn').hide();
            }
        });
        // 데이터이행상세정보 탭
        tab.setSelected(tab.getItemAt(0));
    });
}


/***********************************************************************************************************************
 *  그리드 함수
 **********************************************************************************************************************/

/**
 * 데이터이행대상테이블 Grid
 * @param responseData
 */
function renderMigrationStepGrid() {
    // Grid Empty
    $('.pf-migration-step-grid').empty();


    migrationGrid = PFComponent.makeExtJSGrid({
        fields: ['migrationId', 'migrationStepId', 'migrationStepNm', 'migrationStartDate', 'migrationEndDate', 'resultCode',
                 	{
			    		name: 'migrationRsltCdName',
			    		convert: function(newValue, record) {
			    			var migrationRsltCdName = codeMapObj.migrationResultCode[record.get('resultCode')];
			    			return migrationRsltCdName;
			    		}
			        }
                 ],
        gridConfig: {
            renderTo: '.pf-migration-step-grid',
            columns: [
                // 1. migrationExecuteYn : 이행수행여부
                // 2. migrationStep : 이행단계구분
                // 3. migrationFinalDt : 최종수행일시
                // 4. migrationFinalResultCd : 최종결과
                {xtype: 'checkcolumn', text: bxMsg('migrationExecuteYn'), width: 100, dataIndex: 'migrationId',
                            renderer: function(value, metadata, record) {
                                if (record.get('migrationId') == null || record.get('migrationId') == '' || record.get('migrationId') == undefined  ) {
                                	return (new Ext.ux.CheckColumn()).renderer(false);
                                } else {
                                    return (new Ext.ux.CheckColumn()).renderer(true);
                                }
                            },
                            listeners: {
                                checkchange: function(column, rowIndex, checked, eOpts) {
                                }
                            }
                        },

                {text: bxMsg('migrationStep'), flex: 1, dataIndex: 'migrationStepNm', style: 'text-align:center', align: 'left',
                        	renderer: function(value, metadata, record) {
                                if(value) {
                                	return value;
                                }
                                else {
                                	// N/A
                                	return bxMsg('notapplicable');
                                }
                            }

                },
                {text: bxMsg('migrationFinalDt'), flex: 1, dataIndex: 'migrationEndDate', style: 'text-align:center',  align: 'left',
                  	renderer: function(value, metadata, record) {
                        if(value) {
                        	return value;
                        }
                        else {
                        	// N/A
                        	return bxMsg('notapplicable');
                        }
                    }
                },
                {text: bxMsg('migrationFinalResultCd'), flex: 1, dataIndex: 'migrationRsltCdName', style: 'text-align:center',  align: 'left',
                  	renderer: function(value, metadata, record) {
                        if(value) {
                        	return value;
                        }
                        else {
                        	// N/A
                        	return bxMsg('notapplicable');
                        }
                    }
                }
            ]
        }
    });
}

/**
 * 데이터이행결과 그리드
 */
function renderMigrationRsltGrid() {
    // Grid Empty
    $('.pf-migration-result-grid').empty();
    migrationResultInfoGrid = PFComponent.makeExtJSGrid({
        fields: ['migrationId', 'migrationStepId', 'migrationStepNm', 'migrationStartDate', 'migrationEndDate', 'resultCode', 'migrationHiddenId',
              		{
			    		name: 'migrationRsltCdName',
			    		convert: function(newValue, record) {
			    			var migrationRsltCdName = codeMapObj.migrationResultCode[record.get('resultCode')];
			    			return migrationRsltCdName;
			    		}
			        }
			    ],
        gridConfig: {
            renderTo: '.pf-migration-result-grid',
            columns: [
                // 1. 이행ID
                // 2. 이행단계구분
                // 3. 수행시작일시
                // 4. 수행종료일시
                // 5. 이행결과
                {text: bxMsg('migrationId'), flex: 1, dataIndex: 'migrationId', style: 'text-align:center', align: 'left'},
                {text: bxMsg('migrationStep'), flex: 1, dataIndex: 'migrationStepNm', style: 'text-align:center', align: 'left'},
                {text: bxMsg('migrationStartDt'), flex: 1, dataIndex: 'migrationStartDate', style: 'text-align:center', align: 'center',
                  	renderer: function(value, metadata, record) {
                        if(value) {
                        	return value;
                        }
                        else {
                        	// N/A
                        	return bxMsg('notapplicable');
                        }
                    }
                },
                {text: bxMsg('migrationEndDt'), flex: 1, dataIndex: 'migrationEndDate', style: 'text-align:center', align: 'center',
                  	renderer: function(value, metadata, record) {
                        if(value) {
                        	return value;
                        }
                        else {
                        	// N/A
                        	return bxMsg('notapplicable');
                        }
                    }
                },
                {text: bxMsg('migRsltCd'), flex: 1, dataIndex: 'migrationRsltCdName', style: 'text-align:center', align: 'center',
                  	renderer: function(value, metadata, record) {
                        if(value) {
                        	return value;
                        }
                        else {
                        	// N/A
                        	return bxMsg('notapplicable');
                        }
                    }
                }
            ],
            listeners: {
                scope: this,
                itemdblclick : function(_this, record, item, index){
                	// OHS 20180406 수정 - 이행결과코드가 undefined 면 조회거래를 태우지 않음
                	if(record.getData().resultCode == undefined) {
                		// 해당 이행단계는 이행이 미실행되어 상세결과를 조회할 수 없습니다.
                		PFComponent.showMessage(bxMsg('notExecuteStep'), 'warning');
                		return;
                	}
                	
                	var requestParam = {
                            "migrationId" : record.data.migrationHiddenId,
                            "dataMigrationStepId" : record.data.migrationStepId
                        };
                		$loadingDim.show();
                		// 데이터이행결과상세정보 조회
                        PFRequest.get('/migration/getResultMigrationDetail.json', requestParam, {
                            success : function(responseData) {
                            	migrationResultDetailInfoGrid.setData(responseData);
                            	$loadingDim.hide();
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'MigrationService',
                                operation: 'getResultMigrationDetail'
                            }
                        });
                }
            }
        }

    });
}

/**
 * 데이터이행상세결과 그리드
 */
function renderMigrationRsltDetailGrid() {
	// Grid Empty
	$('.pf-migration-result-detail-grid').empty();
	migrationResultDetailInfoGrid = PFComponent.makeExtJSGrid({
		fields: ['migrationId', 'migrationStepId', 'migrationStepNm', 'migrationStartDate', 'migrationEndDate', 'resultCode', 'asisCount', 'tobeCount'
		         , 'migrationTableName', 'tobeTableName', 'resultDetailCode', 'errorContent', 'migrationTableKeyValue', 'allTableColumns',
		         {
					name: 'migrationRsltCdName',
					convert: function(newValue, record) {
						var migrationRsltCdName = codeMapObj.migrationResultCode[record.get('resultCode')];
						return migrationRsltCdName;
					}
		         }
		],
		gridConfig: {
			renderTo: '.pf-migration-result-detail-grid',
			columns: [
			          // 1. 이행단계구분
			          // 2. AS-IS Table
			          // 3. 건수
			          // 4. TO-BE Table
			          // 5. 건수
			          // 6. 이행결과
			          {text: bxMsg('migrationStep'), flex: 1, dataIndex: 'migrationStepNm', style: 'text-align:center', align: 'left'},
			          {text: bxMsg('asisTable'), flex: 1, dataIndex: 'migrationTableName', style: 'text-align:center', align: 'left'},
			          {text: bxMsg('count'), flex: 1, dataIndex: 'asisCount', style: 'text-align:center', align: 'center',
			        	  renderer: function(value, metadata, record) {
			        		  if(value) {
			        			  return value;
			        		  }
			        		  else {
			        			  // N/A
			        			  return bxMsg('notapplicable');
			        		  }
			        	  }
			          },
			          {text: bxMsg('tobeTable'), flex: 1, dataIndex: 'tobeTableName', style: 'text-align:center', align: 'left',
			        	  renderer: function(value, metadata, record) {
			        		  if(value) {
			        			  return value;
			        		  }
			        		  else {
			        			  // N/A
			        			  return bxMsg('notapplicable');
			        		  }
			        	  }
			          },
			          {text: bxMsg('count'), flex: 1, dataIndex: 'tobeCount', style: 'text-align:center', align: 'center',
			        	  renderer: function(value, metadata, record) {
			        		  if(value) {
			        			  return value;
			        		  }
			        		  else {
			        			  // N/A
			        			  return bxMsg('notapplicable');
			        		  }
			        	  }
			          },
			          {text: bxMsg('migRsltCd'), flex: 1, dataIndex: 'migrationRsltCdName', style: 'text-align:center', align: 'center',
			        	  renderer: function(value, metadata, record) {
			        		  if(value) {
			        			  return value;
			        		  }
			        		  else {
			        			  // N/A
			        			  return bxMsg('notapplicable');
			        		  }
			        	  }
			          }
			          ],
			          listeners: {
			        	  scope: this,
			        	  itemdblclick : function(_this, _record, item, index){
			        		  // 실패일때만 popup 호출가능
			        		  if(_record.data.resultCode == '02') {
			        			  renderPdMigResultDetailPopup(_record.data);
			        		  }
			        	  }
			          }
		}

	});
}