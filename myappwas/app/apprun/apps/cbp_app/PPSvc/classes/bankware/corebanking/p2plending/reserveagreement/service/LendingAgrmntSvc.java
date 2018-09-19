package bankware.corebanking.p2plending.reserveagreement.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMbrshp;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
import bankware.corebanking.arrangement.creation.bizproc.ArrCrtnBizProc;
import bankware.corebanking.arrangement.enums.ArrSrvcBlockingEnum;
import bankware.corebanking.arrangement.enums.ArrSrvcEnum;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.arrangementtransaction.creation.bizproc.ArrTxCrtnBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrActionRequiredValue;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrXtnCrtn;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.EntryIn;
import bankware.corebanking.core.settlement.enums.DpstWhdrwlEnum;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.deposit.blocking.service.dto.SrvcBlckngRgstrSvcIn;
import bankware.corebanking.deposit.blocking.service.dto.SrvcBlckngRgstrSvcOut;
import bankware.corebanking.deposit.enums.CustTxDscdDpstEnum;
import bankware.corebanking.deposit.financialtransaction.service.dto.DpstWhdrwlSvcIn;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingRsltExecuteSvcIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcLendingAgrmntIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcLendingAgrmntOut;
import bankware.corebanking.p2ploan.bizproc.LnBizProc;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.product.enums.pdcondition.PdCndP2pBidWayEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This service executes P2P lending arrangement
 *
 * Author	Sungbum Kim
 * History
 *  2015.12.09	initial version for 2.3
 */
@BxmCategory(logicalName ="Execute P2P Lending Agreement Service")
@CbbClassInfo(classType={"SERVICE"})
@BxmService("LendingAgrmntSvc")
public class LendingAgrmntSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private LnBizProc			lnBizProc;				// Loan bizproc
	private CmnContext      		cmnContext;      	   // Common context
	private ArrBalMngr 			arrBalMngr;    			// Arrangement balance manager
	private ArrCustMngr			arrCustMngr;			// Arrangement customer manager
	private ArrCndInqryBizProc	arrCndInqryBizProc;		// Arrangement condition inquiry bizproc
	private ArrCrtnBizProc		arrCrtnBizProc;			// Arrangement creation bizproc
	private ArrTxCrtnBizProc		arrTxCrtnBizProc;		// Arrangement transaction creation bizrpoc
	private CustInfoInqryBizProc	custInfoInqryBizProc;	// Customer information inquiry bizproc

	/**
	 * 투자 계약을 실행한다.
     * Execute P2P Lending Agreement
     * <pre>
     * flow description
     * 
     * 1. Create Lending Arrangement
     * 
     * 2. Calculate Lending Fee
     * 
     * 3. Create Transaction History & Entry
     * 
     * 4.  Freeze Biding Principal & Bidding Success Fee(30409)
     * 
     * 5. Service Validate For Lending Arrangement(doConditionAction)
     * 		Check if the lending amount is greater that applicable amount
     *
     * 6. Assemble the output & return
     *
     *</pre>
     * @param  in(required) - LendingAgrmntSvcLendingAgrmntIn : customer id, application main, application information, loan consultant application code...
     * @return out - LendingAgrmntSvcLendingAgrmntOut
     * @throws BizApplicationException
     */
	@BxmServiceOperation("executeLendingAgreement")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP2050600", srvcNm="Execute Lending Agreement")
	@BxmCategory(logicalName = "Execute Lending Agreement")
	public LendingAgrmntSvcLendingAgrmntOut executeLendingAgreement(LendingAgrmntSvcLendingAgrmntIn in)  throws BizApplicationException{

		/**
		 * Validate Input Value
		 */
		_validateInput(in, true);

		/**
         * Create Lending Arrangement
         */
        Arr arr = _getArrCrtnBizProc().createApplyStatusArrangement(in);

        /**
		 * Get P2P deposit account
		 */
        //String dpstAcct = lnBizProc.getPeerToPeerDepositAccount(in.getCustId());
        String dpstAcct = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr);

		/**
         * Calculate Lending Fee
         */
        //FeeCalculatorOut feeCalculatorOut = _calculateLendingFee(arr);

        /**
		 * Create Transaction History & Entry
		 */
        //ArrTx arrTx = _createTransactionAndEntry(arr, dpstAcct, feeCalculatorOut);
        ArrTx arrTx = _createTransactionAndEntry(arr, dpstAcct);

        /**
		 * Freeze Biding Principal & Bidding Success Fee(30409)
		 */
        _linkFeezingService(arr, dpstAcct, arrTx);

        /**
         * Service Validate For Lending Arrangement(doConditionAction)
         * - check if the lending amount is greater that applicable amount
         */
        _doArrConditionAction(arr, arrTx, ArrSrvcEnum.WIN_P2P_BID);

        /**
         * Check if the arrangement can be Win-bid or not
         * - determine whether the loan arrangement can be successfully bid according to the biding way
         * - amount bid method : when the sum of the whole bid amount meets the applied amount of the loan
         * - term bid method : when the loan applicable period has been expired(batch will handle accordingly)
         */
        String arrStsCd = _checkWinningBid((Arr)arr.getMthrArr(), arrTx, ArrSrvcEnum.WIN_P2P_BID);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput((Arr)arr.getMthrArr(), arr.getArrId(), arrStsCd);
	}

	private void _validateInput(LendingAgrmntSvcLendingAgrmntIn in, boolean chkFlag) throws BizApplicationException {

		if(chkFlag) {
	    	// Validate transaction password when channel is self-channel
			if(in.getTxPswd() == null || in.getTxPswd().isEmpty()) {
				throw new BizApplicationException("AAPLNE0079", null);
			} else {
				ArrMbrshp arrMbrshp = _getArrCustMngr().getMembershipArr(_getCmnContext().getCustId());

				if(arrMbrshp != null) {
					arrMbrshp.validatePassword(in.getTxPswd());
				} else {
					throw new BizApplicationException("AAPLNE0080", null);
				}
			}
	        if (in.getCustId() == null) {
	            in.setCustId(_getCmnContext().getCustId());
	        }
		}

		if (in.getMgmtDeptId() == null){
            in.setMgmtDeptId(_getCmnContext().getDeptId());
        }

        if (in.getMgmtStaffId() == null) {
            in.setMgmtStaffId(_getCmnContext().getStaffId());
        }

        if (in.getArrDt() == null) {
            in.setArrDt(_getCmnContext().getTxDate());
        }
	}

//	private FeeCalculatorOut _calculateLendingFee(Arr arr) throws BizApplicationException {
//
//        return _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.OPEN_P2P_INVESTMENT, arr);
//	}

	//private ArrTx _createTransactionAndEntry(Arr arr,  String dpstAcct, FeeCalculatorOut feeCalculatorOut) throws BizApplicationException { 
	private ArrTx _createTransactionAndEntry(Arr arr,  String dpstAcct) throws BizApplicationException {

        ArrTx arrTx = null;
        List<EntryIn> entryInList = null;
        HashMap<String, String> entryMap = new HashMap<String, String>();

        entryMap.put(AmtTpEnum.BIDDING_PRNCPL.getValue(), _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue())));

        // if there is fee to withdrawal
//        if(feeCalculatorOut != null && !feeCalculatorOut.getFeeCalcnVal().isEmpty()){
//        	// define entry type & set the amount
//            entryMap.put(AmtTpEnum.BIDDING_APLCTN_FEE.getValue(), feeCalculatorOut.getFeeDcsnAmt().toString());
//            // create entry for transaction
//            entryInList = _getArrTxCrtnBizProc().createEntryInList(arr, entryMap, null, DpstWhdrwlEnum.DPST);
//            // create transaction with assembled entries
//            arrTx = _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, entryInList);
//
//            // call deposit service to withdraw fee amount
//            _linkDepositDrawingService(dpstAcct, null, arrTx.getCrncyCd(), feeCalculatorOut.getFeeDcsnAmt(), _getArrTxCrtnBizProc().createRemark(entryMap, (Arr)arr.getMthrArr()));
//        } else {
            // create entry for transaction
            entryInList = _getArrTxCrtnBizProc().createEntryInList(arr, entryMap, null, DpstWhdrwlEnum.DPST);
            // create transaction with assembled entries
        	arrTx = _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, entryInList);
//        }

        return arrTx;
	}

	/**
     * Deposit Account Withdrawal
     * @param whdrwlAcctNbr 	(required)Deposit Account
     * @param whdrwlAcctPswd 	(required)Password
     * @param crncyCd       	(required)Currency Code
     * @param totRpymntAmt  	(required)Execute Amt
     * @param rmk           	(required)Transaction Briefs
     * @return  void
     * @throws BizApplicationException
     */
    private void _linkDepositDrawingService( String whdrwlAcctNbr, String whdrwlAcctPswd, String crncyCd, BigDecimal totWithrawAmt, String rmk ) throws BizApplicationException { //, NestedRuntimeException, NestedCheckedException{

    	DpstWhdrwlSvcIn dpstWhdrwlIn = new DpstWhdrwlSvcIn();

    	dpstWhdrwlIn.setAcctNbr(whdrwlAcctNbr);
		dpstWhdrwlIn.setCrncyCd(crncyCd);
		dpstWhdrwlIn.setTxAmt(totWithrawAmt);
		dpstWhdrwlIn.setTrnsfrAmt(totWithrawAmt);
		dpstWhdrwlIn.setTxRmkCntnt(rmk);
		dpstWhdrwlIn.setCustTxDscd(CustTxDscdDpstEnum.WITHDRAWAL_FEE.getValue());

		CbbInternalServiceExecutor.execute("SDP0120200", dpstWhdrwlIn);
    }

	/**
     * Freeze Lending Amount
     * @param whdrwlAcctNbr		(required) Deposit Account
     * @param whdrwlAcctPswd 	(required)Password
     * @param crncyCd        	(required)Currency Code
     * @param totRpymntAmt  	(required)Execute Amt
     * @param rmk           	(required)Transaction Briefs
     * @return  void
     * @throws BizApplicationException
     */
    private void _linkFeezingService( Arr arr, String whdrwlAcctNbr, ArrTx arrTx) throws BizApplicationException { //, NestedRuntimeException, NestedCheckedException{

    	BigDecimal bidPrncpl = new BigDecimal(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue())));

    	HashMap<String, String> entryMap = new HashMap<String, String>();
        entryMap.put(AmtTpEnum.BIDDING_PRNCPL.getValue(), bidPrncpl.toString());

        // calculate fee when biding is successfully closed and paid
        BigDecimal feeAmt = BigDecimal.ZERO;
    	//FeeCalculatorOut feeCalculatorOut =  _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.OPEN_LOAN, arr);

    	SrvcBlckngRgstrSvcIn arrSrvcBlckngSvcRgstrnIn = new SrvcBlckngRgstrSvcIn();
        arrSrvcBlckngSvcRgstrnIn.setAcctNbr(whdrwlAcctNbr);
        arrSrvcBlckngSvcRgstrnIn.setArrSrvcBlckngCd(ArrSrvcBlockingEnum.RETENTION.getValue());  //금액지급제한
        arrSrvcBlckngSvcRgstrnIn.setArrSrvcBlckngAmtCrncyCd(arrTx.getCrncyCd());
        arrSrvcBlckngSvcRgstrnIn.setCntrprtArrId(arr.getArrId());
        arrSrvcBlckngSvcRgstrnIn.setCntrprtTxDt(arrTx.getTxDt());
        arrSrvcBlckngSvcRgstrnIn.setCntrprtTxSeqNbr(arrTx.getTxSeqNbr());

//        if(feeCalculatorOut != null && !feeCalculatorOut.getFeeCalcnVal().isEmpty()) {
//        	entryMap.put(AmtTpEnum.BIDDING_SUCSS_FEE.getValue(), feeCalculatorOut.getFeeDcsnAmt().toString());
//        	feeAmt = feeCalculatorOut.getFeeDcsnAmt();
//        }

        arrSrvcBlckngSvcRgstrnIn.setArrSrvcBlckngAmt(bidPrncpl.add(feeAmt));
        // create and set the remark to be displayed on the detail of account transaction.
        arrSrvcBlckngSvcRgstrnIn.setArrSrvcBlckngCntnt(_getArrTxCrtnBizProc().createRemark(entryMap, (Arr)arr.getMthrArr()));
        SrvcBlckngRgstrSvcOut arrSrvcBlckngSvcRgstrnOut = CbbInternalServiceExecutor.execute("SDP0500600", arrSrvcBlckngSvcRgstrnIn);

        ArrXtnCrtn arrXtnCrtn = new ArrXtnCrtn();
        arrXtnCrtn.setXtnAtrbtNm(ArrXtnInfoEnum.ARR_SRVC_BLCKNG_SEQ_NBR.getValue());
        arrXtnCrtn.setXtnAtrbtCntnt(arrSrvcBlckngSvcRgstrnOut.getArrSrvcBlckngSeqNbr().toString());

        // set freezing sequence number as extend attribute to arrangement, to use when releasing the amount
		arr.saveArrExtendAttribute(arrXtnCrtn, arrTx.getTxDt(),arrTx.getTxSeqNbr());
    }

    private void _doArrConditionAction(Arr arr, ArrTx arrTx, ArrSrvcEnum arrSrvcEnum) throws BizApplicationException {

        ArrActionRequiredValue arrActionRequiredValue = new ArrActionRequiredValue();
        arrActionRequiredValue.setTxDt(arr.getArrOpnDt());

        //contract amount
        ArrCndRng arrCndRng = (ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue());   //A0005
        BigDecimal arrAmt = BigDecimal.ZERO;

        if (arrCndRng != null) arrAmt = arrCndRng.getRngVal();

        arrActionRequiredValue.setTxAmt(arrAmt);
        arrActionRequiredValue.setTxSeqNbr(arrTx.getTxSeqNbr());
        arrActionRequiredValue.setTxDt(arrTx.getTxDt());

        _getLnBizProc().executeConditionCheck((Arr)arr.getMthrArr(), arrSrvcEnum, arrActionRequiredValue);
	}

    /**
     * Check if the arrangement can be Win-bid or not
     * @param arr (required) Arr
     * @param arrTx (required) ArrTx
     * @param arrSrvcEnum (required) ArrSrvcEnum
     * @return  String
     * @throws BizApplicationException
     */
	private String _checkWinningBid(Arr arr, ArrTx arrTx, ArrSrvcEnum arrSrvcEnum) throws BizApplicationException {

		String arrStsCd = ArrStsEnum.APPLIED.getValue();
		//BID WAY (AMOUNT_BID_WAY:01, TERM_BID_WAY:02)
		ArrCnd bidWayCnd = arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue());
		String bidWayValue = bidWayCnd.getCndValDefault();
		//APPLIED AMOUNT EXCEED ACCEPT YN
		ArrCnd exceedAmtCnd = arr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN.getValue());
		String exceedAmtAccptYnValue = ((ArrCndLst)exceedAmtCnd).getListCd();
		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));

		// 최대금액허용여부 체크 삭제 - by 2016.03.22 오윤화  
		if(bidWayValue.equals(PdCndP2pBidWayEnum.AMOUNT_BID_WAY.getValue())){
		//if(bidWayValue.equals(ArrCndP2pBidWayEnum.AMOUNT_BID_WAY.getValue()) && exceedAmtAccptYnValue.equals(CCM01.NO)){
			ArrBal arrBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
	        // contract amount
	        ArrCndRng arrCndRng = (ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue());   //A0005
	        BigDecimal arrAmt = arrCndRng.getRngVal();
	        // when the sum of the whole bid amount meets the applied amount of the loan
	        if(arrBal.getLastBal().compareTo(arrAmt) == 0){

	        	// Execute the winning bidding
	        	BiddingRsltExecuteSvcIn biddingRsltExecuteSvcIn = _setBiddingResultExecuteServiceIn(arr);

	        	//서비스 오퍼레이션은 일반 메소드 처럼 호출해서 사용하지 않음.
	        	CbbInternalServiceExecutor.execute("SPP1061201", biddingRsltExecuteSvcIn);

	        	arrStsCd = biddingRsltExecuteSvcIn.getBiddingStsCd();
	        }
		}

		return arrStsCd;
	}

	private BiddingRsltExecuteSvcIn _setBiddingResultExecuteServiceIn(Arr arr) {

		BiddingRsltExecuteSvcIn out = new BiddingRsltExecuteSvcIn();

		out.setArrId(arr.getArrId());
		out.setBiddingStsCd(ArrStsEnum.WINNING_BID.getValue());

		return out;
	}

	private LendingAgrmntSvcLendingAgrmntOut _buildOutput(Arr arr, String arrId, String arrStsCd) throws BizApplicationException {

		LendingAgrmntSvcLendingAgrmntOut lendingAgrmntSvcLnDtlOut = new LendingAgrmntSvcLendingAgrmntOut();

		lendingAgrmntSvcLnDtlOut.setMthrArrId(arr.getArrId());
		lendingAgrmntSvcLnDtlOut.setArrId(arrId);
		lendingAgrmntSvcLnDtlOut.setArrStsCd(arrStsCd);

		return lendingAgrmntSvcLnDtlOut;
	}

	/**
	 * 관리자가 투자 계약을 실행한다.
     * Execute P2P Lending Agreement
     * <pre>
     * flow description
     * 
     * 1. Create Lending Arrangement
     * 
     * 2. Calculate Lending Fee
     * 
     * 3. Create Transaction History & Entry
     * 
     * 4. Freeze Biding Principal & Bidding Success Fee(30409)
     * 
     * 5. Service Validate For Lending Arrangement(doConditionAction)
     *		Check if the lending amount is greater that applicable amount
     *
     * 6. Assemble the output & return
     *
     *</pre>
     * @param  in (required) LendingAgrmntSvcLendingAgrmntIn: Information for lending arrangement
     * @return LendingAgrmntSvcLendingAgrmntOut Result of investment
     * @throws BizApplicationException
     */
	@BxmServiceOperation("executeLendingAgreementbyAdmin")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0210600", srvcNm="Execute Lending Agreement by Admin")
	@BxmCategory(logicalName = "Execute Lending Agreement by Admin")
	public LendingAgrmntSvcLendingAgrmntOut executeLendingAgreementbyAdmin(LendingAgrmntSvcLendingAgrmntIn in)  throws BizApplicationException{

		/**
		 * Validate Input Value
		 */
		_validateInput(in, false);

		/**
         * Create Lending Arrangement
         */
        Arr arr = _getArrCrtnBizProc().createApplyStatusArrangement(in);

        /**
		 * Get P2P deposit account
		 */
        String dpstAcct = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr);

        /**
         * Calculate Lending Fee
         */
        //FeeCalculatorOut feeCalculatorOut = _calculateLendingFee(arr);

        /**
		 * Create Transaction History & Entry
		 */
        //ArrTx arrTx = _createTransactionAndEntry(arr, dpstAcct, feeCalculatorOut);
        ArrTx arrTx = _createTransactionAndEntry(arr, dpstAcct);

        /**
		 * Freeze Biding Principal & Bidding Success Fee(30409)
		 */
        _linkFeezingService(arr, dpstAcct, arrTx);

        /**
         * Service Validate For Lending Arrangement(doConditionAction)
         * - check if the lending amount is greater that applicable amount
         */
        _doArrConditionAction(arr, arrTx, ArrSrvcEnum.WIN_P2P_BID);

        /**
         * Check if the arrangement can be Win-bid or not
         * - determine whether the loan arrangement can be successfully bid according to the biding way
         * - amount bid method : when the sum of the whole bid amount meets the applied amount of the loan
         * - term bid method : when the loan applicable period has been expired(batch will handle accordingly)
         */
        String arrStsCd = _checkWinningBid((Arr)arr.getMthrArr(), arrTx, ArrSrvcEnum.WIN_P2P_BID);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput((Arr)arr.getMthrArr(), arr.getArrId(), arrStsCd);
	}

	/**
	 * @return the lnBizProc
	 */
	private LnBizProc _getLnBizProc() {
		if (lnBizProc == null) {
			lnBizProc = (LnBizProc) CbbApplicationContext.getBean(LnBizProc.class, lnBizProc);
		}
		return lnBizProc;
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
	 * @return the arrCrtnBizProc
	 */
	private ArrCrtnBizProc _getArrCrtnBizProc() {
		if (arrCrtnBizProc == null) {
			arrCrtnBizProc = (ArrCrtnBizProc) CbbApplicationContext.getBean(
					ArrCrtnBizProc.class, arrCrtnBizProc);
		}
		return arrCrtnBizProc;
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
}


