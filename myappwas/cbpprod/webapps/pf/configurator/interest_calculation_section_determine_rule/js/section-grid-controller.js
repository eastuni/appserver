class SectionGridController {
  constructor(config) {
    this.renderTo = config.renderTo;
  }
  
  render(data) {
    data = data || [];
    const self = this;
    return new Promise((resolve, reject) => {
      const grid = PFComponent.makeExtJSGrid({
        fields: ['id', 'interestKindDscd', 'startDateDscd', 'endDateDscd', 'interestTypeDscd', {
          name: 'period',
          convert(newValue, record) {
            const start = codeMapObj.calculationIntervalPropertyDscd[record.get('startDateDscd')];
            const end = codeMapObj.calculationIntervalPropertyDscd[record.get('endDateDscd')];
            return start === end ? `${start} 1일` : `${start} ~ ${end}`;
          },
        }],
        gridConfig: {
          renderTo: self.renderTo,
          columns: [{
            text: bxMsg('interestKind'),
            width: 70,
            dataIndex: 'interestKindDscd',
            align: 'center',
            style: 'text-align: center',
          },
          {
            text: bxMsg('period'),
            flex: 1,
            dataIndex: 'period',
            style: 'text-align: center',
            renderer(value, metaData) {
              metaData.style = 'margin-left: 10px;';
              return value
            },
          }],
          listeners: {
            scope: this,
            sortchange() {
              self.setDraggable();
            },
            viewready() {
              data.sort((a, b) => {
                const cd1 = a.interestKindDscd;
                const cd2 = b.interestKindDscd;
                if (cd1 === cd2) return 0;
                else if (cd1 < cd2) return -1;
                else return 1;
              });
              grid.setData(data);
              self.setDraggable();
              resolve();
            }
          },
        },
      });

      // filter
      const select = document.querySelector('.section-grid-area .interest-type');
      select.addEventListener('change', (e) => {
        const type = e.target.value;
        grid.store.filterBy((record) => {
          return type === '' || record.get('interestTypeDscd') === type;
        });
        self.setDraggable();
      });

      const searchBox = document.querySelector('.type-search');
      searchBox.addEventListener('input', (e) => {
        const selectedType = select.value;
        const query = e.target.value.replace(/\s/g, '').toUpperCase();
        grid.store.filterBy((record) => {
          const type = record.get('interestTypeDscd');
          const code = record.get('interestKindDscd');
          const period = record.get('period');
          const value = (code + period).replace(/\s/g, '').toUpperCase();

          if (selectedType) {
            return selectedType === type && value.search(query) >= 0;
          }
          return value.search(query) >= 0;
        });
        self.setDraggable();
      });



      // grid
      const gridDiv = document.querySelector(self.renderTo);
      gridDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setDragImage(nullImage, 0, 0);
        const id = /(?<=record-).*/.exec(e.target.id)[0];
        e.dataTransfer.setData(id, id); // hack
      });

      this.grid = grid;
    });
  }

  setDraggable() {
    // make grid cells draggable
    const cells = document.querySelectorAll(`${this.renderTo} tr`);
    cells.forEach((cell) => {
      cell.setAttribute('draggable', 'true');
    });
  }
}
