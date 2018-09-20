const editPopupTpl = getTemplate('editPopupTpl');
const previewPopupTpl = getTemplate('previewPopupTpl');

function renderContentsEditPopup(data) {
  let $editor$;
  const popup = PFComponent.makePopup({
    title: bxMsg('contentsInfo'), // 콘텐츠정보
    width: 1000,
    height: 700,
    contents: editPopupTpl(),
    modifyFlag : 'popup',
    buttons: [
      // 미리보기 버튼
      {
        text: bxMsg('preview'),
        elCls: 'button button-primary',
        handler() {
          const contents = $editor$('#summernote').summernote('code');
          renderContentPreviewPopup(contents);
        },
      },
      // 저장 버튼
      {
        text: bxMsg('ButtonBottomString1'),
        elCls: 'button button-primary write-btn',
        handler() {
          const _this = this;

          if (!isHaveProject()) {
            haveNotTask();
            return;
          }

          const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
          if (isNotMyTask(projectId)) {
            return;
          }

          const contents = $editor$('#summernote').summernote('code');
          const requestParam = {};


          requestParam.thtInstId = loginTntInstId;
          requestParam.pdInfoDscd = pdInfoDscd_Product;
          requestParam.cntnt = contents;
          requestParam.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
          requestParam.classificationCode = classForEvent.classificationCode;
          requestParam.pdInfoChnlDscd = $('.contents-edit-popup .contents-channel-dscd').val();
          requestParam.pdInfoCntntDscd = $('.contents-edit-popup .contents-type').val();
          requestParam.applyStartDate = $('.contents-edit-popup .start-date').val();
          requestParam.applyEndDate = $('.contents-edit-popup .end-date').val();
          requestParam.cntntTitle = $('.contents-edit-popup .cntntTitle').val();
          requestParam.projectId = projectId;
          requestParam.process = data.process;
          PFRequest.post('/contents/savePdInfoCntnt.json', requestParam, {
            success(responseData) {
              searchClassificationConditionList();
              PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
              popupModifyFlag = false;
              $editor$('#summernote').summernote('destroy');
              _this.close();
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'ProductInfoContentsService',
              operation: 'savePdInfoCntnt',
            },
          });
        },
      },
      // 삭제 버튼
      {
        text: bxMsg('delete'),
        elCls: 'button button-primary',
        handler() {
          if (!isHaveProject()) {
            haveNotTask();
            return;
          }

          const projectId = getSelectedProjectId();
          if (isNotMyTask(projectId)) {
            return;
          }

          const requestParam = {};
          requestParam.projectId = projectId;
          requestParam.tntInstId = loginTntInstId;
          requestParam.pdInfoDscd = pdInfoDscd_Product;
          requestParam.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
          requestParam.classificationCode = classForEvent.classificationCode;
          requestParam.pdInfoChnlDscd = $('.contents-edit-popup .contents-channel-dscd').val();
          requestParam.pdInfoCntntDscd = $('.contents-edit-popup .contents-type').val();
          requestParam.applyStartDate = classForEvent.applyStartDate;

          PFRequest.post('/contents/deletePdInfoCntnt.json', requestParam, {
            success(responseData) {
              if (responseData) {
                searchClassificationConditionList();
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                popupModifyFlag = false;
              }
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'ProductInfoContentsService',
              operation: 'deletePdInfoCntnt',
            },
          });
          $editor$('#summernote').summernote('destroy');
          this.close();
        },
      },
      // 취소 버튼
      {
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary',
        handler() {
          $editor$('#summernote').summernote('destroy');
          this.close();
        },
      }],
    listeners: {
      afterRenderUI() {
        $('.contents-editor').on('load', () => {
          $editor$ = $('.contents-editor').get(0).contentWindow.$;

          $editor$('#summernote').summernote({
            height: 460, // set editor height
            minHeight: 460, // set minimum height of editor
            maxHeight: 460, // set maximum height of editor
            focus: false, // set focus to editable area after initializing summernote
            lang: 'ko-KR', // default: 'en-US'
            toolbar: [
              // [groupName, [list of button]]
              ['style', ['style']],
              ['font', ['bold', 'italic', 'underline', 'clear']],
              ['fontsize', ['fontsize']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['table', ['table']],
              ['source', ['source']],
              ['height', ['height']],
              ['codeview', ['codeview']],
            ],
          });

          const d = data || {};
          if (d.cntnt) {
            let cntnt = data.cntnt.replace(/&lt;/g, '<');
            cntnt = cntnt.replace(/&gt;/g, '>');
            cntnt = cntnt.replace(/&quot;/g, '"');
            $editor$('#summernote').summernote('code', cntnt);
          }

          $('.contents-edit-popup .cntntTitle').val(data.cntntTitle || '');
          $('.contents-edit-popup .start-date').val(data.applyStartDate || `${PFUtil.getToday()} 00:00:00`);
          $('.contents-edit-popup .end-date').val(data.applyEndDate || `${PFUtil.getEndDate()} 23:59:59`);
          PFUtil.renderComboBox('CntntChnlDscd', $('.contents-edit-popup .contents-channel-dscd'), data.pdInfoChnlDscd || null); // 상품정보구분코드 콤보
          PFUtil.renderComboBox('CntntTypeDscd', $('.contents-edit-popup .contents-type'), data.pdInfoCntntDscd || null); // 상품정보구분코드 콤보

          //$('.contents-edit-popup').parent().parent().css('z-index', 1050);
        });
      },
    },
  });

  return popup;
}

function renderContentPreviewPopup(content) {
  function extractImage(content) {
    const img = [];
    let cnt = 0;
    match = /<img[^>]+>/g.exec(content);
    while (match !== null) {
      img[cnt] = match[0];
      content = content.replace(match[0], `\$img{${cnt}}`);
      cnt += 1;
      match = /<img[^>]+>/g.exec(content);
    }

    return [content, img];
  }

  function restoreImage(content, img) {
    const regex = /\$img\{(\d+)\}/g;
    match = regex.exec(content);
    while (match !== null) {
      content = content.replace(match[0], img[match[1]])
      match = regex.exec(content);
    }
    img = undefined;

    return content;
  }

  const popup = PFComponent.makePopup({
    title: bxMsg('preview'), // 콘텐츠 미리보기
    width: 1000,
    height: 700,
    contents: previewPopupTpl(),
    buttons: [
      // 취소 버튼
      {
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary',
        handler() {
          this.close();
        },
      }
    ],
    contentsEvent: {
      'change .base-date': (e) => {
        const [cntnt, img] = extractImage(content);
        PFRequest.get('/contents/previewPdInfoCntnt.json', {cntnt, applyStartDate: $('.base-date').val()}, {
          success(responseData) {
            const newCntnt = restoreImage(responseData.cntnt, img);
            const doc = $(".contents-body")[0].contentDocument;
            $(doc).find('.contents-preview').html(newCntnt);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ProductInfoContentsService',
            operation: 'previewPdInfoCntnt',
          },
        });
        $('.xdsoft_datetimepicker').hide();
      },
    },
    listeners: {
      afterRenderUI() {
        // datepicker
        $('.base-date').on('mousedown', function() {
          $(this).datetimepicker({
            format: 'Y-m-d H:i:s',
            timepicker: true,
            yearEnd: 9999,
            todayButton: true
          });
        }).val(`${PFUtil.getToday()} 00:00:00`);

        // 이미지는 따로 처리함
        const [cntnt, img] = extractImage(content);

        PFRequest.get('/contents/previewPdInfoCntnt.json', {cntnt}, {
          success(responseData) {
            // 이미지 처리
            const newCntnt = restoreImage(responseData.cntnt, img);

            const win = $(".contents-body").get(0).contentWindow;
            const doc = $(".contents-body").get(0).contentDocument;

            if (doc.readyState !== 'loading') {
              $(doc).find('.contents-preview').html(newCntnt);

            } else {
              doc.addEventListener('DOMContentLoaded', () => {
                console.log(win, newCntnt);
                $(doc).find('.contents-preview').html(newCntnt);
              });
            }

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ProductInfoContentsService',
            operation: 'previewPdInfoCntnt',
          },
        });
      },
    },
  });
}