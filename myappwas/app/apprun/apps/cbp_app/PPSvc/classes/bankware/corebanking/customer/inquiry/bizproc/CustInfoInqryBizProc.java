package bankware.corebanking.customer.inquiry.bizproc;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.actor.customer.interfaces.Cust;
import bankware.corebanking.actor.customer.interfaces.CustMngr;
import bankware.corebanking.actor.utility.interfaces.ActorUtil;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrCustMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorElctrncAddrOut;
import bankware.corebanking.core.actor.actor.interfaces.dto.ActorTelNbrOut;
import bankware.corebanking.core.actor.enums.CntctMthdTpEnum;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("CustInfoInqryBizProc")
@BxmCategory(logicalName = "Customer Information Inquiry BizProc")
public class CustInfoInqryBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private ArrCustMngr	arrCustMngr;
	private CustMngr		custMngr;
	private InstParmMngr	instParmMngr;

	/**
	 * Get Customer's Deposit Account Number By Arrangement
	 * 
	 * @param arr
	 * @return
	 * @throws BizApplicationException
	 */
	public String getCustomerDepositAccountNumberByArrangement(Arr arr) throws BizApplicationException {

		InstParm peerToPeerDpstAcctPdCd = 	_getInstParmMngr().getInstParm(InstParamEnum.PEER_TO_PEER_DEPOSIT_ACCOUNT_PRODUCT_CODE.getValue());
		List<ArrReal> arrRealList = 		_getArrCustMngr().getListCustOwnArrRealActive(arr.getMainCust().getCustId(), peerToPeerDpstAcctPdCd.getParmValue());	// 멤버쉽 계약

		return arrRealList.get(0).getAcctNbr();
	}

	/**
	 * Get Customer's Deposit Account Number By Customer Identification
	 * 
	 * @param arr
	 * @return
	 * @throws BizApplicationException
	 */
	public String getCustomerDepositAccountNumberByCustomerIdentification(String custId) throws BizApplicationException {

		InstParm peerToPeerDpstAcctPdCd = 	_getInstParmMngr().getInstParm(InstParamEnum.PEER_TO_PEER_DEPOSIT_ACCOUNT_PRODUCT_CODE.getValue());
		List<ArrReal> arrRealList = 		_getArrCustMngr().getListCustOwnArrRealActive(custId, peerToPeerDpstAcctPdCd.getParmValue());	// 멤버쉽 계약

		return arrRealList.get(0).getAcctNbr();
	}

	/**
	 * Count Authentication Data
	 * 
	 * @param custId
	 * @return
	 * @throws BizApplicationException
	 */
	public int countAuthenticationData(String custId) throws BizApplicationException {

		Cust cust = _getCustMngr().getCust(custId);
		
		String cntctPntLctnTpCd = ActorUtil.getAuthContactPointLocationTypeCode(cust.getActorTypeCode());
		
		int cnt = 0;
		
		if(cust.isRealNameAuth()){
			cnt++;
		}

		if(cust.isSelfChannelIdentifyConfirm()){
			cnt++;
		}

		//ActorCntctPntIO actorCntctPntIO = 
		ActorTelNbrOut actorTelNbrOut = cust.getTelNbrInfo(cntctPntLctnTpCd, CntctMthdTpEnum.MOBILE_PHONE.getValue());

		if(actorTelNbrOut != null && CCM01.YES.equals(actorTelNbrOut.getAuthYn())){
			cnt++;
		}

		ActorElctrncAddrOut actorElctrncAddrOut = cust.getElctrncAddrInfo(cntctPntLctnTpCd, CntctMthdTpEnum.EMAIL.getValue());
		//actorCntctPntIO = cust.getContactPointInformation(cntctPntLctnTp, CntctMthdTpEnum.EMAIL);
		if(actorElctrncAddrOut != null && CCM01.YES.equals(actorElctrncAddrOut.getAuthYn())){
			cnt++;
		}

		return cnt;
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
	 * @return the custMngr
	 */
	private CustMngr _getCustMngr() {
		if (custMngr == null) {
			custMngr = (CustMngr) CbbApplicationContext.getBean(CustMngr.class, custMngr);
		}
		return custMngr;
	}

	/**
	 * @return the instParmMgmt
	 */
	private InstParmMngr _getInstParmMngr() {
		if (instParmMngr == null) {
			instParmMngr = (InstParmMngr) CbbApplicationContext.getBean(
					InstParmMngr.class, instParmMngr);
		}
		return instParmMngr;
	}
}
