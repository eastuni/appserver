/**
 * @fileOverview - Common popups related to condition template. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select condition template.
 * @param {Object} config
 * @param {boolean} [config.targetCondition=['01', '02', '03', '04']] Available condition types.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('DTP0203Title')] Title of popup.
 * @param {PFPopup~conditionTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectConditionTemplate = function ({
  targetCondition = ['01', '02', '03', '04'],
  multi = false,
  readOnly = false,
  title = bxMsg('DTP0203Title'), // 조건선택
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('condition_template');
  const target = new Set();
  targetCondition.forEach((type) => {
    if (type === '01' || type === 'LIST') target.add('01');
    else if (type === '02' || type === 'RANGE') target.add('02');
    else if (type === '03' || type === 'INTEREST') target.add('03');
    else if (type === '04' || type === 'FEE') target.add('04');
  });

  let grid;

  function search(requestParam = {}) {
    PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
      success(responseData = []) {
        const resultList = 'conditionTypeCode' in requestParam
          ? responseData : responseData.filter(v => target.has(v.type));

        $('.cnd-tpl-popup .popup-cnd-grid').empty();

        grid = PFComponent.makeExtJSGrid({
          fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
            name: 'typeNm',
            convert(newValue, record) {
              const typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
              return typeNm;
            },
          }],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.popup-cnd-grid',
            columns: [
              { text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code' },
              { text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm' },
              { text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name' },
              {
                text: bxMsg('DPS0101String6'),
                width: 60,
                dataIndex: 'isActive',
                renderer(value) {
                  return bxMsg(value === 'Y' ? 'active' : 'inactive');
                },
              },
              { text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content' },
            ],
          },
        });
        grid.setData(resultList);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndTemplateService',
        operation: 'queryListCndTemplate',
      },
    });
  }
  PFComponent.makePopup({
    title,
    width: 500,
    height: 330,
    contents: popupTpl(),
    modifyFlag : 'readonly',
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
        const selected = grid.getSelectedItem();
        if (multi) { // return multiple results
          callback(selected);
        } else if (selected.length > 0) { // return one result
          callback(selected[0]);
        }
        this.close();
      },
    }],
    contentsEvent: {
      // 검색버튼 클릭 시
      'click .cnd-tpl-search': function () {
        const requestParam = {
          conditionName: $('.cnd-tpl-popup .cnd-name-search').val(), // 조건명
          conditionTypeCode: $('.cnd-tpl-popup .cnd-type-select').val(), // 조건유형 콤보
        };
        search(requestParam);
      },
    },
    listeners: {
      afterRenderUI() {
        const options = [];

        const $defaultOption = $('<option>');
        $defaultOption.text(bxMsg('Z_All'));
        $defaultOption.val('');

        options.push($defaultOption);

        $.each(codeMapObj.ProductConditionTypeCode, (key, value) => {
          if (target.has(key)) {
            const $option = $('<option>');
            $option.val(key);
            $option.text(value);
            options.push($option);
          }
        });

        $('.cnd-tpl-popup .cnd-type-select').html(options);
        search();
      },
    },
  });
};


/**
 * Select condition template with popup. Left-right grid.
 * @param {Object} config
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {PFPopup~conditionTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectConditionTemplate2 = function ({
  readOnly = false,
  cndList = [],
  cndGrpType = '01'
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('condition_template', 'tpl2');
  let grid;
  let chooseCndGrid;
  let chooseCndList = [];

  PFComponent.makePopup({
    title: bxMsg('DTP0203Title'),
    width: 676,
    height: 330,
    contents: popupTpl(),
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
    	  var selectedCnd = chooseCndGrid.getAllData();
    	  for(var i=0 ; i <selectedCnd.length ; i++){
          	for(var j=0 ; j<cndList.length ; j++){
          		if(selectedCnd[i].code == cndList[j].code){
          			selectedCnd.splice(i, 1);
          			i--;
          			break;
          		}
          	}
          }
    	  callback(selectedCnd);
    	  this.close();
      },
    }],
    contentsEvent: {
      'click .cnd-tpl-search': function () {
        let requestParam = {
          conditionName: $('.cnd-2-grd-tpl-popup .cnd-name-search').val(),
          activeYn: 'Y',
        };

        const comboVal = $('.cnd-2-grd-tpl-popup .cnd-type-select').val();

        if (comboVal) {
          requestParam.conditionTypeCode = comboVal;
        }

        if ($('.cnd-tpl-type-select').val() === '03') {
          requestParam = {
            conditionTypeCode: '04',
            conditionDetailTypeCode: '04.10',
            conditionName: $('.cnd-2-grd-tpl-popup .cnd-name-search').val(),
          };
        }

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success(responseData) {

        	chooseCndList = chooseCndGrid.getAllData();
        	if(!responseData){
        		responseData = [];
        	}

          	for(var i=0 ; i <responseData.length ; i++){
            	for(var j=0 ; j<chooseCndList.length ; j++){
            		if(responseData[i].code == chooseCndList[j].code){
            			responseData.splice(i, 1);
            			i--;
            			break;
            		}
            	}
            }

            grid.setData(responseData);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate',
          },
        });
      },
      'click .search-list-add-btn': function () {

    	  var records = grid.getSelectedRecords();	// chooseCndGrid.addData(grid.getSelectedItem());
          chooseCndGrid.addData(records);
          records.forEach(function(el){
              grid.store.remove(el);
          })
          //grid.grid.getView().refresh();

      },
    },
    listeners: {
      afterRenderUI() {
        let requestParam = {};

        const options = [];

        // 01.상품조건, 05.구성조건
        if (cndGrpType === '01' || cndGrpType === '05') {
          const $defaultOption = $('<option>');
          $defaultOption.text(bxMsg('Z_All'));
          $defaultOption.val('');

          options.push($defaultOption);

          requestParam = { activeYn: 'Y' };
        // 02 우대금리 : 조건템플릿 타입 03
        } else if (cndGrpType === '02') {
          requestParam = { conditionTypeCode: '03' };
        // 03 공통수수료 : 조건템플릿 타입 04
        } else if (cndGrpType === '03') {
          requestParam = { conditionTypeCode: '04', conditionDetailTypeCode: '04.10' };
        }

        $.each(codeMapObj.ProductConditionTypeCode, (key, value) => {
          switch (cndGrpType) {
            case '02': // 우대금리
              if (key !== '03') return;
              break;
            case '03': // 공통수수료
              if (key !== '04') return;
              break;
            case '07': // 공통조건
              if (key === '04') return;
              break;
            default:
              break;
          }

          const $option = $('<option>');
          $option.val(key);
          $option.text(value);

          options.push($option);
        });

        $('.cnd-2-grd-tpl-popup .cnd-type-select').html(options);

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                name: 'typeNm',
                convert(newValue, record) {
                  const typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                },
              }],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(true, readOnly),
                renderTo: '.popup-cnd-grid',
                columns: [
                  { text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code' },
                  { text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm' },
                  { text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name' },
                  {
                    text: bxMsg('DPS0101String6'),
                    width: 60,
                    dataIndex: 'isActive',
                    renderer(value) {
                      return bxMsg(value === 'Y' ? 'active' : 'inactive');
                    },
                  },
                  { text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content' },
                ],
              },
            });

            if(responseData && cndList){
	        	for(var i=0 ; i <responseData.length ; i++){
	            	for(var j=0 ; j<cndList.length ; j++){
	            		if(responseData[i].code == cndList[j].code){
	            			chooseCndList.push(responseData[i]);
	            			responseData.splice(i, 1);
	            			i--;
	            			break;
	            		}
	            	}
	            }
	          }

            if(responseData) grid.setData(responseData);

            chooseCndGrid = PFComponent.makeExtJSGrid({
                fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId',
      	          {
              	  	name: 'typeNm',
      	            convert(newValue, record){
              	  		const typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
              	  		return typeNm;
      	            }
      	          }
                ],
                gridConfig: {
                  renderTo: '.choose-cnd-grid',
                  columns: [
                    { text: bxMsg('DTP0203String3'), flex: 1, dataIndex: 'code' },
                    {
                      xtype: 'actioncolumn',
                      width: 35,
                      align: 'center',
                      items: [{
                        icon: '/images/x-delete-16.png',
                        handler(grid_, rowIndex, colIndex, item, e, record) {

                        	var flag = true;
                        	cndList.forEach(function(el){
                        		if(el.code == record.data.code){
                        			flag = false;
                        			PFComponent.showMessage(bxMsg('canDeleteNewCnd'), 'warning');
                        			return;
                        		}
                        	})

                        	if(flag){
	                        	record.destroy();
		                        grid.addData(record);
                        	}
                        }
                      }]
                    }
                  ]
                }
              });
            if(chooseCndList) chooseCndGrid.setData(chooseCndList);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate',
          },
        });

      },
    },
  });
};


/**
 * Condition template
 * @typedef {Object} ConditionTemplate
 * @property {String} type Condition type.
 * @property {String} typeNm Condition type name.
 * @property {String} currentCatalogId Condition detail type.
 * @property {String} code Condition code.
 * @property {String} name Condition template name.
 * @property {String} content Descryption of condition template.
 * @property {String} isActive 'Y' for active, 'N' for inactive.
 */


/**
 * @callback PFPopup~conditionTemplateCallback
 * @param {ConditionTemplate|ConditionTemplate[]} result Selected result(s) of condition template,
 *     according to config.multi option.
 */
