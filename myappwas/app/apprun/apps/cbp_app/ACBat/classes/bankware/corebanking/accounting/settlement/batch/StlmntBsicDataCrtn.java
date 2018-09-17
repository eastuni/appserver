package bankware.corebanking.accounting.settlement.batch;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.cash.interfaces.DeptClsg;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBatIO;
import bankware.corebanking.accounting.settlement.daobatch.AcStlmntGlMBat;
import bankware.corebanking.accounting.settlement.daobatch.dto.AcStlmntGlMBatIO;
import bankware.corebanking.actor.department.interfaces.DeptMngr;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.utility.interfaces.DateUtils;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.constant.CAC01;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetIn;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetOut;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;

/**
 * @file         bankware.corebanking.accounting.settlement.batch.StlmntBsicDataCrtn.java
 * @filetype     java source file
 * @brief		  
 * @author       Yoonyeong Ha
 * @version      0.1
 * @history
 * <pre>
 * 버전          				성명                   		일자              			변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           	Yoonyeong Ha       	2017. 09. 11.       	신규 작성
 * </pre>
 */

@BxmBean("StlmntBsicDataCrtn")
@Scope("step")
@BxmCategory(logicalName = "Settlement Basic Data Creation", description = "결산기초자료생성 배치")
public class StlmntBsicDataCrtn implements Tasklet {

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcStlmntGlMBat 			acStlmntGlMBat;
	private AcGlMBat 				acGlMBat;
	private CmnContext				cmnContext;
    private DeptMngr 				deptMngr;
	private DeptClsg 				deptClsg;

    @Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {

		/*
		 * [결산기초자료생성 배치]
		 * 결산기준일 보정작업전에 필요로하는 계정과목정보 B/S, I/S 평잔 보정기초데이터를 LOAD 
		 */
		// 기본정보 설정
		String instCd = _getCmnContext().getInstCode(); // 기관코드
		String baseDt = (String)arg1.getStepContext().getJobExecutionContext().get("baseDt"); // 작업일자
		
		if(logger.isDebugEnabled()) {
			logger.debug("## StlmntBsicDataCrtn > START");
			logger.debug("## StlmntBsicDataCrtn > instCd : {}", instCd);
			logger.debug("## StlmntBsicDataCrtn > baseDt : {}", baseDt);
		}
		
		// 일자체크
		_checkBizDate(baseDt, "@baseDt");

		// 해당기관의 부점목록조회
		List<DeptSrchGetOut> deptList = _getListInstDept(instCd);
		
		// 해당 기관 전부점의 결산기초자료생성
		if(!deptList.isEmpty()) {
			_processStlmntBsicDataCrtn(deptList, instCd, baseDt);
		}
		
		if(logger.isDebugEnabled()) {
			logger.debug("## StlmntBsicDataCrtn > END");
		}
		
		return RepeatStatus.FINISHED;
	}
	
	
	/**
	 * Process Settlement Basic Data Creation
	 * 결산기초자료 생성
	 * @param deptList
	 * @throws BizApplicationException 
	 */
	private void _processStlmntBsicDataCrtn(List<DeptSrchGetOut> deptList, String instCd, String baseDt) throws BizApplicationException {
		
		// 결산기준년월일 결산회차 max값 조회
		Integer maxStlmntNth = _getAcStlmntGlMBat().selectMaxStlmntNth(instCd, baseDt) + 1;
		
		if(logger.isDebugEnabled()) {
			logger.debug("## StlmntBsicDataCrtn > _processStlmntBsicDataCrtn > maxStlmntNth : {}", maxStlmntNth);
		}
		
		for(DeptSrchGetOut inItem : deptList) {
			
			if(logger.isDebugEnabled()) {
				logger.debug("## StlmntBsicDataCrtn > _processStlmntBsicDataCrtn > deptId : {}", inItem.getDeptId());
			}

			// 부서마감여부 확인 > 미마감 ERROR
			_checkDeptClsgYn(inItem, instCd, baseDt);
			
			// 결산기초데이터 조회 (from 총계정원장)
			List<AcGlMBatIO> acGlMBatList = _getAcGlMBat().selectGlCnfrmSum(instCd, baseDt, inItem.getDeptId());
			
			// 결산기초데이터 결산총계정기본에 등록
			if (!acGlMBatList.isEmpty()) {
				_registerStlmntBsicData(acGlMBatList , maxStlmntNth);
			}
		}
	}


	/**
	 * Check department closing Y/N
	 * 부서마감여부 확인
	 * 
	 * @param instCd 
	 * @param baseDt 
	 * @param inItem
	 * @throws BizApplicationException 
	 */
	private void _checkDeptClsgYn(DeptSrchGetOut in, String instCd, String baseDt) throws BizApplicationException {

		if (_getDeptClsg().isClosed(instCd, in.getDeptId(), baseDt)) {
			// 부서마감 전이기 때문에 거래할 수 없습니다. 부서마감 처리 후 다시 시도하십시오.
			throw new BizApplicationException("AAPACE3125", new Object[] {baseDt});
		}
	}


	/**
	 * Get Department List of Institution
	 * 기관의 부서목록 조회
	 * @param instCd
	 * @return
	 * @throws BizApplicationException 
	 */
	private List<DeptSrchGetOut> _getListInstDept(String instCd) throws BizApplicationException {
		
		// 해당기관의 부점목록조회
		List<DeptSrchGetOut> deptList = new ArrayList<DeptSrchGetOut>();

		DeptSrchGetIn deptSrchGetIn = new DeptSrchGetIn();
		deptSrchGetIn.setInstCd(instCd);
		
		deptList = _getDeptMngr().getListDept(deptSrchGetIn, CAC01.NO);
		
		return deptList;
	}


	/**
	 * Register Settlement Basic Data to Settlement General Ledger
	 * 결산총계정원장에 결산기초자료 등록
	 * @param acGlMBatList
	 * @param maxStlmntNth 
	 * @throws BizApplicationException 
	 */
	private void _registerStlmntBsicData(List<AcGlMBatIO> acGlMBatList, Integer maxStlmntNth) throws BizApplicationException {

		List<AcStlmntGlMBatIO> stlmntBsicDataList = new ArrayList<AcStlmntGlMBatIO>();
		
		// 결산총계정기본(AC_STLMNT_GL_M)에 등록 (계리잔액, 평잔 / 나머지 금액은 모두 0으로)
		for(AcGlMBatIO inItem : acGlMBatList) {
			
			AcStlmntGlMBatIO acStlmntGlMBatIO = new AcStlmntGlMBatIO();
			_getCmnContext().setHeaderColumn(acStlmntGlMBatIO);
			
			acStlmntGlMBatIO.setInstCd(inItem.getInstCd());// set [기관코드]
			acStlmntGlMBatIO.setStlmntBaseDt(inItem.getBaseDt());// set [결산기준년월일]
			acStlmntGlMBatIO.setStlmntNth(maxStlmntNth);// set [결산회차]
			acStlmntGlMBatIO.setDeptId(inItem.getDeptId());// set [부서식별자]
			acStlmntGlMBatIO.setCrncyCd(inItem.getCrncyCd());// set [통화코드]
			acStlmntGlMBatIO.setAcctgDscd(inItem.getAcctgDscd());// set [회계구분코드]
			acStlmntGlMBatIO.setAcctgItmCd(inItem.getAcctgItmCd());// set [계정과목코드]
			acStlmntGlMBatIO.setStlmntBfBal(inItem.getAcctgBal());// set [결산전잔액]
			acStlmntGlMBatIO.setPrcdTrmCrctnAmt(BigDecimal.ZERO);// set [전기보정금액]
			acStlmntGlMBatIO.setOnlineAccruedIncomeAmt(BigDecimal.ZERO);// set [온라인미수수익금액]
			acStlmntGlMBatIO.setOnlineAccruedExpnsAmt(BigDecimal.ZERO);// set [온라인미지급비용금액]
			acStlmntGlMBatIO.setOnlineUnrndRevenueAmt(BigDecimal.ZERO);// set [온라인선수수익금액]
			acStlmntGlMBatIO.setOnlinePrepaidExpnsAmt(BigDecimal.ZERO);// set [온라인선급비용금액]
			acStlmntGlMBatIO.setManualEntryAccruedIncomeAmt(BigDecimal.ZERO);// set [비온라인미수수익금액]
			acStlmntGlMBatIO.setManualEntryAccruedExpnsAmt(BigDecimal.ZERO);// set [비온라인미지급비용금액]
			acStlmntGlMBatIO.setManualEntryUnrndRevenueAmt(BigDecimal.ZERO);// set [비온라인선수수익금액]
			acStlmntGlMBatIO.setManualEntryPrepaidExpnsAmt(BigDecimal.ZERO);// set [비온라인선급비용금액]
			acStlmntGlMBatIO.setOnlineLdgrAdjstmntAmt(BigDecimal.ZERO);// set [온라인장부조정금액]
			acStlmntGlMBatIO.setManualEntryLdgrAdjstmntAmt(BigDecimal.ZERO);// set [비온라인장부조정금액]
			acStlmntGlMBatIO.setStlmntAfBal(BigDecimal.ZERO);// set [결산후잔액]
			acStlmntGlMBatIO.setAcctgDmnthAcmltdAmt(inItem.getAcctgDmnthAcmltdAmt());// set [계리월중적수]
			acStlmntGlMBatIO.setAcctgDtrmAcmltdAmt(inItem.getAcctgDtrmAcmltdAmt());// set [계리기중적수]
			
			stlmntBsicDataList.add(acStlmntGlMBatIO);
		}

		_getAcStlmntGlMBat().insertList(stlmntBsicDataList);
	}

	
	/**
	 * Validation Biz Date Check
	 * 날짜 형식 유효성 체크
	 * @param date
	 * @param msg
	 * @throws BizApplicationException 
	 */
	private void _checkBizDate(String date, String msg) throws BizApplicationException {
		
		if (!DateUtils.isValidDate(date)) {
			// 입력한 날짜형식이 유효하지 않습니다.
			throw new BizApplicationException("AAPCME0001", new Object[] {"@".concat(msg) , date});
		}

		if(StringUtils.isEmpty(date)){
			// {0}은/는 필수 입력 항목입니다.
			throw new BizApplicationException("AAPCME0006", new Object[] {date});
		}

		if(date.compareTo(_getCmnContext().getBusinessDate()) > 0 ){
			// 시스템일자보다 미래일자로 회계처리가 허용되지 않습니다.
			throw new BizApplicationException("AAPACE3044", null);
		}
	}
	

	/**
	 * @return the acStlmntGlMBat
	 */
	private AcStlmntGlMBat _getAcStlmntGlMBat() {
		if (acStlmntGlMBat == null) {
			acStlmntGlMBat = (AcStlmntGlMBat) CbbApplicationContext.getBean(AcStlmntGlMBat.class, acStlmntGlMBat);
		}
		return acStlmntGlMBat;
	}
	
	
	/**
	 * @return the acGlMBat
	 */
	private AcGlMBat _getAcGlMBat() {
		if (acGlMBat == null) {
			acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);
		}
		return acGlMBat;
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
	 * @return the deptMngr
	 */
	private DeptMngr _getDeptMngr() {
		if (deptMngr == null) {
			deptMngr = (DeptMngr) CbbApplicationContext.getBean(DeptMngr.class, deptMngr);
		}
		return deptMngr;
	}
	

	/**
	 * @return the deptClsg
	 */
	private DeptClsg _getDeptClsg() {
		if (deptClsg == null) {
			deptClsg = (DeptClsg) CbbApplicationContext.getBean(DeptClsg.class, deptClsg);
		}
		return deptClsg;
	}

}