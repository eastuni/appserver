package bankware.corebanking.p2plending.listreport.service;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.enums.CustGradeKndTpEnum;
import bankware.corebanking.core.applicationcommon.commondata.interfaces.dto.DateMngrCalDayHmsOut;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.listreport.service.dto.LendingDtlInqrySvcIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingDtlInqrySvcInvstrBiddingRsltIn;
import bankware.corebanking.p2plending.listreport.service.dto.LendingDtlInqrySvcInvstrBiddingRsltOut;
import bankware.corebanking.p2plending.listreport.service.dto.LendingDtlInqrySvcOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;

/**
 * 이 서비스는 P2P투자상세정보를 조회한다.
 * This service allows to inquire P2P lending Detail information
 *
 * Author	Hokeun Lee
 * History
 *  2016.02.04	initial version for 3.0
 */
@BxmService("LendingDtlInqrySvc")
@CbbClassInfo(classType={"SERVICE"})
@BxmCategory(logicalName = "Lending Detail Inquiry", description = "Lendint Detail Inquiry")
public class LendingDtlInqrySvc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

	private Cd					cd;					// Code
	private ArrBalMngr			arrBalMngr;			// Arrangement balance manager
	private CmnContext    	    cmnContext; 		// Common context
	private DateCalculator	   	dateCalculator;		// Date calculator
	private ArrCndInqryBizProc	arrCndInqryBizProc;	// Arrangement condition inquiry bizproc
	private ArrInqryBizProc		arrInqryBizProc;	// Arrangement inquiry bizproc

	/**
     * 투자 계약 식별자에 해당하는 투자상세정보를 조회한다.
     * Search arrangement information by investment arrangement Id.
	 * <pre>
	 * flow description
	 * 
	 * 1. check default value
	 * 
	 * 2. Get Investment Detail Information
	 *    2.1 Get Investment arrangement  information
	 * 
	 * 3. Assemble output data
	 *  
	 * </pre>
	 * @param in (required) LendingDtlInqrySvcIn: Arrangement identification
	 * @return LendingDtlInqrySvcOut Detail investment information
	 * @throws BizApplicationException
	 */
    @CbbSrvcInfo(srvcCd="SPP2050403", srvcNm="Lending Detail Inquiry", srvcAbrvtnNm="LendingDtlInqry" )
    @BxmCategory(logicalName = "Lending Detail Inquiry")
    @BxmServiceOperation("getLendingDetail")
    public LendingDtlInqrySvcOut getLendingDetail(LendingDtlInqrySvcIn in) throws BizApplicationException {

    	/**
    	 * Get the arrangement
    	 */
    	Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

    	/**
    	 * Get Lending Detail Information
    	 */
    	return _getLendingDetailInfo(arr);
    }

    private LendingDtlInqrySvcOut _getLendingDetailInfo(Arr arr) throws BizApplicationException {

    	LendingDtlInqrySvcOut lendingDtlInqrySvcOut = new LendingDtlInqrySvcOut();

    	ArrReal mthrArr = arr.getMthrArr();

    	String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
    	String lnPurposeCd = mthrArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
		String p2pInvstmntRatingCd = mthrArr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
		String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));		
    	BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

    	ArrBal arrBal = _getArrBalMngr().getArrBal((ArrReal) arr, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
    	ArrBal arrProfitBal = _getArrBalMngr().getArrBal((ArrReal) arr, AmtTpEnum.DVDND_INCOME.getValue(), BalTpEnum.TOT_RETURN_AMOUNT.getValue(), crncyCd);

    	lendingDtlInqrySvcOut.setArrId(arr.getArrId());
    	lendingDtlInqrySvcOut.setArrStsCd(arr.getArrSts().getValue());
    	lendingDtlInqrySvcOut.setPrgrsStsCd(_getCd().getCode("50000", arr.getArrSts().getValue()));
    	lendingDtlInqrySvcOut.setCustId(mthrArr.getMainCust().getCustId());
    	lendingDtlInqrySvcOut.setCustNm(mthrArr.getMainCust().getName());
    	lendingDtlInqrySvcOut.setLoinIdNbr(mthrArr.getMainCust().getLoginIdNbr());
    	lendingDtlInqrySvcOut.setCustGradeKndTpCd(mthrArr.getMainCust().getCustGradeCode(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue()));
    	lendingDtlInqrySvcOut.setAplctnDt(mthrArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());

    	if(lnPurposeCd != null && !lnPurposeCd.isEmpty()) {
	    	lendingDtlInqrySvcOut.setLnPurposeCd(lnPurposeCd);
	    	lendingDtlInqrySvcOut.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
    	}

    	lendingDtlInqrySvcOut.setPdCd(mthrArr.getPdCd());
    	lendingDtlInqrySvcOut.setPdNm(mthrArr.getPd().getPdNm());

    	if(p2pInvstmntRatingCd != null && !p2pInvstmntRatingCd.isEmpty()) {
	    	lendingDtlInqrySvcOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
	    	lendingDtlInqrySvcOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
    	}

    	if(rpymntWayCd != null && !rpymntWayCd.isEmpty()) {
	    	lendingDtlInqrySvcOut.setRpymntWayCd(rpymntWayCd);
	    	lendingDtlInqrySvcOut.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
    	}

    	lendingDtlInqrySvcOut.setLonAprvlTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));
    	lendingDtlInqrySvcOut.setIntRt(((ArrCndInt) mthrArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
    	lendingDtlInqrySvcOut.setCrncyCd(_getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.CURRENCY.getValue())));
    	lendingDtlInqrySvcOut.setExctnDt(mthrArr.getArrOpnDt());
    	lendingDtlInqrySvcOut.setArrMtrtyDt(mthrArr.getArrMtrtyDt());
    	lendingDtlInqrySvcOut.setInvstmntAmt(cntrtAmt);
    	lendingDtlInqrySvcOut.setInvstmntRt(((ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
    	lendingDtlInqrySvcOut.setInvstmntDt(arr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
    	lendingDtlInqrySvcOut.setArrBal(arrBal.getLastBal());
    	lendingDtlInqrySvcOut.setInvstmntProfitAmt(arrProfitBal.getLastBal());
    	lendingDtlInqrySvcOut.setRtrnOnInvstmntRt(arrProfitBal.getLastBal().divide(cntrtAmt, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100)));

    	return lendingDtlInqrySvcOut;
    }

	/**
     * 투자 계약 식별자에 해당하는 입찰 상세 정보와 투자정보를 조회한다.
     * Search arrangement information by investment arrangement Id.
	 * <pre>
	 * flow description
	 * 
	 * 1. check default value
	 * 
	 * 2. Get arrangement Detail Information
	 * 
	 * 3. Assemble output data
	 *  
	 * </pre>
	 * @param in (required) LendingDtlInqrySvcInvstrBiddingRsltIn: Mother arrangement identification, Arrangement identification, Customer identification, Inquiry start & end date
	 * @return LendingDtlInqrySvcInvstrBiddingRsltOut Detail investment information & Detail Bidding information
	 * @throws BizApplicationException
	 */
    @CbbSrvcInfo(srvcCd="SPP8050400", srvcNm="Investor Bidding Result Inquiry", srvcAbrvtnNm="InvstrBiddingResult" )
    @BxmCategory(logicalName = "Investor Bidding Result Inquiry")
    @BxmServiceOperation("getInvstrBiddingResult")
    public LendingDtlInqrySvcInvstrBiddingRsltOut getInvstrBiddingResult(LendingDtlInqrySvcInvstrBiddingRsltIn in) throws BizApplicationException {

    	/**
    	 * Validate the input value
    	 */
    	_validateInput(in);

    	/**
    	 * Get the arrangement
    	 */
    	Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

    	/**
    	 * Get the detail investment information & detail Bidding information
    	 */
    	return _getInvestmentBiddingResult(arr);
    }

    private void _validateInput(LendingDtlInqrySvcInvstrBiddingRsltIn in) throws BizApplicationException {

    	if(in.getCustId() == null || in.getCustId().isEmpty()) {
    		in.setCustId(_getCmnContext().getCustId());
    	}

    	if(in.getInqryStartDt() == null || in.getInqryStartDt().isEmpty()) {
    		in.setInqryStartDt(CCM01.MIN_DATE);
    	}

    	if(in.getInqryEndDt() == null || in.getInqryEndDt().isEmpty()) {
    		in.setInqryEndDt(CCM01.MAX_DATE);
    	}
    }

    private LendingDtlInqrySvcInvstrBiddingRsltOut _getInvestmentBiddingResult(Arr arr) throws BizApplicationException {

    	LendingDtlInqrySvcInvstrBiddingRsltOut out = new LendingDtlInqrySvcInvstrBiddingRsltOut();

    	ArrReal mthrArr = arr.getMthrArr();

    	String lnPurposeCd = mthrArr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
		String p2pInvstmntRatingCd = mthrArr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
		String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
		String biddingMthd = _getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));

		//입찰마감일시
		String biddingClsgTmstmp = mthrArr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP);
		out.setBiddingClsgTmstmp(biddingClsgTmstmp);

		String startTmstmp = _getCmnContext().getTxDate()+_getCmnContext().getTxHhmmss(); // 현재시간
		if (biddingClsgTmstmp != null && startTmstmp.compareTo(biddingClsgTmstmp) < 0) {
			//잔여입찰시간
			DateMngrCalDayHmsOut dateMngrCalDayHMSOut = _getDateCalculator().calculateDateByDayHourMinuteSecond(biddingClsgTmstmp);
			String residualBiddingTm = dateMngrCalDayHMSOut.getDay()+"일"+dateMngrCalDayHMSOut.getHr()+"시간"+dateMngrCalDayHMSOut.getMnut()+"분"+dateMngrCalDayHMSOut.getScnd()+"초";
			out.setResidualBiddingHms(residualBiddingTm);
		}

		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));		
    	BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

    	out.setArrId(arr.getArrId());
    	out.setArrStsCd(arr.getArrSts().getValue());
    	out.setPrgrsStsCd(_getCd().getCode("50000", arr.getArrSts().getValue()));
    	out.setCustId(mthrArr.getMainCust().getCustId());
    	out.setCustNm(mthrArr.getMainCust().getName());
    	out.setLoinIdNbr(mthrArr.getMainCust().getLoginIdNbr());
    	out.setCustGradeKndTpCd(mthrArr.getMainCust().getCustGradeCode(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue()));
    	out.setAplctnDt(mthrArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
    	
    	if(lnPurposeCd != null && !lnPurposeCd.isEmpty()) {
	    	out.setLnPurposeCd(lnPurposeCd);
	    	out.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
    	}

    	out.setPdCd(mthrArr.getPdCd());
    	out.setPdNm(mthrArr.getPd().getPdNm());

    	if(p2pInvstmntRatingCd != null && !p2pInvstmntRatingCd.isEmpty()) {
	    	out.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
	    	out.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
    	}

    	if(rpymntWayCd != null && !rpymntWayCd.isEmpty()) {
	    	out.setRpymntWayCd(rpymntWayCd);
	    	out.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
    	}

    	if(biddingMthd != null && !biddingMthd.isEmpty()) {
	    	out.setBiddingMthdCdVal(_getCd().getCode("A0432", biddingMthd));
    	}

    	out.setLonAprvlTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));
    	out.setIntRt(((ArrCndInt) mthrArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());
    	out.setCrncyCd(_getArrCndInqryBizProc().getArrangementConditionValue(mthrArr.getArrCnd(PdCndEnum.CURRENCY.getValue())));
    	out.setExctnDt(mthrArr.getArrOpnDt());
    	out.setArrMtrtyDt(mthrArr.getArrMtrtyDt());
    	out.setInvstmntAmt(cntrtAmt);
    	out.setInvstmntRt(((ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt());

    	return out;
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
	 * @return the arrBalMngr
	 */
	private ArrBalMngr _getArrBalMngr() {
		if (arrBalMngr == null) {
			arrBalMngr = (ArrBalMngr) CbbApplicationContext.getBean(ArrBalMngr.class, arrBalMngr);
		}
		return arrBalMngr;
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
	 * @return the dateCalculator
	 */
	private DateCalculator _getDateCalculator() {
		if (dateCalculator == null) {
			dateCalculator = (DateCalculator) CbbApplicationContext.getBean(
					DateCalculator.class, dateCalculator);
		}
		return dateCalculator;
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
}
