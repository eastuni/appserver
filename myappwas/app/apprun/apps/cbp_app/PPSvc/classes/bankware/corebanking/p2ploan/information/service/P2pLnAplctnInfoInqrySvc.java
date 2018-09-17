package bankware.corebanking.p2ploan.information.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.actor.customer.interfaces.dto.CustDocRelIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.dictionary.interfaces.TrnsfrLng;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMbrshp;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrStrctrArrDoc;
import bankware.corebanking.core.document.document.interfaces.dto.DocIssueIO;
import bankware.corebanking.core.document.enums.DocIssueStsEnum;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.document.document.interfaces.DocIssue;
import bankware.corebanking.document.document.interfaces.DocMngr;
import bankware.corebanking.dto.DummyIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcChkLnAplctnAblIn;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.underexamination.consultationapplication.service.dto.AplctnDocOut;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This Service provides P2P application information query.
 *
 * Author	Kisu Kim
 * History
 *  2016.03.21	initial version for 3.0
 */
@BxmService("P2pLnAplctnInfoInqrySvc")
@BxmCategory(logicalName = "P2P Loan Application Information Inquiry Service" )
@CbbClassInfo(classType={"SERVICE"})
public class P2pLnAplctnInfoInqrySvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext				cmnContext;				// Common context
	private ArrCndInqryBizProc		arrCndInqryBizProc;		// Arrangement condition inquiry bizproc
	private ArrMngr 					arrMngr;				// Arrangement manager
	private ArrCustMngr 				arrCustMngr;			// Arrangement customer manager
	private CustInfoInqryBizProc		custInfoInqryBizProc;	// Customer information inquiry bizproc
	private CustMngr					custMngr;				// Customer manager
	private DocMngr					docMngr;				// Document manager
	private TrnsfrLng				trnsfrLng;				// Translate language

	/**
	 * 마지막 대출 신청 정보 조회.
	 * Last P2P loan application information query.
	 * 
	 * <pre>
	 * 1. 고객의 멤버쉽 확장 정보를 이용하여 계약을 가져온다.
	 * 
	 * 1. Get the arrangement using customer's membership extend attribute.
	 * 
	 * 2. 출력을 조립하고 반환한다.
	 * 	2.1 만약 계약이 null이라면, null을 반환한다.
	 * 
	 * 2. Assemble the output & return.
	 * 	2.1 If arrangement is null, return null.
	 * </pre>
	 * 
	 * @param in (required) DummyIO: Dummy IO
	 * @return P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut: Last P2P loan application information
	 * @throws BizApplicationException
	 */
	@CbbSrvcInfo(srvcCd = "SPP0130401", srvcNm = "Last P2P Loan Application Information Query")
	@BxmServiceOperation("getLastP2pLoanApplicationInformation")
	@TransactionalOperation
	public P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut getLastP2pLoanApplicationInformation(DummyIO in) throws BizApplicationException {

		/**
		 * Get the arrangement using customer's membership extend attribute
		 */
		Arr arr = _getArrangementByMembershipExtendAttribute(_getCmnContext().getCustId());	// FIXME

		/**
		 * Assemble the output & return
		 */
		return _assembleOutput(arr);
	}

	private Arr _getArrangementByMembershipExtendAttribute(String custId) throws BizApplicationException {

		Arr arr = null;
		ArrXtnInfoEnum arrXtnInfoEnum = ArrXtnInfoEnum.CUST_LAST_LOAN_ARR_ID;

		ArrMbrshp arrMbrshp = _getArrCustMngr().getMembershipArr(custId);
		String arrId = arrMbrshp.getExtendAttribute(arrXtnInfoEnum);

		if (!StringUtils.isEmpty(arrId)) {
			arr = _getArrMngr().getArr(arrId);
		}

		return arr;
	}

	private P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut _assembleOutput(Arr arr) throws BizApplicationException {

		P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut out = new P2pLnAplctnInfoInqrySvcLastLnAplctnInfoOut();

		if (arr != null) {
			out.setArrId(arr.getArrId());
			out.setAplctnAmt(_getLoanApplicationAmount(arr));
			out.setLnIntRt(_getLoanApplicationRate(arr));
		}

		return out;
	}

	private BigDecimal _getLoanApplicationAmount(Arr arr) throws BizApplicationException {

		BigDecimal lnAplctnAmt = new BigDecimal(0);

		lnAplctnAmt = ((ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue())).getRngVal();

		return lnAplctnAmt;
	}

	private BigDecimal _getLoanApplicationRate(Arr arr) throws BizApplicationException {

		String lnAplctnRt = null;

		lnAplctnRt = ((ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getCndVal();

		return new BigDecimal(lnAplctnRt);
	}

	/**
	 * P2P 대출 신청 가능 여부 체크.
	 * Check the P2P Loan Application Able
	 * 
	 * <pre>
	 * 1. 고객의 멤버쉽 확장 정보를 이용하여 계약을 가져온다.
	 * 
	 * 1. Get the arrangement using customer's membership extend attribute.
	 * 
	 * 2. 계약의 상태를 체크한다.
	 * 	2.1 계약이 null이라면, AAPARE0007 에러를 낸다(Arrangement does not exist. Account Number. Please check input value.).
	 * 	2.2 계약의 상태가 INITIATED이 아니라면, AAPLNE0019 에러를 낸다(It has already applied for history. Please check the application information.).
	 * 
	 * 2. Check the arrangement status.
	 * 	2.1 If arrangement is null, throw error AAPARE0007(Arrangement does not exist. Account Number. Please check input value.).
	 * 	2.2 If arrangement status is not INITIATED, throw error AAPLNE0019(It has already applied for history. Please check the application information.).
	 * </pre>
	 * 
	 * @param in (required) P2pLnAplctnInfoInqrySvcChkLnAplctnAblIn: Arrangement identification
	 * @return DummyIO
	 * @throws BizApplicationException
	 */
	@CbbSrvcInfo(srvcCd = "SPP0130402", srvcNm = "Check P2P Loan Application Able")
	@BxmServiceOperation("checkP2pLoanApplicationAble")
	@TransactionalOperation
	public DummyIO checkP2pLoanApplicationAble(P2pLnAplctnInfoInqrySvcChkLnAplctnAblIn in) throws BizApplicationException {

		/**
		 * Get the arrangement by customer membership extend information
		 */
		Arr arr = _getArrangementByMembershipExtendAttribute(_getCmnContext().getCustId());

		/**
		 * Check the arrangement status
		 */
		_checkP2pLoanApplicationStatus(arr);

		return new DummyIO();
	}

	private void _checkP2pLoanApplicationStatus(Arr arr) throws BizApplicationException {

		if(arr == null) {
			// Arrangement does not exist. Account Number. Please check input value.
			throw new BizApplicationException("AAPARE0007", null);
		}

		ArrStsEnum arrStsEnum = arr.getArrSts();

		if(ArrStsEnum.APPLIED.equals(arrStsEnum)
				|| ArrStsEnum.UNDER_EXAMINATION.equals(arrStsEnum)
				|| ArrStsEnum.APPROVED.equals(arrStsEnum)
				|| ArrStsEnum.START_BID.equals(arrStsEnum)
				|| ArrStsEnum.WINNING_BID.equals(arrStsEnum)) {
			// It has already applied for history. Please check the application information.
			throw new BizApplicationException("AAPLNE0019", null);
		}
	}

	/**
	 * P2P 대출 신청 정보 조회.
	 * P2P Loan Application Information Query.
	 * 
	 * <pre>
	 * 1. 고객의 예치금 계좌 번호를 가져온다.
	 * 
	 * 1. Get the customer's account number.
	 * 
	 * 2. 계약을 가져온다(계약 상태: INITIATED 혹은 APPLIED).
	 * 	2.1 계약이 null이고 입력 데이터인 ErrorYn가 'Y'라면, AAPARE0007 에러를 낸다(Arrangement does not exist. Account Number. Please check input value.).
	 * 		계약이 null이고 입력 데이터인 ErrorYn가 'N'라면, 빈 출력을 반환한다(P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut).
	 * 
	 * 2. Get the arrangement(Arrangement status: INITIATED or APPLIED).
	 * 	2.1 If arrangement is null & ErrorYn(input date) is 'Y', throw error AAPARE0007(Arrangement does not exist. Account Number. Please check input value.).
	 * 		If arrangement is null & ErrorYn(input date) is 'N', return empty output(P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut).
	 * 
	 * 3. 고객 ID와 계좌 번호 소유주의 ID를 검증한다.
	 * 	3.1 로그인한 고객의 ID와 계좌 번호 소유주의 ID를 비교한다.
	 * 		만약 ID가 같지 않다면, AAPARE0112를 낸다(This account is the account of another customer. Please check input value.).
	 * 
	 * 3. Validate the customer identification & account number's owner identification.
	 * 	3.1 Compare login identification and account number's owner identification.
	 * 		If that is not equal, throw error AAPARE0112(This account is the account of another customer. Please check input value.).
	 * 
	 * 4. 출력을 조립하고 반환한다.
	 * 	4.1 계약 기본 정보를 셋팅한다.
	 * 	4.2 신청에 필요한 서류 목록을 셋팅한다.
	 * 	4.3 업로드한 서류와 유효한 서류의 목록을 셋팅한다.
	 * 
	 * 4. Assemble the output & return
	 * 	4.1 Set the basic information(Arrangement identification, product name, Application information...).
	 * 	4.2 Set the list of document for approval.
	 * 	4.3 Set the list of document(Uploaded & Effective).
	 * </pre>
	 * 
	 * @param in (required) P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn: Customer identification, Error yes or no
	 * @return P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut: P2P loan application information
	 * @throws BizApplicationException
	 */
	@CbbSrvcInfo(srvcCd = "SPP0130403",srvcNm = "P2P Loan Application Information Query")
	@BxmServiceOperation("getP2pLoanApplicationInformation")
	@TransactionalOperation
	public P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut getP2pLoanApplicationInformation(P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn in) throws BizApplicationException {

		/**
		 * Get the customer's account number
		 */
		String acctNbr = _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByCustomerIdentification(in.getCustId());

		/**
		 * Get the arrangement
		 */
		List<Arr> arrs = _getInitOrAppliedStatusLoanArrangement(in.getCustId());

		if(arrs.size() == 0 && !StringUtils.isEmpty(in.getErrYn()) && CCM01.NO.equals(in.getErrYn())) {
			P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut out = new P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut();

			out.setAcctNbr(acctNbr);

			return out;			
		} else if(arrs.size() == 0) {
			// Arrangement does not exist. Account Number. Please check input value.
			throw new BizApplicationException("AAPARE0007", null);			
		}

		// FIXME
		Arr arr = null;

		for(int i = 0; i < arrs.size(); i++) {
			if(arrs.get(i).getArrSts().equals(ArrStsEnum.APPLIED)|| arrs.get(i).getArrSts().equals(ArrStsEnum.INITIATED)) {
				arr = arrs.get(i);
			}
		}

		if(arr == null && !StringUtils.isEmpty(in.getErrYn()) && CCM01.NO.equals(in.getErrYn())) {
			P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut out = new P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut();

			out.setAcctNbr(acctNbr);

			return out;	
		} else if(arr == null) {
			// Arrangement does not exist. Account Number. Please check input value.
			throw new BizApplicationException("AAPARE0007", null);			
		}

		/**
		 * Validate the customer identification & account number
		 */
		_validateCustomerIdentificationAccountNumber(arr);

		/**
		 * Assemble the output & return
		 */
		return _getApplicationInformation(arr, acctNbr, in);
	}

	private List<Arr> _getInitOrAppliedStatusLoanArrangement(String custId) throws BizApplicationException {

		List<Arr> arrs = new ArrayList<Arr>();

		List<ArrReal> initArrs = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(custId, ArrStsEnum.INITIATED, CPD01.PD_BIZ_DSCD_LN, null, null, null);
		List<ArrReal> appliedArrs = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(custId, ArrStsEnum.APPLIED, CPD01.PD_BIZ_DSCD_LN, null, null, null);

		for(int i = 0; i < initArrs.size(); i++) {
			arrs.add((Arr) initArrs.get(i));
		}

		for(int i = 0; i < appliedArrs.size(); i++) {
			arrs.add((Arr) appliedArrs.get(i));
		}

		return arrs;
	}

	private void _validateCustomerIdentificationAccountNumber(Arr arr) throws BizApplicationException {

		if (_getCmnContext().isChannelInternet() || _getCmnContext().isChannelMobile()) {
			String logOnCustId = 	_getCmnContext().getCustId();
			String acctNbrCustId = 	arr.getMainCust().getCustId();

			if (!logOnCustId.equals(acctNbrCustId)) {
				// This account is the account of another customer. Please check input value.
				throw new BizApplicationException("AAPARE0112", null);
			}
		}
	}

	private P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut _getApplicationInformation(Arr arr, String acctNbr, P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn in) throws BizApplicationException {

		P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut out = new P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut();

		// Arrangement identification
		out.setArrId(arr.getArrId());

		// Product name
		out.setPdNm(arr.getPd().getPdNm());

		// Application number
		out.setAplctnNbr(arr.getAplctnNbr());

		// Application date
		out.setAplctnDt(arr.getArrStsDt());

		// Loan application status
		out.setArrStsCd(arr.getArrSts().getValue());
		out.setArrStsCdNm(_getTrnsfrLng().getTransferLanguage(CCM01.TRANS_CODE_VAL, "11983" + arr.getArrSts().getValue()));

		// Repayment method type
		String rpymntWayNm = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
		if (!StringUtils.isEmpty(rpymntWayNm)) {
			out.setRpymntWayNm(rpymntWayNm);
		}

		// Currency Code, CURRENCY
		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		if (!StringUtils.isEmpty(crncyCd)) {
			out.setCrncyCd(crncyCd);
		}

		// Contract Term, CONTRACT_TERM
		String lnAprvlTrm = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue()));
		if (!StringUtils.isEmpty(lnAprvlTrm)) {
			out.setLonAprvlTrmCnt(lnAprvlTrm);
		}

		// Contract amount
		String aplctnAmt = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
		if (aplctnAmt != null && !aplctnAmt.equals("")) {
			out.setAplctnAmt(aplctnAmt);
		}

		// LOAN_PURPOSE_CODE & LOAN_REASON_CONTENT
		Map<ArrXtnInfoEnum, String> xtnInforList = arr.getXtnInfoHash();			
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE))) {
			out.setLnPurposeCd(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE));
		}
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_REASON_CONTENT))) {
			out.setLnRsnCntnt(xtnInforList.get(ArrXtnInfoEnum.LOAN_REASON_CONTENT));
		}

		// Get the loan application fees
		//out.setLnAplctnFeeAmt(_getLLoanFee(arr));

		// P2P_LOAN_DESIRED_MAXIMUM_AMOUNT
		ArrCnd p2pLnDesiredMaxAmtArrCnd = arr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT.getValue());
		if(p2pLnDesiredMaxAmtArrCnd != null) {
			String lnDesiredMaxAmt = _getArrCndInqryBizProc().getArrangementConditionValue(p2pLnDesiredMaxAmtArrCnd);
			if (!StringUtils.isEmpty(lnDesiredMaxAmt)) {
				out.setLnDesiredMaxAmt(lnDesiredMaxAmt);
			}
		}

		// P2P_BIDDING_DURATION
		ArrCnd p2pBiddingDrtnArrCnd = arr.getArrCnd(PdCndEnum.P2P_BIDDING_DURATION.getValue());
		if(p2pBiddingDrtnArrCnd != null) {
			String biddingDrtn = _getArrCndInqryBizProc().getArrangementConditionValue(p2pBiddingDrtnArrCnd);
			if (!StringUtils.isEmpty(biddingDrtn)) {
				out.setBiddingTrmCnt(biddingDrtn);
			}
		}

		// P2P_PARTIAL_BIDDING_ACCEPT_YN
		ArrCnd p2pPrtlBidAcceptYnArrCnd = arr.getArrCnd(PdCndEnum.P2P_PARTIAL_BIDDING_ACCEPT_YN.getValue());
		if(p2pPrtlBidAcceptYnArrCnd != null) {
			String prtlBidAcceptYn = _getArrCndInqryBizProc().getArrangementConditionValue(p2pPrtlBidAcceptYnArrCnd);
			if (!StringUtils.isEmpty(prtlBidAcceptYn)) {
				out.setPrtlBidAcceptYn(prtlBidAcceptYn);
			}
		}

		// P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN
		ArrCnd p2pDesiredAmtExcsBidAcceptYnArrCnd = arr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN.getValue());
		if(p2pDesiredAmtExcsBidAcceptYnArrCnd != null) {
			String desiredAmtExcsBidAcceptYn = _getArrCndInqryBizProc().getArrangementConditionValue(p2pDesiredAmtExcsBidAcceptYnArrCnd);
			if (!StringUtils.isEmpty(desiredAmtExcsBidAcceptYn)) {
				out.setDesiredAmtExcsBidAcceptYn(desiredAmtExcsBidAcceptYn);
			}
		}

		// P2P_BID_WAY
		ArrCnd p2pBidWayCnd = arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue());
		if(p2pBidWayCnd != null) {
			String p2pBidWay = _getArrCndInqryBizProc().getArrangementConditionValue(p2pBidWayCnd);
			if (!StringUtils.isEmpty(p2pBidWay)) {
				out.setBiddingMthdCd(p2pBidWay);
			}
		}

		// P2P Interest Rate, P2P_INT_RT
		ArrCnd p2pIntRtArrCnd = arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
		if(p2pIntRtArrCnd != null) {
			String lnIntRt = _getArrCndInqryBizProc().getArrangementConditionValue(p2pIntRtArrCnd);
			if (!StringUtils.isEmpty(lnIntRt)) {
				out.setLnIntRt(lnIntRt);
			}
		}

		// Get the list of document for approval
		List<ArrStrctrArrDoc> arrDocList = 		arr.getDocsReceiveStatus();
		List<AplctnDocOut> lnAdtnlDocOutList = 	new ArrayList<AplctnDocOut>();

		if (arrDocList != null) {	
			for (ArrStrctrArrDoc arrDoc : arrDocList) {
				AplctnDocOut lnAdtnlDocOut = new AplctnDocOut();

				lnAdtnlDocOut.setArrDocRelCd(arrDoc.getArrDocRelCd());
				lnAdtnlDocOut.setRltdCndCd(arrDoc.getRltdCndCd());
				lnAdtnlDocOut.setRltdCndListCd(arrDoc.getRltdCndListCd());
				lnAdtnlDocOut.setRltdCndListNm(arrDoc.getRltdCndListNm());
				lnAdtnlDocOut.setDocIdListJson(arrDoc.getDocIdListJson());

				lnAdtnlDocOutList.add(lnAdtnlDocOut);
			}
		}

		out.setAdtnlDocList(lnAdtnlDocOutList);

		// Get the list of document(Uploaded & Effective)
		List<DocIssueIO> docIssueIOs = _getUploadAndEffectiveDocumentList(in.getCustId());
//		List<DocIssueIO> docIssueIOs = _getEffectiveDocumentList(arr);

		out.setEfctvDocList(docIssueIOs);

		// Customer's account number
		out.setAcctNbr(acctNbr);

		return out;
	}

//	private String _getLLoanFee(Arr arr) throws BizApplicationException {
//
//		String fee = null;
//		FeeCalculatorOut feeCalculatorOut = _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.APPLICATION, arr);
//
//		if(feeCalculatorOut != null){
//			fee = feeCalculatorOut.getFeeDcsnAmt().toString();
//		}
//
//		return fee;
//	}

	private List<DocIssueIO> _getUploadAndEffectiveDocumentList(String custId) throws BizApplicationException {

		List<DocIssueIO> docIssueIOs = new ArrayList<DocIssueIO>();
		String instCd = _getCmnContext().getInstCode();
		if(StringUtils.isEmpty(custId)) custId = _getCmnContext().getCustId();

		Cust cust = _getCustMngr().getCust(instCd, custId);

		List<CustDocRelIO> custDocRelIOs = cust.getListCustCertificateDocRelation();
		List<DocIssueIO> efctvDocList = new ArrayList<DocIssueIO>();
		List<DocIssueIO> atchmntDocList = new ArrayList<DocIssueIO>();

		if(custDocRelIOs != null && custDocRelIOs.size() > 0) {
			for(int i = 0; i < custDocRelIOs.size(); i++) {
				DocIssue docIssue = _getDocMngr().getDocIssue(custDocRelIOs.get(i).getDocIssueId());

				if(DocIssueStsEnum.ACTIVE.getValue().equals(docIssue.getDocIssue().getDocIssueStsCd())) {
					efctvDocList.add(docIssue.getDocIssue());
				} else if(DocIssueStsEnum.ATTATCHED.getValue().equals(docIssue.getDocIssue().getDocIssueStsCd())) {
					atchmntDocList.add(docIssue.getDocIssue());
				}
			}
		}

		if(efctvDocList.size() > 0 && atchmntDocList.size() > 0) {
			Set<DocIssueIO> efctvHashSet = new HashSet<DocIssueIO>();
			Set<DocIssueIO> atcmntHashSet = new HashSet<DocIssueIO>();

			for(int i = 0; i < efctvDocList.size(); i++) {
				efctvHashSet.add(efctvDocList.get(i));
			}

			for(int i = 0; i < atchmntDocList.size(); i++) {
				atcmntHashSet.add(atchmntDocList.get(i));
			}

			atcmntHashSet.addAll(efctvHashSet);
			docIssueIOs = new ArrayList<DocIssueIO>(atcmntHashSet);
		} else if(efctvDocList.size() > 0 && atchmntDocList.size() == 0) {
			docIssueIOs = efctvDocList;
		} else if(efctvDocList.size() == 0 && atchmntDocList.size() > 0) {
			docIssueIOs = atchmntDocList;
		}

		return docIssueIOs;
	}

	private List<DocIssueIO> _getEffectiveDocumentList(Arr arr) throws BizApplicationException {

		List<DocIssueIO> docIssueIOs = new ArrayList<DocIssueIO>();
		String instCd = _getCmnContext().getInstCode();
		String custId = arr.getMainCust().getCustId();

		Cust cust = _getCustMngr().getCust(instCd, custId);

		List<CustDocRelIO> custDocRelIOs = cust.getListCustCertificateDocRelation();
		List<DocIssueIO> efctvDocList = new ArrayList<DocIssueIO>();

		if(custDocRelIOs != null && custDocRelIOs.size() > 0) {
			for(int i = 0; i < custDocRelIOs.size(); i++) {
				DocIssue docIssue = _getDocMngr().getDocIssue(custDocRelIOs.get(i).getDocIssueId());

				if(DocIssueStsEnum.ACTIVE.getValue().equals(docIssue.getDocIssue().getDocIssueStsCd())) {
					efctvDocList.add(docIssue.getDocIssue());
				}
			}
		}

		if(efctvDocList.size() > 0) {
			docIssueIOs = efctvDocList;
		}

		return docIssueIOs;
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
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
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
	 * @return the custMngr
	 */
	private CustMngr _getCustMngr() {
		if (custMngr == null) {
			custMngr = (CustMngr) CbbApplicationContext.getBean(CustMngr.class, custMngr);
		}
		return custMngr;
	}

	/**
	 * @return the docMngr
	 */
	private DocMngr _getDocMngr() {
		if (docMngr == null) {
			docMngr = (DocMngr) CbbApplicationContext.getBean(DocMngr.class, docMngr);
		}
		return docMngr;
	}

	/**
	 * @return the trnsfrLng
	 */
	private TrnsfrLng _getTrnsfrLng() {
		if (trnsfrLng == null) {
			trnsfrLng = (TrnsfrLng) CbbApplicationContext.getBean(TrnsfrLng.class, trnsfrLng);
		}
		return trnsfrLng;
	}
}
