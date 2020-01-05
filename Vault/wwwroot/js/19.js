(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[19],{

/***/ "./app/components/login/IntroBox.js":
/*!******************************************!*\
  !*** ./app/components/login/IntroBox.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _login_Login_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../login/Login.css */ \"./app/login/Login.css\");\n/* harmony import */ var _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_login_Login_css__WEBPACK_IMPORTED_MODULE_1__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\nvar signalR = __webpack_require__(/*! @aspnet/signalr */ \"./node_modules/@aspnet/signalr/dist/esm/index.js\");\n\n\n\nvar IntroBox =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(IntroBox, _React$Component);\n\n  function IntroBox(props) {\n    var _this;\n\n    _classCallCheck(this, IntroBox);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(IntroBox).call(this, props));\n    _this.state = {\n      isLoading: true,\n      isLoggedIn: false,\n      isRegistering: false,\n      name: null,\n      error: null\n    };\n    _this.onHashBang = _this.onHashBang.bind(_assertThisInitialized(_this));\n    return _this;\n  }\n\n  _createClass(IntroBox, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      var _this2 = this;\n\n      /////////////////////////////////////////////////////\n      // SignalR setup...\n      /////////////////////////////////////////////////////\n      // Setup our signalR connection...\n      this.connection = new signalR.HubConnectionBuilder().withUrl(\"notifications\").configureLogging(signalR.LogLevel.Information).build(); // Capture our update listing command...\n\n      this.connection.on(\"LoginResponse\", function (message) {\n        // Check if successful...\n        if (message.success) // Update our state...\n          _this2.setState({\n            isLoading: false,\n            isLoggedIn: true,\n            name: message.name\n          });else // Disable loading...\n          _this2.setState({\n            isLoading: false\n          });\n      }); // Start our connection to our signalr...\n\n      this.connection.start()[\"catch\"](function (err) {\n        // Disable loading and display an error...\n        _this2.setState({\n          isLoading: false,\n          error: err.toString()\n        });\n      }); // Add a listener for our hashbang catcher...\n\n      window.onhashchange = this.onHashBang;\n    }\n  }, {\n    key: \"componentWillUnmount\",\n    value: function componentWillUnmount() {\n      // Reset our event...\n      window.onhashchange = null;\n    }\n  }, {\n    key: \"onOpen\",\n    value: function onOpen() {\n      window.location = \"dashboard\";\n    }\n  }, {\n    key: \"onHashBang\",\n    value: function onHashBang(event) {\n      // Check if our register hashbang is set...\n      if (!event.newURL.includes(\"#register\")) return; // Check if we're logged in or we're loading...\n\n      if (this.state.isLoading || this.state.isLoggedIn) return; // Remove our hash...\n\n      history.replaceState(null, null, ' '); // Grab focus...\n\n      this.username.focus(); // Set our state to is registering...\n\n      this.setState({\n        isRegistering: true\n      });\n    }\n  }, {\n    key: \"toggleForm\",\n    value: function toggleForm(event) {\n      // Prevent default...\n      event.preventDefault(); // Toggle our state...\n\n      this.setState({\n        isRegistering: !this.state.isRegistering\n      });\n    }\n  }, {\n    key: \"onRegister\",\n    value: function onRegister(event) {\n      var _this3 = this;\n\n      // Prevent default...\n      event.preventDefault();\n\n      if (!this.rememberMe.checked) {\n        // Set our loading to true...\n        this.setState({\n          error: \"You must accept the terms of service...\"\n        }); // Return here...\n\n        return;\n      } // Set our loading to true...\n\n\n      this.setState({\n        isLoading: true\n      }); // Attempt to login...\n\n      fetch(\"register\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"email=\".concat(encodeURIComponent(this.username.value)) + \"&password=\".concat(encodeURIComponent(this.password.value)) + \"&name=\".concat(encodeURIComponent(this.name.value)) + \"&invite=\".concat(encodeURIComponent(this.invitekey.value))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        if (!result.success) {\n          // Set loading to false, and place our error in our state.\n          _this3.setState({\n            isLoading: false,\n            error: result.reason\n          });\n        } // If we've logged in, redirect...\n        else {\n            _this3.setState({\n              isLoading: false,\n              isRegistering: false\n            });\n          }\n      }, function (error) {\n        // Set our state to an error...\n        _this3.setState({\n          isLoading: false,\n          error: error.message\n        });\n      });\n    }\n  }, {\n    key: \"onLogin\",\n    value: function onLogin(event) {\n      var _this4 = this;\n\n      // Prevent default...\n      event.preventDefault(); // Set our loading to true...\n\n      this.setState({\n        isLoading: true\n      }); // Attempt to login...\n\n      fetch(\"login\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"email=\".concat(encodeURIComponent(this.username.value)) + \"&password=\".concat(encodeURIComponent(this.password.value)) + \"&rememberme=\".concat(encodeURIComponent(this.rememberMe.checked))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        if (!result.success) {\n          // Set loading to false, and place our error in our state.\n          _this4.setState({\n            isLoading: false,\n            error: result.reason\n          });\n        } // If we've logged in, redirect...\n        else window.location = \"dashboard\";\n      }, function (error) {\n        // Set our state to an error...\n        _this4.setState({\n          isLoading: false,\n          error: error.message\n        });\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var _this5 = this;\n\n      // Setup our loader...\n      var loader = this.state.isLoading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"cog-wheel\"],\n        src: \"images/cog.svg\"\n      }) : null; // Setup our error...\n\n      var error = !this.state.isLoading && this.state.error ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"error-message\"]\n      }, this.state.error) : null; // Setup our form style...\n\n      var formStyle = {\n        display: this.state.isLoading || this.state.isLoggedIn ? \"none\" : \"block\"\n      }; // Setup our login form...\n\n      var form = !this.state.isLoggedIn && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"form\", {\n        style: formStyle\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"text\",\n        ref: function ref(input) {\n          _this5.username = input;\n        },\n        onSubmit: this.onLogin.bind(this),\n        placeholder: \"Email\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"password\",\n        ref: function ref(input) {\n          _this5.password = input;\n        },\n        onSubmit: this.onLogin.bind(this),\n        placeholder: \"Password\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"label\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"remember-checkbox\"]\n      }, \"Remember Me\", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"remember-checkbox-input\"],\n        ref: function ref(input) {\n          _this5.rememberMe = input;\n        },\n        type: \"checkbox\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"checkmark\"]\n      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"button\"],\n        onClick: this.onLogin.bind(this)\n      }, \"Login\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"button\"] + \" \" + _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"inverse\"],\n        onClick: this.toggleForm.bind(this)\n      }, \"Register\")); // Our register form....\n\n      var registerForm = !this.state.isLoggedIn && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"form\", {\n        style: formStyle\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"text\",\n        ref: function ref(input) {\n          _this5.username = input;\n        },\n        onSubmit: this.onRegister.bind(this),\n        placeholder: \"Email\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"password\",\n        ref: function ref(input) {\n          _this5.password = input;\n        },\n        onSubmit: this.onRegister.bind(this),\n        placeholder: \"Password\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"text\",\n        ref: function ref(input) {\n          _this5.name = input;\n        },\n        onSubmit: this.onRegister.bind(this),\n        placeholder: \"Name\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"hr\", null), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"password\",\n        ref: function ref(input) {\n          _this5.invitekey = input;\n        },\n        onSubmit: this.onRegister.bind(this),\n        placeholder: \"Invite Key\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"label\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"remember-checkbox\"]\n      }, \"I accept the \", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"a\", {\n        href: \"https://vldr.org/legal\"\n      }, \"terms of service\"), \".\", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"remember-checkbox-input\"],\n        ref: function ref(input) {\n          _this5.rememberMe = input;\n        },\n        type: \"checkbox\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"checkmark\"]\n      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"button\"],\n        onClick: this.onRegister.bind(this)\n      }, \"Register\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"button\"] + \" \" + _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"inverse\"],\n        onClick: this.toggleForm.bind(this)\n      }, \"Back\")); // Logged in form...\n\n      var loggedInForm = !this.state.isLoading && this.state.isLoggedIn && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a['loggged-in-container']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"h1\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"welcome-title\"]\n      }, \"Hi, \", this.state.name, \".\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _login_Login_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"welcome-button\"],\n        onClick: this.onOpen.bind(this)\n      }, \"Open\")); // Render our actual login form...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, loader, error, this.state.isRegistering ? registerForm : form, loggedInForm);\n    }\n  }]);\n\n  return IntroBox;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (IntroBox);\n\n//# sourceURL=webpack:///./app/components/login/IntroBox.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ })

}]);