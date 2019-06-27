(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[3],{

/***/ "./app/components/search/Search.js":
/*!*****************************************!*\
  !*** ./app/components/search/Search.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../App.css */ \"./app/App.css\");\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_App_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../info/ActionAlert */ \"./app/components/info/ActionAlert.js\");\n/* harmony import */ var _list_File__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../list/File */ \"./app/components/list/File.js\");\n/* harmony import */ var _list_Folder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../list/Folder */ \"./app/components/list/Folder.js\");\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\n\n\n\nvar Search =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(Search, _React$Component);\n\n  function Search(props) {\n    var _this;\n\n    _classCallCheck(this, Search);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(Search).call(this, props)); // Setup our states...\n\n    _this.state = {\n      isSearching: false,\n      isLoading: false,\n      response: null\n    };\n    return _this;\n  }\n  /**\r\n   * Override the onkeyup event globally.\r\n   */\n\n\n  _createClass(Search, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      var _this2 = this;\n\n      // Hook our onkeypress event...\n      document.documentElement.onkeypress = function (event) {\n        // Check if a modal or a overlay is open...\n        if (document.querySelector(\".swal-overlay--show-modal\") || document.querySelector(\".\".concat(_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay']))) return; // Check if SPACE was pressed...\n\n        if (event.keyCode === 32) return; // Check if ESCAPE was pressed and we're currently searching...\n\n        if (event.keyCode === 27 && _this2.state.isSearching) {\n          // Set our state to display if we're searching...\n          _this2.setState({\n            isSearching: false\n          }); // Return here...\n\n\n          return;\n        } // Set our state to display if we're searching...\n\n\n        _this2.setState({\n          isSearching: true\n        });\n      };\n    }\n  }, {\n    key: \"onClose\",\n    value: function onClose(event) {\n      // Make sure the target was the overlay...\n      if (event.target.className !== _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay']) return; // Close our overlay...\n\n      this.close();\n    }\n  }, {\n    key: \"onSearch\",\n    value: function onSearch() {\n      var _this3 = this;\n\n      // Don't perform search if the box is empty...\n      if (!this.state.isSearching || !this.searchBox.value) return; // Set our state to be started...\n\n      this.setState({\n        isLoading: true\n      }); // Fetch our delete file request...\n\n      fetch(\"process/search\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"term=\".concat(encodeURIComponent(this.searchBox.value))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're not logged in or something...\n        if (!result.success) {\n          // Stop our loading state...\n          _this3.setState({\n            isLoading: false\n          }); // Render a action alert...\n\n\n          new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, result.reason));\n        } // Set our response and turn off isLoading...\n        else _this3.setState({\n            response: result,\n            isLoading: false\n          });\n      }, function (error) {\n        // Stop our loading state...\n        _this3.setState({\n          isLoading: false\n        }); // Render a action alert...\n\n\n        new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error.message));\n      });\n    }\n  }, {\n    key: \"updateSearch\",\n    value: function updateSearch(object, type) {\n      // Setup our response...\n      var response = this.state.response; // Check if our response exists...\n\n      if (!response) return; // Setup our response objects depending whether file or folder...\n\n      var responseObjects = type === 'FILE' ? response.files : response.folders; // Attempt to find our file or folder...\n\n      var index = responseObjects.findIndex(function (x) {\n        return x.id === object.id;\n      }); // Check if index exists...\n\n      if (index !== -1) {\n        // Copy the new object to our folders list...\n        responseObjects[index] = object; // Update our state...\n\n        this.setState({\n          response: response\n        });\n      }\n    }\n  }, {\n    key: \"close\",\n    value: function close() {\n      // Set our state to hide our search overlay...\n      this.setState({\n        isSearching: false,\n        response: null\n      });\n    }\n  }, {\n    key: \"open\",\n    value: function open() {\n      // Set our state to display our search overlay...\n      this.setState({\n        isSearching: true\n      });\n    }\n  }, {\n    key: \"submit\",\n    value: function submit(event) {\n      // Check if we're pressing the enter key...\n      if (event.key !== 'Enter') return; // Check if our folders aren't empty, then go ahead and goto to the folder...\n\n      if (this.state.response.folders.length) this.props.gotoFolder(this.state.response.folders[0].id); // Check if instead our files aren't empty, then go ahead and open the viewer...\n      else if (this.state.response.files.length) this.props.openViewer(this.state.response.files[0].id);\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var _this4 = this;\n\n      // Don't display anything if we're not searching anything...\n      if (!this.state.isSearching) return null; // Setup our loader bar...\n\n      var loaderBar = this.state.isLoading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['loader-bar']\n      }) : null; // Setup our files found...\n\n      var filesFound = this.state.response ? this.state.response.files.map(function (file) {\n        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_list_File__WEBPACK_IMPORTED_MODULE_3__[\"File\"], {\n          file: file,\n          key: file.id,\n          openViewer: _this4.props.openViewer,\n          openFileLocation: _this4.props.openFileLocation,\n          searchCallback: _this4.close.bind(_this4)\n        });\n      }) : null; // Setup our folders found...\n\n      var foldersFound = this.state.response ? this.state.response.folders.map(function (folder) {\n        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_list_Folder__WEBPACK_IMPORTED_MODULE_4__[\"Folder\"], {\n          folder: folder,\n          key: folder.id,\n          gotoFolder: _this4.props.gotoFolder,\n          listView: true\n        });\n      }) : null; // Render our entire search system...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay'],\n        onClick: this.onClose.bind(this)\n      }, loaderBar, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"text\",\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['search-box'],\n        ref: function ref(input) {\n          _this4.searchBox = input;\n        },\n        onChange: this.onSearch.bind(this),\n        onKeyPress: this.submit.bind(this),\n        autoFocus: true,\n        placeholder: \"Search\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['search-content']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['search-close'],\n        onClick: this.close.bind(this)\n      }), foldersFound, filesFound));\n    }\n  }]);\n\n  return Search;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Search);\n\n//# sourceURL=webpack:///./app/components/search/Search.js?");

/***/ }),

/***/ "./node_modules/@peterbee/react-singleton/dist/singleton.min.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@peterbee/react-singleton/dist/singleton.min.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("!function(t,e){ true?module.exports=e():undefined}(this,function(){\"use strict\";class t{constructor(t){this.instances=[],this.state=t}register(t){this.instances.push(t)}deregister(t){const e=this.instances.indexOf(t);-1!==e&&this.instances.splice(e,1)}syncState(t){this.state=t,this.instances.forEach(e=>{e._superSetState(t)})}}return e=>{let s;return class extends e{constructor(e){super(e),s||(s=new t(this.state)),this.state=s.state,this._superSetState=super.setState}componentDidMount(){s.register(this),super.componentDidMount&&super.componentDidMount()}componentWillUnmount(){s.deregister(this),super.componentWillUnmount&&super.componentWillUnmount()}setState(t,e){super.setState(t,()=>{s.syncState(this.state),e&&e()})}}}});\r\n\n\n//# sourceURL=webpack:///./node_modules/@peterbee/react-singleton/dist/singleton.min.js?");

/***/ }),

/***/ "./node_modules/prop-types/factoryWithThrowingShims.js":
/*!*************************************************************!*\
  !*** ./node_modules/prop-types/factoryWithThrowingShims.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\nvar ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ \"./node_modules/prop-types/lib/ReactPropTypesSecret.js\");\n\nfunction emptyFunction() {}\nfunction emptyFunctionWithReset() {}\nemptyFunctionWithReset.resetWarningCache = emptyFunction;\n\nmodule.exports = function() {\n  function shim(props, propName, componentName, location, propFullName, secret) {\n    if (secret === ReactPropTypesSecret) {\n      // It is still safe when called from React.\n      return;\n    }\n    var err = new Error(\n      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +\n      'Use PropTypes.checkPropTypes() to call them. ' +\n      'Read more at http://fb.me/use-check-prop-types'\n    );\n    err.name = 'Invariant Violation';\n    throw err;\n  };\n  shim.isRequired = shim;\n  function getShim() {\n    return shim;\n  };\n  // Important!\n  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.\n  var ReactPropTypes = {\n    array: shim,\n    bool: shim,\n    func: shim,\n    number: shim,\n    object: shim,\n    string: shim,\n    symbol: shim,\n\n    any: shim,\n    arrayOf: getShim,\n    element: shim,\n    elementType: shim,\n    instanceOf: getShim,\n    node: shim,\n    objectOf: getShim,\n    oneOf: getShim,\n    oneOfType: getShim,\n    shape: getShim,\n    exact: getShim,\n\n    checkPropTypes: emptyFunctionWithReset,\n    resetWarningCache: emptyFunction\n  };\n\n  ReactPropTypes.PropTypes = ReactPropTypes;\n\n  return ReactPropTypes;\n};\n\n\n//# sourceURL=webpack:///./node_modules/prop-types/factoryWithThrowingShims.js?");

/***/ }),

/***/ "./node_modules/prop-types/index.js":
/*!******************************************!*\
  !*** ./node_modules/prop-types/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\nif (false) { var throwOnDirectAccess, ReactIs; } else {\n  // By explicitly using `prop-types` you are opting into new production behavior.\n  // http://fb.me/prop-types-in-prod\n  module.exports = __webpack_require__(/*! ./factoryWithThrowingShims */ \"./node_modules/prop-types/factoryWithThrowingShims.js\")();\n}\n\n\n//# sourceURL=webpack:///./node_modules/prop-types/index.js?");

/***/ }),

/***/ "./node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!*************************************************************!*\
  !*** ./node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\nvar ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';\n\nmodule.exports = ReactPropTypesSecret;\n\n\n//# sourceURL=webpack:///./node_modules/prop-types/lib/ReactPropTypesSecret.js?");

/***/ })

}]);