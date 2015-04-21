
		var g_CurLibId = 0;

//=================PageInterface============================
		function cbSetLibraryID(data,mediatype){
    		if (data && data.result && data.result.libraries && (data.result.libraries.length>0)) {	        				
            $.each($(data.result.libraries), jQuery.proxy(function(i, item){
            		//alert("i=" + i + ",libID=" + item.LibraryId + ",type=" + item.type + ",name=" + item.name);
 								if(item.type == mediatype){
 										g_CurLibId = item.LibraryId;
 										return;
 								}
    				},
    				this));
    		}
		}
		
			//Wizardҳ������·��
	function commitAddOneLibPath(){
		  var mediapath = $("#addSrcPath").val();
		  close_box('.addPath',2);
			$("#selectedPath").val(mediapath);
	}

//===============ServerInterface============================
    function isNeedWizard() {
		    var s = vidonme.rpc.request({
		        'context': this,
		        'method': 'VidOnMe.IsWizzardEnsabled',
		        'params': {},
		        'success': function(data) {
		        		//alert("isNeedWizard=" + data.result.ret);
//								if(data.result.ret != "true"){
//										location.assign("index.html");
//										window.location="index.html";
//										location.href="index.html";
//								};
			    	}
	    	});  	
		}

		function wizardsetting() {	
				var libID 			= g_CurLibId;
				var mediapath 	= $('#selectedPath').val();		
				//alert("libID=" + libID + ",path=" + mediapath);
				
				if (!libID || !mediapath) {
						alert("libID or Path is neccessary!");
						return;
				}          
        
        vidonme.rpc.request({
            'context': this,
            'method': 'VidOnMe.AddPathToLibrary',
            'params': {
                "LibraryId": libID,
                "path": mediapath
            },
            'success': function(data) {
            		//alert("AddPathToLibrary:" + data.result.ret);
            }
        });				

		    vidonme.rpc.request({
		        'context': this,
		        'method': 'VidOnMe.SetWizzardDisabled',
		        'params': {},
		        'success': function(data) {
		        		//alert("SetWizzardDisabled:" + data.result.ret);
			    	}
	    	});
		}
		
    function loadPage() {
    		isNeedWizard();
    }

    function FinishWizard() {
				wizardsetting();
				location.assign("movie.html");
				window.location="movie.html";
				location.href="movie.html";
    }

	$(function(){

		var  slideWidth=$(".slide").width();
		loadProperties();
		
		$("#commVideo").click(function(){
				RequestGetLibraries("commercial");
		})
		
		$("#perMedia").click(function(){
				RequestGetLibraries("personal");
		})	
					
		$(".setUp2btn").click(function(){
				$(".slides").animate({left:-slideWidth},500);
				$(".guideMenu li").eq(2).addClass("selected").siblings().removeClass("selected");
		})
			
		$(".setUp3btn").click(function(){
				if (!g_CurLibId) {
						RequestGetLibraries("commercial");
				}
				$("#selectedPath").val("");
				$(".slides").animate({left:-2*slideWidth},500);
				$(".guideMenu li").eq(4).addClass("selected").siblings().removeClass("selected");
		})
		
		$("#btnWzdOK").click(function(){
				FinishWizard();
		})		
				
		$("#selectedMedia a").click(function(){
				$(this).addClass("selected").siblings().removeClass("selected");
		})
				
		$(".addPathbtn").click(function(){
				showdiv(".addPath",2);
				ShowPageAddOnePath('','');				
		})	
					
		loadPage();
	})
	   
	function loadProperties(){
			jQuery.i18n.properties({//��������������Զ�Ӧ����Դ�ļ�
					name:'strings', //��Դ�ļ�����
					path:'i18n/', //��Դ�ļ�·��
					mode:'map', //��Map�ķ�ʽʹ����Դ�ļ��е�ֵ
					callback: function() {//���سɹ���������ʾ����
						//�û���
						$('#label_username').html($.i18n.prop('string_movie'));
					    //����
						$('#label_password').html($.i18n.prop('string_teleplay'));
					    //��¼
						$('#button_login').val($.i18n.prop('string_home_video'));
					}
			});
	}
