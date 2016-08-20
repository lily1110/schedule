/*
* creat_depart_placard.js
*/


//创建发送需要的数组
var jsonSendMsg = {};
//创建ALL科室的hash数组
var jsonAllKeShi = {};
//创建DepartId的hash数组
var jsonDepartIds = {};
//创建UserId的hash数组
var jsonUserIds = {};
//创建GroupID的hash数组
var jsonGroupIds = {};
//创建SingleGroupID的hash数组
var jsonSingleGroupIds = {};
//创建tos数组
var tos = [];

//创建Contents的数组
var jsonContents = {};

var wenDangFile;
//添加的上传的文档
var wenDang = [];
var wenDangFs = [];

//添加图片的urls
var addImg_urls = [];
//上传后的urls
var image_urls = [];

//全选可数的总人数
var allKeshiPersons;
//选择的同事人数
var collPersons;
//选择分组的人数
var groupPersons;
//选择的总人数
var zongPersons;


//上传图片进度的百分比数
var baifenbi1 = 0;
//上传附件进度的百分比数
var baifenbi2 = 0;


var everyAllMembers = [];


var singlePersonArr = [];
var singleGroupArr = [];
var singleAllMembers = [];

//当页面加载进来的时候运行以下函数
$(function() {

	/*--- 创建的总数组 ---*/
	jsonSendMsg = {
		"from" : DoctorId,
		"to" : tos,  //接收者ID的集合
		"type" : 'DEPARTMENT',
		"flag" : true
	};
	

	//选择科室 全选按钮
	$('#allKeShi').unbind('click').on('click', allKeShiChk);
	//科室列表的每个按钮
	$(document).unbind('click').on('click', 'input[name="keshiName"]', cksBox);
	//part3的返回按钮
	$(document).on('click', '.form_part3 .back', form_part3_back);
	//每个科室的按钮
	$(document).on('click', '.go_part3', showEveryDepart);
	
	//part2确定按钮
	$('.form_part2 .top_info .ok').on('click', ok2Btn);
	//多科室part3确定按钮
	$('.everyDepart .top_info .ok').on('click', ok3BtnEvery);
	//单科室part3确定按钮
	$('.singleDepart .top_info .ok').on('click', ok3BtnSingle);
	
	//同事列表的按钮
	//$(document).on('click', '.form_part3 .select_con2 ul li label', showEveryDepart);
	
	//内容输入框
	$('.placard_nr').on('keyup', placardNrZs);
	
	//#up_img的onchange事件
	$('#up_img').on('change', addImgs);
	//#up_file的onchange事件
	$('#up_file').on('change', addFiles);
	
	//选择的总人数
	//zongPersons();
	
	//判断是否有科室分组
	ifDepart();
	
	
	
	//Ajax请求POST 发起通知
	$('.form_part1 .top_info .ok').on('click', sendMsgs);
	//Ajax请求GET 获取选择单科室同事
	selectSingleColleague();
	//Ajax请求GET 获取选择单科室分组
	getSingleGroup();
	
	
	
	//删除图片
	$(document).off('click', '.fill_form dl.imgList dd i').on('click', '.fill_form dl.imgList dd i', delectitImg);
	//删除附件
	$(document).off('click', '.fill_form dl.flieList dd i').on('click', '.fill_form dl.flieList dd i', delectitFile);
	
	showBfb1();
	showBfb2();
	
	$(document).on('click', 'input[type="checkbox"][name="singleGroup"]', singleGroupInputClick);
	$(document).on('click', 'input[type="checkbox"][data-single="singlePerson"]', singlePersonInputClick);
	
});

function web(){
	$.ajax({
		type : 'get',
		url : 'depart_placard/creat_depart_placard.html',
		cache:false,
		success : function(response, status, xhr){
			$('.page_contain').html(response);
		}
	})
}

//限制内容输入框TEXTAREA的字数
function placardNrZs(){
	
	var regC = /[^ -~]+/g;
	var regE = /\D+/g;
	var str = $(this).val();
	if (regC.test(str)){
		$(this).val($(this).val().substr(0,5000));
	}

	if(regE.test(str)){
		$(this).val($(this).val().substr(0,10000));
	}

}


//part2确定按钮事件
function ok2Btn(){	
	
	var input_keshiName = $('[name="keshiName"]');
	for (var i in input_keshiName) {
		jsonDepartIds[input_keshiName[i].value]=input_keshiName[i].checked
	}
	tos=[];
	for(var depaertId in jsonDepartIds){
		if (jsonDepartIds[depaertId])
		tos.push(depaertId);
	}
	
	
	var input_allKeShi = $('#allKeShi');
	for (var i in input_allKeShi) {
		jsonDepartIds[input_allKeShi[i].value]=input_allKeShi[i].checked
	}
	for(var allKeShiId in jsonAllKeShi){
		if (jsonAllKeShi[allKeShiId])
		tos.push(allKeShiId);
	}
	
	
	var input_person = $('[name="person"]');
	for (var i in input_person) {
		jsonUserIds[input_person[i].value]=input_person[i].checked
	}
	for(var id in jsonUserIds){
		if (jsonUserIds[id])
		tos.push(id);
	}
	//alert(tos);
	
	var everyAllMember = everyAllMembers;
	var result = [], hash = {};
    for (var i = 0, elem; (elem = everyAllMember[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }

	if(result.length>0){
		$('.select_colleague_btn span.selected').html('已选择<b class="num">'+result.length+'</b>个科室的同事');
	}else{
		$('.select_colleague_btn span.selected').html('未选择同事');
	}
}

//科室列表的每个按钮事件
/*
科室的checkbox选中的时候，不可以跳转，该科室的<font class="change">已选中</font>
科室的checkbox取消的时候，可以跳转，该科室的<font class="change">有</font>
*/
function cksBox(){
	var $oCkbox = $(this);
	var cked = $oCkbox.is(':checked');
	var depart_id = $oCkbox.parent().attr('role');

	if(cked){
		$oCkbox.parent().next().prop('for','');
		$oCkbox.parent().next().children().next().children().next().children('font[class="change"]').text('已选中');
		everyAllMembers.push(depart_id);
	}else{
		$oCkbox.parent().next().prop('for','form_part2');
		$oCkbox.parent().next().children().next().children().next().children('font[class="change"]').text('有');
		if(everyAllMembers.length>0){
			for(var i=0; i<everyAllMembers.length; i++){
				if(everyAllMembers[i] == depart_id){
					everyAllMembers.splice([i],1);
				}
			}
		}
	}
}


//多科室part3确定按钮事件
function ok3BtnEvery(){
	var depart_id = $(this).parent().parent().attr('id');
	var ckbox = $('.select_con.every_con input[type="checkbox"]').is(':checked');
	var m = 0;
	if(ckbox){
		//everyAllMembers[m] = depart_id;
		//m++
		everyAllMembers.push(depart_id);
	}else{
		if(everyAllMembers.length>0){
			for(var i=0; i<everyAllMembers.length; i++){
				if(everyAllMembers[i] == depart_id){
					everyAllMembers.splice([i],1);
				}
			}
		}
	}
}




//part3的返回按钮事件
function form_part3_back(){
	var input_person = $('.select_con2 input[name="person"]');
	for (var i in input_person) {
		
		if($.inArray(input_person[i].value, tos) == 3){
			//alert(input_person[i].value);
		};
		
	}
	
}


//选择科室 全选按钮事件
function allKeShiChk() {
	var $aksc = $(this);
	var akscked = $aksc.is(':checked');
	var departLis = $('#departList').children().children();
	
	departLis.each(function(i) {
		if(akscked){
			$(this).children('label.cks').children('input[type="checkbox"]').prop('checked',true);
			$(this).children('label').children('div').children('i').children('font[class="change"]').text('已选中');
			everyAllMembers.push($(this).children('label.cks').attr('role'));
		}else{
			$(this).children('label.cks').children('input[type="checkbox"]').prop('checked',false);
			$(this).children('label').children('div').children('i').children('font[class="change"]').text('有');
			everyAllMembers.pop();
		}
    });
}







/******************************/
/*       同事列表函数
/******************************/
//当选中确定又进入时候，原先选中的还是为选中
function selectCheck(tsId,flag){
	if (flag)
		return '<input type="checkbox" name="person" id="'+ tsId +'" value="'+ tsId +'" checked/>'
	return '<input type="checkbox" name="person" id="'+ tsId +'" value="'+ tsId +'">';
}



//每个科室的按钮事件
function showEveryDepart(){
	
	var departId = $(this).attr("role");
	//alert(departId);
	
	/*当点击之后.everyDepart的ID替换成.go_part3的role*/
	$('.everyDepart').attr('id',departId);
	
	var departName = $(this).children().next().children().html();
	$('.everyDepart .top_info span').text('选择<'+departName+'>接收的同事');
	
	/******************************/
	/*      获取选择多科室同事
	/******************************/
	$.ajax({
		type : 'GET',
		url : wlanip + '/rest/ios/doctors/v1/' + departId + '/0',
		cache : false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success : function(data){
			if (data.responseMsg == '1') {
				
				if(departId){
					
					var users = data.users;
					var tsUl = $(".everyDepart>.every_con>.colleagues>ul")
					tsUl.html('');
					//将多科室的同事列表循环出来
					for(var i in users){
						var b_toux;
						if(users[i].icon){
							b_toux = '<b class="toux"><i><img src="'+ users[i].icon +'"></i></b>';
						}else{
							if(users[i].name.length>3){
								b_toux = '<b class="toux"><i>'+users[i].name.substring(3)+'</i></b>';
							}else{
								b_toux = '<b class="toux"><i>'+users[i].name+'</i></b>';
							}
						}
						
						var tsId = users[i].id;
						var tsLi = $('<li role="'+ tsId +'">' +
							'<label for="'+ tsId +'">'+
							//当变量tsId和jsonUserIds[tsId]为true的时候，调用selectCheck函数
							selectCheck(tsId,jsonUserIds[tsId] == true)+
							'<span>'+ b_toux + users[i].name +'<b class="selects"><i></i></b></span>'+
							'</label>'+
							'</li>');
						tsLi.appendTo(tsUl);
					}
				}
			}else{
				alert('失败');
			}
		},
		error : function(xhr, errorText, errorType){
			alert('获取选择多科室同事的status是'+xhr.status + '，' + 'statusText是' + xhr.statusText);
		}
	});
	
	
	/******************************/
	/*      获取选择多科室分组
	/******************************/
	$.ajax({
		type : 'GET',
		url : wlanip + '/rest/pc/group/v1/' + departId,
		cache : false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success : function(data){
			if (data.responseMsg == '1') {
				//console.log('获取选择多科室分组'+data.groups);
				if(departId){
					
					var groups = data.groups;
					if($(".everyDepart>.every_con>.collGroup>ul li:first-child").attr('role') == groups[0].id){
						//alert('已经存在了');
						return;
					}else{
						var gUl = $(".everyDepart>.every_con>.collGroup>ul")
						gUl.html('');
						//将多科室的分组列表循环出来
						for(var i in groups){
							var gId = groups[i].id;
							var gLi = $('<li role="'+ gId +'">' +
								'<label for="g_'+ gId +'">'+
								'<input type="checkbox" name="keshiGroup" id="g_'+ gId +'" value="'+ gId +'">'+
								'<span>'+ groups[i].name +'<b class="number">(有<font>'+ groups[i].number +'</font>人)</b><b class="selects"><i></i></b></span>'+
								'</label>'+
								'</li>');
							gLi.appendTo(gUl);
						}
					}

				}
			}else{
				alert('失败');
			}
		},
		error : function(xhr, errorText, errorType){
			alert('获取分组的status是'+xhr.status + '，' + 'statusText是' + xhr.statusText);
		}
	});
}

/******************************/
/*      获取选择单科室同事
/******************************/
function selectSingleColleague(){
	$.ajax({
		type : 'GET',
		url : wlanip + '/rest/pc/doctors/' + DoctorId,
		cache : false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
			//alert('wlanip是'+wlanip);
		},
		success : function(data){
			if (data.responseMsg == '1') {
				var users = data.users;
				var type = data.type;
				var departs = data.departs;
				
				//如果是单科室
				if(type == 1){
										
					//form_part2科室列表为隐藏
					$('.form_part2').addClass('display_none');
					//form_part3同事列表的for变为返回form_part1
					$('.form_part3 .top_info label').prop('for','form_part1');
					//form_part3多科室的同事列表为隐藏
					$('.form_part3.everyDepart').addClass('display_none');
					//form_part3单科室的同事列表为显现
					$('.form_part3.singleDepart').removeClass('display_none');
					
					//将单科室的同事列表循环出来
					for(var i in users){
						var b_toux;
						if(users[i].icon){
							b_toux = '<b class="toux"><i><img src="'+ users[i].icon +'"></i></b>';
						}else{
							if(users[i].name.length>3){
								b_toux = '<b class="toux"><i>'+users[i].name.substring(3)+'</i></b>';
							}else{
								b_toux = '<b class="toux"><i>'+users[i].name+'</i></b>';
							}
						}
						$('<li>' +
						'<label for="'+ users[i].id +'">'+
						'<input data-single="singlePerson" type="checkbox" name="person" id="'+ users[i].id +'" value="'+ users[i].id +'" role="'+users[i].name+'">'+
						'<span>'+ b_toux + users[i].name +'<b class="selects"><i></i></b></span>'+
						'</label>'+
						'</li>').appendTo($(".singleDepart>.select_con>.colleagues>ul"));
					}
					singleAllMembers[1] = singlePersonArr;
					
				
				//如果是多科室
				}else{
					//form_part2科室列表为显示
					$('.form_part2').removeClass('display_none');
					//form_part3同事列表的for变为返回form_part2
					$('.form_part3 .top_info label').prop('for','form_part2');
					//form_part3多科室的同事列表为显现
					$('.form_part3.everyDepart').removeClass('display_none');
					//form_part3单科室的同事列表为隐藏
					$('.form_part3.singleDepart').addClass('display_none');
					
					//循环
					for(var i=0; i<departs.length; i++){
						//将科室列表循环出来
						$('<li>' +
						'<label class="cks" role="'+ departs[i].id +'"><input type="checkbox" name="keshiName" value="ALL_'+ departs[i].id +'"><b class="selects"><i></i></b></label>'+
						'<label class="go_part3" for="form_part2" role="'+ departs[i].id +'">'+
							'<b class="jiantou">&#62;</b>'+
							'<div class="depart_info">'+
								'<span>'+ departs[i].name +'</span>'+
								'<i><font class="change">有</font><font class="num">'+ departs[i].number +'</font>个同事</i>'+
							'</div>'+
						'</label>'+
						'</li>').appendTo($("#departList>ul"));
					}
				}
				
			}else{
				alert('失败');
			}
		},
		error : function(xhr, errorText, errorType){
			alert('获取选择单科室同事的status是'+xhr.status + '，' + 'statusText是' + xhr.statusText);
		}
	});
}


/******************************/
/*      获取单科室分组
/******************************/
function getSingleGroup(){
	$.ajax({
		type : 'GET',
		url : wlanip + '/rest/pc/group/v1/' + departId,
		cache : false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success : function(data){
			if (data.responseMsg == '1') {
				var groups = data.groups;

				var gUl = $(".singleDepart>.single_con>.collGroup>ul")
				gUl.html('');
				//将单科室的分组列表循环出来
				for(var i in groups){
					var gId = groups[i].id;
					var gLi = $('<li role="'+ gId +'">' +
						'<label for="sg_'+ gId +'">'+
						'<input type="checkbox" name="singleGroup" id="sg_'+ gId +'" value="'+ gId +'" role="'+groups[i].name+'">'+
						'<span>'+ groups[i].name +'<b class="number">(有<font>'+ groups[i].number +'</font>人)</b><b class="selects"><i></i></b></span>'+
						'</label>'+
						'</li>');
					gLi.appendTo(gUl);
				}
				singleAllMembers[0] = singleGroupArr;
			}else{
				alert('失败');
			}
		},
		error : function(xhr, errorText, errorType){
			alert('获取分组的status是'+xhr.status + '，' + 'statusText是' + xhr.statusText);
		}
	});
}

//单科室选人个数
function singlePersonInputClick(){
	var ckbox = $(this);
	var ckboxRole = ckbox.attr('role');
	if(ckbox.is(':checked')){
		singlePersonArr.push(ckboxRole);
	}else{
		if(singlePersonArr.length>0){
			for(var i=0; i<singlePersonArr.length; i++){
				if(singlePersonArr[i] == ckboxRole){
					singlePersonArr.splice([i],1);
				}
			}
		}
	}
	singleAllMembers[1] = singlePersonArr;
}
//单科室选组个数
function singleGroupInputClick(){
	var ckbox = $(this);
	var ckboxRole = ckbox.attr('role');
	if(ckbox.is(':checked')){
		singleGroupArr.push(ckboxRole);
	}else{
		if(singleGroupArr.length>0){
			for(var i=0; i<singleGroupArr.length; i++){
				if(singleGroupArr[i] == ckboxRole){
					singleGroupArr.splice([i],1);
				}
			}
		}
	}
	singleAllMembers[0] = singleGroupArr;
}

//单科室part3确定按钮事件
function ok3BtnSingle(){
	console.log(singleAllMembers);
	var groupName = singleAllMembers[0][0];
	var groupNameLen = singleAllMembers[0].length;
	
	var personName = singleAllMembers[1][0];
	var personNameLen = singleAllMembers[1].length;
	
	if(singleAllMembers[0].length > 0 && singleAllMembers[1].length > 0){
		$('.select_colleague_btn span.selected').html('已选择<b>'+groupName+'</b>等<b class="num">'+groupNameLen+'</b>个分组及<b>'+personName+'</b>等<b class="num">'+personNameLen+'</b>位同事');
	}else if(singleAllMembers[0].length>0 && singleAllMembers[1].length == 0){
		$('.select_colleague_btn span.selected').html('已选择<b>'+groupName+'</b>等<b class="num">'+groupNameLen+'</b>个分组');
	}else if(singleAllMembers[0].length == 0 && singleAllMembers[1].length>0){
		$('.select_colleague_btn span.selected').html('已选择<b>'+personName+'等<b class="num">'+personNameLen+'</b>位同事');
	}else{
		$('.select_colleague_btn span.selected').html('未选择同事');
	}
}


//判断是否有科室分组
/*
如果有科室分组，则显示
如果没有科室分组，则不显示(跳过)
*/
function ifDepart(){
	if($('.form_part2').hasClass('display_none')){
		$('.form_part3 .top_info label').prop('for','form_part1');
	}else{
		$('.form_part3 .top_info label').prop('for','form_part2');
	}
}




function toFixed2 (num) {
    return parseFloat(+num.toFixed(2));
}
/******************************/
/*         添加图片
/******************************/
//#up_img的onchange事件
function addImgs(){
	var vals = $(this).val();
	var errMsg = "上传的图片必须为gif,jpeg,jpg,png中的一种";
	if(!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(vals)){
		$('#alertTs').prop('checked','checked');
		$('.alertTs').text(errMsg);
		return;
	}
	
	var $file = $(this);
	var fileObj = $file[0];
	var windowURL = window.URL || window.webkitURL;
	var dataURL;
	if(fileObj && fileObj.files && fileObj.files[0]){
		dataURL = windowURL.createObjectURL(fileObj.files[0]);
	}else{
		dataURL = $file.val();
		var imgObj = $(this);
		imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
		imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;
	}
	// files 是一个 FileList 对象
	var files = fileObj.files;

	//定义变量maxsize为1M
	var maxsize = 5*1024;//1M
	
	//获取初始图片的大小
	var sourceSize = toFixed2(this.files[0].size / 1024);
	
	if(sourceSize>maxsize){
		alert('对不起，图片大小不能超过5M');
		return;
	}else{
		var dd = $('<dd><i></i><img src="'+ dataURL +'" alt="'+vals+'"></dd>');
		if($('.imgList').children().length >= 6){
			$('#alertTs').prop('checked','checked');
			$('.alertTs').text('最多只能添加6张');
			$('#up_img').prop('disabled','disabled');
			$('label[for="up_img"][class="upload"]').css('opacity','0.5');
		}else{
			$('.imgList').append(dd);
			
			//如果是火狐浏览器
			if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){
				//定义变量dds为flieList的子元素dd
				var dds = $('.imgList').children('dd');
				//定义ddArr数组
				var ddArr = [];
				//遍历dds
				dds.each(function(i) {
					//定义变量fHtml为这个dd的子元素font的html
					var imgAlt = $(this).children('img').attr('alt');
					//将变量fHtml推到数组里
					ddArr.push(imgAlt);
				});
				//将wenDangFile推到数组wenDangFs里
				addImg_urls.push(files.item(0));
				//定义变量nary数组ddArr排序
				var nary = ddArr.sort();
				//循环数组ddArr
				for(var i=0;i<ddArr.length;i++){
					//如果排序数组的第i个等于排序数组里的第i+1个
					if (nary[i]==nary[i+1]){
						//flieList的最后一个子元素移除
						$('.imgList').children('dd:last').remove();
						//删除数组ddArr里的最后一个数据
						ddArr.pop();
						//删除数组wenDangFs里的最后一个wenDangFile
						addImg_urls.pop();
					}
				}
			//否则是其他浏览器
			}else{
				//将wenDangFile推到数组wenDangFs里
				addImg_urls.push(files.item(0));
			}
		}
	}
}
/******************************/
/*         删除图片
/******************************/
function delectitImg(){
	addImg_urls.pop();
	$(this).parent('dd').remove();
	$('#up_img').prop('disabled','');
	$('label[for="up_img"][class="upload"]').css('opacity','1');
}
/******************************/
/*         上传图片
/******************************/
function uploadImg() {
	var cc = {};
	cc.dir ="/xkmPic";
	for(var j=0;j<addImg_urls.length;j++){
		cc.file = addImg_urls[j];
		uploadSingleImg(cc,j,addImg_urls.length);
	}
}
function ajax11(url,data,complete){
	var request = new XMLHttpRequest();
	request.open('POST', url,false);
	request.setRequestHeader('Authorization', tokenUrl);
	request.setRequestHeader('UserAgent', 'ALIMEDIASDK_JSSDK');
	request.onload = function(e) {
		complete(request);
	};
	request.send(data);
}
function uploadSingleImg(config,i,total) {
	var formData = new FormData();
	formData.append('dir', config.dir);
	formData.append('name', config.file.name);
	formData.append('size', config.file.size);
	formData.append('content', config.file);
	var url = "https://upload.media.aliyun.com/api/proxy/upload";

	ajax11(url, formData, function (e) {
		var status = e.status,
			message = e.statusText || "";
		if (status == 200 && message == "OK") {
			var imgurl = JSON.parse(e.responseText);
			image_urls.push(imgurl.url);
			var size = i/total*100;
			if (i == total -1)
				size = 100;
			baifenbi1 = size;
			showBfb1();
		} else {
			console.log(e.responseText);
		}
	});
}
//显示上传图片百分比
function showBfb1(){
	$('#progressbar1 b').css('width', baifenbi1+'%');
}


/******************************/
/*         添加附件
/******************************/
function addFiles(){
	
	str = $(this).val();
	arr = str.split('\\');
	var errMsg = "对不起，不能上传图片";
	if(/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(str)){
		$('#alertTs').prop('checked','checked');
		$('.alertTs').text(errMsg);
		//alert(errMsg);
		return;
	}

	var fileObj = $(this)[0];

	
	// files 是一个 FileList 对象
	var files = fileObj.files;

	
	
	wenDangFile = files;
	
	//附件名称
	var fileName = arr[arr.length-1];
	//console.log(fileName);
	
	//附件后缀名
	fileK = str.substr(str.indexOf('.'));
	
	//定义变量maxsize为10M
	var maxsize = 10*1024;//10M
	//获取附件的大小KB的数值
	//var sourceSizeKB = toFixed2(this.files[0].size / 1024);
	//获取附件的大小MB的数值
	//var sourceSizeMB = toFixed2(this.files[0].size / 1024 / 1024);
	var sourceSize = toFixed2(this.files[0].size / 1024);
	//if(sourceSizeKB>1024){sourceSize = sourceSizeMB+'MB'}else{sourceSize = sourceSizeKB+'KB'}
	
	if(sourceSize>maxsize){
		$('#alertTs').prop('checked','checked');
		$('.alertTs').text('上传的单个附件大小不能超过10M！！！');
		return;
	}else{
		var dd = $('<dd><i></i><span><img src="../imgs/icons/icon'+ fileK +'.png"></span><font>'+ fileName +'</font></dd>');
		if($('.flieList').children().length >= 3){
			$('#alertTs').prop('checked','checked');
			$('.alertTs').text('最多只能添加3个附件');
			$('#up_file').prop('disabled','disabled');
			$('label[for="up_file"][class="upload"]').css('opacity','0.5');
		}else{
			$('.flieList').append(dd);
			//如果是火狐浏览器
			if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){
				//定义变量dds为flieList的子元素dd
				var dds = $('.flieList').children('dd');
				//定义ddArr数组
				var ddArr = [];
				//遍历dds
				dds.each(function(i) {
					//定义变量fHtml为这个dd的子元素font的html
					var fHtml = $(this).children('font').html();
					//将变量fHtml推到数组里
					ddArr.push(fHtml);
				});
				//将wenDangFile推到数组wenDangFs里
				wenDangFs.push(wenDangFile.item(0));
				//定义变量nary数组ddArr排序
				var nary = ddArr.sort();
				//循环数组ddArr
				for(var i=0;i<ddArr.length;i++){
					//如果排序数组的第i个等于排序数组里的第i+1个
					if (nary[i]==nary[i+1]){
						//flieList的最后一个子元素移除
						$('.flieList').children('dd:last').remove();
						//删除数组ddArr里的最后一个数据
						ddArr.pop();
						//删除数组wenDangFs里的最后一个wenDangFile
						wenDangFs.pop();
					}
				}
			//否则是其他浏览器
			}else{
				//将wenDangFile推到数组wenDangFs里
				wenDangFs.push(wenDangFile.item(0));
			}
			
		}
	}
}
/*function IsInArray(arr,val){
    var testStr=','+arr.join(",")+",";
    return testStr.indexOf(","+val+",")!=-1;
}*/
/******************************/
/*         删除附件
/******************************/
function delectitFile(){
	wenDangFs.pop();
	//alert(wenDangFs);
	$(this).parent('dd').remove();
	$('#up_file').prop('disabled','');
	$('label[for="up_file"][class="upload"]').css('opacity','1');
}
/******************************/
/*         上传附件
/******************************/
function uploadFile() {
	var cc = {};
	cc.dir ="/xkmdoc";
	//alert(JSON.stringify(wenDangFs));
	//alert(wenDangFs);
	for(var j=0;j<wenDangFs.length;j++){
		cc.file = wenDangFs[j];
		uploadSingleFile(cc,j,wenDangFs.length);
	}
	
}
function ajax22(url,data,complete){
	var request = new XMLHttpRequest();
	request.open('POST', url,false);
	request.setRequestHeader('Authorization', tokenFile);
	request.setRequestHeader('UserAgent', 'ALIMEDIASDK_JSSDK');
	request.onload = function(e) {
		complete(request);
	};
	request.send(data);
}
function uploadSingleFile(config,i,total) {
	var formData = new FormData();
	var today = new Date();
	var oTimes = today.getTime();
	formData.append('dir', config.dir);
	formData.append('name', oTimes+config.file.name);
	formData.append('size', config.file.size);
	formData.append('content', config.file);
	var url = "https://upload.media.aliyun.com/api/proxy/upload";

	ajax22(url, formData, function (e) {
		var status = e.status,
			message = e.statusText || "";
		if (status == 200 && message == "OK") {
			var upFiles = JSON.parse(e.responseText);
			//alert(e.responseText);
			var addFile = {};
			addFile.url = upFiles.url;
			addFile.name = upFiles.name.substring(13);
			
			var addFile_Size = config.file.size;
			var maxFileSize = 1024 * 1024;
			if(addFile_Size>maxFileSize){
				addFile.size = (addFile_Size / 1024 / 1024).toFixed(2)+ 'MB';
			}else{
				addFile.size = (addFile_Size / 1024).toFixed(2)+ 'KB';
			}
			
			//alert(addFile.name);
			wenDang.push(addFile);
			var size = i/total*100;
			if (i == total -1)
				size = 100;
			baifenbi2 = size;
			showBfb2();
		} else {
			console.log(e.responseText);
		}
	});
}
//显示上传附件百分比
function showBfb2(){
	$('#progressbar2 b').css('width', baifenbi2+'%');
}






















/******************************/
/*         发起通知
/******************************/
function sendMsgs(){

	//内容
	jsonContents.content = $('.placard_nr').val();
	//标题
	jsonContents.title = $('.placard_tit').val();
	
	tos=[];
	for(var item in jsonUserIds){
		if (jsonUserIds[item])
			tos.push(item);
	}
	for(var item in jsonDepartIds){
		if (jsonDepartIds[item])
			tos.push(item);
	}
	jsonSendMsg.to = tos
	
	if(jsonContents.title == ''){
		alert('请填写标题');
		return;
	}
	if(tos.length == '0'){
		alert('请选择同事');
		return;
	}
	
	image_urls = [];
	uploadImg();
	//alert('发起通知里的image_urls是'+JSON.stringify(image_urls));
	
	wenDang = [];
	uploadFile();
	//alert(JSON.stringify(wenDang));
	
	//图片的urls
	jsonContents.imageUrls = image_urls;
	//文档
	jsonContents.attachments = wenDang;
	jsonSendMsg.message = JSON.stringify(jsonContents);
	//console.log(JSON.stringify(jsonSendMsg.message));
	
	if(JSON.stringify(jsonContents.content) == '""' && JSON.stringify(jsonContents.attachments) == "[]" && JSON.stringify(jsonContents.imageUrls) == '[]'){
		alert('请填写内容');
		return;
	}else{
		$.ajax({
			type : 'POST',
			url : wlanip + '/rest/pc/notice/v1',
			cache : false,
			data: JSON.stringify(jsonSendMsg),
			dataType: 'json',
						contentType: 'application/json',
			beforeSend: function(xhr) {
				
				xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
			},
			success : function(data){
				if (data.responseMsg == '1') {
					alert('发送院科公告成功');
					web();
				}else{
					$('.page_loading').children('.text').html('发送失败');
				}
			},
			error : function(xhr, errorText, errorType){
				console.log('发起通知的status是'+xhr.status + '，' + 'statusText是' + xhr.statusText);
			}
		});
	}
}

