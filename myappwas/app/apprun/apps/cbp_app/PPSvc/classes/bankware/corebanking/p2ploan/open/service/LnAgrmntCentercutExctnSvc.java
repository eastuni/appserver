package bankware.corebanking.p2ploan.open.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.enums.ArrStsEnum;
import bankware.corebanking.arrangement.inquiry.bizproc.ArrInqryBizProc;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.classinfo.annotation.CbbSrvcInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntWithdrawSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LnAgrmntCentercutExctnSvcIn;
import bankware.corebanking.p2ploan.open.service.dto.LnExctnSvcLnOpnOut;
import bankware.corebanking.product.enums.PdCndEnum;
import bankware.corebanking.service.CbbInternalServiceExecutor;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmService;
import bxm.container.annotation.BxmServiceOperation;
import bxm.transaction.annotation.TransactionalOperation;

/**
 * 이 서비스는 센터컷을 실행한다.
 * This service executes Center Cut process.
 *
 * Author	Sungbum Kim
 * History
 */
@BxmCategory(logicalName = "Generate Center Cut data & Invoke Center Cut Main Process" )
@CbbClassInfo(classType="SERVICE")
@BxmService("LnAgrmntCentercutExctnSvc")
public class LnAgrmntCentercutExctnSvc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());	

	private ArrInqryBizProc				arrInqryBizProc;

   /**
	*  Loan Disbursement Main Process
	*
    * <pre>
    * flow description
    *
    * 1. Get Loan Arrangement
    * 
    * 2. Get Lending Arrangement List
    * 
    * 3. Execute Center Cut Main
    * </pre>  
	*  
    * @param in (required) LnExctnSvcPymntAcctIn: Information for withdrawal(Investment)
	* @return LnExctnSvcPymntRsltOut Withdrawal result
	* @throws BizApplicationException
	*/
	@BxmServiceOperation("executeCentercut")
	@TransactionalOperation
	@CbbSrvcInfo(srvcCd="SPP1071202", srvcNm="Execute Centercut")
    @BxmCategory(logicalName = "Execute Centercut")
	public LnExctnSvcLnOpnOut executeCentercut(LnAgrmntCentercutExctnSvcIn in) throws BizApplicationException {

		/**
		 * Get Loan Arrangement
		 */
		Arr arr = _getArrInqryBizProc().getArrangementByArrangementIdentification(in.getArrId());

        /**
         * Get Lending Arrangement List
         */
		List<String> lndArrIdList = _getLendingArrangements(arr);

        /**
         * Generate Center Cut Data
         */
//		_makeCenterCutData(arr, lndArrIdList);

        /**
         * Execute Center Cut Main
         */
		_excuteCenterCutMain(arr, lndArrIdList);

		return _buildOutput(arr); 
	}

	/**
     * Get Lending Arrangement
     * @param arr (required) P2P Loan Arrangement
     * @return Lending Arrangement
     * @throws BizApplicationException
     */
    private List<String> _getLendingArrangements( Arr arr ) throws BizApplicationException { //, NestedRuntimeException, NestedCheckedException{

    	List<String> lndArrIdList = new ArrayList<String>();

    	for( ArrReal lndArr: arr.getChildren()){
    		if(ArrStsEnum.APPLIED.equals(lndArr.getArrSts())){
    			lndArrIdList.add(lndArr.getArrId());
    		}
    	}

    	return lndArrIdList;
    }

    /**
     * Execute Center Cut
     * @param arr (required) Arrangement
     * @param lndArrIdList (required) Investment arrangement identification list
     * @throws BizApplicationException
     */
    private void _excuteCenterCutMain(Arr arr, List<String> lndArrIdList) throws BizApplicationException { 

    	// PMT0808506
    	LendingAgrmntWithdrawSvcIn lendingAgrmntWithdrawSvcIn = null;
    	String biddingWay = _getBiddingWay(arr);
    	String lnAplctnRt = _getLoanApplicationRate(arr);

    	for(String arrId: lndArrIdList){
    		lendingAgrmntWithdrawSvcIn = new LendingAgrmntWithdrawSvcIn();
    		lendingAgrmntWithdrawSvcIn.setArrId(arrId);
    		lendingAgrmntWithdrawSvcIn.setBiddingMthdCd(biddingWay);
    		lendingAgrmntWithdrawSvcIn.setLnAplctnIntRt(lnAplctnRt);

    		//CbbInternalServiceExecutor.executeAsync("SPP2050602", lendingAgrmntWithdrawSvcIn, 1800000);
    		CbbInternalServiceExecutor.execute("SPP2050602", lendingAgrmntWithdrawSvcIn);
    	}
    }

    private String _getBiddingWay(Arr arr) throws BizApplicationException {

    	String biddingWay = null;

    	ArrCndLst arrCndLst = (ArrCndLst) arr.getArrCnd(PdCndEnum.P2P_BID_WAY.getValue());
    	biddingWay = arrCndLst.getCndVal();

    	return biddingWay;
    }

    private String _getLoanApplicationRate(Arr arr) throws BizApplicationException {

    	String lnAplctnRt = null;

    	ArrCndInt arrCndInt = (ArrCndInt) arr.getArrCnd(PdCndEnum.P2P_INT_RT.getValue());
    	lnAplctnRt = arrCndInt.getCndVal();

    	return lnAplctnRt;
    }

	private LnExctnSvcLnOpnOut _buildOutput(Arr arr) throws BizApplicationException { 

		LnExctnSvcLnOpnOut lnExctnSvcLnOpnOut = new LnExctnSvcLnOpnOut();

		return lnExctnSvcLnOpnOut;
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
