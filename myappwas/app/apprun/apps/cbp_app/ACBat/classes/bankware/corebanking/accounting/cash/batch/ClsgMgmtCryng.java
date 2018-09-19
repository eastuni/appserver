package bankware.corebanking.accounting.cash.batch;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.cash.daobatch.AcBillCtgryCashDBat;
import bankware.corebanking.accounting.cash.daobatch.AcDeptClsgDBat;
import bankware.corebanking.accounting.cash.daobatch.AcTlrClsgDBat;
import bankware.corebanking.accounting.cash.daobatch.AcTlrTxSumnDBat;
import bankware.corebanking.accounting.cash.daobatch.dto.AcBillCtgryCashDBatIO;
import bankware.corebanking.accounting.cash.daobatch.dto.AcDeptClsgDBatIO;
import bankware.corebanking.accounting.cash.daobatch.dto.AcTlrClsgDBatIO;
import bankware.corebanking.accounting.cash.daobatch.dto.AcTlrTxSumnDBatInOut;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.utility.interfaces.DateUtils;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.enums.ClsgDscdEnum;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;


/**
 * 마감관리 관련정보 이월
 * @author		Hyangsook, Kim
 * @history		2016.05.23.
 */


@BxmBean("ClsgMgmtCryng")
@Scope("step")
@BxmCategory(logicalName = "Closing Management Carrying Batch")
public class ClsgMgmtCryng implements Tasklet {
	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private CmnContext				cmnContext;
	private DateCalculator   		dateCalculator;
	private String 					instCd;
	private String 					jobDt;
	private String 					nxtBizDt;
	private AcBillCtgryCashDBat 	acBillCtgryCashDBat;
	private AcDeptClsgDBat 			acDeptClsgDBat;		
	private AcTlrTxSumnDBat 		acTlrTxSumnDBat;	
	private AcTlrClsgDBat 			acTlrClsgDBat;


	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {


		instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");
		jobDt = (String)arg1.getStepContext().getJobExecutionContext().get("jobDt");
		nxtBizDt = _getDateCalculator().calculateDateBusiness(jobDt).getNxtBizDt();


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> ClsgMgmtCryng Start");
			logger.debug("instCd : {}", instCd);
			logger.debug("jobDt : {}", jobDt);
			logger.debug("nxtBizDt : {}", nxtBizDt);
		}


		// 일자검증
		_checkBizDate(jobDt, "@jobDt");


		// 마감관리데이터 이월 처리
		_closingManagementCarrying();


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> ClsgMgmtCryng End");
		}


		return RepeatStatus.FINISHED;
	}


	/**
	 * Validation Biz Date Check
	 * 날짜 형식 유효성 체크
	 * @throws BizApplicationException
	 */
	private void _checkBizDate(String date, String msg) throws BizApplicationException {


		if (!DateUtils.isValidDate(date)) {
			throw new BizApplicationException("AAPCME0001", new Object[] {"@".concat(msg) , date});
		}


		if(StringUtils.isEmpty(date)){
			throw new BizApplicationException("AAPACE3046", new Object[] {date});
		}


		if(date.compareTo(_getCmnContext().getBusinessDate()) > 0 ){
			// 시스템일자보다 미래일자로 회계처리가 허용되지 않습니다.
			throw new BizApplicationException("AAPACE3044", null);
		}




		String bizDt = _getDateCalculator().calculateDateBusiness(jobDt).getBizDt();
		if(!jobDt.equals(bizDt)){
			throw new BizApplicationException("CAPACE0001");
		}	


		if (StringUtils.isEmpty(instCd)) {
			// {기관코드}는 필수 입력 항목입니다.
            throw new BizApplicationException("AAPCME0006",new Object[] { "Institution Code" });
        }
	}


	/**
	 * 마감관련데이터 이월 처리
	 * 
	 * @throws BizApplicationException
	 */
	private void _closingManagementCarrying() throws BizApplicationException {


		List<AcTlrClsgDBatIO> selectTlrClsgList = new ArrayList<AcTlrClsgDBatIO>();
		List<AcBillCtgryCashDBatIO> selectTlrCashList = new ArrayList<AcBillCtgryCashDBatIO>();
		List<AcDeptClsgDBatIO> selectDptClsgList = new ArrayList<AcDeptClsgDBatIO>();
		List<AcTlrTxSumnDBatInOut> selectTlrSumnList = new ArrayList<AcTlrTxSumnDBatInOut>();


		// 텔러마감관리 목록 조회
		selectTlrClsgList = _inquiryTellerClosingManagementList();		
		// 텔러마감관리 목록 이월
		_carryingTellerClosingManagementList(selectTlrClsgList);




		// 텔러보유시재 목록 조회
		selectTlrCashList = _inquiryTellerCashList();		
		// 텔러보유시재 목록 이월
		_carryingTellerCashList(selectTlrCashList);




		// 텔러거래집계명세 목록 조회
		selectTlrSumnList = _inquiryTellerTxSumnDList();		
		// 텔러거래집계명세 확정(합산)
		_insertTellerTxSumnDList(selectTlrSumnList);		
		// 텔러거래집계명세 목록 이월
		_carryingTellerTxSumnDList(selectTlrSumnList);		
		// 텔러거래집계명세 당일 개별 데이터 삭제(logSeqNbr가 0이 아닌것만 삭제)
		_deleteTellerTxSumnDList();




		// 부점마감관리 목록 조회
		selectDptClsgList = _inquiryDepartmentClosingManagementList();		
		// 부점마감관리 목록 이월
		_carryingDepartmentClosingManagementList(selectDptClsgList);
	}


	/**
	 * 텔러마감관리 목록 조회
	 * 
	 * @throws BizApplicationException
	 */
	private List<AcTlrClsgDBatIO> _inquiryTellerClosingManagementList() throws BizApplicationException {


		List<AcTlrClsgDBatIO> outList = new ArrayList<AcTlrClsgDBatIO>();


		outList = _getAcTlrClsgDBat().selectList(instCd, null, null, jobDt, null);


		return outList;
	}


	/**
	 * 텔러마감명세 이월
	 */
	private void _carryingTellerClosingManagementList(List<AcTlrClsgDBatIO> inList) throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TlrClsgList Start");
		}


		int updateCnt = 0;


		for (AcTlrClsgDBatIO inTemp : inList) {


			AcTlrClsgDBatIO inDao = new AcTlrClsgDBatIO();


			BeanUtils.copyProperties(inTemp, inDao);
			updateCnt = 0;


			_getCmnContext().setHeaderColumn(inDao);


			inDao.setBaseDt(nxtBizDt);
			inDao.setTlrClsgDscd(ClsgDscdEnum.CLSG_BF.getValue());
			inDao.setBizOpnDt("");
			inDao.setBizOpnHms("");
			inDao.setBizClsgDt("");
			inDao.setBizClsgHms("");


			updateCnt = _getAcTlrClsgDBat().update(inDao);
			if (updateCnt == 0) {
				 _getAcTlrClsgDBat().insert(inDao);
			}
		}
		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TlrClsgList End");
		}
	}


	/**
	 * 텔러보유시재 목록 조회
	 */
	private List<AcBillCtgryCashDBatIO> _inquiryTellerCashList() throws BizApplicationException {


		List<AcBillCtgryCashDBatIO> outList = new ArrayList<AcBillCtgryCashDBatIO>();


		outList = _getAcBillCtgryCashDBat().selectList(instCd, jobDt);


		return outList;
	}


	/**
	 * 텔러보유시재 이월
	 */
	private void _carryingTellerCashList(List<AcBillCtgryCashDBatIO> inList) throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TellerCashList Start");
		}


		int updateCnt = 0;


		for (AcBillCtgryCashDBatIO inTemp : inList) {


			AcBillCtgryCashDBatIO inDao = new AcBillCtgryCashDBatIO();


			BeanUtils.copyProperties(inTemp, inDao);
			updateCnt = 0;


			_getCmnContext().setHeaderColumn(inDao);
			inDao.setBaseDt(nxtBizDt);


			updateCnt = _getAcBillCtgryCashDBat().update(inDao);
			if (updateCnt == 0) {
				_getAcBillCtgryCashDBat().insert(inDao);
			}
		}


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TellerCashList End");
		}
	}


	/**
	 * 텔러거래집계명세 목록 조회
	 */
	private List<AcTlrTxSumnDBatInOut> _inquiryTellerTxSumnDList() throws BizApplicationException {


		List<AcTlrTxSumnDBatInOut> outList = new ArrayList<AcTlrTxSumnDBatInOut>();


		outList = _getAcTlrTxSumnDBat().selectList(instCd, jobDt, null);


		return outList;
	}


	/**
	 * 텔러거래집계명세 확정(합산)
	 */
	private void _insertTellerTxSumnDList(List<AcTlrTxSumnDBatInOut> inList) throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Summation TellerTxSumnDList Start");
		}


		int updateCnt = 0;


		for (AcTlrTxSumnDBatInOut inTemp : inList) {


			AcTlrTxSumnDBatInOut inDao = new AcTlrTxSumnDBatInOut();


			BeanUtils.copyProperties(inTemp, inDao);
			updateCnt = 0;


			_getCmnContext().setHeaderColumn(inDao);


			inDao.setLogSeqNbr(BigDecimal.ZERO);
			inDao.setClsgBfafDscd(ClsgDscdEnum.CLSG_BF.getValue());


			updateCnt = _getAcTlrTxSumnDBat().update(inDao);
			if (updateCnt == 0) {
				_getAcTlrTxSumnDBat().insert(inDao);
			}
		}


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Summation TellerTxSumnDList End");
		}
	}


	/**
	 * 텔러거래집계명세 이월
	 */
	private void _carryingTellerTxSumnDList(List<AcTlrTxSumnDBatInOut> inList) throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TellerTxSumnDList Start");
		}


		int updateCnt = 0;


		for (AcTlrTxSumnDBatInOut inTemp : inList) {
			AcTlrTxSumnDBatInOut inDao = new AcTlrTxSumnDBatInOut();


			BeanUtils.copyProperties(inTemp, inDao);
			updateCnt = 0;


			_getCmnContext().setHeaderColumn(inDao);


			inDao.setBaseDt(nxtBizDt);
			inDao.setLogSeqNbr(BigDecimal.ZERO);
			inDao.setClsgBfafDscd(ClsgDscdEnum.CLSG_BF.getValue());
			inDao.setBfBizDtCrncyAmt(inTemp.getBizDtCrncyAmt());
			inDao.setBfBizDtChkAmt(BigDecimal.ZERO);
//			inDao.setBfBizDtChkAmt(inTemp.getBizDtChkAmt());
			inDao.setBizDtCrncyAmt(inTemp.getBizDtCrncyAmt());
//			inDao.setBizDtCrncyAmt(BigDecimal.ZERO);
			inDao.setBizDtChkAmt(BigDecimal.ZERO);
			inDao.setCashRcvdSlipCnt(BigDecimal.ZERO);
			inDao.setCashRcvdAmt(BigDecimal.ZERO);
			inDao.setCashWhdrwlSlipCnt(BigDecimal.ZERO);
			inDao.setCashWhdrwlAmt(BigDecimal.ZERO);
			inDao.setChkRcvdAmt(BigDecimal.ZERO);
			inDao.setChkWhdrwlAmt(BigDecimal.ZERO);
			inDao.setOthrChkRcvdAmt(BigDecimal.ZERO);
			inDao.setOthrChkWhdrwlAmt(BigDecimal.ZERO);
			inDao.setTrnsfrRcvdSlipCnt(BigDecimal.ZERO);
			inDao.setTrnsfrRcvdAmt(BigDecimal.ZERO);
			inDao.setTrnsfrWhdrwlSlipCnt(BigDecimal.ZERO);
			inDao.setTrnsfrWhdrwlAmt(BigDecimal.ZERO);
			inDao.setTrnsfrRcvdDmstcAmt(BigDecimal.ZERO);
			inDao.setTrnsfrWhdrwlDmstcAmt(BigDecimal.ZERO);
			inDao.setDfrncAdjstmntAmt(BigDecimal.ZERO);
			inDao.setSndCashAmt(BigDecimal.ZERO);
			inDao.setSndTrnsfrAmt(BigDecimal.ZERO);
			inDao.setSndChkCnt(BigDecimal.ZERO);
			inDao.setSndChkAmt(BigDecimal.ZERO);
			inDao.setRcvCashAmt(BigDecimal.ZERO);
			inDao.setRcvTrnsfrAmt(BigDecimal.ZERO);
			inDao.setRcvChkCnt(BigDecimal.ZERO);
			inDao.setRcvChkAmt(BigDecimal.ZERO);


			// 익영업일의 텔러집계명세내역이 존재할 경우, 익영업일의 금액에 이월할 금액을 합산한다.
			updateCnt = _getAcTlrTxSumnDBat().updateAmt(inDao);
			if (updateCnt == 0) {
				_getAcTlrTxSumnDBat().insert(inDao);
			}
		}


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying TellerTxSumnDList End");
		}
	}


	/**
	 * 텔러거래집계명세 당일 개별 데이터 삭제
	 */
	private void _deleteTellerTxSumnDList() throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> delete TellerTxSumnDList Start");
		}


		_getAcTlrTxSumnDBat().deleteByLogSeqNbr(instCd, jobDt, BigDecimal.ZERO);


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> delete TellerTxSumnDList End");
		}


	}


	/**
	 * 부점마감관리 목록 조회
	 */
	private List<AcDeptClsgDBatIO> _inquiryDepartmentClosingManagementList() throws BizApplicationException {


		List<AcDeptClsgDBatIO> outList = new ArrayList<AcDeptClsgDBatIO>();


		outList = _getAcDeptClsgDBat().selectList(instCd, null, jobDt, null);


		return outList;
	}


	/**
	 * 부서마감명세 이월
	 */
	private void _carryingDepartmentClosingManagementList(List<AcDeptClsgDBatIO> inList) throws BizApplicationException {


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying DeptClsgList Start");
		}


		int updateCnt = 0;


		for (AcDeptClsgDBatIO inTemp : inList) {
			AcDeptClsgDBatIO inDao = new AcDeptClsgDBatIO();


			BeanUtils.copyProperties(inTemp, inDao);
			updateCnt = 0;


			_getCmnContext().setHeaderColumn(inDao);


			inDao.setBaseDt(nxtBizDt);
			inDao.setDeptClsgDscd(ClsgDscdEnum.CLSG_BF.getValue());
			inDao.setCntrctPrcsngFinYn(CCM01.NO);
			inDao.setRgstrnStaffId("");
			inDao.setRgstrnDt("");
			inDao.setRgstrnHms("");
			inDao.setRvctnStaffId("");
			inDao.setRvctnDt("");
			inDao.setRvctnHms("");


			updateCnt = _getAcDeptClsgDBat().update(inDao);
			if (updateCnt == 0) {
				_getAcDeptClsgDBat().insert(inDao);
			}
		}


		if(logger.isDebugEnabled()){
			logger.debug(">>>>>> Carrying DeptClsgList End");
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
	 * @return the instParmMgmt
	 */
	private DateCalculator _getDateCalculator() {
		if (dateCalculator == null) {
			dateCalculator = (DateCalculator) CbbApplicationContext.getBean(
					DateCalculator.class, dateCalculator);
		}
		return dateCalculator;
	}


	/**
	 * @return the acTlrClsgDBat
	 */
	private AcTlrClsgDBat _getAcTlrClsgDBat() {
		if (acTlrClsgDBat == null) {
			acTlrClsgDBat = (AcTlrClsgDBat) CbbApplicationContext.getBean(AcTlrClsgDBat.class, acTlrClsgDBat);
		}
		return acTlrClsgDBat;
	}


	/**
	 * @return the acDeptClsgDBat
	 */
	private AcDeptClsgDBat _getAcDeptClsgDBat() {
		if (acDeptClsgDBat == null) {
			acDeptClsgDBat = (AcDeptClsgDBat) CbbApplicationContext.getBean(AcDeptClsgDBat.class, acDeptClsgDBat);
		}
		return acDeptClsgDBat;
	}


	/**
	 * @return the acBillCtgryCashDBat
	 */
	private AcBillCtgryCashDBat _getAcBillCtgryCashDBat() {
		if (acBillCtgryCashDBat == null) {
			acBillCtgryCashDBat = (AcBillCtgryCashDBat) CbbApplicationContext.getBean(AcBillCtgryCashDBat.class, acBillCtgryCashDBat);
		}
		return acBillCtgryCashDBat;
	}


	/**
	 * @return the acTlrClsgDBat
	 */
	private AcTlrTxSumnDBat _getAcTlrTxSumnDBat() {
		if (acTlrTxSumnDBat == null) {
			acTlrTxSumnDBat = (AcTlrTxSumnDBat) CbbApplicationContext.getBean(AcTlrTxSumnDBat.class, acTlrTxSumnDBat);
		}
		return acTlrTxSumnDBat;
	}
}
