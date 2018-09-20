class NodeTreeGridController {
  constructor(config) {
    this.renderTo = config.renderTo;
    this.celldblclick = config.celldblclick;
  }

  render() {
    const self = this;
    return new Promise((resolve, reject) => {
      const grid = PFComponent.makeExtTreeGrid({
        fields: ['id', 'activeYn', 'content',
          /*'applyStartDate', 'applyEndDate',
          'content', 'rootNodeYn', 'leafNodeYn', 'parentId', 'children',
          'sectionList', 'conditionId', 'inquirySequence', 'process', */
          {
            name: 'leaf',
            convert(value, record) {
              return (record.get('children') || []).length === 0;
            },
          }
        ],
        gridConfig: {
          renderTo: self.renderTo,
          expanded: false,
          columns: [{
            xtype: 'treecolumn',
            text: bxMsg('content'),
            dataIndex: 'content',
            flex: 1,
            style: 'text-align:center',
          }, {
            text: bxMsg('status'),
            width: 60,
            dataIndex: 'activeYn',
            align: 'center',
            style: 'text-align: center',
            renderer(value) {
              return codeMapObj.TemplateActiveYnCode[value];
            },
          }],
          viewConfig: {
            toggleOnDblClick: false,
          },
          listeners: {
            scope: this,
            viewready() {
              resolve(self);
            },
            celldblclick: this.celldblclick,
          }
        },
      });

      const baseDate = document.querySelector('.base-date');
      const history = document.querySelector('.node-grid-area .history');
      history.addEventListener('change', (e) => {
        baseDate.value = e.target.value;
        baseDate.dispatchEvent(new Event('focusout'));
        e.target.value = '';
      });

      this.grid = grid;
    });
  }

  setData(root) {
    this.grid.setStoreRootNode(root);
  }

}
