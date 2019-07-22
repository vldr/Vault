(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[9],{

/***/ "./app/components/contextmenu/ContextMenu.js":
/*!***************************************************!*\
  !*** ./app/components/contextmenu/ContextMenu.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _peterbee_react_singleton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @peterbee/react-singleton */ \"./node_modules/@peterbee/react-singleton/dist/singleton.min.js\");\n/* harmony import */ var _peterbee_react_singleton__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_peterbee_react_singleton__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../app/App.css */ \"./app/app/App.css\");\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_app_App_css__WEBPACK_IMPORTED_MODULE_2__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\n\nvar ContextMenu =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(ContextMenu, _React$Component);\n\n  function ContextMenu(props) {\n    var _this;\n\n    _classCallCheck(this, ContextMenu);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(ContextMenu).call(this, props));\n    _this.state = {\n      options: null,\n      isOpen: false,\n      x: 0,\n      y: 0,\n      ref: null\n    };\n    return _this;\n  }\n  /**\r\n   * When our component will be mounted... \r\n   */\n\n\n  _createClass(ContextMenu, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      var _this2 = this;\n\n      // Check if our context menu isn't disabled...\n      if (this.props.disabled) return; // Close our contextmenu when we click on something...\n\n      document.documentElement.onclick = function (e) {\n        return _this2.setState({\n          isOpen: false\n        });\n      }; // Prevent the context menu from opening...\n\n\n      document.documentElement.oncontextmenu = function (e) {\n        e.preventDefault();\n        e.stopPropagation();\n        return false;\n      }; // Set our state with our reference...\n\n\n      this.setState({\n        ref: this.ref\n      });\n    }\n  }, {\n    key: \"closeMenu\",\n    value: function closeMenu() {\n      this.setState({\n        isOpen: false\n      });\n    }\n    /**\r\n     * Toggles the menu on and off...\r\n     * @param {any} event The event containing important mouse locations...\r\n     * @param {any} options The options that someone would want to be rendered...\r\n     */\n\n  }, {\n    key: \"toggleMenu\",\n    value: function toggleMenu(event, options) {\n      // Setup our positions...\n      var x = event.pageX || event.targetTouches[0].pageX;\n      var y = event.pageY || event.targetTouches[0].pageY; // Set our state accordingly...\n\n      this.setState({\n        isOpen: true,\n        options: options\n      }); // Setup our variables to calculate the difference of the screen vs the position...\n\n      var rect = this.state.ref.getBoundingClientRect();\n      var differenceX = window.innerWidth - (x + rect.width);\n      var differenceY = window.innerHeight - (y + rect.height); // If there is a difference, adjust x and y...\n\n      if (differenceX < 0) x += differenceX; // Prevent the default browser action...\n\n      event.preventDefault(); // Set our state accordingly...\n\n      this.setState({\n        x: x,\n        y: y\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var _this3 = this;\n\n      // Return here if our component is disabled...\n      if (this.props.disabled) return null; // Setup our menu style...\n\n      var menuStyle = {\n        left: \"\".concat(this.state.x, \"px\"),\n        top: \"\".concat(this.state.y, \"px\"),\n        display: this.state.isOpen ? \"block\" : \"none\"\n      }; // Return the context menu...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['menu'],\n        style: menuStyle,\n        ref: function ref(_ref) {\n          _this3.ref = _ref;\n        }\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"ul\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['menu-options']\n      }, this.state.options));\n    }\n  }]);\n\n  return ContextMenu;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (_peterbee_react_singleton__WEBPACK_IMPORTED_MODULE_1___default()(ContextMenu));\n\n//# sourceURL=webpack:///./app/components/contextmenu/ContextMenu.js?");

/***/ }),

/***/ "./node_modules/@peterbee/react-singleton/dist/singleton.min.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@peterbee/react-singleton/dist/singleton.min.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("!function(t,e){ true?module.exports=e():undefined}(this,function(){\"use strict\";class t{constructor(t){this.instances=[],this.state=t}register(t){this.instances.push(t)}deregister(t){const e=this.instances.indexOf(t);-1!==e&&this.instances.splice(e,1)}syncState(t){this.state=t,this.instances.forEach(e=>{e._superSetState(t)})}}return e=>{let s;return class extends e{constructor(e){super(e),s||(s=new t(this.state)),this.state=s.state,this._superSetState=super.setState}componentDidMount(){s.register(this),super.componentDidMount&&super.componentDidMount()}componentWillUnmount(){s.deregister(this),super.componentWillUnmount&&super.componentWillUnmount()}setState(t,e){super.setState(t,()=>{s.syncState(this.state),e&&e()})}}}});\r\n\n\n//# sourceURL=webpack:///./node_modules/@peterbee/react-singleton/dist/singleton.min.js?");

/***/ })

}]);