package bankware.corebanking.p2ploan.information.service;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.accounting.journalizing.interfaces.Acctg;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrDeptMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.enums.ArrDeptRelEnum;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2ploan.bizproc.LnBizProc;
import bankware.corebanking.p2ploan.information.service.dto.LnListInqryCndListIn;
import bankware.corebanking.p2ploan.information.service.dto.LnListInqrySvcLnListIn;
import bankware.corebanking.p2ploan.information.service.dto.LnListInqrySvcLnListOut;
import bankware.corebanking.p2ploan.information.service.dto.LnListInqrySvcLnListOutIncludeSmryInfoOut;
import bankware.corebanking.p2ploan.information.service.dto.LnListOut;
import bankware.corebanking.product.constant.CPD01;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 P2P대출목록을 조회한다.
 * This service allows to inquire P2P loan list
 *
 * Author	Sungbum Kim
 * History
 */
@BxmCategory(logicalName ="P2P Loan Inquiry Service")
@CbbClassInfo(classType={"SERVICE"})
@BxmService("LnListInqrySvc")
public class LnListInqrySvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrCustMngr	arrCustMngr ;	// Arrangement customer manager
	private Acctg	acctg ;		// Account manager
	private LnBizProc	lnBizProc;		// Loan bizproc
	private ArrDeptMngr	arrDeptMngr;	// Arrangement department manager
	private CmnContext 			cmnContext;			// Common System Header Utility

	/**
     * 특정 고객에 대한 대출목록을 조회한다.
     * Search loan list of specific Customer Id
     *
	 * <pre>
	 * 1. Set default value
	 *    1.1 Set Department Code when it is null
	 *    1.2 Set Start date when it is null
	 *    1.3 Set End date when it is null
	 *
	 * 2. Get P2P Loan List By Customer Identification
	 *
	 * 3. Assemble the output & return
	 * </pre>
	 *
     * @param  in (required) LnListInqrySvcLnListIn : Information for querying
     * @return LnListInqrySvcLnListOut Loan list
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getLoanListByCust")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0110400", srvcNm="Get Loan List by CustID")
	@BxmCategory(logicalName = "Get Loan List by CustID")
	public LnListInqrySvcLnListOut getLoanListByCust(LnListInqrySvcLnListIn in)  throws BizApplicationException{

		/**
		 * Set default value
		 */
		_setDefaultValue(in);

		/**
		 * Get P2P Loan List By Cust ID
		 */
		List<Arr> arrList = _getLoanListByCustomer(in);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput(arrList);
	}

	/**
     * Set default value
     * @param in (required) LnListInqrySvcLnListIn
     * @return  void
     * @throws BizApplicationException
     */
	private void _setDefaultValue(LnListInqrySvcLnListIn in) throws BizApplicationException {

		if(StringUtils.isEmpty(in.getDeptId())){
			// 기관별 파라미터 설정 방식을 통한 회계처리부서 선택하는 방법
			in.setDeptId(_getCmnContext().getDeptId());
		}
		if(StringUtils.isEmpty(in.getInqryStartDt())){
			in.setInqryStartDt(CCM01.MIN_DATE);
		}
		if(StringUtils.isEmpty(in.getInqryEndDt())){
			in.setInqryEndDt(CCM01.MAX_DATE);
		}
	}

	/**
     * Get P2P Loan List of specific Customer Id and arrangement status code
     * @param in (required) LnListInqrySvcLnListIn
     * @return  List<Arr>
     * @throws BizApplicationException
     */
	private List<Arr> _getLoanListByCustomer(LnListInqrySvcLnListIn in) throws BizApplicationException {

		// 2016.03.16 계약목록 변경 오윤화
		String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
		String stsCd = in.getLnAplctnPrcsDscd();
		List<ArrReal> arrRealList = null;

		if (StringUtils.isEmpty(stsCd)){
			arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), null, bizDscd, null, null, null);
		} else {
			arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), ArrStsEnum.getEnum(in.getLnAplctnPrcsDscd()), bizDscd, null, null, null);
		}

		List<Arr> arrList = new ArrayList<Arr>();
		for(ArrReal arrReal : arrRealList){
			arrList.add((Arr)arrReal);
		}

		return arrList;
	}

	/**
	 * Making Output object
     * @param p2pLoanList (required) List<Arr>
     * @return  LnListInqrySvcLnListOut
     * @throws BizApplicationException
     */
	private LnListInqrySvcLnListOut _buildOutput(List<Arr> arrList) throws BizApplicationException {

		LnListInqrySvcLnListOut lnListInqrySvcLnListOut = new LnListInqrySvcLnListOut();

		lnListInqrySvcLnListOut.setLoanList(_getLnBizProc().getLoanList(arrList, false));

		return lnListInqrySvcLnListOut;
	}

	/**
     * 대출계약상태를 기준으로 대출목록을 조회한다.
     * Search loan list based on loan arrangement status
     *
	 * <pre>
	 * 1. Set default value
	 *    1.1 Set Department Code when it is null
	 *    1.2 Set Start date when it is null
	 *    1.3 Set End date when it is null
	 *
	 * 2. Get P2P Loan List By Arrangement Status
	 *
	 * 3. Assemble the output & return
	 * </pre>
     * @param  in (required) lnListInqrySvcLnListIn : Arrangement status
     * @return LnListInqrySvcLnListOut
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getLoanListByPrgrsSts")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP0210400", srvcNm="Get Loan List by Progress Status Distinction Code")
	@BxmCategory(logicalName = "Get Loan List by Progress Status Distinction Code")
	public LnListInqrySvcLnListOut getLoanListByPrgrsSts(LnListInqrySvcLnListIn in)  throws BizApplicationException{

		/**
		 * Set default value
		 */
		_setDefaultValue(in);

		/**
		 * Get P2P Loan List By Arrangement Status
		 */
		List<Arr> arrList = _getLoanListByProgressStatus(in);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutput(arrList);
	}

	/**
     * Get P2P Loan List By Arrangement Status
     * @param in (required) LnListInqrySvcLnListIn
     * @return  List<Arr>
     * @throws BizApplicationException
     */
	private List<Arr> _getLoanListByProgressStatus(LnListInqrySvcLnListIn in) throws BizApplicationException {

		String deptId = in.getDeptId();
		String arrSts = in.getLnAplctnPrcsDscd();
		String inqryStartDt = in.getInqryStartDt();
		String inqryEndDt = in.getInqryEndDt();

		// 2016.03.16 계약목록 변경 오윤화
		List<Arr> arrList = new ArrayList<Arr>();
		List<ArrReal> arrRealList = null;

		if(StringUtils.isEmpty(arrSts)) {
			return null;
		} else if(arrSts.equals(ArrStsEnum.INITIATED.getValue())) {
			arrRealList = _getArrDeptMngr().getListArrBasedOnStsHistory(deptId, ArrDeptRelEnum.ACCOUNTING_UNIT, ArrStsEnum.INITIATED, ArrStsEnum.INITIATED, inqryStartDt, inqryEndDt);
		} else {
			arrRealList = _getArrDeptMngr().getListArrBasedOnStsHistory(deptId, ArrDeptRelEnum.ACCOUNTING_UNIT, ArrStsEnum.getEnum(arrSts), ArrStsEnum.APPLIED, inqryStartDt, inqryEndDt);
		}

		for(ArrReal arrReal : arrRealList){
			arrList.add((Arr)arrReal);
		}

		return arrList;
	}

	/**
	 * 기간과 금리를 조건으로 입찰중인 대출목록을 조회한다.
     * Search loan list of arrangement Bidding status
     *
	 * <pre>
	 * 1. Set default value
	 *    1.1 Set Department Code when it is null
	 *    1.2 Set Start date when it is null
	 *    1.3 Set End date when it is null
	 *
	 * 2. Get P2P loan list of arrangement Bidding status
	 *
	 * 3. Assemble the output & return
	 *    3.1 assemble result by Term and Rate
	 * </pre>
     * @param  in (required) lnListInqrySvcLnListIn : Arrangement status->Start Bid, Contract Term, P2P Interest Rate
     * @return lnListInqrySvcLnListOut Loan list
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getBiddingListByCnds")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP2010400", srvcNm="Get Bidding List by Term and Rate")
	@BxmCategory(logicalName = "Get Bidding List by Term and Rate")
	public LnListInqrySvcLnListOut getBiddingListByCnds(LnListInqrySvcLnListIn in)  throws BizApplicationException{

		/**
		 * Set default value
		 */
		_setDefaultValue(in);

		/**
		 * Get P2P Loan List By Arrangement Status
		 */
		List<Arr> arrList = _getBiddingListByConditions(in);

		/**
		 * Build & Return Input Value
		 */
    	return _buildOutputByConditions(arrList, in);
	}

	/**
     * 대출계약상태를 기준으로 대출목록을 조회한다.
     * Search loan list based on loan arrangement status
     *
	 * <pre>
	 * 1. Set default value
	 *    1.1 Set Department Code when it is null
	 *    1.2 Set Start date when it is null
	 *    1.3 Set End date when it is null
	 *
	 * 2. Get P2P Loan List of specific Customer Id
	 *
	 * 3. Assemble the output & return
	 *    3.1 assemble result by arrangement status
	 * </pre>
     * @param  in (required) lnListInqrySvcLnListIn : Arrangement status (D:Start Bidding, A:Active, T:Terminated)
     * @return lnListInqrySvcLnListOut Loan list
     * @throws BizApplicationException
     */
	@BxmServiceOperation("getLoanList")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP3040400", srvcNm="Get Loan List")
	@BxmCategory(logicalName = "Get Loan List")
	public LnListInqrySvcLnListOutIncludeSmryInfoOut getLoanList(LnListInqrySvcLnListIn in)  throws BizApplicationException{

		/**
		 * Set default value
		 */
		_setDefaultValue(in);

		/**
		 * Get P2P Loan List By Customer ID
		 */
		List<Arr> arrList = _getLoanAllList(in);

		/**
		 * Build & Return Input Value
		 */
		return _buildOutput(arrList, in.getLnAplctnPrcsDscd());
	}

	/**
     * Get P2P Loan List of specific Customer Id
     * @param in (required) LnListInqrySvcLnListIn
     * @return  List<Arr>
     * @throws BizApplicationException
     */
	private List<Arr> _getLoanAllList(LnListInqrySvcLnListIn in) throws BizApplicationException {

		// 2016.03.16 계약목록 변경 오윤화
		String bizDscd = CPD01.PD_BIZ_DSCD_LN; //여신:02 (Product Business Distinction Code Loan)-대출
		List<ArrReal> arrRealList = _getArrCustMngr().getListCustOwnArrBasedOnArrBasic(in.getCustId(), null, bizDscd, null, null, null);

		List<Arr> arrList = new ArrayList<Arr>();
		for(ArrReal arrReal : arrRealList){
			arrList.add((Arr)arrReal);
		}

		return arrList;
	}

    /**
	 * Making Output object
     * @param in (required) List<ArrReal>
     * @param in (required) String
     * @return LnListInqryMgmtSvcLnListOut
     * @throws BizApplicationException
     */
	private LnListInqrySvcLnListOutIncludeSmryInfoOut _buildOutput(List<Arr> arrList, String lnAplctnPrcsDstnctnCd) throws BizApplicationException {

		List<LnListOut> loanList = _getLnBizProc().getLoanList(arrList, false);

		LnListInqrySvcLnListOutIncludeSmryInfoOut out = _filterList(loanList, lnAplctnPrcsDstnctnCd);

		return out;
	}

    /**
     * Filtering Information
     *
     * @param in (required) List<LnListOut>
     * @param in (required) String
     * @return LnListInqryMgmtSvcLnListOut
     * @throws BizApplicationException
     */
    private LnListInqrySvcLnListOutIncludeSmryInfoOut _filterList(List<LnListOut> loanList, String lnAplctnPrcsDstnctnCd) throws BizApplicationException {

    	LnListInqrySvcLnListOutIncludeSmryInfoOut out = new LnListInqrySvcLnListOutIncludeSmryInfoOut();

		BigDecimal lnAplctnCnt = BigDecimal.ZERO;				// Loan application Count
    	BigDecimal lnAplctnSumAmt = BigDecimal.ZERO;			// Loan application Sum Amount
    	BigDecimal lnBiddingCnt = BigDecimal.ZERO;				// Loan Bidding Count
    	BigDecimal lnBiddingSumAmt = BigDecimal.ZERO;			// Loan Bidding Sum Amount
    	BigDecimal lnRpymntCnt = BigDecimal.ZERO;				// Loan Repayments Count
    	BigDecimal lnRpymntSumAmt = BigDecimal.ZERO;			// Loan Repayments Sum Amount
    	BigDecimal lnTrmntCnt = BigDecimal.ZERO;				// Loan Terminate Count(Loan Completion Count)
    	BigDecimal lnTrmntSumAmt = BigDecimal.ZERO;				// Loan Terminate Sum Amount(Loan Completion Amount)
		List<LnListOut> newLnListOut = new ArrayList<LnListOut>();

		for(LnListOut arrLoan : loanList) {
    		BigDecimal cntrtAmt = arrLoan.getAplctnAmt();
    		if(ArrStsEnum.APPLIED.getValue().equals(arrLoan.getArrStsCd())) {     //  Applied Count and Loan Sum Contract Amount
    			lnAplctnCnt = lnAplctnCnt.add(BigDecimal.ONE);
    			lnAplctnSumAmt = lnAplctnSumAmt.add(cntrtAmt);
    		}

    		if(ArrStsEnum.START_BID.getValue().equals(arrLoan.getArrStsCd())) {		// Bidding Loan Count and Loan Sum Contract Amount
    			lnBiddingCnt = lnBiddingCnt.add(BigDecimal.ONE);
    			lnBiddingSumAmt = lnBiddingSumAmt.add(cntrtAmt);
    		}

    		if(ArrStsEnum.ACTIVE.getValue().equals(arrLoan.getArrStsCd())) {		// Active Loan Count and Loan Sum Amount
    			lnRpymntCnt = lnRpymntCnt.add(BigDecimal.ONE);
    			lnRpymntSumAmt = lnRpymntSumAmt.add(cntrtAmt);
    		}

    		if(ArrStsEnum.TERMINATED.getValue().equals(arrLoan.getArrStsCd())) {		// Terminate Loan Count and Loan Sum Contract Amount
    			lnTrmntCnt = lnTrmntCnt.add(BigDecimal.ONE);
    			lnTrmntSumAmt = lnTrmntSumAmt.add(cntrtAmt);
    		}

    		// reset search result
    		if(!StringUtils.isEmpty(lnAplctnPrcsDstnctnCd) && lnAplctnPrcsDstnctnCd.equals(arrLoan.getArrStsCd())) {
    			newLnListOut.add(arrLoan);
    		}
    	}	// end of for

    	out.setLoanList(newLnListOut);

    	// Generate Output data
    	out.setLnAplctnCnt(lnAplctnCnt);
    	out.setLnAplctnSumAmt(lnAplctnSumAmt);
    	out.setLnBiddingCnt(lnBiddingCnt);
    	out.setLnBiddingSumAmt(lnBiddingSumAmt);
    	out.setLnRpymntCnt(lnRpymntCnt);
    	out.setLnRpymntSumAmt(lnRpymntSumAmt);
    	out.setLnTrmntCnt(lnTrmntCnt);
    	out.setLnTrmntSumAmt(lnTrmntSumAmt);

    	return out;
    }

    /**
	 * Making Output object
     * @param arrList (required) List<Arr>
     * @param in (required) LnListInqrySvcLnListIn
     * @return  LnListInqrySvcLnListOut
     * @throws BizApplicationException
     */
	private LnListInqrySvcLnListOut _buildOutputByConditions(List<Arr> arrList, LnListInqrySvcLnListIn in) throws BizApplicationException {

		LnListInqrySvcLnListOut lnListInqrySvcLnListOut = new LnListInqrySvcLnListOut();
		List<LnListOut> loanList = _getLnBizProc().getLoanList(arrList, false);

    	Map<String, String> map = _getCondRangeValues(in.getCndCdList());
		BigDecimal minInvstmntTerm  = new BigDecimal(map.get("D0005_StartVal"));
    	BigDecimal maxInvstmntTerm  = new BigDecimal(map.get("D0005_EndVal"));
		BigDecimal minInvstmntIntRt = new BigDecimal(map.get("I0067_StartVal"));
    	BigDecimal maxInvstmntIntRt = new BigDecimal(map.get("I0067_EndVal"));

		List<LnListOut> newLnListOut = new ArrayList<LnListOut>();

	    SimpleDateFormat DateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
	    BigDecimal HUNDRED = new BigDecimal(100);
		for(LnListOut arrLoan : loanList) {
			BigDecimal lnAprvlTrm = arrLoan.getLonAprvlTrmCnt();
			BigDecimal invstmntRt = arrLoan.getIntRt();
			if(lnAprvlTrm.subtract(minInvstmntTerm).compareTo(BigDecimal.ZERO) >= 0 && // -1은 작다, 0은 같다, 1은 크다
					maxInvstmntTerm.subtract(lnAprvlTrm).compareTo(BigDecimal.ZERO) >= 0 &&
						invstmntRt.subtract(minInvstmntIntRt).compareTo(BigDecimal.ZERO) >= 0 &&
							maxInvstmntIntRt.subtract(invstmntRt).compareTo(BigDecimal.ZERO) >= 0 ) {

				// 진척률 체크(100이면 skip)
				BigDecimal biddingPrgrs = arrLoan.getBiddingPrgrsRt();
	    		if (HUNDRED.compareTo(biddingPrgrs)!=0){

					// 입찰마감일시 체크(마감시간이 지났으면 skip)
		    		String biddingClsgTmstmp = arrLoan.getBiddingClsgTmstmp();
		    		if (!StringUtils.isEmpty(biddingClsgTmstmp)){
		    			try {
		    				Date sDate = DateFormat.parse(biddingClsgTmstmp);
		    			    Date current = new Date(); //시스템 날짜
		    			    //입찰마감일시가 남아있는 경우만 리스트에 저장
		    			    if ( sDate.compareTo(current)>0) {
		        				newLnListOut.add(arrLoan);
		    			    }
		    			} catch (ParseException e1) {
		    				logger.error("ignore exception: ",e1);
		    			}
		    		}
	    		}
    		}
		}
   		lnListInqrySvcLnListOut.setLoanList(newLnListOut);

		return lnListInqrySvcLnListOut;
	}

    /**
     * Get P2P Bidding List By Arrangement Status
     * @param in (required) LnListInqrySvcLnListIn
     * @return  List<Arr>
     * @throws BizApplicationException
     */
	private List<Arr> _getBiddingListByConditions(LnListInqrySvcLnListIn in) throws BizApplicationException {

		String deptId = in.getDeptId();
		ArrStsEnum arrSts = ArrStsEnum.getEnum(in.getLnAplctnPrcsDscd());
		String inqryStartDt = in.getInqryStartDt();
		String inqryEndDt = in.getInqryEndDt();

		List<Arr> arrList = new ArrayList<Arr>();
		List<ArrReal> arrRealList = _getArrDeptMngr().getListArrBasedOnStsHistory(deptId, ArrDeptRelEnum.ACCOUNTING_UNIT, arrSts, ArrStsEnum.APPLIED, inqryStartDt, inqryEndDt);

		for(ArrReal arrReal : arrRealList){
			arrList.add((Arr)arrReal);
		}

		return arrList;
	}

    /**
     * set condition values into Map
     * @param cndList (required) List<LnListInqryCndListIn>
     * @return  Map<String, String>
     * @throws BizApplicationException
     */
	private Map<String, String> _getCondRangeValues(List<LnListInqryCndListIn> cndList) throws BizApplicationException {

		BigDecimal startValBd = BigDecimal.ZERO;
    	BigDecimal endValBd = BigDecimal.ZERO;
		HashMap<String, String> map = new HashMap<String, String>();

		for (LnListInqryCndListIn cndListIn : cndList) {
			String cndCd = cndListIn.getCndCd();
			String startVal = cndListIn.getInqryStartVal();
			String endVal = cndListIn.getInqryEndVal();

			if(startVal!=null){
				try{
					startValBd = new BigDecimal(startVal);
				}catch(Exception e) {
					startValBd = BigDecimal.ZERO;
					logger.error("ignore exception: ",e);
				}
			}

			if(endVal!=null){
				try{
					endValBd = new BigDecimal(endVal);
				}catch(Exception e) {
					endValBd = BigDecimal.ZERO;
					logger.error("ignore exception: ",e);
				}
			}

			map.put(cndCd+"_StartVal", startValBd.toString());
			map.put(cndCd+"_EndVal", endValBd.toString());
		}

		return map;
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
	 * @return the lnBizProc
	 */
	private LnBizProc _getLnBizProc() {
		if (lnBizProc == null) {
			lnBizProc = (LnBizProc) CbbApplicationContext.getBean(LnBizProc.class, lnBizProc);
		}
		return lnBizProc;
	}

	/**
	 * @return the arrDeptMngr
	 */
	private ArrDeptMngr _getArrDeptMngr() {
		if (arrDeptMngr == null) {
			arrDeptMngr = (ArrDeptMngr) CbbApplicationContext.getBean(
					ArrDeptMngr.class, arrDeptMngr);
		}
		return arrDeptMngr;
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

}
