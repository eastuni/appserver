package bankware.corebanking.p2p.creditinvestigation.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.codelibrary.interfaces.dto.CmnCdCheckOut;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangementtransaction.creation.bizproc.ArrTxCrtnBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorXtnAtrbtIO;
import bankware.corebanking.core.actor.constant.CAT01;
import bankware.corebanking.core.actor.enums.ActorTpEnum;
import bankware.corebanking.core.actor.enums.ActorUnqIdNbrTpEnum;
import bankware.corebanking.core.actor.enums.AtrbtNmEnum;
import bankware.corebanking.core.actor.enums.CustGradeChoiceRsnTpEnum;
import bankware.corebanking.core.actor.enums.CustGradeKndTpEnum;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.product.productapi.interfaces.Pd;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcGetIn;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcGetOut;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcRevokeIn;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcRevokeListIn;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcRgstIn;
import bankware.corebanking.customer.change.service.dto.CustGradeChngSvcRgstListIn;
import bankware.corebanking.customer.privacy.service.dto.CustAuthInfoInqrySvcGetIn;
import bankware.corebanking.customer.privacy.service.dto.CustAuthInfoInqrySvcGetOut;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustClIdListIn;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustOvrvwIn;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustOvrvwOut;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustXtnInfoOut;
import bankware.corebanking.dto.DummyIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcGetGradeRuleIn;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcGetGradeRuleListOut;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcGetGradeRuleOut;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcGetInfoIn;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcGetInfoOut;
import bankware.corebanking.p2p.creditinvestigation.service.dto.CrdtInvstgtnSvcRegisterInfoIn;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnIn;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcGetCshflwSmltnOut;
import bankware.corebanking.p2p.simulation.service.dto.CshflwSmltnSvcRevenueOut;
import bankware.corebanking.p2plending.listreport.service.dto.LendingSmryInfoInqrySvcLendingSmryInfoIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingSmryInfoInqrySvcLendingSmryInfoOut;
import bankware.corebanking.p2ploan.enums.CrdtInvstgtnTpEnum;
import bankware.corebanking.p2ploan.enums.P2pActvtyEnum;
import bankware.corebanking.p2ploan.enums.P2pCrdbltyEnum;
import bankware.corebanking.p2ploan.enums.P2pCrdtRatingEnum;
import bankware.corebanking.p2ploan.enums.P2pLnRatingEnum;
import bankware.corebanking.p2ploan.enums.P2pObjctvtyEnum;
import bankware.corebanking.p2ploan.enums.P2pStbltyEnum;
import bankware.corebanking.p2ploan.information.service.dto.LnSmryInfoInqrySvcLnSmryInfoIn;
import bankware.corebanking.p2ploan.information.service.dto.LnSmryInfoInqrySvcLnSmryInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn;
import bankware.corebanking.p2ploan.information.service.dto.P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * This service provides credit investigation query, grade rule query,
 * credit investigation registration.
 *
 * Author	Kisu Kim
 * History
 *  2016.02.25	initial version for 3.0
 */
@BxmService("CrdtInvstgtnSvc")
@BxmCategory(logicalName = "Credit Investigation")
@CbbClassInfo(classType = { "SERVICE" })
public class CrdtInvstgtnSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrCustMngr		arrCustMngr;		// Arrangement customer manager
	private ArrMngr			arrMngr;			// Arrangement manager
	private ArrTxCrtnBizProc	arrTxCrtnBizProc;	// Arrangement transaction creation bizproc
	private Cd				cd;					// Code
	private CmnContext		cmnContext;			// Common context
	private CustMngr			custMngr;			// Customer manager

	private final String REAL_NM_AUTH_YN 	= "realNmAuthYn";
	private final String EMAIL_AUTH_YN 		= "emailAuthYn";
	private final String SMS_AUTH_YN 		= "smsAuthYn";
	private final String DELIMETER			= ": ";
	private final String CONNECT_MINIMUM_MAXIMUM_STRING		= " ~ ";

	/**
	 * 신용 조사 점수 계산.
	 * Calculate the credit investigation.
	 * 
	 * <pre>
	 * 1. 고객 식별자로 고객을 가져온다.
	 * 
	 * 1. Get the customer using customer identification.
	 * 
	 * 2. 신용 조사 점수를 계산한다.
	 * 	2.1 입력받은 연체 횟수를 사용하여 신뢰성을 계산한다.
	 * 	2.2 외부 신용 평가 점수를 사용하여 객관성을 계산한다.
	 * 	2.3 고객 정보를 사용하여 활동성을 계산한다.
	 * 			활동성 = 인증 횟수 + (대출 횟수 * 10)
	 * 	2.4 고객의 대출 정보를 사용하여 안정성을 계산한다.
	 * 			LRA = 	 월평균 ((현재 대출 금액 + 타기관 대출 금액) / 수입) %
	 * 			안정성 = MIN(truncate(1 / LRA * 10.0), 100)
	 * 	2.5 신뢰성, 객관성, 활동성을 사용하여 신용 등급을 계산한다.
	 * 			신용 등급 = 신뢰성 + 객관성 + 안정성
	 * 	2.6 신뢰성, 객관성, 활동성, 신용 등급을 사용하여 대출 등급을 계산한다.
	 * 			대출 등급 = 신뢰성 + 객관성 + 안정성 + 신용 등급
	 * 
	 * 2. Calculate the credit investigation.
	 * 	2.1 Calculate the credibility using the input values, overdue count.
	 * 	2.2 Calculate the objectivity using the external credit investigation.
	 * 	2.3 Calculate the activity using the customer's information.
	 * 			Activity = Authentication number + (Loan number * 10)
	 * 	2.4 Calculate the stability using the customer's loan information.
	 * 			LRA = 		Monthly average((Repayment amount of loan application + another loan repayment) / Income) %
	 * 			Stability = MIN(truncate(1 / LRA * 10.0), 100)
	 * 	2.5 Calculate the credit rating using credibility, objectivity, stability.
	 * 			Credit rating = Credibility + Objectivity + Activity
	 * 	2.6 Calculate the loan rating using credibility, objectivity, stability, credit rating.
	 * 			Loan rating = Credibility + Objectivity + Activity + Credit rating
	 * 
	 * 3. 출력을 조립하고 반환한다.
	 * 
	 * 3. Assemble the output & return.
	 * </pre>
	 * 
	 * @param in (required) CrdtInvstgtnSvcGetInfoIn: Customer identification, External credit rating, Arrear count
	 * @return CrdtInvstgtnSvcGetInfoOut: Calculated credit investigation
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("getCreditInvestigation")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd = "SPP3020401", srvcNm = "Get the credit investigation")
	public CrdtInvstgtnSvcGetInfoOut getCreditInvestigation(CrdtInvstgtnSvcGetInfoIn in) throws BizApplicationException {

		/**
		 * Get the customer
		 */
		Cust cust = _getCustMngr().getCust(in.getCustId());

		/**
		 * Calculate the credit investigation
		 */
		CrdtInvstgtnSvcGetInfoOut out = _calculateCreditInvestigation(in.getCustId(), in);

		/**
		 * Assemble the output & return
		 */
		return _assembleOutput(cust, out);
	}

	private CrdtInvstgtnSvcGetInfoOut _calculateCreditInvestigation(String custId, CrdtInvstgtnSvcGetInfoIn in) throws NumberFormatException, BizApplicationException {

		CrdtInvstgtnSvcGetInfoOut out = new CrdtInvstgtnSvcGetInfoOut();

		int crdbltyScore	= _calculateCredibility(in.getArrearCnt(), out);
		int objctvtyScore 	= _calculateObjectivity(in.getExtrnlCrdtRatingCd(), out);
		int actvtyScore 	= _calculateActivity(custId, out);
		BigDecimal stbltyScore 	= _calculateStability(custId, out);
		int crdtRatingScore = _calculateCreditRating(crdbltyScore, objctvtyScore, actvtyScore, out);
		_calculateLoanRating(crdtRatingScore, stbltyScore, out);

		return out;
	}

	private int _calculateCredibility(String arrearCnt, CrdtInvstgtnSvcGetInfoOut out) throws NumberFormatException, BizApplicationException {

		int crdbltyScore = P2pCrdbltyEnum.getScoreByOverdueCount(Integer.parseInt(arrearCnt));

		out.setCrdbltyScore(String.valueOf(crdbltyScore));

		return crdbltyScore;
	}

	private int _calculateObjectivity(String extrnlCrdtRating, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		int objctvtyScore = P2pObjctvtyEnum.getScoreByExternalCreditRating(extrnlCrdtRating);

		out.setObjctvtyScore(String.valueOf(objctvtyScore));

		return objctvtyScore;
	}

	private int _calculateActivity(String custId, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		// Lending information
		LendingSmryInfoInqrySvcLendingSmryInfoIn lendingSmryInfoInqrySvcLendingSmryInfoIn = new LendingSmryInfoInqrySvcLendingSmryInfoIn();
		lendingSmryInfoInqrySvcLendingSmryInfoIn.setCustId(custId);

		LendingSmryInfoInqrySvcLendingSmryInfoOut lendingSmryInfoInqrySvcLendingSmryInfoOut = CbbInternalServiceExecutor.execute("SPP4070401", lendingSmryInfoInqrySvcLendingSmryInfoIn);

		BigDecimal totInvstmntCnt = lendingSmryInfoInqrySvcLendingSmryInfoOut.getTotInvstmntCnt();
		out.setBiddingCnt(totInvstmntCnt.toString());

		// Loan Information
		LnSmryInfoInqrySvcLnSmryInfoIn lnSmryInfoInqrySvcLnSmryInfoIn = new LnSmryInfoInqrySvcLnSmryInfoIn();
		lnSmryInfoInqrySvcLnSmryInfoIn.setCustId(custId);

		LnSmryInfoInqrySvcLnSmryInfoOut lnSmryInfoInqrySvcLnSmryInfoOut = CbbInternalServiceExecutor.execute("SPP4070400", lnSmryInfoInqrySvcLnSmryInfoIn);

		BigDecimal lnAplctnCnt = lnSmryInfoInqrySvcLnSmryInfoOut.getLnAplctnCnt();
		out.setLnAplctnCnt(lnAplctnCnt.toString());

		// Customer information
		int custAuthCnt = 0;
		StringBuffer cnfrmAuthData = new StringBuffer();
		CustAuthInfoInqrySvcGetIn custAuthInfoInqrySvcGetIn = new CustAuthInfoInqrySvcGetIn(); 

		custAuthInfoInqrySvcGetIn.setCustId(custId);

		CustAuthInfoInqrySvcGetOut custAuthInfoInqrySvcGetOut = CbbInternalServiceExecutor.execute("SCU4040401", custAuthInfoInqrySvcGetIn);

		if(custAuthInfoInqrySvcGetOut.get(REAL_NM_AUTH_YN).equals(CCM01.YES)) {
			cnfrmAuthData.append(REAL_NM_AUTH_YN).append(DELIMETER).append(custAuthInfoInqrySvcGetOut.get(REAL_NM_AUTH_YN));
			custAuthCnt++;
		}
		if(custAuthInfoInqrySvcGetOut.get(EMAIL_AUTH_YN).equals(CCM01.YES)) {
			cnfrmAuthData.append(EMAIL_AUTH_YN).append(DELIMETER).append(custAuthInfoInqrySvcGetOut.get(EMAIL_AUTH_YN));
			custAuthCnt++;
		}
		if(custAuthInfoInqrySvcGetOut.get(SMS_AUTH_YN).equals(CCM01.YES)) {
			cnfrmAuthData.append(SMS_AUTH_YN).append(DELIMETER).append(custAuthInfoInqrySvcGetOut.get(SMS_AUTH_YN));
			custAuthCnt++;
		}
		out.setCnfrmAuthDataCntnt(cnfrmAuthData.toString());

		// Calculate the activity score
		int actvtyScore = (custAuthCnt * 10) + totInvstmntCnt.intValue() + (lnAplctnCnt.intValue() * 10);

		out.setActvtyScore(String.valueOf(actvtyScore));

		return actvtyScore;
	}

	private BigDecimal _calculateStability(String custId, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		CustCmphInqrySvcGetCustOvrvwOut ovrvwOut = _getIncomeAndDebt(custId);

		BigDecimal ownLnAmt = _getOwnP2pLoanAmount(custId, out);
		out.setOwnLnAmt(ownLnAmt.toString());
		BigDecimal monthlyAverageIncomeAmt = 	new BigDecimal(0);
		BigDecimal stbltyScore = 				new BigDecimal(0);
		BigDecimal othersRpymntAmt = 			new BigDecimal(0);
		out.setOthrRpymntAmt(othersRpymntAmt.toString());

		List<CustCmphInqrySvcGetCustXtnInfoOut> xtnInfoList = ovrvwOut.getXtnInfoList();

		for(int i = 0; i < xtnInfoList.size(); i++) {
			CustCmphInqrySvcGetCustXtnInfoOut xtnInfo = xtnInfoList.get(i);

			if(xtnInfo.getXtnAtrbtNm().equals(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue())) {
				monthlyAverageIncomeAmt = monthlyAverageIncomeAmt.add(StringUtils.isEmpty(xtnInfo.getXtnAtrbtCntnt()) ? BigDecimal.ZERO : new BigDecimal(xtnInfo.getXtnAtrbtCntnt()));
				out.setMonthlyAvgIncomeAmt(StringUtils.isEmpty(xtnInfo.getXtnAtrbtCntnt()) ? String.valueOf(0) : String.valueOf(xtnInfo.getXtnAtrbtCntnt()));
			}

			if(xtnInfo.getXtnAtrbtNm().equals(AtrbtNmEnum.OTHERS_REPAYMENT_AMT.getValue())) {
				othersRpymntAmt = othersRpymntAmt.add(StringUtils.isEmpty(xtnInfo.getXtnAtrbtCntnt()) ? BigDecimal.ZERO : new BigDecimal(xtnInfo.getXtnAtrbtCntnt()));
				out.setOthrRpymntAmt(StringUtils.isEmpty(xtnInfo.getXtnAtrbtCntnt()) ? String.valueOf(0) : String.valueOf(xtnInfo.getXtnAtrbtCntnt()));
			}
		}

		if(monthlyAverageIncomeAmt.compareTo(BigDecimal.ZERO) > 0) {
			BigDecimal lnRpymntAbility = ownLnAmt.add(othersRpymntAmt).divide(monthlyAverageIncomeAmt, 2, BigDecimal.ROUND_CEILING ).multiply(new BigDecimal(100));	// FIXME
			BigDecimal score = BigDecimal.ONE.divide(lnRpymntAbility.divide(new BigDecimal(100), 2, BigDecimal.ROUND_CEILING), 2, BigDecimal.ROUND_DOWN).multiply(BigDecimal.TEN);

			stbltyScore = score.compareTo(new BigDecimal(100)) > 0 ? new BigDecimal(100): score;
		}

		out.setStbltyScore(stbltyScore.toString());

		return stbltyScore;
	}

	private int _calculateCreditRating(int crdbltyScore, int objctvtyScore, int actvtyScore, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		int crdtRatingScore = crdbltyScore + objctvtyScore + actvtyScore;
		String crdtRatingGrade = P2pCrdtRatingEnum.getCreditRatingGradeByScore(crdtRatingScore);

		out.setCrdtRatingScore(String.valueOf(crdtRatingScore));
		out.setCrdtRatingGradeCd(crdtRatingGrade);

		return crdtRatingScore;
	}

	private void _calculateLoanRating(int crdtRatingScore, BigDecimal stbltyScore, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		int lnRatingScore = crdtRatingScore + stbltyScore.intValue();
		String lnRatingGrade = P2pLnRatingEnum.getLoanRatingGradeByScore(lnRatingScore);

		out.setLnRatingScore(String.valueOf(lnRatingScore));
		out.setLonRatingCd(lnRatingGrade);
	}

	private BigDecimal _getOwnP2pLoanAmount(String custId, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {

		// Get the application number && product code
		String arrId		= null;
		String aplctnNbr 	= null;
		Pd pd 				= null;

		String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
		List<ArrReal> aplyStsLnList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(custId, ArrStsEnum.APPLIED, bizDscd, null, null, null);

		if(aplyStsLnList.size() > 0) {
			arrId		= aplyStsLnList.get(0).getArrId();
			aplctnNbr 	= aplyStsLnList.get(0).getAplctnNbr();
			pd			= aplyStsLnList.get(0).getPd();
		}

		List<ArrReal> undrExmntnLnList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(custId, ArrStsEnum.UNDER_EXAMINATION, bizDscd, null, null, null);
		if(undrExmntnLnList.size() > 0) {
			arrId		= undrExmntnLnList.get(0).getArrId();
			aplctnNbr 	= undrExmntnLnList.get(0).getAplctnNbr();
			pd			= undrExmntnLnList.get(0).getPd();
		}

		if(aplctnNbr == null || pd == null) {
			throw new BizApplicationException("AAPPPE0003", null);
		}

		// Get the aplctnAmt, lnIntRt, lnAprvlTrm
		P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn = new P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn();

		p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn.setCustId(custId);

		P2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut = CbbInternalServiceExecutor.execute("SPP0130403", p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoIn);

		BigDecimal aplctnAmt 	= p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut.getAplctnAmt();
		BigDecimal lnIntRt 		= p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut.getLnIntRt();
		String lnAprvlTrm 		= p2pLnAplctnInfoInqrySvcP2pLnAplctnInfoOut.getLonAprvlTrmCnt();

		// Get the loan application repayment amount
		BigDecimal loanApplicationRepaymentAmount = _getLoanApplicationRepaymentAmount(pd, aplctnAmt, lnIntRt, lnAprvlTrm);

		out.setArrId(arrId);
		return loanApplicationRepaymentAmount;
	}

	private BigDecimal _getLoanApplicationRepaymentAmount(Pd pd, BigDecimal aplctnAmt, BigDecimal lnIntRt, String lnAprvlTrm) throws BizApplicationException {

		CshflwSmltnSvcGetCshflwSmltnIn cshflwSmltnSvcGetCshflwSmltnIn = new CshflwSmltnSvcGetCshflwSmltnIn();

		cshflwSmltnSvcGetCshflwSmltnIn.setPdCd(pd.getPdCd());
		cshflwSmltnSvcGetCshflwSmltnIn.setAplctnAmt(aplctnAmt);
		cshflwSmltnSvcGetCshflwSmltnIn.setLonAprvlTrmCnt((int) Double.parseDouble(lnAprvlTrm));	// FIXME
		cshflwSmltnSvcGetCshflwSmltnIn.setBsicIntRt(lnIntRt);

		CshflwSmltnSvcGetCshflwSmltnOut cshflwSmltnSvcGetCshflwSmltnOut = CbbInternalServiceExecutor.execute("SPP2050404", cshflwSmltnSvcGetCshflwSmltnIn);

		List<CshflwSmltnSvcRevenueOut> arrCashFlowList = cshflwSmltnSvcGetCshflwSmltnOut.getCshflwList();

		BigDecimal loanApplicationRepaymentAmount = new BigDecimal(0);

		for(int i = 0; i < arrCashFlowList.size(); i++) {
//		for(int i = 0; i < 2; i++) {
			CshflwSmltnSvcRevenueOut arrCashFlow = arrCashFlowList.get(i);

			if(1 == arrCashFlow.getRpymntCyclNbr()) {
				loanApplicationRepaymentAmount = loanApplicationRepaymentAmount.add(arrCashFlow.getRpymntSchdldAmt());
			}
		}

		return loanApplicationRepaymentAmount;
	}

	private CustCmphInqrySvcGetCustOvrvwOut _getIncomeAndDebt(String custId) throws BizApplicationException {

		CustCmphInqrySvcGetCustOvrvwIn custCmphInqrySvcGetCustOvrvwIn = new CustCmphInqrySvcGetCustOvrvwIn();

		custCmphInqrySvcGetCustOvrvwIn.setCustId(custId);

		List<CustCmphInqrySvcGetCustClIdListIn> cdIdList = new ArrayList<CustCmphInqrySvcGetCustClIdListIn>();
		CustCmphInqrySvcGetCustClIdListIn custCmphInqrySvcGetCustClIdListIn = new CustCmphInqrySvcGetCustClIdListIn();
		custCmphInqrySvcGetCustClIdListIn.setClId("IncomeAndDebt");	//FIXME
		cdIdList.add(custCmphInqrySvcGetCustClIdListIn);

		custCmphInqrySvcGetCustOvrvwIn.setClIdList(cdIdList);

		return CbbInternalServiceExecutor.execute("SCU1100401", custCmphInqrySvcGetCustOvrvwIn);
	}

	private CrdtInvstgtnSvcGetInfoOut _assembleOutput(Cust cust, CrdtInvstgtnSvcGetInfoOut out) throws BizApplicationException {
		
        String unqIdNbr = null;
        switch(ActorTpEnum.getByValue(cust.getActorTypeCode())){
        case INDIVIDUAL :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.SSN.getValue());
        	break;
        case INDIVIDUAL_BUSINESS :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.BUSINESS_REGISTER_NUM.getValue());
        	break;
        case ASSOCIATION :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.COPORATION_RGST_NUM.getValue());
        	break;
        case CORPORATION :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.BUSINESS_REGISTER_NUM.getValue());
        	break;
        case CORPORATION_BUSINESS :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.ACCOCIATION_RGST_NUM.getValue());
        	break;
        case CORRESPONDENT_BANK :
        	unqIdNbr = cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.BIC_CODE.getValue());
        	break;
        default :
        	break;
        }
        
		out.setCustNm(cust.getName());
		out.setActorUnqIdNbr(unqIdNbr);
		out.setExctnDt(_getCmnContext().getTxDate());

		return out;
	}

	/**
	 * 신용 조사 점수 등록.
	 * Register the credit investigation.
	 * 
	 * <pre>
	 * 1. 고객의 신용 조사 점수를 저장한다.
	 * 	1.1 만약 기존의 신용 조사 점수가 존재한다면, 기존의 데이터를 폐지한다.
	 * 
	 * 2. 고객의 확장 정보에 고객 등급 사유를 저장한다.
	 * 
	 * 3. 계약의 확장 정보에 P2P 대출 등급을 저장한다.
	 * 
	 * 1. Register the customer's credit investigation grade.
	 * 	1.1 If ex information exists, revoke.
	 * 
	 * 2. Register the reason of customer grade to customer extension information.
	 * 
	 * 3. Register the loan rating to arrangement extension information.
	 * </pre>
	 * 
	 * @param in
	 * @return
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("registerCreditInvestigation")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd = "SPP3020601", srvcNm = "Register the credit investigation")
	public DummyIO registerCreditInvestigation(CrdtInvstgtnSvcRegisterInfoIn in) throws BizApplicationException {

		// Validate the service
		// FIXME

		/**
		 * Register the customer's credit investigation grade
		 */
		_registerCustomerGradeInformation(in);

		/**
		 * Register the reason of customer grade to customer extension information
		 */
		_modifyCustomerExtensionInformation(in);

		/**
		 * Register the loan rating to arrangement extension information
		 */
		_registerArrangementExtensionInformation(in);

		return new DummyIO();
	}

	private void _registerCustomerGradeInformation(CrdtInvstgtnSvcRegisterInfoIn in) throws BizApplicationException {

		List<CustGradeChngSvcRevokeListIn> custGradeChngSvcRevokeListIns = new ArrayList<CustGradeChngSvcRevokeListIn>();

		// Check the ex information
		_checkCustomerGradeInformation(in.getCustId(), custGradeChngSvcRevokeListIns);

		// If ex information exists, revoke
		if(custGradeChngSvcRevokeListIns.size() > 0) {
			_revokeCustomerGradeInformation(in, custGradeChngSvcRevokeListIns);
		}

		// Register the information
		CustGradeChngSvcRgstIn custGradeChngSvcRgstIn = new CustGradeChngSvcRgstIn();
		custGradeChngSvcRgstIn.setCustId(in.getCustId());

		List<CustGradeChngSvcRgstListIn> custGradeList = new ArrayList<CustGradeChngSvcRgstListIn>();
		_setCustomerGradeList(in, custGradeList);
		custGradeChngSvcRgstIn.setCustGradeList(custGradeList);

		CbbInternalServiceExecutor.execute("SCU1190101", custGradeChngSvcRgstIn);
	}

	private void _checkCustomerGradeInformation(String custId, List<CustGradeChngSvcRevokeListIn> custGradeChngSvcRevokeListIns) throws BizApplicationException {

		for(CrdtInvstgtnTpEnum item: CrdtInvstgtnTpEnum.values()) {
			CustGradeChngSvcGetIn custGradeChngSvcGetIn = new CustGradeChngSvcGetIn();

			custGradeChngSvcGetIn.setCustId(custId);
			custGradeChngSvcGetIn.setCustGradeKndTpCd(item.getCustomerGradeKindTypeEnum().getValue());

			CustGradeChngSvcGetOut custGradeChngSvcGetOut = CbbInternalServiceExecutor.execute("SCU1190401", custGradeChngSvcGetIn);

			if(custGradeChngSvcGetOut.getCustGradeCd() != null) {	// FIXME
				CustGradeChngSvcRevokeListIn custGradeChngSvcRevokeListIn = new CustGradeChngSvcRevokeListIn();

				custGradeChngSvcRevokeListIn.setCustGradeKndTpCd(custGradeChngSvcGetOut.getCustGradeKndTpCd());
				custGradeChngSvcRevokeListIn.setEfctvStartDt(custGradeChngSvcGetOut.getEfctvStartDt());
				custGradeChngSvcRevokeListIn.setEfctvEndDt(custGradeChngSvcGetOut.getEfctvEndDt());
				custGradeChngSvcRevokeListIn.setGradeRvctnRsnTpCd("01");		// FIXME
				custGradeChngSvcRevokeListIn.setGradeRvctnRsnCntnt("");			// FIXME
				custGradeChngSvcRevokeListIn.setRvctnDeptId(_getCmnContext().getDeptId());
				custGradeChngSvcRevokeListIn.setRvctnStaffId(_getCmnContext().getStaffId());

				custGradeChngSvcRevokeListIns.add(custGradeChngSvcRevokeListIn);
			}
		}
	}

	private void _revokeCustomerGradeInformation(CrdtInvstgtnSvcRegisterInfoIn in, List<CustGradeChngSvcRevokeListIn> custGradeChngSvcRevokeListIns) throws BizApplicationException {

		CustGradeChngSvcRevokeIn custGradeChngSvcRevokeIn = new CustGradeChngSvcRevokeIn();

		custGradeChngSvcRevokeIn.setCustId(in.getCustId());
		custGradeChngSvcRevokeIn.setCustGradeList(custGradeChngSvcRevokeListIns);

		CbbInternalServiceExecutor.execute("SCU1190201", custGradeChngSvcRevokeIn);
	}

	private void _setCustomerGradeList(CrdtInvstgtnSvcRegisterInfoIn in, List<CustGradeChngSvcRgstListIn> custGradeList) throws BizApplicationException {

		// Credibility, 	P2P_CREDIBILITY
		_setCustomerGrade(CustGradeKndTpEnum.P2P_CREDIBILITY.getValue(), in.getCrdbltyScore(), custGradeList);

		// Objectivity,		P2P_OBJECTIVITY
		_setCustomerGrade(CustGradeKndTpEnum.P2P_OBJECTIVITY.getValue(), in.getObjctvtyScore(), custGradeList);

		// Activity, 		P2P_ACTIVITY
		_setCustomerGrade(CustGradeKndTpEnum.P2P_ACTIVITY.getValue(), in.getActvtyScore(), custGradeList);

		// Stability,		P2P_STABILITY
		_setCustomerGrade(CustGradeKndTpEnum.P2P_STABILITY.getValue(), in.getStbltyScore().split("\\.")[0], custGradeList);	// FIXME

		// Credit rating, 	P2P_CREDIT_RATING
		_setCustomerGrade(CustGradeKndTpEnum.P2P_CREDIT_RATING.getValue(), in.getCrdtRatingGradeCd(), custGradeList);

		// Loan Rating,		P2P_LOAN_RATING
		_setCustomerGrade(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue(), in.getLonRatingCd(), custGradeList);
	}

	private void _setCustomerGrade(String custGradeKndTpCd, String custGradeCd, List<CustGradeChngSvcRgstListIn> custGradeList) throws BizApplicationException {

		CustGradeChngSvcRgstListIn custGradeChngSvcRgstListIn = new CustGradeChngSvcRgstListIn();

		custGradeChngSvcRgstListIn.setCustGradeKndTpCd(custGradeKndTpCd);
		custGradeChngSvcRgstListIn.setEfctvStartDt(_getCmnContext().getTxDate());
		custGradeChngSvcRgstListIn.setCustGradeCd(custGradeCd);
		custGradeChngSvcRgstListIn.setGradeChoicRsnTpCd(CustGradeChoiceRsnTpEnum.NA.getValue());	// FIXME
		custGradeChngSvcRgstListIn.setGradeChoicRsnCntnt("");										// FIXME
		custGradeChngSvcRgstListIn.setRgstrnDeptId(_getCmnContext().getDeptId());
		custGradeChngSvcRgstListIn.setRgstrnStaffId(_getCmnContext().getStaffId());

		custGradeList.add(custGradeChngSvcRgstListIn);
	}

	private void _modifyCustomerExtensionInformation(CrdtInvstgtnSvcRegisterInfoIn in) throws BizApplicationException {

		Cust cust = _getCustMngr().getCust(in.getCustId());

		List<ActorXtnAtrbtIO> actorXtnAtrbtIOList = new ArrayList<ActorXtnAtrbtIO>();

		// Count of arrears,							arrearCnt
		_setCustomerExtensionInformation(AtrbtNmEnum.ARREAR_CNT.getValue(), in.getArrearCnt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// External credit rating,						extrnlCrdtRating
		_setCustomerExtensionInformation(AtrbtNmEnum.EXTRNL_CRDT_RATING.getValue(), in.getExtrnlCrdtRatingCd(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Authentification,							custInfoAuthYn
//		_setCustomerExtensionInformation("custInfoAuthYn", in.getCnfrmAuthData(), actorXtnAtrbtIOList);	
		_setCustomerExtensionInformation(AtrbtNmEnum.CUST_INFO_AUTH_YN.getValue(), CCM01.NO, actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Bidding count,								biddingCnt
		_setCustomerExtensionInformation(AtrbtNmEnum.BIDDING_CNT.getValue(), in.getBiddingCnt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Loan application count,						lnAplctnCnt
		_setCustomerExtensionInformation(AtrbtNmEnum.LN_APLCTN_CNT.getValue(), in.getLnAplctnCnt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Repayment amount of loan application(Own),	monthlyAverageLnRpymntAmt
		_setCustomerExtensionInformation(AtrbtNmEnum.MONTHLY_AVERAGE_LN_RPYMNT_AMT.getValue(), in.getOwnLnAmt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Another loan repayment,						monthlyOthrLnRpymntAmt
		_setCustomerExtensionInformation(AtrbtNmEnum.MONTHLY_OTHR_LN_RPYMNT_AMT.getValue(), in.getOthrRpymntAmt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_CUST);

		// Income,										monthlyAverageIncome
		_setCustomerExtensionInformation(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue(), in.getMonthlyAvgIncomeAmt(), actorXtnAtrbtIOList, CAT01.ACTOR_DS_ACTOR);

		cust.modifyListExtendedAttribute(actorXtnAtrbtIOList);
	}

	private void _registerArrangementExtensionInformation(CrdtInvstgtnSvcRegisterInfoIn in) throws BizApplicationException {

		Arr arr 					= _getArrMngr().getArr(in.getArrId());
		ArrTx arrTx 				= _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr);
		String lnRatingGrade 		= in.getLonRatingCd();
		String changedLnRatingGrade = null;
		final String CD_NBR			= "A0299";

		List<CmnCdCheckOut> cdList = _getCd().getListCode(CD_NBR);

		for(int i = 0; i < cdList.size(); i++) {
			CmnCdCheckOut cd = cdList.get(i);

			if(cd.getCdNm().equals(lnRatingGrade)) {
				changedLnRatingGrade = cd.getCd();
			}
		}

		arr.saveArrExtendAttribute(ArrXtnInfoEnum.P2P_LOAN_RATING_CODE, changedLnRatingGrade, _getCmnContext().getTxDate(), arrTx.getTxSeqNbr());
	}

	private void _setCustomerExtensionInformation(String xtnAtrbtNm, String xtnAtrbtCntnt, List<ActorXtnAtrbtIO> actorXtnAtrbtIOList, String atrbtTp) {

		ActorXtnAtrbtIO actorXtnAtrbtIO = new ActorXtnAtrbtIO();

		actorXtnAtrbtIO.setDelYn(CCM01.NO);
		actorXtnAtrbtIO.setXtnAtrbtNm(xtnAtrbtNm);
		actorXtnAtrbtIO.setXtnAtrbtCntnt(xtnAtrbtCntnt);
		actorXtnAtrbtIO.setActorDscd(atrbtTp);

		actorXtnAtrbtIOList.add(actorXtnAtrbtIO);
	}

	/**
	 * 등급 기준 조회.
	 * Get the grade rule.
	 * 
	 * <pre>
	 * 1. 입력받은 신용 조사 종류에 따른 테이블을 조회한다.
	 * 
	 * 2. Inquiry the table as input credit investigation type. 
	 * 
	 * 2. 출력을 조립하고 반환한다.
	 * 
	 * 2. Assemble the output & return.
	 * </pre>
	 * 
	 * @param in (required) CrdtInvstgtnSvcGetGradeRuleIn: Credit investigation type
	 * @return CrdtInvstgtnSvcGetGradeRuleListOut: Credit investigation table
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("getGradeRule")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd = "SPP3020402", srvcNm = "Get the grade rule")
	public CrdtInvstgtnSvcGetGradeRuleListOut getGradeRule(CrdtInvstgtnSvcGetGradeRuleIn in) throws BizApplicationException {

		String crdtInvstgtnTp = in.getCrdtInvstgtnTpCd();
		CrdtInvstgtnSvcGetGradeRuleListOut out = new CrdtInvstgtnSvcGetGradeRuleListOut();
		List<CrdtInvstgtnSvcGetGradeRuleOut> ruleOuts = new ArrayList<CrdtInvstgtnSvcGetGradeRuleOut>();

		if(CrdtInvstgtnTpEnum.CREDIBILITY.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pCrdbltyEnum item: P2pCrdbltyEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setRuleCntnt(String.valueOf(item.getOverdueCount()));
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getScore()));
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		} else if(CrdtInvstgtnTpEnum.OBJECTIVITY.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pObjctvtyEnum item: P2pObjctvtyEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setRuleCntnt(item.getExternalCreditRating());
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getScore()));
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		} else if(CrdtInvstgtnTpEnum.ACTIVITY.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pActvtyEnum item: P2pActvtyEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getMinimumScore()) + CONNECT_MINIMUM_MAXIMUM_STRING + String.valueOf(item.getMaximumScore()));
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		} else if(CrdtInvstgtnTpEnum.STABILITY.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pStbltyEnum item: P2pStbltyEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getMinimumScore()) + CONNECT_MINIMUM_MAXIMUM_STRING + String.valueOf(item.getMaximumScore()));
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		} else if(CrdtInvstgtnTpEnum.CREDIT_RATING.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pCrdtRatingEnum item: P2pCrdtRatingEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getMinimumScore()) + CONNECT_MINIMUM_MAXIMUM_STRING + String.valueOf(item.getMaximumScore()));
				crdtInvstgtnSvcGetGradeRuleOut.setLmtAmt(item.getLimit());
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		} else if(CrdtInvstgtnTpEnum.LOAN_RATION.getValue().equals(in.getCrdtInvstgtnTpCd())) {
			out.setCrdtInvstgtnTpCd(crdtInvstgtnTp);

			for(P2pLnRatingEnum item: P2pLnRatingEnum.values()) {
				CrdtInvstgtnSvcGetGradeRuleOut crdtInvstgtnSvcGetGradeRuleOut = new CrdtInvstgtnSvcGetGradeRuleOut();
				crdtInvstgtnSvcGetGradeRuleOut.setGrade(item.getGrade());
				crdtInvstgtnSvcGetGradeRuleOut.setScore(String.valueOf(item.getMinimumScore()) + CONNECT_MINIMUM_MAXIMUM_STRING + String.valueOf(item.getMaximumScore()));
				crdtInvstgtnSvcGetGradeRuleOut.setLnAblYn(item.getLoanAble() == true ? CCM01.YES: CCM01.NO);
				crdtInvstgtnSvcGetGradeRuleOut.setBsicIntRt(String.valueOf(item.getMinimumInterestRate()) + CONNECT_MINIMUM_MAXIMUM_STRING + item.getMaximumInterestRate());
				ruleOuts.add(crdtInvstgtnSvcGetGradeRuleOut);
			}
		}

		out.setScoreRuleList(ruleOuts);
		return out;
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
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
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
	 * @return the cd
	 */
	private Cd _getCd() {
		if (cd == null) {
			cd = (Cd) CbbApplicationContext.getBean(Cd.class, cd);
		}
		return cd;
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
}
