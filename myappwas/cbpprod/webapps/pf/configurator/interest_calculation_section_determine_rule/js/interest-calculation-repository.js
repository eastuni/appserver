class InterestCalcuationRepository {
  constructor(config) {
    this.tntInstId = config.tntInstId;
    this.loginUserId = config.loginUserId;
  }

  /** Interest Calculation Node */

  getNode(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        baseDate: query.baseDate,
        depth: query.depth,
      };

      PFRequest.get('/calculator/interestcalculation/getNode.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationNodeService',
          operation: 'getNode',
        },
      });
    });
  }

  getNodeList(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        baseDate: query.baseDate,
      };

      PFRequest.get('/calculator/interestcalculation/getNodeForList.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationNodeService',
          operation: 'getNodeForList',
        },
      });
    });
  }

  getNodeTree(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        baseDate: query.baseDate,
        depth: query.depth,
      };

      PFRequest.get('/calculator/interestcalculation/getNodeForTree.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationNodeService',
          operation: 'getNodeForTree',
        },
      });
    });
  }

  saveNode(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        nodeList: query.nodeList,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/saveNode.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationNodeService',
          operation: 'saveNode',
        },
      });
    });
  }

  
  /** Interest Calculation Section */

  getSection(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
      };

      PFRequest.get('/calculator/interestcalculation/getSection.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'getSection',
        },
      });
    });
  }

  getSectionList() {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
      };

      PFRequest.get('/calculator/interestcalculation/getSectionForList.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'getSectionForList',
        },
      });
    });
  }

  createSection(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        interestKindDscd: query.interestKindDscd,
        startDateDscd: query.startDateDscd,
        endDateDscd: query.endDateDscd,
        interestTypeDscd: query.interestTypeDscd,
        isActive: query.isActive,
        targetAmountCalculationWayDscd: query.targetAmountCalculationWayDscd,
        baseTermCountCalculationWayDscd: query.baseTermCountCalculationWayDscd,
        content: query.content,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/createSection.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'createSection',
        },
      });
    });
  }

  updateSection(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        interestKindDscd: query.interestKindDscd,
        startDateDscd: query.startDateDscd,
        endDateDscd: query.endDateDscd,
        interestTypeDscd: query.interestTypeDscd,
        isActive: query.isActive,
        targetAmountCalculationWayDscd: query.targetAmountCalculationWayDscd,
        baseTermCountCalculationWayDscd: query.baseTermCountCalculationWayDscd,
        content: query.content,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/updateSection.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'updateSection',
        },
      });
    });
  }

  deleteSection(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/deleteSection.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'deleteSection',
        },
      });
    });
  }

  saveSection(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        interestKindDscd: query.interestKindDscd,
        startDateDscd: query.startDateDscd,
        endDateDscd: query.endDateDscd,
        interestTypeDscd: query.interestTypeDscd,
        isActive: query.isActive,
        targetAmountCalculationWayDscd: query.targetAmountCalculationWayDscd,
        baseTermCountCalculationWayDscd: query.baseTermCountCalculationWayDscd,
        content: query.content,
        process: query.process,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/saveSection.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationSectionService',
          operation: 'saveSection',
        },
      });
    });
  }
  
  
  /** Interest Calculation Determine Condition */

  getDetermineCondition(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
      };

      PFRequest.get('/calculator/interestcalculation/getDetermineCondition.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'getDetermineCondition',
        },
      });
    });
  }

  getDetermineConditionList() {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
      };

      PFRequest.get('/calculator/interestcalculation/getDetermineConditionForList.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'getDetermineConditionForList',
        },
      });
    });
  }

  createDetermineCondition(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
          tntInstId: this.tntInstId,
          id: query.id,
          operatorDscd: query.operatorDscd,
          operand1Content: query.operand1Content,
          operand2Content: query.operand2Content,
          isActive: query.isActive,
          content: query.content,
          process: query.process,
          projectId: getSelectedProjectId(),
          lastModifier: this.loginUserId,
        };

      PFRequest.post('/calculator/interestcalculation/createDetermineCondition.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'createDetermineCondition',
        },
      });
    });
  }

  updateDetermineCondition(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        operatorDscd: query.operatorDscd,
        operand1Content: query.operand1Content,
        operand2Content: query.operand2Content,
        isActive: query.isActive,
        content: query.content,
        process: query.process,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/updateDetermineCondition.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'updateDetermineCondition',
        },
      });
    });
  }

  deleteDetermineCondition(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/deleteDetermineCondition.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'deleteDetermineCondition',
        },
      });
    });
  }

  saveDetermineCondition(query) {
    return new Promise((resolve, reject) => {
      const requestParam = {
        tntInstId: this.tntInstId,
        id: query.id,
        operatorDscd: query.operatorDscd,
        operand1Content: query.operand1Content,
        operand2Content: query.operand2Content,
        isActive: query.isActive,
        content: query.content,
        process: query.process,
        projectId: getSelectedProjectId(),
        lastModifier: this.loginUserId,
      };

      PFRequest.post('/calculator/interestcalculation/saveDetermineCondition.json', requestParam, {
        success(responseData) {
          resolve(responseData);
        },
        error(err) {
          reject(err);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'InterestCalculationDetermineConditionService',
          operation: 'saveDetermineCondition',
        },
      });
    });
  }
  
}
