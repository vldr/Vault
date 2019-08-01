(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{4:function(e,t,n){"use strict";n.d(t,"a",function(){return s});n(0);var a=n(3),o=n.n(a);var s=function e(t){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),o()(t,{buttons:!1})}},53:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),s=n(42),r=n.n(s),i=n(55),c=n.n(i),l=n(4),u=n(3),p=n.n(u);function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function d(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function m(e,t){return!t||"object"!==f(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function h(e){return(h=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function y(e,t){return(y=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var b=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=m(this,h(t).call(this,e))).state={view:0},n}var n,a,s;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&y(e,t)}(t,o.a.Component),n=t,(a=[{key:"close",value:function(){p.a.close()}},{key:"upload",value:function(){var e=this;this.close(),this.props.zone.files.forEach(function(t){"queued"===t.status&&(e.props.zone.options.params={},e.props.zone.processFile(t))})}},{key:"uploadAndEncrypt",value:function(){var e=this;this.password.value&&(this.password.focus(),this.close(),this.props.zone.files.forEach(function(t){"queued"===t.status&&(e.props.zone.options.params={password:e.password.value},e.props.zone.processFile(t))}))}},{key:"changeView",value:function(e){this.setState({view:e})}},{key:"render",value:function(){var e=this,t=0===this.state.view&&o.a.createElement("div",{style:{display:"flex"}},o.a.createElement("div",{className:c.a["upload-selection-button"],onClick:this.upload.bind(this)},o.a.createElement("div",{className:c.a["upload-file-icon"]}),o.a.createElement("h3",null,"Upload"),o.a.createElement("p",null,"Uploading without encryption provides more features but is less secure against possible threats.")),o.a.createElement("div",{className:c.a["upload-selection-button"],onClick:this.changeView.bind(this,1)},o.a.createElement("div",{className:c.a["lock-file-icon"]}),o.a.createElement("h3",null,"Upload and Encrypt"),o.a.createElement("p",null,"Uploading and encrypting disables previews but is a lot more secure against possible threats."))),n=1===this.state.view&&o.a.createElement("div",null,o.a.createElement("div",{className:c.a["lock-file-icon"]}),o.a.createElement("div",{className:c.a["warning-title"]},"Encrypt File(s)"),o.a.createElement("div",{className:c.a["warning-message"]},o.a.createElement("p",null,"Please type a strong password to encrypt your file(s):",o.a.createElement("br",null),o.a.createElement("i",null,"(note: if you're uploading multiple files this password will apply to all of them)")),o.a.createElement("input",{type:"password",style:{fontSize:"20px"},ref:function(t){e.password=t},onKeyDown:function(t){"Enter"===t.key&&e.uploadAndEncrypt()}})),o.a.createElement("button",{className:c.a.button,onClick:this.uploadAndEncrypt.bind(this)},"Encrypt"),o.a.createElement("button",{className:c.a.button+" "+c.a.inverse,onClick:this.changeView.bind(this,0)},"Go Back"));return o.a.createElement("div",null,n,t)}}])&&d(n.prototype,a),s&&d(n,s),t}();function v(e){return(v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function g(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function w(e){return(w=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function E(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function k(e,t){return(k=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var S=function(e){function t(e){var n,a,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),a=this,o=w(t).call(this,e),(n=!o||"object"!==v(o)&&"function"!=typeof o?E(a):o).state={uploading:!1,finished:!1,fileName:null,success:!1,status:"",uploadedItems:0,progress:0,initialized:!1},n.componentConfig={postUrl:"process/upload"},n.djsConfig={autoProcessQueue:!1,clickable:".".concat(c.a.btnUpload),parallelUploads:1,previewsContainer:!1,params:{}},n.eventHandlers={init:function(e){return n.zone=e},addedfile:n.processFile.bind(E(n)),processing:function(e){return n.setState({uploading:!0,finished:!1,success:!1,progress:0,status:"Uploading ".concat(e.name)})},totaluploadprogress:function(e,t,a){return n.setState({progress:e})},error:function(e,t){return n.setState({uploading:!0,finished:!0,success:!1,status:"Failed to upload ".concat(e.name,"...")})},complete:function(e){n.state.finished||n.setState({uploading:!0,finished:!0,uploadedItems:n.state.uploadedItems+1,success:!0,status:0===n.state.uploadedItems?"Successfully uploaded ".concat(e.name,"..."):"Uploaded ".concat(n.state.uploadedItems+1," files...")})}},n}var n,a,s;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&k(e,t)}(t,o.a.Component),n=t,(a=[{key:"componentDidMount",value:function(){document.documentElement.ondragover=function(e){e.preventDefault(),e.stopPropagation()},document.documentElement.ondragenter=function(e){e.preventDefault(),e.stopPropagation()},document.documentElement.ondrop=function(e){e.preventDefault(),document.querySelector("body > input").files=e.dataTransfer.files,document.querySelector("body > input").dispatchEvent(new Event("change"))}}},{key:"componentWillUnmount",value:function(){document.documentElement.ondragover=void 0,document.documentElement.ondragenter=void 0,document.documentElement.ondrop=void 0}},{key:"processFile",value:function(){var e=this;new l.a(o.a.createElement(b,{zone:this.zone})).then(function(){return e.zone.files=[]})}},{key:"start",value:function(){this.setState({initialized:!0})}},{key:"render",value:function(){var e={width:"".concat(this.state.progress,"%")};this.state.finished&&!this.state.success?e={borderColor:"#c14141",width:"".concat(this.state.progress,"%")}:this.state.finished&&this.state.success&&(e={borderColor:"#7ac142",width:"".concat(this.state.progress,"%")});var t=this.state.uploading?o.a.createElement("div",{className:c.a["snack-bar-progress"],style:e}):null,n=this.state.uploading?o.a.createElement("div",{className:c.a["snack-bar-text"]},this.state.status):null,a=this.state.finished&&!this.state.success?o.a.createElement("svg",{className:c.a["snack-bar-x"],xmlns:"http://www.w3.org/2000/svg",viewBox:"-81 -80 350 350"},o.a.createElement("path",{className:c.a["snack-bar-x-check"],d:"M180.607,10.607l-79.696,79.697l79.696,79.697L170,180.607l-79.696-79.696l-79.696,79.696L0,170.001l79.696-79.697L0,10.607\r L10.607,0.001l79.696,79.696L170,0.001L180.607,10.607z"})):null,s=this.state.finished&&this.state.success?o.a.createElement("svg",{className:c.a["snack-bar-checkmark"],xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 52 52"},o.a.createElement("circle",{className:c.a["snack-bar-checkmark-circle"],cx:"26",cy:"26",r:"25",fill:"none"}),o.a.createElement("path",{className:c.a["snack-bar-checkmark-check"],fill:"none",d:"M14.1 27.2l7.1 7.2 16.7-16.8"})):null,i=this.state.uploading&&!this.state.finished?o.a.createElement("div",{className:c.a["snack-bar-loader"]}):null,l=this.state.finished?{animation:"fadeout 0.6s ease-out 2s 1 normal forwards running"}:{},u=this.state.uploading?o.a.createElement("div",{className:c.a["snack-bar-upload"],style:l},i,a,s,n,t):null;return o.a.createElement(o.a.Fragment,null,this.state.initialized&&o.a.createElement(r.a,{className:"dropzone",config:this.componentConfig,eventHandlers:this.eventHandlers,djsConfig:this.djsConfig}),u)}}])&&g(n.prototype,a),s&&g(n,s),t}();t.default=S}}]);