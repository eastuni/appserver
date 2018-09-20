function renderMigrationDetailPopup() {

}

function renderPdMigResultDetailPopup(record){
  const migrationResultDetailPopupTpl = getTemplate('migrationResultDetailPopupTpl');

  PFComponent.makePopup({
    title: bxMsg('detailInfo'),
    contents: migrationResultDetailPopupTpl(),
    width: 400,
    height: 600,
    buttons: [
      {
        text: bxMsg('ButtonBottomString3'),
        elCls: 'button button-primary',
        handler: function () {
          this.close();
        }
      }
      ],
      contentsEvent: {},
      listeners: {
        afterRenderUI: function () {
          if(!record.allTableColumns) return;
          //var $table = $('.pd-migration-result-detail-area .pd-migration-result-detail-tabl');
          var $table = $('.pd-migration-result-detail-area').find('.pd-migration-result-detail-table');
          try {
            var keyValueMap = JSON.parse(record.migrationTableKeyValue);
          } catch (e) {
            PFComponent.showMessage(e, 'warning');
            return;
          }
          $('.pd-migration-result-detail-area').find('.result-detail-code').val( codeMapObj.migrationResultDetailCode[record.resultDetailCode]);
          $('.pd-migration-result-detail-area').find('.error-content').val(record.errorContent);

          $table.append('<tr><th>' + bxMsg('asisTableData') + '</th></tr>');
          record.allTableColumns.forEach(function (el) {
            var column = el.camelCase();
            var value = keyValueMap[column];

            if(!value) {
              value = '';
            }
            else {
              if(el.toUpperCase().indexOf('START_DT') != -1 || el.toUpperCase().indexOf('END_DT') != -1 || el.toUpperCase().indexOf('CHNG_DT') != -1 || el.toUpperCase().indexOf('GMT_MODIFIED') != -1) {
                value = XDate(value).toString("yyyy-MM-dd HH:mm:ss");
              }
            }
            var tr = '<tr>' +
            '<td style="text-overflow: ellipsis;overflow: hidden;padding-left:5px;border: 1px solid #c1c1c1;width:100px;"'
            + 'icon-tooltip=' + el.toUpperCase() + '>' + el.toUpperCase()
            + '</td><td style="text-overflow: ellipsis;overflow: hidden;padding-left:5px;border: 1px solid #c1c1c1;"'
            + 'icon-tooltip=' + value + '>' + value + '</td></tr>';
            $table.append(tr);
          });

          PFComponent.toolTip($('.pd-migration-result-detail-area'));
        }
      }
  });

}



String.prototype.camelCase = function(){
    var newString = '';
    var lastEditedIndex;
    for (var i = 0; i < this.length; i++){
        if(this[i] == ' ' || this[i] == '-' || this[i] == '_'){
            newString += this[i+1].toUpperCase();
            lastEditedIndex = i+1;
        }
        else if(lastEditedIndex !== i) newString += this[i].toLowerCase();
    }
    return newString;
}