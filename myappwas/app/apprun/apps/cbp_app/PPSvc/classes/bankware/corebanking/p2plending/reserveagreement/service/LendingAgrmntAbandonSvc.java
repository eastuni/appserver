package bankware.corebanking.p2plending.reserveagreement.service;

import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsChngRsnEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrInqryBizProc;
import bankware.corebanking.arrangement.modification.bizproc.ArrMdfctnBizProc;
import bankware.corebanking.arrangementtransaction.creation.bizproc.ArrTxCrtnBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsChngIn;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.EntryIn;
import bankware.corebanking.core.settlement.enums.DpstWhdrwlEnum;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.deposit.modification.bizproc.DpstMdfctnBizProc;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntAbandonSvcIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntAbandonSvcOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 투자 계약 포기 서비스를 제공한다.
 * This service abandon P2P lending arrangement
 *
 * Author	Sungbum Kim
 * History
 *  2015.12.09	initial version for 2.3
 */
@BxmCategory(logicalName ="Abandon P2P Lending Agreement Service")
@CbbClassInfo(classType={"SERVICE"})
@BxmService("LendingAgrmntAbandonSvc")
public class LendingAgrmntAbandonSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrCndInqryBizProc	arrCndInqryBizProc;		// Arrangement condition inquiry bizproc
	private ArrInqryBizProc		arrInqryBizProc;		// Arrangement inquiry bizproc
	private ArrMdfctnBizProc		arrMdfctnBizProc;		// Arrangement modification bizproc
	private ArrTxCrtnBizProc		arrTxCrtnBizProc;		// Arrangement transaction creation bizproc
	private CustInfoInqryBizProc	custInfoInqryBizProc;	// Customer information inquiry bizproc
	private DpstMdfctnBizProc	dpstMdfctnBizProc;		// Deposit modification bizproc

	/** 
	 * P2P 투자 계약을 포기한다.
     * Abandon the P2P Lending Agreement
     * <pre>
     * flow description
     * 
     * 1. Get Lending Arrangement to be abandoned
     * 
     * 2. Create Transaction History & Entry
     * 
     * 3. Release of Freezing Amount For Lending
     * 
     * 4. Modify Arrangement status, Abandon
     * 
     *</pre>
     * @param  in (required) LendingAgrmntAbandonSvcLendingAgrmntIn : Arrangement identification
     * @return LendingAgrmntAbandonSvcLendingAgrmntOut Result of abandon
     * @throws BizApplicationException 
     */
	@BxmServiceOperation("abandonLendingAgreement")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP2050601", srvcNm="Abandon Lending Agreement")
	@BxmCategory(logicalName = "Abandon Lending Agreement")
	public LendingAgrmntAbandonSvcOut abandonLendingAgreement(LendingAgrmntAbandonSvcIn in)  throws BizApplicationException{


		/**
         * Get Lending Arrangement to be abandoned
         */
        Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
         * Create Transaction History & Entry
         */
        ArrTx arrTx = _createTransactionAndEntry(arr);

		/**
         * Release of Freezing Amount For Lending
         */
        _getDpstMdfctnBizProc().clearFreezingAmount(arr, _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr), arrTx.getCrncyCd());

        /**
         * Modify Arrangement status
         */
        _modifyState(arr, arrTx);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput(arr);
   	}

	private ArrTx _createTransactionAndEntry(Arr arr) throws BizApplicationException { 

        HashMap<String, String> dpstMap = new HashMap<String, String>();
        dpstMap.put(AmtTpEnum.BIDDING_PRNCPL.getValue(), _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue())));

        List<EntryIn> entryInList = _getArrTxCrtnBizProc().createEntryInList(arr, dpstMap, null, DpstWhdrwlEnum.WHDRWL);

        return _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, entryInList);
	}

	private void _modifyState(ArrReal arr, ArrTx arrTx) throws BizApplicationException {

		// Set Arrangement status change input data.
		ArrStsChngIn arrStsChngIn = _getArrMdfctnBizProc().setArrangementStatusChangeIn(arrTx);

		// Change status from 'L(Applied)' to 'B(Abandoned)'
		arrStsChngIn.setArrStsChngRsnCd(ArrStsChngRsnEnum.ABANDONED_ABANDON_APPLICATION.getValue());
		arr.abandon(arrStsChngIn);
	}

	private LendingAgrmntAbandonSvcOut _buildOutput(Arr arr) throws BizApplicationException { 

		LendingAgrmntAbandonSvcOut lendingAgrmntAbandonSvcOut = new LendingAgrmntAbandonSvcOut();

		return lendingAgrmntAbandonSvcOut;
	}	

	/**
	 * @return the arrCndInqryBizProc
	 */
	private ArrCndInqryBizProc _getArrCndInqryBizProc() {
		if (arrCndInqryBizProc == null) {
			arrCndInqryBizProc = (ArrCndInqryBizProc) CbbApplicationContext.getBean(
					ArrCndInqryBizProc.class, arrCndInqryBizProc);
		}
		return arrCndInqryBizProc;
	}

	/**
	 * @return the arrInqryBizProc
	 */
	private ArrInqryBizProc _getArrInqryBizProc() {
		if (arrInqryBizProc == null) {
			arrInqryBizProc = (ArrInqryBizProc) CbbApplicationContext.getBean(
					ArrInqryBizProc.class, arrInqryBizProc);
		}
		return arrInqryBizProc;
	}

	/**
	 * @return the arrMdfctnBizProc
	 */
	private ArrMdfctnBizProc _getArrMdfctnBizProc() {
		if (arrMdfctnBizProc == null) {
			arrMdfctnBizProc = (ArrMdfctnBizProc) CbbApplicationContext.getBean(
					ArrMdfctnBizProc.class, arrMdfctnBizProc);
		}
		return arrMdfctnBizProc;
	}

	/**
	 * @return the arrTxCrtnBizProc
	 */
	private ArrTxCrtnBizProc _getArrTxCrtnBizProc() {
		if (arrTxCrtnBizProc == null) {
			arrTxCrtnBizProc = (ArrTxCrtnBizProc) CbbApplicationContext.getBean(
					ArrTxCrtnBizProc.class, arrTxCrtnBizProc);
		}
		return arrTxCrtnBizProc;
	}

	/**
	 * @return the custInfoInqryBizProc
	 */
	private CustInfoInqryBizProc _getCustInfoInqryBizProc() {
		if (custInfoInqryBizProc == null) {
			custInfoInqryBizProc = (CustInfoInqryBizProc) CbbApplicationContext.getBean(
					CustInfoInqryBizProc.class, custInfoInqryBizProc);
		}
		return custInfoInqryBizProc;
	}

	/**
	 * @return the dpstMdfctnBizProc
	 */
	private DpstMdfctnBizProc _getDpstMdfctnBizProc() {
		if (dpstMdfctnBizProc == null) {
			dpstMdfctnBizProc = (DpstMdfctnBizProc) CbbApplicationContext.getBean(
					DpstMdfctnBizProc.class, dpstMdfctnBizProc);
		}
		return dpstMdfctnBizProc;
	}
}
