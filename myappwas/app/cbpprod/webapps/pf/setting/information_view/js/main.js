/**
 * @author Choi Junhyeok
 * @version $$id: information-view.js, v 1.0 2017-08-09 $$
 */
const informationViewController = {

  /**
   * core interface
   */
  init() {
    this.initPageRoot();
    this.initTemplates();
    this.initEvents();
  },

  run() {
    this.init();
    setMainTapLeftPosition();
    this.renderMainPage();
  },


  /**
   * init
   */
  initPageRoot() {
    this.$root = $('.pf-info');
  },

  initTemplates() {
    this.templates = {};
    this.templates.informationViewTpl = PFUtil.getTemplate('setting/information_view', 'informationViewTpl');
  },

  bindEventListener() {
    this.onEvent = PFUtil.makeEventBinder(this.$root);
    PFComponent.toolTip(this.$root);
  },

  initEvents() {
    if (!('onEvent' in this)) { this.bindEventListener(); }
    const { onEvent } = this;

    onEvent('click', 'a', (e) => {
      e.preventDefault();
    });

    onEvent('click', '.reset-btn', () => {
      this.viewAttributeGrid.setStoreRootNode([]);
    });

    onEvent('click', '.search-btn', () => {
      this.viewAttributeGrid.setStoreRootNode([]);
      this.loadView((children) => {
        const cnd = new Set();
        const attr = new Set();
        (children || []).forEach((v) => {
          ('pdInfoDscd' in v ? attr : cnd).add(v.attribute);
        });

        // 필터 제거
        this.conditionGrid.store.removeFilter();
        this.attributeGrid.store.removeFilter();
        
        // 필터 재생성
        const cndName = $("[data-form-param='conditionName']").val();
        this.conditionGrid.store.filterBy((record) => {
          const keyword = `${record.get('code')} ${record.get('name')}`;
          record.set('selected', cnd.has(record.get('code')));
          return !record.get('selected') && keyword.toUpperCase().search(cndName.toUpperCase()) >= 0;
        });

        const attrName = $("[data-form-param='attributeName']").val();
        this.attributeGrid.store.filterBy((record) => {
          const keyword = `${record.get('tableName')}.${record.get('attributeName')}`;
          record.set('selected', attr.has(record.get('code')));
          return !record.get('selected') && keyword.toUpperCase().search(attrName.toUpperCase()) >= 0;
        });
      });
    });

    onEvent('click', '.save-information-view-btn', () => {
      this.createView();
    });

    onEvent('click', '.condition-select-btn', () => {
      this.addGridItem(this.conditionGrid.getSelectedItem());

      // 선택된 항목은 감춤.
      this.conditionGrid.getSelectedRecords().forEach((record) => {
        record.set('selected', true);
      });
      $('.search-box').trigger('input');
    });

    onEvent('click', '.attribute-select-btn', () => {
      this.addGridItem(this.attributeGrid.getSelectedItem());

      // 선택된 항목은 감춤.
      this.attributeGrid.getSelectedRecords().forEach((record) => {
        record.set('selected', true);
      });
      $('.search-box').trigger('input');
    });

    onEvent('input', '.condition-name', () => {
      const name = $("[data-form-param='conditionName']").val();
      if (this.conditionGrid) {
	      this.conditionGrid.store.filterBy((record) => {
	        const keyword = `${record.get('code')} ${record.get('name')}`;
	        return !record.get('selected') && keyword.toUpperCase().search(name.toUpperCase()) >= 0;
	      });
      }
    });

    onEvent('input', '.attribute-name', () => {
      const name = $("[data-form-param='attributeName']").val();
      if (this.attributeGrid) {
	      this.attributeGrid.store.filterBy((record) => {
	        const keyword = `${record.get('tableName')}.${record.get('attributeName')}`;
	        return !record.get('selected') && keyword.toUpperCase().search(name.toUpperCase()) >= 0;
	      });
      }
    });
  },

  renderMainPage() {
    this.$root.find('.pf-info-view').html(this.templates.informationViewTpl());
    this.renderViewAttributeGrid((addedList) => {
      const conditionList = addedList.filter(v => !v.leaf).map(v => v.attribute);
      const attributeList = addedList.filter(v => v.leaf).map(v => v.attribute);
      this.renderConditionGrid(conditionList);
      this.renderAttributeGrid(attributeList);
    });
  },

  renderConditionGrid(addedItems = []) {
    const checkboxmodel = Ext.create('Ext.selection.CheckboxModel', { mode: 'MULTI' });

    const grid = PFComponent.makeExtJSGrid({
      fields: ['code', 'name', 'type', 'conditionDetailTypeCode', 'selected'],
      gridConfig: {
        renderTo: '.condition-grid',
        selModel: checkboxmodel,
        columns: [
          {
            text: bxMsg('cndCd'), width: 70, dataIndex: 'code', align: 'center',
          },
          {
            text: bxMsg('cndNm'), flex: 1, dataIndex: 'name', align: 'center',
          },
        ],
      },
    });
    this.conditionGrid = grid;

    const duplicateSet = new Set(addedItems);
    this.queryConditionTemplateBaseForList({}, (responseData) => {
      grid.setData((responseData || []).map(v => Object.assign(v, { selected: duplicateSet.has(v.code) })));
      $('.search-box').trigger('input');
    });
  },

  renderAttributeGrid(addedItems = []) {
    const checkboxmodel = Ext.create('Ext.selection.CheckboxModel', { mode: 'MULTI' });

    const grid = PFComponent.makeExtJSGrid({
      fields: ['tableName', 'attributeName', 'type', 'selected'],
      gridConfig: {
        renderTo: '.attribute-grid',
        selModel: checkboxmodel,
        columns: [
          {
            text: bxMsg('tableName'), width: 70, dataIndex: 'tableName', align: 'center',
          },
          {
            text: bxMsg('attributeName'), flex: 1, dataIndex: 'attributeName', align: 'center',
          },
        ],
      },
    });
    this.attributeGrid = grid;

    const productAttributes = [
      {
        tableName: 'PD_PD_M',
        attributeName: 'PD_INFO_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'INDS_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'BIZ_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PD_TP_CD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PD_TMPLT_CD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PD_NM',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'SALE_START_DT',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'SALE_END_DT',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'STS_CHNG_DT',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PD_STS_CD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PD_TP_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PCKG_PD_YN',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'ALNC_CNTRCT_NBR',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'BNFT_BASE_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PRCSNG_POT_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'DMFR_SALES_DSCD',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'CMPGN_ID',
      }, {
        tableName: 'PD_PD_M',
        attributeName: 'PRVD_CND_EXIST_YN',
      },
    ];

    const duplicateSet = new Set(addedItems);
    productAttributes.forEach((v) => {
      grid.store.add(Object.assign(v, { selected: duplicateSet.has(v.attributeName) }));
    });
    $('.search-box').trigger('input');
  },

  renderViewAttributeGrid(callback = function () {}) {
    const ctr = this;
    this.$root.find('.view-attribute-grid').empty();
    const grid = PFComponent.makeExtTreeGrid({
      fields: ['attribute', 'cndCd', 'columnName', 'leaf'],
      gridConfig: {
        renderTo: '.view-attribute-grid',
        expanded: true,
        columns: [
          {
            xtype: 'treecolumn', text: bxMsg('attribute'), width: 200, dataIndex: 'attribute', style: 'text-align:center',
          },
          {
            text: bxMsg('columnName'),
            flex: 1,
            dataIndex: 'columnName',
            style: 'text-align:center',
            editor: {
              allowBlank: false,
            },
          },
          {
            xtype: 'actioncolumn',
            width: 35,
            align: 'center',
            items: [{
              icon: '/images/x-delete-16.png',
              handler(_grid, rowIndex, colIndex, item, e, record) {
                const root = grid.store.getRootNode();
                const parent = root.findChild('attribute', record.get('cndCd'));
                const target = (parent && parent.childNodes.length === 1) ? parent : record;
                const store = target.get('leaf') ? ctr.attributeGrid.store : ctr.conditionGrid.store;
                store.clearFilter(true);
                const origin = store.findRecord(target.get('leaf') ? 'attributeName' : 'code', target.get('attribute'));
                if (origin) {
                  origin.set('selected', false);
                  $('.search-box').trigger('input');
                }
                target.remove();
              },
            }],
          },
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            pluginId: 'treeGridCellEdit',
            clicksToEdit: 1,
            listeners: {
              beforeedit(e, editor) {
                if (!editor.record.data.leaf) {
                  return false;
                }
              },
            },
          }),
        ],
        viewConfig: {
          toggleOnDblClick: false,
        },
      },
    });
    this.viewAttributeGrid = grid;
    this.loadView(callback);
  },

  loadView(callback = function () {}) {
    this.getProductConditionSnapshotViewAttribute({}, (responseData) => {
      const children = [];

      if (responseData) {
        responseData.forEach((item) => {
          item.leaf = true;

          if (item.cndCd) { // Condition
            const result = children.filter(v => v.attribute === item.cndCd);
            const parent = result.length ? result[0] : null;

            if (parent) {
              parent.children.push(item);
            } else {
              children.push({
                attribute: item.cndCd,
                children: [item],
              });
            }
          } else { // Attribute
            children.push(item);
          }
        });
      }

      children.sort(this.sortAttr);
      this.viewAttributeGrid.setStoreRootNode(children);
      callback(children);
    });
  },

  createView() {
    let attrList = [];
    let childList = [];
    this.viewAttributeGrid.getAllData().forEach((item) => {
      if (!item.columnName) { // 조건 (컬럼명이 없는 경우 조건으로 취급)
        childList = childList.concat(item.children);
      } else { // 속성
        attrList.push(item);
      }
    });

    attrList = attrList.concat(childList).map(item => ({
      attribute: item.attribute,
      cndCd: item.cndCd,
      columnName: item.columnName,
    }));

    const item = {
      attributeList: attrList,
    };

    this.createProductConditionSnapshotView(item, () => {
      PFComponent.showMessage(bxMsg('viewCreateSucceed'), 'success');
    });
  },

  addGridItem(selectedItems) {
    // 성능 개선
    // 삽입할 항목이 많을 시, Root 노드 전체를 재설정
    this.updateRootNode(selectedItems);
  },

  updateRootNode(selectedItems) {
    const root = this.viewAttributeGrid.store.getRootNode();

    const duplicates = [];
    const newItems = [];
    selectedItems.forEach((item) => {
      const attribute = item.code || item.attributeName;

      if (root.findChild('attribute', attribute)) {
        duplicates.push(attribute);
      } else {
        newItems.push(item);
      }
    });

    if (duplicates.length > 0) {
      duplicates.sort();
      PFComponent.showMessage(bxMsg('CannotAddExistingItem') + duplicates.join(', '), 'warning');
    }

    const currentData = this.viewAttributeGrid.getAllData();
    const newData = newItems.map(v => this.buildNode(v));

    const data = currentData.concat(newData);
    data.sort(this.sortAttr);
    this.viewAttributeGrid.setStoreRootNode(data);
  },

  sortAttr(a, b) {
    const alen = a.children && a.children.length > 0 ? 1 : 0;
    const blen = b.children && b.children.length > 0 ? 1 : 0;

    if (alen < blen) return 1;
    else if (alen > blen) return -1;
    else if (a.attribute > b.attribute) return 1;
    else if (a.attribute < b.attribute) return -1;
    return 0;
  },

  buildNode(item) {
    if (item.code) {
      return this.buildConditionNode(item);
    } else if (item.attributeName) {
      return this.buildAttributeNode(item);
    }

    return null;
  },

  buildConditionNode(cnd) {
    const node = {
      attribute: cnd.code,
      name: cnd.name,
      children: this.buildChildNode(cnd),
    };

    return node;
  },

  buildAttributeNode(attr) {
    const node = {
      attribute: attr.attributeName,
      columnName: attr.attributeName,
      leaf: true,
    };

    return node;
  },

  buildChildNode(cnd) {
    if (cnd.type === '01') { // 목록
      return [{
        attribute: 'LIST_CD',
        cndCd: cnd.code,
        columnName: `${cnd.code}_LIST_CD`,
        leaf: true,
      }];
    } else if (cnd.type === '02') { // 범위
      return [{
        attribute: 'MIN_VAL',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MIN_VAL`,
        leaf: true,
      }, {
        attribute: 'MAX_VAL',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MAX_VAL`,
        leaf: true,
      }];
    } else if (cnd.type === '03') { // 금리
      return [{
        attribute: 'MIN_INT_RT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MIN_INT_RT`,
        leaf: true,
      }, {
        attribute: 'MAX_INT_RT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MAX_INT_RT`,
        leaf: true,
      }];
    } else if (cnd.type === '04') { // 수수료
      return [{
        attribute: 'FEE_TP_CD',
        cndCd: cnd.code,
        columnName: `${cnd.code}_FEE_TP_CD`,
        leaf: true,
      }, {
        attribute: 'MIN_FIX_FEE_AMT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MIN_FIX_FEE_AMT`,
        leaf: true,
      }, {
        attribute: 'MAX_FIX_FEE_AMT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MAX_FIX_FEE_AMT`,
        leaf: true,
      }, {
        attribute: 'MIN_RT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MIN_RT`,
        leaf: true,
      }, {
        attribute: 'MAX_RT',
        cndCd: cnd.code,
        columnName: `${cnd.code}_MAX_RT`,
        leaf: true,
      }];
    }

    return null;
  },

  /**
   * Model Controller
   */

  queryConditionTemplateBaseForList(item, callBack) {
    const requestParam = {
      conditionTypeattribute: item.conditionTypeattribute,
      conditionName: '0',
      activeYn: 'Y',
      tntInstId: getLoginTntInstId(),
    };

    PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndTemplateService',
        operation: 'queryListCndTemplate',
      },
    });
  },

  getProductConditionSnapshotViewAttribute(item, callBack) {
    const requestParam = {
      tntInstId: getLoginTntInstId(),
    };

    PFRequest.get('/condition/getProductConditionSnapshotViewAttribute.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndTemplateService',
        operation: 'getProductConditionSnapshotViewAttribute',
      },
    });
  },

  createProductConditionSnapshotView(item, callBack) {
    const requestParam = {
      attributeList: item.attributeList,
      tntInstId: getLoginTntInstId(),
    };

    PFRequest.post('/condition/createProductConditionSnapshotView.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndTemplateService',
        operation: 'createProductConditionSnapshotView',
      },
    });
  },

};

$(document).ready(() => {
  informationViewController.run();
});
