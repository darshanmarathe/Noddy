(function($) {
  var types = 'text search number email datetime datetime-local date '
        + 'month week time tel url color range'.split(' '),
      len = types.length;
  $.expr[':']['textall'] = function(elem) {
    var type = elem.getAttribute('type');
    for (var i = 0; i < len; i++) {
      if (type === types[i]) {
        return true;
      }
    }
    return false;
  };
})(jQuery);

//tagmanager
/* ===================================================
 * tagmanager.js v3.0.0
 * http://welldonethings.com/tags/manager
 * ===================================================
 * Copyright 2012 Max Favilli
 *
 * Licensed under the Mozilla Public License, Version 2.0 You may not use this work except in compliance with the License.
 *
 * http://www.mozilla.org/MPL/2.0/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

(function ($) {

  "use strict";

  if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    console.log = function () { };
  }

  $.fn.tagsManager = function (options, tagToManipulate) {
    var obj = this;
    var rndid = "";

    var tagManagerOptions = {
      prefilled: null,
      CapitalizeFirstLetter: false,
      preventSubmitOnEnter: true, // deprecated
      isClearInputOnEsc: true, // deprecated
      AjaxPush: null,
      AjaxPushAllTags: null,
      AjaxPushParameters: null,
      delimiters: [9, 13, 44], // tab, enter, comma
      backspace: [8],
      maxTags: 0,
      hiddenTagListName: null,  // deprecated
      hiddenTagListId: null,  // deprecated
      replace: true,
      output: null,
      deleteTagsOnBackspace: true, // deprecated
      tagsContainer: null,
      tagCloseIcon: 'x',
      tagClass: '',
      validator: null,
      onlyTagList: false
    };

    // exit when no matched elements
    if (!(0 in this)) {
      return this;
    }

    if (typeof options == 'string') {
      tagManagerOptions = obj.data("tm_options");
    } else {
      $.extend(tagManagerOptions, options);
      obj.data("tm_options", tagManagerOptions);
    }

    if (typeof options == 'string') {
      rndid = obj.data("tm_rndid");
    } else {
      var albet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      for (var i = 0; i < 5; i++)
        rndid += albet.charAt(Math.floor(Math.random() * albet.length));
      obj.data("tm_rndid", rndid);
    }

    if (tagManagerOptions.replace === true && tagManagerOptions.hiddenTagListName === null) {
      var original_name = obj.attr('name');
      tagManagerOptions.hiddenTagListName = original_name;
      obj.attr('name', "display-" + rndid);
    }
    if (tagManagerOptions.hiddenTagListName === null) {
      tagManagerOptions.hiddenTagListName = "hidden-" + rndid;
    }

    var delimiters = tagManagerOptions.delimeters || tagManagerOptions.delimiters; // 'delimeter' is deprecated
    // delimiter values to be handled as key codes
    var keyNums = [9, 13, 17, 18, 19, 37, 38, 39, 40];
    var delimiterChars = [], delimiterKeys = [];
    $.each(delimiters, function (i, v) {
      if ($.inArray(v, keyNums) != -1) {
        delimiterKeys.push(v);
      } else {
        delimiterChars.push(v);
      }
    });
    var baseDelimiter = String.fromCharCode(delimiterChars[0] || 44);
    var backspace = tagManagerOptions.backspace;
    var tagBaseClass = 'tm-tag';
    var inputBaseClass = 'tm-input';

    if ($.isFunction(tagManagerOptions.validator)) obj.data('validator', tagManagerOptions.validator);


    //var ajaxPolling = function (query, process) {
    //  if (typeof (tagManagerOptions.typeaheadAjaxSource) == "string") {
    //    $.ajax({
    //      cache: false,
    //      type: "POST",
    //      contentType: "application/json",
    //      dataType: "json",
    //      url: tagManagerOptions.typeaheadAjaxSource,
    //      data: JSON.stringify({ typeahead: query }),
    //      success: function (data) { onTypeaheadAjaxSuccess(data, false, process); }
    //    });
    //  }
    //};


    var tagClasses = function () {
      // 1) default class (tm-tag)
      var cl = tagBaseClass;
      // 2) interpolate from input class: tm-input-xxx --> tm-tag-xxx
      if (obj.attr('class')) {
        $.each(obj.attr('class').split(' '), function (index, value) {
          if (value.indexOf(inputBaseClass + '-') != -1) {
            cl += ' ' + tagBaseClass + value.substring(inputBaseClass.length);
          }
        });
      }
      // 3) tags from tagClass option
      cl += (tagManagerOptions.tagClass ? ' ' + tagManagerOptions.tagClass : '');
      return cl;
    };

    var trimTag = function (tag) {
      tag = $.trim(tag);
      // truncate at the first delimiter char
      var i = 0;
      for (i; i < tag.length; i++) {
        if ($.inArray(tag.charCodeAt(i), delimiterChars) != -1) break;
      }
      return tag.substring(0, i);
    };

    var showOrHide = function () {
      var tlis = obj.data("tlis");
      if (tagManagerOptions.maxTags > 0 && tlis.length < tagManagerOptions.maxTags) {
        obj.show();
        obj.trigger('tm:show');
      }
      if (tagManagerOptions.maxTags > 0 && tlis.length >= tagManagerOptions.maxTags) {
        obj.hide();
        obj.trigger('tm:hide');
      }
    };

    var popTag = function () {
      var tlis = obj.data("tlis");
      var tlid = obj.data("tlid");

      if (tlid.length > 0) {
        var tagId = tlid.pop();

        var tagBeingRemoved = tlis[tlis.length - 1];
        obj.trigger('tm:popping', tagBeingRemoved);
        tlis.pop();

        // console.log("TagIdToRemove: " + tagId);
        $("#" + rndid + "_" + tagId).remove();
        refreshHiddenTagList();
        obj.trigger('tm:popped', tagBeingRemoved);
        // console.log(tlis);
      }

      showOrHide();
      //if (tagManagerOptions.maxTags > 0 && tlis.length < tagManagerOptions.maxTags) {
      //  obj.show();
      //}
    };

    var empty = function () {
      var tlis = obj.data("tlis");
      var tlid = obj.data("tlid");

      while (tlid.length > 0) {
        var tagId = tlid.pop();
        tlis.pop();
        // console.log("TagIdToRemove: " + tagId);
        $("#" + rndid + "_" + tagId).remove();
        refreshHiddenTagList();
        // console.log(tlis);
      }
      obj.trigger('tm:emptied', null);

      showOrHide();
      //if (tagManagerOptions.maxTags > 0 && tlis.length < tagManagerOptions.maxTags) {
      //  obj.show();
      //}
    };

    var refreshHiddenTagList = function () {
      var tlis = obj.data("tlis");
      var lhiddenTagList = obj.data("lhiddenTagList");

      if (lhiddenTagList) {
        $(lhiddenTagList).val(tlis.join(baseDelimiter)).change();
      }

      obj.trigger('tm:refresh', tlis.join(baseDelimiter));
    };

    var spliceTag = function (tagId) {
      var tlis = obj.data("tlis");
      var tlid = obj.data("tlid");

      var p = $.inArray(tagId, tlid);

      // console.log("TagIdToRemove: " + tagId);
      // console.log("position: " + p);

      if (-1 != p) {
        var tagBeingRemoved = tlis[p];

        obj.trigger('tm:splicing', tagBeingRemoved);

        $("#" + rndid + "_" + tagId).remove();
        tlis.splice(p, 1);
        tlid.splice(p, 1);
        refreshHiddenTagList();

        obj.trigger('tm:spliced', tagBeingRemoved);

        // console.log(tlis);
      }


      showOrHide();
      //if (tagManagerOptions.maxTags > 0 && tlis.length < tagManagerOptions.maxTags) {
      //  obj.show();
      //}
    };

    var pushAllTags = function (e, tag) {
      if (tagManagerOptions.AjaxPushAllTags) {
        if (e.type != 'tm:pushed' || $.inArray(tag, tagManagerOptions.prefilled) == -1) {
          var tlis = obj.data("tlis");
          $.post(tagManagerOptions.AjaxPush, { tags: tlis.join(baseDelimiter) });
        }
      }
    };

    var pushTag = function (tag, ignore_events) {
      tag = trimTag(tag);

      if (!tag || tag.length <= 0) return;

      if (tagManagerOptions.CapitalizeFirstLetter && tag.length > 1) {
        tag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
      }

      // call the validator (if any) and do not let the tag pass if invalid
      if (obj.data('validator') && !obj.data('validator')(tag)) return;

      var tlis = obj.data("tlis");
      var tlid = obj.data("tlid");

      // dont accept new tags beyond the defined maximum
      if (tagManagerOptions.maxTags > 0 && tlis.length >= tagManagerOptions.maxTags) return;

      var alreadyInList = false;
      var tlisLowerCase = tlis.map(function (elem) { return elem.toLowerCase(); });
      var p = $.inArray(tag.toLowerCase(), tlisLowerCase);
      if (-1 != p) {
        // console.log("tag:" + tag + " !!already in list!!");
        alreadyInList = true;
      }

      if (alreadyInList) {
        var pTagId = tlid[p];
        $("#" + rndid + "_" + pTagId).stop()
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_1 }, 100)
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_2 }, 100)
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_1 }, 100)
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_2 }, 100)
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_1 }, 100)
          .animate({ backgroundColor: tagManagerOptions.blinkBGColor_2 }, 100);
      } else {
        if(!ignore_events)
          obj.trigger('tm:pushing', tag);

        var max = Math.max.apply(null, tlid);
        max = max == -Infinity ? 0 : max;

        var tagId = ++max;
        tlis.push(tag);
        tlid.push(tagId);

        if (!ignore_events)
          if (tagManagerOptions.AjaxPush != null) {
            if ($.inArray(tag, tagManagerOptions.prefilled) == -1) {
              $.post(tagManagerOptions.AjaxPush, $.extend({ tag: tag }, tagManagerOptions.AjaxPushParameters));
            }
          }

        // console.log("tagList: " + tlis);

        var newTagId = rndid + '_' + tagId;
        var newTagRemoveId = rndid + '_Remover_' + tagId;
        var escaped = $("<span></span>").text(tag).html();

        var html = '<span class="' + tagClasses() + '" id="' + newTagId + '">';
        html += '<span>' + escaped + '</span>';
        html += '<a href="#" class="tm-tag-remove" id="' + newTagRemoveId + '" TagIdToRemove="' + tagId + '">';
        html += tagManagerOptions.tagCloseIcon + '</a></span> ';
        var $el = $(html);

        if (tagManagerOptions.tagsContainer != null) {
          $(tagManagerOptions.tagsContainer).append($el);
        } else {
          if (tagId > 1) {
            var lastTagId = tagId - 1;
            var lastTagObj = $("#" + rndid + "_" + lastTagId);
            lastTagObj.after($el);
          } else {
            obj.before($el);
          }
        }

        $el.find("#" + newTagRemoveId).on("click", obj, function (e) {
          e.preventDefault();
          var TagIdToRemove = parseInt($(this).attr("TagIdToRemove"));
          spliceTag(TagIdToRemove, e.data);
        });

        refreshHiddenTagList();

        if (!ignore_events)
          obj.trigger('tm:pushed', tag);

        showOrHide();
        //if (tagManagerOptions.maxTags > 0 && tlis.length >= tagManagerOptions.maxTags) {
        //  obj.hide();
        //}
      }
      obj.val("");
    };

    var prefill = function (pta) {
      $.each(pta, function (key, val) {
        pushTag(val,true);
      });
    };

    var killEvent = function (e) {
      e.cancelBubble = true;
      e.returnValue = false;
      e.stopPropagation();
      e.preventDefault();
    };

    var keyInArray = function (e, ary) {
      return $.inArray(e.which, ary) != -1
    };

    var applyDelimiter = function (e) {
      pushTag(obj.val());
      e.preventDefault();
    };

    var returnValue = null;
    this.each(function () {

      if (typeof options == 'string') {
        switch (options) {
          case "empty":
            empty();
            break;
          case "popTag":
            popTag();
            break;
          case "pushTag":
            pushTag(tagToManipulate);
            break;
          case "tags":
            returnValue = { tags: obj.data("tlis") };
            break;
        }
        return;
      }

      // prevent double-initialization of TagManager
      if ($(this).data('tagManager')) { return false; }
      $(this).data('tagManager', true);

      // store instance-specific data in the DOM object
      var tlis = new Array();
      var tlid = new Array();
      obj.data("tlis", tlis); //list of string tags
      obj.data("tlid", tlid); //list of ID of the string tags

      if (tagManagerOptions.output == null) { 
        var hiddenObj = jQuery('<input/>', {
          type: 'hidden',
          name: tagManagerOptions.hiddenTagListName
        });
        obj.after(hiddenObj);
        obj.data("lhiddenTagList", hiddenObj);
      } else {
        obj.data("lhiddenTagList", jQuery(tagManagerOptions.output))
      }

      if (tagManagerOptions.AjaxPushAllTags) {
        obj.on('tm:spliced', pushAllTags);
        obj.on('tm:popped', pushAllTags);
        obj.on('tm:pushed', pushAllTags);
      }

      // hide popovers on focus and keypress events
      obj.on('focus keypress', function (e) {
        if ($(this).popover) {
          $(this).popover('hide');
        }
      });

      // handle ESC (keyup used for browser compatibility)
      if (tagManagerOptions.isClearInputOnEsc) {
        obj.on('keyup', function (e) {
          if (e.which == 27) {
            // console.log('esc detected');
            $(this).val('');
            killEvent(e);
          }
        });
      }

      obj.on('keypress', function (e) {
        // push ASCII-based delimiters
        if (keyInArray(e, delimiterChars)) {
          applyDelimiter(e);
        }
      });

      obj.on('keydown', function (e) {
        // disable ENTER
        if (e.which == 13) {
          if (tagManagerOptions.preventSubmitOnEnter) {
            killEvent(e);
          }
        }

        // push key-based delimiters (includes <enter> by default)
        if (keyInArray(e, delimiterKeys)) {
          applyDelimiter(e);
        }
      });

      // BACKSPACE (keydown used for browser compatibility)
      if (tagManagerOptions.deleteTagsOnBackspace) {
        obj.on('keydown', function (e) {
          if (keyInArray(e, backspace)) {
            // console.log("backspace detected");
            if ($(this).val().length <= 0) {
              popTag();
              killEvent(e);
            }
          }
        });
      }

      obj.change(function (e) {

        if (!/webkit/.test(navigator.userAgent.toLowerCase())) { $(this).focus(); } // why?

        /* unimplemented mode to push tag on blur
         else if (tagManagerOptions.pushTagOnBlur) {
         console.log('change: pushTagOnBlur ' + tag);
         pushTag($(this).val());
         } */
        killEvent(e);
      });

      if (tagManagerOptions.prefilled != null) {
        if (typeof (tagManagerOptions.prefilled) == "object") {
          prefill(tagManagerOptions.prefilled);
        } else if (typeof (tagManagerOptions.prefilled) == "string") {
          prefill(tagManagerOptions.prefilled.split(baseDelimiter));
        } else if (typeof (tagManagerOptions.prefilled) == "function") {
          prefill(tagManagerOptions.prefilled());
        }
      } else if (tagManagerOptions.output != null) {
        if (jQuery(tagManagerOptions.output) && jQuery(tagManagerOptions.output).val())
        var existing_tags = jQuery(tagManagerOptions.output)
        prefill(jQuery(tagManagerOptions.output).val().split(baseDelimiter));
      }
    });

    if (!returnValue)
      returnValue = this;

    return returnValue;
  }
})(jQuery);



/**
 * Copyright (C) 2010-2013 Graham Breach
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * jQuery.tagcanvas 2.2
 * For more information, please contact <graham@goat1000.com>
 */
(function(ad){var ap,ao,aa=Math.abs,w=Math.sin,l=Math.cos,I=Math.max,au=Math.min,V=Math.ceil,ai=Math.sqrt,X=Math.pow,L={},O={},R={0:"0,",1:"17,",2:"34,",3:"51,",4:"68,",5:"85,",6:"102,",7:"119,",8:"136,",9:"153,",a:"170,",A:"170,",b:"187,",B:"187,",c:"204,",C:"204,",d:"221,",D:"221,",e:"238,",E:"238,",f:"255,",F:"255,"},e,ae,d,a,af,z,o=document,H,c={};for(ap=0;ap<256;++ap){ao=ap.toString(16);if(ap<16){ao="0"+ao}O[ao]=O[ao.toUpperCase()]=ap.toString()+","}function ak(i){return typeof i!="undefined"}function v(i){return typeof i=="object"&&i!=null}function b(i,j,aw){return isNaN(i)?aw:au(aw,I(j,i))}function Y(){return false}function T(){return new Date().valueOf()}function n(aw,az){var j=[],ax=aw.length,ay;for(ay=0;ay<ax;++ay){j.push(aw[ay])}j.sort(az);return j}function ac(j){var ax=j.length-1,aw,ay;while(ax){ay=~~(Math.random()*ax);aw=j[ax];j[ax]=j[ay];j[ay]=aw;--ax}}function U(i,aw,j){this.x=i;this.y=aw;this.z=j}af=U.prototype;af.length=function(){return ai(this.x*this.x+this.y*this.y+this.z*this.z)};af.dot=function(i){return this.x*i.x+this.y*i.y+this.z*i.z};af.cross=function(j){var i=this.y*j.z-this.z*j.y,ax=this.z*j.x-this.x*j.z,aw=this.x*j.y-this.y*j.x;return new U(i,ax,aw)};af.angle=function(j){var i=this.dot(j),aw;if(i==0){return Math.PI/2}aw=i/(this.length()*j.length());if(aw>=1){return 0}if(aw<=-1){return Math.PI}return Math.acos(aw)};af.unit=function(){var i=this.length();return new U(this.x/i,this.y/i,this.z/i)};function K(aw,j){j=j*Math.PI/180;aw=aw*Math.PI/180;var i=w(aw)*l(j),ay=-w(j),ax=-l(aw)*l(j);return new U(i,ay,ax)}function k(i){this[1]={1:i[0],2:i[1],3:i[2]};this[2]={1:i[3],2:i[4],3:i[5]};this[3]={1:i[6],2:i[7],3:i[8]}}a=k.prototype;k.Identity=function(){return new k([1,0,0,0,1,0,0,0,1])};k.Rotation=function(ax,i){var j=w(ax),aw=l(ax),ay=1-aw;return new k([aw+X(i.x,2)*ay,i.x*i.y*ay-i.z*j,i.x*i.z*ay+i.y*j,i.y*i.x*ay+i.z*j,aw+X(i.y,2)*ay,i.y*i.z*ay-i.x*j,i.z*i.x*ay-i.y*j,i.z*i.y*ay+i.x*j,aw+X(i.z,2)*ay])};a.mul=function(aw){var ax=[],aA,az,ay=(aw.xform?1:0);for(aA=1;aA<=3;++aA){for(az=1;az<=3;++az){if(ay){ax.push(this[aA][1]*aw[1][az]+this[aA][2]*aw[2][az]+this[aA][3]*aw[3][az])}else{ax.push(this[aA][az]*aw)}}}return new k(ax)};a.xform=function(aw){var j={},i=aw.x,ay=aw.y,ax=aw.z;j.x=i*this[1][1]+ay*this[2][1]+ax*this[3][1];j.y=i*this[1][2]+ay*this[2][2]+ax*this[3][2];j.z=i*this[1][3]+ay*this[2][3]+ax*this[3][3];return j};function s(ax,az,aE,aB){var aA,aD,j,aC,aF=[],ay=Math.PI*(3-ai(5)),aw=2/ax;for(aA=0;aA<ax;++aA){aD=aA*aw-1+(aw/2);j=ai(1-aD*aD);aC=aA*ay;aF.push([l(aC)*j*az,aD*aE,w(aC)*j*aB])}return aF}function at(ay,aw,aB,aH,aF){var aG,aI=[],az=Math.PI*(3-ai(5)),ax=2/ay,aE,aD,aC,aA;for(aE=0;aE<ay;++aE){aD=aE*ax-1+(ax/2);aG=aE*az;aC=l(aG);aA=w(aG);aI.push(aw?[aD*aB,aC*aH,aA*aF]:[aC*aB,aD*aH,aA*aF])}return aI}function Q(aw,ax,aA,aG,aE,aC){var aF,aH=[],ay=Math.PI*2/ax,aD,aB,az;for(aD=0;aD<ax;++aD){aF=aD*ay;aB=l(aF);az=w(aF);aH.push(aw?[aC*aA,aB*aG,az*aE]:[aB*aA,aC*aG,az*aE])}return aH}function E(ax,i,j,aw){return at(ax,0,i,j,aw)}function W(ax,i,j,aw){return at(ax,1,i,j,aw)}function C(ay,i,j,aw,ax){ax=isNaN(ax)?0:ax*1;return Q(0,ay,i,j,aw,ax)}function N(ay,i,j,aw,ax){ax=isNaN(ax)?0:ax*1;return Q(1,ay,i,j,aw,ax)}function u(az,i){var ay=az,ax,aw,j=(i*1).toPrecision(3)+")";if(az[0]==="#"){if(!L[az]){if(az.length===4){L[az]="rgba("+R[az[1]]+R[az[2]]+R[az[3]]}else{L[az]="rgba("+O[az.substr(1,2)]+O[az.substr(3,2)]+O[az.substr(5,2)]}}ay=L[az]+j}else{if(az.substr(0,4)==="rgb("||az.substr(0,4)==="hsl("){ay=(az.replace("(","a(").replace(")",","+j))}else{if(az.substr(0,5)==="rgba("||az.substr(0,5)==="hsla("){ax=az.lastIndexOf(",")+1,aw=az.indexOf(")");i*=parseFloat(az.substring(ax,aw));ay=az.substr(0,ax)+i.toPrecision(3)+")"}}}return ay}function h(i,j){if(window.G_vmlCanvasManager){return null}var aw=o.createElement("canvas");aw.width=i;aw.height=j;return aw}function D(){var j=h(3,3),ax,aw;if(!j){return false}ax=j.getContext("2d");ax.strokeStyle="#000";ax.shadowColor="#fff";ax.shadowBlur=3;ax.globalAlpha=0;ax.strokeRect(2,2,2,2);ax.globalAlpha=1;aw=ax.getImageData(2,2,1,1);j=null;return(aw.data[0]>0)}function av(aD,j){var aw=1024,az=aD.weightGradient,ay,aB,ax,aC,aA;if(aD.gCanvas){aB=aD.gCanvas.getContext("2d")}else{aD.gCanvas=ay=h(aw,1);if(!ay){return null}aB=ay.getContext("2d");aC=aB.createLinearGradient(0,0,aw,0);for(ax in az){aC.addColorStop(1-ax,az[ax])}aB.fillStyle=aC;aB.fillRect(0,0,aw,1)}aA=aB.getImageData(~~((aw-1)*j),0,1,1).data;return"rgba("+aA[0]+","+aA[1]+","+aA[2]+","+(aA[3]/255)+")"}function B(aB,aA,ax,aH,aC,aD,aw,aE,aF){var az=(aD||0)+(aw&&aw[0]<0?aa(aw[0]):0),j=(aD||0)+(aw&&aw[1]<0?aa(aw[1]):0),ay,aG;aB.font=aA;aB.textBaseline="top";aB.fillStyle=ax;aC&&(aB.shadowColor=aC);aD&&(aB.shadowBlur=aD);aw&&(aB.shadowOffsetX=aw[0],aB.shadowOffsetY=aw[1]);for(ay=0;ay<aH.length;++ay){aG=aF?(aE-aF[ay])/2:0;aB.fillText(aH[ay],az+aG,j);j+=parseInt(aA)}}function q(aK,aB,aG,aI,aA,ax,aE,aF,j,aJ,aH,aD,aw){var ay=aI+aa(j[0])+aF+aF,i=aA+aa(j[1])+aF+aF,az,aC;az=h(ay+aJ,i+aH);if(!az){return null}aC=az.getContext("2d");B(aC,aB,ax,aK,aE,aF,j,aD,aw);return az}function an(aB,aE,aF,ax){var aG=aa(ax[0]),aC=aa(ax[1]),ay=aB.width+(aG>aF?aG+aF:aF*2),j=aB.height+(aC>aF?aC+aF:aF*2),aA=(aF||0)+(ax[0]<0?aG:0),aw=(aF||0)+(ax[1]<0?aC:0),az,aD;az=h(ay,j);if(!az){return null}aD=az.getContext("2d");aE&&(aD.shadowColor=aE);aF&&(aD.shadowBlur=aF);ax&&(aD.shadowOffsetX=ax[0],aD.shadowOffsetY=ax[1]);aD.drawImage(aB,aA,aw,aB.width,aB.height);return az}function ag(aI,aA,aG){var aH=parseInt(aI.toString().length*aG),az=parseInt(aG*2*aI.length),ax=h(aH,az),aD,j,ay,aC,aF,aE,aw,aB;if(!ax){return null}aD=ax.getContext("2d");aD.fillStyle="#000";aD.fillRect(0,0,aH,az);B(aD,aG+"px "+aA,"#fff",aI,0,0,[]);j=aD.getImageData(0,0,aH,az);ay=j.width;aC=j.height;aB={min:{x:ay,y:aC},max:{x:-1,y:-1}};for(aE=0;aE<aC;++aE){for(aF=0;aF<ay;++aF){aw=(aE*ay+aF)*4;if(j.data[aw+1]>0){if(aF<aB.min.x){aB.min.x=aF}if(aF>aB.max.x){aB.max.x=aF}if(aE<aB.min.y){aB.min.y=aE}if(aE>aB.max.y){aB.max.y=aE}}}}if(ay!=aH){aB.min.x*=(aH/ay);aB.max.x*=(aH/ay)}if(aC!=az){aB.min.y*=(aH/aC);aB.max.y*=(aH/aC)}ax=null;return aB}function y(i){return"'"+i.replace(/(\'|\")/g,"").replace(/\s*,\s*/g,"', '")+"'"}function G(i,j,aw){aw=aw||o;if(aw.addEventListener){aw.addEventListener(i,j,false)}else{aw.attachEvent("on"+i,j)}}function am(ay,aA,ax,aw){var az=aw.imageScale,j;if(!aA.complete){return G("load",function(){am(ay,aA,ax,aw)},aA)}if(!ay.complete){return G("load",function(){am(ay,aA,ax,aw)},ay)}aA.width=aA.width;aA.height=aA.height;if(az){ay.width=aA.width*az;ay.height=aA.height*az}ax.w=ay.width;ax.h=ay.height;if(aw.txtOpt&&aw.shadow){j=an(ay,aw.shadow,aw.shadowBlur,aw.shadowOffset);if(j){ax.image=j;ax.w=j.width;ax.h=j.height}}}function aj(ax,aw){var j=o.defaultView,i=aw.replace(/\-([a-z])/g,function(ay){return ay.charAt(1).toUpperCase()});return(j&&j.getComputedStyle&&j.getComputedStyle(ax,null).getPropertyValue(aw))||(ax.currentStyle&&ax.currentStyle[i])}function F(aw,j){var i=1,ax;if(aw.weightFrom){i=1*(j.getAttribute(aw.weightFrom)||aw.textHeight)}else{if(ax=aj(j,"font-size")){i=(ax.indexOf("px")>-1&&ax.replace("px","")*1)||(ax.indexOf("pt")>-1&&ax.replace("pt","")*1.25)||ax*3.3}else{aw.weight=false}}return i}function A(i){return i.target&&ak(i.target.id)?i.target.id:i.srcElement.parentNode.id}function M(ay,az){var ax,aw,i=parseInt(aj(az,"width"))/az.width,j=parseInt(aj(az,"height"))/az.height;if(ak(ay.offsetX)){ax={x:ay.offsetX,y:ay.offsetY}}else{aw=r(az.id);if(ak(ay.changedTouches)){ay=ay.changedTouches[0]}if(ay.pageX){ax={x:ay.pageX-aw.x,y:ay.pageY-aw.y}}}if(ax&&i&&j){ax.x/=i;ax.y/=j}return ax}function m(aw){var j=aw.target||aw.fromElement.parentNode,i=x.tc[j.id];if(i){i.mx=i.my=-1;i.UnFreeze();i.EndDrag()}}function ah(aA){var ax,aw=x,j,az,ay=A(aA);for(ax in aw.tc){j=aw.tc[ax];if(j.tttimer){clearTimeout(j.tttimer);j.tttimer=null}}if(ay&&aw.tc[ay]){j=aw.tc[ay];if(az=M(aA,j.canvas)){j.mx=az.x;j.my=az.y;j.Drag(aA,az)}j.drawn=0}}function Z(ax){var j=x,i=o.addEventListener?0:1,aw=A(ax);if(aw&&ax.button==i&&j.tc[aw]){j.tc[aw].BeginDrag(ax)}}function g(ay){var aw=x,j=o.addEventListener?0:1,ax=A(ay),i;if(ax&&ay.button==j&&aw.tc[ax]){i=aw.tc[ax];ah(ay);if(!i.EndDrag()&&!i.touched){i.Clicked(ay)}}}function J(aw){var i=x,j=A(aw);if(j&&aw.changedTouches&&i.tc[j]){i.tc[j].touched=1;i.tc[j].BeginDrag(aw)}}function p(aw){var i=x,j=A(aw);if(j&&aw.changedTouches&&i.tc[j]){ab(aw);if(!i.tc[j].EndDrag()){i.tc[j].Draw();i.tc[j].Clicked(aw)}}}function ab(aA){var ax,aw=x,j,az,ay=A(aA);for(ax in aw.tc){j=aw.tc[ax];if(j.tttimer){clearTimeout(j.tttimer);j.tttimer=null}}if(ay&&aw.tc[ay]&&aA.changedTouches){j=aw.tc[ay];if(az=M(aA,j.canvas)){j.mx=az.x;j.my=az.y;j.Drag(aA,az)}j.drawn=0}}function ar(aw){var i=x,j=A(aw);if(j&&i.tc[j]){aw.cancelBubble=true;aw.returnValue=false;aw.preventDefault&&aw.preventDefault();i.tc[j].Wheel((aw.wheelDelta||aw.detail)>0)}}function t(ay){var j=x.tc,ax,aw;ay=ay||T();for(ax in j){aw=j[ax].interval;j[ax].Draw(ay)}x.NextFrame(aw)}function r(aw){var az=o.getElementById(aw),i=az.getBoundingClientRect(),aC=o.documentElement,aA=o.body,aB=window,ax=aB.pageXOffset||aC.scrollLeft,aD=aB.pageYOffset||aC.scrollTop,ay=aC.clientLeft||aA.clientLeft,j=aC.clientTop||aA.clientTop;return{x:i.left+ax-ay,y:i.top+aD-j}}function aq(j,ax,ay,aw){var i=j.radius*j.z1/(j.z1+j.z2+ax.z);return{x:ax.x*i*ay,y:ax.y*i*aw,z:ax.z,w:(j.z1-ax.z)/j.z2}}function P(i){this.e=i;this.br=0;this.line=[];this.text=[];this.original=i.innerText||i.textContent}z=P.prototype;z.Lines=function(ay){var ax=ay?1:0,az,j,aw;ay=ay||this.e;az=ay.childNodes;j=az.length;for(aw=0;aw<j;++aw){if(az[aw].nodeName=="BR"){this.text.push(this.line.join(" "));this.br=1}else{if(az[aw].nodeType==3){if(this.br){this.line=[az[aw].nodeValue];this.br=0}else{this.line.push(az[aw].nodeValue)}}else{this.Lines(az[aw])}}}ax||this.br||this.text.push(this.line.join(" "));return this.text};z.SplitWidth=function(aw,aD,aA,az){var ay,ax,aC,aB=[];aD.font=az+"px "+aA;for(ay=0;ay<this.text.length;++ay){aC=this.text[ay].split(/\s+/);this.line=[aC[0]];for(ax=1;ax<aC.length;++ax){if(aD.measureText(this.line.join(" ")+" "+aC[ax]).width>aw){aB.push(this.line.join(" "));this.line=[aC[ax]]}else{this.line.push(aC[ax])}}aB.push(this.line.join(" "))}return this.text=aB};function f(i){this.ts=T();this.tc=i;this.x=this.y=this.w=this.h=this.sc=1;this.z=0;this.Draw=i.pulsateTo<1&&i.outlineMethod!="colour"?this.DrawPulsate:this.DrawSimple;this.SetMethod(i.outlineMethod)}e=f.prototype;e.SetMethod=function(aw){var j={block:["PreDraw","DrawBlock"],colour:["PreDraw","DrawColour"],outline:["PostDraw","DrawOutline"],classic:["LastDraw","DrawOutline"],none:["LastDraw"]},i=j[aw]||j.outline;if(aw=="none"){this.Draw=function(){return 1}}else{this.drawFunc=this[i[1]]}this[i[0]]=this.Draw};e.Update=function(aC,aB,aD,ay,az,aA,ax,i){var j=this.tc.outlineOffset,aw=2*j;this.x=az*aC+ax-j;this.y=az*aB+i-j;this.w=az*aD+aw;this.h=az*ay+aw;this.sc=az;this.z=aA};e.DrawOutline=function(az,i,ay,j,aw,ax){az.strokeStyle=ax;az.strokeRect(i,ay,j,aw)};e.DrawColour=function(ax,aA,ay,aB,aw,i,aC,j,az){return this[aC.image?"DrawColourImage":"DrawColourText"](ax,aA,ay,aB,aw,i,aC,j,az)};e.DrawColourText=function(ay,aB,az,aC,aw,i,aD,j,aA){var ax=aD.colour;aD.colour=i;aD.alpha=1;aD.Draw(ay,j,aA);aD.colour=ax;return 1};e.DrawColourImage=function(aB,aE,aC,aF,aA,i,aI,j,aD){var aG=aB.canvas,ay=~~I(aE,0),ax=~~I(aC,0),az=au(aG.width-ay,aF)+0.5|0,aH=au(aG.height-ax,aA)+0.5|0,aw;if(H){H.width=az,H.height=aH}else{H=h(az,aH)}if(!H){return this.SetMethod("outline")}aw=H.getContext("2d");aw.drawImage(aG,ay,ax,az,aH,0,0,az,aH);aB.clearRect(ay,ax,az,aH);aI.alpha=1;aI.Draw(aB,j,aD);aB.setTransform(1,0,0,1,0,0);aB.save();aB.beginPath();aB.rect(ay,ax,az,aH);aB.clip();aB.globalCompositeOperation="source-in";aB.fillStyle=i;aB.fillRect(ay,ax,az,aH);aB.restore();aB.globalCompositeOperation="destination-over";aB.drawImage(H,0,0,az,aH,ay,ax,az,aH);aB.globalCompositeOperation="source-over";return 1};e.DrawBlock=function(az,i,ay,j,aw,ax){az.fillStyle=ax;az.fillRect(i,ay,j,aw)};e.DrawSimple=function(ay,i,j,ax){var aw=this.tc;ay.setTransform(1,0,0,1,0,0);ay.strokeStyle=aw.outlineColour;ay.lineWidth=aw.outlineThickness;ay.shadowBlur=ay.shadowOffsetX=ay.shadowOffsetY=0;ay.globalAlpha=1;return this.drawFunc(ay,this.x,this.y,this.w,this.h,aw.outlineColour,i,j,ax)};e.DrawPulsate=function(az,i,j,ax){var ay=T()-this.ts,aw=this.tc;az.setTransform(1,0,0,1,0,0);az.strokeStyle=aw.outlineColour;az.lineWidth=aw.outlineThickness;az.shadowBlur=az.shadowOffsetX=az.shadowOffsetY=0;az.globalAlpha=aw.pulsateTo+((1-aw.pulsateTo)*(0.5+(l(2*Math.PI*ay/(1000*aw.pulsateTime))/2)));return this.drawFunc(az,this.x,this.y,this.w,this.h,aw.outlineColour,i,j,ax)};e.Active=function(aw,i,j){return(i>=this.x&&j>=this.y&&i<=this.x+this.w&&j<=this.y+this.h)};e.PreDraw=e.PostDraw=e.LastDraw=Y;function S(ax,aD,aA,aC,aB,ay,j,aw,i){var az=ax.ctxt;this.tc=ax;this.image=aD.src?aD:null;this.text=aD.src?[]:aD;this.text_original=i;this.line_widths=[];this.title=aA.title||null;this.a=aA;this.position=new U(aC[0],aC[1],aC[2]);this.x=this.y=this.z=0;this.w=aB;this.h=ay;this.colour=j||ax.textColour;this.textFont=aw||ax.textFont;this.weight=this.sc=this.alpha=1;this.weighted=!ax.weight;this.outline=new f(ax);if(!this.image){this.textHeight=ax.textHeight;this.extents=ag(this.text,this.textFont,this.textHeight);this.Measure(az,ax)}this.SetShadowColour=ax.shadowAlpha?this.SetShadowColourAlpha:this.SetShadowColourFixed;this.SetDraw(ax)}ae=S.prototype;ae.EqualTo=function(aw){var j=aw.getElementsByTagName("img");if(this.a.href!=aw.href){return 0}if(j.length){return this.image.src==j[0].src}return(aw.innerText||aw.textContent)==this.text_original};ae.SetDraw=function(i){this.Draw=this.image?(i.ie>7?this.DrawImageIE:this.DrawImage):this.DrawText;i.noSelect&&(this.CheckActive=Y)};ae.MeasureText=function(az){var ax,aw=this.text.length,j=0,ay;for(ax=0;ax<aw;++ax){this.line_widths[ax]=ay=az.measureText(this.text[ax]).width;j=I(j,ay)}return j};ae.Measure=function(aA,j){this.h=this.extents?this.extents.max.y+this.extents.min.y:this.textHeight;aA.font=this.font=this.textHeight+"px "+this.textFont;this.w=this.MeasureText(aA);if(j.txtOpt){var ax=j.txtScale,ay=ax*this.textHeight,az=ay+"px "+this.textFont,aw=[ax*j.shadowOffset[0],ax*j.shadowOffset[1]],i;aA.font=az;i=this.MeasureText(aA);this.image=q(this.text,az,ay,i,ax*this.h,this.colour,j.shadow,ax*j.shadowBlur,aw,ax,ax,i,this.line_widths);if(this.image){this.w=this.image.width/ax;this.h=this.image.height/ax}this.SetDraw(j);j.txtOpt=!!this.image}};ae.SetFont=function(i,j){this.textFont=i;this.colour=j;this.extents=ag(this.text,this.textFont,this.textHeight);this.Measure(this.tc.ctxt,this.tc)};ae.SetWeight=function(i){if(!this.text.length){return}this.weight=i;this.Weight(this.tc.ctxt,this.tc);this.Measure(this.tc.ctxt,this.tc)};ae.Weight=function(ax,aw){var j=this.weight,i=aw.weightMode;this.weighted=true;if(i=="colour"||i=="both"){this.colour=av(aw,(j-aw.min_weight)/(aw.max_weight-aw.min_weight))}if(i=="size"||i=="both"){if(aw.weightSizeMin>0&&aw.weightSizeMax>aw.weightSizeMin){this.textHeight=aw.weightSize*(aw.weightSizeMin+(aw.weightSizeMax-aw.weightSizeMin)*(j-aw.min_weight)/(aw.max_weight-aw.min_weight))}else{this.textHeight=j*aw.weightSize}}this.extents=ag(this.text,this.textFont,this.textHeight)};ae.SetShadowColourFixed=function(aw,j,i){aw.shadowColor=j};ae.SetShadowColourAlpha=function(aw,j,i){aw.shadowColor=u(j,i)};ae.DrawText=function(ay,aB,ax){var aC=this.tc,aA=this.x,az=this.y,aD=this.sc,j,aw;ay.globalAlpha=this.alpha;ay.fillStyle=this.colour;aC.shadow&&this.SetShadowColour(ay,aC.shadow,this.alpha);ay.font=this.font;aA+=aB/aD;az+=(ax/aD)-(this.h/2);for(j=0;j<this.text.length;++j){aw=aA-(this.line_widths[j]/2);ay.setTransform(aD,0,0,aD,aD*aw,aD*az);ay.fillText(this.text[j],0,0);az+=this.textHeight}};ae.DrawImage=function(ay,aE,ax){var aB=this.x,az=this.y,aF=this.sc,j=this.image,aC=this.w,aw=this.h,aA=this.alpha,aD=this.shadow;ay.globalAlpha=aA;aD&&this.SetShadowColour(ay,aD,aA);aB+=(aE/aF)-(aC/2);az+=(ax/aF)-(aw/2);ay.setTransform(aF,0,0,aF,aF*aB,aF*az);ay.drawImage(j,0,0,aC,aw)};ae.DrawImageIE=function(ay,aC,ax){var j=this.image,aD=this.sc,aB=j.width=this.w*aD,aw=j.height=this.h*aD,aA=(this.x*aD)+aC-(aB/2),az=(this.y*aD)+ax-(aw/2);ay.setTransform(1,0,0,1,0,0);ay.globalAlpha=this.alpha;ay.drawImage(j,aA,az)};ae.Calc=function(i,aw){var j,az=this.tc,ay=az.minBrightness,ax=az.maxBrightness,aA=az.max_radius;j=i.xform(this.position);this.xformed=j;j=aq(az,j,az.stretchX,az.stretchY);this.x=j.x;this.y=j.y;this.z=j.z;this.sc=j.w;this.alpha=aw*b(ay+(ax-ay)*(aA-this.z)/(2*aA),0,1)};ae.CheckActive=function(ax,aB,aw){var aC=this.tc,i=this.outline,aA=this.w,j=this.h,az=this.x-aA/2,ay=this.y-j/2;i.Update(az,ay,aA,j,this.sc,this.z,aB,aw);return i.Active(ax,aC.mx,aC.my)?i:null};ae.Clicked=function(az){var j=this.a,aw=j.target,ax=j.href,i;if(aw!=""&&aw!="_self"){if(self.frames[aw]){self.frames[aw].document.location=ax}else{try{if(top.frames[aw]){top.frames[aw].document.location=ax;return}}catch(ay){}window.open(ax,aw)}return}if(o.createEvent){i=o.createEvent("MouseEvents");i.initMouseEvent("click",1,1,window,0,0,0,0,0,0,0,0,0,0,null);if(!j.dispatchEvent(i)){return}}else{if(j.fireEvent){if(!j.fireEvent("onclick")){return}}}o.location=ax};function x(aB,j,ax){var aw,az,aA=o.getElementById(aB),ay=["id","class","innerHTML"];if(!aA){throw 0}if(ak(window.G_vmlCanvasManager)){aA=window.G_vmlCanvasManager.initElement(aA);this.ie=parseFloat(navigator.appVersion.split("MSIE")[1])}if(aA&&(!aA.getContext||!aA.getContext("2d").fillText)){az=o.createElement("DIV");for(aw=0;aw<ay.length;++aw){az[ay[aw]]=aA[ay[aw]]}aA.parentNode.insertBefore(az,aA);aA.parentNode.removeChild(aA);throw 0}for(aw in x.options){this[aw]=ax&&ak(ax[aw])?ax[aw]:(ak(x[aw])?x[aw]:x.options[aw])}this.canvas=aA;this.ctxt=aA.getContext("2d");this.z1=250/this.depth;this.z2=this.z1/this.zoom;this.radius=au(aA.height,aA.width)*0.0075;this.max_weight=0;this.min_weight=200;this.textFont=this.textFont&&y(this.textFont);this.textHeight*=1;this.pulsateTo=b(this.pulsateTo,0,1);this.minBrightness=b(this.minBrightness,0,1);this.maxBrightness=b(this.maxBrightness,this.minBrightness,1);this.ctxt.textBaseline="top";this.lx=(this.lock+"").indexOf("x")+1;this.ly=(this.lock+"").indexOf("y")+1;this.frozen=this.dx=this.dy=this.fixedAnim=this.touched=0;this.fixedAlpha=1;this.source=j||aB;this.transform=k.Identity();this.startTime=this.time=T();this.Animate=this.dragControl?this.AnimateDrag:this.AnimatePosition;this.animTiming=(typeof x[this.animTiming]=="function"?x[this.animTiming]:x.Smooth);if(this.shadowBlur||this.shadowOffset[0]||this.shadowOffset[1]){this.ctxt.shadowColor=this.shadow;this.shadow=this.ctxt.shadowColor;this.shadowAlpha=D()}else{delete this.shadow}this.Load();if(j&&this.hideTags){(function(i){if(x.loaded){i.HideTags()}else{G("load",function(){i.HideTags()},window)}})(this)}this.yaw=this.initial?this.initial[0]*this.maxSpeed:0;this.pitch=this.initial?this.initial[1]*this.maxSpeed:0;if(this.tooltip){if(this.tooltip=="native"){this.Tooltip=this.TooltipNative}else{this.Tooltip=this.TooltipDiv;if(!this.ttdiv){this.ttdiv=o.createElement("div");this.ttdiv.className=this.tooltipClass;this.ttdiv.style.position="absolute";this.ttdiv.style.zIndex=aA.style.zIndex+1;G("mouseover",function(i){i.target.style.display="none"},this.ttdiv);o.body.appendChild(this.ttdiv)}}}else{this.Tooltip=this.TooltipNone}if(!this.noMouse&&!c[aB]){G("mousemove",ah,aA);G("mouseout",m,aA);G("mouseup",g,aA);G("touchstart",J,aA);G("touchend",p,aA);G("touchcancel",p,aA);G("touchmove",ab,aA);if(this.dragControl){G("mousedown",Z,aA);G("selectstart",Y,aA)}if(this.wheelZoom){G("mousewheel",ar,aA);G("DOMMouseScroll",ar,aA)}c[aB]=1}x.started||(x.started=setTimeout(t,this.interval))}d=x.prototype;d.SourceElements=function(){if(o.querySelectorAll){return o.querySelectorAll("#"+this.source)}return[o.getElementById(this.source)]};d.HideTags=function(){var aw=this.SourceElements(),j;for(j=0;j<aw.length;++j){aw[j].style.display="none"}};d.GetTags=function(){var aA=this.SourceElements(),az,aw=[],ay,ax;for(ay=0;ay<aA.length;++ay){az=aA[ay].getElementsByTagName("a");for(ax=0;ax<az.length;++ax){aw.push(az[ax])}}return aw};d.CreateTag=function(aB,aA){var j=aB.getElementsByTagName("img"),ay,ax,az,aw;aA=aA||[0,0,0];if(j.length){ay=new Image;ay.src=j[0].src;ax=new S(this,ay,aB,aA,0,0);am(ay,j[0],ax,this);return ax}az=new P(aB);ax=az.Lines();aw=this.textFont||y(aj(aB,"font-family"));if(this.splitWidth){ax=az.SplitWidth(this.splitWidth,this.ctxt,aw,this.textHeight)}return new S(this,ax,aB,aA,2,this.textHeight+2,this.textColour||aj(aB,"color"),aw,az.original)};d.UpdateTag=function(aw,i){var ax=this.textColour||aj(i,"color"),j=this.textFont||y(aj(i,"font-family"));aw.title=i.title;if(aw.colour!=ax||aw.textFont!=j){aw.SetFont(j,ax)}};d.Weight=function(ax){var aw=ax.length,j,ay,az=[];for(ay=0;ay<aw;++ay){j=F(this,ax[ay].a);if(j>this.max_weight){this.max_weight=j}if(j<this.min_weight){this.min_weight=j}az.push(j)}if(this.max_weight>this.min_weight){for(ay=0;ay<aw;++ay){ax[ay].SetWeight(az[ay])}}};d.Load=function(){var aF=this.GetTags(),aB=[],aE,aA,ax,aw,j,ay,aD,az=[],aC={sphere:s,vcylinder:E,hcylinder:W,vring:C,hring:N};if(aF.length){az.length=aF.length;for(aD=0;aD<aF.length;++aD){az[aD]=aD}this.shuffleTags&&ac(az);ax=100*this.radiusX;aw=100*this.radiusY;j=100*this.radiusZ;this.max_radius=I(ax,I(aw,j));if(this.shapeArgs){this.shapeArgs[0]=aF.length}else{aA=this.shape.toString().split(/[(),]/);aE=aA.shift();this.shape=aC[aE]||aC.sphere;this.shapeArgs=[aF.length,ax,aw,j].concat(aA)}ay=this.shape.apply(this,this.shapeArgs);this.listLength=aF.length;for(aD=0;aD<aF.length;++aD){aB.push(this.CreateTag(aF[az[aD]],ay[aD]))}this.weight&&this.Weight(aB,true)}this.taglist=aB};d.Update=function(){var aF=this.GetTags(),aE=[],az=this.taglist,aG,aD=[],aB=[],ax,aC,aw,aA,ay;if(!this.shapeArgs){return this.Load()}if(aF.length){aw=this.listLength=aF.length;aC=az.length;for(aA=0;aA<aC;++aA){aE.push(az[aA]);aB.push(aA)}for(aA=0;aA<aw;++aA){for(ay=0,aG=0;ay<aC;++ay){if(az[ay].EqualTo(aF[aA])){this.UpdateTag(aE[ay],aF[aA]);aG=aB[ay]=-1}}if(!aG){aD.push(aA)}}for(aA=0,ay=0;aA<aC;++aA){if(aB[ay]==-1){aB.splice(ay,1)}else{++ay}}if(aB.length){ac(aB);while(aB.length&&aD.length){aA=aB.shift();ay=aD.shift();aE[aA]=this.CreateTag(aF[ay])}aB.sort(function(j,i){return j-i});while(aB.length){aE.splice(aB.pop(),1)}}ay=aE.length/(aD.length+1);aA=0;while(aD.length){aE.splice(V(++aA*ay),0,this.CreateTag(aF[aD.shift()]))}this.shapeArgs[0]=aw=aE.length;ax=this.shape.apply(this,this.shapeArgs);for(aA=0;aA<aw;++aA){aE[aA].position=new U(ax[aA][0],ax[aA][1],ax[aA][2])}this.weight&&this.Weight(aE)}this.taglist=aE};d.SetShadow=function(i){i.shadowBlur=this.shadowBlur;i.shadowOffsetX=this.shadowOffset[0];i.shadowOffsetY=this.shadowOffset[1]};d.Draw=function(aG){if(this.paused){return}var aA=this.canvas,ay=aA.width,aF=aA.height,aI=0,ax=(aG-this.time)*this.interval/1000,aE=ay/2+this.offsetX,aD=aF/2+this.offsetY,aM=this.ctxt,aC,aN,aK,aw=-1,az=this.taglist,aJ=az.length,j=this.frontSelect,aH=(this.centreFunc==Y),aB;this.time=aG;if(this.frozen&&this.drawn){return this.Animate(ay,aF,ax)}aB=this.AnimateFixed();aM.setTransform(1,0,0,1,0,0);this.active=null;for(aK=0;aK<aJ;++aK){az[aK].Calc(this.transform,this.fixedAlpha)}az=n(az,function(aO,i){return i.z-aO.z});for(aK=0;aK<aJ;++aK){aN=this.mx>=0&&this.my>=0&&this.taglist[aK].CheckActive(aM,aE,aD);if(aN&&aN.sc>aI&&(!j||aN.z<=0)){aC=aN;aw=aK;aC.tag=this.taglist[aK];aI=aN.sc}}this.active=aC;this.txtOpt||(this.shadow&&this.SetShadow(aM));aM.clearRect(0,0,ay,aF);for(aK=0;aK<aJ;++aK){if(!aH&&az[aK].z<=0){try{this.centreFunc(aM,ay,aF,aE,aD)}catch(aL){alert(aL);this.centreFunc=Y}aH=true}if(!(aC&&aC.tag==az[aK]&&aC.PreDraw(aM,az[aK],aE,aD))){az[aK].Draw(aM,aE,aD)}aC&&aC.tag==az[aK]&&aC.PostDraw(aM)}if(this.freezeActive&&aC){this.Freeze()}else{this.UnFreeze();this.drawn=(aJ==this.listLength)}if(this.fixedCallback){this.fixedCallback(this,this.fixedCallbackTag);this.fixedCallback=null}aB||this.Animate(ay,aF,ax);aC&&aC.LastDraw(aM);aA.style.cursor=aC?this.activeCursor:"";this.Tooltip(aC,this.taglist[aw])};d.TooltipNone=function(){};d.TooltipNative=function(j,i){this.canvas.title=j&&i.title?i.title:""};d.TooltipDiv=function(ay,j){var i=this,ax=i.ttdiv.style,az=i.canvas.id,aw="none";if(ay&&j.title){if(j.title!=i.ttdiv.innerHTML){ax.display=aw}i.ttdiv.innerHTML=j.title;j.title=i.ttdiv.innerHTML;if(ax.display==aw&&!i.tttimer){i.tttimer=setTimeout(function(){var aA=r(az);ax.display="block";ax.left=aA.x+i.mx+"px";ax.top=aA.y+i.my+24+"px";i.tttimer=null},i.tooltipDelay)}}else{ax.display=aw}};d.Transform=function(az,i,aB){if(i||aB){var j=w(i),aA=l(i),aC=w(aB),ay=l(aB),aw=new k([ay,0,aC,0,1,0,-aC,0,ay]),ax=new k([1,0,0,0,aA,-j,0,j,aA]);az.transform=az.transform.mul(aw.mul(ax))}};d.AnimateFixed=function(){var aw,j,ay,i,ax;if(this.fadeIn){j=T()-this.startTime;if(j>=this.fadeIn){this.fadeIn=0;this.fixedAlpha=1}else{this.fixedAlpha=j/this.fadeIn}}if(this.fixedAnim){if(!this.fixedAnim.transform){this.fixedAnim.transform=this.transform}aw=this.fixedAnim,j=T()-aw.t0,ay=aw.angle,i,ax=this.animTiming(aw.t,j);this.transform=aw.transform;if(j>=aw.t){this.fixedCallbackTag=aw.tag;this.fixedCallback=aw.cb;this.fixedAnim=this.yaw=this.pitch=0}else{ay*=ax}i=k.Rotation(ay,aw.axis);this.transform=this.transform.mul(i);return(this.fixedAnim!=0)}return false};d.AnimatePosition=function(aw,az,ax){var j=this,i=j.mx,aB=j.my,ay,aA;if(!j.frozen&&i>=0&&aB>=0&&i<aw&&aB<az){ay=j.maxSpeed,aA=j.reverse?-1:1;j.lx||(j.yaw=aA*ax*((ay*2*i/aw)-ay));j.ly||(j.pitch=aA*ax*-((ay*2*aB/az)-ay));j.initial=null}else{if(!j.initial){if(j.frozen&&!j.freezeDecel){j.yaw=j.pitch=0}else{j.Decel(j)}}}this.Transform(j,j.pitch,j.yaw)};d.AnimateDrag=function(j,ay,ax){var i=this,aw=100*ax*i.maxSpeed/i.max_radius/i.zoom;if(i.dx||i.dy){i.lx||(i.yaw=i.dx*aw/i.stretchX);i.ly||(i.pitch=i.dy*-aw/i.stretchY);i.dx=i.dy=0;i.initial=null}else{if(!i.initial){i.Decel(i)}}this.Transform(i,i.pitch,i.yaw)};d.Freeze=function(){if(!this.frozen){this.preFreeze=[this.yaw,this.pitch];this.frozen=1;this.drawn=0}};d.UnFreeze=function(){if(this.frozen){this.yaw=this.preFreeze[0];this.pitch=this.preFreeze[1];this.frozen=0}};d.Decel=function(i){var aw=i.minSpeed,ax=aa(i.yaw),j=aa(i.pitch);if(!i.lx&&ax>aw){i.yaw=ax>i.z0?i.yaw*i.decel:0}if(!i.ly&&j>aw){i.pitch=j>i.z0?i.pitch*i.decel:0}};d.Zoom=function(i){this.z2=this.z1*(1/i);this.drawn=0};d.Clicked=function(aw){var i=this.active;try{if(i&&i.tag){if(this.clickToFront===false||this.clickToFront===null){i.tag.Clicked(aw)}else{this.TagToFront(i.tag,this.clickToFront,function(){i.tag.Clicked(aw)})}}}catch(j){}};d.Wheel=function(j){var aw=this.zoom+this.zoomStep*(j?1:-1);this.zoom=au(this.zoomMax,I(this.zoomMin,aw));this.Zoom(this.zoom)};d.BeginDrag=function(i){this.down=M(i,this.canvas);i.cancelBubble=true;i.returnValue=false;i.preventDefault&&i.preventDefault()};d.Drag=function(ay,ax){if(this.dragControl&&this.down){var aw=this.dragThreshold*this.dragThreshold,j=ax.x-this.down.x,i=ax.y-this.down.y;if(this.dragging||j*j+i*i>aw){this.dx=j;this.dy=i;this.dragging=1;this.down=ax}}};d.EndDrag=function(){var i=this.dragging;this.dragging=this.down=null;return i};d.Pause=function(){this.paused=true};d.Resume=function(){this.paused=false};d.FindTag=function(aw){if(!ak(aw)){return null}ak(aw.index)&&(aw=aw.index);if(!v(aw)){return this.taglist[aw]}var ax,ay,j;if(ak(aw.id)){ax="id",ay=aw.id}else{if(ak(aw.text)){ax="innerText",ay=aw.text}}for(j=0;j<this.taglist.length;++j){if(this.taglist[j].a[ax]==ay){return this.taglist[j]}}};d.RotateTag=function(aD,aw,aC,i,aA){var aB=aD.xformed,ay=new U(aB.x,aB.y,aB.z),ax=K(aC,aw),j=ay.angle(ax),az=ay.cross(ax).unit();if(j==0){this.fixedCallbackTag=aD;this.fixedCallback=aA}else{this.fixedAnim={angle:-j,axis:az,t:i,t0:T(),cb:aA,tag:aD}}};d.TagToFront=function(i,j,aw){this.RotateTag(i,0,0,j,aw)};x.Start=function(aw,i,j){x.tc[aw]=new x(aw,i,j)};function al(i,j){x.tc[j]&&x.tc[j][i]()}x.Linear=function(i,j){return j/i};x.Smooth=function(i,j){return 0.5-l(j*Math.PI/i)/2};x.Pause=function(i){al("Pause",i)};x.Resume=function(i){al("Resume",i)};x.Reload=function(i){al("Load",i)};x.Update=function(i){al("Update",i)};x.TagToFront=function(j,i){if(!v(i)){return false}i.lat=i.lng=0;return x.RotateTag(j,i)};x.RotateTag=function(aw,i){if(!v(i)){return false}if(x.tc[aw]){if(isNaN(i.time)){i.time=500}var j=x.tc[aw].FindTag(i);if(j){x.tc[aw].RotateTag(j,i.lat,i.lng,i.time,i.callback);return true}}return false};x.NextFrame=function(i){var j=window.requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;x.NextFrame=j?x.NextFrameRAF:x.NextFrameTimeout;x.NextFrame(i)};x.NextFrameRAF=function(){requestAnimationFrame(t)};x.NextFrameTimeout=function(i){setTimeout(t,i)};x.tc={};x.options={z1:20000,z2:20000,z0:0.0002,freezeActive:false,freezeDecel:false,activeCursor:"pointer",pulsateTo:1,pulsateTime:3,reverse:false,depth:0.5,maxSpeed:0.05,minSpeed:0,decel:0.95,interval:20,minBrightness:0.1,maxBrightness:1,outlineColour:"#ffff99",outlineThickness:2,outlineOffset:5,outlineMethod:"outline",textColour:"#ff99ff",textHeight:15,textFont:"Helvetica, Arial, sans-serif",shadow:"#000",shadowBlur:0,shadowOffset:[0,0],initial:null,hideTags:true,zoom:1,weight:false,weightMode:"size",weightFrom:null,weightSize:1,weightSizeMin:null,weightSizeMax:null,weightGradient:{0:"#f00",0.33:"#ff0",0.66:"#0f0",1:"#00f"},txtOpt:true,txtScale:2,frontSelect:false,wheelZoom:true,zoomMin:0.3,zoomMax:3,zoomStep:0.05,shape:"sphere",lock:null,tooltip:null,tooltipDelay:300,tooltipClass:"tctooltip",radiusX:1,radiusY:1,radiusZ:1,stretchX:1,stretchY:1,offsetX:0,offsetY:0,shuffleTags:false,noSelect:false,noMouse:false,imageScale:1,paused:false,dragControl:false,dragThreshold:4,centreFunc:Y,splitWidth:0,animTiming:"Smooth",clickToFront:false,fadeIn:0};for(ap in x.options){x[ap]=x.options[ap]}window.TagCanvas=x;jQuery.fn.tagcanvas=function(j,i){var aw={pause:function(){ad(this).each(function(){al("Pause",ad(this)[0].id)})},resume:function(){ad(this).each(function(){al("Resume",ad(this)[0].id)})},reload:function(){ad(this).each(function(){al("Load",ad(this)[0].id)})},update:function(){ad(this).each(function(){al("Update",ad(this)[0].id)})},tagtofront:function(){ad(this).each(function(){x.TagToFront(ad(this)[0].id,i)})},rotatetag:function(){ad(this).each(function(){x.RotateTag(ad(this)[0].id,i)})}};if(typeof j=="string"&&aw[j]){aw[j].apply(this)}else{x.jquery=1;ad(this).each(function(){x.Start(ad(this)[0].id,i,j)});return x.started}};G("load",function(){x.loaded=1},window)})(jQuery);



/*!
 * typeahead.js 0.9.3
 * https://github.com/twitter/typeahead
 * Copyright 2013 Twitter, Inc. and other contributors; Licensed MIT
 */

(function($) {
    var VERSION = "0.9.3";
    var utils = {
        isMsie: function() {
            var match = /(msie) ([\w.]+)/i.exec(navigator.userAgent);
            return match ? parseInt(match[2], 10) : false;
        },
        isBlankString: function(str) {
            return !str || /^\s*$/.test(str);
        },
        escapeRegExChars: function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        isString: function(obj) {
            return typeof obj === "string";
        },
        isNumber: function(obj) {
            return typeof obj === "number";
        },
        isArray: $.isArray,
        isFunction: $.isFunction,
        isObject: $.isPlainObject,
        isUndefined: function(obj) {
            return typeof obj === "undefined";
        },
        bind: $.proxy,
        bindAll: function(obj) {
            var val;
            for (var key in obj) {
                $.isFunction(val = obj[key]) && (obj[key] = $.proxy(val, obj));
            }
        },
        indexOf: function(haystack, needle) {
            for (var i = 0; i < haystack.length; i++) {
                if (haystack[i] === needle) {
                    return i;
                }
            }
            return -1;
        },
        each: $.each,
        map: $.map,
        filter: $.grep,
        every: function(obj, test) {
            var result = true;
            if (!obj) {
                return result;
            }
            $.each(obj, function(key, val) {
                if (!(result = test.call(null, val, key, obj))) {
                    return false;
                }
            });
            return !!result;
        },
        some: function(obj, test) {
            var result = false;
            if (!obj) {
                return result;
            }
            $.each(obj, function(key, val) {
                if (result = test.call(null, val, key, obj)) {
                    return false;
                }
            });
            return !!result;
        },
        mixin: $.extend,
        getUniqueId: function() {
            var counter = 0;
            return function() {
                return counter++;
            };
        }(),
        defer: function(fn) {
            setTimeout(fn, 0);
        },
        debounce: function(func, wait, immediate) {
            var timeout, result;
            return function() {
                var context = this, args = arguments, later, callNow;
                later = function() {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                    }
                };
                callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                }
                return result;
            };
        },
        throttle: function(func, wait) {
            var context, args, timeout, result, previous, later;
            previous = 0;
            later = function() {
                previous = new Date();
                timeout = null;
                result = func.apply(context, args);
            };
            return function() {
                var now = new Date(), remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        tokenizeQuery: function(str) {
            return $.trim(str).toLowerCase().split(/[\s]+/);
        },
        tokenizeText: function(str) {
            return $.trim(str).toLowerCase().split(/[\s\-_]+/);
        },
        getProtocol: function() {
            return location.protocol;
        },
        noop: function() {}
    };
    var EventTarget = function() {
        var eventSplitter = /\s+/;
        return {
            on: function(events, callback) {
                var event;
                if (!callback) {
                    return this;
                }
                this._callbacks = this._callbacks || {};
                events = events.split(eventSplitter);
                while (event = events.shift()) {
                    this._callbacks[event] = this._callbacks[event] || [];
                    this._callbacks[event].push(callback);
                }
                return this;
            },
            trigger: function(events, data) {
                var event, callbacks;
                if (!this._callbacks) {
                    return this;
                }
                events = events.split(eventSplitter);
                while (event = events.shift()) {
                    if (callbacks = this._callbacks[event]) {
                        for (var i = 0; i < callbacks.length; i += 1) {
                            callbacks[i].call(this, {
                                type: event,
                                data: data
                            });
                        }
                    }
                }
                return this;
            }
        };
    }();
    var EventBus = function() {
        var namespace = "typeahead:";
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        utils.mixin(EventBus.prototype, {
            trigger: function(type) {
                var args = [].slice.call(arguments, 1);
                this.$el.trigger(namespace + type, args);
            }
        });
        return EventBus;
    }();
    var PersistentStorage = function() {
        var ls, methods;
        try {
            ls = window.localStorage;
            ls.setItem("~~~", "!");
            ls.removeItem("~~~");
        } catch (err) {
            ls = null;
        }
        function PersistentStorage(namespace) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + this.prefix);
        }
        if (ls && window.JSON) {
            methods = {
                _prefix: function(key) {
                    return this.prefix + key;
                },
                _ttlKey: function(key) {
                    return this._prefix(key) + this.ttlKey;
                },
                get: function(key) {
                    if (this.isExpired(key)) {
                        this.remove(key);
                    }
                    return decode(ls.getItem(this._prefix(key)));
                },
                set: function(key, val, ttl) {
                    if (utils.isNumber(ttl)) {
                        ls.setItem(this._ttlKey(key), encode(now() + ttl));
                    } else {
                        ls.removeItem(this._ttlKey(key));
                    }
                    return ls.setItem(this._prefix(key), encode(val));
                },
                remove: function(key) {
                    ls.removeItem(this._ttlKey(key));
                    ls.removeItem(this._prefix(key));
                    return this;
                },
                clear: function() {
                    var i, key, keys = [], len = ls.length;
                    for (i = 0; i < len; i++) {
                        if ((key = ls.key(i)).match(this.keyMatcher)) {
                            keys.push(key.replace(this.keyMatcher, ""));
                        }
                    }
                    for (i = keys.length; i--; ) {
                        this.remove(keys[i]);
                    }
                    return this;
                },
                isExpired: function(key) {
                    var ttl = decode(ls.getItem(this._ttlKey(key)));
                    return utils.isNumber(ttl) && now() > ttl ? true : false;
                }
            };
        } else {
            methods = {
                get: utils.noop,
                set: utils.noop,
                remove: utils.noop,
                clear: utils.noop,
                isExpired: utils.noop
            };
        }
        utils.mixin(PersistentStorage.prototype, methods);
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(utils.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return JSON.parse(val);
        }
    }();
    var RequestCache = function() {
        function RequestCache(o) {
            utils.bindAll(this);
            o = o || {};
            this.sizeLimit = o.sizeLimit || 10;
            this.cache = {};
            this.cachedKeysByAge = [];
        }
        utils.mixin(RequestCache.prototype, {
            get: function(url) {
                return this.cache[url];
            },
            set: function(url, resp) {
                var requestToEvict;
                if (this.cachedKeysByAge.length === this.sizeLimit) {
                    requestToEvict = this.cachedKeysByAge.shift();
                    delete this.cache[requestToEvict];
                }
                this.cache[url] = resp;
                this.cachedKeysByAge.push(url);
            }
        });
        return RequestCache;
    }();
    var Transport = function() {
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests, requestCache;
        function Transport(o) {
            utils.bindAll(this);
            o = utils.isString(o) ? {
                url: o
            } : o;
            requestCache = requestCache || new RequestCache();
            maxPendingRequests = utils.isNumber(o.maxParallelRequests) ? o.maxParallelRequests : maxPendingRequests || 6;
            this.url = o.url;
            this.wildcard = o.wildcard || "%QUERY";
            this.filter = o.filter;
            this.replace = o.replace;
            this.ajaxSettings = {
                type: "get",
                cache: o.cache,
                timeout: o.timeout,
                dataType: o.dataType || "json",
                beforeSend: o.beforeSend
            };
            this._get = (/^throttle$/i.test(o.rateLimitFn) ? utils.throttle : utils.debounce)(this._get, o.rateLimitWait || 300);
        }
        utils.mixin(Transport.prototype, {
            _get: function(url, cb) {
                var that = this;
                if (belowPendingRequestsThreshold()) {
                    this._sendRequest(url).done(done);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    var data = that.filter ? that.filter(resp) : resp;
                    cb && cb(data);
                    requestCache.set(url, resp);
                }
            },
            _sendRequest: function(url) {
                var that = this, jqXhr = pendingRequests[url];
                if (!jqXhr) {
                    incrementPendingRequests();
                    jqXhr = pendingRequests[url] = $.ajax(url, this.ajaxSettings).always(always);
                }
                return jqXhr;
                function always() {
                    decrementPendingRequests();
                    pendingRequests[url] = null;
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(query, cb) {
                var that = this, encodedQuery = encodeURIComponent(query || ""), url, resp;
                cb = cb || utils.noop;
                url = this.replace ? this.replace(this.url, encodedQuery) : this.url.replace(this.wildcard, encodedQuery);
                if (resp = requestCache.get(url)) {
                    utils.defer(function() {
                        cb(that.filter ? that.filter(resp) : resp);
                    });
                } else {
                    this._get(url, cb);
                }
                return !!resp;
            }
        });
        return Transport;
        function incrementPendingRequests() {
            pendingRequestsCount++;
        }
        function decrementPendingRequests() {
            pendingRequestsCount--;
        }
        function belowPendingRequestsThreshold() {
            return pendingRequestsCount < maxPendingRequests;
        }
    }();
    var Dataset = function() {
        var keys = {
            thumbprint: "thumbprint",
            protocol: "protocol",
            itemHash: "itemHash",
            adjacencyList: "adjacencyList"
        };
        function Dataset(o) {
            utils.bindAll(this);
            if (utils.isString(o.template) && !o.engine) {
                $.error("no template engine specified");
            }
            if (!o.local && !o.prefetch && !o.remote) {
                $.error("one of local, prefetch, or remote is required");
            }
            this.name = o.name || utils.getUniqueId();
            this.limit = o.limit || 5;
            this.minLength = o.minLength || 1;
            this.header = o.header;
            this.footer = o.footer;
            this.valueKey = o.valueKey || "value";
            this.template = compileTemplate(o.template, o.engine, this.valueKey);
            this.local = o.local;
            this.prefetch = o.prefetch;
            this.remote = o.remote;
            this.itemHash = {};
            this.adjacencyList = {};
            this.storage = o.name ? new PersistentStorage(o.name) : null;
        }
        utils.mixin(Dataset.prototype, {
            _processLocalData: function(data) {
                this._mergeProcessedData(this._processData(data));
            },
            _loadPrefetchData: function(o) {
                var that = this, thumbprint = VERSION + (o.thumbprint || ""), storedThumbprint, storedProtocol, storedItemHash, storedAdjacencyList, isExpired, deferred;
                if (this.storage) {
                    storedThumbprint = this.storage.get(keys.thumbprint);
                    storedProtocol = this.storage.get(keys.protocol);
                    storedItemHash = this.storage.get(keys.itemHash);
                    storedAdjacencyList = this.storage.get(keys.adjacencyList);
                }
                isExpired = storedThumbprint !== thumbprint || storedProtocol !== utils.getProtocol();
                o = utils.isString(o) ? {
                    url: o
                } : o;
                o.ttl = utils.isNumber(o.ttl) ? o.ttl : 24 * 60 * 60 * 1e3;
                if (storedItemHash && storedAdjacencyList && !isExpired) {
                    this._mergeProcessedData({
                        itemHash: storedItemHash,
                        adjacencyList: storedAdjacencyList
                    });
                    deferred = $.Deferred().resolve();
                } else {
                    deferred = $.getJSON(o.url).done(processPrefetchData);
                }
                return deferred;
                function processPrefetchData(data) {
                    var filteredData = o.filter ? o.filter(data) : data, processedData = that._processData(filteredData), itemHash = processedData.itemHash, adjacencyList = processedData.adjacencyList;
                    if (that.storage) {
                        that.storage.set(keys.itemHash, itemHash, o.ttl);
                        that.storage.set(keys.adjacencyList, adjacencyList, o.ttl);
                        that.storage.set(keys.thumbprint, thumbprint, o.ttl);
                        that.storage.set(keys.protocol, utils.getProtocol(), o.ttl);
                    }
                    that._mergeProcessedData(processedData);
                }
            },
            _transformDatum: function(datum) {
                var value = utils.isString(datum) ? datum : datum[this.valueKey], tokens = datum.tokens || utils.tokenizeText(value), item = {
                    value: value,
                    tokens: tokens
                };
                if (utils.isString(datum)) {
                    item.datum = {};
                    item.datum[this.valueKey] = datum;
                } else {
                    item.datum = datum;
                }
                item.tokens = utils.filter(item.tokens, function(token) {
                    return !utils.isBlankString(token);
                });
                item.tokens = utils.map(item.tokens, function(token) {
                    return token.toLowerCase();
                });
                return item;
            },
            _processData: function(data) {
                var that = this, itemHash = {}, adjacencyList = {};
                utils.each(data, function(i, datum) {
                    var item = that._transformDatum(datum), id = utils.getUniqueId(item.value);
                    itemHash[id] = item;
                    utils.each(item.tokens, function(i, token) {
                        var character = token.charAt(0), adjacency = adjacencyList[character] || (adjacencyList[character] = [ id ]);
                        !~utils.indexOf(adjacency, id) && adjacency.push(id);
                    });
                });
                return {
                    itemHash: itemHash,
                    adjacencyList: adjacencyList
                };
            },
            _mergeProcessedData: function(processedData) {
                var that = this;
                utils.mixin(this.itemHash, processedData.itemHash);
                utils.each(processedData.adjacencyList, function(character, adjacency) {
                    var masterAdjacency = that.adjacencyList[character];
                    that.adjacencyList[character] = masterAdjacency ? masterAdjacency.concat(adjacency) : adjacency;
                });
            },
            _getLocalSuggestions: function(terms) {
                var that = this, firstChars = [], lists = [], shortestList, suggestions = [];
                utils.each(terms, function(i, term) {
                    var firstChar = term.charAt(0);
                    !~utils.indexOf(firstChars, firstChar) && firstChars.push(firstChar);
                });
                utils.each(firstChars, function(i, firstChar) {
                    var list = that.adjacencyList[firstChar];
                    if (!list) {
                        return false;
                    }
                    lists.push(list);
                    if (!shortestList || list.length < shortestList.length) {
                        shortestList = list;
                    }
                });
                if (lists.length < firstChars.length) {
                    return [];
                }
                utils.each(shortestList, function(i, id) {
                    var item = that.itemHash[id], isCandidate, isMatch;
                    isCandidate = utils.every(lists, function(list) {
                        return ~utils.indexOf(list, id);
                    });
                    isMatch = isCandidate && utils.every(terms, function(term) {
                        return utils.some(item.tokens, function(token) {
                            return token.indexOf(term) === 0;
                        });
                    });
                    isMatch && suggestions.push(item);
                });
                return suggestions;
            },
            initialize: function() {
                var deferred;
                this.local && this._processLocalData(this.local);
                this.transport = this.remote ? new Transport(this.remote) : null;
                deferred = this.prefetch ? this._loadPrefetchData(this.prefetch) : $.Deferred().resolve();
                this.local = this.prefetch = this.remote = null;
                this.initialize = function() {
                    return deferred;
                };
                return deferred;
            },
            getSuggestions: function(query, cb) {
                var that = this, terms, suggestions, cacheHit = false;
                if (query.length < this.minLength) {
                    return;
                }
                terms = utils.tokenizeQuery(query);
                suggestions = this._getLocalSuggestions(terms).slice(0, this.limit);
                if (suggestions.length < this.limit && this.transport) {
                    cacheHit = this.transport.get(query, processRemoteData);
                }
                !cacheHit && cb && cb(suggestions);
                function processRemoteData(data) {
                    suggestions = suggestions.slice(0);
                    utils.each(data, function(i, datum) {
                        var item = that._transformDatum(datum), isDuplicate;
                        isDuplicate = utils.some(suggestions, function(suggestion) {
                            return item.value === suggestion.value;
                        });
                        !isDuplicate && suggestions.push(item);
                        return suggestions.length < that.limit;
                    });
                    cb && cb(suggestions);
                }
            }
        });
        return Dataset;
        function compileTemplate(template, engine, valueKey) {
            var renderFn, compiledTemplate;
            if (utils.isFunction(template)) {
                renderFn = template;
            } else if (utils.isString(template)) {
                compiledTemplate = engine.compile(template);
                renderFn = utils.bind(compiledTemplate.render, compiledTemplate);
            } else {
                renderFn = function(context) {
                    return "<p>" + context[valueKey] + "</p>";
                };
            }
            return renderFn;
        }
    }();
    var InputView = function() {
        function InputView(o) {
            var that = this;
            utils.bindAll(this);
            this.specialKeyCodeMap = {
                9: "tab",
                27: "esc",
                37: "left",
                39: "right",
                13: "enter",
                38: "up",
                40: "down"
            };
            this.$hint = $(o.hint);
            this.$input = $(o.input).on("blur.tt", this._handleBlur).on("focus.tt", this._handleFocus).on("keydown.tt", this._handleSpecialKeyEvent);
            if (!utils.isMsie()) {
                this.$input.on("input.tt", this._compareQueryToInputValue);
            } else {
                this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                    if (that.specialKeyCodeMap[$e.which || $e.keyCode]) {
                        return;
                    }
                    utils.defer(that._compareQueryToInputValue);
                });
            }
            this.query = this.$input.val();
            this.$overflowHelper = buildOverflowHelper(this.$input);
        }
        utils.mixin(InputView.prototype, EventTarget, {
            _handleFocus: function() {
                this.trigger("focused");
            },
            _handleBlur: function() {
                this.trigger("blured");
            },
            _handleSpecialKeyEvent: function($e) {
                var keyName = this.specialKeyCodeMap[$e.which || $e.keyCode];
                keyName && this.trigger(keyName + "Keyed", $e);
            },
            _compareQueryToInputValue: function() {
                var inputValue = this.getInputValue(), isSameQuery = compareQueries(this.query, inputValue), isSameQueryExceptWhitespace = isSameQuery ? this.query.length !== inputValue.length : false;
                if (isSameQueryExceptWhitespace) {
                    this.trigger("whitespaceChanged", {
                        value: this.query
                    });
                } else if (!isSameQuery) {
                    this.trigger("queryChanged", {
                        value: this.query = inputValue
                    });
                }
            },
            destroy: function() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$hint = this.$input = this.$overflowHelper = null;
            },
            focus: function() {
                this.$input.focus();
            },
            blur: function() {
                this.$input.blur();
            },
            getQuery: function() {
                return this.query;
            },
            setQuery: function(query) {
                this.query = query;
            },
            getInputValue: function() {
                return this.$input.val();
            },
            setInputValue: function(value, silent) {
                this.$input.val(value);
                !silent && this._compareQueryToInputValue();
            },
            getHintValue: function() {
                return this.$hint.val();
            },
            setHintValue: function(value) {
                this.$hint.val(value);
            },
            getLanguageDirection: function() {
                return (this.$input.css("direction") || "ltr").toLowerCase();
            },
            isOverflow: function() {
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() > this.$input.width();
            },
            isCursorAtEnd: function() {
                var valueLength = this.$input.val().length, selectionStart = this.$input[0].selectionStart, range;
                if (utils.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            }
        });
        return InputView;
        function buildOverflowHelper($input) {
            return $("<span></span>").css({
                position: "absolute",
                left: "-9999px",
                visibility: "hidden",
                whiteSpace: "nowrap",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function compareQueries(a, b) {
            a = (a || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
            b = (b || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
            return a === b;
        }
    }();
    var DropdownView = function() {
        var html = {
            suggestionsList: '<span class="tt-suggestions"></span>'
        }, css = {
            suggestionsList: {
                display: "block"
            },
            suggestion: {
                whiteSpace: "nowrap",
                cursor: "pointer"
            },
            suggestionChild: {
                whiteSpace: "normal"
            }
        };
        function DropdownView(o) {
            utils.bindAll(this);
            this.isOpen = false;
            this.isEmpty = true;
            this.isMouseOverDropdown = false;
            this.$menu = $(o.menu).on("mouseenter.tt", this._handleMouseenter).on("mouseleave.tt", this._handleMouseleave).on("click.tt", ".tt-suggestion", this._handleSelection).on("mouseover.tt", ".tt-suggestion", this._handleMouseover);
        }
        utils.mixin(DropdownView.prototype, EventTarget, {
            _handleMouseenter: function() {
                this.isMouseOverDropdown = true;
            },
            _handleMouseleave: function() {
                this.isMouseOverDropdown = false;
            },
            _handleMouseover: function($e) {
                var $suggestion = $($e.currentTarget);
                this._getSuggestions().removeClass("tt-is-under-cursor");
                $suggestion.addClass("tt-is-under-cursor");
            },
            _handleSelection: function($e) {
                var $suggestion = $($e.currentTarget);
                this.trigger("suggestionSelected", extractSuggestion($suggestion));
            },
            _show: function() {
                this.$menu.css("display", "block");
            },
            _hide: function() {
                this.$menu.hide();
            },
            _moveCursor: function(increment) {
                var $suggestions, $cur, nextIndex, $underCursor;
                if (!this.isVisible()) {
                    return;
                }
                $suggestions = this._getSuggestions();
                $cur = $suggestions.filter(".tt-is-under-cursor");
                $cur.removeClass("tt-is-under-cursor");
                nextIndex = $suggestions.index($cur) + increment;
                nextIndex = (nextIndex + 1) % ($suggestions.length + 1) - 1;
                if (nextIndex === -1) {
                    this.trigger("cursorRemoved");
                    return;
                } else if (nextIndex < -1) {
                    nextIndex = $suggestions.length - 1;
                }
                $underCursor = $suggestions.eq(nextIndex).addClass("tt-is-under-cursor");
                this._ensureVisibility($underCursor);
                this.trigger("cursorMoved", extractSuggestion($underCursor));
            },
            _getSuggestions: function() {
                return this.$menu.find(".tt-suggestions > .tt-suggestion");
            },
            _ensureVisibility: function($el) {
                var menuHeight = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10), menuScrollTop = this.$menu.scrollTop(), elTop = $el.position().top, elBottom = elTop + $el.outerHeight(true);
                if (elTop < 0) {
                    this.$menu.scrollTop(menuScrollTop + elTop);
                } else if (menuHeight < elBottom) {
                    this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
                }
            },
            destroy: function() {
                this.$menu.off(".tt");
                this.$menu = null;
            },
            isVisible: function() {
                return this.isOpen && !this.isEmpty;
            },
            closeUnlessMouseIsOverDropdown: function() {
                if (!this.isMouseOverDropdown) {
                    this.close();
                }
            },
            close: function() {
                if (this.isOpen) {
                    this.isOpen = false;
                    this.isMouseOverDropdown = false;
                    this._hide();
                    this.$menu.find(".tt-suggestions > .tt-suggestion").removeClass("tt-is-under-cursor");
                    this.trigger("closed");
                }
            },
            open: function() {
                if (!this.isOpen) {
                    this.isOpen = true;
                    !this.isEmpty && this._show();
                    this.trigger("opened");
                }
            },
            setLanguageDirection: function(dir) {
                var ltrCss = {
                    left: "0",
                    right: "auto"
                }, rtlCss = {
                    left: "auto",
                    right: " 0"
                };
                dir === "ltr" ? this.$menu.css(ltrCss) : this.$menu.css(rtlCss);
            },
            moveCursorUp: function() {
                this._moveCursor(-1);
            },
            moveCursorDown: function() {
                this._moveCursor(+1);
            },
            getSuggestionUnderCursor: function() {
                var $suggestion = this._getSuggestions().filter(".tt-is-under-cursor").first();
                return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
            },
            getFirstSuggestion: function() {
                var $suggestion = this._getSuggestions().first();
                return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
            },
            renderSuggestions: function(dataset, suggestions) {
                var datasetClassName = "tt-dataset-" + dataset.name, wrapper = '<div class="tt-suggestion">%body</div>', compiledHtml, $suggestionsList, $dataset = this.$menu.find("." + datasetClassName), elBuilder, fragment, $el;
                if ($dataset.length === 0) {
                    $suggestionsList = $(html.suggestionsList).css(css.suggestionsList);
                    $dataset = $("<div></div>").addClass(datasetClassName).append(dataset.header).append($suggestionsList).append(dataset.footer).appendTo(this.$menu);
                }
                if (suggestions.length > 0) {
                    this.isEmpty = false;
                    this.isOpen && this._show();
                    elBuilder = document.createElement("div");
                    fragment = document.createDocumentFragment();
                    utils.each(suggestions, function(i, suggestion) {
                        suggestion.dataset = dataset.name;
                        compiledHtml = dataset.template(suggestion.datum);
                        elBuilder.innerHTML = wrapper.replace("%body", compiledHtml);
                        $el = $(elBuilder.firstChild).css(css.suggestion).data("suggestion", suggestion);
                        $el.children().each(function() {
                            $(this).css(css.suggestionChild);
                        });
                        fragment.appendChild($el[0]);
                    });
                    $dataset.show().find(".tt-suggestions").html(fragment);
                } else {
                    this.clearSuggestions(dataset.name);
                }
                this.trigger("suggestionsRendered");
            },
            clearSuggestions: function(datasetName) {
                var $datasets = datasetName ? this.$menu.find(".tt-dataset-" + datasetName) : this.$menu.find('[class^="tt-dataset-"]'), $suggestions = $datasets.find(".tt-suggestions");
                $datasets.hide();
                $suggestions.empty();
                if (this._getSuggestions().length === 0) {
                    this.isEmpty = true;
                    this._hide();
                }
            }
        });
        return DropdownView;
        function extractSuggestion($el) {
            return $el.data("suggestion");
        }
    }();
    var TypeaheadView = function() {
        var html = {
            wrapper: '<span class="twitter-typeahead"></span>',
            hint: '<input class="tt-hint" type="text" autocomplete="off" spellcheck="off" disabled>',
            dropdown: '<span class="tt-dropdown-menu"></span>'
        }, css = {
            wrapper: {
                position: "relative",
                display: "inline-block"
            },
            hint: {
                position: "absolute",
                top: "0",
                left: "0",
                borderColor: "transparent",
                boxShadow: "none"
            },
            query: {
                position: "relative",
                verticalAlign: "top",
                backgroundColor: "transparent"
            },
            dropdown: {
                position: "absolute",
                top: "100%",
                left: "0",
                zIndex: "100",
                display: "none"
            }
        };
        if (utils.isMsie()) {
            utils.mixin(css.query, {
                backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
            });
        }
        if (utils.isMsie() && utils.isMsie() <= 7) {
            utils.mixin(css.wrapper, {
                display: "inline",
                zoom: "1"
            });
            utils.mixin(css.query, {
                marginTop: "-1px"
            });
        }
        function TypeaheadView(o) {
            var $menu, $input, $hint;
            utils.bindAll(this);
            this.$node = buildDomStructure(o.input);
            this.datasets = o.datasets;
            this.dir = null;
            this.eventBus = o.eventBus;
            $menu = this.$node.find(".tt-dropdown-menu");
            $input = this.$node.find(".tt-query");
            $hint = this.$node.find(".tt-hint");
            this.dropdownView = new DropdownView({
                menu: $menu
            }).on("suggestionSelected", this._handleSelection).on("cursorMoved", this._clearHint).on("cursorMoved", this._setInputValueToSuggestionUnderCursor).on("cursorRemoved", this._setInputValueToQuery).on("cursorRemoved", this._updateHint).on("suggestionsRendered", this._updateHint).on("opened", this._updateHint).on("closed", this._clearHint).on("opened closed", this._propagateEvent);
            this.inputView = new InputView({
                input: $input,
                hint: $hint
            }).on("focused", this._openDropdown).on("blured", this._closeDropdown).on("blured", this._setInputValueToQuery).on("enterKeyed tabKeyed", this._handleSelection).on("queryChanged", this._clearHint).on("queryChanged", this._clearSuggestions).on("queryChanged", this._getSuggestions).on("whitespaceChanged", this._updateHint).on("queryChanged whitespaceChanged", this._openDropdown).on("queryChanged whitespaceChanged", this._setLanguageDirection).on("escKeyed", this._closeDropdown).on("escKeyed", this._setInputValueToQuery).on("tabKeyed upKeyed downKeyed", this._managePreventDefault).on("upKeyed downKeyed", this._moveDropdownCursor).on("upKeyed downKeyed", this._openDropdown).on("tabKeyed leftKeyed rightKeyed", this._autocomplete);
        }
        utils.mixin(TypeaheadView.prototype, EventTarget, {
            _managePreventDefault: function(e) {
                var $e = e.data, hint, inputValue, preventDefault = false;
                switch (e.type) {
                  case "tabKeyed":
                    hint = this.inputView.getHintValue();
                    inputValue = this.inputView.getInputValue();
                    preventDefault = hint && hint !== inputValue;
                    break;

                  case "upKeyed":
                  case "downKeyed":
                    preventDefault = !$e.shiftKey && !$e.ctrlKey && !$e.metaKey;
                    break;
                }
                preventDefault && $e.preventDefault();
            },
            _setLanguageDirection: function() {
                var dir = this.inputView.getLanguageDirection();
                if (dir !== this.dir) {
                    this.dir = dir;
                    this.$node.css("direction", dir);
                    this.dropdownView.setLanguageDirection(dir);
                }
            },
            _updateHint: function() {
                var suggestion = this.dropdownView.getFirstSuggestion(), hint = suggestion ? suggestion.value : null, dropdownIsVisible = this.dropdownView.isVisible(), inputHasOverflow = this.inputView.isOverflow(), inputValue, query, escapedQuery, beginsWithQuery, match;
                if (hint && dropdownIsVisible && !inputHasOverflow) {
                    inputValue = this.inputView.getInputValue();
                    query = inputValue.replace(/\s{2,}/g, " ").replace(/^\s+/g, "");
                    escapedQuery = utils.escapeRegExChars(query);
                    beginsWithQuery = new RegExp("^(?:" + escapedQuery + ")(.*$)", "i");
                    match = beginsWithQuery.exec(hint);
                    this.inputView.setHintValue(inputValue + (match ? match[1] : ""));
                }
            },
            _clearHint: function() {
                this.inputView.setHintValue("");
            },
            _clearSuggestions: function() {
                this.dropdownView.clearSuggestions();
            },
            _setInputValueToQuery: function() {
                this.inputView.setInputValue(this.inputView.getQuery());
            },
            _setInputValueToSuggestionUnderCursor: function(e) {
                var suggestion = e.data;
                this.inputView.setInputValue(suggestion.value, true);
            },
            _openDropdown: function() {
                this.dropdownView.open();
            },
            _closeDropdown: function(e) {
                this.dropdownView[e.type === "blured" ? "closeUnlessMouseIsOverDropdown" : "close"]();
            },
            _moveDropdownCursor: function(e) {
                var $e = e.data;
                if (!$e.shiftKey && !$e.ctrlKey && !$e.metaKey) {
                    this.dropdownView[e.type === "upKeyed" ? "moveCursorUp" : "moveCursorDown"]();
                }
            },
            _handleSelection: function(e) {
                var byClick = e.type === "suggestionSelected", suggestion = byClick ? e.data : this.dropdownView.getSuggestionUnderCursor();
                if (suggestion) {
                    this.inputView.setInputValue(suggestion.value);
                    byClick ? this.inputView.focus() : e.data.preventDefault();
                    byClick && utils.isMsie() ? utils.defer(this.dropdownView.close) : this.dropdownView.close();
                    this.eventBus.trigger("selected", suggestion.datum, suggestion.dataset);
                }
            },
            _getSuggestions: function() {
                var that = this, query = this.inputView.getQuery();
                if (utils.isBlankString(query)) {
                    return;
                }
                utils.each(this.datasets, function(i, dataset) {
                    dataset.getSuggestions(query, function(suggestions) {
                        if (query === that.inputView.getQuery()) {
                            that.dropdownView.renderSuggestions(dataset, suggestions);
                        }
                    });
                });
            },
            _autocomplete: function(e) {
                var isCursorAtEnd, ignoreEvent, query, hint, suggestion;
                if (e.type === "rightKeyed" || e.type === "leftKeyed") {
                    isCursorAtEnd = this.inputView.isCursorAtEnd();
                    ignoreEvent = this.inputView.getLanguageDirection() === "ltr" ? e.type === "leftKeyed" : e.type === "rightKeyed";
                    if (!isCursorAtEnd || ignoreEvent) {
                        return;
                    }
                }
                query = this.inputView.getQuery();
                hint = this.inputView.getHintValue();
                if (hint !== "" && query !== hint) {
                    suggestion = this.dropdownView.getFirstSuggestion();
                    this.inputView.setInputValue(suggestion.value);
                    this.eventBus.trigger("autocompleted", suggestion.datum, suggestion.dataset);
                }
            },
            _propagateEvent: function(e) {
                this.eventBus.trigger(e.type);
            },
            destroy: function() {
                this.inputView.destroy();
                this.dropdownView.destroy();
                destroyDomStructure(this.$node);
                this.$node = null;
            },
            setQuery: function(query) {
                this.inputView.setQuery(query);
                this.inputView.setInputValue(query);
                this._clearHint();
                this._clearSuggestions();
                this._getSuggestions();
            }
        });
        return TypeaheadView;
        function buildDomStructure(input) {
            var $wrapper = $(html.wrapper), $dropdown = $(html.dropdown), $input = $(input), $hint = $(html.hint);
            $wrapper = $wrapper.css(css.wrapper);
            $dropdown = $dropdown.css(css.dropdown);
            $hint.css(css.hint).css({
                backgroundAttachment: $input.css("background-attachment"),
                backgroundClip: $input.css("background-clip"),
                backgroundColor: $input.css("background-color"),
                backgroundImage: $input.css("background-image"),
                backgroundOrigin: $input.css("background-origin"),
                backgroundPosition: $input.css("background-position"),
                backgroundRepeat: $input.css("background-repeat"),
                backgroundSize: $input.css("background-size")
            });
            $input.data("ttAttrs", {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass("tt-query").attr({
                autocomplete: "off",
                spellcheck: false
            }).css(css.query);
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input.wrap($wrapper).parent().prepend($hint).append($dropdown);
        }
        function destroyDomStructure($node) {
            var $input = $node.find(".tt-query");
            utils.each($input.data("ttAttrs"), function(key, val) {
                utils.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.detach().removeData("ttAttrs").removeClass("tt-query").insertAfter($node);
            $node.remove();
        }
    }();
    (function() {
        var cache = {}, viewKey = "ttView", methods;
        methods = {
            initialize: function(datasetDefs) {
                var datasets;
                datasetDefs = utils.isArray(datasetDefs) ? datasetDefs : [ datasetDefs ];
                if (datasetDefs.length === 0) {
                    $.error("no datasets provided");
                }
                datasets = utils.map(datasetDefs, function(o) {
                    var dataset = cache[o.name] ? cache[o.name] : new Dataset(o);
                    if (o.name) {
                        cache[o.name] = dataset;
                    }
                    return dataset;
                });
                return this.each(initialize);
                function initialize() {
                    var $input = $(this), deferreds, eventBus = new EventBus({
                        el: $input
                    });
                    deferreds = utils.map(datasets, function(dataset) {
                        return dataset.initialize();
                    });
                    $input.data(viewKey, new TypeaheadView({
                        input: $input,
                        eventBus: eventBus = new EventBus({
                            el: $input
                        }),
                        datasets: datasets
                    }));
                    $.when.apply($, deferreds).always(function() {
                        utils.defer(function() {
                            eventBus.trigger("initialized");
                        });
                    });
                }
            },
            destroy: function() {
                return this.each(destroy);
                function destroy() {
                    var $this = $(this), view = $this.data(viewKey);
                    if (view) {
                        view.destroy();
                        $this.removeData(viewKey);
                    }
                }
            },
            setQuery: function(query) {
                return this.each(setQuery);
                function setQuery() {
                    var view = $(this).data(viewKey);
                    view && view.setQuery(query);
                }
            }
        };
        jQuery.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
    })();
})(window.jQuery);