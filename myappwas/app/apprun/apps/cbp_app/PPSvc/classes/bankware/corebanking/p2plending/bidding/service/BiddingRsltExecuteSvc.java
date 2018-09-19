package bankware.corebanking.p2plending.bidding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.P2p;
import bankware.corebanking.arrangement.enums.ArrStsChngRsnEnum;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.modification.bizproc.ArrMdfctnBizProc;
import bankware.corebanking.arrangementtransaction.creation.bizproc.ArrTxCrtnBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrStsChngIn;
import bankware.corebanking.customer.inquiry.bizproc.CustInfoInqryBizProc;
import bankware.corebanking.deposit.modification.bizproc.DpstMdfctnBizProc;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingRsltExecuteSvcIn;
import bankware.corebanking.p2plending.bidding.service.dto.BiddingRsltExecuteSvcOut;
import bankware.corebanking.settlement.arrangementtransaction.interfaces.ArrTx;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 입력받은 입찰 결과에 따라 계약의 상태를 바꿔줍니다.
 * This service changes P2P loan arrangement status and P2P investment arrangements status
 *
 * Author	Kisu Kim
 * History
 *  2016.01.21	initial version for 3.0
 */
@BxmCategory(logicalName = "Bidding Result Execute Service")
@CbbClassInfo(classType = "SERVICE")
@BxmService("BiddingRsltExecuteSvc")
public class BiddingRsltExecuteSvc {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrMngr				arrMngr;
	private ArrMdfctnBizProc		arrMdfctnBizProc;
	private ArrTxCrtnBizProc		arrTxCrtnBizProc;
	private CustInfoInqryBizProc custInfoInqryBizProc;
	private DpstMdfctnBizProc	dpstMdfctnBizProc;

	/**
	 * Change parent arrangement status and Children arrangement status
	 *
	 * <pre>
	 * Winning Bid - Parent arrangement, D -> W
	 * Failure Bid - Parent arrangement, D -> F, Children arrangement L -> F
	 * Start Bid - Nothing to do
	 * </pre>
	 * @param  in (required) BiddingRsltExecuteSvcIn: Bidding status, Arrangement identification
	 * @return BiddingRsltExecuteSvcOut Bidding result
	 * @throws BizApplicationException
	 */
	@BxmServiceOperation("executeBiddingResult")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd = "SPP1061201", srvcNm = "Execute Bidding Result")
	public BiddingRsltExecuteSvcOut executeBiddingResult(BiddingRsltExecuteSvcIn in) throws BizApplicationException {

		/**
		 * Get the arrangement
		 */
		Arr arr = _getArrMngr().getArr(in.getArrId());

		/**
		 * Check the bidding status, D -> W or F
		 */
		_checkBiddingStatus(arr);

		/**
		 * Execute the bidding result
		 */
		_executeBiddingResult(arr, in);

		/**
		 * Assemble the output & return
		 */
		return _assembleOutput();
	}

	private void _checkBiddingStatus(Arr arr) throws BizApplicationException {

		if(!ArrStsEnum.START_BID.getValue().equals(arr.getArrSts().getValue())) {
			// Bidding is not a progress . Please check the bidding status .
			throw new BizApplicationException("AAPPPE0002", null);
		}
	}

	private String _executeBiddingResult(Arr arr, BiddingRsltExecuteSvcIn in) throws BizApplicationException {

		String biddingSts = in.getBiddingStsCd();

		if(ArrStsEnum.WINNING_BID.getValue().equals(biddingSts)) {
			String arrStsChngRsn = ArrStsChngRsnEnum.WINNING_BID.getValue();

			_executeWinningBid(arr, biddingSts, arrStsChngRsn);
		} else if(ArrStsEnum.FAILURE.getValue().equals(biddingSts)) {
			String arrStsChngRsn = ArrStsChngRsnEnum.FAILURE_BID.getValue();

			_executeFailureBid(arr, biddingSts, arrStsChngRsn);
		} else if(ArrStsEnum.START_BID.getValue().equals(biddingSts)) {
			// Nothing to do
		}

		return biddingSts;
	}

	private void _executeWinningBid(Arr arr, String biddingSts, String arrStsChngRsn) throws BizApplicationException {

		// Parent arrangement, D -> W
		_changeParentArrangementStatus(arr, biddingSts, arrStsChngRsn);

	}

	private void _executeFailureBid(Arr arr, String biddingSts, String arrStsChngRsn) throws BizApplicationException {

		// Parent arrangement, D -> F
		_changeParentArrangementStatus(arr, biddingSts, arrStsChngRsn);

		// Children arrangement L -> F
		_chnageChildrenArrangemnetStatus(arr, biddingSts, arrStsChngRsn);
	}

	private void _changeParentArrangementStatus(Arr arr, String biddingSts, String arrStsChngRsn) throws BizApplicationException {

		_changeArrangementStatus(arr, biddingSts, arrStsChngRsn);
	}

	private void _chnageChildrenArrangemnetStatus(Arr arr, String biddingSts, String arrStsChngRsn) throws BizApplicationException {

		for(int i = 0; i < arr.getChildren().size(); i++) {
			_changeArrangementStatus((Arr) arr.getChildren().get(i), biddingSts, arrStsChngRsn);
		}
	}

	private ArrTx _changeArrangementStatus(Arr arr, String biddingSts, String arrStsChngRsn) throws BizApplicationException {

		ArrTx arrTx = _getArrTxCrtnBizProc().createArrangementTransactionHistory(arr, null);

		if(arr.getMthrArr() == null) {
			// Loan arrangement
			P2p p2pArr = (P2p) arr;

			ArrStsChngIn arrStsChngIn = _setArranementStatusChangeIn(arrTx, arrStsChngRsn);

			if(ArrStsEnum.WINNING_BID.getValue().equals(biddingSts)) {
				// 역경매인 경우 투자 금리 확정
				p2pArr.winBid(arrStsChngIn);
			} else if(ArrStsEnum.FAILURE.getValue().equals(biddingSts)) {
				// Loan arrangement && Failure Bidding
				p2pArr.failBid(arrStsChngIn);
			}
		} else {
			// Investment arrangement
			ArrStsChngIn arrStsChngIn = _setArranementStatusChangeIn(arrTx, arrStsChngRsn);

			if(ArrStsEnum.FAILURE.getValue().equals(biddingSts)
				&& 	!ArrStsEnum.ABANDONED.getValue().equals(arr.getArrSts().getValue())
				) {
				// Investment arrangement && Failure Bidding
				arr.fail(arrStsChngIn);

				_linkReleaseFreezing(arr, _getCustInfoInqryBizProc().getCustomerDepositAccountNumberByArrangement(arr), arrTx.getCrncyCd());

			}
		}

		return arrTx;
	}

	private ArrStsChngIn _setArranementStatusChangeIn(ArrTx arrTx, String arrStsChngRsn) {

		ArrStsChngIn arrStsChngIn = _getArrMdfctnBizProc().setArrangementStatusChangeIn(arrTx);
		arrStsChngIn.setArrStsChngRsnCd(arrStsChngRsn);

		return arrStsChngIn;
	}

	private void _linkReleaseFreezing(Arr arr, String whdrwlAcctNbr, String crncyCd) throws BizApplicationException {

		_getDpstMdfctnBizProc().clearFreezingAmount(arr, whdrwlAcctNbr, crncyCd);
	}

	private BiddingRsltExecuteSvcOut _assembleOutput() {

		BiddingRsltExecuteSvcOut out = new BiddingRsltExecuteSvcOut();

		// TODO

		return out;
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
