<%@page import="java.io.File"%>
<%@page import="java.util.Arrays"%>
<%@page import="java.util.Comparator"%>

<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
	<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></script>
	<link href="dashboard.css" rel="stylesheet">
	<title>Coverage Report</title>
</head>
<body>



<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
	<a class="navbar-brand" href="#">Dashboard</a>
	<button class="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>

	<div class="collapse navbar-collapse" id="navbarsExampleDefault">
		<ul class="navbar-nav mr-auto">
			<li class="nav-item active">
				<a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#">Settings</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#">Profile</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#">Help</a>
			</li>
		</ul>
		<form class="form-inline mt-2 mt-md-0">
			<input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
			<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
		</form>
	</div>
</nav>

<div class="container-fluid">
	<div class="row">
		<nav class="col-sm-3 col-md-2 d-none d-sm-block bg-light sidebar">
			<ul class="nav nav-pills flex-column">
				<li class="nav-item">
					<a class="nav-link active" href="#">Overview <span class="sr-only">(current)</span></a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="#section-report">Reports</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="#section-notice">Notice</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="#section-error">Error Handling</a>
				</li>

			</ul>

			
		</nav>

		<main class="col-sm-9 ml-sm-auto col-md-10 pt-3" role="main">
			<h1>Dashboard</h1>

			<section class="row text-center placeholders" style="display:none">
				<div class="col-6 col-sm-3 placeholder">
					<img src="data:image/gif;base64,R0lGODlhAQABAIABAAJ12AAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Generic placeholder thumbnail">
					<h4>Label</h4>
					<div class="text-muted">Something else</div>
				</div>
				<div class="col-6 col-sm-3 placeholder">
					<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Generic placeholder thumbnail">
					<h4>Label</h4>
					<span class="text-muted">Something else</span>
				</div>
				<div class="col-6 col-sm-3 placeholder">
					<img src="data:image/gif;base64,R0lGODlhAQABAIABAAJ12AAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Generic placeholder thumbnail">
					<h4>Label</h4>
					<span class="text-muted">Something else</span>
				</div>
				<div class="col-6 col-sm-3 placeholder">
					<img src="data:image/gif;base64,R0lGODlhAQABAIABAADcgwAAACwAAAAAAQABAAACAkQBADs=" width="200" height="200" class="img-fluid rounded-circle" alt="Generic placeholder thumbnail">
					<h4>Label</h4>
					<span class="text-muted">Something else</span>
				</div>
			</section>

			<p>
			<a class="btn btn-primary btn-lg" target="_blank" href="http://bxq.cbp.bankware/bxq" role="button">Go Q# Dev</a>
			<a class="btn btn-primary btn-lg" target="_blank" href="http://bxq.cbptest.bankware/bxq" role="button">Go Q# Test</a>
			<p />

			<a id='section-report'></a>

			<h2>Reports </h2> <a style="float:right" target="_blank" href ="http://jenkins.cbp.bankware/job/testshell/build?token=1dWG32wMVNIeqxECkGcBIjmj5kYMu0tR6xCioCZPgTd9FUQ3Vte7DOE8K31bdBVR">make new report </a>
			<div class="table-responsive">

				<table class="table table-striped">
					<thead>


						<tr>
							<th>#</th>
							<th>Header</th>
							<th>Header</th>
							<th>Header</th>
						</tr>
					</thead>
					<tbody>

						<%
						File file = new File(request.getSession().getServletContext().getRealPath("/")+"/report");
						file = new File(request.getSession().getServletContext().getRealPath("/")+"/report");
						if(file.isDirectory()){

							File[] files = file.listFiles();



							Arrays.sort(files,
								new Comparator<Object>()
								{
									@Override
									public int compare(Object object1, Object object2) {
									
									String s1 = "";
									String s2 = "";
									

									s1 = ((File)object1).getName();
									s2 = ((File)object2).getName();

									
									
									return s2.compareTo(s1);
								}
							});

							int n = 0;
							for (int i=0; i<files.length && n < 10; i++) {
								File f = files[i];
								if(f.getName().contains("error"))
								continue;
								out.print("<tr>");
								out.print("<td>"+(n+1)+"</td>");
								out.print("<td><a href=report/"+f.getName() + " class='alert-link'>"+f.getName()+"</a></td>");
								out.print("<td> test </td> <td> test </td> </tr>");
								n++;
							}
						}
						%>	 

					</tbody>
				</table>

<nav aria-label="Page navigation example">
	<ul class="pagination">
		<li class="page-item"><a class="page-link" href="#">Previous</a></li>
		<li class="page-item"><a class="page-link" href="#">1</a></li>
		<li class="page-item"><a class="page-link" href="#">2</a></li>
		<li class="page-item"><a class="page-link" href="#">3</a></li>
		<li class="page-item"><a class="page-link" href="#">Next</a></li>
	</ul>
</nav>



</div>









<h2>Error </h2> 
<div class="table-responsive">

	<table class="table table-striped">
		<thead>


			<tr>
				<th>#</th>
				<th>Header</th>
				<th>Header</th>
				<th>Header</th>
			</tr>
		</thead>
		<tbody>

<%
						File file2 = new File(request.getSession().getServletContext().getRealPath("/")+"/report");
						file2 = new File(request.getSession().getServletContext().getRealPath("/")+"/report");
						if(file2.isDirectory()){

							File[] files2 = file2.listFiles();



							Arrays.sort(files2,
								new Comparator<Object>()
								{
									@Override
									public int compare(Object object1, Object object2) {
									
									String s1 = "";
									String s2 = "";
									

									s1 = ((File)object1).getName();
									s2 = ((File)object2).getName();

									
									
									return s2.compareTo(s1);
								}
							});

							int n2 = 0;
							for (int i=0; i<files2.length && n2 < 10; i++) {
								File f = files2[i];
								if(!f.getName().contains("error"))
								continue;
								out.print("<tr>");
								out.print("<td>"+(n2+1)+"</td>");
								out.print("<td><a href=report/"+f.getName() + " class='alert-link'>"+f.getName()+"</a></td>");
								out.print("<td> test </td> <td> test </td> </tr>");
								n2++;
							}
						}
						%>
</tbody>
</table>

<nav aria-label="Page navigation example">
	<ul class="pagination">
		<li class="page-item"><a class="page-link" href="#">Previous</a></li>
		<li class="page-item"><a class="page-link" href="#">1</a></li>
		<li class="page-item"><a class="page-link" href="#">2</a></li>
		<li class="page-item"><a class="page-link" href="#">3</a></li>
		<li class="page-item"><a class="page-link" href="#">Next</a></li>
	</ul>
</nav>



</div>





<h2 id='section-notice'>Notice</h2>

<div class="alert alert-primary" role="alert">
	CSV파일에서 테스트 건수가 n/a인 경우  <br />
	명시적으로 테스트가 없는 경우, 테스트 건수를 0으로 표시하는 대신 n/a로 표시하기로 결정 <br />
	<br />
	대상 <br />
	1. 컴포넌트가 서비스이고, 클래스가 *Svc가 아닌 경우 <br />
	2. 컴포넌트가 BO이고, 클래스가 *Impl이 아닌 경우 <br />
	3. _로 시작하는 함수인 경우 <br />
	4. 클래스가 ArrCnd*Impl인 경우 <br />
	5. 클래스가 ArrXtnAtrt*Impl인 경우 <br />
</div>

<div class="alert alert-primary" role="alert">
	<br />Q# getter/setter 메소드 제외대상
	<pre>
opcode 셋이 정확히 일치하면 레코딩대상에서 제거
   * normal(instance) method 

      * getter opcode (length 5) : 
         * ALOAD_0(0x2a)[0]
         * GETFIELD(0xb4)[1] indexbyte1[2] indexbyte2[3]
         * *RETURN(0xac ~ 0xb0)[4]
      * setter opcode (length 6) : 
         * ALOAD_0(0x2a)[0]
         * *LOAD_1(0x1b|0x1f|0x23|0x27|0x2b)[1]
         * PUTFIELD[2] indexbyte1[3] indextbyte2[4]
         * RETURN(0xb1)[5]
   * static(class) method
      * getter opcode (length 4) : 
         * GETSTATIC(0xb2)[0] indexbyte1[1] indexbyte2[2]
         * *RETURN(0xac ~ 0xb0)[3]
      * setter opcode (length 5) : 
         * *LOAD_0(0x1a|0x1e|0x22|0x26|0x2a)[0]
         * PUTSTATIC[1] indexbyte1[2] indexbyte2[3]
         * RETURN(0xb1)[4]
</pre>
</div>
<br />

<h2>Error Handling</h2> 
<div class="alert alert-info" role="alert">
	결과 파일에서 특정 클래스가 안나오는 경우  <br />
	<br />
	1. Q# 자원별 테스트정보에서 해당 클래스가 검색되는지 확인 <br />
	2. 검색이 되지 않으면 Q# BCI룰 확인, Config 정보관리에서 크롤러 대상 확인  <br />
	3. 검색이 되면 Q# 업무그룹설정을 확인 <br />
</div>

<div class="alert alert-info" role="alert">
	INFO1 <br />
	서비스가 수행되지 않았는데 라인커버리지가 0%
	<br />
	1. 연동서비스인 경우 정상 <br />
	2. API 호출을 위한 테스트 서비스일 경우 정상  <br />
	3. 그 이외의 경우 Q# 초기화가 정상적으로 동작하지 않거나, 테스트 수행중에 다른 온라인 서비스가 호출됨 <br />
</div>


<div class="alert alert-danger" role="alert">
	ERROR1 - 결과 파일에서 컴포넌트가 안나오는 경우 <br />
	<br />
	1. Q# 자원별 테스트정보에서 해당 클래스가 검색되는지 확인 <br />
	2. 검색이 되지 않으면 Q# BCI룰 확인, Config 정보관리에서 크롤러 대상 확인  <br />
	3. 검색이 되면 Q# 업무그룹설정을 확인 <br />
	** 클래스가 아닌 인터페이스를 테스트하고 있는지 확인 <br />
</div>

<div class="alert alert-danger" role="alert">
	ERROR1 - 결과 파일에서 컴포넌트가 나오는 경우 <br />
	<br />
	1. Q# 자원별 테스트정보에서 해당 클래스가 검색되는지 확인, 메소드 목록 확인 <br />
	2. Q#에서는 단순 getter/setter를 수집하지 않으므로 단순 getter/setter 메소드는 테스트에서 제외  <br />
	3. 싱글이 아닌 분산을 테스트하고 있는지 확인  <br />
</div>

<div class="alert alert-danger" role="alert">
	ERROR2 <br />
	Collection에 등록된 테스트 케이스 숫자와 성공/실패 숫자 다름
	<br />
	1. Test script가 모든 케이스 (서비스 오류 등의 상황에도)를 커버하는지 확인  <br />
	2. 같은 폴더 안에 리퀘스트명이 중복된 것이 있는지 확인  <br />
	3. Collection 구조가 Collection, Folder, Request의 구조를 따르는지 확인<br />
	4. Collection version이 V1인지 확인   <br />
</div>

<div class="alert alert-danger" role="alert">
	ERROR3 <br />
	서비스가 수행되었는데 라인커버리지가 0%
	<br />
	1. Q# 자원별 테스트정보에서 해당 클래스가 검색되는지 확인, 메소드 목록 확인 <br />
	2. Q#에서는 단순 getter/setter를 수집하지 않으므로 단순 getter/setter 메소드는 테스트에서 제외  <br />
	3. Test script가 에러를 발생시킨 케이스를 성공으로 리턴하도록 작성하였는지 확인   <br />


	<pre>
		예) else에서 test failure 발생 안함 (부적합한 케이스) 
		if(!isError && jsonData[OMM] !== undefined){
		var i=jsonData[OMM]["outList"].length-1;
		var acctNbr=jsonData[OMM]["outList"][i]["acctNbr"];
		tests["acctNbr"]=acctNbr===environment.acctNbr;
	}

	예) 변경 예제 
	if(!isError && jsonData[OMM] !== undefined){
		var i=jsonData[OMM]["outList"].length-1;
		var acctNbr=jsonData[OMM]["outList"][i]["acctNbr"];
		tests["acctNbr"]=acctNbr===environment.acctNbr;
	}
	else{
		tests["fail"] == false;
	}
	</pre>

</div>


<div class="alert alert-danger" role="alert">
	ERROR : request not found  <br />
	collection 파싱 오류가 발생
	<br />
	1. collection 버전이 V1인지 확인  <br />
	2. collection-folder-request 구조를 따르는지 확인  <br />
	3. request에 서비스코드가 있는지 확인, 서비스코드가 10자리인지 확인  <br />


</div>



<div class="alert alert-danger" role="alert">
	ERROR : No test script found  <br />
	테스트 스크립트가 작성이 안됨
	<br />
	1. 모든 에러 상황에서 tests를 fail로 발생하도록 스크립트 작성  <br />



</div>











</main>
</div>
</div>














</body>
</html>
