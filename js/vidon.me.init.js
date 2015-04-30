 /*
  * l10n.js
  * 2011-05-12
  *
  * By Eli Grey, http://eligrey.com
  * Licensed under the X11/MIT License
  *   See LICENSE.md
  */

 /*global XMLHttpRequest, setTimeout, document, navigator, ActiveXObject*/

 /*! @source http://purl.eligrey.com/github/l10n.js/blob/master/l10n.js*/

 "use strict";

 (function() {
     var
         undef_type = "undefined",
         string_type = "string",
         String_ctr = String,
         has_own_prop = Object.prototype.hasOwnProperty,
         load_queues = {},
         localizations = {},
         FALSE = !1
         // the official format is application/vnd.oftn.l10n+json, though l10n.js will also
         // accept application/x-l10n+json and application/l10n+json
         ,
         l10n_js_media_type = /^\s*application\/(?:vnd\.oftn\.|x-)?l10n\+json\s*(?:$|;)/i,
         XHR, $to_locale_string = "toLocaleString",
         $to_lowercase = "toLowerCase"

     , array_index_of = Array.prototype.indexOf || function(item) {
         var
             len = this.length,
             i = 0;

         for (; i < len; i++) {
             if (i in this && this[i] === item) {
                 return i;
             }
         }

         return -1;
     }, request_JSON = function(uri) {
         var req = new XHR();

         // sadly, this has to be blocking to allow for a graceful degrading API
         req.open("GET", uri, FALSE);
         req.send(null);

         if (req.status !== 200) {
             // warn about error without stopping execution
             setTimeout(function() {
                 // Error messages are not localized as not to cause an infinite loop
                 var l10n_err = new Error("Unable to load localization data: " + uri);
                 l10n_err.name = "Localization Error";
                 throw l10n_err;
             }, 0);

             return {};
         } else {
             return JSON.parse(req.responseText);
         }
     }, load = String_ctr[$to_locale_string] = function(data) {
         // don't handle function[$to_locale_string](indentationAmount:Number)
         if (arguments.length > 0 && typeof data !== "number") {
             if (typeof data === string_type) {
                 load(request_JSON(data));
             } else if (data === FALSE) {
                 // reset all localizations
                 localizations = {};
             } else {
                 // Extend current localizations instead of completely overwriting them
                 for (var locale in data) {
                     if (has_own_prop.call(data, locale)) {
                         var localization = data[locale];
                         locale = locale[$to_lowercase]();

                         if (!(locale in localizations) || localization === FALSE) {
                             // reset locale if not existing or reset flag is specified
                             localizations[locale] = {};
                         }

                         if (localization === FALSE) {
                             continue;
                         }

                         // URL specified
                         if (typeof localization === string_type) {
                             if (String_ctr.locale[$to_lowercase]().indexOf(locale) === 0) {
                                 localization = request_JSON(localization);
                             } else {
                                 // queue loading locale if not needed
                                 if (!(locale in load_queues)) {
                                     load_queues[locale] = [];
                                 }
                                 load_queues[locale].push(localization);
                                 continue;
                             }
                         }

                         for (var message in localization) {
                             if (has_own_prop.call(localization, message)) {
                                 localizations[locale][message] = localization[message];
                             }
                         }
                     }
                 }
             }
         }
         // Return what function[$to_locale_string]() normally returns
         return Function.prototype[$to_locale_string].apply(String_ctr, arguments);
     }, process_load_queue = function(locale) {
         var queue = load_queues[locale],
             i = 0,
             len = queue.length;

         for (; i < len; i++) {
             var localization = {};
             localization[locale] = request_JSON(queue[i]);
             load(localization);
         }

         delete load_queues[locale];
     };

     if (typeof XMLHttpRequest === undef_type && typeof ActiveXObject !== undef_type) {
         var AXO = ActiveXObject;

         XHR = function() {
             try {
                 return new AXO("Msxml2.XMLHTTP.6.0");
             } catch (xhrEx1) {}
             try {
                 return new AXO("Msxml2.XMLHTTP.3.0");
             } catch (xhrEx2) {}
             try {
                 return new AXO("Msxml2.XMLHTTP");
             } catch (xhrEx3) {}

             throw new Error("XMLHttpRequest not supported by this browser.");
         };
     } else {
         XHR = XMLHttpRequest;
     }
     vidonme.rpc.request({
         'context': this,
         'method': 'VidOnMe.GetSystemSetting',
         'params': {
             "key": "language.default"
         },
         'success': function(data) {
             String_ctr.locale = "en";
             if (data && data.result) {

                 if (data.result.val == "Chinese (Simple)") {
                     String_ctr.locale = "zh-cn";
                 } else if (data.result.val == "Chinese (Traditional)") {
                     String_ctr.locale = "zh-tw";
                 } else if (data.result.val == "German") {
                     String_ctr.locale = "de";
                 } else if (data.result.val == "French") {
                     String_ctr.locale = "fr";
                 } else if (data.result.val == "Japanese") {
                     String_ctr.locale = "ja";
                 } else if (data.result.val == "Portuguese (Brazil)") {
                     String_ctr.locale = "pt";
                 } else if (data.result.val == "Spanish" || data.result.val == "Spanish (Mexico)") {
                     String_ctr.locale = "es";
                 } else if (data.result.val == "Korean") {
                     String_ctr.locale = "ko";
                 } else if (data.result.val == "Swedish") {
                     String_ctr.locale = "se";
                 } else if (data.result.val == "English" || data.result.val == "") {
                     String_ctr.locale = "en";
                 }
             }

             if (typeof document !== undef_type) {
                 var
                     elts = document.getElementsByTagName("link"),
                     i = elts.length;

                 while (i--) {
                     var
                         elt = elts[i],
                         rel = (elt.getAttribute("rel") || "")[$to_lowercase]().split(/\s+/);

                     if (l10n_js_media_type.test(elt.type)) {
                         if (array_index_of.call(rel, "localizations") !== -1) {
                             // multiple localizations
                             load(elt.getAttribute("href"));
                         } else if (array_index_of.call(rel, "localization") !== -1) {
                             // single localization
                             var localization = {};
                             localization[(elt.getAttribute("hreflang") || "")[$to_lowercase]()] =
                                 elt.getAttribute("href");
                             load(localization);
                         }
                     }
                 }
             }

             vidonme.rpc.request({
                 'context': this,
                 'method': 'VidOnMe.GetSystemSetting',
                 'params': {
                     "key": "promotion.display"
                 },
                 'success': function(data) {
                     if (data && data.result.val == "true") {
                         $("#promotion_innblock").show();
                         $("#vidome_body").html('');
                         $('#promotioncontainer').append('<div class="promotion"><table class="promotionheader"><tr><td><img src="promotion/header_icon.png" /></td><td class="promotiontext" id="promotiontext"></td></tr></table></div><p class="promotionpadding"></p>'); // promotion header
                         $('#promotioncontainer').append('<table id="t1"><tr><td class="picserver"><img src="promotion/pic_server.png" /></td><td><table><tr><td><img style="margin:20px 40px 20px 70px" src="promotion/pic_player.png" /></td><td><img style="margin:20px 20px 20px 60px" src="promotion/pic_cloud.png" /></td></tr><tr id="t1_android"></tr><tr id="t1_ios"></tr></table></td></tr></table>'); // server picture & mobiles
                         var android = '<td><img id="Android_player" style="margin:20px 35px 10px 65px; cursor:pointer" src="promotion/android_btn_normal.png" onmousemove="mousehover(\'Android_player\')" onmouseout="mouseout(\'Android_player\')" onclick="openlink(\'Android_player\')"></td><td><img id="Android_cloud" style="margin:20px 30px 10px 55px; cursor:pointer" src="promotion/android_btn_normal.png" onmousemove="mousehover(\'Android_cloud\')" onmouseout="mouseout(\'Android_cloud\')" onclick="openlink(\'Android_cloud\')"></td>'
                         var ios = '<td><img id="iOS_player" style="margin:10px 35px 10px 65px; cursor:pointer" src="promotion/ios_btn_normal.png" onmousemove="mousehover(\'iOS_player\')" onmouseout="mouseout(\'iOS_player\')" onclick="openlink(\'iOS_player\')"></td><td><img id="iOS_cloud" style="margin:10px 30px 10px 55px; cursor:pointer" src="promotion/ios_btn_normal.png" onmousemove="mousehover(\'iOS_cloud\')" onmouseout="mouseout(\'iOS_cloud\')" onclick="openlink(\'iOS_cloud\')"></td>';
                         $('#t1_android').append(android);
                         $('#t1_ios').append(ios);

                         $('#promotioncontainer').append('<div class="promotionhdback"><table align="center"><tr><td><img class="promotionhdlogo" src="promotion/pic_playerhd.png" /></td><td><p id="promotionhdtext"></p><a style="color:#CC6600;" id="promotionhdlink" href="http://vidon.me/vidon_server.htm?s=pcserver"></a></td></tr></table></div>');

                         $('#promotioncontainer').append('<table align="center"><tr><td align="center"><input id="mgrbtnswitch" name="input_mgrbtnswitch" type="checkbox" onclick="ShowMgrBtn()" /><p class="promotionnote" id="promotionnote"></p><td></tr><tr><td align="center"><input id="mgrbtn" class="promotionbtn" name="input_mgrbtn" disabled="true" type="button" onclick="ShowMgrPage()" onmousemove="mousehover(\'mgrbtn\')" onmouseout="mouseout(\'mgrbtn\')" value="" /></td></tr></table>');

                         setTimeout("postfinish()", 50);
                     } else {
                         $("#promotion_innblock").hide();

                         var browserinfo = getBrowserInfo() + "";

                         var mediaLibrary = new MediaLibrary();
                         var settingService = new SettingService();
                         var appsDownload = new AppsDownload(String_ctr, browserinfo);
                         var backupMedia = new BackupMedia();
                         var userCenter = new UserCenter();
                         //nowPlayingManager = new NowPlayingManager();
                         if (!browserinfo.match("msie"))
                             var myScroll = new iScroll("vidome_body");
                         vidonme.core.applyDeviceFixes();
                     }
                 }
             });
         }

     });

     if (!String_ctr.locale) {
         /*
        if (typeof navigator !== undef_type) {
            var nav = navigator;
            String_ctr.locale = nav.language || nav.userLanguage || "";
        } else {
            String_ctr.locale = "";
        }
        */

         String_ctr.locale = "";


     }



     String_ctr.prototype[$to_locale_string] = function() {
         var
             parts = String_ctr.locale[$to_lowercase]().split("-"),
             i = parts.length,
             this_val = this.valueOf();

         // Iterate through locales starting at most-specific until localization is found
         do {
             var locale = parts.slice(0, i).join("-");
             // load locale if not loaded
             if (locale in load_queues) {
                 process_load_queue(locale);
             }
             if (locale in localizations && this_val in localizations[locale]) {
                 return localizations[locale][this_val];
             }
         }
         while (i--);

         return this_val;
     };
 }());