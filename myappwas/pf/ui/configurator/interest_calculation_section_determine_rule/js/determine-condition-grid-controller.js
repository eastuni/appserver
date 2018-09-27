class DetermineConditionGridController {
  constructor(config) {
    this.renderTo = config.renderTo;
  }

  render(data) {
    data = data || [];
    const self = this;

    const conditionMap = data.reduce((m, v) => {
      m[v.id] = v;
      return m;
    }, {});

    const getConditionText = (cond) => {
      const op = codeMapObj.calculationOperatorDscd[cond.operatorDscd];
      const property = codeMapObj.calculationIntervalPropertyDscd;

      switch (op) {
        case 'AND':
        case 'OR':
          const lhs = conditionMap[cond.operand1Content];
          const rhs = conditionMap[cond.operand2Content];
          return `${getConditionText(lhs)} ${op}\n${getConditionText(rhs)}`;

        case 'NOT':
          const operand = conditionMap[cond.operand1Content];
          return getConditionText(operand).replace('=', '!=');
        
        case 'EMPTY':
          return `${property[cond.operand1Content]} = ''`;
          
        case 'IS':
          return `${property[cond.operand1Content]} = ${cond.operand2Content}`;

        default:
          return `${property[cond.operand1Content]} ${op} ${property[cond.operand2Content]}`;
      }
    }

    return new Promise((resolve, reject) => {
      const grid = PFComponent.makeExtJSGrid({
        fields: ['operatorDscd', 'operand1Content', 'operand2Content',
          {
            name: 'condition',
            convert(newValue, record) {
              return getConditionText(record.data);
            },
          },
        ],
        gridConfig: {
          renderTo: self.renderTo,
          columns: [
            {
              text: bxMsg('determineCondition'),
              flex: 1,
              dataIndex: 'condition',
              style: 'text-align: center',
              renderer(value, metaData) {
                metaData.style = 'margin-left: 30px;';
                return value
              },
            }
          ],
          listeners: {
            scope: this,
            sortchange() {
              self.setDraggable();
            },
            viewready(_this, eOpts) {
              data.sort((a, b) => {
                const cd1 = codeMapObj.calculationIntervalPropertyDscd[a.operand1Content];
                const cd2 = codeMapObj.calculationIntervalPropertyDscd[b.operand1Content];
                if (cd2 == null)  return -1;
                else if (cd1 == null) return 1;
                else if (cd1 != null && cd1 === cd2) return 0;
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

      // grid
      const gridDiv = document.querySelector(self.renderTo);
      gridDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setDragImage(nullImage, 0, 0);
        const id = /(?<=record-).*/.exec(e.target.id)[0];
        e.dataTransfer.setData(id, id); // hack
      });

      // filter
      const searchBox = document.querySelector('.condition-search');
      searchBox.addEventListener('input', (e) => {
        const query = e.target.value.replace(/\s/g, '').toUpperCase();
        grid.store.filterBy((record) => {
          const value = record.get('condition').replace(/\s/g, '').toUpperCase();
          return value.search(query) >= 0;
        });
        self.setDraggable();
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
