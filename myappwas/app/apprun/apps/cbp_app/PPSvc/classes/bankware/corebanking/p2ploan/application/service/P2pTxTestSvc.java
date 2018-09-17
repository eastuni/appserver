package bankware.corebanking.p2ploan.application.service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.actor.customer.interfaces.dto.CustDocRelIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrVrtl;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.enums.ArrExtrnlIdNbrTpEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorXtnAtrbtIO;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrBsicCrtn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrCrtnIn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrRealGetIn;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrCndCrtn;
import bankware.corebanking.core.product.productapi.interfaces.Pd;
import bankware.corebanking.core.product.productapi.interfaces.PdMngr;
import bankware.corebanking.core.product.productapi.interfaces.dto.CndVal;
import bankware.corebanking.core.product.productapi.interfaces.dto.PdIn;
import bankware.corebanking.core.settlement.cashflow.interfaces.dto.ArrCashFlowIO;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustClIdListIn;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustOvrvwIn;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustOvrvwOut;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustXtnInfoOut;
import bankware.corebanking.dto.DummyIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.application.service.dto.P2pTxTestSvcIn;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.cashflow.interfaces.ArrCashFlowMngr;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 *
 * Author
 * History
 */
@BxmCategory(logicalName = "P2P Transaction Test")
@CbbClassInfo(classType = {"SERVICE"})
@BxmService("P2pTxTestSvc")
public class P2pTxTestSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext	cmnContext;
	private CustMngr 		custMngr;
	private ArrMngr			arrMngr;
	private ArrBalMngr		arrBalMngr;
	private ArrCustMngr		arrCustMngr;
	private ArrCashFlowMngr	arrCashFlowMngr;
	private PdMngr			pdMngr;

	@BxmServiceOperation("p2pTransactionTest")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SLN9990001", srvcNm="P2P Transaction Test")
	public DummyIO p2pTransactionTest(P2pTxTestSvcIn in) throws BizApplicationException {


		_getCmnContext().setHeaderColumn(in);

		return new DummyIO();
	}

	private Arr _getArrangement(String aplctnNbr, String custId) throws BizApplicationException {

		Arr arr = null;

		if(!StringUtils.isEmpty(aplctnNbr)) {
			ArrRealGetIn arrRealGetIn = new ArrRealGetIn();

			arrRealGetIn.setArrIdNbr(aplctnNbr);
			arrRealGetIn.setArrExtrnlIdNbrTpCd(ArrExtrnlIdNbrTpEnum.APPLICATION_NUMBER.getValue());

	    	arr = _getArrMngr().getArr(arrRealGetIn);
		} else {
			List<Arr> arrs = _getArrCustMngr().getListCustOwnLoanArrInitOrAppliedOnPeriod(custId, _getCmnContext().getTxDate(), _getCmnContext().getTxDate());

			if(arrs.size() != 0) {
				arr = arrs.get(0);
			}
		}

    	if (arr == null){
    		throw new BizApplicationException("AAPARE0007", null);
    	}

    	return arr;
	}

	private void _getDocumentList(P2pTxTestSvcIn in) throws BizApplicationException {

		List<String> docIdList = new ArrayList<String>();
		Cust cust = _getCustMngr().getCust(_getCmnContext().getInstCode(), in.getCustId());

		List<CustDocRelIO> custDocRelIOs = new ArrayList<CustDocRelIO>();
//				cust.getCustDocumentRelationList();

		docIdList.add("KoreaIdentificationCard");

		Map<String, String> map = cust.getListEffectiveDocIssueIdentification(docIdList);
//		logger.debug("#@# " + String.valueOf(map == null ? true : false));
//		logger.debug("#@# ****** Effective Document List Size: ******" + map.size());

		if(map.size() > 0) {
			Iterator<String> keys = map.keySet().iterator();

			while(keys.hasNext()) {
				String key = keys.next();
//				logger.debug("#@# $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
//				logger.debug("#@# " + map.get(key));
			}
		}
	}

	private void _doTest1(P2pTxTestSvcIn in) throws BizApplicationException {

		Arr arr = _getArrangement(in.getAplctnNbr(), in.getCustId());

		Map<ArrXtnInfoEnum, String> xtnInfoMap = arr.getXtnInfoHash();	// CUST_SNAPSHOT_ID

		if(!StringUtils.isEmpty(xtnInfoMap.get(ArrXtnInfoEnum.CUST_SNAPSHOT_ID))) {
//			logger.debug("#@# Snapshot: " + xtnInfoMap.get(ArrXtnInfoEnum.CUST_SNAPSHOT_ID));

			//Cust cust = _getCustMngr().getCustBySnapshotIdentification(in.getCustId(), xtnInfoMap.get(ArrXtnInfoEnum.CUST_SNAPSHOT_ID));

//			for(int i = 0; i < cust.getCustDocumentRelationList().size(); i++) {
//				logger.debug("#@# getDocId: " + cust.getCustDocumentRelationList().get(i).getDocId());
//				logger.debug("#@# getDocIssueId: " + cust.getCustDocumentRelationList().get(i).getDocIssueId());
//			}
		}
	}

	private void _doTest2(String custId) throws BizApplicationException {

//		logger.debug("#@# enum test");
//		logger.debug("#@# 85: " + P2pActvtyEnum.getGradeByScore(85));

		Cust cust = _getCustMngr().getCust(custId);
//		logger.debug("#@# cust id: " + cust.getCustIdentification());

		List<ActorXtnAtrbtIO> custXtnList = cust.getListExtendedAttribute();
//		logger.debug("#@# xtn list size: " + custXtnList.size());

//		for(int i = 0; i < custXtnList.size(); i++) {
//			logger.debug("#@# +++++++++++++++++++++++++++++++++++++++++ ");
//			logger.debug("#@# getActorDsCd:" + custXtnList.get(i).getActorDsCd());
//			logger.debug("#@# getDelYn:" + custXtnList.get(i).getDelYn());
//			logger.debug("#@# getXtnAtrbtCntnt:" + custXtnList.get(i).getXtnAtrbtCntnt());
//			logger.debug("#@# getXtnAtrbtNm:" + custXtnList.get(i).getXtnAtrbtNm());
//		}
	}

	private void _doTest3(P2pTxTestSvcIn in) throws BizApplicationException {

		PdIn pdIn = new PdIn();

		pdIn.setPdCd(in.getPdCd());
		pdIn.setAplyDt(_getCmnContext().getTxDate());

		Pd pd = _getPdMngr().getPd(pdIn);

		// Set the basic information
		ArrBsicCrtn arrBsicCrtn = new ArrBsicCrtn();

		arrBsicCrtn.setPdCd(in.getPdCd());
		arrBsicCrtn.setCrtnEfctvDt(_getCmnContext().getTxDate());

		// Set the condition
		List<ArrCndCrtn> arrCndCrtnList = new ArrayList<ArrCndCrtn>();

		ArrCndCrtn arrCndCrtn = new ArrCndCrtn();
		arrCndCrtn.setCndCd("A0005");
		arrCndCrtn.setTxtCndVal(in.getAplctnAmt());
		arrCndCrtnList.add(arrCndCrtn);

		arrCndCrtn = new ArrCndCrtn();
		arrCndCrtn.setCndCd("D0005");
		arrCndCrtn.setTxtCndVal(in.getLonAprvlTrmCnt());
		arrCndCrtnList.add(arrCndCrtn);

		arrCndCrtn = new ArrCndCrtn();
		arrCndCrtn.setCndCd("I0067");
		arrCndCrtn.setTxtCndVal(in.getLnIntRt());
		arrCndCrtnList.add(arrCndCrtn);

		////
		arrCndCrtn = new ArrCndCrtn();
		arrCndCrtn.setCndCd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue());
//		arrCndCrtn.setTxtCndVal(((SmplListCndVal) pd.getCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue())).getBsicVal());
		arrCndCrtn.setTxtCndVal("02");
		arrCndCrtnList.add(arrCndCrtn);

		arrCndCrtn = new ArrCndCrtn();
		arrCndCrtn.setCndCd(PdCndEnum.REPAYMENT_TYPE_AFTER_PARTIAL_REPAYMENT.getValue());
//		arrCndCrtn.setTxtCndVal(((SmplListCndVal) pd.getCnd(PdCndEnum.REPAYMENT_TYPE_AFTER_PARTIAL_REPAYMENT.getValue())).getBsicVal());
		arrCndCrtn.setTxtCndVal("3");
		arrCndCrtnList.add(arrCndCrtn);
//
//		arrCndCrtn = new ArrCndCrtn();
//		arrCndCrtn.setCndCd("L0104");
//		arrCndCrtn.setTxtCndVal("201");
//		arrCndCrtnList.add(arrCndCrtn);
//
//		arrCndCrtn = new ArrCndCrtn();
//		arrCndCrtn.setCndCd("L0098");
//		arrCndCrtn.setTxtCndVal("03");
//		arrCndCrtnList.add(arrCndCrtn);

		ArrCrtnIn arrCrtnIn = new ArrCrtnIn();

		arrCrtnIn.setArrBsicCrtn(arrBsicCrtn);
		arrCrtnIn.setArrCndList(arrCndCrtnList);

		ArrVrtl arrVrtl = _getArrMngr().openArrVrtl(arrCrtnIn);

		List<ArrCashFlowIO> arrCashFlowList = _getArrCashFlowMngr().generateArrCashFlowSchedule(arrVrtl);

//		if(arrCashFlowList != null) {
//			logger.debug("#@# ================= size: " + arrCashFlowList.size());
//
//			for(int i = 0; i < arrCashFlowList.size(); i++) {
//				logger.debug("#@# getRpymntSchdldDt: " + arrCashFlowList.get(i).getRpymntSchdldDt());
//				logger.debug("#@# getTdyRpymntAmt: " + arrCashFlowList.get(i).getTdyRpymntAmt());
//				logger.debug("#@# getRpymntSchdldAmt: " + arrCashFlowList.get(i).getRpymntSchdldAmt());
//				logger.debug("#@# getSeqNbr: " + arrCashFlowList.get(i).getSeqNbr());
//				logger.debug("#@# getCalcnBaseAmt: " + arrCashFlowList.get(i).getCalcnBaseAmt());
//				logger.debug("#@# getOriginSeqNbr: " + arrCashFlowList.get(i).getOriginSeqNbr());
//			}
//		}
	}

	private void _doTest4(String custId) throws BizApplicationException {

//		logger.debug("#@#: " + custId);

		CustCmphInqrySvcGetCustOvrvwIn custCmphInqrySvcGetCustOvrvwIn = new CustCmphInqrySvcGetCustOvrvwIn();

		custCmphInqrySvcGetCustOvrvwIn.setCustId(custId);

		List<CustCmphInqrySvcGetCustClIdListIn> cdIdList = new ArrayList<CustCmphInqrySvcGetCustClIdListIn>();
		CustCmphInqrySvcGetCustClIdListIn custCmphInqrySvcGetCustClIdListIn = new CustCmphInqrySvcGetCustClIdListIn();
		custCmphInqrySvcGetCustClIdListIn.setClId("IncomeAndDebt");	//FIXME
		cdIdList.add(custCmphInqrySvcGetCustClIdListIn);

		custCmphInqrySvcGetCustOvrvwIn.setClIdList(cdIdList);

		CustCmphInqrySvcGetCustOvrvwOut custCmphInqrySvcGetCustOvrvwOut = CbbInternalServiceExecutor.execute("SCU1100401", custCmphInqrySvcGetCustOvrvwIn);

		List<CustCmphInqrySvcGetCustXtnInfoOut> infoOuts = custCmphInqrySvcGetCustOvrvwOut.getXtnInfoList();

//		logger.debug("#@# infoOuts: " + infoOuts.size());
//
//		for(int i = 0; i < infoOuts.size(); i++) {
//			logger.debug("#@#                                                      ");
//			logger.debug("#@# getXtnAtrbtNm:" + infoOuts.get(i).getXtnAtrbtNm());
//			logger.debug("#@# getXtnAtrbtCntnt:" + infoOuts.get(i).getXtnAtrbtCntnt());
//			logger.debug("#@# getXtnAtrbtJsonCntnt:" + infoOuts.get(i).getXtnAtrbtJsonCntnt());
//		}
	}

	private void _doTest5(String arrId) throws BizApplicationException {

//		logger.debug("#@# arrId: " + arrId);

		Arr arr = _getArrMngr().getArr(arrId);
		List<ArrBal> arrBals = _getArrBalMngr().getArrBalAll(arr);

//		for(int i = 0; i < arrBals.size(); i++) {
//			logger.debug("#@# index: " + i);
//			logger.debug("#@# getAmtTpCd: " + arrBals.get(i).getAmtTpCd());
//			logger.debug("#@# getBalTpCd: " + arrBals.get(i).getBalTpCd());
//			logger.debug("#@# getCrncyCd: " + arrBals.get(i).getCrncyCd());
//			logger.debug("#@# getLastBal: " + arrBals.get(i).getLastBal());
//		}

//		logger.debug("#@# ****************************" );
		ArrBal arrBal = _getArrBalMngr().getArrPrincipalBal(arr, "CNY");
//		logger.debug("#@# lastBal: " + arrBal.getLastBal());
	}

	private void _doTest6(String arrId) throws BizApplicationException {

//		logger.debug("#@# ****************************" );

		Arr arr = _getArrMngr().getArr(arrId);
		String biddingWay = null;

    	ArrCndLst arrCndLst = (ArrCndLst) arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue());
    	biddingWay = arrCndLst.getCndVal();

//    	logger.debug("#@# biddingWay: " + biddingWay);

    	CndVal cndVal = arr.getPd().getCnd(PdCndEnum.P2P_BID_WAY.getValue()).getCndVal();

//    	logger.debug("#@# size: " + ((SmplListCndVal) cndVal).getListCndValList().size());

//    	for(int i = 0; i < ((SmplListCndVal) cndVal).getListCndValList().size(); i++) {
//    		logger.debug("#@# biddingWay: " + ((SmplListCndVal) cndVal).getListCndValList().get(i));
//    	}

//    	logger.debug("#@# size: " + ((SmplListCndVal) cndVal).getListCdList().size());
//
//    	for(int i = 0; i < ((SmplListCndVal) cndVal).getListCdList().size(); i++) {
//    		logger.debug("#@# biddingWay: " + ((SmplListCndVal) cndVal).getListCdList().get(i));
//    	}
	}

	/**
	 * @return the cmnContext
	 */
	private CmnContext _getCmnContext() {
		if (cmnContext == null) {
			cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
		}
		return cmnContext;
	}

	/**
	 * @return the custMngr
	 */
	private CustMngr _getCustMngr() {
		if (custMngr == null) {
			custMngr = (CustMngr) CbbApplicationContext.getBean(CustMngr.class, custMngr);
		}
		return custMngr;
	}

	/**
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
	}

	/**
	 * @return the arrBalMngr
	 */
	private ArrBalMngr _getArrBalMngr() {
		if (arrBalMngr == null) {
			arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(ArrBalMngr.class, arrBalMngr);
		}
		return arrBalMngr;
	}

	/**
	 * @return the arrCustMngr
	 */
	private ArrCustMngr _getArrCustMngr() {
		if (arrCustMngr == null) {
			arrCustMngr = (ArrCustMngr) CbbApplicationContext.getBean(
					ArrCustMngr.class, arrCustMngr);
		}
		return arrCustMngr;
	}

	/**
	 * @return the arrCashFlowMngr
	 */
	private ArrCashFlowMngr _getArrCashFlowMngr() {
		if (arrCashFlowMngr == null) {
			arrCashFlowMngr = (ArrCashFlowMngr) CbbApplicationContext.getBean(
					ArrCashFlowMngr.class, arrCashFlowMngr);
		}
		return arrCashFlowMngr;
	}

	/**
	 * @return the pdMngr
	 */
	private PdMngr _getPdMngr() {
		if (pdMngr == null) {
			pdMngr = (PdMngr) CbbApplicationContext.getBean(PdMngr.class, pdMngr);
		}
		return pdMngr;
	}
}
