/******************************************************************************************************************
* 아이디어 관리 팝업
******************************************************************************************************************/
var popupModifyFlag = false;
function renderIdeaMasterPopup(data){
	fileGrid = undefined;
	popupModifyFlag = false;

    const ideaPopupDetailFormTpl = getTemplate('ideaPopupDetailFormTpl');

    var buttons = [
	    // 저장 버튼
	    {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){

	        var nameLengthCheck = PFValidation.finalLengthCheck('.idea-name',100,$('.idea-name').val(),'01',bxMsg('PAS0102String3'));
	        if(!nameLengthCheck) return;

	        var contentsLengthCheck = PFValidation.finalLengthCheck('.idea-content', 500, $('.idea-content').textContent,'01',bxMsg('PAS0102String4'));
	        if(!contentsLengthCheck) return;

	        var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');
	        if(!mandatoryCheck) return;

	        var form = PFComponent.makeYGForm($('.idea-info-table'));
	        var that = this;
	        var requestData = form.getData();
	        requestData.fileId = '';
	        requestData.fileName = '';

	        $(document.body).addClass('waiting');
	        $(document.body).find('.tab-content').find('iframe').contents().find('body').addClass('waiting');

	        fileUploadList.append('relationObjectTypeCode', 'IDEA');
            fileUploadList.append('tntInstId', getLoginTntInstId());
            fileUploadList.append('deleteList', JSON.stringify(deleteFileList));
            
          // file size check
          const totalSize = fileGrid.getAllData().reduce((total, file) => {
            return total + (file.process === 'C' ? file.fileSize : 0);
          }, 0);
          if (totalSize > 31457280) { // 30MB 제한
            PFComponent.showMessage(bxMsg('exceedUploadMaxSizeLimit'), 'error');
            return;
          }

	        if(data && data.work == "CREATE") {         // 신규 시
	            PFRequest.post('/idea/createIdeaMaster.json',requestData, {
	                success: function (response) {

	                	$('.pf-pi-idea-master-form .idea-id').val(response.ideaId);
	                    $('.delete-btn').show();
	                    data.work = "UPDATE";

	                    fileUploadList.append('relationObjectKey', response.ideaId);

	                    $.ajax({
	                        url: "/pf_common/jsp/attachmentupload.jsp",
	                        type: "POST",
	                        data: fileUploadList,
	                        // cache: false,
	                        processData: false,
	                        contentType: false,
	                        success: function(responseData, textStatus, jqXHR) {
	                          if (responseData.error) {
	                            PFComponent.showMessage(bxMsg('exceedUploadMaxSizeLimit'), 'error');
	                            return;
	                          }

	                        	var form = PFComponent.makeYGForm($('.idea-info-table'));
                                var formData = form.getData();

                                var attachmentInfo = {};
                                attachmentInfo.relationObjectKey = formData.ideaId;
                                attachmentInfo.relationObjectTypeCode = 'IDEA';
                                attachmentInfo.tntInstId = getLoginTntInstId();
                                attachmentInfo.commonFileDetailVOList = responseData.concat(deleteFileList);

                                PFRequest.post('/common/attachmentUpload.json',attachmentInfo, {
                                    success: function () {
			                            $(document.body).removeClass('waiting');
			                            $(document.body).find('.tab-content').find('iframe').contents().find('body').removeClass('waiting');

			                            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
			                            searchIdeaData();
                                    },
	                                    bxmHeader: {
	                                    application: 'PF_Factory',
	                                    service: 'CommonService',
	                                    operation: 'saveCommonFileMaster'
	                                }
	                            });

	                        }, error: function(jqXHR, textStatus, errorThrown) {}
	                    });
	                },
	                bxmHeader: {
	                    application: 'PF_Factory',
	                    service: 'IdeaMasterService',
	                    operation: 'createIdeaMaster'
	                }
	            });
	        }else if (data && data.work == "UPDATE") {  // 업데이트 시

	        	if(!popupModifyFlag){
            		// 변경된 정보가 없습니다.
            		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
            		return;
            	}

	        	PFRequest.post('/idea/updateIdeaMaster.json',requestData, {
	                success: function (){

	                    fileUploadList.append('relationObjectKey', requestData.ideaId);

	                    $.ajax({
	                        url: "/pf_common/jsp/attachmentupload.jsp",
	                        type: "POST",
	                        data: fileUploadList,
	                        // cache: false,
	                        processData: false,
	                        contentType: false,
	                        success: function(responseData) {
                              if (responseData.error) {
                                PFComponent.showMessage(bxMsg('exceedUploadMaxSizeLimit'), 'error');
                                return;
                              }

	                            var form = PFComponent.makeYGForm($('.idea-info-table'));
	                            var formData = form.getData();

	                            var attachmentInfo = {};
	                            attachmentInfo.relationObjectKey = formData.ideaId;
	                            attachmentInfo.relationObjectTypeCode = 'IDEA';
	                            attachmentInfo.tntInstId = getLoginTntInstId();
	                            attachmentInfo.commonFileDetailVOList = responseData.concat(deleteFileList);

	                            PFRequest.post('/common/attachmentUpload.json',attachmentInfo, {
	                                success: function () {

	                                    $(document.body).removeClass('waiting');
	                                    $(document.body).find('.tab-content').find('iframe').contents().find('body').removeClass('waiting');

	                                    PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
	                                    searchIdeaData();
	                                },
	                                    bxmHeader: {
	                                    application: 'PF_Factory',
	                                    service: 'CommonService',
	                                    operation: 'saveCommonFileMaster'
	                                }
	                            });
	                        }, error: function(jqXHR, textStatus, errorThrown) {}
	                    });

	                },
	                bxmHeader: {
	                    application: 'PF_Factory',
	                    service: 'IdeaMasterService',
	                    operation: 'updateIdeaMaster'
	                }
	            });
	        }
	    }}
	];



    buttons.push(
		// 삭제 버튼
        {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary delete-btn write-btn',handler:function(){
            var form = PFComponent.makeYGForm($('.idea-info-table'));
            var that = this;
            PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
                PFRequest.post('/idea/deleteIdeaMaster.json',form.getData(),{
                    success: function(){
                        PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                        searchIdeaData();
                        that.close();
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'IdeaMasterService',
                        operation: 'deleteIdeaMaster'
                    }
                });
            }, function() {
                return;
            });
        }}
    );
    buttons.push(
		// 닫기 버튼
        {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary',handler:function(){
            this.close();
        }}
    );

    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('PAS0101Title'),           // 아이디어관리
        contents: ideaPopupDetailFormTpl(data),
        width:700,
        height:420,
        modifyFlag : 'popup',
        buttons: buttons,
        contentsEvent: {

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
            }
        },
        listeners: {
        	afterSyncUI: function() {

                // 신규 요청 일 때
                if(data && data.work == "CREATE") {
                    $('.regist-user-name').val(getLoginUserId());                         // 등록사원ID
                    //$('.regist-date').val(commonConfig.currentXDate.toString('yyyy-MM-dd HH:mm:ss'));             // 등록일자
                    $('.delete-btn').hide();
                }

                /**
                 * 첨부파일 그리드 조회
                 */

                var requsetParam = {
                    tntInstId:getLoginTntInstId(),
                    relationObjectTypeCode:'IDEA',
                    relationObjectKey:data.ideaId
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
	                                        record.destroy();
	                                        popupModifyFlag = true;
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
                    	// 스크립트오류방지
                    	if (responseData && responseData.length > 0) {
                    		fileGrid.setData(responseData);
                    	}
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonService',
                        operation: 'queryCommonFileMasterList'
                    }
                });
            }
        }
    });
}