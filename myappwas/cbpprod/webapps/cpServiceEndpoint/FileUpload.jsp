<%@ page contentType="text/html; charset=utf-8" %>
<%@ page import="org.apache.commons.fileupload.FileItem" %>
<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory" %>
<%@ page import="org.apache.commons.fileupload.servlet.ServletFileUpload" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.io.File" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.io.BufferedInputStream" %>
<%@ page import="java.io.BufferedOutputStream" %>
<%@ page import="java.io.FileOutputStream" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.util.Enumeration" %>
<%@ page trimDirectiveWhitespaces="true" %>

<html>
<head><title>파일 업로드 처리</title></head>
<body>
<%

// Check that we have a file upload request
boolean isMultipart = ServletFileUpload.isMultipartContent(request);

String userHome = System.getProperty("user.home");
String serverName = request.getServerName();
int port = request.getServerPort();

String basePath = userHome + "/bxm/installableApps/serviceEndpoint/fileupload";
String baseUrl = "";
if(port == 80) {
  baseUrl = "http://" + serverName + "/serviceEndpoint/fileupload/";
} else {
  baseUrl = "http://" + serverName + ":" + port + "/serviceEndpoint/fileupload/";
}  

// output string
String outMsg = "{\"resultOut\" : {\"returnCode\" : \"0\", \"errorMessages\" :  \"\", \"resultList\" : [";

if(isMultipart) {
    File temporaryDir = new File("/tmp/uploadfile/");

    // Create a factory for disk-based file items
    DiskFileItemFactory factory = new DiskFileItemFactory();

    // Set factory constraints
    factory.setSizeThreshold(1024*1024);
    factory.setRepository(temporaryDir);

    // Create a new file upload handler
    ServletFileUpload upload = new ServletFileUpload(factory);

    // Set overall request size constraint
    upload.setSizeMax(5*1024*1024);

    // Parse the request
    List items = upload.parseRequest(request);

    // Process the uploaded items
    int cnt = 0;
    Iterator iter = items.iterator();
    while (iter.hasNext()) {
        if(cnt == 0) {
          outMsg += "{";
        } else {
          outMsg += ",{";
        }

        FileItem fileItem = (FileItem) iter.next();

        if (fileItem.isFormField()) {
            out.println("폼 파라미터 : " + fileItem.getFieldName() + "=" + fileItem.getString("utf-8") + "<br/>");
        } else {
            // 업로드한 파일이 존재하는 경우
            if( fileItem.getSize() > 0 ) {
                int idx = fileItem.getName().lastIndexOf("\\");
                if( idx < 0 ) {
                    idx = fileItem.getName().lastIndexOf("/");
                }
                String fileName = fileItem.getName().substring(idx + 1);

                String fileExtnsn = "";
                idx = fileItem.getName().lastIndexOf(".");
                if( idx >= 0 ) {
                  fileExtnsn = fileItem.getName().substring(idx + 1);
                }

                SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss") ;
                String dt = fmt.format(new Date()) ;
                String srvrFileNm = dt + "_" + Math.abs(fileName.hashCode()) + "." + fileExtnsn;
                String month = dt.substring(0,6);
                String fileSrvrPath = basePath + "/" + month;
                String fileUrl = baseUrl + month + "/" + srvrFileNm;
                long fileSize = fileItem.getSize();

                try {
                    File dir = new File(fileSrvrPath);
                    if(!dir.exists()) {
                      dir.mkdirs();
                    }

                    File uploadedFile = new File(fileSrvrPath + "/" + srvrFileNm);
                    fileItem.write(uploadedFile);

                    // Set output
                    outMsg += "\"localFileNm\" : \"" + fileName + "\",";
                    outMsg += "\"srvrFileNm\" : \"" + srvrFileNm + "\",";
                    outMsg += "\"fileSrvrPath\" : \"" + fileSrvrPath + "\",";
                    outMsg += "\"fileUrl\" : \"" + fileUrl + "\",";
                    outMsg += "\"fileSize\" : \"" + fileSize + "\",";
                    outMsg += "\"fileExtnsn\" : \"" + fileExtnsn + "\"";
                } catch(IOException e) {
                    outMsg = "{\"rsltOut\" : {\"returnCode\" :  \"1\", \"errorMessages\" :  \"" + e.toString() + "\", \"resultList\" : []}}";
                    out.println(outMsg);
                    return;
                }
            } // end of if
        } // end of if

        outMsg += "}";
        cnt++;
    } // end of while

    outMsg += "]}}";
    out.println(outMsg);
} else {
    //outMsg = "{\"rsltOut\" :{\"returnCode\" :  \"1\", \"errorMessages\" :  " + "인코딩 타입이 multipart/form-data 가 아님." + ", \"resultList\" : []}}";

    String [] srvrFileNmList = request.getParameterValues("srvrFileNm");

    if(srvrFileNmList == null) {
      out.println(outMsg);
      return;
    }

    for(int i=0; i < srvrFileNmList.length; i++) {
      outMsg += srvrFileNmList[i] + " ";

      File fileToDel = new File(srvrFileNmList[i]);
      fileToDel.delete();
    }
    
    out.println(outMsg);
}
%>
</body>
</html>
