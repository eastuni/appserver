package bankware.corebanking.p2plending.bidding.service;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.StringUtils;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrCndInqryBizProc;
import bankware.corebanking.arrangementtransaction.creation.bizproc.ArrTxCrtnBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingRsltExecuteSvcIn;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingStsQuerySvcIn;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingStsQuerySvcOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.product.enums.pdcondition.PdCndP2pBidWayEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bankware.corebanking.settlement.enums.AmtTpEnum;
import bankware.corebanking.settlement.enums.BalTpEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;

/**
 * 이 서비스는 투자금과 부분낙찰허용여부 정보를 기준으로 P2P대출계약과 P2P투자계약의 계약진행상태를 변경한다.
 *
 * This service changes P2P loan arrangement status and P2P investment arrangement status
 * based on investment amount and partial bidding accept flag
 *
 * Author	Kisu Kim
 * History
 *  2016.02.25	initial version for 3.0
 */
@BxmCategory(logicalName = "Bidding Status Query Service")
@CbbClassInfo(classType = "SERVICE")
@BxmService("BiddingStsQuerySvc")
public class BiddingStsQuerySvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext			cmnContext;			// Common context
	private ArrMngr				arrMngr;			// Arrangement manager
	private ArrBalMngr			arrBalMngr;			// Arrangement balance manager
	private ArrCndInqryBizProc	arrCndInqryBizProc;	// Arrangement condition inquiry bizproc
	private ArrTxCrtnBizProc		arrTxCrtnBizProc;	// Arrangement transaction creation bizproc

	/**
	 * Change parent arrangement status and Children arrangement status
	 *
	 * <pre>
	 * 1. 고객 식별자로 고객을 가져온다.
	 * 
	 * 1. Get the customer using customer identification.
	 * 
	 * 2. 대출계약진행상태를 결정한다.
	 *    1) 입찰방식이 금액낙찰방식인 경우,
	 *        1.1. 입찰마감일시가 경과되지않고
	 *             1.1.1. 투자금액이 대출금액보다 적으면 -> 입찰 
	 *             1.1.2. 투자금액이 대출금액과 같으면    -> 낙찰
	 *        1.2. 입찰마감일시가 경과되고 
	 *             1.2.1. (투자금액이 대출금액보다 적고 && 부분낙찰허용안함) || 투자금액이 0원이면  ->유찰
	 *             1.2.2. 위의 2.1.이외는 -> 낙찰
	 *                    1.2.2.1. 투자금액이 대출금액과 같지 않으면, 투자금액을 대출금액으로 변경
	 *              
	 *    2) 입찰방식이 기간낙찰방식인 경우,
	 *        2.1. 입찰마감일시가 경과되지않고 ->입찰
	 *        2.2. 입찰마감일시가 경과되고 
	 *             2.2.1. 투자금액이 대출금액보다 적으면  ->유찰
	 *             2.2.2. 투자금액이 대출금액보다 적지 않으면 -> 낙찰
	 * 
	 * 2. Decide the status of P2P loan arrangement using the information of investment amount and partial bidding accept flag
	 *    1) If the bidding way is amount bidding way
	 *        1.1  When the bidding close time is not over
	 *             1.1.1. If the amount of investment is less than the loan amount -> bidding
	 *             1.1.2. If the amount of investment is same as the loan amount -> winning
	 *        1.2  When the bidding close time is over
	 *             1.2.1. (The amount of investment is less than loan amount and not allowed to partial bidding) || 
	 *                       If the amount of investment is 0 -> fail
	 *             1.2.2. Except the 2.1. above -> winning
	 *                    1.2.2.1. If the amount of investment is not equals to the loan amount, 
	 *                               -> change the amount of investment into the loan amount  
	 *              
	 *    2) When the bidding way is Reverse Auction,
	 *        2.1 When the close date of bid is not over -> bidding
	 *        2.2 When the close date of bid is over
	 *            2.2.1. If the amount of investment is less than the loan amount -> fail
	 *            2.2.2. If the amount of investment is larger than the loan amount -> winning
	 * 
	 * 3. 출력을 조립하고 반환한다.
	 * 
	 * 3. Assemble the output & return.
	 * </pre>
	 * @param  in (required) BiddingRsltExecuteSvcIn: Application number, Customer identification, Arrangement identification
	 * @return BiddingRsltExecuteSvcOut Arrangement result
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("getBiddingStatusDecideByTransactionDate")
	@CbbSrvcInfo(srvcCd = "SPP1050401", srvcNm = "Get Bidding Status Decided By Transaction Date")
	public BiddingStsQuerySvcOut getBiddingStatusDecideByTransactionDate(BiddingStsQuerySvcIn in) throws BizApplicationException {

		// Get the arrangement
		Arr arr = _getArrMngr().getArr(in.getArrId());

		// Decide the status winning or fail bidding
		String biddingSts = _decideBiddingStatus(arr);

		if(ArrStsEnum.WINNING_BID.getValue().equals(biddingSts)) {
	    	// Execute the winning bidding
	    	BiddingRsltExecuteSvcIn biddingRsltExecuteSvcIn = new BiddingRsltExecuteSvcIn();
	    	biddingRsltExecuteSvcIn.setArrId(arr.getArrId());
	    	biddingRsltExecuteSvcIn.setBiddingStsCd(ArrStsEnum.WINNING_BID.getValue());

	    	CbbInternalServiceExecutor.execute("SPP1061201", biddingRsltExecuteSvcIn);
		} else if(ArrStsEnum.FAILURE.getValue().equals(biddingSts)) {
	    	// Execute the FAILURE bidding
	    	BiddingRsltExecuteSvcIn biddingRsltExecuteSvcIn = new BiddingRsltExecuteSvcIn();
	    	biddingRsltExecuteSvcIn.setArrId(arr.getArrId());
	    	biddingRsltExecuteSvcIn.setBiddingStsCd(ArrStsEnum.FAILURE.getValue());

	    	CbbInternalServiceExecutor.execute("SPP1061201", biddingRsltExecuteSvcIn);
		} else if(ArrStsEnum.START_BID.getValue().equals(biddingSts)) {
			// Nothing to do
		}

		// Assemble the output & return
		return _assembleOutput(biddingSts, arr.getArrId());
	}

	private String _decideBiddingStatus(Arr arr) throws BizApplicationException {

		String biddingSts	 	= null;
		String biddingEndDt		= arr.getXtnInfoHash().get(ArrXtnInfoEnum.BIDDING_CLOSING_TIMESTAMP);
		String crncyCd 			= _getArrCndInqryBizProc().getArrangementConditionValue(arr.getArrCnd(PdCndEnum.CURRENCY.getValue()));
		BigDecimal cntrctAmt 	= ((ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue())).getRngVal();
		BigDecimal lendingAmt 	= _getArrBalMngr().getArrBal(arr, AmtTpEnum.BIDDING_PRNCPL.getValue(), BalTpEnum.CURRENT.getValue(), crncyCd).getLastBal();

		// The conditions defined in the arrangement
		String prtlBiddingAccptYn = ((ArrCndLst) arr.getArrCnd(PdCndEnum.P2P_PARTIAL_BIDDING_ACCEPT_YN)).getCndVal();

		// The conditions defined in the product
		ArrCnd bidWayCnd = arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue());
		String bidWayValue = bidWayCnd.getCndValDefault();
		if(bidWayValue==null){
			bidWayValue="01";
		}

		/**
		 * 1. 입찰방식이 금액낙찰방식인 경우,
		 *    1.1 입찰마감일시가 경과되지않고 
		 *        1.1.1. 투자금액이 대출금액보다 적으면 -> 입찰
		 *        1.1.2. 투자금액이 대출금액과 같으면    -> 낙찰
		 *    1.2. 입찰마감일시가 경과되고 
		 *        1.2.1. (투자금액이 대출금액보다 적고 && 부분낙찰허용안함) || 투자금액이 0원이면  ->유찰
		 *        1.2.2. 위의 2.1.이외는 -> 낙찰
		 *               1.2.2.1 투자금액이 대출금액과 같지 않으면, 투자금액을 대출금액으로 변경
		 *              
		 * 2. 입찰방식이 기간낙찰방식인 경우,
		 *    2.1. 입찰마감일시가 경과되지않고 ->입찰
		 *    2.2. 입찰마감일시가 경과되고 
		 *        2.2.1. 투자금액이 대출금액보다 적으면  ->유찰
		 *        2.2.2. 투자금액이 대출금액보다 적지 않으면 -> 낙찰
		 */
		if(PdCndP2pBidWayEnum.AMOUNT_BID_WAY.getValue().equals(bidWayValue)) {	// FIXME bidWayValue -> biddingWay
			if(biddingEndDt.compareTo(_getCmnContext().getTxDate() + _getCmnContext().getTxHhmmss()) > 0) {
				if(cntrctAmt.compareTo(lendingAmt) > 0) {
					biddingSts = ArrStsEnum.START_BID.getValue();
				} else {
					biddingSts = ArrStsEnum.WINNING_BID.getValue();
				}
			} else {
				if((cntrctAmt.compareTo(lendingAmt) > 0 && CCM01.NO.equals(prtlBiddingAccptYn)) 
						|| (lendingAmt.compareTo(BigDecimal.ZERO)==0)) {
					biddingSts = ArrStsEnum.FAILURE.getValue();
				} else {
					if(cntrctAmt.compareTo(lendingAmt) != 0){
						//승인금액을 변경
						ArrCndRng arrCntRng = (ArrCndRng) arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue());
						// create transaction with assembled entries
						ArrTx arrTx = _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, null);
						arrCntRng.modifyCndValue(_getCmnContext().getTxDate(), lendingAmt.toString(), _getCmnContext().getTxDate(), arrTx.getTxSeqNbr());
					}

					biddingSts = ArrStsEnum.WINNING_BID.getValue();
				}
			}
		} else if(PdCndP2pBidWayEnum.TERM_BID_WAY.getValue().equals(bidWayValue)) {	// FIXME bidWayValue -> biddingWay
			if(biddingEndDt.compareTo(_getCmnContext().getTxDate() + _getCmnContext().getTxHhmmss()) > 0) {
				biddingSts = ArrStsEnum.START_BID.getValue();

			} else {
				if(cntrctAmt.compareTo(lendingAmt) > 0) {
					biddingSts = ArrStsEnum.FAILURE.getValue();
				} else {
					biddingSts = ArrStsEnum.WINNING_BID.getValue();
				}
			}
		}

		if (StringUtils.isEmpty(biddingSts)){
			// The bidding result does not exist. Please check the entered value.
    		throw new BizApplicationException("AAPPPE0007", null);
    	}

		return biddingSts;
	}

	private BiddingStsQuerySvcOut _assembleOutput(String biddingSts, String arrId) {

		BiddingStsQuerySvcOut out = new BiddingStsQuerySvcOut();

		out.setArrStsCd(biddingSts);
		out.setArrId(arrId);

		return out;
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
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
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
}
