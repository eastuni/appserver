/**
 * eav sub model java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderEavManagement();              // 메인화면 초기세팅
    searchEAVScreenConfigInfoList();		// 조회
    searchEAVValueObjectDetailList();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-eav-management');


var eavManagementGrid;
var eavManagementGridDeleteData = [];

var classificationMasterData;

var arrGridTitleData = [];

var form;
var tntInstId;
var objectId;

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el); // icon tooltip 적용

var eavManagementTpl = PFUtil.getTemplate('setting/eav_model/eav_sub', 'eavManagement');

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {

    $.each($('.pf-eav-management').find('input'), function(prop, val) {
        if($(val).attr('default-value')) {
        	$(val).val($(val).attr('default-value'));
        }
        else {
        	$(val).val('');
        }
    });

    if(eavManagementGrid) {
    	eavManagementGrid.resetData();
    }

});

// 조회버튼 클릭시
onEvent('click', '.product-eav-management-list-inquiry-btn', function(e) {
	searchEAVValueObjectDetailList();
});

// 저장버튼 클릭시
onEvent('click', '.rel-save-btn', function(e) {
    saveProductEavManagement();
});

//추가버튼 클릭시
onEvent('click', '.product-eav-management-add-btn', function(e) {
	var valSeqNbr = Math.max(...eavManagementGrid.getAllData().map(v => v.valSeqNbr)) + 1; // 값 체크 및 변환을 위한 const -> var 변경
	valSeqNbr = valSeqNbr == -Infinity ? 1 : valSeqNbr; // OHS 20180829 - Grid 데이터가 한건도없을경우 -Infinity 오류발생
    var newData = {
        process : 'C',
        tntInstId : tntInstId,
        objectId : objectId,
        valSeqNbr,
    };

    eavManagementGrid.addData(newData);
});

/******************************************************************************************************************
 * 서비스 호출 함수
 ******************************************************************************************************************/
//EAV 화면구성 조회
function searchEAVScreenConfigInfoList() {
	//var parameter = JSON.parse($(parent.document).find('.pf-main-menu-leaf.eav-sub-menu').attr('parameter'));
	var parameter = JSON.parse($(parent.document).find('.hidden-screen-area').find('.SCRN045').attr('parameter'));
	tntInstId = parameter.tntInstId;
	objectId = parameter.objectId;

	// Set input
    var requestParam = {
    	'tntInstId' : tntInstId,
    	'objectId': objectId
   	};

    PFRequest.get('/eav/getEAVScreenConfigInfoList.json', requestParam, {
    	async: false,
        success: function(responseData) {

        	var titleConditionInfo = '';
           	if(responseData) {

           		var gridHeaderArr = [];
        		responseData.forEach(function(el, index) {
        			var title = '';
        			var labelIndex = 0;
        			// 01 : 라벨
        			if(el.screenConfigWayDscd == '01') {

        				if(el.defaultValue) {
            				title = '<th style="width:155px">' + el.atrbtNm + '</th>' +
                            '<td><input type="text" class="bx-form-item bx-compoenent-small"'
            					+ 'data-form-param="' + el.atrbtId + '" default-value="' + el.defaultValue + '" dataTpDscd="' + el.dataTpDscd
                            	+ '" value="' + el.defaultValue + '"' + '/></td>';
        				}
        				else {
            				title = '<th style="width:155px">' + el.atrbtNm + '</th>' +
                            '<td><input type="text" class="bx-form-item bx-compoenent-small" data-form-param="' + el.atrbtId + '" dataTpDscd="' + el.dataTpDscd + '"/></td>';
        				}

        	 			if(((labelIndex+1)%2) == 1) {
            				titleConditionInfo = titleConditionInfo + '<tr class="add-tr">' + title;
            			}
            			else{
            				titleConditionInfo = titleConditionInfo + title + '</tr>'
            			}
        	 			labelIndex++;
        			}
        			// 02 : 그리드헤더
        			else if(el.screenConfigWayDscd == '02') {
        				gridHeaderArr.push(el);
        			}
        		});
        	}

            $('.pd-eav-management-query-table .add-tr').remove();
            $('.pd-eav-management-query-table').append(titleConditionInfo);

            if(gridHeaderArr && gridHeaderArr.length > 0) {
            	$('.pf-pd-eav-management-grid-form').find('.pf-pd-eav-management-list-grid').css('display', 'block');
            	$('.pf-eav-management .middle-grid').css('height', '350px');
            	$('.grid-extra-header').find('.product-eav-management-add-btn').css('display', 'block');
            	// Grid 처리
            	renderGridHeaderArr(gridHeaderArr);
            }
            else {
            	$('.pf-eav-management .middle-grid').css('height', '0px');
            	$('.pf-pd-eav-management-grid-form').find('.pf-pd-eav-management-list-grid').css('display', 'none');
            	$('.grid-extra-header').find('.product-eav-management-add-btn').css('display', 'none');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'getEAVScreenConfigInfoList'
        }
    });
}
//EAV Object 상세 값 목록조회
function searchEAVValueObjectDetailList() {
	//var parameter = JSON.parse($(parent.document).find('.pf-main-menu-leaf.eav-sub-menu').attr('parameter'));
	var parameter = JSON.parse($(parent.document).find('.hidden-screen-area').find('.SCRN045').attr('parameter'));
	tntInstId = parameter.tntInstId;
	objectId = parameter.objectId;

	// Set input
	var requestParam = {
			'tntInstId' : tntInstId,
			'objectId': objectId
	};

	PFRequest.get('/eav/getEAVObjectValueDetailInfoList.json', requestParam, {
		success: function(responseData) {
			console.log('responseData :' + responseData);

			if(responseData && responseData.voList) {

				responseData.voList.forEach(function(el, index) {
				    $.each($('.pf-eav-management').find('input'), function(prop, val) {
				        if($(val).attr('data-form-param') && $(val).attr('data-form-param') == el.atrbtId) {
				        	$(val).val(el.atrbtVal);
				        	delete responseData.voList[index]; // 20180207 수정 splice -> delete로 변경
				        }
				    });
				});

				if(responseData.voList && responseData.voList.length > 0) {
					if(!eavManagementGrid) return;
					var fields = eavManagementGrid.store.model.getFields();

					var valSeqNbrMap = {};
					responseData.voList.forEach(function(el, index) {

						var gridData = {};
						if(valSeqNbrMap[el.valSeqNbr]) {
							var gridData = valSeqNbrMap[el.valSeqNbr];

							gridData[el.atrbtId] = el.atrbtId;
							gridData[el.atrbtId + '_value'] = el.atrbtVal;
							gridData[el.atrbtId + '_key'] = el.atrbtId;
							//gridData['dataTpDscd'] = el.dataTpDscd;

							valSeqNbrMap[el.valSeqNbr] = gridData;

				           	fields.push({
				            	name : el.atrbtId + '_value',
				            	style: 'text-align:center'
				            });
				           	fields.push({
				           		name : el.atrbtId + '_key',
				           		style: 'text-align:center'
				           	});
						}
						else {
							gridData.valSeqNbr = el.valSeqNbr;
							gridData[el.atrbtId] = el.atrbtId;
							gridData[el.atrbtId + '_value'] = el.atrbtVal;
							gridData[el.atrbtId + '_key'] = el.atrbtId;

							valSeqNbrMap[el.valSeqNbr] = gridData;

				           	fields.push({
				            	name : el.atrbtId + '_value',
				            	style: 'text-align:center'
				            });
				           	fields.push({
				           		name : el.atrbtId + '_key',
				           		style: 'text-align:center'
				           	});
						}
					});

					eavManagementGrid.store.model.setFields(fields);
					var newGridData = Object.values(valSeqNbrMap);
					if(newGridData && newGridData.length > 0) {
						eavManagementGrid.setData(newGridData);
					}
				}
			}
		},
		bxmHeader: {
			application: 'PF_Factory',
			service: 'EAVService',
			operation: 'getEAVScreenConfigInfoList'
		}
	});
}

// EAV Management 그리드
function renderGridHeaderArr(title) {

    var fields = ['process', 'valSeqNbr', 'atrbtId', 'dataTpDscd'];
    var columns = [];

    arrGridTitleData = [];

    $('.pf-pd-eav-management-list-grid').empty();


    if(title) {
        title.forEach(function(el) {
            fields.push({
            	name : el.atrbtId + '_key',
            	style: 'text-align:center'
            });

            columns.push({header: '<div style="text-align:center">' + el.atrbtNm + '</br>('+ el.atrbtId +') </div>',
            	flex: 1 , dataIndex: el.atrbtId + '_key', defaultValue: el.defaultValue, dataTpDscd : el.dataTpDscd,
            	renderer: function(value, p, record) {
            		// 입력값이 없을경우 default value로 값 세팅
            		if((!value || value == '' ) && p && p.column && p.column.defaultValue && record.data.process == 'C') {

            			record.set(p.column.dataIndex, p.column.defaultValue);
            			record.set('dataTpDscd', p.column.dataTpDscd);
            			return p.column.defaultValue;
            		}
            		else {
            			if(p.column && p.column.dataIndex == value + '_key') {
            				record.set(p.column.dataIndex, record.data[value + '_value']);
            				record.set('dataTpDscd', p.column.dataTpDscd);
            				return record.data[value + '_value'];
            			}
            			else {
            				record.set(p.column.dataIndex, value);
            				record.set('dataTpDscd', p.column.dataTpDscd);
            				return value;
            			}
            		}
            	},
                style: 'text-align:center',
                editor: {
                    xtype: 'textfield',
                    allowBlank: false,
                    selectOnFocus: true,
                    listeners: {
                        'render': function (cmp) {
                            cmp.getEl()
                                .on('keydown', function(e) {
                                	// TODO : 유형별 체크추가
                                })
                                .on('keyup', function (e) {
                                	// TODO : 유형별 체크추가
                                })
                        }
                    }
                }

            });
        });
    }

    // 삭제컬럼
    columns.push({
        xtype: 'actioncolumn', width: 35, align: 'center',
        items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
                if(record.data.process != 'C') {
                    record.data.process = 'D';
                    eavManagementGridDeleteData.push(record.data);
                }
                record.destroy();
            }
        }]
    });

    eavManagementGrid = PFComponent.makeExtJSGrid({
        fields:fields,
        gridConfig: {
            renderTo: '.pf-pd-eav-management-list-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor) {
                            if( editor.record.data.activeYn == 'N' ||                                 		// 비활동인 경우
                                editor.record.data.process == 'C' ||                                      	// 새로 추가된 row인 경우
                                (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     	// emergency 인 경우
                                (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     	// 상품정보 수정인 경우
                                // 모두 수정가능
                            }
                        },
                        afteredit: function(e, editor) {
                            if (editor.originalValue != editor.value){
                                if (editor.record.get('process') != 'C') {
                                    editor.record.set('process', 'U');
                                }
                            }
                        }
                    }
                })
            ],
            listeners: {
                'viewready' : function(_this, eOpts){
                }
            }
        }
    });
}

// 설정화면 저장
function saveProductEavManagement() {
	var requestData = {};
	requestData.objectId = objectId;

	// 라벨정보 조립
	var voList = [];

    $.each($('.pf-pd-eav-management-list-form').find('input'), function(prop, val) {
		var labelData = {
				'atrbtId' : $(val).attr('data-form-param'),
				'atrbtVal' : $(val).val(),
				'valSeqNbr' : 1,
				'dataTpDscd' : $(val).attr('datatpdscd')

		};
		voList.push(labelData);
    });


	// 그리드정보 조립
	var gridData;
	if(eavManagementGrid && eavManagementGrid.getAllData().length > 0) {
		for(var i = 0; i < eavManagementGrid.getAllData().length; i++) {

			// key정보 조립
			for(var j = 0; j < Object.keys(eavManagementGrid.getAllData()[i]).length; j++) {
				if(Object.keys(eavManagementGrid.getAllData()[i])[j].includes('_key')) {

					var gridData = {
							'atrbtId' : Object.keys(eavManagementGrid.getAllData()[i])[j].replace('_key', ''),
							'atrbtVal' : eavManagementGrid.getAllData()[i][Object.keys(eavManagementGrid.getAllData()[i])[j]],
							'valSeqNbr' : eavManagementGrid.getAllData()[i]['valSeqNbr'],
							'dataTpDscd' : eavManagementGrid.getAllData()[i]['dataTpDscd'],
					}

					voList.push(gridData);
				}
			}
		}
	}

	// OHS 20180213 추가 - 저장내용이 없으면 변경내용이 없다고 메세지 띄우고 서버거래를 태우지 않음.
	if(!voList || voList.length < 1) {
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

	requestData.voList = voList;
    PFRequest.post('/eav/saveEAVObjectValueDetail.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                searchEAVValueObjectDetailList();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'saveEAVObjectValueDetail'
        }
    });
}

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderEavManagement() {
    $('.pf-page-conts').html(eavManagementTpl());
    form = PFComponent.makeYGForm($('.pf-pd-eav-management-list-form'));
    $('.pf-eav-management').find('.pf-panel-title').text($(parent.document).find('.pf-main-menu-leaf.eav-sub-menu').find('li').text());

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
    $('.rel-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
}