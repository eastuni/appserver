define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-job-management/excel-upload-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .upload-btn': 'uploadFile',
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function() {
                this.$el.html(this.tpl());

                this.setDraggable();

                this.show();
            },

            uploadFile: function () {
                var that = this,
                    $fileTarget = that.$el.find('input.excel-upload-input'),
                    fileInfo,
                    filePath = $fileTarget.val(),
                    fileName = filePath.substring(filePath.lastIndexOf('\\') + 1),
                    fileNameExtension = fileName.substring(fileName.lastIndexOf('.') + 1);


                if (fileNameExtension == "xls" || fileNameExtension == "xlsx") {
                    commonUtil.uploadFile({
                        url: '/bxmAdmin/fileEndpoint/upload',
                        fileInput: $fileTarget.get(0),
                        afterUploadFn: function (response) {
                            fileInfo = response.split('|');

                            // if (!fileInfo || fileInfo[2] !== 'true') {
                            //     swal({
                            //         type: 'error', title: '', text: bxMsg('common.file-upload-fail'), timer: commonUtil.timer(), showConfirmButton: false
                            //     });
                            //     return;
                            // }
                            var requestParam = commonUtil.getBxmReqData('ScheduleInfoService', 'scheduleImportExcel', 'ExcelImportOMM',
                                {
                                    fileName: fileInfo[0],
                                    filePath: fileInfo[1]
                                });

                            // Ajax 요청
                            commonUtil.requestBxmAjax(requestParam, {
                                success: function(response) {
                                    switch (response.ResponseCode.code) {
                                        case 1200:
                                            swal({
                                                type: 'success', title: '', text: bxMsg('common.file-upload-success'), timer: commonUtil.timer(), showConfirmButton: false
                                            });

                                            that.trigger('file-uploaded');
                                            that.close();
                                            break;
                                        case 1201:
                                        case 1202:
                                            swal({
                                                type: 'error', title: '', text: bxMsg('common.file-upload-fail'), timer: commonUtil.timer(), showConfirmButton: false
                                            });
                                            break;
                                        default:
                                    }
                                }
                            });
                        }
                    });
                } else {
                    swal({
                        type: 'warning', title: '', text: bxMsg('common.no-excel-file'), timer: commonUtil.timer(), showConfirmButton: false
                    });
                }
            }
        });
    }
);
