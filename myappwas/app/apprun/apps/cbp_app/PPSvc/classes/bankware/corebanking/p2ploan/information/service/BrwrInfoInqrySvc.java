package bankware.corebanking.p2ploan.information.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.actor.interfaces.Actor;
import bankware.corebanking.actor.actor.interfaces.ActorMngr;
import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorActorRelIO;
import bankware.corebanking.core.actor.enums.ActorActorRelTpEnum;
import bankware.corebanking.core.actor.enums.ActorNmTpEnum;
import bankware.corebanking.core.actor.enums.ActorTpEnum;
import bankware.corebanking.core.actor.enums.AtrbtNmEnum;
import bankware.corebanking.core.actor.enums.CustGradeKndTpEnum;
import bankware.corebanking.customer.inquiry.bizproc.CustInqryBizProc;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustGradeOut;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustGradeOvrvwIn;
import bankware.corebanking.customer.query.service.dto.CustCmphInqrySvcGetCustGradeOvrvwOut;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.information.service.dto.BrwrInfoInqrySvcGetBrwrInfoIn;
import bankware.corebanking.p2ploan.information.service.dto.BrwrInfoInqrySvcGetBrwrInfoOut;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 차주에 대한 정보를 조회한다.
 * This service provides a borrower information inquiry.
 *
 * Author	Kisu Kim
 * History
 *  2015.02.12	initial version for 2.0
 */
@BxmService("BrwrInfoInqrySvc")
@BxmCategory(logicalName = "Borrower Information Inquiry Service")
public class BrwrInfoInqrySvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private Cd				cd;					// Code
	private ArrInqryBizProc	arrInqryBizProc;	// Arrangement inquiry bizproc
	private CustInqryBizProc	custInqryBizProc;	// Customer inquiry bizproc
	private ActorMngr actorMngr;
	
	/**
	 * Search borrower information 
	 * 차주정보를 조회한다
	 * 
	 * <pre>
	 * 1. Get Arrangament By Arrangement Identification
	 * 
	 * 2. Get Cust By Customer Identification
	 * 
	 * 3. Assemble the borrower information & return
	 * </pre>
	 * 
     * @param  in (required) BrwrInfoInqrySvcGetBrwrInfoIn : Arrangement id, Customer id
     * @return BrwrInfoInqrySvcGetBrwrInfoOut Borrower information
     * @throws BizApplicationException 
	 */
	@BxmServiceOperation("getBorrowerInformation")
	@BxmCategory(logicalName = "Borrower Information Inquiry")
	@CbbSrvcInfo(srvcCd = "SPP2030401", srvcNm = "Borrower Information Inquiry")
	@TransactionalOperation
	public BrwrInfoInqrySvcGetBrwrInfoOut getBorrowerInformation(BrwrInfoInqrySvcGetBrwrInfoIn in) throws BizApplicationException {

		/**
		 * Get the arrangement
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Get the customer
		 */
		Cust cust = _getCustInqryBizProc().getCustomerByCustomerIdentification(in.getCustId());

		/**
		 * Assemble the borrower information & return
		 */
		return _assembleBorrowerInformation(arr, cust, in);
	}

	private BrwrInfoInqrySvcGetBrwrInfoOut _assembleBorrowerInformation(Arr arr, Cust cust, BrwrInfoInqrySvcGetBrwrInfoIn in) throws BizApplicationException {

		BrwrInfoInqrySvcGetBrwrInfoOut out = new BrwrInfoInqrySvcGetBrwrInfoOut();
		String custId = in.getCustId();

		// Borrowers details
		out.setCustId(cust.getLoginIdNbr());
		out.setCustNm(cust.getName());
		out.setAge(cust.getAge());

		String lnPurposeCd = arr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
		if( lnPurposeCd != null && !StringUtils.isEmpty(lnPurposeCd)) {
			out.setLnPurposeCd(lnPurposeCd);
			out.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
		}

		if(cust.getExtendedAttributeValue(AtrbtNmEnum.CUST_INFO_AUTH_YN.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttributeValue(AtrbtNmEnum.CUST_INFO_AUTH_YN.getValue()))) {
			out.setCnfrmAuthDataCntnt(cust.getExtendedAttributeValue(AtrbtNmEnum.CUST_INFO_AUTH_YN.getValue()));
		}

		// Details of purpose
		out.setLnRsnCntnt(arr.getExtendAttribute(ArrXtnInfoEnum.LOAN_REASON_CONTENT));

		// Reviewer opinion
		out.setExmntnCmntCntnt(arr.getExtendAttribute(ArrXtnInfoEnum.EXMINATION_COMMENTS));

		// List of customer grade 
		_setCustomerGradeList(arr, custId, out);

		// Business information
		if(ActorTpEnum.INDIVIDUAL_BUSINESS.getValue().equals(cust.getActorTypeCode())) {
			
			out.setCmpnyNm(cust.getName(ActorNmTpEnum.NAME.getValue()).getActorNm());
			List<ActorActorRelIO> actorRelList = cust.getListActorActorAllRelation();
			for(ActorActorRelIO target : actorRelList){
				if(target.getAtatRelCd().equals(ActorActorRelTpEnum.COPORATION_REPRESENTATIVE.getValue())){
					Actor actor = _getActorMngr().getActor(target.getRltdActorId());
					out.setRprsntvNm(actor.getName(ActorNmTpEnum.NAME.getValue()).getActorNm());
				}
			}
			
			if(cust.getExtendedAttribute(AtrbtNmEnum.BIZ_TP_CD.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttribute(AtrbtNmEnum.BIZ_TP_CD.getValue()).getXtnAtrbtCntnt())) {
				out.setBizTpNm(cust.getExtendedAttribute(AtrbtNmEnum.BIZ_TP_CD.getValue()).getXtnAtrbtCntnt());
			}
			
			//out.setRprsntnUnqIdNbr(cust.getUniqueIdNbr(ActorUtil.getMainUniqueIdNbrTypeCode(cust.getActorTypeCode())));
			//out.setCorpScale(ActorTpEnum.CORPORATION_BUSINESS.getDescription());
			if(cust.getExtendedAttribute(AtrbtNmEnum.ESTBLSHMNT_DT.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttribute(AtrbtNmEnum.ESTBLSHMNT_DT.getValue()).getXtnAtrbtCntnt())) {
				out.setEstblshmntDt(cust.getExtendedAttribute(AtrbtNmEnum.ESTBLSHMNT_DT.getValue()).getXtnAtrbtCntnt());
			}
			if(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_CAPITAL_AMT.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_CAPITAL_AMT.getValue()).getXtnAtrbtCntnt())) {
				out.setCapitalAmt(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_CAPITAL_AMT.getValue()).getXtnAtrbtCntnt());
			}
			if(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_SALES_FGRS.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_SALES_FGRS.getValue()).getXtnAtrbtCntnt())) {
				out.setSaleAmt(cust.getExtendedAttribute(AtrbtNmEnum.CMPNY_SALES_FGRS.getValue()).getXtnAtrbtCntnt());
			}
			if(cust.getExtendedAttribute(AtrbtNmEnum.SMLTN_SALES_FGRS.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttribute(AtrbtNmEnum.SMLTN_SALES_FGRS.getValue()).getXtnAtrbtCntnt())) {
				out.setSmltnSaleAmt(cust.getExtendedAttribute(AtrbtNmEnum.SMLTN_SALES_FGRS.getValue()).getXtnAtrbtCntnt());
			}
			
//			out.setAddrCntnt(cust.getAddrInfo(CntctPntLctnTpEnum.OFFICE.getValue(), CntctMthdTpEnum.MAIL.getValue()));
//			out.setAddrCntnt(cust.getAddrInfo(CntctPntLctnTpEnum.OFFICE.getValue(), CntctMthdTpEnum.PHONE.getValue()));
			
			//_setBusinessInformation(cust, out);
			out.setActorTpCd(ActorTpEnum.INDIVIDUAL_BUSINESS.getValue());
		}
		
		// Loan repayment ability
		BigDecimal ownLnAmt = 					new BigDecimal(0);
		BigDecimal othersRpymntAmt = 			new BigDecimal(0);
		BigDecimal monthlyAverageIncomeAmt = 	new BigDecimal(0);

		if(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue()))) {
			out.setMonthlyAvgIncomeAmt(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue()));
			monthlyAverageIncomeAmt = new BigDecimal(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_INCOMEA_MT.getValue()));
		}
		if(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_LN_RPYMNT_AMT.getValue()) != null && !StringUtils.isEmpty(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_LN_RPYMNT_AMT.getValue()))) {
			out.setOwnLnAmt(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_LN_RPYMNT_AMT.getValue()));
			ownLnAmt = new BigDecimal(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_AVERAGE_LN_RPYMNT_AMT.getValue()));
		}
		if(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_OTHR_LN_RPYMNT_AMT.getValue()) != null &&  !StringUtils.isEmpty(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_OTHR_LN_RPYMNT_AMT.getValue()))) {
			out.setOthrRpymntAmt(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_OTHR_LN_RPYMNT_AMT.getValue()));
			othersRpymntAmt = new BigDecimal(cust.getExtendedAttributeValue(AtrbtNmEnum.MONTHLY_OTHR_LN_RPYMNT_AMT.getValue()));
		}

		if(BigDecimal.ZERO.compareTo(monthlyAverageIncomeAmt)==0) {
			out.setLonRpyblAmt(BigDecimal.ZERO);
		} else {
			BigDecimal lnRpymntAbility = ownLnAmt.add(othersRpymntAmt).divide(monthlyAverageIncomeAmt, 2, BigDecimal.ROUND_CEILING).multiply(new BigDecimal(100));
			out.setLonRpyblAmt(lnRpymntAbility);
		}

		return out;
	}

	private void _setCustomerGradeList(Arr arr, String custId, BrwrInfoInqrySvcGetBrwrInfoOut out) throws BizApplicationException {

		// Get the list of customer grade
		CustCmphInqrySvcGetCustGradeOvrvwOut custCmphInqrySvcGetCustGradeOvrvwOut = _getCustomerGradeList(custId);
		List<CustCmphInqrySvcGetCustGradeOut> custGradeList = custCmphInqrySvcGetCustGradeOvrvwOut.getGradeList();

		int crdbltyScore 	= 0;
		int objctvtyScore 	= 0;
		int actvtyScore 	= 0;
		int stbltyScore 	= 0;
		int crdtScore 		= 0;
		int lnScore 		= 0;

		for(int i = 0; i < custGradeList.size(); i++) {
			CustCmphInqrySvcGetCustGradeOut custGrade = custGradeList.get(i);

			if(CustGradeKndTpEnum.P2P_CREDIBILITY.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				crdbltyScore = Integer.valueOf(custGrade.getCustGradeCdCntnt());
			} else if(CustGradeKndTpEnum.P2P_OBJECTIVITY.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				objctvtyScore = Integer.valueOf(custGrade.getCustGradeCdCntnt());
			} else if(CustGradeKndTpEnum.P2P_ACTIVITY.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				actvtyScore = Integer.valueOf(custGrade.getCustGradeCdCntnt());
			} else if(CustGradeKndTpEnum.P2P_STABILITY.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				stbltyScore = Integer.valueOf(custGrade.getCustGradeCdCntnt());
			} else if(CustGradeKndTpEnum.P2P_CREDIT_RATING.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				out.setCrdtRatingGradeCd(custGrade.getCustGradeCdCntnt());
			} else if(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue().equals(custGrade.getCustGradeKndTpCd())) {
				out.setLonRatingCd(custGrade.getCustGradeCdCntnt());
			}
		}

		out.setCrdbltyScore(crdbltyScore);
		out.setObjctvtyScore(objctvtyScore);
		out.setActvtyScore(actvtyScore);
		out.setStbltyScore(stbltyScore);
		crdtScore = crdbltyScore + objctvtyScore + actvtyScore;
		out.setCrdtRatingScore(crdtScore);
		lnScore = crdtScore + stbltyScore;
		out.setLnRatingScore(lnScore);
	}

	private CustCmphInqrySvcGetCustGradeOvrvwOut _getCustomerGradeList(String custId) throws BizApplicationException {

		CustCmphInqrySvcGetCustGradeOvrvwIn custCmphInqrySvcGetCustGradeOvrvwIn = new CustCmphInqrySvcGetCustGradeOvrvwIn();

		custCmphInqrySvcGetCustGradeOvrvwIn.setCustId(custId);

		return CbbInternalServiceExecutor.execute("SCU1100402", custCmphInqrySvcGetCustGradeOvrvwIn);
	}

	/*
	private void _setBusinessInformation(Cust cust, BrwrInfoInqrySvcGetBrwrInfoOut out) throws BizApplicationException {
		
		
		
		BizCorpInqrySvcGetBizNumIn bizCorpInqrySvcGetBizNumIn = new BizCorpInqrySvcGetBizNumIn();
        
		bizCorpInqrySvcGetBizNumIn.setBizNbr(cust.getUniqueIdNbr(ActorUnqIdNbrTpEnum.BUSINESS_REGISTER_NUM.getValue()));

		BizCorpInqrySvcGetBizNumOut bizCorpInqrySvcGetBizNumOut = CbbInternalServiceExecutor.execute("SCU4020401", bizCorpInqrySvcGetBizNumIn);
		
		out.setCmpnyNm(bizCorpInqrySvcGetBizNumOut.getCmpnyNm());
		out.setRprsntvNm(bizCorpInqrySvcGetBizNumOut.getRprsntnBzmanNm());
		out.setBizTpNm(bizCorpInqrySvcGetBizNumOut.getBizTpNm());
		//out.setCorpScale(bizCorpInqrySvcGetBizNumOut.getCorpScale());
		out.setEstblshmntDt(bizCorpInqrySvcGetBizNumOut.getEstblshmntDt());
		out.setCapitalAmt(bizCorpInqrySvcGetBizNumOut.getCapitalAmt());
		out.setSaleAmt(bizCorpInqrySvcGetBizNumOut.getSaleAmt());
		out.setSmltnSaleAmt(bizCorpInqrySvcGetBizNumOut.getSmltnSaleAmt());
	}
	*/

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
	 * @return the custInqryBizProc
	 */
	private CustInqryBizProc _getCustInqryBizProc() {
		if (custInqryBizProc == null) {
			custInqryBizProc = (CustInqryBizProc) CbbApplicationContext.getBean(
					CustInqryBizProc.class, custInqryBizProc);
		}
		return custInqryBizProc;
	}
	
	/**
	 * @return the actorMngr
	 */
	private ActorMngr _getActorMngr() {
		if (actorMngr == null) {
			actorMngr = (ActorMngr) CbbApplicationContext.getBean(ActorMngr.class, actorMngr);
		}
		return actorMngr;
	}
}
