package bankware.corebanking.p2ploan.open.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMbrshp;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.loan.open.service.dto.LnAgrmntOpenSvcBsicIn;
import bankware.corebanking.loan.open.service.dto.LnAgrmntOpenSvcRsltOut;
import bankware.corebanking.p2ploan.open.service.dto.LnAgrmntCentercutExctnSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LnAgrmntExctnSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LnExctnSvcLnOpnOut;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이서비스는 낙찰상태에서 본처리를 호출하여 센터컷처리를 수행한다.
 * This service executes Center Cut process when the loan arrangement status is winning bid.
 *
 * Author	Sungbum Kim
 * History
 */
@BxmCategory(logicalName = "Execute the loan" )
@CbbClassInfo(classType="SERVICE")
@BxmService("LnAgrmntExctnSvc")
public class LnAgrmntExctnSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());	

	private CmnContext			cmnContext;				// Common context
	private ArrCustMngr			arrCustMngr;			// Arrangement customer manager
	private ArrInqryBizProc		arrInqryBizProc;		// Arrangement inquiry bizproc
	private CustInfoInqryBizProc	custInfoInqryBizProc;	// Customer information inquiry bizproc

	/**
	* Loan Disbursement Main Process
	*
	* <pre>
	* flow description
	* 
	* 1. Validate Input (Validation and Initialization and Default Value)
	*	1.1 Inquiry main arrangement {@link bankware.corebanking.loan.financialtransaction.service.LnExctnSvc.arrMngr#getArr}
	*   1.2 Validate arrangement
	*
	* 2. Get Loan Arrangement
	*
    * 3. Get P2P deposit account
    * 	3.1 Inquiry deposit arrangement {@link bankware.corebanking.loan.financialtransaction.service.LnExctnSvc.arrMngr#getArr}
    *
    * 4. Open & Disburse Loan Arrangement
    * 
    * 5. Get Lending Arrangement List
    * 
    * 6. Withdraw Lending Fee & Withdraw Lending Amount
    * 
    * 7. Build Output
    * 
    * </pre>  
	*  
    * @param in (required) LnExctnSvcPymntAcctIn: Information for executing loan
	* @return LnExctnSvcPymntRsltOut Loan result
	* @throws BizApplicationException
	*/
	@BxmServiceOperation("executeLoan")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP1071201", srvcNm="Execute Loan")
    @BxmCategory(logicalName = "Execute Loan")
	public LnExctnSvcLnOpnOut executeLoan(LnAgrmntExctnSvcIn in) throws BizApplicationException {

		/**
		 * Validate Input Value
		 */
		_validateInput(in);

		/**
		 * Get Loan Arrangement
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());
        /**
		 * Get P2P deposit account
		 */
		String dpstAcct = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr);

		/**
         * Execute Center Cut
         */
		_excuteCenterCut(arr);

		/**
		 * Open & Disburse Loan Arrangement
		 */
		LnAgrmntOpenSvcRsltOut lnAgrmntOpenSvcRsltOut = _linkLoanAgreementOpenService(arr, dpstAcct);

		/**
		 * Modify the arrangement extend attribute
		 */
		_deleteMembershipArrangementExtendAttribute(arr, lnAgrmntOpenSvcRsltOut.getTxSeqNbr());

		/**
		 * Assemble the output & return
		 */
		return _buildOutput(arr); 
	}

	private void _validateInput(LnAgrmntExctnSvcIn in) throws BizApplicationException { 
	       if(logger.isDebugEnabled()){
	            logger.debug("#@# _validateInput");
	        }
	}

	/**
     * Link Loan Agreement Open Service
     * @param arr (required) Arrangement
     * @param dpstAcct (required) Deposit account
     * @return  LnAgrmntOpenSvcRsltOut
     * @throws BizApplicationException
     */
    private LnAgrmntOpenSvcRsltOut _linkLoanAgreementOpenService( Arr arr, String dpstAcct ) throws BizApplicationException { 

    	LnAgrmntOpenSvcBsicIn lnAgrmntOpenSvcBsicIn = new LnAgrmntOpenSvcBsicIn();

    	lnAgrmntOpenSvcBsicIn.setAplctnNbr(arr.getAplctnNbr()); 	// 신청번호
    	lnAgrmntOpenSvcBsicIn.setCupldPymntYn(CCM01.YES); 			// 연동출금여부
    	lnAgrmntOpenSvcBsicIn.setPymntAcctNbr(dpstAcct); 			// 지급계좌번호
    	lnAgrmntOpenSvcBsicIn.setLnAplctnCustId(arr.getMainCust().getCustId()); // 여신신청고객식별자
    	lnAgrmntOpenSvcBsicIn.setPdCd(arr.getPdCd()); 				//  상품코드

		return CbbInternalServiceExecutor.execute("SLN0010101", lnAgrmntOpenSvcBsicIn);
    }

    /**
     * Execute Center Cut
     * @param arr (required) Arrangement
     * @throws BizApplicationException
     */
    private void _excuteCenterCut( Arr arr ) throws BizApplicationException { 

    	LnAgrmntCentercutExctnSvcIn lnAgrmntCentercutExctnSvcIn = new LnAgrmntCentercutExctnSvcIn();

    	lnAgrmntCentercutExctnSvcIn.setArrId(arr.getArrId());

		// 온라인 형태로 테스트 하기 위해 Async --> Sync로 변경
		// TA Center Cut 아키텍쳐 만든 후 가이드 받아서 처리
		//CbbInternalServiceExecutor.executeAsync("SPP1071202", lnAgrmntCentercutExctnSvcIn, 1800000);
		CbbInternalServiceExecutor.execute("SPP1071202", lnAgrmntCentercutExctnSvcIn);
	}

	private void _deleteMembershipArrangementExtendAttribute(Arr arr, int txSeqNbr) throws BizApplicationException {

		ArrMbrshp arrMbrshp = _getArrCustMngr().getMembershipArr(arr.getMainCust().getCustId());
		arrMbrshp.removeArrExtendAttribute(ArrXtnInfoEnum.CUST_LAST_LOAN_ARR_ID.getValue(), _getCmnContext().getTxDate(), txSeqNbr);
	}

	private LnExctnSvcLnOpnOut _buildOutput(Arr arr) throws BizApplicationException { 

		LnExctnSvcLnOpnOut lnExctnSvcLnOpnOut = new LnExctnSvcLnOpnOut();

		return lnExctnSvcLnOpnOut;
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
