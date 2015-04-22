		//API is not REST
	function RequestIsNeedWizard(page) {
		    var s = vidonme.rpc.request({
		        'context': this,
		        'method': 'VidOnMe.IsWizzardEnabled',
		        'params': {},
		        'success': function(data) {
								cbIsNeedWizard(data,page);
			    	}
	    	});  	
		}
		
		
		function RequestGetLibraries(mediatype) {
		    var s = vidonme.rpc.request({
		        'context': this,
		        'method': 'VidOnMe.GetLibraries',
		        'params': {
		        		"type": mediatype
		        },
		        'success': function(data) {
								cbSetLibraryID(data,mediatype);
		        }
			  }); 
		}
		
		
		function RequestLibraryPaths(libid){
				//�����ж�
				//RequestGetLibraries("commercial");
				
				
				//Ҫ��Ϊ�лص���������ơ�������
				vidonme.rpc.request({
						'context': this,
						'method': 'VidOnMe.GetLibraryDetail',
						'params': {
							"LibraryId": libid
						},
						'success': function(data) {
								cbHandleLibraryPaths(data);
							}
				});
		}
		
   	function RequestAddLibraryPath(libid,mediapath){
  			//�����ж�
  			
  			//server����
        vidonme.rpc.request({
            'context': this,
            'method': 'VidOnMe.AddPathToLibrary',
            'params': {
                "LibraryId": libid,
                "path": mediapath
            },
            'success': function(data) {
            		return data.result.PathId;
            		//alert("AddPathToLibrary:" + data.result.ret);
            }
        });		
  	} 				
  
  	function RequestDeleteLibraryPath(libid,pid){
  			//�����ж�
  			//alert("libid=" + libid + ",pid=" + pid);
  			var pathid = Number(pid);
  			//server����
 				vidonme.rpc.request({
						'context': this,
						'method': 'VidOnMe.DeletePathFromLibrary',
						'params': {
							"LibraryId": libid,
							"PathId": pathid
						},
						'success': function(data) {
								if (data && data.result.ret == true) {
									return;
								} else {
									alert(data.result.err);
								}
							}
				}); 		
  	}
		
		function RequestAddNetDrive(path){
				
				vidonme.rpc.request({
						'context': this,
						'method': 'VidOnMe.AddNetDirectory',
						'params': {
							"directory": path
						},
						'success': function(data) {
								cbAddNetDrive(data,path);
						}
				});
		}

		function RequestDriveDirectory(realpath, drivepath) {
				
				drivepath 		= unescape(drivepath);
		    realpath 			= unescape(realpath);
		    realpath 			= removeslashAtEnd(realpath);
		    
		   //alert("realpath="+realpath+", drivepath="+drivepath);
		
		    vidonme.rpc.request({
		        'context': this,
		        'method': 'VidOnMe.GetDirectory',
		        'params': {
		            "mask": "/",
		            "directory": ""
		        },
		        'success': function(data) {
								cbHandleDiskList(data);
		        }
		    });
		    

		   	
		   	var lastjqXhr = vidonme.rpc.request({
		      'context': this,
		      'method': 'VidOnMe.GetDirectory',
		      'params': {
		          "mask": "/",
		          "directory": realpath
		      },
		      'success': function (data) {
							cbHandleFolderlist(data,realpath,drivepath);
		      }
		  	});
		  	
		  	return lastjqXhr;
		  
		}
		

