class DetermineConditionConfig {
  constructor(config) {
    this.configTpl = getTemplate('configTpl');
    if (config) {
      this.container = config.container;
      this.repository = config.repository;
    }
  
    $(this.container).on('click', '.save-btn', (e) => {
      if (this.checkProject()) {
        const data = PFUtil.makeParamFromForm($('.determine-condition-form-table'));
        console.log(data);
        data.projectId = getSelectedProjectId();
        data.process = data.id ? 'U' : 'C';
        this.repository.saveDetermineCondition(data).then((res) => {
          PFComponent.showMessage(bxMsg('workSuccess'), 'success');
        });
      }
    })

    $(this.container).on('click', '.delete-btn', (e) => {
      if (this.checkProject()) {
        this.repository.deleteDetermineCondition({id: $(this.container).find(`[data-form-param='id']`).val()}).then((res) => {
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

    const taskMenu = $(".default-layout-task-menu", parent.document);
    if (taskMenu.find(".my-task-list").first().val() === ""){
      selectNotTask();
      selectedYourTask();
      return false;
    }

    if (taskMenu.find(".your-task").first().attr("data-status") === true){
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
    PFUtil.renderComboBox('calculationOperatorDscd', $(this.container).find(`[data-form-param='operatorDscd']`), item.operatorDscd);
    PFUtil.renderComboBox('calculationIntervalPropertyDscd', $(this.container).find(`[data-form-param='operand1Content']`), item.operand1Content);
    PFUtil.renderComboBox('calculationIntervalPropertyDscd', $(this.container).find(`[data-form-param='operand2Content']`), item.operand2Content);
  }
}