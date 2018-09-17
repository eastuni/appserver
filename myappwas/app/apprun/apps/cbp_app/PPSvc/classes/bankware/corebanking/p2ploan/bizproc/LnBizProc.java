package bankware.corebanking.p2ploan.bizproc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.arrangementcontrol.interfaces.ArrSrvcCntr;
import bankware.corebanking.arrangement.enums.ArrSrvcEnum;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrActionRequiredValue;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsCndCdChngHst;
import bankware.corebanking.core.product.productapi.interfaces.dto.PdPdRelIn;
import bankware.corebanking.core.product.productapi.interfaces.dto.PdPdRelOut;
import bankware.corebanking.core.settlement.arrangementtransaction.interfaces.dto.ArrTxInqryDtIn;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcAplctnInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.LnListOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.product.enums.ProductRelationTypeEnum;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTxMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 *
 * Author
 * History
 */
@BxmBean("LnBizProc")
@BxmCategory(logicalName = "Loan BizProc")
public class LnBizProc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

	public static final BigDecimal ONE_HUNDRED = new BigDecimal(100);

    private CmnContext      	cmnContext;			// Common system handler Utility
    private ArrTxMngr      	   	arrTxMngr;              // Transaction    Manager I/F
    private ArrSrvcCntr 	   		arrSrvcCntr;			// Arrangement service control
    private Cd 	   			   	cd;						// Code I/F
	private ArrBalMngr 		   	arrBalMngr;				// Arrangement Balance Manager I/F
	private ArrCndInqryBizProc	arrCndInqryBizProc;

    /**
     * Get Child Product Code Under Parent-child relation
     * @param ArrReal - (required)arrReal
     * @return  String - motherPdCd
     * @throws BizApplicationException
     */
	public String getChildArrPdCd( ArrReal arrReal ) throws BizApplicationException {

		PdPdRelIn pdPdRelIn = new PdPdRelIn();
		pdPdRelIn.setPdBtwnRelCd(ProductRelationTypeEnum.PARENT_CHILD.getValue());
		pdPdRelIn.setAplyDt(_getCmnContext().getTxDate());
		// pdBtwnRelCd
		List<PdPdRelOut> pdPdRelOutList = arrReal.getPd().getRelBtwnPds(pdPdRelIn);
		if( pdPdRelOutList.size() != 1 ){
			throw new BizApplicationException("0000", null);
		}

		return pdPdRelOutList.get(0).getPdCd();
	}

    /**
     * execute condition action
     * @param arr - (required) activate or create Arrangement
     * @param arrSrvcEnum - (required) Loan Agreement Open Input
     * @param arrActionRequiredValue - (required) Condition Action Required Value
     * @return  void
     * @throws BizApplicationException
     */
    public void executeConditionCheck(Arr arr, ArrSrvcEnum arrSrvcEnum, ArrActionRequiredValue arrActionRequiredValue) throws BizApplicationException {

    	_getArrSrvcCntr().validate(arrSrvcEnum.getValue(), arr);
        arr.doServiceAction(arrSrvcEnum, arrActionRequiredValue);
    }

    /**
     * Get Loan List
     * @param arrList - (required) List<Arr>
     * @return List<LnListOut>
     * @throws BizApplicationException
     */
    public List<LnListOut> getLoanList(List<Arr> arrList, boolean aplctnInfoFlag) throws BizApplicationException {

    	List<LnListOut> lnListOutList = new ArrayList<LnListOut>();
		LnListOut lnListOut = null;

		for(Arr arr : arrList){
			lnListOut = new LnListOut();

			String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));

			lnListOut.setAplctnDt(arr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
			lnListOut.setAplctnNbr(arr.getAplctnNbr());
			lnListOut.setPdCd(arr.getPdCd());
			lnListOut.setPdNm(arr.getPd().getPdNm());
			if(arr.getMainCust()!=null)
			{
				lnListOut.setLoinIdNbr(arr.getMainCust().getLoginIdNbr());
				lnListOut.setCustId(arr.getMainCust().getCustId());
				lnListOut.setCustNm(arr.getMainCust().getName());
			}

			ArrCnd intRtArrCnd = arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
			if (intRtArrCnd!=null){
				BigDecimal intRt = ((ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt();
				if(intRt!=null){
					lnListOut.setIntRt(intRt);
					lnListOut.setLnAplctnIntRt(intRt);
					lnListOut.setAprvlAplctnIntRt(intRt);
				}
				else {
					lnListOut.setIntRt(0);
					lnListOut.setLnAplctnIntRt(0);
					lnListOut.setAprvlAplctnIntRt(0);

				}
			}
			else {
				lnListOut.setIntRt(0);
				lnListOut.setLnAplctnIntRt(0);
				lnListOut.setAprvlAplctnIntRt(0);
			}


			lnListOut.setAplctnAmt(cntrtAmtStr);//신청금액
			lnListOut.setAprvlAmt(cntrtAmtStr);//승인금액

			if(aplctnInfoFlag) {
				// Get Approval Information
				if(!arr.getArrSts().equals(ArrStsEnum.INITIATED) && !arr.getArrSts().equals(ArrStsEnum.APPLIED)){
					//_getAprvlInformation2(arr, lnListOut);
					try{
						_getAprvlInformation(arr, lnListOut);
					}catch(Exception e) {
						lnListOut.setAplctnAmt(999999);//신청금액

						logger.error("ignore exception: ",e);
					}

				}
				else{
					lnListOut.setAplctnAmt(cntrtAmtStr);//신청금액
					lnListOut.setAprvlAmt(0);//승인금액
				}
			}

			lnListOut.setLonAprvlTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));	 // Loan Term


			lnListOut.setArrStsCd(arr.getArrSts().getValue());
			lnListOut.setArrStsChngDt(arr.getArrStsDt());

			lnListOut.setPrgrsStsCd(_getArrCndInqryBizProc().getArrangementStatusName(arr));
			//List<ArrStsChngHst> arrStsChngHstList = arr.getArrStatusChangeHistory();
			lnListOut.setArrId(arr.getArrId());                     			// Arrangement Id

			String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
			lnListOut.setCrncyCd(crncyCd);
			ArrBal residualAmtBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd==null?"CNY":crncyCd);
			ArrBal biddingCntBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT_CNT.getValue(), crncyCd==null?"CNY":crncyCd);
			BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);
			//입찰진척률
			lnListOut.setBiddingPrgrsRt(getPercentage(cntrtAmt, residualAmtBal.getLastBal()));
			//입찰누적건수
			lnListOut.setBiddingCnt(biddingCntBal.getLastBal());

			// 2016.01.29 이호근 추가
			String lnPurposeCd = arr.getExtendAttribute(ArrXtnInfoEnum.LOAN_PURPOSE_CODE);
			if( lnPurposeCd != null && !StringUtils.isEmpty(lnPurposeCd)) {
				lnListOut.setLnPurposeCd(lnPurposeCd);
				lnListOut.setLnPurposeNm(_getCd().getCode("A0298", lnPurposeCd));
			}

			// 2016.02.24 오윤화 추가
			lnListOut.setLnRsnCntnt(arr.getExtendAttribute(ArrXtnInfoEnum.LOAN_REASON_CONTENT));

			String p2pInvstmntRatingCd = arr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
			if(p2pInvstmntRatingCd != null && !StringUtils.isEmpty(p2pInvstmntRatingCd)) {
				lnListOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
				lnListOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
			}

			lnListOut.setExctnDt(arr.getArrOpnDt());
			lnListOut.setArrMtrtyDt(arr.getArrMtrtyDt());

			String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
			if(rpymntWayCd != null && !StringUtils.isEmpty(rpymntWayCd)) {
				lnListOut.setRpymntWayCd(rpymntWayCd);
				lnListOut.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
			}

			String biddingMthdCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));
			if(biddingMthdCd != null && !StringUtils.isEmpty(biddingMthdCd)) {
				lnListOut.setBiddingMthdCdVal(_getCd().getCode("A0432", biddingMthdCd));
				lnListOut.setBiddingMthdCd(biddingMthdCd);
			}

			lnListOut.setBiddingClsgTmstmp(arr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP));
			ArrCnd desiredAmtExcsBidAcceptYnArrCnd = arr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN);
			if(desiredAmtExcsBidAcceptYnArrCnd != null) {
				lnListOut.setDesiredAmtExcsBidAcceptYn(_getArrCndInqryBizProc().getArrangementConditionValue(desiredAmtExcsBidAcceptYnArrCnd));
			}
			ArrCnd desiredAmtExcsPrmsnMaxAmtArrCnd = arr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT);
			if(desiredAmtExcsPrmsnMaxAmtArrCnd != null) {
				lnListOut.setDesiredAmtExcsPrmsnMaxAmt(_getArrCndInqryBizProc().getArrangementConditionValue(desiredAmtExcsPrmsnMaxAmtArrCnd));
			}
			
			//CCM01.MIN_DATE, CCM01.MAX_DATE, AmtTpEnum.LN_APLCTN_FEE.getValue()
			ArrTxInqryDtIn arrTxInqryDtIn = new ArrTxInqryDtIn();
			arrTxInqryDtIn.setInqryStartDt(CCM01.MIN_DATE);
	        arrTxInqryDtIn.setInqryEndDt(CCM01.MAX_DATE);

	        List<String> amtTpList = new ArrayList<String>();

	        amtTpList.add(AmtTpEnum.LN_APLCTN_FEE.getValue());
	        arrTxInqryDtIn.setAmtTpCdList(amtTpList);
	        
			List<ArrTx> arrTxList = _getArrTxMngr().getListArrTxWithAmtTp(arrTxInqryDtIn, (ArrReal) arr);
			if(arrTxList != null && arrTxList.size() > 0 ){
				lnListOut.setLnAplctnFeeAmt(arrTxList.get(0).getTxAmt());
			}

			ArrBal arrBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd==null?"CNY":crncyCd);
			if(arrBal != null){
				lnListOut.setArrBal(arrBal.getLastBal());
			}

			BigDecimal profitAmt = BigDecimal.ZERO;
			BigDecimal rtrnOnInvstmnt = BigDecimal.ZERO;

			ArrBal lnNrmlDpstArrIntBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.LN_NORMAL_INT.getValue(), BalTpEnum.TOT_DEPOSIT.getValue(), crncyCd==null?"CNY":crncyCd);
			BigDecimal lnNrmlDpstBidDecimal = BigDecimal.ZERO;
			if(lnNrmlDpstArrIntBal != null) {
				lnNrmlDpstBidDecimal = lnNrmlDpstArrIntBal.getLastBal();
			}
			ArrBal lnErlyDpstArrIntBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.LN_ERLY_INT.getValue(), BalTpEnum.TOT_DEPOSIT.getValue(), crncyCd==null?"CNY":crncyCd);
			BigDecimal lnErlyDpstBidDecimal = BigDecimal.ZERO;
			if(lnErlyDpstArrIntBal != null) {
				lnErlyDpstBidDecimal = lnErlyDpstArrIntBal.getLastBal();
			}
			lnListOut.setInvstmntProfitAmt(lnNrmlDpstBidDecimal.add(lnErlyDpstBidDecimal));

			if(cntrtAmt.compareTo(BigDecimal.ZERO) > 0) {
				rtrnOnInvstmnt = profitAmt.divide(cntrtAmt).multiply(BigDecimal.valueOf(100));
				lnListOut.setRtrnOnInvstmntRt(rtrnOnInvstmnt);
			}
			//investment product code
			lnListOut.setChildPdCd(getChildArrPdCd(arr));

			lnListOutList.add(lnListOut);
		}

		return lnListOutList;
    }

	/**
	 *  Calculate Percentage
	 *
	 * @param BigDecimal base
	 * @param BigDecimal divider
	 * @return BigDecimal result
	 */
	public BigDecimal getPercentage(BigDecimal base, BigDecimal divider) throws BizApplicationException {

	    return divider.divide(base, 2, RoundingMode.HALF_EVEN).multiply(ONE_HUNDRED);
	}

	/**
	 *  Get Loan Application Info
	 *
	 * @param Arr arr
	 * @return LnDtlInqrySvcAplctnInfoOut
	 */
	public LnDtlInqrySvcAplctnInfoOut getLoanApplicationInfo(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcAplctnInfoOut lnDtlInqrySvcAplctnInfoOut = new LnDtlInqrySvcAplctnInfoOut();

		/*
		 * Loan Application Information
		 */
		lnDtlInqrySvcAplctnInfoOut.setAplctnDt(arr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());	// Loan Application Date
		lnDtlInqrySvcAplctnInfoOut.setAplctnNbr(arr.getAplctnNbr());	// Loan Application Number
		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
		BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);
		lnDtlInqrySvcAplctnInfoOut.setLnAplctnAmt(cntrtAmt); // Loan Application Amount
		lnDtlInqrySvcAplctnInfoOut.setLonAplctnTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));	 // Loan Term
		// 2016.02.24 오윤화 추가 널처리
		BigDecimal intRt = BigDecimal.ZERO;
		ArrCnd intRtCnd = arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
		if(intRtCnd!=null){
			String intRtStr = _getArrCndInqryBizProc().getArrangementConditionValue(intRtCnd);
			if(intRtStr!=null && !intRtStr.equals("")){
				intRt = new BigDecimal(intRtStr);
			}
		}
		lnDtlInqrySvcAplctnInfoOut.setLnAplctnIntRt(intRt);	// Loan Interest Rate
		lnDtlInqrySvcAplctnInfoOut.setPrtlBidAcceptYn(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.P2P_PARTIAL_BIDDING_ACCEPT_YN.getValue())));	// Accept Partial

		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		lnDtlInqrySvcAplctnInfoOut.setCrncyCd(crncyCd);	// crncyCd

		// 2016.02.24 오윤화 추가 널처리
		String desiredAmtExcsBidAcceptYn = "";
		ArrCnd desiredAmtExcsBidAcceptYnArrCnd = arr.getArrCnd(PdCndEnum.P2P_APPLIED_AMOUNT_EXCEED_ACCEPT_YN.getValue());
		if(desiredAmtExcsBidAcceptYnArrCnd!=null){
			desiredAmtExcsBidAcceptYn = _getArrCndInqryBizProc().getArrangementConditionValue(desiredAmtExcsBidAcceptYnArrCnd);
		}
		lnDtlInqrySvcAplctnInfoOut.setDesiredAmtExcsBidAcceptYn(desiredAmtExcsBidAcceptYn);	// Accept Excess Loan Amount

		// 2016.03.03 오윤화 추가
		String p2pInvstmntRatingCd = arr.getExtendAttribute(ArrXtnInfoEnum.P2P_INVESTMENT_RATING_CODE);
		if(p2pInvstmntRatingCd != null && !StringUtils.isEmpty(p2pInvstmntRatingCd)) {
			lnDtlInqrySvcAplctnInfoOut.setP2pInvstmntRatingCd(p2pInvstmntRatingCd);
			lnDtlInqrySvcAplctnInfoOut.setP2pInvstmntRatingNm(_getCd().getCode("A0299", p2pInvstmntRatingCd));
		}

		// Max Amount When Excess Loan Amount is acceptable
		BigDecimal lnDesiredMaxAmt = BigDecimal.ZERO;
		ArrCnd lnDesireMaxAmtArrCnd = arr.getArrCnd(PdCndEnum.P2P_LOAN_DESIRED_MAXIMUM_AMOUNT.getValue());
		if(lnDesireMaxAmtArrCnd!=null){
			String lnDesiredMaxAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(lnDesireMaxAmtArrCnd);
			if(lnDesiredMaxAmtStr!=null && !lnDesiredMaxAmtStr.equals("")){
				lnDesiredMaxAmt = new BigDecimal(lnDesiredMaxAmtStr);
			}
		}
		lnDtlInqrySvcAplctnInfoOut.setLnDesiredMaxAmt(lnDesiredMaxAmt);
		String biddingMthd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue()));
		if(biddingMthd != null && !StringUtils.isEmpty(biddingMthd)) {
			lnDtlInqrySvcAplctnInfoOut.setBiddingMthdCdVal(_getCd().getCode("A0432", biddingMthd));
			lnDtlInqrySvcAplctnInfoOut.setBiddingMthdCd(biddingMthd);
		}
		lnDtlInqrySvcAplctnInfoOut.setRpymntMthdCd(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue())));
		lnDtlInqrySvcAplctnInfoOut.setRpymntWayNm(_getCd().getCode("50024", _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()))));

		//FeeCalculatorOut feeCalculatorOut = _getArrCndInqryBizProc().getArrangementFeeSimulation(ArrSrvcEnum.APPLICATION, arr);

//		if(feeCalculatorOut != null && !feeCalculatorOut.getFeeCalcnVal().isEmpty()) {
//			// Loan Application Fee Ratio
//			lnDtlInqrySvcAplctnInfoOut.setLnAplctnFeeAmt(feeCalculatorOut.getFeeDcsnAmt());
//			// Loan Application Fee
//			lnDtlInqrySvcAplctnInfoOut.setLnAplctnFeeRt(feeCalculatorOut.getFeeCalcnVal().get(0).getFeeCalcnDtl().get(0).getFeeRt());
//		}

		// LOAN_PURPOSE_CODE & LOAN_REASON_CONTENT
		Map<ArrXtnInfoEnum, String> xtnInforList = arr.getXtnInfoHash();
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE))) {
			lnDtlInqrySvcAplctnInfoOut.setLnPurposeCd(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE));
			lnDtlInqrySvcAplctnInfoOut.setLnPurposeNm(_getCd().getCode("A0298", xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE)));
		}
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_REASON_CONTENT))) {
			lnDtlInqrySvcAplctnInfoOut.setLnRsnCntnt(xtnInforList.get(ArrXtnInfoEnum.LOAN_REASON_CONTENT));
		}

		// Reviewer opinion
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.EXMINATION_COMMENTS))) {
			lnDtlInqrySvcAplctnInfoOut.setExmntnCmntCntnt(xtnInforList.get(ArrXtnInfoEnum.EXMINATION_COMMENTS));
		}

		// Loan Document Examination Yn
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_DOCUMENT_EXAMINATION_YN))) {
			lnDtlInqrySvcAplctnInfoOut.setLnDocExmntnYn(xtnInforList.get(ArrXtnInfoEnum.LOAN_DOCUMENT_EXAMINATION_YN));
		}

		// Authentication Examination Yn
		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.AUTHENTICATION_EXAMINATION_YN))) {
			lnDtlInqrySvcAplctnInfoOut.setAuthExmntnYn(xtnInforList.get(ArrXtnInfoEnum.AUTHENTICATION_EXAMINATION_YN));
		}

//		
//		String exmntnCmnt = arr.getExtendAttribute(ArrXtnInfoEnum.EXAMINATION_COMMENT);
//		lnDtlInqrySvcAplctnInfoOut.setExmntnCmnt(exmntnCmnt);
//
//		
//		String lnDocExmntnYn = arr.getExtendAttribute(ArrXtnInfoEnum.LOAN_DOCUMENT_EXAMINATION_YN);
//		lnDtlInqrySvcAplctnInfoOut.setLnDocExmntnYn(lnDocExmntnYn);
//
//		
//		String authExmntnYn = arr.getExtendAttribute(ArrXtnInfoEnum.AUTHENTICATION_EXAMINATION_YN);
//		lnDtlInqrySvcAplctnInfoOut.setAuthExmntnYn(authExmntnYn);



		// Get Approval Information
		if(!arr.getArrSts().equals(ArrStsEnum.INITIATED) && !arr.getArrSts().equals(ArrStsEnum.APPLIED)){
			_getAprvlInformation(arr, lnDtlInqrySvcAplctnInfoOut, xtnInforList);
		}

        return lnDtlInqrySvcAplctnInfoOut;
	}

	/**
	 *  Get Approval Info
	 *
	 * @param Arr arr
	 * @param LnDtlInqrySvcAplctnInfoOut lnDtlInqrySvcAplctnInfoOut
	 * @param Map<ArrXtnInfoEnum, String> xtnInforList
	 *
	 */
	private void _getAprvlInformation(Arr arr, LnDtlInqrySvcAplctnInfoOut lnDtlInqrySvcAplctnInfoOut, Map<ArrXtnInfoEnum, String> xtnInforList) throws BizApplicationException {

		// Set application value as approved value, In case the loan has been approved without any change
		lnDtlInqrySvcAplctnInfoOut.setAprvlAmt(lnDtlInqrySvcAplctnInfoOut.getLnAplctnAmt());
		lnDtlInqrySvcAplctnInfoOut.setAprvlAplctnIntRt(lnDtlInqrySvcAplctnInfoOut.getLnAplctnIntRt());

        // Get arrangement status and conditions change history.
        List<ArrStsCndCdChngHst> arrStsCndChngHst = arr.getArrStatusAndArrCndChangeHistory(CCM01.MIN_DATE, CCM01.MAX_DATE);

        // Get application amount when arrangement amount is changed. (condition change).
        for(ArrStsCndCdChngHst arrStsCndChngHstItm : arrStsCndChngHst){
            if(ArrStsEnum.APPROVED.getValue().equals(arrStsCndChngHstItm.getArrStsCd())){

            	switch (PdCndEnum.getEnum(arrStsCndChngHstItm.getCndCd())) {

				case CONTRACT_AMOUNT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						lnDtlInqrySvcAplctnInfoOut.setLnAplctnAmt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}
					lnDtlInqrySvcAplctnInfoOut.setAprvlAmt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				case P2P_INT_RT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						lnDtlInqrySvcAplctnInfoOut.setLnAplctnIntRt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}
					lnDtlInqrySvcAplctnInfoOut.setAprvlAplctnIntRt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				default:
					break;
				}
            }
        }

	}

	/**
	 *  Get Approval Info
	 *
	 * @param Arr arr
	 * @param LnDtlInqrySvcAplctnInfoOut lnDtlInqrySvcAplctnInfoOut
	 * @param Map<ArrXtnInfoEnum, String> xtnInforList
	 *
	 */
	private void _getAprvlInformation(Arr arr, LnListOut out) throws BizApplicationException {

        // Get arrangement status and conditions change history.
        List<ArrStsCndCdChngHst> arrStsCndChngHst = arr.getArrStatusAndArrCndChangeHistory(CCM01.MIN_DATE, CCM01.MAX_DATE);

        // Get application amount when arrangement amount is changed. (condition change).
        for(ArrStsCndCdChngHst arrStsCndChngHstItm : arrStsCndChngHst){
            if(ArrStsEnum.APPROVED.getValue().equals(arrStsCndChngHstItm.getArrStsCd())){

            	switch (PdCndEnum.getEnum(arrStsCndChngHstItm.getCndCd())) {

				case CONTRACT_AMOUNT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out.setAplctnAmt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}
					out.setAprvlAmt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				case P2P_INT_RT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out.setLnAplctnIntRt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}
					out.setAprvlAplctnIntRt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				default:
					break;
				}
            }
        }

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
	 * @return the arrTxMngr
	 */
	private ArrTxMngr _getArrTxMngr() {
		if (arrTxMngr == null) {
			arrTxMngr = (ArrTxMngr) CbbApplicationContext.getBean(ArrTxMngr.class, arrTxMngr);
		}
		return arrTxMngr;
	}

	/**
	 * @return the arrSrvcCntr
	 */
	private ArrSrvcCntr _getArrSrvcCntr() {
		if (arrSrvcCntr == null) {
			arrSrvcCntr = (ArrSrvcCntr) CbbApplicationContext.getBean(
					ArrSrvcCntr.class, arrSrvcCntr);
		}
		return arrSrvcCntr;
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
	 * @return the arrCndInqryBizProc
	 */
	private ArrCndInqryBizProc _getArrCndInqryBizProc() {
		if (arrCndInqryBizProc == null) {
			arrCndInqryBizProc = (ArrCndInqryBizProc) CbbApplicationContext.getBean(
					ArrCndInqryBizProc.class, arrCndInqryBizProc);
		}
		return arrCndInqryBizProc;
	}
}
