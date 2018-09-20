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
import java.util.Hashtable;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import bxm.omm.root.IOmmObject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"arrId", "baseDt"}, name="DpstAccrualTrgtSrvIO")
@XmlRootElement(name="DpstAccrualTrgtSrvIO")
@SuppressWarnings("all")
public class DpstAccrualTrgtSrvIO  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = 755725043L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << arrId >> [[ */
	
	@XmlTransient
	private boolean isSet_arrId = false;
	
	protected boolean isSet_arrId()
	{
		return this.isSet_arrId;
	}
	
	protected void setIsSet_arrId(boolean value)
	{
		this.isSet_arrId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약식별자", formatType="", format="", align="left", length=40, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrId  = null;
	
	/**
	 * @Description 계약식별자
	 */
	public java.lang.String getArrId(){
		return arrId;
	}
	
	/**
	 * @Description 계약식별자
	 */
	@JsonProperty("arrId")
	public void setArrId( java.lang.String arrId ) {
		isSet_arrId = true;
		this.arrId = arrId;
	}
	
	/** Property set << arrId >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << baseDt >> [[ */
	
	@XmlTransient
	private boolean isSet_baseDt = false;
	
	protected boolean isSet_baseDt()
	{
		return this.isSet_baseDt;
	}
	
	protected void setIsSet_baseDt(boolean value)
	{
		this.isSet_baseDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="기준일자", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String baseDt  = null;
	
	/**
	 * @Description 기준일자
	 */
	public java.lang.String getBaseDt(){
		return baseDt;
	}
	
	/**
	 * @Description 기준일자
	 */
	@JsonProperty("baseDt")
	public void setBaseDt( java.lang.String baseDt ) {
		isSet_baseDt = true;
		this.baseDt = baseDt;
	}
	
	/** Property set << baseDt >> ]]
	*******************************************************************************************************************************/

	@Override
	public DpstAccrualTrgtSrvIO clone(){
		try{
			DpstAccrualTrgtSrvIO object= (DpstAccrualTrgtSrvIO)super.clone();
			if ( this.arrId== null ) object.arrId = null;
			else{
				object.arrId = this.arrId;
			}
			if ( this.baseDt== null ) object.baseDt = null;
			else{
				object.baseDt = this.baseDt;
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
		result = prime * result + ((arrId==null)?0:arrId.hashCode());
		result = prime * result + ((baseDt==null)?0:baseDt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.DpstAccrualTrgtSrvIO other = (bankware.corebanking.deposit.simulation.service.dto.DpstAccrualTrgtSrvIO)obj;
		if ( arrId == null ){
			if ( other.arrId != null ) return false;
		}
		else if ( !arrId.equals(other.arrId) )
			return false;
		if ( baseDt == null ){
			if ( other.baseDt != null ) return false;
		}
		else if ( !baseDt.equals(other.baseDt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.DpstAccrualTrgtSrvIO:\n");
		sb.append("\tarrId: ");
		sb.append(arrId==null?"null":getArrId());
		sb.append("\n");
		sb.append("\tbaseDt: ");
		sb.append(baseDt==null?"null":getBaseDt());
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
	
		messageLen+= 40; /* arrId */
		messageLen+= 8; /* baseDt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("arrId");
	
		fieldNames.add("baseDt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("arrId", get("arrId"));
	
		fieldValueMap.put("baseDt", get("baseDt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case 93089628 : /* arrId */
			return getArrId();
		case -1396203711 : /* baseDt */
			return getBaseDt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case 93089628 : /* arrId */
			setArrId((java.lang.String) value);
			return;
		case -1396203711 : /* baseDt */
			setBaseDt((java.lang.String) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
