package bankware.corebanking.accounting.balanceverification.batch;


import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.balanceverification.daobatch.BalVrfctnBat;
import bankware.corebanking.accounting.balanceverification.daobatch.dto.BalVrfctnBatIO;
import bankware.corebanking.accounting.enums.AcctgBizDscdEnum;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBatIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.applicationcommon.utility.interfaces.DateUtils;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.constant.CAC01;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.core.settlement.arrangementbalance.interfaces.dto.LastBalForAcctgIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.settlement.arrangementbalance.interfaces.ArrBalMngr;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;


/**
 * Balance verification
 *
 * 잔액대사
 *
 * @file   bankware.corebanking.accounting.balanceverification.batch.BalVrfctn.java
 * @author Yoonyeong Ha
 * @history
 * <br> 2016. 6. 22. initial
 */


@BxmBean("BalVrfctnBatch")
@Scope("step")
@BxmCategory(logicalName = "Balance Verification", description = "Balance Verification")
public class BalVrfctnBatch implements Tasklet{


    private ArrBalMngr 			arrBalMngr;
    private AcGlMBat			acGlMBat;
    private CmnContext        	cmnContext;
    private BalVrfctnBat		balVrfctnBat;
    private DateCalculator 		dateCalculator;
    private InstParmMngr 		instParmMngr;


    private String 				instCd;
    private String 				jobDt;
    private String 				deptId;


    private List<AcGlMBatIO> acGlMBatIOList;
    private List<LastBalForAcctgIO> lastBalForAcctgIOList;


    final Logger logger = LoggerFactory.getLogger(this.getClass());




    @Override
    public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {


        /*
         * 1. 총계정잔액(실계정이고 BSIS구분코드가 BS)을 조회하여 잔액대사테이블에 insert
         * 2. 업무팀잔액 조회
         * 3. 잔액대사 처리
         * 		3-1) (instCd, baseDt, deptId, crncyCd, acctgDscd, acctgItmCd가 같으면)
         * 			총계정잔액-업무팀잔액을 차감하여 잔액차액을 구해서 잔액대사집계명세 테이블에 update한다.
         * 		3-2) (다르면)
         * 			업무팀데이터만 잔액대사집계명세 테이블에 insert한다.
         */


    	// TODO
//    	instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");
//        jobDt = _getCmnContext().getBusinessDate();
        instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");
        jobDt = (String)arg1.getStepContext().getJobExecutionContext().get("jobDt");
//        deptId = (String)arg1.getStepContext().getJobExecutionContext().get("deptId");


        if(logger.isDebugEnabled()){
            logger.debug("## BalVrfctn > instCd : {}", instCd);
            logger.debug("## BalVrfctn > jobDt : {}", jobDt);
//            logger.debug("## BalVrfctn > deptId : {}", deptId);
        }


        // 일자검증
        _checkBizDate(jobDt, "@jobDt");


        // 잔액대사집계명세 테이블 잔액 0으로 초기화
        _updateAmtZero();


        // 총계정원장 잔액 조회하고 잔액대사 테이블에 insert
        _inqryAcGlMBal();


        // 업무팀 잔액 조회
        _inqryBizTmBal();


        // 잔액대사 처리
        _processBalVrfctn11(acGlMBatIOList, lastBalForAcctgIOList);


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


        if (StringUtils.isEmpty(instCd)) {
            // {기관코드}는 필수 입력 항목입니다.
            throw new BizApplicationException("AAPCME0006",new Object[] { "Institution Code" });
        }
    }


    /**
     * Update Amount of Balance Verification table
     * @throws BizApplicationException
     */
    private void _updateAmtZero() throws BizApplicationException {


    	BalVrfctnBatIO balVrfctnBatIO = new BalVrfctnBatIO();


    	_getCmnContext().setHeaderColumn(balVrfctnBatIO);


    	balVrfctnBatIO.setInstCd(instCd);// set [기관코드]
		balVrfctnBatIO.setBaseDt(jobDt);// set [거래년월일]
		balVrfctnBatIO.setGlBal(BigDecimal.ZERO);// set [총계정잔액]
		balVrfctnBatIO.setBizTeamBal(BigDecimal.ZERO);// set [업무팀잔액]
		balVrfctnBatIO.setManualEntryBal(BigDecimal.ZERO);// set [비온라인잔액]
		balVrfctnBatIO.setBalDfrncAmt(BigDecimal.ZERO);// set [잔액차액]
		balVrfctnBatIO.setBizTeamRcvdAmt(BigDecimal.ZERO);// set [업무팀입금금액]
		balVrfctnBatIO.setManualEntryRcvdAmt(BigDecimal.ZERO);// set [비온라인입금금액]
		balVrfctnBatIO.setGlRcvdAmt(BigDecimal.ZERO);// set [총계정입금금액]
		balVrfctnBatIO.setRcvdDfrncAmt(BigDecimal.ZERO);// set [입금차액]
		balVrfctnBatIO.setBizTeamWhdrwlAmt(BigDecimal.ZERO);// set [업무팀출금금액]
		balVrfctnBatIO.setManualEntryWhdrwlAmt(BigDecimal.ZERO);// set [비온라인출금금액]
		balVrfctnBatIO.setGlWhdrwlAmt(BigDecimal.ZERO);// set [총계정출금금액]
		balVrfctnBatIO.setWhdrwlDfrncAmt(BigDecimal.ZERO);// set [출금차액]


		int cnt = _getBalVrfctnBat().updateAmt(balVrfctnBatIO);
		if(cnt == 0){
			if(logger.isDebugEnabled()){
				logger.debug("## BalVrfctn > 잔액 0으로 업데이트 할 내역 없음");
			}
		}
	}


    /**
     * Inquiry General Ledger
     * @return
     * @throws BizApplicationException
     */
    private List<AcGlMBatIO> _inqryAcGlMBal() throws BizApplicationException {


        // 기관파라미터 포지션계좌관리여부 Y 확인
        InstParm instParm = _getInstParmMngr().getInstParm(_getCmnContext().getInstCode(), InstParamEnum.POSITION_ACCOUNT_MANAGEMENT_YN.getValue());


        // 기관파라미터 포지션계좌관리여부 Y 인 경우 Log 일련번호 0
        if (instParm != null && instParm.getParmValue() != null && instParm.getParmValue().equals(CAC01.YES)) {
        	acGlMBatIOList = _getAcGlMBat().selectListBalVrfctn(instCd, jobDt, CAC01.TOT_ACCTG_DEPARTMENT, null, CAC01.YES);
        }else {
        	acGlMBatIOList = _getAcGlMBat().selectListBalVrfctn(instCd, jobDt, CAC01.TOT_ACCTG_DEPARTMENT, BsisDscdEnum.BS.getValue(), CAC01.YES);
        }


        if(acGlMBatIOList.isEmpty()){
            // 해당일자 총계정원장 내역이 없습니다. 다시 확인하고 거래하세요.
            throw new BizApplicationException("AAPACE3083");
        }else{
            for(AcGlMBatIO acGlMBatIO : acGlMBatIOList){
            	int cnt = _getBalVrfctnBat().update(_setBalVrfctnBatIO(acGlMBatIO));
            	if(cnt == 0){
            		_getBalVrfctnBat().insert(_setBalVrfctnBatIO(acGlMBatIO));
            	}
            }
        }
        return acGlMBatIOList;
    }


    private BalVrfctnBatIO _setBalVrfctnBatIO(AcGlMBatIO acGlMBatIO) throws BizApplicationException {


        BalVrfctnBatIO balVrfctnBatIO = new BalVrfctnBatIO();


        _getCmnContext().setHeaderColumn(balVrfctnBatIO);
        balVrfctnBatIO.setInstCd(acGlMBatIO.getInstCd());// set [기관코드]
        balVrfctnBatIO.setBaseDt(acGlMBatIO.getBaseDt());// set [거래년월일]
        balVrfctnBatIO.setDeptId(acGlMBatIO.getDeptId());// set [부서식별자]
        balVrfctnBatIO.setCrncyCd(acGlMBatIO.getCrncyCd());// set [통화코드]
        balVrfctnBatIO.setAcctgDscd(acGlMBatIO.getAcctgDscd());// set [회계구분코드]
        balVrfctnBatIO.setAcctgItmCd(acGlMBatIO.getAcctgItmCd());// set [계정과목코드]
        balVrfctnBatIO.setBizDscd(AcctgBizDscdEnum.MN.getValue());
        balVrfctnBatIO.setGlBal(acGlMBatIO.getAcctgBal());


        return balVrfctnBatIO;
    }




    // 업무팀 잔액 조회
    private List<LastBalForAcctgIO> _inqryBizTmBal() throws BizApplicationException {


        lastBalForAcctgIOList = _getArrBalMngr().getListByAccountingItem(instCd);


        if(lastBalForAcctgIOList.isEmpty()){
        	if(logger.isDebugEnabled()){
        		logger.debug(">>> hyy 업무팀 잔액 없음");
        	}
        }
        return lastBalForAcctgIOList;
    }


    private void _processBalVrfctn11(List<AcGlMBatIO> acGlMBatIOList, List<LastBalForAcctgIO> lastBalForAcctgList) throws BizApplicationException {


        for(LastBalForAcctgIO lastBalForAcctgIO : lastBalForAcctgList){


            BalVrfctnBatIO balVrfctnBatIO = new BalVrfctnBatIO();
            boolean check = false;
            int idx = 0;


            for(int i = 0;  i<acGlMBatIOList.size(); i++){


                if(lastBalForAcctgIO.getAcctgDeptId().equals(acGlMBatIOList.get(i).getDeptId()) &&
                        lastBalForAcctgIO.getAcctgDscd().equals(acGlMBatIOList.get(i).getAcctgDscd()) &&
                        lastBalForAcctgIO.getAcctgItmCd().equals(acGlMBatIOList.get(i).getAcctgItmCd()) &&
                        lastBalForAcctgIO.getCrncyCd().equals(acGlMBatIOList.get(i).getCrncyCd())) {


                    check = true;
                    idx = i;
                    break;
                }
            }
            // 같은게 있으면 잔액대사 테이블에 update
            if(check){
                balVrfctnBatIO = new BalVrfctnBatIO();


                _getCmnContext().setHeaderColumn(balVrfctnBatIO);


                balVrfctnBatIO.setInstCd(acGlMBatIOList.get(idx).getInstCd()); // 기관코드
                balVrfctnBatIO.setBaseDt(acGlMBatIOList.get(idx).getBaseDt()); // 기준년월일
                balVrfctnBatIO.setDeptId(acGlMBatIOList.get(idx).getDeptId()); // 부서식별자
                balVrfctnBatIO.setCrncyCd(acGlMBatIOList.get(idx).getCrncyCd()); // 통화코드
                balVrfctnBatIO.setAcctgDscd(acGlMBatIOList.get(idx).getAcctgDscd()); // 회계구분코드
                balVrfctnBatIO.setAcctgItmCd(acGlMBatIOList.get(idx).getAcctgItmCd()); // 계정과목코드


                balVrfctnBatIO.setBizDscd(AcctgBizDscdEnum.MN.getValue());// 업무구분코드
                balVrfctnBatIO.setBizTeamBal(lastBalForAcctgIO.getLastBal()); // 업무팀잔액
                balVrfctnBatIO.setGlBal(acGlMBatIOList.get(idx).getAcctgBal()); // 총계정잔액
                balVrfctnBatIO.setBalDfrncAmt(lastBalForAcctgIO.getLastBal().subtract(acGlMBatIOList.get(idx).getAcctgBal())); // 잔액차액(업무팀잔액-총계정잔액)


                int cnt = _getBalVrfctnBat().update(balVrfctnBatIO);
                if(cnt == 0){
                    // 등록에 실패하였습니다. 다시 시도하여 주세요.
                    throw new BizApplicationException("AAPACE1002");				}
            }
            // 다르면 업무팀 데이터 insert
            else{
                balVrfctnBatIO = new BalVrfctnBatIO();


                _getCmnContext().setHeaderColumn(balVrfctnBatIO);


                balVrfctnBatIO.setInstCd(instCd);// set [기관코드]
                balVrfctnBatIO.setBaseDt(jobDt);
                balVrfctnBatIO.setDeptId(lastBalForAcctgIO.getAcctgDeptId());//set [회계부점식별자]
                balVrfctnBatIO.setCrncyCd(lastBalForAcctgIO.getCrncyCd());// set [통화코드]
                balVrfctnBatIO.setAcctgDscd(lastBalForAcctgIO.getAcctgDscd());// set [회계구분코드]
                balVrfctnBatIO.setAcctgItmCd(lastBalForAcctgIO.getAcctgItmCd());// set [계정과목코드]
                balVrfctnBatIO.setBizDscd(AcctgBizDscdEnum.MN.getValue());// set [업무구분코드]
                balVrfctnBatIO.setBizTeamBal(lastBalForAcctgIO.getLastBal());//set [업무팀잔액]
                balVrfctnBatIO.setBalDfrncAmt(lastBalForAcctgIO.getLastBal());//set [잔액차액]


                int cnt = _getBalVrfctnBat().update(balVrfctnBatIO);
                if(cnt == 0){
                	_getBalVrfctnBat().insert(balVrfctnBatIO);
                }
            }
        }
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
     * @return the balVrfctnBat
     */
    private BalVrfctnBat _getBalVrfctnBat() {
        if (balVrfctnBat == null) {
            balVrfctnBat = (BalVrfctnBat) CbbApplicationContext.getBean(BalVrfctnBat.class, balVrfctnBat);
        }
        return balVrfctnBat;
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
     * @return the cmnContext
     */
    private CmnContext _getCmnContext() {
        if (cmnContext == null) {
            cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
        }
        return cmnContext;
    }


    /**
     * @return the instParmMngr
     */
    private InstParmMngr _getInstParmMngr() {
        if (instParmMngr == null) {
            instParmMngr = (InstParmMngr) CbbApplicationContext.getBean(
                    InstParmMngr.class, instParmMngr);
        }
        return instParmMngr;
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
}
