package bankware.corebanking.arrangement.creation.bizproc;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrVrtl;
import bankware.corebanking.arrangement.enums.ArrArrRelEnum;
import bankware.corebanking.arrangement.enums.ArrCustRelEnum;
import bankware.corebanking.arrangement.enums.ArrRelKndEnum;
import bankware.corebanking.arrangement.enums.ArrStsChngRsnEnum;
import bankware.corebanking.arrangement.enums.ArrXtnInfoEnum;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrBsicCrtn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrCrtnIn;
import bankware.corebanking.core.arrangement.arrangement.interfaces.dto.ArrXtnCrtn;
import bankware.corebanking.core.arrangement.arrangementcondition.interfaces.dto.ArrCndCrtn;
import bankware.corebanking.core.arrangement.arrangementrelationship.interfaces.dto.ArrRelCrtn;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcCndIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcLendingAgrmntIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcRelIn;
import bankware.corebanking.p2plending.reserveagreement.service.dto.LendingAgrmntSvcXtnIn;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	
 * History
 */
@BxmBean("ArrCrtnBizProc")
@BxmCategory(logicalName = "Arrangement Creation BizProc")
public class ArrCrtnBizProc {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private CmnContext	cmnContext;
	private ArrMngr		arrMngr;

	/**
	 * Create Apply Status Arrangement
	 * 
	 * @param in
	 * @return Arr
	 * @throws BizApplicationException
	 */
	public Arr createApplyStatusArrangement(LendingAgrmntSvcLendingAgrmntIn in) throws BizApplicationException {

		return _getArrMngr().applyArr(_createArrangementCreationIn(in));
	}

	/**
	 * Create Virtual Arrangement
	 * 
	 * @param in
	 * @return ArrVrtl
	 * @throws BizApplicationException
	 */
	public ArrVrtl createVirtualArrangement(LendingAgrmntSvcLendingAgrmntIn in) throws BizApplicationException {

		return _getArrMngr().openArrVrtl(_createArrangementCreationIn(in));
	}

	private ArrCrtnIn _createArrangementCreationIn(LendingAgrmntSvcLendingAgrmntIn in) throws BizApplicationException {

		ArrCrtnIn arrCrtnIn = new ArrCrtnIn();

		/**
		 * set arrangement basic information 
		 */
		arrCrtnIn.setArrBsicCrtn(_setArrBasicCreation(in));

		/**
		 * set arrangement relationship information 
		 */
		arrCrtnIn.setArrRelList(_setArrRelationList(in));

		/**
		 * set arrangement extend information 
		 */
		arrCrtnIn.setArrXtnList(_setArrExtendList(in));

		/**
		 * set arrangement condition value 
		 */
		arrCrtnIn.setArrCndList(_setArrCndList(in));

		/**
		 * create arrangement using arrangement manager  
		 */
		return arrCrtnIn;
	}

	private ArrBsicCrtn _setArrBasicCreation(LendingAgrmntSvcLendingAgrmntIn in) throws BizApplicationException {

		ArrBsicCrtn arrBsicCrtn = new ArrBsicCrtn();

		arrBsicCrtn.setPdCd(in.getPdCd());

		// If the the initial date in reckoning is blank, use system date
		if (!StringUtils.isEmpty(in.getArrDt())){	 
			arrBsicCrtn.setCrtnEfctvDt(in.getArrDt());
		} else {
			arrBsicCrtn.setCrtnEfctvDt(_getCmnContext().getTxDate());
		}

		if (!StringUtils.isEmpty(in.getMthrArrId())) {
			arrBsicCrtn.setMthrArrId(in.getMthrArrId());
		}

		arrBsicCrtn.setArrStsChngRsnCd(ArrStsChngRsnEnum.APPLIED_APPLY.getValue());

		return arrBsicCrtn;
	}

	private List<ArrRelCrtn> _setArrRelationList(LendingAgrmntSvcLendingAgrmntIn in) throws BizApplicationException {

		List<ArrRelCrtn> arrRelCrtnList = new ArrayList<ArrRelCrtn>();
		ArrRelCrtn arrRelCrtn = null;

		for (LendingAgrmntSvcRelIn rel : in.getRelList()) {
			arrRelCrtn = new ArrRelCrtn();

			arrRelCrtn.setArrRelKndCd(rel.getArrRelKndCd());
			arrRelCrtn.setArrRelCd(rel.getArrRelCd());
			arrRelCrtn.setRltdBizObjId(rel.getRltdBizObjId());

			arrRelCrtnList.add(arrRelCrtn);
		}

		//Payment Account Number SET 
		if( !StringUtils.isEmpty(in.getWhdrwlAcctNbr())){
			// 출금계좌에 대한 관계내역 생성
			arrRelCrtn = new ArrRelCrtn();

			arrRelCrtn.setArrRelKndCd(ArrRelKndEnum.ARRANGEMENT.getValue());
			arrRelCrtn.setArrRelCd(ArrArrRelEnum.STANDING_ORDER_SOURCE_ACCOUNT.getValue());
			arrRelCrtn.setRltdBizObjId(in.getWhdrwlAcctNbr());

			arrRelCrtnList.add(arrRelCrtn);
		}

		//Payment Account Number SET 
		if( !StringUtils.isEmpty(in.getCustId())){
			// 고객에 대한 관계내역 생성
			arrRelCrtn = new ArrRelCrtn();

			arrRelCrtn.setArrRelKndCd(ArrRelKndEnum.CUSTOMER.getValue());	
			arrRelCrtn.setArrRelCd(ArrCustRelEnum.MAIN_CONTRACTOR.getValue());
			arrRelCrtn.setRltdBizObjId(in.getCustId());

			arrRelCrtnList.add(arrRelCrtn);
		}

		return arrRelCrtnList.size() > CCM01.ZERO ? arrRelCrtnList: null;
	}

	private List<ArrXtnCrtn> _setArrExtendList(LendingAgrmntSvcLendingAgrmntIn in) {

		List<ArrXtnCrtn> arrXtnCrtnList = new ArrayList<ArrXtnCrtn>();

		for (LendingAgrmntSvcXtnIn XtnAtrbt : in.getXtnList()) {
			ArrXtnCrtn arrXtnCrtn = new ArrXtnCrtn();

			arrXtnCrtn.setXtnAtrbtNm(XtnAtrbt.getXtnAtrbtNm());
			arrXtnCrtn.setXtnAtrbtCntnt(XtnAtrbt.getXtnAtrbtCntnt());

			arrXtnCrtnList.add(arrXtnCrtn);
		}

		if (!StringUtils.isEmpty(in.getTermsAgrmntYn())) {
			ArrXtnCrtn arrXtnCrtn = new ArrXtnCrtn();

			arrXtnCrtn.setXtnAtrbtNm(ArrXtnInfoEnum.TERMS_AGREEMENT_YN.getValue());
			arrXtnCrtn.setXtnAtrbtCntnt(in.getTermsAgrmntYn());

			arrXtnCrtnList.add(arrXtnCrtn);
		}

		return arrXtnCrtnList.size() > CCM01.ZERO ? arrXtnCrtnList: null;
	}

	private List<ArrCndCrtn> _setArrCndList(LendingAgrmntSvcLendingAgrmntIn in) {

		List<ArrCndCrtn> arrCndCrtnList = new ArrayList<ArrCndCrtn>();

		for (LendingAgrmntSvcCndIn  cndCd : in.getCndCdList()) {
			ArrCndCrtn arrCndCrtn = new ArrCndCrtn();

			arrCndCrtn.setCndCd(cndCd.getCndCd());
			arrCndCrtn.setTxtCndVal(cndCd.getTxtCndVal());

			arrCndCrtnList.add(arrCndCrtn);
		}

		return arrCndCrtnList.size() > CCM01.ZERO ? arrCndCrtnList: null;
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
}
