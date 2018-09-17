<%@ page language="java" contentType="text/html; charset=utf-8"  import = "java.io.*,java.net.*,com.bankware.pf.prodcore.core.engine.manager.impl.common.CommonContextManager"%>
<%

	String fileName = request.getParameter("fileName");
	String target = request.getParameter("target");
	String localFileName = request.getParameter("localFileName");
    String filePath = null;

    //Attachmenet
    if(target.equals("atch.file.path")){
        filePath = CommonContextManager.getAttachmentFilePath() + File.separator;
    }
    //Temp
    else if(target.equals("temp.file.path")) {
        filePath = CommonContextManager.getTempFilePath() + File.separator;
    }
    //Default
    else {
        filePath = CommonContextManager.getTempFilePath() + File.separator;
    }

    /* --------------------------- log ----------------------------- */
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    System.out.println( " fileName : " + fileName);
    /* ------------------------------------------------------------- */


    try {
        /* ckeck file or path */
        if (fileName == null || fileName.equals("")) {
            out.println("<script language='javascript'>");
            out.println("alert('File Name or Path not specified.');");
            out.println("</script>");
            return;
        }

    } catch (Exception e) {
        out.println("<script language='javascript'>");
        out.println("alert('Unexpected Error.');");
        out.println("</script>");
        return;
    }


    try {

        response.setContentType("application/x-msdownload; charset=utf-8");
        response.setHeader("Content-Disposition","attachment;filename="+localFileName);

		File file = new File(filePath + fileName);
		FileInputStream fin = new FileInputStream(file);
		ServletOutputStream oout = response.getOutputStream();

		int ifilesize = (int)file.length();
		byte b[] = new byte[ifilesize];

		oout = response.getOutputStream();
		fin.read(b);
		oout.write(b,0,ifilesize);

    	oout.flush();
    	oout.close();

    } catch (IOException e) {
    	e.printStackTrace();
        out.println("<script language=javascript>");
        out.println("alert('Does not file !');");
        out.println("</script>");
    }



%>