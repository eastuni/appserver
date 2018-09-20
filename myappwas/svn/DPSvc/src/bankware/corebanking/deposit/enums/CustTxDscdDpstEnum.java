package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * This Enum class is used to classify transfer cycle code for standing order processing
 *
 * Author	Heejung Park
 * History
 *  2015.09.10	initial version for 2.2
 */
@BxmCategory(logicalName = "The deposit transaction distinction code" )
@CbbClassInfo(classType={"ENUM"})
public enum CustTxDscdDpstEnum implements IEnum {


    OPEN                              ("1001"),    // 일반신규
    DEPOSIT_CASH                      ("1002"),    // 현금입금
    DEPOSIT_TRANSFER                  ("1003"),    // 대체입금
    DEPOSIT_STANDING_ORDER            ("1004"),    // 자동이체입금
    DEPOSIT_INTEREST_CAPITALIZATION   ("1005"),    // 이자원가
    DEPOSIT_INTERFACE_TRANSFER        ("1006"),    // 이체입금
    DEPOSIT_LOAN_DISBURSEMENT         ("1007"),    // 대출실행입금
    DEPOSIT_BALANCE_SWEEP             ("1008"),    // 잔액스윕입금
    WITHDRAWAL_CASH                   ("1009"),    // 현금출금
    WITHDRAWAL_TRANSFER               ("1010"),    // 대체출금
    WITHDRAWAL_LOAN_INTEREST          ("1011"),    // 대출이자
    WITHDRAWAL_INTERFACE_TRANSFER     ("1012"),    // 이체출금
    WITHDRAWAL_REPAYMENT_LOAN         ("1013"),    // 대출상환
    WITHDRAWAL_FEE                    ("1014"),    // 수수료출금
    WITHDRAWAL_FEE_LOAN               ("1015"),    // 대출약정수수료출금
    WITHDRAWAL_BALANCE_SWEEP          ("1016"),    // 잔액스윕출금
    WITHDRAWAL_STANDING_ORDER         ("1017"),    // 자동이체출금
    CLOSE				              ("1018"),    // 일반해지
    RECHARGE                          ("2001"),    // 충전
    DEPOSIT_SMART_DEPOSIT             ("2002"),    // SMART DEPOSIT 입금
    WITHDRAWAL_SMART_DEPOSIT          ("2003"),    // SMART DEPOIST 출금
    SUBSCRIPTION_MMF                  ("2004"),    // MMF 투자
    REDEMPTION_MMF                    ("2005"),    // MMF 회수
    SUBSCRIPTION_WMP                  ("2006"),    // WMP 투자
    WITHDRAWAL_WMP                    ("2007"),    // WMP 출금
    BENEFIT_AMT						  ("2008"),	   // 충전시 혜택금액
    ;


    private String value;




    CustTxDscdDpstEnum(String value ) {
        this.value = value;


    }


    public String getValue() {
        return value;
    }


    public static CustTxDscdDpstEnum getEnum (String value){
        for (CustTxDscdDpstEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (CustTxDscdDpstEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


