(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{14:function(e,t,n){"use strict";n.d(t,"a",function(){return m});var o=n(0),r=n.n(o),a=n(3),i=n.n(a),c=n(54),s=n.n(c);function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function l(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function f(e,t){return!t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function p(e){return(p=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function y(e,t){return(y=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var m=function(e){function t(e){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),f(this,p(t).call(this,e))}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&y(e,t)}(t,r.a.Component),n=t,(o=[{key:"componentDidMount",value:function(){var e=this;setTimeout(function(){return e.password.focus()},100)}},{key:"close",value:function(){i.a.close()}},{key:"onClick",value:function(){if(this.password.value){var e=document.createElement("form");e.method="POST",e.action=this.props.action;var t=document.createElement("input");t.setAttribute("name","password"),t.setAttribute("value",this.password.value),t.setAttribute("type","hidden"),e.appendChild(t),document.body.appendChild(e),e.submit(),document.body.removeChild(e),i.a.close()}}},{key:"render",value:function(){var e=this,t=r.a.createElement("div",null,r.a.createElement("div",{className:s.a["unlock-file-icon"]}),r.a.createElement("div",{className:s.a["warning-title"]},"Decrypt File"),r.a.createElement("div",{className:s.a["warning-message"]},r.a.createElement("p",null,"Please enter the password of this file to download it:"),r.a.createElement("input",{type:"password",style:{fontSize:"20px"},ref:function(t){e.password=t},onKeyDown:function(t){"Enter"===t.key&&e.onClick()}})),r.a.createElement("button",{className:s.a.button,onClick:this.onClick.bind(this)},"Download"),r.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.close.bind(this)},"Close"));return r.a.createElement("div",null,t)}}])&&l(n.prototype,o),a&&l(n,a),t}()},20:function(e,t,n){"use strict";n.d(t,"a",function(){return p});var o=n(0),r=n.n(o),a=n(54),i=n.n(a);function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function u(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),u(this,l(t).apply(this,arguments))}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,r.a.Component),n=t,(o=[{key:"render",value:function(){if(!this.props.view)return null;var e=this.props.view,t="".concat(e.relativeURL).concat(e.url);return r.a.createElement("img",{src:t,className:i.a["overlay-preview"]})}}])&&s(n.prototype,o),a&&s(n,a),t}()},21:function(e,t,n){"use strict";n.d(t,"a",function(){return p});var o=n(0),r=n.n(o),a=n(54),i=n.n(a);function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function u(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),u(this,l(t).apply(this,arguments))}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,r.a.Component),n=t,(o=[{key:"render",value:function(){if(!this.props.view)return null;var e=this.props.view,t="".concat(e.relativeURL).concat(e.url);return r.a.createElement("audio",{controls:!0,src:t,className:i.a["overlay-preview"]})}}])&&s(n.prototype,o),a&&s(n,a),t}()},22:function(e,t,n){"use strict";n.d(t,"a",function(){return p});var o=n(0),r=n.n(o),a=n(54),i=n.n(a);function c(e){return(c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function u(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),u(this,l(t).apply(this,arguments))}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,r.a.Component),n=t,(o=[{key:"render",value:function(){if(!this.props.view)return null;var e=this.props.view,t="".concat(e.relativeURL).concat(e.url);return r.a.createElement(r.a.Fragment,null,r.a.createElement("video",{className:i.a["overlay-preview"],controls:!0},r.a.createElement("source",{src:t,type:"video/mp4"}),r.a.createElement("source",{src:t,type:"video/ogg"})))}}])&&s(n.prototype,o),a&&s(n,a),t}()},4:function(e,t,n){"use strict";n.d(t,"a",function(){return a});n(0);var o=n(3),r=n.n(o);var a=function e(t){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),r()(t,{buttons:!1})}},45:function(e,t,n){"use strict";n.r(t);var o=n(0),r=n.n(o),a=n(54),i=n.n(a),c=n(4),s=n(20),u=n(21),l=n(22),f=n(14);function p(e){return(p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function m(e,t){return!t||"object"!==p(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function b(e){return(b=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function d(e,t){return(d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var h=r.a.lazy(function(){return Promise.all([n.e(3),n.e(4)]).then(n.bind(null,32))}),v=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=m(this,b(t).call(this,e))).state={isOpen:!1,isLoading:!1,response:null},n}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t)}(t,r.a.Component),n=t,(o=[{key:"componentDidMount",value:function(){this.props.id&&this.onOpenWithShareId(this.props.id)}},{key:"onOpen",value:function(e){var t=this;this.props.closeSearch&&this.props.closeSearch(),this.setState({isOpen:!0,isLoading:!0}),fetch("process/viewer",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"fileid=".concat(encodeURIComponent(e))}).then(function(e){return e.json()}).then(function(e){e.success?t.setState({response:e,isLoading:!1}):(t.setState({isLoading:!1}),new c.a(r.a.createElement("p",null,e.reason)),t.close())},function(e){t.setState({isLoading:!1}),new c.a(r.a.createElement("p",null,e.message)),t.close()})}},{key:"onOpenWithShareId",value:function(e){var t=this;this.setState({isOpen:!0,isLoading:!0}),fetch("viewer",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"shareid=".concat(encodeURIComponent(e))}).then(function(e){return e.json()}).then(function(e){e.success?t.setState({response:e,isLoading:!1}):(t.setState({isLoading:!1}),new c.a(r.a.createElement("p",null,e.reason)))},function(e){t.setState({isLoading:!1}),new c.a(r.a.createElement("p",null,e.message))})}},{key:"downloadEncryptedFile",value:function(){new c.a(r.a.createElement(f.a,{action:this.state.response.relativeURL+this.state.response.url}))}},{key:"downloadFile",value:function(){var e=document.createElement("form");e.method="POST",e.action=this.state.response.relativeURL+this.state.response.url,document.body.appendChild(e),e.submit(),document.body.removeChild(e)}},{key:"render",value:function(){var e=!this.state.isLoading&&this.state.response,t=r.a.createElement("div",{className:i.a.loader}),n=(r.a.createElement("div",{className:i.a["intro-box"]},r.a.createElement("img",{src:"../images/ui/logo.svg"})),e?r.a.createElement("div",{className:i.a["share-overlay-topbar"]},r.a.createElement("img",{src:this.state.response.relativeURL+this.state.response.icon}),r.a.createElement("div",{className:i.a["overlay-topbar-text"]},this.state.response.name),this.state.response.isEncrypted&&r.a.createElement("div",{className:i.a["file-locked"]}),r.a.createElement("div",{className:i.a["overlay-topbar-right"]},r.a.createElement("div",{className:i.a["btn-download-viewer"],onClick:this.state.response.isEncrypted?this.downloadEncryptedFile.bind(this):this.downloadFile.bind(this)}))):null),o=r.a.createElement("div",{className:i.a["overlay-message"]},"No preview available");if(e&&!this.state.response.isEncrypted)switch(this.state.response.action){case"1":o=r.a.createElement(s.a,{view:this.state.response});break;case"2":o=r.a.createElement(l.a,{view:this.state.response});break;case"3":o=r.a.createElement(h,{view:this.state.response});break;case"4":o=r.a.createElement(u.a,{view:this.state.response})}return r.a.createElement("div",{className:i.a["share-overlay"]},r.a.createElement("div",{className:i.a["share-view"]},r.a.createElement(r.a.Suspense,{fallback:t},n,e&&o)))}}])&&y(n.prototype,o),a&&y(n,a),t}();t.default=v}}]);