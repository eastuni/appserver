<%@ page contentType="text/html; charset=utf-8" %>
<%@ page import="org.apache.commons.fileupload.FileItem" %>
<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory" %>
<%@ page import="org.apache.commons.fileupload.servlet.ServletFileUpload" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.io.UnsupportedEncodingException" %>
<%@ page import="java.io.BufferedInputStream" %>
<%@ page import="java.io.BufferedOutputStream" %>
<%@ page import="java.io.FileOutputStream" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.io.File" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="javax.servlet.ServletContext" %>

<%@ page import="org.json.simple.JSONArray" %>
<%@ page import="org.json.simple.JSONObject" %>
<%@ page import="org.json.simple.parser.JSONParser" %>
<%@ page import="org.json.simple.parser.ParseException" %>
<%@ page import="org.springframework.web.multipart.MultipartFile" %>
<%@ page import="org.springframework.web.multipart.MultipartHttpServletRequest" %>
<%@ page import="com.oreilly.servlet.MultipartRequest" %>
<%@ page import="com.bankware.pf.prodcore.core.engine.util.PfAttachmentFileRenamePolicy" %>

<%@ page import="com.bankware.pf.prodcore.core.engine.manager.impl.common.CommonContextManager" %>



<%@ page trimDirectiveWhitespaces="true" %>

<%

// Check that we have a file upload request
boolean isMultipart = ServletFileUpload.isMultipartContent(request);
if(isMultipart){
		

	response.setContentType("application/json; charset=utf-8");
	Map paramMap = request.getParameterMap();
	Iterator iterator = paramMap.keySet().iterator();

	//Set Upload path
	String basePath = CommonContextManager.getAttachmentFilePath() + File.separator;

	String realFolder = ""; 
	String saveFolder = basePath; 
	String encType = "utf-8"; 
	int maxSize = 30*1024*1024; 
	ServletContext context = getServletContext();
	realFolder = context.getRealPath(saveFolder);
	String serverName = request.getServerName();
	int port = request.getServerPort();

	//가짜경로(파일 저장위치를 컨텍스트 아래로 뒀을경우 jsp를 거지치 않고 fileURL로 파일을 받을수 있음)
	String baseUrl = "";
	if (port == 80) {
		baseUrl = "http://" + serverName + "/serviceEndpoint/pfactoryfileupload/";
	} else {
		baseUrl = "http://" + serverName + ":" + port + "/serviceEndpoint/pfactoryfileupload/";
	}

	SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
	String dt = fmt.format(new Date());
	String month = dt.substring(0, 6);

	File desti = new File(basePath + "/" + month);

	if (!desti.exists()) {
		//없다면 생성
		desti.mkdirs();
	}

	MultipartRequest multi = null;
	String outMsg = "";

	try {
		//delete list

		multi = new MultipartRequest(request,basePath,maxSize,encType, new PfAttachmentFileRenamePolicy());

		String deleteList = multi.getParameter("deleteList");

		JSONParser jsonParser = new JSONParser();
		JSONArray jsonArray = null;

		try {
			jsonArray = (JSONArray) jsonParser.parse(deleteList);
		} catch (ParseException pe) {
			// TODO Auto-generated catch block
			pe.printStackTrace();
		}

		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObjejct = (JSONObject) jsonArray.get(i);

			String fileUrl = jsonObjejct.get("fileUrl").toString();
			String tempPath = fileUrl.substring(0, fileUrl.lastIndexOf("/"));
			String deletefileName = fileUrl.substring(tempPath.lastIndexOf("/"));

			File file = new File(basePath + deletefileName);
			file.delete();
		}



		Enumeration files = multi.getFileNames();

		int cnt = 0;
		outMsg += "[";
		String fileSrvrPath = basePath + month;
		while (files.hasMoreElements()) {
			
			if (cnt == 0) {
				outMsg += "{";
			} else {
				outMsg += ",{";
			}
			
			String name = (String)files.nextElement();
			String srvrFileNm = multi.getFilesystemName(name);
			String fileName = multi.getOriginalFileName(name);//new String(multi.getOriginalFileName(name).getBytes("8859_1"),"EUC-KR");
			String type = multi.getContentType(name);
			File  f =  new File(fileSrvrPath+ "/" + srvrFileNm);
			System.out.println("파라메터 이름 : " + name +"<br>");
			System.out.println("실제 파일 이름 : " + fileName +"<br>");
			System.out.println("저장된 파일 이름 : " + srvrFileNm +"<br>");
			System.out.println("파일 타입 : " + type +"<br>");

			String fileUrl = baseUrl + month + "/" + srvrFileNm;
			
			String fileExtnsn = "";
			int idx = fileName.lastIndexOf(".");
			if (idx >= 0) {
				fileExtnsn = fileName.substring(idx + 1);
			}
			outMsg += "\"localFileName\" : \"" + fileName + "\",";
			outMsg += "\"serverFileName\" : \"" + srvrFileNm + "\",";
			outMsg += "\"fileUrl\" : \"" + fileUrl + "\",";
			outMsg += "\"fileSize\" : \"" + f.length() + "\",";
			outMsg += "\"fileExtension\" : \"" + fileExtnsn + "\",";
			outMsg += "\"process\" : \"C\"";
			outMsg += "}";
			
			cnt++;
		}
		outMsg += "]";

	} catch(Throwable e) {
		e.printStackTrace();
		outMsg = "{ \"error\": true }";
	}

	out.println(outMsg);
}
%>

