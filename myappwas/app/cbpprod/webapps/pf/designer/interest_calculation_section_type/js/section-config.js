class SectionConfig {
  constructor(config) {
    this.configTpl = getTemplate('configTpl');
    if (config) {
      this.container = config.container;
      this.repository = config.repository;
    }
  
    $(this.container).on('click', '.save-btn', (e) => {
      if (this.checkProject()) {
        const data = PFUtil.makeParamFromForm($('.section-form-table'));
        data.projectId = getSelectedProjectId();
        data.process = data.id ? 'U' : 'C';
        this.repository.saveSection(data).then((res) => {
          PFComponent.showMessage(bxMsg('workSuccess'), 'success');
        });
      }
    })

    $(this.container).on('click', '.delete-btn', (e) => {
      if (this.checkProject()) {
        this.repository.deleteSection({id: $(this.container).find(`[data-form-param='id']`).val()}).then((res) => {
          PFComponent.showMessage(bxMsg('workSuccess'), 'success');
        });
      }
    })
  }

  checkProject() {

    if(!isHaveProject()){
      haveNotTask();
      return false;
    }

    if (isNotMyTask(getSelectedProjectId())) {
      return false;
    }

    const taskMenu = $('.default-layout-task-menu', parent.document);
    if (taskMenu.find('.my-task-list').first().val() === ''){
      selectNotTask();
      selectedYourTask();
      return false;
    }

    if (taskMenu.find('.your-task').first().attr('data-status') === true){
      selectedYourTask();
      return false;
    }

    return true;
  }
    
  
  render(item) {
    setTaskRibbonInput(item.projectId, item.projectName);
    $(this.container).html(this.configTpl(item));
    
    // Render Comoboxes
    PFUtil.renderComboBox('TemplateActiveYnCode', $(this.container).find(`[data-form-param='activeYn']`), item.activeYn);
    PFUtil.renderComboBox('interestTypeDscd', $(this.container).find(`[data-form-param='interestTypeDscd']`), item.interestTypeDscd);
    PFUtil.renderComboBox('calculationIntervalPropertyDscd', $(this.container).find(`[data-form-param='startDateDscd']`), item.startDateDscd);
    PFUtil.renderComboBox('calculationIntervalPropertyDscd', $(this.container).find(`[data-form-param='endDateDscd']`), item.endDateDscd);
    PFUtil.renderComboBox('calculationTargetAmountDscd', $(this.container).find(`[data-form-param='targetAmountCalculationWayDscd']`), item.targetAmountCalculationWayDscd);
    PFUtil.renderComboBox('calculationBaseTermDscd', $(this.container).find(`[data-form-param='baseTermCountCalculationWayDscd']`), item.baseTermCountCalculationWayDscd);
    
    // Permission
    const saveBtn = $(this.container).find('.write-btn')
    const deleteBtn = $(this.container).find('.delete-btn')
    if (item.process === 'C') {
      deleteBtn.attr('disabled', 'true');
    }
    
    if (item.activeYn === 'Y') {
      saveBtn.attr('disabled', 'true');
      deleteBtn.attr('disabled', 'true');
    }
  }
}