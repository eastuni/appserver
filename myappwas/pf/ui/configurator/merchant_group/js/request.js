/** Requests */
const Requests = {};

Requests.createMerchantGroup = (item) => {
  const requestParam = Object.assign({
      tntInstId: getLoginTntInstId(),
      projectId: getSelectedProjectId(),
  }, item);

  return new Promise((resolve, reject) => {
    PFRequest.post('/merchant/createMerchantGroupMaster.json', requestParam, {
      success(responseData) {
        resolve(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'MerchantGroupService',
        operation: 'create',
      },
    });
  });
};

Requests.updateMerchantGroup = (item) => {
  const requestParam = Object.assign({
      tntInstId: getLoginTntInstId(),
      projectId: getSelectedProjectId(),
  }, item);

  return new Promise((resolve, reject) => {
    PFRequest.post('/merchant/updateMerchantGroupMaster.json', requestParam, {
      success(responseData) {
        resolve(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'MerchantGroupService',
        operation: 'update',
      },
    });
  });
};

Requests.deleteMerchantGroup = (item) => {
  const requestParam = Object.assign({
      tntInstId: getLoginTntInstId(),
      projectId: getSelectedProjectId(),
      merchantGroupCode: item.id,
  }, item);

  return new Promise((resolve, reject) => {
    PFRequest.post('/merchant/deleteMerchantGroupMaster.json', requestParam, {
      success(responseData) {
        resolve(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'MerchantGroupService',
        operation: 'delete',
      },
    });
  });
};

Requests.getListMerchantGroupMerchantRel = (item) => {
  const requestParam = Object.assign({
      tntInstId: getLoginTntInstId(),
      merchantGroupCode: item.id,
  }, item);

  return new Promise((resolve, reject) => {
    PFRequest.get('/merchant/getListMerchantGroupMerchantRel.json', requestParam, {
      success(responseData) {
        resolve(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'MerchantGroupService',
        operation: 'queryMerchantRelationList',
      },
    });
  });
};


Requests.saveMerchantGroupMerchantRel = (item) => {
  const requestParam = Object.assign({
      tntInstId: getLoginTntInstId(),
      projectId: getSelectedProjectId(),
  }, item);

  return new Promise((resolve, reject) => {
    PFRequest.post('/merchant/saveMerchantGroupMerchantRel.json', requestParam, {
      success(responseData) {
        resolve(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'MerchantGroupService',
        operation: 'saveMerchantRelation',
      },
    });
  });
};



