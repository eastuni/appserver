package bankware.corebanking.p2ploan.information.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
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
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsCndCdChngHst;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.application.service.dto.LnDtlInqrySvcAplctnInfoAlphaOut;
import bankware.corebanking.p2ploan.bizproc.LnBizProc;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcBiddingInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcBiddingStsOut;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcCustInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcLnDtlIn;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcLnDtlIncludeSmrInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcLnDtlOut;
import bankware.corebanking.p2ploan.information.service.dto.LnDtlInqrySvcResidualBiddingTmOut;
import bankware.corebanking.p2ploan.information.service.dto.LnListOut;
import bankware.corebanking.product.constant.CPD01;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBal;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;


/**
 * 이 서비스는 P2P대출상세정보를 조회한다.
 * This service allows to inquire P2P loan detail
 *
 * Author	Sungbum Kim
 * History
 */
@BxmCategory(logicalName ="P2P Loan Detail Inquiry Service")
@CbbClassInfo(classType={"SERVICE"})
@BxmService("LnDtlInqrySvc")
public class LnDtlInqrySvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrBalMngr			arrBalMngr;			// Arrangement balance manager
	private ArrCustMngr			arrCustMngr;		// Arrangement customer manager
	private ArrCndInqryBizProc	arrCndInqryBizProc;	// Arrangement condition inquiry bizproc
	private ArrInqryBizProc		arrInqryBizProc;	// Arrangement inquiry bizproc
	private Cd					cd;					// Code
	private CmnContext			cmnContext;			// Common context
	private DateCalculator		dateCalculator;		// Date calculator
	private LnBizProc			lnBizProc;			// Loan bizproc

    /**
     * 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     * Search detail loan information by arrangement Id.
     *
     * <pre>
     * 1. 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     *
     * 1. Get the detail loan information using arrangement identification.
     *
     * 2. 출력을 조립하고 반환한다.
     * 	2.1 고객 정보
     * 	2.2 대출 신청 정보
     * 	2.3 입찰 정보
     *
     * 2. Assemble output & return.
	 *  2.1 Customer Information
	 *  2.2 Application Information
	 *  2.3 Bidding Information
     * </pre>
     *
     * @param  in (required) LnDtlInqrySvcLnDtlIn : Arrangement identification
     * @return out LnDtlInqrySvcLnDtlOut Detail loan information
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getLoanDetail")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0120400", srvcNm="Get Loan Detail")
	@BxmCategory(logicalName = "Get Loan Detail")
	public LnDtlInqrySvcLnDtlOut getLoanDetail(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput(arr);
	}

	private LnDtlInqrySvcLnDtlOut _buildOutput(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcLnDtlOut lnDtlInqrySvcLnDtlOut = new LnDtlInqrySvcLnDtlOut();

		// General Information
		lnDtlInqrySvcLnDtlOut.setArrId(arr.getArrId());
		lnDtlInqrySvcLnDtlOut.setPdCd(arr.getPdCd());
		lnDtlInqrySvcLnDtlOut.setPdNm(arr.getPd().getPdNm());
		lnDtlInqrySvcLnDtlOut.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName(arr));
		lnDtlInqrySvcLnDtlOut.setArrStsCd(arr.getArrSts().getValue());

		// Customer Information
		lnDtlInqrySvcLnDtlOut.setCustInfo(_getLoanCustomerInformation(arr.getMainCust(), arr.getArrId()));

		// Application Information
		lnDtlInqrySvcLnDtlOut.setAplctnInfoCntnt(_getLnBizProc().getLoanApplicationInfo(arr));

		// Biding Information
		if(arr.getArrSts().equals(ArrStsEnum.START_BID) ||
				arr.getArrSts().equals(ArrStsEnum.WINNING_BID) ||
				     arr.getArrSts().equals(ArrStsEnum.FAILURE) ||
				     	arr.getArrSts().equals(ArrStsEnum.ACTIVE) ||
			     			arr.getArrSts().equals(ArrStsEnum.TERMINATED)){
			// 입찰기본정보 취득
			LnDtlInqrySvcBiddingInfoOut biddingInfo = new LnDtlInqrySvcBiddingInfoOut();
			lnDtlInqrySvcLnDtlOut.setBiddingInfo(_getBiddingInformation(arr, biddingInfo));
		}

		return lnDtlInqrySvcLnDtlOut;
	}

	private LnDtlInqrySvcBiddingInfoOut _getBiddingInformation(Arr arr, LnDtlInqrySvcBiddingInfoOut lnDtlInqrySvcBiddingInfoOut) throws BizApplicationException {

		// 입찰정보들 취득
		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		ArrBal residualAmtBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd==null?"CNY":crncyCd);
		ArrBal biddingCntBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT_CNT.getValue(), crncyCd==null?"CNY":crncyCd);
		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
		BigDecimal cntrtAmt = new BigDecimal(cntrtAmtStr);

		//입찰누적금액
		lnDtlInqrySvcBiddingInfoOut.setBiddingCmltvAmt(residualAmtBal.getLastBal());
		//입찰진척률
		lnDtlInqrySvcBiddingInfoOut.setBiddingPrgrsRt(_getLnBizProc().getPercentage(cntrtAmt, residualAmtBal.getLastBal()));
		//잔여모금액
		lnDtlInqrySvcBiddingInfoOut.setResidualClctnAmt(cntrtAmt.subtract(residualAmtBal.getLastBal()));
		//입찰누적건수
		lnDtlInqrySvcBiddingInfoOut.setBiddingCnt(biddingCntBal.getLastBal());

		//입찰마감일시
		String biddingClsgTmstmp = arr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP);
		lnDtlInqrySvcBiddingInfoOut.setBiddingClsgTmstmp(biddingClsgTmstmp);

		String startTmstmp = _getCmnContext().getTxDate()+_getCmnContext().getTxHhmmss(); // 현재시간

		if (biddingClsgTmstmp != null && startTmstmp.compareTo(biddingClsgTmstmp) < 0) {
			//잔여입찰시간
			DateMngrCalDayHmsOut dateMngrCalDayHMSOut = _getDateCalculator().calculateDateByDayHourMinuteSecond(biddingClsgTmstmp);

			String residualBiddingTm ="";

			if(dateMngrCalDayHMSOut.getDay()>1){

				residualBiddingTm = dateMngrCalDayHMSOut.getDay()+"days "+dateMngrCalDayHMSOut.getHr()+":"+dateMngrCalDayHMSOut.getMnut()+":"+dateMngrCalDayHMSOut.getScnd();

			}
			else{
				residualBiddingTm = dateMngrCalDayHMSOut.getDay()+"day "+dateMngrCalDayHMSOut.getHr()+":"+dateMngrCalDayHMSOut.getMnut()+":"+dateMngrCalDayHMSOut.getScnd();
			}

			lnDtlInqrySvcBiddingInfoOut.setResidualBiddingHms(residualBiddingTm);
		}



		return lnDtlInqrySvcBiddingInfoOut;
	}

    /**
     * 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     * Search loan detail information by arrangement identification
	 * <pre>
	 * flow description
	 *
     * 1. 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     *
     * 1. Get the detail loan information using arrangement identification.
     *
     * 2. 출력을 조립하고 반환한다.
     * 	2.1 고객 정보
     * 	2.2 대출 목록
     * 	2.3 대출 신청 정보
     * 	2.4 입찰 정보
     * 	2.5 입찰자(투자자) 목록
     *
     * 2. Assemble output & return.
	 *  2.1 Customer Information
	 *  2.2 Loan List
	 *  2.3 Application Information
	 *  2.4 Bidding Information
	 *  2.5 Investor List
	 * </pre>
	 *
     * @param  in (required) LnDtlInqrySvcLnDtlIn : Arrangement id
     * @return LnDtlInqrySvcLnDtlOut Detail loan information
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getArrDetail")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0130400", srvcNm="Get Arrangement Detail")
	@BxmCategory(logicalName = "Get Arrangement Detail")
	public LnDtlInqrySvcLnDtlOut getArrDetail(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Build & Return Input Value
		 */
    	return _buildBiddingDetailOutput(arr);
	}

	private LnDtlInqrySvcLnDtlOut _buildBiddingDetailOutput(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcLnDtlOut lnDtlInqrySvcLnDtlOut = new LnDtlInqrySvcLnDtlOut();

		// General Information
		lnDtlInqrySvcLnDtlOut.setArrId(arr.getArrId());
		lnDtlInqrySvcLnDtlOut.setPdCd(arr.getPdCd());
		lnDtlInqrySvcLnDtlOut.setPdNm(arr.getPd().getPdNm());
		lnDtlInqrySvcLnDtlOut.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName(arr));
		lnDtlInqrySvcLnDtlOut.setArrStsCd(arr.getArrSts().getValue());

		// Customer Information
		lnDtlInqrySvcLnDtlOut.setCustInfo(_getLoanCustomerInformation(arr.getMainCust(), arr.getArrId()));

		// 대출목록 취득
		lnDtlInqrySvcLnDtlOut.setLoanList(_getLoanList(arr));

		// Application Information
		lnDtlInqrySvcLnDtlOut.setAplctnInfoCntnt(_getLnBizProc().getLoanApplicationInfo(arr));

		// Bidding Information
		// 입찰자목록 취득
		LnDtlInqrySvcBiddingInfoOut lnDtlInqrySvcBiddingInfoOut = _getInvestorList(arr);

		// 입찰기본정보 취득
		lnDtlInqrySvcLnDtlOut.setBiddingInfo(_getBiddingInformation(arr, lnDtlInqrySvcBiddingInfoOut));

		return lnDtlInqrySvcLnDtlOut;
	}

	private LnDtlInqrySvcCustInfoOut _getLoanCustomerInformation(Cust cust, String arrId) throws BizApplicationException {

		LnDtlInqrySvcCustInfoOut lnDtlInqrySvcCustInfoOut = new LnDtlInqrySvcCustInfoOut();

		lnDtlInqrySvcCustInfoOut.setCustId(cust.getCustId());
		lnDtlInqrySvcCustInfoOut.setCustNm(cust.getName());
		lnDtlInqrySvcCustInfoOut.setLoinIdNbr(cust.getLoginIdNbr());
		lnDtlInqrySvcCustInfoOut.setAge(cust.getAge());
		lnDtlInqrySvcCustInfoOut.setCustGradeKndTpCd(cust.getCustGradeCode(CustGradeKndTpEnum.P2P_LOAN_RATING.getValue()));
		lnDtlInqrySvcCustInfoOut.setCrdtGradeCd(cust.getCustGradeCode(CustGradeKndTpEnum.P2P_CREDIT_RATING.getValue()));

		return lnDtlInqrySvcCustInfoOut;
	}

	private List<LnListOut> _getLoanList(Arr arr) throws BizApplicationException {

		String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
		List<ArrReal> arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(arr.getMainCust().getCustId(), null, bizDscd, null, null, null);

		List<Arr> arrList = new ArrayList<Arr>();

		for(ArrReal arrReal : arrRealList){
				arrList.add((Arr)arrReal);
		}

		// 대출목록 취득
		List<LnListOut> list = _getLnBizProc().getLoanList(arrList, false);

		return list;
	}

	private LnDtlInqrySvcBiddingInfoOut _getInvestorList(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcBiddingInfoOut lnDtlInqrySvcBiddingInfoOut = new LnDtlInqrySvcBiddingInfoOut();
		LnDtlInqrySvcBiddingStsOut lnDtlInqrySvcBiddingStsOut = null;
		List<LnDtlInqrySvcBiddingStsOut> LnDtlInqrySvcBiddingStsOutList = new ArrayList<LnDtlInqrySvcBiddingStsOut>();

		//투자자현황
		for(ArrReal childArr : arr.getChildren()){
			if (ArrStsEnum.APPLIED.equals(childArr.getArrSts())
					|| ArrStsEnum.START_BID.equals(childArr.getArrSts())
					|| ArrStsEnum.WINNING_BID.equals(childArr.getArrSts())
					|| ArrStsEnum.FAILURE.equals(childArr.getArrSts())
					|| ArrStsEnum.ACTIVE.equals(childArr.getArrSts())
					|| ArrStsEnum.TERMINATED.equals(childArr.getArrSts())) {

				// arrangment amount.
		        ArrCnd arrCndAgrmntAmt = childArr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue());
		        BigDecimal invstmntAmt = arrCndAgrmntAmt == null ? BigDecimal.ZERO:((ArrCndRng) arrCndAgrmntAmt).getRngVal();

		        // P2P interest rate
		        BigDecimal invstmntRt = BigDecimal.ZERO;
		        if (arrCndAgrmntAmt!=null){
			        ArrCnd arrCndIntRt = childArr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
			        if (arrCndIntRt!=null){
			        	invstmntRt = ((ArrCndInt) arrCndIntRt).getAplyRt();
			        }
		        }
				lnDtlInqrySvcBiddingStsOut = new LnDtlInqrySvcBiddingStsOut();
				lnDtlInqrySvcBiddingStsOut.setInvstrId(childArr.getMainCust().getLoginIdNbr());
				lnDtlInqrySvcBiddingStsOut.setInvstmntAmt(invstmntAmt);
				lnDtlInqrySvcBiddingStsOut.setInvstmntRt(invstmntRt);
				lnDtlInqrySvcBiddingStsOut.setInvstmntDt(childArr.getArrStsInfo(ArrStsEnum.APPLIED).getStsStartDt());
				lnDtlInqrySvcBiddingStsOut.setArrStsCd(childArr.getArrSts().getValue());
				lnDtlInqrySvcBiddingStsOut.setBiddingTmstmp(childArr.getArrStsDt());
				lnDtlInqrySvcBiddingStsOut.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName((Arr)childArr));

				LnDtlInqrySvcBiddingStsOutList.add(lnDtlInqrySvcBiddingStsOut);
			}
		}

		lnDtlInqrySvcBiddingInfoOut.setBiddingSts(LnDtlInqrySvcBiddingStsOutList);

		return lnDtlInqrySvcBiddingInfoOut;
	}

	/**
	 *
     * 계약 식별자에 해당하는 대출 신청 정보를 조회한다.
     * Search loan application information by arrangement identification
	 *
	 * <pre>
     * 1. 계약 식별자에 해당하는 계약 정보를 조회한다.
     *
     * 1. Get the arrangement using arrangement identification.
     *
     * 2. 출력을 조립하고 반환한다.
     * 	2.1 대출 신청 정보
     *
     * 2. Assemble output & return.
	 *  2.1 Application Information
	 * </pre>
	 *
     * @param  in (required) LnDtlInqrySvcLnDtlIn : Arrangement id
     * @return LnDtlInqrySvcAplctnInfoAlphaOut Loan application information
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getAplctnInfo")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0220400", srvcNm="Get Aplctn Info")
	@BxmCategory(logicalName = "Get Aplctn Info")
	public LnDtlInqrySvcAplctnInfoAlphaOut getAplctnInfoCntnt(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());


		/**
		 * Build & Return Input Value
		 */
    	return _buildOutputApplicationInformation(arr);
	}

	private LnDtlInqrySvcAplctnInfoAlphaOut _buildOutputApplicationInformation(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcAplctnInfoAlphaOut lnDtlInqrySvcAplctnInfoAlphaOut = new LnDtlInqrySvcAplctnInfoAlphaOut();

		lnDtlInqrySvcAplctnInfoAlphaOut.setAplctnInfoCntnt(_getLnBizProc().getLoanApplicationInfo(arr));
		lnDtlInqrySvcAplctnInfoAlphaOut.setPdNm(arr.getPd().getPdNm());
		lnDtlInqrySvcAplctnInfoAlphaOut.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName(arr));

        return lnDtlInqrySvcAplctnInfoAlphaOut;
	}

    /**
     * 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     * Search loan detail information by arrangement identification
	 * <pre>
	 * flow description
	 *
     * 1. 계약 식별자에 해당하는 대출 상세 정보를 조회한다.
     *
     * 1. Get the detail loan information using arrangement identification.
     *
     * 2. 출력을 조립하고 반환한다.
     * 	2.1 고객 정보
     * 	2.2 계약 정보
     * 	2.3 대출 신청 정보
     * 	2.4 입찰자(투자자) 목록
     *
     * 2. Assemble output & return.
	 *  2.1 Customer Information
	 *  2.2 Arrangement Information
	 *  2.3 Application Information
	 *  2.4 Investor List
	 * </pre>
	 *
     * @param  in (required) LnDtlInqrySvcLnDtlIn : arrangement id
     * @return LnDtlInqrySvcLnDtlOut Detail loan application information
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getArrangementDtlInformation")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP1040400", srvcNm="Get Arrangement Detail Information")
	@BxmCategory(logicalName = "Get Arrangement Detail Information")
	public LnDtlInqrySvcLnDtlOut getArrangementDtlInformation(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Build & Return Input Value
		 */
    	return _buildArrangementDetailOutput(arr);
	}

	private LnDtlInqrySvcLnDtlOut _buildArrangementDetailOutput(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcLnDtlOut lnDtlInqrySvcLnDtlOut = new LnDtlInqrySvcLnDtlOut();

		// General Information
		lnDtlInqrySvcLnDtlOut.setArrId(arr.getArrId());
		lnDtlInqrySvcLnDtlOut.setPdCd(arr.getPdCd());
		lnDtlInqrySvcLnDtlOut.setPdNm(arr.getPd().getPdNm());
		lnDtlInqrySvcLnDtlOut.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName(arr));
		lnDtlInqrySvcLnDtlOut.setArrStsCd(arr.getArrSts().getValue());

		lnDtlInqrySvcLnDtlOut.setChildPdCd(_getLnBizProc().getChildArrPdCd(arr));

		// Customer Information
		lnDtlInqrySvcLnDtlOut.setCustInfo(_getLoanCustomerInformation(arr.getMainCust(), arr.getArrId()));

		// Application Information
		lnDtlInqrySvcLnDtlOut.setAplctnInfoCntnt(_getLnBizProc().getLoanApplicationInfo(arr));

		// Bidding Information
		// 입찰자목록 취득
		LnDtlInqrySvcBiddingInfoOut lnDtlInqrySvcBiddingInfoOut = _getInvestorList(arr);

		// 입찰기본정보 취득
		lnDtlInqrySvcLnDtlOut.setBiddingInfo(_getBiddingInformation(arr, lnDtlInqrySvcBiddingInfoOut));

		return lnDtlInqrySvcLnDtlOut;
	}

	/**
     * 계약ID로  대출상세정보를 조회한다.
     * Search loan detail information by arrangement Id
     *
     * <pre>
	 *  <loan detail info>
	 *   1. Customer Information
	 *   2. Loan List
	 *   3. Application Information
	 *   4. Biding Information
	 *   5. Investor List
     * </pre>
     *
     * @param  in (required) LnDtlInqrySvcLnDtlIn: Arrangement id
     * @return LnDtlInqrySvcLnDtlOut Detail loan information
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getMyAccLoanDetail")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0250400", srvcNm="Get My Account Loan Detail")
	@BxmCategory(logicalName = "Get My Account Loan Detail")
	public LnDtlInqrySvcLnDtlIncludeSmrInfoOut getMyAccLoanDetail(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		LnDtlInqrySvcLnDtlIncludeSmrInfoOut out = new LnDtlInqrySvcLnDtlIncludeSmrInfoOut();

		Map<ArrXtnInfoEnum, String> xtnInforList = arr.getXtnInfoHash();

		/**
		 * Get loan purpose
		 */
		_getLoanPurpose(xtnInforList, out);

		/**
		 * Get loan customer information
		 */
		_getLoanCustomerInformation(arr.getMainCust(), out);

		/**
		 * Get loan information
		 */
		_buildOutput(arr, out);

		/**
		 * Get loan approval information
		 */
		_getApprovalInformation(arr, out, xtnInforList);

		/**
		 * Get loan balance information
		 */
		_getLoanBalanceSumAmount(arr, out);


    	return out;
	}

	private LnDtlInqrySvcLnDtlIncludeSmrInfoOut _getLoanPurpose(Map<ArrXtnInfoEnum, String> xtnInforList, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3)  throws BizApplicationException{

		if(!StringUtils.isEmpty(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE))) {
			out3.setLnPurposeCd(xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE));
			out3.setLnPurposeNm(_getCd().getCode("A0298", xtnInforList.get(ArrXtnInfoEnum.LOAN_PURPOSE_CODE)));
		}

		return out3;
	}

	private LnDtlInqrySvcLnDtlIncludeSmrInfoOut _getLoanCustomerInformation(Cust cust, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3)  throws BizApplicationException{

		out3.setCustNm(cust.getName());

		return out3;
	}

	private LnDtlInqrySvcLnDtlIncludeSmrInfoOut _buildOutput(Arr arr, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3)  throws BizApplicationException{

		String cntrtAmtStr = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()));
		ArrCnd intRtArrCnd = arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());

		if (intRtArrCnd!=null){
			BigDecimal intRt = ((ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue())).getAplyRt();

			if(intRt!=null){
				out3.setLnAplctnIntRt(intRt);
				out3.setAprvlAplctnIntRt(intRt);
			} else {
				out3.setLnAplctnIntRt(0);
				out3.setAprvlAplctnIntRt(0);
			}
		} else {
			out3.setLnAplctnIntRt(0);
			out3.setAprvlAplctnIntRt(0);
		}

		out3.setLnAplctnAmt(cntrtAmtStr);//신청금액
		out3.setAprvlAmt(cntrtAmtStr);//승인금액

		if(!arr.getArrSts().equals(ArrStsEnum.INITIATED) && !arr.getArrSts().equals(ArrStsEnum.APPLIED)){
			// 시스템완료전의 불완전데이터가 존재하여 시스템에러가 발생하여 Exception처리 해둠.
			try{
				_getApprovalInformation(arr, out3);
			}catch(Exception e) {
				out3.setLnAplctnAmt(999999);//신청금액
				logger.error("ignore exception: ",e);
			}
		} else {
			out3.setLnAplctnAmt(cntrtAmtStr);//신청금액
			out3.setAprvlAmt(0);//승인금액
		}

		String rpymntWayCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.REPAYMENT_METHOD_TYPE.getValue()));
		if(rpymntWayCd != null && !StringUtils.isEmpty(rpymntWayCd)) {
			out3.setRpymntWayCd(rpymntWayCd);
			out3.setRpymntWayNm(_getCd().getCode("50024", rpymntWayCd));
		}

		out3.setLonAprvlTrmCnt(_getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CONTRACT_TERM.getValue())));	 // Loan Term
		out3.setPrcsNm(_getArrCndInqryBizProc().getArrangementStatusName(arr));
		out3.setArrOpnDt(arr.getArrOpnDt());
		out3.setArrMtrtyDt(arr.getArrMtrtyDt());

		return out3;
	}

	private void _getApprovalInformation(Arr arr, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3, Map<ArrXtnInfoEnum, String> xtnInforList) throws BizApplicationException {

		// Set application value as approved value, In case the loan has been approved without any change
		out3.setAprvlAmt(out3.getLnAplctnAmt());
		out3.setAprvlAplctnIntRt(out3.getLnAplctnIntRt());

	    // Get arrangement status and conditions change history.
	    List<ArrStsCndCdChngHst> arrStsCndChngHst = arr.getArrStatusAndArrCndChangeHistory(null, null);

	    // Get application amount when arrangement amount is changed. (condition change).
	    for(ArrStsCndCdChngHst arrStsCndChngHstItm : arrStsCndChngHst){
	        if(ArrStsEnum.APPROVED.getValue().equals(arrStsCndChngHstItm.getArrStsCd())){
	        	switch (PdCndEnum.getEnum(arrStsCndChngHstItm.getCndCd())) {
				case CONTRACT_AMOUNT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out3.setLnAplctnAmt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}

					out3.setAprvlAmt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				case P2P_INT_RT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out3.setLnAplctnIntRt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}

					out3.setAprvlAplctnIntRt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				default:
					break;
					}
		        }
		    }
	}

	private LnDtlInqrySvcLnDtlIncludeSmrInfoOut _getLoanBalanceSumAmount(Arr arr, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3)  throws BizApplicationException{

		String crncyCd = _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		ArrBal arrBal = _getArrBalMngr().getArrBal(arr, AmtTpEnum.PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd);
		BigDecimal balAmt = arrBal.getLastBal();

		out3.setLnBalSumAmt(balAmt);

		return out3;
	}


	/**
     * 계약 식별자의 입찰마감까지의 잔여 입찰 일시를 조회한다.
     * Get remained bidding time until arrangement bidding closing by arrangement Id.
     * <pre>
     * flow description
     *
     * 1. Get remained bidding time until arrangement bidding closing by arrangement Id.
     *
     *</pre>
     * @param  in (required) LnDtlInqrySvcLnDtlIn: Arrangement id
     * @return LnDtlInqrySvcResidualBiddingTmOut Remained bidding time
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getBiddingDetail")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP8010400", srvcNm="Get Bidding Detail")
	@BxmCategory(logicalName = "Get Bidding Detail")
	public LnDtlInqrySvcResidualBiddingTmOut getBiddingDetail(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Build & Return
		 */
    	return _buildResidualBiddingTimeOutput(arr);
	}

	private LnDtlInqrySvcResidualBiddingTmOut _buildResidualBiddingTimeOutput(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcResidualBiddingTmOut residualBiddingTmInfoOut = new LnDtlInqrySvcResidualBiddingTmOut();
		//입찰마감일시
		String biddingClsgTmstmp = arr.getExtendAttribute(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP);

		String startTmstmp = _getCmnContext().getTxDate()+_getCmnContext().getTxHhmmss(); // 현재시간
		if (biddingClsgTmstmp != null && startTmstmp.compareTo(biddingClsgTmstmp) < 0) {
			//잔여입찰시간
			DateMngrCalDayHmsOut dateMngrCalDayHMSOut = _getDateCalculator().calculateDateByDayHourMinuteSecond(biddingClsgTmstmp);
			String residualBiddingTm ="";

			if(dateMngrCalDayHMSOut.getDay()>1){

				residualBiddingTm = dateMngrCalDayHMSOut.getDay()+"days "+dateMngrCalDayHMSOut.getHr()+":"+dateMngrCalDayHMSOut.getMnut()+":"+dateMngrCalDayHMSOut.getScnd();

			}
			else{
				residualBiddingTm = dateMngrCalDayHMSOut.getDay()+"day "+dateMngrCalDayHMSOut.getHr()+":"+dateMngrCalDayHMSOut.getMnut()+":"+dateMngrCalDayHMSOut.getScnd();
			}

			residualBiddingTmInfoOut.setResidualBiddingHms(residualBiddingTm);
		}

		return residualBiddingTmInfoOut;
	}

	/**
     * 계약 식별자의 투자자목록을 조회한다.
     * Search investor list by arrangement Id.
     * <pre>
     * flow description
     *
     * 1. 계약 식별자에 해당하는 대출 정보를 조회한다.
     *
     * 1. Get the loan information using arrangement identification.
     *
     * 2. 출력을 조립하고 반환한다.
     * 	2.1 입찰자(투자자) 목록
     *
     * 2. Assemble output & return.
	 *  2.1 Investor List
     * </pre>
     * @param  in (required) LnDtlInqrySvcLnDtlIn : customer id, application main, application information, loan consultant application code...
     * @return LnDtlInqrySvcLnListOut Investment list
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getInvstrList")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP8040400", srvcNm="Get Investor List")
	@BxmCategory(logicalName = "Get Investor List")
	public LnDtlInqrySvcLnDtlOut getInvstrList(LnDtlInqrySvcLnDtlIn in)  throws BizApplicationException{

		/**
		 * Get P2P Loan Arrangement object
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

		/**
		 * Build & Return Input Value
		 */
    	return _buildInvestorListOutput(arr);
	}

	private LnDtlInqrySvcLnDtlOut _buildInvestorListOutput(Arr arr) throws BizApplicationException {

		LnDtlInqrySvcLnDtlOut lnDtlInqrySvcLnDtlOut = new LnDtlInqrySvcLnDtlOut();

		// Biding Information
		lnDtlInqrySvcLnDtlOut.setBiddingInfo(_getInvestorList(arr));

		return lnDtlInqrySvcLnDtlOut;
	}

	private void _getApprovalInformation(Arr arr, LnDtlInqrySvcLnDtlIncludeSmrInfoOut out3) throws BizApplicationException {

        // Get arrangement status and conditions change history.
        List<ArrStsCndCdChngHst> arrStsCndChngHst = arr.getArrStatusAndArrCndChangeHistory(CCM01.MIN_DATE, CCM01.MAX_DATE);

        // Get application amount when arrangement amount is changed. (condition change).
        for(ArrStsCndCdChngHst arrStsCndChngHstItm : arrStsCndChngHst){
            if(ArrStsEnum.APPROVED.getValue().equals(arrStsCndChngHstItm.getArrStsCd())){

            	switch (PdCndEnum.getEnum(arrStsCndChngHstItm.getCndCd())) {

				case CONTRACT_AMOUNT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out3.setLnAplctnAmt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}

					out3.setAprvlAmt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				case P2P_INT_RT:
					if(arrStsCndChngHstItm.getBfChngCndCdCntnt() != null){
						out3.setLnAplctnIntRt(arrStsCndChngHstItm.getBfChngCndCdCntnt());
					}

					out3.setAprvlAplctnIntRt(arrStsCndChngHstItm.getAfChngCndCdCntnt());
					break;

				default:
					break;
				}
            }
        }
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
	 * @return the lnBizProc
	 */
	private LnBizProc _getLnBizProc() {
		if (lnBizProc == null) {
			lnBizProc = (LnBizProc) CbbApplicationContext.getBean(LnBizProc.class, lnBizProc);
		}
		return lnBizProc;
	}
}
