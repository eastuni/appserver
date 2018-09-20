/******************************************************************************
 * Bxm Object Message Mapping(OMM) - Source Generator V6-1
 *
 * 생성된 자바파일은 수정하지 마십시오.
 * OMM 파일 수정시 Java파일을 덮어쓰게 됩니다.
 *
 ******************************************************************************/

package bankware.corebanking.deposit.simulation.service.dto;


import bxm.omm.annotation.BxmOmm_Field;
import bxm.omm.predict.Predictable;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"acctNbr", "pswd", "arrTrmntnDscd", "rckngDt", "trmntnBaseDt"}, name="ClsSmltnSvcIn")
@XmlRootElement(name="ClsSmltnSvcIn")
@SuppressWarnings("all")
public class ClsSmltnSvcIn extends bankware.corebanking.dto.CbbIOmmObject {

	private static final long serialVersionUID = -697365440L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << acctNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_acctNbr = false;
	
	protected boolean isSet_acctNbr()
	{
		return this.isSet_acctNbr;
	}
	
	protected void setIsSet_acctNbr(boolean value)
	{
		this.isSet_acctNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계좌번호", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String acctNbr  = null;
	
	/**
	 * @Description 계좌번호
	 */
	public java.lang.String getAcctNbr(){
		return acctNbr;
	}
	
	/**
	 * @Description 계좌번호
	 */
	@JsonProperty("acctNbr")
	public void setAcctNbr( java.lang.String acctNbr ) {
		isSet_acctNbr = true;
		this.acctNbr = acctNbr;
	}
	
	/** Property set << acctNbr >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << pswd >> [[ */
	
	@XmlTransient
	private boolean isSet_pswd = false;
	
	protected boolean isSet_pswd()
	{
		return this.isSet_pswd;
	}
	
	protected void setIsSet_pswd(boolean value)
	{
		this.isSet_pswd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="비밀번호", formatType="", format="", align="left", length=6, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String pswd  = null;
	
	/**
	 * @Description 비밀번호
	 */
	public java.lang.String getPswd(){
		return pswd;
	}
	
	/**
	 * @Description 비밀번호
	 */
	@JsonProperty("pswd")
	public void setPswd( java.lang.String pswd ) {
		isSet_pswd = true;
		this.pswd = pswd;
	}
	
	/** Property set << pswd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrTrmntnDscd >> [[ */
	
	@XmlTransient
	private boolean isSet_arrTrmntnDscd = false;
	
	protected boolean isSet_arrTrmntnDscd()
	{
		return this.isSet_arrTrmntnDscd;
	}
	
	protected void setIsSet_arrTrmntnDscd(boolean value)
	{
		this.isSet_arrTrmntnDscd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약해지구분코드", formatType="", format="", align="left", length=2, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrTrmntnDscd  = null;
	
	/**
	 * @Description 계약해지구분코드
	 */
	public java.lang.String getArrTrmntnDscd(){
		return arrTrmntnDscd;
	}
	
	/**
	 * @Description 계약해지구분코드
	 */
	@JsonProperty("arrTrmntnDscd")
	public void setArrTrmntnDscd( java.lang.String arrTrmntnDscd ) {
		isSet_arrTrmntnDscd = true;
		this.arrTrmntnDscd = arrTrmntnDscd;
	}
	
	/** Property set << arrTrmntnDscd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << rckngDt >> [[ */
	
	@XmlTransient
	private boolean isSet_rckngDt = false;
	
	protected boolean isSet_rckngDt()
	{
		return this.isSet_rckngDt;
	}
	
	protected void setIsSet_rckngDt(boolean value)
	{
		this.isSet_rckngDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="기산년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String rckngDt  = null;
	
	/**
	 * @Description 기산년월일
	 */
	public java.lang.String getRckngDt(){
		return rckngDt;
	}
	
	/**
	 * @Description 기산년월일
	 */
	@JsonProperty("rckngDt")
	public void setRckngDt( java.lang.String rckngDt ) {
		isSet_rckngDt = true;
		this.rckngDt = rckngDt;
	}
	
	/** Property set << rckngDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << trmntnBaseDt >> [[ */
	
	@XmlTransient
	private boolean isSet_trmntnBaseDt = false;
	
	protected boolean isSet_trmntnBaseDt()
	{
		return this.isSet_trmntnBaseDt;
	}
	
	protected void setIsSet_trmntnBaseDt(boolean value)
	{
		this.isSet_trmntnBaseDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="해지기준일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String trmntnBaseDt  = null;
	
	/**
	 * @Description 해지기준일
	 */
	public java.lang.String getTrmntnBaseDt(){
		return trmntnBaseDt;
	}
	
	/**
	 * @Description 해지기준일
	 */
	@JsonProperty("trmntnBaseDt")
	public void setTrmntnBaseDt( java.lang.String trmntnBaseDt ) {
		isSet_trmntnBaseDt = true;
		this.trmntnBaseDt = trmntnBaseDt;
	}
	
	/** Property set << trmntnBaseDt >> ]]
	*******************************************************************************************************************************/

	@Override
	public ClsSmltnSvcIn clone(){
		try{
			ClsSmltnSvcIn object= (ClsSmltnSvcIn)super.clone();
			if ( this.acctNbr== null ) object.acctNbr = null;
			else{
				object.acctNbr = this.acctNbr;
			}
			if ( this.pswd== null ) object.pswd = null;
			else{
				object.pswd = this.pswd;
			}
			if ( this.arrTrmntnDscd== null ) object.arrTrmntnDscd = null;
			else{
				object.arrTrmntnDscd = this.arrTrmntnDscd;
			}
			if ( this.rckngDt== null ) object.rckngDt = null;
			else{
				object.rckngDt = this.rckngDt;
			}
			if ( this.trmntnBaseDt== null ) object.trmntnBaseDt = null;
			else{
				object.trmntnBaseDt = this.trmntnBaseDt;
			}
			
			return object;
		} 
		catch(Exception e){
			throw new bxm.omm.exception.CloneFailedException(e);
		}
	}

	
	@Override
	public int hashCode(){
		final int prime=31;
		int result = 1;
		result = prime * result + ((acctNbr==null)?0:acctNbr.hashCode());
		result = prime * result + ((pswd==null)?0:pswd.hashCode());
		result = prime * result + ((arrTrmntnDscd==null)?0:arrTrmntnDscd.hashCode());
		result = prime * result + ((rckngDt==null)?0:rckngDt.hashCode());
		result = prime * result + ((trmntnBaseDt==null)?0:trmntnBaseDt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcIn other = (bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcIn)obj;
		if ( acctNbr == null ){
			if ( other.acctNbr != null ) return false;
		}
		else if ( !acctNbr.equals(other.acctNbr) )
			return false;
		if ( pswd == null ){
			if ( other.pswd != null ) return false;
		}
		else if ( !pswd.equals(other.pswd) )
			return false;
		if ( arrTrmntnDscd == null ){
			if ( other.arrTrmntnDscd != null ) return false;
		}
		else if ( !arrTrmntnDscd.equals(other.arrTrmntnDscd) )
			return false;
		if ( rckngDt == null ){
			if ( other.rckngDt != null ) return false;
		}
		else if ( !rckngDt.equals(other.rckngDt) )
			return false;
		if ( trmntnBaseDt == null ){
			if ( other.trmntnBaseDt != null ) return false;
		}
		else if ( !trmntnBaseDt.equals(other.trmntnBaseDt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append(super.toString());
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.ClsSmltnSvcIn:\n");
		sb.append("\tacctNbr: ");
		sb.append(acctNbr==null?"null":getAcctNbr());
		sb.append("\n");
		sb.append("\tpswd: ");
		sb.append(pswd==null?"null":getPswd());
		sb.append("\n");
		sb.append("\tarrTrmntnDscd: ");
		sb.append(arrTrmntnDscd==null?"null":getArrTrmntnDscd());
		sb.append("\n");
		sb.append("\trckngDt: ");
		sb.append(rckngDt==null?"null":getRckngDt());
		sb.append("\n");
		sb.append("\ttrmntnBaseDt: ");
		sb.append(trmntnBaseDt==null?"null":getTrmntnBaseDt());
		sb.append("\n");
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		messageLen+= 20; /* acctNbr */
		messageLen+= 6; /* pswd */
		messageLen+= 2; /* arrTrmntnDscd */
		messageLen+= 8; /* rckngDt */
		messageLen+= 8; /* trmntnBaseDt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("acctNbr");
	
		fieldNames.add("pswd");
	
		fieldNames.add("arrTrmntnDscd");
	
		fieldNames.add("rckngDt");
	
		fieldNames.add("trmntnBaseDt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("acctNbr", get("acctNbr"));
	
		fieldValueMap.put("pswd", get("pswd"));
	
		fieldValueMap.put("arrTrmntnDscd", get("arrTrmntnDscd"));
	
		fieldValueMap.put("rckngDt", get("rckngDt"));
	
		fieldValueMap.put("trmntnBaseDt", get("trmntnBaseDt"));
	
	
		return fieldValueMap;
	}

	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -1177207765 : /* acctNbr */
			return getAcctNbr();
		case 3450896 : /* pswd */
			return getPswd();
		case 186235242 : /* arrTrmntnDscd */
			return getArrTrmntnDscd();
		case 1032685443 : /* rckngDt */
			return getRckngDt();
		case -970605574 : /* trmntnBaseDt */
			return getTrmntnBaseDt();
		default :
			return super.get(key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -1177207765 : /* acctNbr */
			setAcctNbr((java.lang.String) value);
			return;
		case 3450896 : /* pswd */
			setPswd((java.lang.String) value);
			return;
		case 186235242 : /* arrTrmntnDscd */
			setArrTrmntnDscd((java.lang.String) value);
			return;
		case 1032685443 : /* rckngDt */
			setRckngDt((java.lang.String) value);
			return;
		case -970605574 : /* trmntnBaseDt */
			setTrmntnBaseDt((java.lang.String) value);
			return;
		default : super.set(key, value);
		}
	}
}
