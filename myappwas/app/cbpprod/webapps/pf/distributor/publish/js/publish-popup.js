//Publish Result Info Grid
var publishResultInfoGrid;
//Publish Target System Info Grid
var targetSysInfoGrid;
//Publish Approval Information Grid
var approvalInfoGrid;

var approvalUseYnByCurrentSysEnvDscd = false;

const EAV_SYSTEM_ENV_DSCD_ATRBT_ID = 'systemEnvDscd';
const EAV_APPROVAL_USE_YN_ATRBT_ID = 'approvalUseYn';
var EAVVALUE_INFO;
var CUR_SYS_EVN_DSCD = '';

/**
 * 승인사용여부 정보가 있을경우에 체크한다.
 * @param eavValue
 * @returns
 */
function _checkApprovalUseYnInfo() {
	approvalUseYnByCurrentSysEnvDscd = false;
	var currentSysEnvDscd = $('.pf-publish-detail-tpl .target-environment').val() == undefined ? CUR_SYS_EVN_DSCD : $('.pf-publish-detail-tpl .target-environment').val();
	
	if (EAVVALUE_INFO && EAVVALUE_INFO.voList) {
		var valSeqNbr = 0;
		for (var i = 0; i < EAVVALUE_INFO.voList.length; i++) {
			var eavObj = EAVVALUE_INFO.voList[i];
			if (EAV_SYSTEM_ENV_DSCD_ATRBT_ID == eavObj.atrbtId
					&& currentSysEnvDscd == eavObj.atrbtVal) {
				valSeqNbr = eavObj.valSeqNbr;
			}
		}
		for (var i = 0; i < EAVVALUE_INFO.voList.length; i++) {
			var eavObj = EAVVALUE_INFO.voList[i];
			if (EAV_APPROVAL_USE_YN_ATRBT_ID == eavObj.atrbtId
					&& valSeqNbr == eavObj.valSeqNbr
					&& eavObj.atrbtVal == 'Y') {
				approvalUseYnByCurrentSysEnvDscd = true;
			}
		}
	}
	
	// 승인사용여부가 true 이고 배포버튼이 보일경우에는 hidden 처리한다.
	if (approvalUseYnByCurrentSysEnvDscd && $('.btn-publish-execute-unique').css('display') 
			&& $('.btn-publish-execute-unique').css('display').indexOf('inline') != -1) {
		$('.btn-publish-execute-unique').css('display','none');	
	}
	// 승인사용여부가 false 이고 배포버튼이 보이지않을경우에는 show 처리한다.
	else if (!approvalUseYnByCurrentSysEnvDscd && $('.btn-publish-execute-unique').css('display')
			&& $('.btn-publish-execute-unique').css('display').indexOf('none') != -1) {
		$('.btn-publish-execute-unique').css('display','inline');
	}
}

// Public Detail Popup
function renderPublishDetailPopup(responseData) {
	if (responseData && responseData.eAVValueWrapVO) {
		EAVVALUE_INFO = responseData.eAVValueWrapVO;
		CUR_SYS_EVN_DSCD = responseData.targetSystemEnvironmentDscd;
		_checkApprovalUseYnInfo();
	}
    var buttons = [];

    const publishResultTab = getTemplate('publishResultTab');
    const publishDetailPopup = getTemplate('publishDetailPopup');


    // 수정가능 일 때
    if(responseData && responseData.status == MODIFIABLE && responseData.registerUserId == getLoginUserId()){

        // Publish Base Save
        buttons.push({
            text: bxMsg('ButtonBottomString1'),     // 저장
            elCls: 'button button-primary btn-publish-save-unique write-btn',
            handler: function () {
                // form Info
                var requestParam = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();

                // grid Info
                if (publishDetailGrid.getAllData().length != 0) {
                    requestParam.projectId = publishDetailGrid.getAllData()[0].projectId;
                } else {
                    requestParam.projectId = "";
                }


                var targetSystemList  = [];
                var targetSysInfoGridData = targetSysInfoGrid.getAllData();

                for (var i = 0 ; i < targetSysInfoGridData.length ; i ++){
                    var targetSystem = {};
                    targetSystem.tntInstId = getLoginTntInstId();
                    targetSystem.publishId = requestParam.publishId;
                    targetSystem.targetSystemCode = targetSysInfoGridData[i].code;
                    targetSystem.targetSystemName = targetSysInfoGridData[i].name;
                    targetSystem.targetSystemUserNumber = targetSysInfoGridData[i].userNumber;
                    targetSystem.targetSystemUserName = targetSysInfoGridData[i].userName;
                    targetSystemList.push(targetSystem);
                }

                if(targetSystemList.length < 1 || !requestParam.projectId || requestParam.projectId === "" || requestParam.projectId === null){
                    PFComponent.showMessage(bxMsg('distributeSaveError'), 'warning');
                    return;
                }

                requestParam.approvalId = $('.pf-publish-detail-tpl .approval-id').val();
                requestParam.targetSystemList = targetSystemList;
                requestParam.approvalList = approvalInfoGrid.getAllData();
                requestParam.targetSystemEnvironmentDscd  = requestParam.systemEvironmentDscd;


                var that = this;
                if (!requestParam.publishId) {
                    PFRequest.post('/publish/createPublishBaseInfo.json', requestParam, {
                        success: function (responseData) {

                            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

                            // New Generate PublishId Setting
                            $('.publish-id').val(responseData.publishId);
                            requestParam.publishId = responseData.publishId;

                            that.close();
                            $('.publish-search-btn').click();

                            renderPublishDetailPopup(requestParam);

                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'createPublishBase'
                        }
                    });
                } else {
                    PFRequest.post('/publish/updatePublishBaseInfo.json', requestParam, {
                        success: function () {
                            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

                            that.close();
                            $('.publish-search-btn').click();

                            renderPublishDetailPopup(requestParam);

                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updatePublishBase'
                        }
                    });
                }
            }
        });

        // Publish Base Delete
        buttons.push({
            text: bxMsg('ButtonBottomString2'), // 삭제
            elCls: 'button button-primary btn-publish-delete-unique write-btn',
            handler: function () {
                var publishDetail = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();

                if (!publishDetail || !publishDetail.publishId || publishDetailGrid.getAllData().length != 0) {
                    // Don't Delete
                    PFComponent.showMessage(bxMsg('dontDeleteProjectBase'), 'warning');
                    return;
                }

                var that = this;
                PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function () {
                    var requestParam = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();

                    // Render PublishDetail Popup Page
                    PFRequest.post('/publish/deletePublishBaseInfo.json', requestParam, {
                        success: function (responseData) {
                            // Close PopupPage
                            that.close();
                            $('.publish-search-btn').click();
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'deletePublishBase'
                        }
                    });
                }, function () {
                    return;
                });


            }
        });
    }

    // 승인완료 (승인사용을 하지 않는 경우에는 상품정보 수정일때)
    if(responseData && responseData.registerUserId == getLoginUserId()
        && (responseData.status == APPROVALCOMPLETE
            || responseData.status == DEVDISTRIBUTEFAIL || responseData.status == DEVDISTRIBUTESUCCESS
            || responseData.status == P_PRODUCTIONDISTRIBUTEFAIL || responseData.status == P_PRODUCTIONDISTRIBUTESUCCESS
            
        	// OHS 20180829 - 승인사용여부처리는 부가정보(EAV)-approvalUseYn Object의 값대로 서버단에서 처리하도록 함.
            //|| (g_approvalUseYn == 'N' && (responseData.status == MODIFIABLE && responseData.projectId) ))){
            || (approvalUseYnByCurrentSysEnvDscd == false && responseData.projectId))){

        buttons.push({   // Publish Execute(배포)
            text: bxMsg('ButtonBottomString12'),
            elCls: 'button button-primary btn-publish-execute-unique write-btn',
            handler: function () {
                var publishDetail = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();

                if (!publishDetail || !publishDetail.publishId
                    //|| (g_approvalUseYn == 'Y' && publishDetail.status != APPROVALCOMPLETE)
                    //|| (g_approvalUseYn == 'N' && publishDetail.status != MODIFIABLE)
                    //|| (g_approvalUseYn == 'N' && publishDetail.status != DEVDISTRIBUTEFAIL)
                    || publishDetailGrid.getAllData().length == 0) {
                    // do not publish
                    PFComponent.showMessage(bxMsg('donotPublish'), 'warning');
                    return;
                }

                var that = this;
                PFComponent.showConfirm(bxMsg('confirmDoPublish'), function () {
                    var requestParam = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();

                    // OHS20171213 추가 - 배포 확인버튼을 누르는 시점에 배포버튼 display none 처리
                    $('.btn-publish-execute-unique').css('display','none')

                    // Render PublishDetail Popup Page
                    PFRequest.post('/publish/publishProduct.json', requestParam, {
                        success: function (responseData) {
                            // If Publish Success Then Combo ProjectId Delete
                            if (publishDetailGrid.getAllData()[0].projectId) {
                                removeProject(publishDetailGrid.getAllData()[0].projectId);
                            }

                            $('.publish-search-btn').click();

                            // 캐쉬 삭제 실패
                            if(responseData == false){
                            	PFComponent.showMessage(bxMsg('CacheRequestFail'), 'warning');
                            }else{
                            	PFComponent.showMessage(bxMsg('Z_RequestDistribute'), 'success');
                            }
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updatePublishPd'
                        }
                    });
                });
            }
        });
    }

    buttons.push({
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary btn-publish-export',
        handler: function () {
            $('.publish-search-btn').click();
            this.close();
        }
    });

    PFComponent.makePopup({
        title: bxMsg('DAS0101String2'),
        contents: publishDetailPopup(responseData),//publishDetailPopupTpl(responseData),
        width:1000,
        height:560,
        buttons: buttons,
        contentsEvent: {
            // ProjectID Query Popup
            'click .add-publish-projectId-btn': function() {
              selectProject((checkedItem) => {
                publishDetailGrid.addData(checkedItem);
                $('.add-publish-projectId-btn').hide();
                $('.search-pd-info-chng-btn').show();
              });
            },

            // 배포대상조회
            'click .search-pd-info-chng-btn': function(){
              const project = publishDetailGrid.getAllData()[0];
                PFPopup.showProductInfoChange({ projectId: project.projectId });
            },

            'click .add-approval-info-btn': function() {
                PFPopup.selectEmployee({}, function (selectItem) {
                    var data = {};
                    if(selectItem) {
                        data.approver = selectItem.staffId;
                        data.approverName = selectItem.staffName;
	                    data.approvalStatusCode = '01'; /*공통코드로 처리*/
	                    data.approvalSeqNbr = approvalInfoGrid.store.data.length + 1;
	                    approvalInfoGrid.addData(data);
                    }
                });

            },

            'click .add-target-sys-btn': function() {
              renderTargetSystemPopup(function(checkedItem) {
                renderTargetSysGrid(checkedItem);
              });
            },
            'click .search-publish-result-btn': function() {

                var requestParam = {};
                requestParam.tntInstId = getLoginTntInstId();
                requestParam.distributeId = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData().publishId;
                if(requestParam.distributeId.length == 0) return;
                getListDistributeResultHistory(requestParam);

            },
            'click .republish-btn' : function(){
                selectedResultIndex.data

                var that = this;
                PFComponent.showConfirm(bxMsg('confirmDoPublish'), function () {
                    var requestParam = selectedResultIndex.data;
                    var formData = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData();
                    requestParam.publishId = formData.publishId;


                    // Render PublishDetail Popup Page
                    PFRequest.post('/publish/publishProduct.json', requestParam, {
                        success: function (responseData) {
                            // If Publish Success Then Combo ProjectId Delete
                            if (publishDetailGrid.getAllData()[0].projectId) {
                                removeProject(publishDetailGrid.getAllData()[0].projectId);
                            }
                            // publish Success
                            PFComponent.showMessage(bxMsg('Z_RequestDistribute'), 'success');
                        },
                        complete: function() {
                            // 1. Main Page Query
                            $('.publish-search-btn').click();

                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updatePublishPd'
                        }
                    });
                });
            },
            // 승인요청
            'click .approval-request' : function(){

                var requestParam = {};
                requestParam.tntInstId = getLoginTntInstId();
                requestParam.publishId = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData().publishId;
                requestParam.status = APPROVALREQUEST;

                PFComponent.showConfirm(bxMsg('approvalRequestConfirmMessage'), function () {
                    PFRequest.post('/publish/updatePublishBaseStatus.json', requestParam, {
                        success: function (responseData) {
                            PFComponent.showMessage(bxMsg('approvalRequestMessage'), 'success');
                            $('.pf-publish-detail-tpl .publish-status-code-list').val('02');      // 승인요청상태로 변경
                            //$('.pf-publish-detail-tpl .approval-request').prop('disabled', true);
                            $('.pf-publish-detail-tpl .approval-request').css('display', 'none');
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updatePublishBaseStatus'
                        }
                    });
                });
            },
            // 승인수락
            'click .approval-accept' : function(){
                PFComponent.showConfirm(bxMsg('approvalAcceptConfirmMessage'), function () {
                    var requestParam = {};
                    requestParam.approvalId = $('.pf-publish-detail-tpl .approval-id').val();
                    requestParam.ApprovalStatusCode = '02'; // 승인
                    PFRequest.post('/publish/updateApprovalStatus.json', requestParam, {
                        success: function (responseData) {
                            PFComponent.showMessage(bxMsg('approvalAcceptMessage'), 'success');
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updateApprovalStatus'
                        }
                    });
                });
            },
            // 승인거절
            'click .approval-reject' : function(){
                PFComponent.showConfirm(bxMsg('approvalRejectionConfirmMessage'), function () {
                    var requestParam = {};
                    requestParam.approvalId = $('.pf-publish-detail-tpl .approval-id').val();
                    requestParam.ApprovalStatusCode = '03'; // 승인거절

                    PFRequest.post('/publish/updateApprovalStatus.json', requestParam, {
                        success: function (responseData) {
                            PFComponent.showMessage(bxMsg('approvalRejectionMessage'), 'success');
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PublishService',
                            operation: 'updateApprovalStatus'
                        }
                    });
                });
            },
            // 대상환경변경
            'change .target-environment' : function(){
            	_checkApprovalUseYnInfo();
            }
        },
        listeners: {
            afterSyncUI : function() {

                //var that = this;
                PFUI.use(['pfui/tab','pfui/mask'],function(Tab){

                    var tab = new Tab.Tab({
                        render : '.pf-publish-sub-tab',
                        elCls : 'nav-tabs',
                        autoRender: true,
                        children : [
                            {text:bxMsg('distributionDetailInfo'), index:1},    // 배포상세정보
                            {text:bxMsg('DAS0101String24'), index:2}            // 배포결과
                        ]
                    });

                    $('.pf-publish-result').hide();
                    tab.on('selectedchange',function (ev) {

                        var item = ev.item;

                        // 배포상세정보 탭
                        if (item.get('index') == 1) {
                            $('.pf-publish-result').hide();
                            $('.pf-publish-information').show();      // 배포상세정보 탭 활성

                            //make popup coboBox
                            var options = [];

                            $.each(codeMapObj['PublishStatusCode'], function (key, value) {
                                var $option = $('<option>');
                                $option.val(key);
                                $option.text(value);
                                options.push($option);
                            });
                            renderComboBox('SystemEnvironmentDistinctionCode', $('.target-environment'),null, false, false);
                            if(responseData.targetSystemEnvironmentDscd && responseData.targetSystemEnvironmentDscd !== null && responseData.targetSystemEnvironmentDscd !== ''){
                                $('.target-environment').val(responseData.targetSystemEnvironmentDscd);
                            }
                            renderComboBox('PublishTargetTypeCode', $('.publish-target-type'),null, false, false);

                            $('.pf-publish-detail-tpl .publish-status-code-list').html(options);

                            if (responseData) {
                                if (responseData.status) {
                                    $('.pf-publish-detail-tpl .publish-status-code-list').val(responseData.status);

                                    $('.pf-publish-detail-tpl .approval-request').css('display', 'none');
                                    $('.pf-publish-detail-tpl .approval-accept').css('display', 'none');
                                    $('.pf-publish-detail-tpl .approval-reject').css('display', 'none');

                                    if(responseData.status == MODIFIABLE && responseData.registerUserId == getLoginUserId()) {
                                        $('.pf-publish-detail-tpl .approval-request').css('display', 'inline');
                                    }else if(responseData.status == APPROVALREQUEST
                                        && responseData.approver == getLoginUserId()) {
                                        $('.pf-publish-detail-tpl .approval-accept').css('display', 'inline');
                                        $('.pf-publish-detail-tpl .approval-reject').css('display', 'inline');
                                    }
                                }
                                if (responseData.projectId) {
                                    var requestParam = {
                                        "projectId": responseData.projectId
                                    }
                                    // Render PublishDetail Popup Page
                                    PFRequest.get('/project/getProjectBase.json', requestParam, {
                                        success: function (resultData) {
                                            // Render PublishDetail Grid
                                            var gridData = [];
                                            gridData.push({
                                                "projectId": responseData.projectId,
                                                "name": resultData.name
                                            })
                                            renderPublishProjectGrid(gridData);
                                        },
                                        bxmHeader: {
                                            application: 'PF_Factory',
                                            service: 'ProjectMasterService',
                                            operation: 'queryProjectMaster'
                                        }
                                    });
                                } else {
                                    renderPublishProjectGrid(responseData);
                                }
                            } else {
                                renderPublishProjectGrid();

                            }

                            if(responseData.targetSystemList){
                                var targetSysGridDataList = [];
                                var responseTargetSysGridData = responseData.targetSystemList;

                                for (var i = 0 ; i < responseTargetSysGridData.length ; i ++){
                                    var targetSystem = {};
                                    targetSystem.name = responseTargetSysGridData[i].targetSystemName;
                                    targetSystem.code = responseTargetSysGridData[i].targetSystemCode;
                                    targetSystem.userNumber = responseTargetSysGridData[i].targetSystemUserNumber;
                                    targetSystem.userName = responseTargetSysGridData[i].targetSystemUserName;
                                    targetSysGridDataList.push(targetSystem);
                                }
                                renderTargetSysGrid(targetSysGridDataList);
                            }else{
                                renderTargetSysGrid();
                            }

                            renderApprovalInfoGrid(responseData.approvalList);
                        }
                        // 배포결과 탭
                        else {
                            $('.pf-publish-information').hide();
                            $('.pf-publish-result').show();     // 배포결과 탭 활성
                            $('.pf-publish-result').html(publishResultTab);
                            renderPublishResultGrid();
                            var publishId = PFComponent.makeYGForm($('.pf-publish-detail-table')).getData().publishId;
                            if(publishId){
                                var requestParam = {};
                                requestParam.tntInstId = getLoginTntInstId();
                                requestParam.distributeId = publishId;

                                getListDistributeResultHistory(requestParam);
                            }
                        }
                        // 권한이 없는 경우
                        if(writeYn != 'Y'){
                            $('.write-btn').hide();
                        }
                    }); // tab.on('selectedchange') end

                    // 배포상세정보 탭
                    tab.setSelected(tab.getItemAt(0));
                });
            } //End afterRenderUI
        }
    });

    function getListDistributeResultHistory(requestParam){

    	PFRequest.get('/publish/getListDistributeResultHistoryQuery.json', requestParam, {
            success: function (resultData) {

                for(var i = 0 ; i < resultData.length ; i ++){
                    resultData[i].distributeStatusContent = codeMapObj['PublishStatusCode'][resultData[i].distributeStatusDscd];
                }

                publishResultInfoGrid.setData(resultData);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PublishService',
                operation: 'queryPublishResultHistoryList'
            }
        });
    }
}


/**
 * 배포승인자 정보 그리드
 */
function renderApprovalInfoGrid(responseData) {
    // Grid Empty
    $('.pf-approval-info-grid').empty();
    approvalInfoGrid = PFComponent.makeExtJSGrid({
        fields: ["approvalId","approvalSeqNbr","approver","approverName","approvalStatusCode","registerDttm","statusChangeDttm"],
        gridConfig: {
            renderTo: '.pf-approval-info-grid',
            columns: [
                // 승인순서
                {text: bxMsg('ApprovalSeq'), flex: 1, dataIndex: 'approvalSeqNbr', style: 'text-align:center', align: 'center'},

                // 승인자
                {text: bxMsg('DAS0101String12'), flex: 1, dataIndex: 'approverName', style: 'text-align:center', align: 'center'},

                // 승인상태
                {text: bxMsg('DAS0101String15'), flex: 1, dataIndex: 'approvalStatusCode', style: 'text-align:center',  align: 'center',
                    renderer: function(value){
                        return codeMapObj.aprvlStsCd[value] || value;
                    }
                },

                // 승인일자
                {text: bxMsg('DAS0101String14'), flex: 1, dataIndex: 'statusChangeDttm', style: 'text-align:center',  align: 'center'},
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    renderer:function(val, metadata, record){
                        if(publishDetailForm.getData().status == MODIFIABLE){
                            this.items[0].icon = '/images/x-delete-16.png';
                        }
                    },
                    items: [{
                        //icon: '/images/x-delete-16.png',
                        icon: '',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            var status = publishDetailForm.getData().status;
                            if(status != MODIFIABLE) {
                                // Don't Delete
                                return;
                            }
                            $('.add-publish-projectId-btn').show();
                            $('.search-pd-info-chng-btn').hide();
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });
    if(responseData) {
        approvalInfoGrid.setData(responseData);
    }
}

/**
 * 배포대상시스템 정보 그리드
 */
function renderTargetSysGrid(responseData) {
    // Grid Empty
    $('.pf-publish-target-sys-grid').empty();
    targetSysInfoGrid = PFComponent.makeExtJSGrid({
        fields: ["name", "userNumber", "userName","code"],
        gridConfig: {
            renderTo: '.pf-publish-target-sys-grid',
            columns: [
                // 1. PAS0501String2 : 시스템명
                // 2. DAS0101String19 : 담당자
                {text: bxMsg('PAS0501String2'), flex: 1, dataIndex: 'name', style: 'text-align:center', align: 'center'},
                //{text: bxMsg('DAS0101String19'), flex: 1, dataIndex: 'userNumber', style: 'text-align:center',  align: 'center'},
                {text: bxMsg('DAS0101String19'), flex: 1, dataIndex: 'userName', style: 'text-align:center',  align: 'center'},
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    renderer:function(val, metadata, record){
                        if(publishDetailForm.getData().status == MODIFIABLE){
                            this.items[0].icon = '/images/x-delete-16.png';
                        }
                    },
                    items: [{
                        //icon: '/images/x-delete-16.png',
                        icon: '',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            var status = publishDetailForm.getData().status;
                            if(status != MODIFIABLE) {
                                // Don't Delete
                                return;
                            }
                            $('.add-publish-projectId-btn').show();
                            $('.search-pd-info-chng-btn').hide();
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });
    if(responseData) {
        targetSysInfoGrid.setData(responseData);
    }
}


/**
 * 배포결과 정보 그리드
 */
function renderPublishResultGrid(responseData) {
    // Grid Empty
    $('.pf-publish-result-grid').empty();
    publishResultInfoGrid = PFComponent.makeExtJSGrid({
        fields: ['targetSystemCode', 'targetSystemName', 'distributeExecuteTimestamp', 'distributeExecuteEndTimestamp', 'distributeStatusDscd', 'errorMessageCode','distributeStatusContent',
            'sequenceNumber', 'systemEvironmentDscd',],
        gridConfig: {
            renderTo: '.pf-publish-result-grid',
            columns: [
                // 1. 일련번호
                {text: '', flex: 0.2,  dataIndex: 'sequenceNumber', style: 'text-align:center', align: 'center'},
                // 2. PAM0500String1  : 배포대상시스템
                {text: bxMsg('PAM0500String1'), flex: 0.7,  dataIndex: 'targetSystemName', style: 'text-align:center', align: 'center'},
                // 3. envrnmntDscd    : 대상환경
                {text: bxMsg('envrnmntDscd'), flex: 0.7, dataIndex: 'systemEvironmentDscd', style: 'text-align:center', align: 'center',
                    renderer: function(value, p, record) {
                        return codeMapObj['SystemEnvironmentDistinctionCode'][value];
                    }
                },
                // 4. PAS0501String12 : 시작일
                {text: bxMsg('PAS0501String12'), flex: 1, dataIndex: 'distributeExecuteTimestamp', style: 'text-align:center', align: 'center'},
                // 5. PAS0501String13 : 종료일
                {text: bxMsg('PAS0501String13'), flex: 1, dataIndex: 'distributeExecuteEndTimestamp', style: 'text-align:center', align: 'center'},
                // 6. DAS0101String5  : 배포상태
                {text: bxMsg('DAS0101String5'), flex: 0.7,  dataIndex: 'distributeStatusContent', style: 'text-align:center', align: 'center'}
            ],
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    selectedResultIndex = record;

                    if(record.get('distributeStatusDscd') === DEVDISTRIBUTEFAIL || record.get('distributeStatusDscd') === PRODUCTIONDISTRIBUTEFAIL){
                        $('.publish-info-detail').html('[Error Message] : ' + record.get('errorMessageCode'));
                        $('.republish-btn').css('display', 'block');
                    }else {
                        $('.publish-info-detail').empty();
                        $('.republish-btn').css('display', 'none');
                    }
                }
            }
        }
    });
    if(responseData) {
        publishResultInfoGrid.setData(responseData);
    }
}