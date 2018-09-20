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
@XmlType(propOrder={"feeList"}, name="FeeSmltnSvcOut")
@XmlRootElement(name="FeeSmltnSvcOut")
@SuppressWarnings("all")
public class FeeSmltnSvcOut  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -1413498953L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << feeList >> [[ */
	
	@XmlTransient
	private boolean isSet_feeList = false;
	
	protected boolean isSet_feeList()
	{
		return this.isSet_feeList;
	}
	
	protected void setIsSet_feeList(boolean value)
	{
		this.isSet_feeList = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="수수료내역", formatType="", format="", align="left", length=0, decimal=0, arrayReference="500", fill="", comment="", validationRule="")
	private java.util.List<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub> feeList  = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub>();
	
	/**
	 * @Description 수수료내역
	 */
	public java.util.List<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub>  getFeeList(){
		return feeList;
	}
	
	/**
	 * @Description 수수료내역
	 */
	@JsonProperty("feeList")
	public void setFeeList( java.util.List<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub> feeList ) {
		isSet_feeList = true;
		this.feeList = feeList;
	}
	
	/** Property set << feeList >> ]]
	*******************************************************************************************************************************/

	@Override
	public FeeSmltnSvcOut clone(){
		try{
			FeeSmltnSvcOut object= (FeeSmltnSvcOut)super.clone();
			if ( this.feeList== null ) object.feeList = null;
			else{
				java.util.List<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub> clonedList = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub>(feeList.size());
				for( bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub item : feeList ){
					clonedList.add( (bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub)item.clone());
				}
				object.feeList = clonedList;
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
		result = prime * result + ((feeList==null)?0:feeList.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOut other = (bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOut)obj;
		if ( feeList == null ){
			if ( other.feeList != null ) return false;
		}
		else if ( !feeList.equals(other.feeList) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOut:\n");
		sb.append("\tfeeList: ");
		if ( feeList == null ) sb.append("null");
		else{
			sb.append("array count : ");
			sb.append(feeList.size());
			sb.append("(items)\n");
	
			int max= (10<feeList.size())?10:feeList.size();
	
			for ( int i = 0; i < max; ++i ){
				sb.append("\tfeeList[");
				sb.append(i);
				sb.append("] : ");
				sb.append(feeList.get(i));
				sb.append("\n");
			}
	
			if ( max < feeList.size() ){
				sb.append("\tfeeList[.] : ").append("more ").append((feeList.size()-max)).append(" items").append("\n");
			}
		}
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		{/*feeList*/
			int size=500;
			int count= feeList.size();
			int min= size > count?count:size;
			bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub emptyElement= null;
			for ( int i = 0; i < size ; ++i ){
				if ( i < min ){
					bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub element= feeList.get(i);
					if ( element != null && !(element instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= element==null?0:( (Predictable)element).predictMessageLength();
				}else{
					if ( emptyElement== null ) emptyElement= new bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub();
					if ( !(emptyElement instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= ( (Predictable)emptyElement).predictMessageLength();
				}
			}
		}
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("feeList");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("feeList", get("feeList"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -976716476 : /* feeList */
			return getFeeList();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -976716476 : /* feeList */
			setFeeList((java.util.List<bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcOutSub>) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
