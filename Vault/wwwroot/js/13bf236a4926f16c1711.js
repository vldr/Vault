(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{12:function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},44:function(e,t,n){"use strict";n.r(t);var o=n(0),i=n.n(o),a=n(56),s=n.n(a);function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function u(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function m(e,t){return(m=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var h=n(33),d=function(e){function t(e){var n,o,i;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),o=this,(n=!(i=l(t).call(this,e))||"object"!==r(i)&&"function"!=typeof i?u(o):i).state={isLoading:!0,isLoggedIn:!1,isRegistering:!1,name:null,error:null},n.onHashBang=n.onHashBang.bind(u(n)),n}var n,o,a;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&m(e,t)}(t,e),n=t,(o=[{key:"componentDidMount",value:function(){var e=this;this.connection=(new h.HubConnectionBuilder).withUrl("notifications").configureLogging(h.LogLevel.Information).build(),this.connection.on("LoginResponse",(function(t){t.success?e.setState({isLoading:!1,isLoggedIn:!0,name:t.name}):e.setState({isLoading:!1})})),this.connection.start().catch((function(t){e.setState({isLoading:!1,error:t.toString()})})),window.onhashchange=this.onHashBang}},{key:"componentWillUnmount",value:function(){window.onhashchange=null}},{key:"onOpen",value:function(){window.location="dashboard"}},{key:"onHashBang",value:function(e){e.newURL.includes("#register")&&(this.state.isLoading||this.state.isLoggedIn||(history.replaceState(null,null," "),this.username.focus(),this.setState({isRegistering:!0})))}},{key:"toggleForm",value:function(e){e.preventDefault(),this.setState({isRegistering:!this.state.isRegistering})}},{key:"onRegister",value:function(e){var t=this;e.preventDefault(),this.rememberMe.checked?(this.setState({isLoading:!0}),fetch("register",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"email=".concat(encodeURIComponent(this.username.value))+"&password=".concat(encodeURIComponent(this.password.value))+"&name=".concat(encodeURIComponent(this.name.value))+"&invite=".concat(encodeURIComponent(this.invitekey.value))}).then((function(e){return e.json()})).then((function(e){e.success?t.setState({isLoading:!1,isRegistering:!1}):t.setState({isLoading:!1,error:e.reason})}),(function(e){t.setState({isLoading:!1,error:e.message})}))):this.setState({error:"You must accept the terms of service..."})}},{key:"onLogin",value:function(e){var t=this;e.preventDefault(),this.setState({isLoading:!0}),fetch("login",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"email=".concat(encodeURIComponent(this.username.value))+"&password=".concat(encodeURIComponent(this.password.value))+"&rememberme=".concat(encodeURIComponent(this.rememberMe.checked))}).then((function(e){return e.json()})).then((function(e){e.success?window.location="dashboard":t.setState({isLoading:!1,error:e.reason})}),(function(e){t.setState({isLoading:!1,error:e.message})}))}},{key:"render",value:function(){var e=this,t=this.state.isLoading?i.a.createElement("img",{className:s.a["cog-wheel"],src:"images/cog.svg"}):null,n=!this.state.isLoading&&this.state.error?i.a.createElement("p",{className:s.a["error-message"]},this.state.error):null,o={display:this.state.isLoading||this.state.isLoggedIn?"none":"block"},a=!this.state.isLoggedIn&&i.a.createElement("form",{style:o},i.a.createElement("input",{type:"text",ref:function(t){e.username=t},onSubmit:this.onLogin.bind(this),placeholder:"Email"}),i.a.createElement("input",{type:"password",ref:function(t){e.password=t},onSubmit:this.onLogin.bind(this),placeholder:"Password"}),i.a.createElement("label",{className:s.a["remember-checkbox"]},"Remember Me",i.a.createElement("input",{className:s.a["remember-checkbox-input"],ref:function(t){e.rememberMe=t},type:"checkbox"}),i.a.createElement("span",{className:s.a.checkmark})),i.a.createElement("button",{className:s.a.button,onClick:this.onLogin.bind(this)},"Login"),i.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.toggleForm.bind(this)},"Register")),r=!this.state.isLoggedIn&&i.a.createElement("form",{style:o},i.a.createElement("input",{type:"text",ref:function(t){e.username=t},onSubmit:this.onRegister.bind(this),placeholder:"Email"}),i.a.createElement("input",{type:"password",ref:function(t){e.password=t},onSubmit:this.onRegister.bind(this),placeholder:"Password"}),i.a.createElement("input",{type:"text",ref:function(t){e.name=t},onSubmit:this.onRegister.bind(this),placeholder:"Name"}),i.a.createElement("hr",null),i.a.createElement("input",{type:"password",ref:function(t){e.invitekey=t},onSubmit:this.onRegister.bind(this),placeholder:"Invite Key"}),i.a.createElement("label",{className:s.a["remember-checkbox"]},"I accept the ",i.a.createElement("a",{href:"https://vldr.org/legal"},"terms of service"),".",i.a.createElement("input",{className:s.a["remember-checkbox-input"],ref:function(t){e.rememberMe=t},type:"checkbox"}),i.a.createElement("span",{className:s.a.checkmark})),i.a.createElement("button",{className:s.a.button,onClick:this.onRegister.bind(this)},"Register"),i.a.createElement("button",{className:s.a.button+" "+s.a.inverse,onClick:this.toggleForm.bind(this)},"Back")),c=!this.state.isLoading&&this.state.isLoggedIn&&i.a.createElement("div",{className:s.a["loggged-in-container"]},i.a.createElement("h1",{className:s.a["welcome-title"]},"Hi, ",this.state.name,"."),i.a.createElement("button",{className:s.a["welcome-button"],onClick:this.onOpen.bind(this)},"Open"));return i.a.createElement(i.a.Fragment,null,t,n,this.state.isRegistering?r:a,c)}}])&&c(n.prototype,o),a&&c(n,a),t}(i.a.Component);t.default=d}}]);