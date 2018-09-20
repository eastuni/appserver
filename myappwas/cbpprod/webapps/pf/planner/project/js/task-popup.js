function renderUpdateStatePopup(){
    const updateStatePopupTpl = PFUtil.getTemplate('planner/project','updateStatePopupTpl');
    PFComponent.makePopup({
        title: bxMsg('updateState'),		// 상태변경
        width: 400,
        height: 220,
        contents: updateStatePopupTpl(),
        submit: function() {
            $('.pf-pt-dev-task-detail-tpl .update-state-ctns').val($('.pf-pt-update-state-popup .update-state-ctns-popup').val());
            $('.detail-task-info-table .project-state').val($('.pf-pt-update-state-popup .update-state').val());
        },
        listeners: {
            afterRenderUI: function() {
                $('.pf-pt-update-state-popup .update-state-ctns-popup').val($('.pf-pt-dev-task-detail-tpl .update-state-ctns').val());
                renderComboBox('ProgressStatusCode', $('.pf-pt-update-state-popup .update-state'), '10');       // 상품정보수정 상태로 변경
            }
        }
    });
}


/*********************************************************************************************************
 * 개발과제 정보 팝업
 *********************************************************************************************************/
var relIdeaGrid, relRoleGrid, relUserGrid, relObjectGrid;
var fileUploadList = new FormData();
var deleteFileList = [];
var fileAddSeq = 0;
var fileGrid;
var activityList = {};
var tabIndex = 0;
var writeYn = writeYn ? writeYn : g_menuList['/planner/project/index.htm'].writeYn;
var g_popupOnly = false;
var popupModifyFlag = false;

// 개발과제 정보 팝업
function renderTaskPopup(data, popupOnly){

	popupModifyFlag = false;

	if(popupOnly){
		g_popupOnly = popupOnly;
	}

    var buttons = [];
    var temp;
    fileUploadList = new FormData();
    fileGrid = temp;
    /*
     개발과제상테
     01.수정가능
     02.등록완료
     03.개발배포중
     04.개발배포완료
     05.운영배포중
     06.운영배포완료
     07.테스트배포중
     08.테스트배포완료
     09.종료
     10.상품정보수정
     */

    // 신규, 01.수정가능, 02.등록완료, 04.개발배포완료, 08.테스트배포완료, 10.상품정보수정
    if(!data || data.progressStatus == '01'  || data.progressStatus == '02' || data.progressStatus == '04' || data.progressStatus == '08' || data.progressStatus == '10') {
        buttons.push({  // 저장 버튼 추가
            text: bxMsg('ButtonBottomString1'),
            elCls: 'button button-primary task-save-btn write-btn',
            handler: function () {
                if (tabIndex == 0) {
                    var form = PFComponent.makeYGForm($('.detail-task-info-table'));
                    //var that = this;
                    var name = $('.task-name').val();
                    if (!name) {
                        name = '';
                    }
                    var content = $('.task-content').val();

                    if($('.pf-pt-dev-task-detail-tpl .update-state-ctns').val().length > 0) {
                        content = content +"\n\n--------------------\n"
                            + $('.pf-pt-dev-task-detail-tpl .update-state-ctns').val();
                        
                        popupModifyFlag = true;
                    }
                    
                    var nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
                    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

                    if(content.length > 300){
                        // 개발과제내용은 300자 이상 입력할 수 없습니다.
                        PFComponent.showMessage(bxMsg('taskContentOverLength'), 'warning');
                        return;
                    }

                    var requestParam = form.getData();
                    requestParam.endDate = requestParam.endDate.split(' ')[0].concat(' 23:59:59');
                    requestParam.registUserName = getLoginUserNm();
                    requestParam.registUserId = getLoginUserId();
                    requestParam.relationList = relIdeaGrid.getAllData();
                    requestParam.relUserList = relUserGrid.getAllData().concat(relRoleGrid.getAllData());
                    requestParam.content = content;
                    if (nameLengthCheck && mandatoryCheck) {
                        var url, bxmHeader;
                        if (data) {

                        	if(!popupModifyFlag){
                        		// 변경된 정보가 없습니다.
                        		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
                        		return;
                        	}

                            url = '/project/updateProjectBase.json';
                            bxmHeader = {
                                application: 'PF_Factory',
                                service: 'ProjectMasterService',
                                operation: 'updateProjectMaster'
                            }
                        } else {
                            url = '/project/createProjectBase.json';
                            bxmHeader = {
                                application: 'PF_Factory',
                                service: 'ProjectMasterService',
                                operation: 'createProjectMaster'
                            }
                        }
                        PFRequest.post(url, requestParam, {
                            success: function (responseData) {
                                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

                                data = requestParam;
                                popupModifyFlag = false;

                                if (responseData.projectId) {
                                	data.projectId = responseData.projectId;
                                	$('#task-panel .task-id').val(responseData.projectId);
                                }

                                if($('.detail-task-info-table .project-state').val() == '10'){
                                    $('.task-content').val(content);
                                    loadTaskRibbon('Y');
                                }else {
                                    data.progressStatus = '01';   // 수정가능
                                    $('.detail-task-info-table .project-state').val('01');
                                }

                                fnControlTaskInfoTab(data);

                                renderActivityContent(data);
                                //that.close();
                            },
                            bxmHeader: bxmHeader
                        });
                    }
                }
                else if (tabIndex == 1) {
                    var form = PFComponent.makeYGForm($('.activity-info-table'));
                    var requestData = form.getData();
                    requestData.projectId = $('.detail-task-info-table .task-id').val();
                    requestData.registUserName = getLoginUserNm();
                    requestData.registUserId = getLoginUserId();

                    requestData.fileId = '';
                    requestData.fileName = '';
                    
                    /** for IE
                    fileUploadList.delete('deleteList');
                    fileUploadList.delete('relationObjectKey');
                    fileUploadList.delete('tntInstId');
                    fileUploadList.delete('relationObjectTypeCode');
                    */
                    delete fileUploadList.deleteList;
                    delete fileUploadList.relationObjectKey;
                    delete fileUploadList.tntInstId;
                    delete fileUploadList.relationObjectTypeCode;
                    
                    fileUploadList.append('relationObjectKey', requestData.projectId+requestData.activityId);
                    fileUploadList.append('relationObjectTypeCode', 'TASK');
                    fileUploadList.append('tntInstId', getLoginTntInstId());
                    fileUploadList.append('deleteList', JSON.stringify(deleteFileList));

                    $(document.body).addClass('waiting');
                    $(document.body).find('.tab-content').find('iframe').contents().find('body').addClass('waiting');

                    PFRequest.post('/project/saveProjectActivityHistory.json', requestData, {
                        success: function () {

                            /*
                             * 첨부파일 업로드
                             */

                            $.ajax({
                                url: "/pf_common/jsp/attachmentupload.jsp",
                                type: "POST",
                                data: fileUploadList,
                                // cache: false,
                                processData: false,
                                contentType: false,
                                success: function(data) {
                                	// 파일업로드 실패(에러)시에 아래로직 중단
                                	if (data && data.error) {
                            			PFComponent.showMessage(bxMsg('fileUploadFailed'), 'error');
                            	        return;
                                	}
                                	
                                    var form = PFComponent.makeYGForm($('.idea-info-table'));
                                    var formData = form.getData();

                                    var attachmentInfo = {};
                                    attachmentInfo.relationObjectKey = requestData.projectId+requestData.activityId;
                                        attachmentInfo.relationObjectTypeCode = 'TASK';
                                    attachmentInfo.tntInstId = getLoginTntInstId();
                                    
                                    // for IE
                                    if (data && !data.error) {
                                    	attachmentInfo.commonFileDetailVOList = data.concat(deleteFileList);
                                    }

                                    PFRequest.post('/common/attachmentUpload.json',attachmentInfo, {
                                        success: function () {

                                            $(document.body).removeClass('waiting');
                                            $(document.body).find('.tab-content').find('iframe').contents().find('body').removeClass('waiting');

                                            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                                            popupModifyFlag = false;

                                            $('.isSelected').addClass('isSave');
                                            activityList[requestData.activityId].activitySaveInfo = requestData;
                                            deleteFileList = [];
                                            data.progressStatus = '01';   // 수정가능
                                            $('.detail-task-info-table .project-state').val('01');

                                            fnControlTaskInfoTab(data);
                                            $('.complete-btn').removeClass('isSave');

                                        },
                                            bxmHeader: {
                                            application: 'PF_Factory',
                                            service: 'CommonService',
                                            operation: 'saveCommonFileMaster'
                                        }
                                    });
                                }, error: function(jqXHR, textStatus, errorThrown) {}
                            });
                            //that.close();

                            //액티비티내용 조회
                            var requsetParam = {
                                tntInstId:getLoginTntInstId(),
                                projectId:requestData.projectId,
                                activityId:requestData.activityId
                            }
                            PFRequest.get('/project/getProjectActivityHistory.json', requsetParam, {
                                success: function (responseData) {

                                $('#activity-panel .activity-content').val(responseData.activityContent);
                                $('#activity-panel .regist-date').val(responseData.gmtLastModify);
                                $('#activity-panel .regist-user-name').val(responseData.staffNm);

                                },
                                bxmHeader: {
                                    application: 'PF_Factory',
                                    service: 'ActivityHistoryService',
                                    operation: 'getProjectActivityHistory'
                                }
                            });
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ActivityHistoryService',
                            operation: 'saveActivityHistory'
                        }
                    });
                }
            }
        });
    };

    if(!data || data.progressStatus == '01'  || data.progressStatus == '02' ) {
        buttons.push({  // 완료 버튼
            text: bxMsg('Complete'),
            elCls: 'button button-primary task-complete-btn write-btn',
            handler: function () {
                var that = this;
                var requestParam = {projectId: $('.detail-task-info-table .task-id').val()};

                fnComplete(requestParam, that);
            }
        });
    }

    if(!data || data.progressStatus == '01' || data.progressStatus == '02') {
        buttons.push({  // 삭제 버튼
            text: bxMsg('ButtonBottomString2'),
            elCls: 'button button-primary task-delete-btn write-btn',
            handler: function () {
                if (tabIndex == 0) {
                    var form = PFComponent.makeYGForm($('.detail-task-info-table'));
                    var that = this;

                    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function () {
                        PFRequest.post('/project/deleteProject.json', form.getData(), {
                            success: function () {
                                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                                removeProject(form.getData().projectId);
                                if(!g_popupOnly) searchProjectData();
                                loadTaskRibbon('Y');
                                popupModifyFlag = false;
                                that.close();
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'ProjectMasterService',
                                operation: 'deleteProjectMaster'
                            }
                        });
                    }, function () {
                        return;
                    });
                }
                else if (tabIndex == 1) {
                    var that = this;
                    var form = PFComponent.makeYGForm($('.activity-info-table'));
                    var requestData = form.getData();
                    requestData.projectId = $('.detail-task-info-table .task-id').val();

                    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function () {
                        PFRequest.post('/project/deleteProjectActivityHistory.json', requestData, {
                            success: function () {
                                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                                popupModifyFlag = false;

                                delete activityList[requestData.activityId].activitySaveInfo;
                                $('#' + requestData.activityId).removeClass('isSave');
                                $('#' + requestData.activityId).click();
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'ActivityHistoryService',
                                operation: 'deleteActivityHistory'
                            }
                        });
                    }, function () {
                        return;
                    });
                }
            }
        });
    }

    buttons.push({ // 닫기
        text:bxMsg('ContextMenu_Close'), elCls:'button button-primary',handler:function(){
        	if(!g_popupOnly) searchProjectData();
            loadTaskRibbon('Y');
            this.close();
        }
    });

    const taskPopupTpl = PFUtil.getTemplate('planner/project','taskPopupTpl');				// 개발과제정보팝업
    var popup = PFComponent.makePopup({
        title: bxMsg('PAS0202String5'),		// 개발과제 정보
        contents: taskPopupTpl(data),
        width:800,
        height:655,
        buttons: buttons,
        modifyFlag : 'popup',
        contentsEvent : {
            // 개발과제 정보 탭 > 아이디어추가 버튼 클릭
            'click .add-rel-idea-btn': function(e) {
                var submitEvent = function(selectedList){

                	var idea = false;
                	selectedList.forEach(function (selectItem){
            			relIdeaGrid.getAllData().forEach(function(gridItem){
        					if(selectItem.ideaId == gridItem.ideaId){
        						idea = true;
        						return;
        					}
        				});
        			});

                	if(idea){
            			PFComponent.showMessage(bxMsg('CannotAddExistingItem'), 'warning');
            	        return;
            		}

                    selectedList.forEach(function(el){
                        relIdeaGrid.addData(el);
                        popupModifyFlag = true;
                    });
                }
                searchIdeaPopup(submitEvent);
            },
            // 개발과제 정보 탭 > 역할추가 버튼 클릭
            'click .add-rel-role-btn': function(e) {

            	PFPopup.selectRole({multi : true}, function(selectItems) {
                	if(selectItems) {

                		var role = false;
                		selectItems.forEach(function (selectItem){
            				relRoleGrid.getAllData().forEach(function(gridItem){
            					if(selectItem.roleId == gridItem.roleId){
            						role = true;
            						return;
            					}
            				});
            			});

                		if(role){
                			PFComponent.showMessage(bxMsg('CannotAddExistingItem'), 'warning');
                	        return;
                		}

                		selectItems.forEach(function (el){
                			relRoleGrid.addData({
                				roleId : el.roleId,
                    			name : el.roleNm
                    		});
                			popupModifyFlag = true;
                		});
                	}
                });

            },
            // 개발과제 정보 탭 > 사용자추가 버튼 클릭
            'click .add-rel-user-btn': function(e) {

            	PFPopup.selectEmployee({multi : true}, function(selectItems) {
                	if(selectItems) {

                		var staff = false;
                		selectItems.forEach(function (selectItem){
                			relUserGrid.getAllData().forEach(function(gridItem){
            					if(selectItem.staffId == gridItem.staffId){
            						staff = true;
            						return;
            					}
            				});
            			});

                		if(staff){
                			PFComponent.showMessage(bxMsg('CannotAddExistingItem'), 'warning');
                	        return;
                		}

                		selectItems.forEach(function (el){
                			relUserGrid.addData({
                    			staffId : el.staffId,
                    			name : el.staffName
                    		});
                			popupModifyFlag = true;
                		});

                	}
                });

            },
            // 액티비티 정보 탭 > 액티비티 정보 버튼 클릭 이벤트
            'click .activity-btn': function(e){
                renderActivityInfo(e, data);
            },
            'change #uploadfile': function () {

                var fileList = $('#uploadfile')[0].files;

                for(var i = 0 ; i < fileList.length ; i++){

                    //grid에 추가
                    var fileInfo = {
                        process : 'C',
                        addSeq : fileAddSeq,
                        localFileName : fileList[i].name,
                        fileSize : fileList[i].size
                    }
                    fileGrid.addData(fileInfo);
                    popupModifyFlag = true;

                    //fileUploadList에 추가
                    fileUploadList.append('new-' + fileAddSeq, fileList[i]);
                    fileAddSeq++;
                  }
            },
            'change .project-type' : function(e){
                if($('#task-panel .task-id').val()==''){ return; }
                renderActivityContent(data);
            },
            'click .update-state-btn' : function(e){
                renderUpdateStatePopup();
            },
            // 배포대상조회
            'click .search-pd-info-chng-btn': function(){
                renderPdInfoChange({projectId : data.projectId});
            },
            'click .complete-btn' : function(){
                var requestParam = {projectId: $('.detail-task-info-table .task-id').val()};
                fnComplete(requestParam, popup.popup);
            }
        },
        listeners: {
            afterSyncUI: function() {

                PFUI.use('pfui/tab',function(Tab){

                	tab = new Tab.Tab({
                        render : '#task-sub-info-tab',
                        elCls : 'nav-tabs',
                        autoRender: true,
                        children:[
                            {text:bxMsg('PAS0202String5'),value:data, index:0},		// 개발과제 정보
                            {text:bxMsg('ActivityInfo'),value:data, index:1},		// 액티비티 정보
                            {text:bxMsg('productInformationAllCheck'),value:data, index:2}		// 상품 정보
                        ]
                    });
                    tab.on('selectedchange',function (ev) {
                        var item = ev.item;

                        // index = 0 일때
                        if(item.get('index') == 0){
                            tabIndex = 0;

                            $('.dev-task-detail').show();
                            $('.activity-info').hide();
                            $('.product-info').hide();

                            if(data){
                                fnControlTaskInfoTab(data);
                            }
                            // 신규일 때
                            else{
                                $('.task-delete-btn').prop('disabled', true);	    // 삭제버튼 비활성
                                $('.task-complete-btn').prop('disabled', false);	// 완료버튼 활성
                                $('.task-save-btn').prop('disabled', false);        // 저장버튼 활성
                                $('.update-state-btn').prop('disabled', true);      // 상태변경버튼 비활성
                            }
                        }
                        // index = 1 일때 -> activity 탭 활성
                        else {

                            // 개발과제 정보를 저장하지 않았을 경우
                            if($('#task-panel .task-id').val()=='' || $('.project-type').val()==''){
                                PFComponent.showMessage(bxMsg('ProjectErrorMsg01'), 'warning');
                                tab.setSelected(tab.getItemAt(0), 1);
                                return;
                            }

                            if(item.get('index') == 1){
                            	tabIndex = 1;
                                $('.dev-task-detail').hide();
                                $('.activity-info').show();
                                $('.product-info').hide();

                                if(!$('#activity-panel').html()){
                                    renderActivityContent(data);
                                }

                                if($('.activity-btn').length > 0) {
                                    $('.activity-btn')[0].click();		// 첫번째 activitiy-btn 클릭
                                }
                            }
                            else if(item.get('index') == 2){
                            	tabIndex = 2;
                                $('.dev-task-detail').hide();
                                $('.activity-info').hide();
                                $('.product-info').show();

                                if(!$('#product-panel').html()){
                                	renderProductGrid(data);
                                }
                            }
                        }
                    });

                    renderTaskDetailContent(data);
                    tab.setSelected(tab.getItemAt(0), 1);

                    if(writeYn != 'Y'){
                        $('.write-btn').hide();
                    }

                });

            }
        }
    });



    function fnComplete(requestParam, that){

        PFRequest.post('/project/completeProjectBase.json', requestParam, {       // check 만 하는 로직이기 때문에 post로 호출할 필요 없음.
            success: function (responseData) {
                PFComponent.showMessage(bxMsg('Complete'), 'success');
                if(!g_popupOnly) searchProjectData();
                loadTaskRibbon('Y', requestParam.projectId);
                popupModifyFlag = false;

                that.close();
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'ProjectMasterService',
                operation: 'completeProjectMaster'
            }
        });

    }

    function fnControlTaskInfoTab(data){
        // 수정가능 일때
        if(data.progressStatus=='01'){
            $('.task-delete-btn').prop('disabled', false);	    // 삭제버튼 활성
            $('.task-complete-btn').prop('disabled', false);    // 완료버튼 활성
            $('.task-save-btn').prop('disabled', false);        // 저장버튼 활성
            $('.update-state-btn').prop('disabled', true);      // 상태변경버튼 비활성
        }
        else if(data.progressStatus=='02'){ // 완료일때
            $('.task-delete-btn').prop('disabled', true);	    // 삭제버튼 비활성
            $('.task-complete-btn').prop('disabled', true);     // 완료버튼 비활성
            $('.task-save-btn').prop('disabled', false);        // 저장버튼 활성
            $('.update-state-btn').prop('disabled', true);      // 상태변경버튼 비활성
        }
        else{
            $('.task-delete-btn').prop('disabled', true);	    // 삭제버튼 비활성
            $('.task-complete-btn').prop('disabled', true);     // 완료버튼 비활성


            // 개발배포성공, 테스트배포성공 일때
            if(data.progressStatus=='04' || data.progressStatus=='08'){
                $('.task-save-btn').prop('disabled', false);        				// 저장버튼 활성
                $('.update-state-btn').prop('disabled', false);     				// 상태변경버튼 활성
                $('.detail-task-info-table .task-name').prop('disabled', true);     // 개발과제명 비활성
                $('.detail-task-info-table .start-date').prop('disabled', true);    // 적용기간 비활성
                $('.detail-task-info-table .end-date').prop('disabled', true);      // 적용기간 비활성
                $('.detail-task-info-table .project-type').prop('disabled', true);	// 개발과제유형 비활성
                $('.detail-task-info-table .add-rel-idea-btn').hide();              // 관련아이디어 추가 비활성
                
            } 
            // 상품정보수정 일때
            else if (data.progressStatus=='10') {
            	$('.task-save-btn').prop('disabled', false);        // 저장버튼 활성
                $('.update-state-btn').prop('disabled', false);     // 상태변경버튼 활성
                $('.detail-task-info-table .project-type').prop('disabled', false);          // 개발과제유형 disabled
                $('.detail-task-info-table .task-name').prop('disabled', true);             // 개발과제명 disabled
                $('.detail-task-info-table .start-date').prop('disabled', true);            // 적용기간 disabled
                $('.detail-task-info-table .end-date').prop('disabled', true);              // 적용기간 disabled
                
            } else{
                $('.task-save-btn').prop('disabled', true);         // 저장버튼 비활성
                $('.update-state-btn').prop('disabled', true);      // 상태변경버튼 비활성
            }
        }
    }

    return popup;
}


// 개발정보탭
function renderTaskDetailContent(data){
    const taskPopupTaskDetailTpl = PFUtil.getTemplate('planner/project','taskPopupTaskDetailTpl');	// 개발과제정보탭

    // 개발과제 정보
    $('#task-panel').html(taskPopupTaskDetailTpl(data));

    // 달력 컴포넌트 로드
    $target = $('#task-panel');

    var config = {};
    config.minDate = PFUtil.getToday();
    PFUtil.getDatePicker(false, $('#task-panel'), config);
    if (data && data.startDate && data.endDate) {
      $("#task-panel .calendar.start-date").val(data.startDate.split(' ')[0]);
      $("#task-panel .calendar.end-date").val(data.endDate.split(' ')[0]);
    }

    // 관련아이디어
    relIdeaGrid = PFComponent.makeExtJSGrid({
        fields: [
            "ideaId","ideaNm"
        ],
        gridConfig: {
            renderTo: '.pf-pt-dev-task-detail-tpl .rel-idea-grid',
            columns: [
                {text: bxMsg('PAS0102String3'), flex:1, dataIndex: 'ideaNm'},      // 아이디어명
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            popupModifyFlag = true;
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });
    console.log(relIdeaGrid);

    // 관련역할
    relRoleGrid = PFComponent.makeExtJSGrid({
        fields: [
            "roleId", "name", "writeYn"
        ],
        gridConfig: {
            renderTo: '.pf-pt-dev-task-detail-tpl .rel-role-grid',
            columns: [
                {text: bxMsg('SUM0103String1'), flex:1, dataIndex: 'roleId'},       // 역할ID
                {text: bxMsg('SUM0103String2'), flex:1.5, dataIndex: 'name'},     	// 역할명
                {xtype: 'checkcolumn', text: bxMsg('WriteYn'), width: 80, dataIndex: 'writeYn'},	//
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	popupModifyFlag = true;
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });

    // 관련사원
    relUserGrid = PFComponent.makeExtJSGrid({
        fields: [
            "staffId","name", "writeYn"
        ],
        gridConfig: {
            renderTo: '.pf-pt-dev-task-detail-tpl .rel-user-grid',
            columns: [
                {text: bxMsg('emplId'), flex:1, dataIndex: 'staffId'},        // 직원ID
                {text: bxMsg('employeeName'), flex:1, dataIndex: 'name'},     // 직원명
                {xtype: 'checkcolumn', text: bxMsg('WriteYn'), width: 80, dataIndex: 'writeYn'},	//
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	popupModifyFlag = true;
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });

    // 개발과제유형 콤보 바인딩
    var requestParam = {};
    var projectTypeOption = [];
    PFRequest.get('/projecttype/getProjectTypeMasterList.json', requestParam, {
        success: function (responseData) {

            var $option = $('<option>');

            $.each(responseData, function (index, projectType) {
                if(!parent.g_projectTypeAuthority[projectType.projectTypeCode]
                   || parent.g_projectTypeAuthority[projectType.projectTypeCode] != 'N') {

                    var $option = $('<option>');
                    $option.val(projectType.projectTypeCode);
                    $option.text(projectType.projectTypeName);
                    projectTypeOption.push($option);
                }
            });
            $('.detail-task-info-table .project-type').html(projectTypeOption);

            if(data) $('.detail-task-info-table .project-type').val(data.projectTypeCode);

            // activity tab 조회
            if(data && data.projectTypeCode && data.projectTypeCode!='') {
                renderActivityContent(data);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectTypeMasterService',
            operation: 'queryListProjectTypeMaster'
        }
    });

    // 개발과제상태 콤보 바인딩
    renderComboBox('ProgressStatusCode', $('.detail-task-info-table .project-state'));

    if(data){
        relIdeaGrid.setData(data.relationList);

        relRoleGrid.setData($.grep(data.relUserList, function(el, i){
        	return el.roleId.length != 0;
        }));

        relUserGrid.setData($.grep(data.relUserList, function(el, i){
        	return el.staffId.length != 0;
        }));

        $('.detail-task-info-table .project-state').val(data.progressStatus ? data.progressStatus : '');
    }
}


// 액티비티 정보 탭
function renderActivityContent(data){
    const activityInfoTpl = PFUtil.getTemplate('planner/project','activityInfoTpl');				// 액티비티정보탬

    if(!data) var data = {};

    data.projectTypeCode = $('.project-type').val();

    $('#activity-panel').html(activityInfoTpl(data));

    // 개발과제유형의 액티비티 정보 조회
    if(data){
        delete(data.commonHeader);
        delete(data.commonHeaderMessage);
        delete(data.tntInstId);
        delete(data.relationList);
    }
    PFRequest.get('/projecttype/getProjectTypeMaster.json',data,{
        success: function(responseData) {

            $('.pf-pt-activity-info-tpl .activity-btn-box').empty();

            // 조회데이터가 없을경우 disabled 처리
            if(responseData.relationList == false) {
            	tab.getItemAt(1).set('disabled', true);
            	$('.pfui-tab-item-disabled').css('opacity', '0.4');
            	$('.pfui-tab-item-disabled').find('span').css('cursor', 'initial');
            }

            //activityList = responseData.relationList;
            responseData.relationList.forEach(function (el) {

                activityList[el.activityId] = el;

                var activityName;

                if (el.activityName && el.activityName.length > 5) {
                    activityName = el.activityName.substr(0, 5) + '...';
                } else {
                    activityName = el.activityName;
                }

                var $button = '<button class="bw-btn bx-btn-small activity-btn';

                //2017.08.16 KYS 수정
                //isMandatory일때 테두리가 아니라  빨간 *을 붙이도록
                // if (el.isMandatory) {
                //     //$button = $button + '* ';
                //     $button = $button + " isMandatory";
                // }

                var mandatoryCntnt = '';

                 if (el.isMandatory) {
                     mandatoryCntnt = '<span style="color:red"> *</span>';
                 }
                $button = $button + '" id="' + el.activityId + '">' + activityName + mandatoryCntnt + '</button>'
                    + ' <i class="fa fa-chevron-right"></i> ';

                $('.pf-pt-activity-info-tpl .activity-btn-box').append($button);
            });

            var $button = '<button class="complete-btn bw-btn bx-btn-small';

            if ($('.project-state').val() != '01')    // 수정가능이 아니면
                $button = $button + ' isSave';

            $button = $button + '">' + bxMsg('Complete') + '</button>';

            $('.pf-pt-activity-info-tpl .activity-btn-box').append($button);

            searchRelActivityInfo(data);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectTypeMasterService',
            operation: 'queryProjectTypeMaster'
        }
    });

    // // file uploader
    // PFUI.use('pfui/uploader', function (Uploader) {
    //     var uploader = new Uploader.Uploader({
    //         type: 'iframe',
    //         render: '.activity-file',
    //         url: '/common/upload.json',
    //         multiple: false,
    //         isSuccess: function (result) {
    //             fileUploadResult = null;
    //
    //             var pre=$(result)[0];
    //             var jsonStr=$(pre).text();
    //             var result=jQuery.parseJSON(jsonStr);
    //
    //             if (result && result.isSuccess) {
    //                 fileUploadResult = result;
    //             }
    //             return false;
    //         },
    //         rules: {
    //             maxSize: [1024 * 1024, bxMsg('maximumFileSizeIs10M')],
    //             max: [1, bxMsg('limitFileNumber')],
    //             min: [1, bxMsg('minimumFileNumber')],
    //             ext: [
    //                 '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.pdf',
    //                 '</br>'+bxMsg('warningFileType')
    //             ]
    //         },
    //         text: bxMsg('fileUpload'),
    //         listeners: {
    //             success: function(ev) {
    //             },
    //             afterAddChild: function(e) {
    //             },
    //             complete: function(e) {
    //             }
    //         }
    //     }).render();
    // });

}

function searchRelActivityInfo(data) {
    // 관련액티비티 정보 조회
    PFRequest.get('/project/getProjectActivityHistoryList.json',data,{
        success: function(responseData){

            responseData.forEach(function(el){
                $('#activity-panel').find('#'+el.activityId).addClass('isSave');

                // activityList에 relActivity 정보를 set
                activityList[el.activityId].activitySaveInfo = el;
            });
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ActivityHistoryService',
            operation: 'queryListActivityHistory'
        }
    });
}

//액티비티 버튼 클릭 시
function renderActivityInfo(e, data){

	$('.isSelected').text($('.isSelected').text().substr(2));
    $('.isSelected').removeClass('isSelected');

    var id = e.target.id;
    var $selectedBtn = $('#'+id);

    $selectedBtn.addClass('isSelected');			//e.target.classList.add('isSelected');
    $selectedBtn.text('▼ ' + $selectedBtn.text());	//e.target.textContent = '▼ ' + e.target.textContent;

    if(activityList[id].activityMaster.contentNeedYn == 'Y'){
        $('#activity-panel .contentNeedYn').show();
    }else{
        $('#activity-panel .contentNeedYn').hide();
    }

    if(activityList[id].activityMaster.fileNeedYn == 'Y'){
        $('#activity-panel .fileNeedYn').show();
    }else{
        $('#activity-panel .fileNeedYn').hide();
    }

    if(data && (data.progressStatus!='01')){
        $('.task-delete-btn').prop('disabled', true);	    // 삭제버튼 비활성
    }
    else if(activityList[id].activitySaveInfo && activityList[id].activitySaveInfo != ''){
        $('#activity-panel .activity-content').val(activityList[id].activitySaveInfo.activityContent);
        $('#activity-panel .regist-date').val(activityList[id].activitySaveInfo.gmtLastModify);
        $('#activity-panel .regist-user-name').val(activityList[id].activitySaveInfo.registUserName);
        $('#activity-panel .regist-user-id').val(activityList[id].activitySaveInfo.registUserId);
        $('.task-delete-btn').prop('disabled', false);	    // 삭제버튼 활성
    }
    else{
        $('#activity-panel .activity-content').val('');
        $('#activity-panel .regist-date').val('');
        $('#activity-panel .regist-user-name').val('');
        $('#activity-panel .regist-user-id').val('');
        $('.task-delete-btn').prop('disabled', true);	    // 삭제버튼 비활성
    }

    // 데이터 바인딩
    $('#activity-panel .activity-id').val(activityList[id].activityId);
    $('#activity-panel .activity-name').val(activityList[id].activityName);


    //액티비티내용 조회
    var requsetParam = {
        tntInstId:getLoginTntInstId(),
        projectId:data.projectId,
        activityId:activityList[id].activityId
    }
    PFRequest.get('/project/getProjectActivityHistory.json', requsetParam, {
        success: function (responseData) {

	    	// OHS 20180207 - 스크립트오류방지
	    	if(responseData) {
		        $('#activity-panel .activity-content').val(responseData.activityContent);
		        $('#activity-panel .regist-date').val(responseData.gmtLastModify);
		        $('#activity-panel .regist-user-name').val(responseData.staffNm);
	    	}

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ActivityHistoryService',
            operation: 'getProjectActivityHistory'
        }
    });

    /**
     * 첨부파일 그리드 조회
     */
    var requsetParam = {
        tntInstId:getLoginTntInstId(),
        relationObjectTypeCode:'TASK',
        relationObjectKey:data.projectId+activityList[id].activityId
    }

    if (!fileGrid) {
	    fileGrid = PFComponent.makeExtJSGrid({
	        fields: [
	            'relationObjectTypeCode', 'relationObjectKey', 'sequenceNumber', 'localFileName', 'fileSize', 'fileUrl', 'process', 'addSeq'
	        ],
	        gridConfig: {
	
	            renderTo: '.attachment-list-grid',
	            columns: [
	                {
	                    text: bxMsg('fileName'),
	                    flex: 3,
	                    dataIndex: 'localFileName',
	                    sortable: false,
	                },
	                {
	                    text: bxMsg('fileSize'),
	                    flex: 1,
	                    dataIndex: 'fileSize',
	                    sortable: false,
	                    style: 'text-align:right',
	                    renderer: function (value, p, record) {
	                        return (+Math.floor(value / 1024)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'Kbyte';
	                    }
	                },
	                {   // delete row
	                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
	                    items: [{
	                        icon: '/images/x-delete-16.png',
	                        handler: function (grid, rowIndex, colIndex, item, e, record) {
	                            if (record.data.process != 'C') {
	                                record.data.process = 'D';
	                                deleteFileList.push(record.data);
	                            } else if (record.data.process === 'C') {
	                            	// for IE
	                                //fileUploadList.delete('new-' + record.data.addSeq);
	                            	delete fileUploadList['new-' + record.data.addSeq];
	                            }
	                            popupModifyFlag
	                            record.destroy();
	                        }
	                    }]
	                }
	            ],
	            listeners: {
	                scope: this,
	                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
	                    //새로추가한(아직 업로드하지 않은)파일이면 다운로드
	                    if (record.data.process !== 'C') {
	                        var fileUrl = record.data.fileUrl;
	                        var localFileName = record.data.localFileName;
	
	                        var fileName = fileUrl.substring(fileUrl.substring(0, fileUrl.lastIndexOf('/') - 1).lastIndexOf('/') + 1, fileUrl.length);
	                        PFUtil.downLaodFile('.file-download-iframe', fileName, 'atch.file.path', localFileName);
	                    }
	                }
	            }
	        }
	    });
    }

    PFRequest.get('/commonFile/getCommonFileMasterList.json', requsetParam, {
        success: function (responseData) {
            fileGrid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonService',
            operation: 'queryCommonFileMasterList'
        }
    });
}


// 개발과제정보탭-상품정보 그리드
function renderProductGrid(data){
    const productInfoTpl = PFUtil.getTemplate('planner/project','productInfoTpl');
    $('#product-panel').html(productInfoTpl());

    renderTargetObjectGrid(data);

}

// 상품정보 > 그리드
function renderTargetObjectGrid(data) {
    $('.target-obj-grid').empty().elementReady(function() {
    	relObjectGrid = PFComponent.makeExtJSGrid({
            fields: [
                "targetObjectCode","targetObjectName","targetObjectType","firstCatalogId","secondCatalogId","fullPath", "pdInfoDscd", "typeCode"
            ],
            gridConfig: {
                renderTo: '.target-obj-grid',
                columns: [
                    {text: bxMsg('PAS0102String10'), flex: 1, dataIndex: 'targetObjectType',
                    	renderer: function(value, p, record) {
                    		switch (value){
                    		case '03': // 상품템플릿
                    			if(record.data.pdInfoDscd == '01'){
                                    return codeMapObj.pdInfoChngSearchDscd['03'] || value;
                    			}else if(record.data.pdInfoDscd == '02'){
                                    return codeMapObj.pdInfoChngSearchDscd['04'] || value;
                    			}else if(record.data.pdInfoDscd == '03'){
                                    return codeMapObj.pdInfoChngSearchDscd['05'] || value;
                    			}
                    			break;
                    		case '04': // 상품
                    			if(record.data.pdInfoDscd == '01'){
                                    return codeMapObj.PdInfoDscd['01'] || value;
                    			}else if(record.data.pdInfoDscd == '02'){
                                    return codeMapObj.PdInfoDscd['02'] || value;
                    			}else if(record.data.pdInfoDscd == '03'){
                                    return codeMapObj.PdInfoDscd['03'] || value;
                    			}
                    			break;

	                    	case '09' :
	                        case '18' :	// 분류체계
	                        	if(record.data.typeCode == '1'){				// 분류체계
	                        		return codeMapObj.ClassificationStructureUsageDistinctionCode[record.data.typeCode] || value;
	                        	}else if(record.data.typeCode == '2'){			// 상품/서비스그룹
	                        		if(record.data.pdInfoDscd == '01'){
	                        			return codeMapObj.pdInfoChngSearchDscd['17'];	// 상품그룹
	                        		}else if(record.data.pdInfoDscd == '02'){
	                        			return codeMapObj.pdInfoChngSearchDscd['18'];	// 서비스그룹
	                        		}else if(record.data.pdInfoDscd == '03'){
	                        			return codeMapObj.pdInfoChngSearchDscd['19'];	// 포인트그룹
	                        		}
	                        	}else if(record.data.typeCode == '3'){			// N차원
	                        		return codeMapObj.NtierUsageDscd['01'];			// 상품추천규칙
	                        	}else if(record.data.typeCode == '4'){
	                        		return codeMapObj.ClassificationStructureUsageDistinctionCode[record.data.typeCode] || value;
	                        	}
	                        	break;

                    		default:
                    			return codeMapObj.TargetObjectTypeCode[value] || value;
                    			break;
                    		}
                        }
                    },
                    {text: bxMsg('code'), flex: 1.5, dataIndex: 'targetObjectCode'},
                    {text: bxMsg('name'), flex: 1.5, dataIndex: 'targetObjectName'},
                ],
                listeners: {
                    scope: this,
                    viewready: function(_this, eOpts){
                      PFRequest.get('/project/queryProjectForList.json',data,{
	                      success: function(responseData) {
	                      	if(responseData[0].projectRelationInfoListVO.length>0){
	                      		relObjectGrid.setData(responseData[0].projectRelationInfoListVO);
	                      	}
	                      },
	                      bxmHeader: {
	                          application: 'PF_Factory',
	                          service: 'ProjectMasterService',
	                          operation: 'queryListProject'
	                      }
	                  });
                    },
                    itemdblclick : function(_this, record){

                        switch (record.data.targetObjectType){
                            case '01' : // 조건템플릿
                                parent.$('.pf-hidden .hash').text('conditionCode=' + record.data.targetObjectCode);
                                parent.$('.designer ul a.condition_template').click();			// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                break;

                            case '02' :	// 조건군템플릿
                                parent.$('.pf-hidden .hash').text('conditionGroupTemplateCode=' + record.data.targetObjectCode);
                                parent.$('.designer ul a.condition_group_template').click();	// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                break;

                            case '03' :	// 상품템플릿
	                            parent.$('.pf-hidden .hash').text('code=' + record.data.targetObjectCode + '&id=' + record.data.fullPath + '&tntInstId=' + getLoginTntInstId());

	                            if(record.data.pdInfoDscd == '01'){
	                                parent.$('.designer ul a.product_template').click();		// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
	                            }else if(record.data.pdInfoDscd == '02'){
	                                parent.$('.designer ul a.service_template').click();		// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
	                            }else if(record.data.pdInfoDscd == '03'){
	                                parent.$('.designer ul a.point_template').click();			// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
	                            }
                                break;

                            case '04' :	// 상품/서비스/포인트
                                parent.$('.pf-hidden .hash').text('code=' + record.data.targetObjectCode + '&path=' + record.data.fullPath + '&tntInstId=' + getLoginTntInstId());

                                if(record.data.pdInfoDscd == '01'){
                                    parent.$('.configurator ul a.product').click();				// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                }else if(record.data.pdInfoDscd == '02'){
                                	parent.$('.configurator ul a.service').click();				// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                }else if(record.data.pdInfoDscd == '03'){
                                    parent.$('.configurator ul a.point').click();				// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                }
                                break;

                            case '06' :
                            case '07' :
                                //renderProductTypelInfoPopup(record.data);
                            	parent.$('.pf-hidden .hash').text('id=' + record.data.fullPath + '&tntInstId=' + getLoginTntInstId());
                                parent.$('.designer ul a.product_template').click();			// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                break;

                            case '09' :
                            case '18' :	// 분류체계
                                //renderClassificationStructureInfoPopup(record.data);
                            	var arrCode = record.data.targetObjectCode.split('@');
                            	if(arrCode.length<2){
                            		parent.$('.pf-hidden .hash').text('classificationStructureCode=' + arrCode[0]);
                            	}else{
                            		parent.$('.pf-hidden .hash').text('classificationStructureDistinctionCode=' + arrCode[0] + '&classificationCode='+ arrCode[1]);
                            	}

                            	// 분류체계
                            	if(record.data.typeCode == '1'){
                            		// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                    parent.$('.configurator ul a.classification').click();

                            	}
                            	// 그룹
                            	else if(record.data.typeCode == '2'){
                            		// 상품그룹
                            		if(record.data.pdInfoDscd == '01'){
                            			// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                        parent.$('.configurator ul a.product_group').click();
                            		}
                            		// 서비스그룹
                            		else if(record.data.pdInfoDscd == '02'){
                            			// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                        parent.$('.configurator ul a.service_group').click();
                            		}
                            	}
                            	// N차원
                            	else if(record.data.typeCode == '3'){
                            		// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                    parent.$('.marketing ul a.marketing_priority').click();
                            	}
                            	// 컨텐츠그룹
//                            	else if(record.data.typeCode == '4'){
//                            		// OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
//                                    parent.$('.configurator ul a.contents_group').click();
//                            	}
                                break;

                            case '10' :
                                //renderMerchantGroupInfoPopup(record.data);
                            	parent.$('.pf-hidden .hash').text('merchantGroupCode=' + record.data.targetObjectCode);
                                // OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                parent.$('.configurator ul a.merchant_group').click();
                                break;

                            case '12' :
                                //renderCommonConditionInfoPopup(record.data);
                            	var arrFullPath = record.data.fullPath.split('.');
                            	var arrCode = record.data.targetObjectCode.split('@');
                            	parent.$('.pf-hidden .hash').text('cndGroupTemplateTypeCode=' + arrFullPath[0] + '&cndGroupTemplateCode=' + arrFullPath[1] + '&cndCode=' + arrCode[3]
                            	 + '&cndTypeCode=' + arrFullPath[2] + '&cndDetailTypeCode=' + arrFullPath[3]);
                                // OHS 20171030 - 메뉴체계 변경에 따른 class name 수정
                                parent.$('.configurator ul a.common').click();
                                break;

                            case '13' :	// 금리체계
                            	parent.$('.pf-hidden .hash').text('code='+record.data.targetObjectCode);
                            	parent.$('.configurator ul a.interest_rate_structure').click();
                            	break;

                            case '14' :	// 계산단위템플릿
                            	var arrFullPath = record.data.fullPath.split('.');
                            	parent.$('.pf-hidden .hash').text('calculationUnitDistinctionCode='+arrFullPath[0] + '&calculationUnitConditionCode='+arrFullPath[1]);
                            	parent.$('.designer ul a.calculation_unit_template').click();
                            	break;

                            case '15' :	// 계산산식
                            	var arrFullPath = record.data.fullPath.split('.');
                            	parent.$('.pf-hidden .hash').text('formulaTypeCode='+arrFullPath[0] + '&formulaId='+arrFullPath[1]);
                            	parent.$('.configurator ul a.calculation_formula').click();
                            	break;

                            case '16' :	// 계산구성요소템플릿
                            	var arrFullPath = record.data.fullPath.split('.');
                            	parent.$('.pf-hidden .hash').text('valueComputationMethodDistinctionCode='+arrFullPath[0] + '&composeElementConditionCode='+arrFullPath[1]);
                            	parent.$('.designer ul a.calculation_compose_template').click();
                            	break;

                            case '17' :	// 계산규칙
                            	var arrFullPath = record.data.fullPath.split('.');
                            	parent.$('.pf-hidden .hash').text('transactionId='+arrFullPath[0] + '&calculationUnitId='+arrFullPath[1]);
                            	parent.$('.configurator ul a.calculator').click();
                            	break;
                        }
                    }
                }
            }
        });
    });
}