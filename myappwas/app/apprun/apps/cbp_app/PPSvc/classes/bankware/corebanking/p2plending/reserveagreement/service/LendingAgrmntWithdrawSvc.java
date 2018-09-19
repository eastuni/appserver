package bankware.corebanking.p2plending.reserveagreement.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
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
import bankware.corebanking.deposit.enums.CustTxDscdDpstEnum;
import bankware.corebanking.deposit.financialtransaction.service.dto.DpstWhdrwlSvcIn;
import bankware.corebanking.deposit.modification.bizproc.DpstMdfctnBizProc;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcLendingAgrmntOut;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntWithdrawSvcIn;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 P2P 대출 계약의 개별 출금 서비스를 제공합니다.
 * This service withdraws individual P2P lending arrangement
 *
 * Author	Sungbum Kim
 * History
 *  2015.12.09	initial version for 2.3
 */
@BxmCategory(logicalName = "Withdraw P2P Lending Agreement Service")
@CbbClassInfo(classType = { "SERVICE" })
@BxmService("LendingAgrmntWithdrawSvc")
public class LendingAgrmntWithdrawSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext 			cmnContext;				// Common context
	private ArrCndInqryBizProc	arrCndInqryBizProc;		// Arrangement condition inquiry bizproc
	private ArrInqryBizProc		arrInqryBizProc;		// Arrangement inquiry bizproc
	private ArrTxCrtnBizProc		arrTxCrtnBizProc;		// Arrangement transaction creation bizproc
	private ArrMdfctnBizProc		arrMdfctnBizProc;		// Arrangement modification bizproc
	private CustInfoInqryBizProc	custInfoInqryBizProc;	// Customer information inquiry bizproc
	private DpstMdfctnBizProc	dpstMdfctnBizProc;		// Deposit modification bizproc

	/**
     * Execute P2P Lending Agreement
     * <pre>
     * flow description
     *
     * 1. Get Lending Arrangement
     * 
     * 2. Calculate Fee Amount(Bidding Success Fee)
     * 
     * 3. Create Transaction & Entry
     * 
     * 4. Change Lending Arrangement Status As Activated
     * 
     * 5. Build & Return Input Value
     *
     *</pre>
     * @param  in (required) LendingAgrmntSvcLendingAgrmntIn: Information for withdrawal
     * @return LendingAgrmntSvcLendingAgrmntOut Result of withdrawal
     * @throws BizApplicationException
     */
	@BxmServiceOperation("withdrawLendingAgreement")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd = "SPP2050602", srvcNm = "Withdraw P2P Lending Agreement")
	@BxmCategory(logicalName = "Withdraw P2P Lending Agreement")
	public LendingAgrmntSvcLendingAgrmntOut withdrawLendingAgreement(LendingAgrmntWithdrawSvcIn in) throws BizApplicationException {

		/**
		 * Get Lending Arrangement
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Do Condition Action, FIXME
		 */
//		arr.doConditionAction(arg0, arg1);

		/**
		 * Get deposit account
		 */
		String dpstAcct = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr);

		/**
		 * Calculate Fee Amount(Bidding Success Fee)
		 */
		//FeeCalculatorOut feeCalculatorOut = _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.OPEN_LOAN, arr);

		/**
		 * Create Transaction & Entry
		 */
		//ArrTx arrTx = _createLendingTransactionAndEntry(arr, dpstAcct, feeCalculatorOut);
		ArrTx arrTx = _createLendingTransactionAndEntry(arr, dpstAcct);

		/**
		 * 일반 경매일 경우, 대출 금리로 투자 금리를 설정해준다
		 */
		_checkBiddingMethod(arr, arrTx, in);

		/**
		 * Change Lending Arrangement Status As Activated
		 */
		_activateArrangement(arr, arrTx);

		/**
		 * Build & Return Input Value
		 */
		return _buildOutput(arr);
	}

	/**
     * Create Lending Transaction And Entry
     * @param arr 				(required) Arrangement
     * @param dpstAcct 			(required) Deposit account
     * @param feeCalculatorOut 	(required) Result of fee calculator
     * @return  ArrTx
     * @throws BizApplicationException
     */
	//private ArrTx _createLendingTransactionAndEntry(Arr arr, String dpstAcct, FeeCalculatorOut feeCalculatorOut) throws BizApplicationException {
	private ArrTx _createLendingTransactionAndEntry(Arr arr, String dpstAcct) throws BizApplicationException {

		ArrTx arrTx = 				null;
		List<EntryIn> entryInList = null;
		String lndngAmt = 			_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
		BigDecimal prncplAmt = 		new BigDecimal(lndngAmt);
		BigDecimal feeAmt = 		new BigDecimal(0);

		HashMap<String, String> entryMap = new HashMap<String, String>();
		entryMap.put(AmtTpEnum.PRNCPL.getValue(), lndngAmt);

		// if there is fee to withdrawal
//		if (feeCalculatorOut != null && !feeCalculatorOut.getFeeCalcnVal().isEmpty()) {
//			for (FeeCalcnVal feeCalcnVal : feeCalculatorOut.getFeeCalcnVal()) {
//				feeAmt = feeAmt.add(feeCalculatorOut.getFeeDcsnAmt());
//				entryMap.put(feeCalcnVal.getAmtTpCd(), feeCalcnVal.getFeeDcsnAmt().toString());
//			}
//		}

		// create entry for transaction
		entryInList = _getArrTxCrtnBizProc().createEntryInList(arr, entryMap, null, DpstWhdrwlEnum.DPST);

		// create transaction with assembled entries
		arrTx = _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, entryInList);

		// Release of Freezing Amount
		_getDpstMdfctnBizProc().clearFreezingAmount(arr, dpstAcct, arrTx.getCrncyCd());

		// call deposit service to withdraw lending amount
		_linkDepositDrawingService(dpstAcct, arrTx.getCrncyCd(), prncplAmt.add(feeAmt), _getArrTxCrtnBizProc().createRemark(entryMap, (Arr) arr.getMthrArr()));

		return arrTx;
	}

	/**
     * Deposit Account Withdrawal
     * @param whdrwlAcctNbr 	(required) Deposit account
     * @param whdrwlAcctPswd 	(required) Password
     * @param crncyCd       	(required) Currency code
     * @param totRpymntAmt  	(required) Execute amount
     * @param rmk           	(required) Transaction briefs
     * @return  void
     * @throws BizApplicationException
     */
	private void _linkDepositDrawingService(String whdrwlAcctNbr, String crncyCd, BigDecimal totWithrawAmt, String rmk) throws BizApplicationException {

		DpstWhdrwlSvcIn dpstWhdrwlIn = new DpstWhdrwlSvcIn();

		dpstWhdrwlIn.setAcctNbr(whdrwlAcctNbr);
		dpstWhdrwlIn.setCrncyCd(crncyCd);
		dpstWhdrwlIn.setTxAmt(totWithrawAmt);
		dpstWhdrwlIn.setTrnsfrAmt(totWithrawAmt);
		dpstWhdrwlIn.setTxRmkCntnt(rmk);
		dpstWhdrwlIn.setCustTxDscd(CustTxDscdDpstEnum.WITHDRAWAL_TRANSFER.getValue()); // 대체출금 , WITHDRAWAL_TRANSFER

		CbbInternalServiceExecutor.execute("SDP0120200", dpstWhdrwlIn);
	}

	private void _checkBiddingMethod(Arr arr, ArrTx arrTx, LendingAgrmntWithdrawSvcIn in) throws BizApplicationException {

		// FIXME, 금액 낙찰 방식인 경우
		if ("01".equals(in.getBiddingMthdCd())) {
			ArrCndInt arrCndInt = (ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
			BigDecimal intRt = arrCndInt.getAplyRt();
			BigDecimal bigDecimalValue = new BigDecimal(in.getLnAplctnIntRt().split("\\.")[0]);

			if (intRt.compareTo(bigDecimalValue)!=0) {
				arrCndInt.modifyCndValue(_getCmnContext().getTxDate(), in.getLnAplctnIntRt().split("\\.")[0], _getCmnContext().getTxDate(), arrTx.getTxSeqNbr());
			}
		}
	}

	private void _activateArrangement(Arr arr, ArrTx arrTx) throws BizApplicationException {

		ArrStsChngIn arrStsChngIn = _getArrMdfctnBizProc().setArrangementStatusChangeIn(arrTx);

		arrStsChngIn.setArrStsChngRsnCd(ArrStsChngRsnEnum.ACTIVE_ACTIVATE.getValue());

		arr.activate(arrStsChngIn);
	}

	private LendingAgrmntSvcLendingAgrmntOut _buildOutput(Arr arr) throws BizApplicationException {

		LendingAgrmntSvcLendingAgrmntOut lendingAgrmntSvcLnDtlOut = new LendingAgrmntSvcLendingAgrmntOut();

		return lendingAgrmntSvcLnDtlOut;
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
