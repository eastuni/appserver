/**
 * Created by yanggwi on 14. 11. 4..
 */
/**
 * Created by gim-yang-gwi on 2014. 6. 18..
 */
(function (global) {


    global.bxUtil = {
        convertGridDateFormat: function (val) {
            return (val) ? XDate(val).toString('yyyy-MM-dd') : '';
        },

        makeParamFromForm: function ($form, option) {

            var $formItems = $form.find('[data-form-param]'),
                param = {},
                option = option || {};

            $formItems.each(function (i, formItem) {
                var $formItem = $(formItem),
                    value = $formItem.val() || $formItem.attr('data-value');

                if (option.ignoreEmpty && !value) {
                    return;
                }

                if (!option.includeUndecked && $formItem.is('[type=checkbox]') && !$(formItem).is(':checked')) {
                    return;
                }

                if ($formItem.hasClass('calendar')) {
                    if (!value) {
                        value = null;
                    } else {
                        value = XDate(value).toString(option.dateFormat || 'yyyy-MM-dd HH:mm:ss');
                    }
                }

                param[$formItem.attr('data-form-param')] = value;
            });

            return (option.isStringfy) ? JSON.stringify(param) : param;
        },

        parseCSV: function (csv) {
            var items = csv.split('\n'),
                resultObj = {};

            items.forEach(function (item, i) {
                var itemSepa = item.split(',');
                resultObj[itemSepa[0].trim()] = itemSepa[1];
            });

            return resultObj;
        },

        parseMessageCSV: function (csv) {
            var items = csv.split('\n'),
                resultObj = {
                    namespace: '',
                    messages: {}
                };

            items.forEach(function (item, i) {
                var itemSepa = item.split(',');

                if (itemSepa[0] === 'namespace') {
                    resultObj.namespace = itemSepa[1].trim();
                } else {
                    var nameSpace = itemSepa[0].trim();
                    itemSepa.splice(0, 1);

                    var message = itemSepa.join(', ');

                    resultObj.messages[nameSpace] = message;
                    //resultObj.messages[itemSepa[0].trim()] = itemSepa[1];
                }
            });

            return resultObj;
        },

        /**
         * upload attachment file
         *
         * @param selector - selector for file input
         * @param instCd - insttituion code
         * @param fileKeepingTrmCd - file keeping term code(MN:월, HY:반년, YE:일년, PE:영구)
         * @param callBackAtchmntFile - callback method
         */
        uploadAtchmntFile: function (selector, instCd, fileKeepingTrmCd, callBackAtchmntFile, rowIndex) {

            if (fn_isEmpty(selector) || fn_isEmpty(instCd) || fn_isEmpty(fileKeepingTrmCd) || typeof callBackAtchmntFile != 'function') {
                console.log('selector:' + selector);
                console.log('instCd:' + instCd);
                console.log('fileKeepingTrmCd:' + fileKeepingTrmCd);
                return;
            }

            var atchmntFileRslt; // 물리 파일 저장 결과
            uploadFile(selector, instCd, fileKeepingTrmCd, callBackAtchmntFile);

            // save physical file
            function uploadFile(selector, instCd, fileKeepingTrmCd, callBackAtchmntFile) {

                var data = new FormData();
                $.each($(selector)[0].files, function (i, file) {
                    data.append('file-' + i, file);

                    if (file.size > 5 * 1024 * 1024) {
                        alert('file size too long :' + file.size + '\nMax size is 5MB');
                        return;
                    }
                });

                $.ajax({
                    url: baseUrl + '/serviceEndpoint/FileUpload.jsp',
                    type: "post",
                    dataType: "text",
                    data: data,
                    cache: false,
                    processData: false,
                    contentType: false,

                    // 파일 업로드 성공
                    success: function (data, textStatus, jqXHR) {
                        console.log('success:' + JSON.stringify(jqXHR));

                        // 첨부파일 결과 자료에서 body 부분 추출
                        var idx1 = jqXHR.responseText.indexOf('<body>');
                        var idx2 = jqXHR.responseText.indexOf('</body>');
                        var body = '';

                        if (idx1 >= 0 && idx2 >= 0) {
                            body = JSON.parse(jqXHR.responseText.substring(idx1 + 7, idx2));
                        } else {
                            console.log('body index error:' + idx1 + ' ' + idx2);
                            return;
                        }

                        if (body != null && body.resultOut != null && body.resultOut.resultList != null) {
                            atchmntFileRslt = body.resultOut.resultList;
                        } else {
                            console.log('attachment result error:' + body);
                            return;
                        }

                        // 첨부파일 정보 공통 영역에 저장
                        registerFile(instCd, fileKeepingTrmCd, callBackAtchmntFile, rowIndex);
                    },

                    // 파일 업로드 실패
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('error:' + textStatus + JSON.stringify(errorThrown) + JSON.stringify(jqXHR));
                    }
                });
            }

            // save file information
            function registerFile(instCd, fileKeepingTrmCd, callBackAtchmntFile, rowIndex) {
                var sParam = {};
                var fileList = [];

                sParam.instCd = instCd;
                sParam.atchmntFileId = '';
                sParam.fileKeepingTrmCd = fileKeepingTrmCd;
                sParam.delYn = 'N';

                for (var i = 0; i < atchmntFileRslt.length; i++) {
                    var row = {};
                    row.instCd = instCd;
                    row.atchmntFileId = '';
                    row.atchmntFileSeqNbr = '';
                    row.localFileNm = atchmntFileRslt[i].localFileNm;
                    row.srvrFileNm = atchmntFileRslt[i].srvrFileNm;
                    row.fileSrvrPath = atchmntFileRslt[i].fileSrvrPath;
                    row.fileUrl = atchmntFileRslt[i].fileUrl;
                    row.fileSize = atchmntFileRslt[i].fileSize;
                    row.fileExtnsn = atchmntFileRslt[i].fileExtnsn;
                    row.delYn = 'N';

                    fileList.push(row);
                }

                sParam.fileList = fileList;

                var linkData = {"header": fn_getHeader("PCM0068101"), "AtchmntFileMgmtSvcIn": sParam};

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            console.log("atchmntFileId:" + responseData.AtchmntFileMgmtSvcOut.atchmntFileId);
                            callBackAtchmntFile(responseData.AtchmntFileMgmtSvcOut, rowIndex);
                        } else {
                            callBackAtchmntFile();
                        }
                    }
                });
            }
        },

        /**
         * download attachment file
         *
         * @param url - file url
         * @param localFileNm - local file name to save
         */
        downloadAtchmntFile: function (url, localFileNm) {

            if (fn_isEmpty(url) || fn_isEmpty(localFileNm)) {
                console.log('url:' + url);
                console.log('localFileNm:' + localFileNm);
                return;
            }

            console.log("download file:" + url);
            var downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = localFileNm;
            downloadLink.click();
        },

        /**
         * get attachment file information
         *
         * @param instCd - institution code
         * @param atchmntFileId - attachment file id
         * @param callBackAtchmntFile - callback method
         */
        getAtchmntFile: function (instCd, atchmntFileId, callBackAtchmntFile) {

            if (fn_isEmpty(instCd) || fn_isEmpty(atchmntFileId) || typeof callBackAtchmntFile != 'function') {
                console.log('instCd:' + instCd);
                console.log('atchmntFileId:' + atchmntFileId);
                return;
            }

            var sParam = {};

            sParam.instCd = instCd;
            sParam.atchmntFileId = atchmntFileId;

            var linkData = {"header": fn_getHeader("PCM0068401"), "AtchmntFileMgmtSvcIn": sParam};

            // ajax호출
            bxProxy.post(sUrl, JSON.stringify(linkData), {
                enableLoading: true
                , success: function (responseData) {
                    if (fn_commonChekResult(responseData)) {
                        callBackAtchmntFile(responseData.AtchmntFileMgmtSvcOut);
                    } else {
                        callBackAtchmntFile();
                    }
                }
            });
        },

        /**
         * delete attachment file information
         *
         * @param instCd - institution code
         * @param atchmntFileId - attachment file id
         * @param callBackAtchmntFile - callback method
         */
        deleteAtchmntFile: function (instCd, atchmntFileId, callBackAtchmntFile) {

            if (fn_isEmpty(instCd) || fn_isEmpty(atchmntFileId) || typeof callBackAtchmntFile != 'function') {
                console.log('instCd:' + instCd);
                console.log('atchmntFileId:' + atchmntFileId);
                return;
            }

            var sParam = {};

            sParam.instCd = instCd;
            sParam.atchmntFileId = atchmntFileId;

            var linkData = {"header": fn_getHeader("PCM0068301"), "AtchmntFileMgmtSvcIn": sParam};

            // ajax호출
            bxProxy.post(sUrl, JSON.stringify(linkData), {
                enableLoading: true
                , success: function (responseData) {
                    if (fn_commonChekResult(responseData)) {
                        // file delete
                        deleteFile(responseData.AtchmntFileMgmtSvcOut.fileList);

                        callBackAtchmntFile(responseData.AtchmntFileMgmtSvcOut);
                    } else {
                        callBackAtchmntFile();
                    }
                }
            });

            // delete physical file
            function deleteFile(res) {

                var data = '';

                for (var i = 0; i < res.length; i++) {
                    if (i !== 0) {
                        data += '&';
                    }

                    data += 'srvrFileNm=' + res[i].fileSrvrPath + '/' + res[i].srvrFileNm;
                }

                $.ajax({
                    url: baseUrl + '/serviceEndpoint/FileUpload.jsp',
                    type: "get",
                    dataType: "text",
                    data: data,
                    cache: false,
                    processData: false,
                    contentType: false,

                    success: function (data, textStatus, jqXHR) {
                        console.log('success:' + JSON.stringify(jqXHR));
                    },

                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('error:' + textStatus + JSON.stringify(errorThrown) + JSON.stringify(jqXHR));
                    }
                });
            }
        },

        makePageKey: function (pageHandler, pageArg) {
            var pageKey;

            if (pageArg) {
                pageKey = pageHandler + ':' + pageArg;
            } else {
                pageKey = pageHandler;
            }

            return pageKey;
        }
        
        
        /**
        *
        * @param option ( url*, fileInput*(DOM), param, afterUploadFn)
        */
       , uploadFile: function(option) {
           var fileList = Array.prototype.slice.apply(option.fileInput.files),
               uploadIdx = 0;;

           uploadNext();

        // upload next file
           function uploadNext() {

               if (fileList.length) {
                   var nextFile = fileList.shift();
                   if (nextFile.size >= 10 * 1024 * 1024 * 1024) {     // 10GB
                       Ext.Msg.alert('Error', bxMsg('common.filesize-error-msg'));
                   } else {
                       upload(nextFile);
                       uploadIdx++;
                   }
               }
           }
           
           function upload(file) {
               // prepare XMLHttpRequest
               var xhr = new XMLHttpRequest(), formData;

               formData = new FormData();

               xhr.open('POST', option.url);
               formData.append('file', file);

               if(option.param) {
                   $.each(option.param, function(key, value) {
                       formData.append(key, value);
                   });
               }

               xhr.onload = function () { // 성공시
                   var responseData = JSON.parse(this.response);
                   
                   Ext.Msg.alert('Success', responseData.message);
                   
                   uploadNext();

                   $(option.fileInput).val('');
                   typeof option.afterUploadFn === 'function' && option.afterUploadFn(responseData);
               };

               xhr.onerror = function () {
               	var responseData = JSON.parse(this.response);
                   Ext.Msg.alert('Error', responseData.message);
               };

               xhr.send(formData);
               
               
           }
       }
       
    };

})(window);