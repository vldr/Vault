(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{31:function(e,t,n){e.exports=function(){"use strict";class e{constructor(e){this.instances=[],this.state=e}register(e){this.instances.push(e)}deregister(e){const t=this.instances.indexOf(e);-1!==t&&this.instances.splice(t,1)}syncState(e){this.state=e,this.instances.forEach(t=>{t._superSetState(e)})}}return t=>{let n;return class extends t{constructor(t){super(t),n||(n=new e(this.state)),this.state=n.state,this._superSetState=super.setState}componentDidMount(){n.register(this),super.componentDidMount&&super.componentDidMount()}componentWillUnmount(){n.deregister(this),super.componentWillUnmount&&super.componentWillUnmount()}setState(e,t){super.setState(e,()=>{n.syncState(this.state),t&&t()})}}}}()},4:function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));n(0);var o=n(3),a=n.n(o);var r=function e(t){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),a()(t,{buttons:!1})}},51:function(e,t,n){"use strict";n.r(t);var o=n(0),a=n.n(o),r=n(54),s=n.n(r),i=n(3),c=n.n(i);n(31);function l(e){return(l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function u(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function f(e,t){return!t||"object"!==l(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function p(e){return(p=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t){return(h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var m=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=f(this,p(t).call(this,e))).state={sort:1},n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t)}(t,e),n=t,(o=[{key:"setVisualSort",value:function(e){this.setState({sort:e})}},{key:"getSelectedStyle",value:function(e){var t=this.state.sort;return Math.abs(t)===e?{fontWeight:"600",paddingLeft:"10px",marginLeft:"3px",background:t>0?"url(images/ui/arrow-up.svg) 0px center / 11px no-repeat":"url(images/ui/arrow.svg) 0px center / 11px no-repeat"}:{}}},{key:"setSort",value:function(e,t){var n=this,o=this.state.sort;c()(a.a.createElement("center",null,a.a.createElement("div",{className:s.a.loader})),{buttons:!1,closeOnClickOutside:!1}),Math.abs(e)===Math.abs(o)?e*=Math.sign(-this.state.sort):e*=Math.sign(this.state.sort),fetch("process/sortby",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"sortby=".concat(encodeURIComponent(e))}).then((function(e){return e.json()})).then((function(t){c.a.close(),window.sort=e,n.setState({sort:e})}),(function(e){c()(e.message,{buttons:!1})}))}},{key:"render",value:function(){return this.props.disabled?null:(this.state.sort,a.a.createElement(a.a.Fragment,null,a.a.createElement("a",{className:s.a["sorting-option"],style:this.getSelectedStyle(2),onClick:this.setSort.bind(this,2,!1)},"Name"),a.a.createElement("a",{className:s.a["sorting-option"],style:this.getSelectedStyle(1),onClick:this.setSort.bind(this,1,!1)},"Size"),a.a.createElement("a",{className:s.a["sorting-option"],style:this.getSelectedStyle(3),onClick:this.setSort.bind(this,3,!1)},"Date"),a.a.createElement("a",{className:s.a["sorting-option"],style:this.getSelectedStyle(4),onClick:this.setSort.bind(this,4,!1)},"Type")))}}])&&u(n.prototype,o),r&&u(n,r),t}(a.a.Component),d=n(4);function y(e){return(y="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function b(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function w(e,t){return!t||"object"!==y(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function v(e){return(v=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e,t){return(g=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var E=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=w(this,v(t).call(this,e))).state={finished:!1,error:null,response:null,action:0},n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&g(e,t)}(t,e),n=t,(o=[{key:"componentDidMount",value:function(){this.onLoad()}},{key:"onUpdatePassword",value:function(){var e=this;this.setState({action:1}),setTimeout((function(){return e.currentPassword.focus()}),100)}},{key:"onUpdateName",value:function(){var e=this;this.setState({action:2}),setTimeout((function(){return e.name.focus()}),100)}},{key:"onGoBack",value:function(){this.setState({action:0})}},{key:"downloadShareXConfig",value:function(){if(this.state.response&&this.state.response.apiEnabled){var e=window.location.href.substr(0,window.location.href.lastIndexOf("/")+1),t='{"Name": "Vault", \n                "DestinationType": "ImageUploader, TextUploader, FileUploader",\n                "RequestURL": "'.concat(e,'share/upload",\n                "FileFormName": "file",\n                "Arguments": {"apikey": "').concat(this.state.response.apiKey,'"}, \n                "URL": "$json:path$"}');t=t.replace(/\s/g,"");var n=document.createElement("a");n.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(t)),n.setAttribute("download","sharex.".concat(this.state.response.name.toLowerCase(),".sxcu")),n.style.display="none",document.body.appendChild(n),n.click(),document.body.removeChild(n)}}},{key:"onLoad",value:function(){var e=this;this.setState({finished:!1,response:null,error:null,action:0}),fetch("process/settings",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then((function(e){return e.json()})).then((function(t){t.success?e.setState({response:t,finished:!0}):e.setState({error:t.reason,finished:!0})}),(function(t){e.setState({error:t.message,finished:!0})}))}},{key:"updatePassword",value:function(){var e=this;this.setState({finished:!1,response:null,error:null,action:0}),fetch("process/changepassword",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"currentPassword=".concat(encodeURIComponent(this.currentPassword.value),"&newPassword=").concat(encodeURIComponent(this.newPassword.value))}).then((function(e){return e.json()})).then((function(t){t.success?e.onLoad():e.setState({error:t.reason,finished:!0})}),(function(t){e.setState({error:t.message,finished:!0})}))}},{key:"updateName",value:function(){var e=this;this.setState({finished:!1,response:null,error:null,action:0}),fetch("process/changename",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"name=".concat(encodeURIComponent(this.name.value))}).then((function(e){return e.json()})).then((function(t){t.success?e.onLoad():e.setState({error:t.reason,finished:!0})}),(function(t){e.setState({error:t.message,finished:!0})}))}},{key:"disableAPI",value:function(){var e=this;this.setState({finished:!1,response:null,error:null,action:0}),fetch("process/toggleapi",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then((function(e){return e.json()})).then((function(t){t.success?e.onLoad():e.setState({error:t.reason,finished:!0})}),(function(t){e.setState({error:t.message,finished:!0})}))}},{key:"render",value:function(){var e=this,t=this.state.finished?null:a.a.createElement("center",null,a.a.createElement("div",{className:s.a.loader})),n=1===this.state.action&&!this.state.error&&this.state.finished?a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Change Password"),a.a.createElement("div",{className:s.a["warning-message"]},a.a.createElement("p",null,"Please specify your current password:"),a.a.createElement("input",{type:"password",ref:function(t){e.currentPassword=t},onKeyDown:function(t){"Enter"===t.key&&e.newPassword.focus()}}),a.a.createElement("p",null,"Please specify a new password:"),a.a.createElement("input",{type:"password",ref:function(t){e.newPassword=t},onKeyDown:function(t){"Enter"===t.key&&e.updatePassword()}})),a.a.createElement("button",{className:s.a.button,onClick:this.updatePassword.bind(this)},"Change"),a.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.onGoBack.bind(this)},"Close")):null,o=2===this.state.action&&!this.state.error&&this.state.finished?a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Change Name"),a.a.createElement("div",{className:s.a["warning-message"]},a.a.createElement("p",null,"Please specify a new name:"),a.a.createElement("input",{type:"text",placeholder:"John",ref:function(t){e.name=t},defaultValue:this.state.response.name,onKeyDown:function(t){"Enter"===t.key&&e.updateName()}})),a.a.createElement("button",{className:s.a.button,onClick:this.updateName.bind(this)},"Change"),a.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.onGoBack.bind(this)},"Close")):null,r=0===this.state.action&&!this.state.error&&this.state.finished?a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Settings"),a.a.createElement("div",{className:s.a["warning-message"]},a.a.createElement("h3",null,"Name: "),a.a.createElement("span",null,this.state.response.name," ",a.a.createElement("img",{src:"images/pencil.svg",className:s.a["edit-button"],onClick:this.onUpdateName.bind(this)})),a.a.createElement("h3",null,"Password: "),a.a.createElement("span",null,"••••••••••  ",a.a.createElement("img",{src:"images/pencil.svg",className:s.a["edit-button"],onClick:this.onUpdatePassword.bind(this)})),a.a.createElement("h3",null,"Storage: "),a.a.createElement("span",null,this.state.response.storage),a.a.createElement("h3",null,"API: "),a.a.createElement("span",null,this.state.response.apiEnabled?a.a.createElement("div",null,a.a.createElement("p",null,"Your API is currently enabled, ",a.a.createElement("a",{onClick:this.disableAPI.bind(this)},"click here")," to disable API..."),a.a.createElement("div",{className:s.a["api-box"]},this.state.response.apiKey,a.a.createElement("img",{className:s.a.sharex,src:"images/sharex.svg",onClick:this.downloadShareXConfig.bind(this)}))):a.a.createElement("div",null,a.a.createElement("p",null,"Your API is currently disabled, ",a.a.createElement("a",{onClick:this.disableAPI.bind(this)},"click here")," to enable API..."))))):null,i=this.state.error&&this.state.finished?a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Error!"),a.a.createElement("div",{className:s.a["warning-message"]},this.state.error)):null;return a.a.createElement("div",null,t,r,n,o,i)}}])&&b(n.prototype,o),r&&b(n,r),t}(a.a.Component);function S(e){return(S="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function k(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function O(e,t){return!t||"object"!==S(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function C(e){return(C=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function N(e,t){return(N=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var P=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=O(this,C(t).call(this,e))).state={started:!1,error:null,finished:!1},n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&N(e,t)}(t,e),n=t,(o=[{key:"componentDidMount",value:function(){var e=this;setTimeout((function(){return e.newName.focus()}),100)}},{key:"close",value:function(){c.a.close()}},{key:"onClick",value:function(){var e=this;this.setState({started:!0}),fetch("process/newfolder",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"foldername=".concat(encodeURIComponent(this.newName.value))}).then((function(e){return e.json()})).then((function(t){t.success?c.a.close():e.setState({finished:!0,error:t.reason})}),(function(t){e.setState({finished:!0,error:t.message})}))}},{key:"render",value:function(){var e=this,t=this.state.started&&!this.state.finished?a.a.createElement("center",null,a.a.createElement("div",{className:s.a.loader})):null,n=this.state.started||this.state.finished?null:a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"New Folder"),a.a.createElement("div",{className:s.a["warning-message"]},a.a.createElement("p",null,"Please specify a name for your new folder:"),a.a.createElement("input",{type:"text",ref:function(t){e.newName=t},onKeyDown:function(t){"Enter"===t.key&&e.onClick()}})),a.a.createElement("button",{className:s.a.button,onClick:this.onClick.bind(this)},"Create"),a.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.close.bind(this)},"Close")),o=this.state.finished&&this.state.error?a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Error!"),a.a.createElement("div",{className:s.a["warning-message"]},this.state.error)):null;return a.a.createElement("div",null,t,n,o)}}])&&k(n.prototype,o),r&&k(n,r),t}(a.a.Component);function j(e){return(j="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function x(e,t){return!t||"object"!==j(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function T(e){return(T=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function U(e,t){return(U=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var I=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),x(this,T(t).apply(this,arguments))}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&U(e,t)}(t,e),n=t,(o=[{key:"close",value:function(){swal.close()}},{key:"onClick",value:function(){window.location.href="process/logout"}},{key:"render",value:function(){return a.a.createElement("div",null,a.a.createElement("div",{className:s.a["warning-title"]},"Logout"),a.a.createElement("div",{className:s.a["warning-message"]},a.a.createElement("p",null,"Performing this action will log you out of your account...")),a.a.createElement("button",{className:s.a.button,onClick:this.onClick.bind(this)},"Logout"),a.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.close.bind(this)},"Close"))}}])&&_(n.prototype,o),r&&_(n,r),t}(a.a.Component);function L(e){return(L="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function R(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function M(e,t){return!t||"object"!==L(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function A(e){return(A=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function D(e,t){return(D=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var F=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=M(this,A(t).call(this,e))).state={isSortOpen:!1},n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&D(e,t)}(t,e),n=t,(o=[{key:"openSettings",value:function(){new d.a(a.a.createElement(E,null))}},{key:"openNewFolder",value:function(){new d.a(a.a.createElement(P,null))}},{key:"openLogout",value:function(){new d.a(a.a.createElement(I,null))}},{key:"openSort",value:function(){this.setState({isSortOpen:!0}),this.sortBar.setVisualSort(window.sort)}},{key:"closeSort",value:function(){this.setState({isSortOpen:!1})}},{key:"openSearch",value:function(){this.props.openSearch()}},{key:"render",value:function(){var e=this,t=this.state.isSortOpen?s.a.btnSortOpen:"",n=this.state.isSortOpen?{opacity:"0",margin:"0",width:"0"}:{};return a.a.createElement("div",{className:s.a.topbar},a.a.createElement("span",{className:s.a.logo},a.a.createElement("img",{src:"images/ui/logo.svg"})),a.a.createElement("div",{className:s.a.btnSettings,onClick:this.openSettings.bind(this)}),a.a.createElement("div",{className:s.a.btnLogout,onClick:this.openLogout.bind(this)}),a.a.createElement("div",{className:s.a.btnHelp,onClick:this.openSearch.bind(this)}),a.a.createElement("div",{className:s.a.btnNewFolder,onClick:this.openNewFolder.bind(this)}),a.a.createElement("div",{className:"".concat(s.a.btnSort," ").concat(t),onTouchStart:this.openSort.bind(this),onMouseEnter:this.openSort.bind(this),onMouseLeave:this.closeSort.bind(this)},a.a.createElement("img",{className:s.a["sorting-arrow"],style:n,src:"images/ui/sort.svg"}),a.a.createElement(m,{ref:function(t){return e.sortBar=t}})),a.a.createElement("div",{className:s.a.btnUpload}),a.a.createElement("div",{className:s.a["topbar-hider"]}))}}])&&R(n.prototype,o),r&&R(n,r),t}(a.a.Component);t.default=F}}]);