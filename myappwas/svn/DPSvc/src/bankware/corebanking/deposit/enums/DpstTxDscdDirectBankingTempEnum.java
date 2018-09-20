package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * 수신거래구분코드 다이렉트뱅킹을 위한 임시 조치 향후 수신거래구분코드와 합리적으로 통합 바람  ibkim
 *
 * Author	
 * History
 */
@BxmCategory(logicalName = "The deposit transaction distinction code" )
@CbbClassInfo(classType={"ENUM"})
public enum DpstTxDscdDirectBankingTempEnum implements IEnum { 


	MMF_DEPOSIT                   ("4001"),    // MMF입금
	MMF_WITHDRAWAL                ("4002"),    // MMF출금
	ADD_DEPOSIT                   ("4003"),    // ADD입금
	ADD_WITHDRAWAL                ("4004"),    // ADD출금
	WMP_DEPOSIT                   ("4005"),    // WMP입금
	WMP_WITHDRAWAL                ("4006"),    // WMP출금
	CARD_DEPOSIT                  ("4007"),    // 카드입금()
	CARD_WITHDRAWAL               ("4008"),    // 카드출금(충전)
	CHARGE                		  ("5001"),    // 충전
	WITHDRAWAL                    ("5002"),    // 출금
	MMF_SUBSCRIPTION              ("5003"),    // MMF가입
	MMF_REDEMPTION                ("5004"),    // MMF상환
	DB_ADD_DEPOSIT                ("5005"),    // ADD입금
	DB_ADD_WITHDRAWAL             ("5006"),    // ADD출금
	WMP_SUBSCRIPTION              ("5007"),    // WMP가입
	DB_WMP_WITHDRAWAL             ("5008"),    // WMP출금
	WMP_MATURITY                  ("5009"),    // WMP만기
	;


	private String value;




	DpstTxDscdDirectBankingTempEnum(String value ) { 
    	this.value = value;


    }


    public String getValue() {
		return value;
	}


    public static DpstTxDscdDirectBankingTempEnum getEnum (String value){
        for (DpstTxDscdDirectBankingTempEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (DpstTxDscdDirectBankingTempEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


