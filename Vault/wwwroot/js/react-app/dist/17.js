(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[17],{

/***/ "./app/components/action/UploadDialog.js":
/*!***********************************************!*\
  !*** ./app/components/action/UploadDialog.js ***!
  \***********************************************/
/*! exports provided: UploadDialog */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"UploadDialog\", function() { return UploadDialog; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sweetalert/with-react */ \"./node_modules/@sweetalert/with-react/dist/sweetalert.js\");\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../app/App.css */ \"./app/app/App.css\");\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_app_App_css__WEBPACK_IMPORTED_MODULE_2__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\nvar UploadDialog =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(UploadDialog, _React$Component);\n\n  function UploadDialog(props) {\n    var _this;\n\n    _classCallCheck(this, UploadDialog);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(UploadDialog).call(this, props));\n    _this.state = {\n      view: 0\n    };\n    return _this;\n  }\n  /**\r\n   * Close our dialog when close is needed...\r\n   */\n\n\n  _createClass(UploadDialog, [{\n    key: \"close\",\n    value: function close() {\n      _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default.a.close();\n    }\n  }, {\n    key: \"upload\",\n    value: function upload() {\n      var _this2 = this;\n\n      // Close our dialog...\n      this.close(); // Process all our files...\n\n      this.props.zone.files.forEach(function (item) {\n        // Only process our queued files...\n        if (item.status === \"queued\") {\n          // Set our password param...\n          _this2.props.zone.options.params = {}; // Process our file...\n\n          _this2.props.zone.processFile(item);\n        }\n      });\n    }\n  }, {\n    key: \"uploadAndEncrypt\",\n    value: function uploadAndEncrypt() {\n      var _this3 = this;\n\n      // Check if our value is valid...\n      if (!this.password.value) return; // Focus on our password...\n\n      this.password.focus(); // Close our dialog...\n\n      this.close(); // Process all our files...\n\n      this.props.zone.files.forEach(function (item) {\n        // Only process our queued files...\n        if (item.status === \"queued\") {\n          // Set our password param...\n          _this3.props.zone.options.params = {\n            password: _this3.password.value\n          }; // Process our file...\n\n          _this3.props.zone.processFile(item);\n        }\n      });\n    }\n  }, {\n    key: \"changeView\",\n    value: function changeView(view) {\n      this.setState({\n        view: view\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var _this4 = this;\n\n      var dialog = this.state.view === 0 && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        style: {\n          display: \"flex\"\n        }\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"upload-selection-button\"],\n        onClick: this.upload.bind(this)\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"upload-file-icon\"]\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"h3\", null, \"Upload\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, \"Uploading without encryption provides more features but is less secure against possible threats.\")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"upload-selection-button\"],\n        onClick: this.changeView.bind(this, 1)\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"lock-file-icon\"]\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"h3\", null, \"Upload and Encrypt\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, \"Uploading and encrypting disables previews but is a lot more secure against possible threats.\")));\n      var encrypt = this.state.view === 1 && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"lock-file-icon\"]\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"warning-title\"]\n      }, \"Encrypt File(s)\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"warning-message\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, \"Please type a strong password to encrypt your file(s):\", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"br\", null), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"i\", null, \"(note: if you're uploading multiple files this password will apply to all of them)\")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"input\", {\n        type: \"password\",\n        style: {\n          fontSize: \"28px\"\n        },\n        ref: function ref(input) {\n          _this4.password = input;\n        },\n        onKeyDown: function onKeyDown(e) {\n          if (e.key === 'Enter') _this4.uploadAndEncrypt();\n        }\n      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"button\"],\n        onClick: this.uploadAndEncrypt.bind(this)\n      }, \"Encrypt\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"button\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"button\"] + \" \" + _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"inverse\"],\n        onClick: this.changeView.bind(this, 0)\n      }, \"Go Back\"));\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, encrypt, dialog);\n    }\n  }]);\n\n  return UploadDialog;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n//# sourceURL=webpack:///./app/components/action/UploadDialog.js?");

/***/ }),

/***/ "./app/components/info/ActionAlert.js":
/*!********************************************!*\
  !*** ./app/components/info/ActionAlert.js ***!
  \********************************************/
/*! exports provided: ActionAlert */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ActionAlert\", function() { return ActionAlert; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sweetalert/with-react */ \"./node_modules/@sweetalert/with-react/dist/sweetalert.js\");\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__);\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n\n\nvar ActionAlert = function ActionAlert(action) {\n  _classCallCheck(this, ActionAlert);\n\n  _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default()(action, {\n    buttons: false\n  });\n};\n\n//# sourceURL=webpack:///./app/components/info/ActionAlert.js?");

/***/ }),

/***/ "./app/components/upload/Upload.js":
/*!*****************************************!*\
  !*** ./app/components/upload/Upload.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_dropzone_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dropzone-component */ \"./node_modules/react-dropzone-component/dist/react-dropzone.js\");\n/* harmony import */ var react_dropzone_component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dropzone_component__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../app/App.css */ \"./app/app/App.css\");\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_app_App_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _info_ActionAlert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../info/ActionAlert */ \"./app/components/info/ActionAlert.js\");\n/* harmony import */ var _action_UploadDialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../action/UploadDialog */ \"./app/components/action/UploadDialog.js\");\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\n\n\n\nvar Upload =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(Upload, _React$Component);\n\n  function Upload(props) {\n    var _this;\n\n    _classCallCheck(this, Upload);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(Upload).call(this, props)); // Setup our states...\n\n    _this.state = {\n      uploading: false,\n      finished: false,\n      fileName: null,\n      success: false,\n      status: \"\",\n      uploadedItems: 0,\n      progress: 0,\n      initialized: false\n    }; // Setup our component config...\n\n    _this.componentConfig = {\n      postUrl: 'process/upload'\n    }; // Setup our Dropzone.JS config...\n\n    _this.djsConfig = {\n      autoProcessQueue: false,\n      clickable: \".\".concat(_app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['btnUpload']),\n      parallelUploads: 1,\n      previewsContainer: false,\n      params: {}\n    }; // Setup our handlers...\n\n    _this.eventHandlers = {\n      // Set our init to save our zone object...\n      init: function init(zone) {\n        return _this.zone = zone;\n      },\n      // Process add files...\n      addedfile: _this.processFile.bind(_assertThisInitialized(_this)),\n      // Set our state according to if we're processing a file...\n      processing: function processing(file) {\n        return _this.setState({\n          uploading: true,\n          finished: false,\n          success: false,\n          progress: 0,\n          status: \"Uploading \".concat(file.name)\n        });\n      },\n      // Set our state according to update the progress of each transfer...\n      totaluploadprogress: function totaluploadprogress(totalProgress, totalBytes, totalBytesSent) {\n        return _this.setState({\n          progress: totalProgress\n        });\n      },\n      // Set our state according if we just got recieved an error...\n      error: function error(file, response) {\n        return _this.setState({\n          uploading: true,\n          finished: true,\n          success: false,\n          status: \"Failed to upload \".concat(file.name, \"...\")\n        });\n      },\n      // Setup our state accordingly to display if we've completed a transfer...\n      complete: function complete(file) {\n        // I forgot why I made this check... \n        if (!_this.state.finished) {\n          // Set our state to inform that we've finished everything\n          // and update our status text...\n          _this.setState({\n            uploading: true,\n            finished: true,\n            uploadedItems: _this.state.uploadedItems + 1,\n            success: true,\n            status: _this.state.uploadedItems === 0 ? \"Successfully uploaded \".concat(file.name, \"...\") : \"Uploaded \".concat(_this.state.uploadedItems + 1, \" files...\")\n          });\n        }\n      }\n    };\n    return _this;\n  }\n  /**\r\n   * Override the entire window on file drop and upload...\r\n   */\n\n\n  _createClass(Upload, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      // Hook ondragover so everything else works...\n      document.documentElement.ondragover = function (e) {\n        e.preventDefault();\n        e.stopPropagation();\n      }; // Hook ondragenter so everything else works...\n\n\n      document.documentElement.ondragenter = function (e) {\n        e.preventDefault();\n        e.stopPropagation();\n      }; // Hook on drop...\n\n\n      document.documentElement.ondrop = function (e) {\n        e.preventDefault(); // We have todo this instead of the provided dropzone stuff is cuz it is super broken.\n\n        document.querySelector(\"body > input\").files = e.dataTransfer.files;\n        document.querySelector(\"body > input\").dispatchEvent(new Event('change'));\n      };\n    }\n    /**\r\n     * Reset our events upon unmounting...\r\n     */\n\n  }, {\n    key: \"componentWillUnmount\",\n    value: function componentWillUnmount() {\n      document.documentElement.ondragover = undefined;\n      document.documentElement.ondragenter = undefined;\n      document.documentElement.ondrop = undefined;\n    }\n    /**\r\n     * Processes our file...\r\n     * @param {any} file File\r\n     */\n\n  }, {\n    key: \"processFile\",\n    value: function processFile(file) {\n      new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_3__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(UploadQuestion, {\n        params: this.djsConfig.params,\n        zone: this.zone\n      }));\n    }\n  }, {\n    key: \"start\",\n    value: function start() {\n      this.setState({\n        initialized: true\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      // Setup our snackbar rendering...\n      var progressStyle = {\n        width: \"\".concat(this.state.progress, \"%\")\n      }; // Make our progress bar change colours depending if the transfer failed or not...\n\n      if (this.state.finished && !this.state.success) progressStyle = {\n        borderColor: \"#c14141\",\n        width: \"\".concat(this.state.progress, \"%\")\n      };else if (this.state.finished && this.state.success) progressStyle = {\n        borderColor: \"#7ac142\",\n        width: \"\".concat(this.state.progress, \"%\")\n      }; // Initialize our snackbar progress bar...\n\n      var snackBarProgress = this.state.uploading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-progress'],\n        style: progressStyle\n      }) : null; // The text of our snackbar...\n\n      var snackBarText = this.state.uploading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-text']\n      }, this.state.status) : null; // The failure icon...\n\n      var snackBarFailure = this.state.finished && !this.state.success ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"svg\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-x'],\n        xmlns: \"http://www.w3.org/2000/svg\",\n        viewBox: \"-81 -80 350 350\"\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"path\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-x-check'],\n        d: \"M180.607,10.607l-79.696,79.697l79.696,79.697L170,180.607l-79.696-79.696l-79.696,79.696L0,170.001l79.696-79.697L0,10.607\\r L10.607,0.001l79.696,79.696L170,0.001L180.607,10.607z\"\n      })) : null; // The checkmark icon...\n\n      var snackBarSuccess = this.state.finished && this.state.success ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"svg\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-checkmark'],\n        xmlns: \"http://www.w3.org/2000/svg\",\n        viewBox: \"0 0 52 52\"\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"circle\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-checkmark-circle'],\n        cx: \"26\",\n        cy: \"26\",\n        r: \"25\",\n        fill: \"none\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"path\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-checkmark-check'],\n        fill: \"none\",\n        d: \"M14.1 27.2l7.1 7.2 16.7-16.8\"\n      })) : null; // The loading icon...\n\n      var snackBarLoader = this.state.uploading && !this.state.finished ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-loader']\n      }) : null; // Setup our snackbar to fade out after two seconds upon transfer completion or failure...\n\n      var snackBarFadeOutStyle = this.state.finished ? {\n        animation: \"fadeout 0.6s ease-out 2s 1 normal forwards running\"\n      } : {}; // The entire snackbar...\n\n      var snackBar = this.state.uploading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_2___default.a['snack-bar-upload'],\n        style: snackBarFadeOutStyle\n      }, snackBarLoader, snackBarFailure, snackBarSuccess, snackBarText, snackBarProgress) : null; // Return our rendering of the item...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, this.state.initialized && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_dropzone_component__WEBPACK_IMPORTED_MODULE_1___default.a, {\n        className: \"dropzone\",\n        config: this.componentConfig,\n        eventHandlers: this.eventHandlers,\n        djsConfig: this.djsConfig\n      }), snackBar);\n    }\n  }]);\n\n  return Upload;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Upload);\n\n//# sourceURL=webpack:///./app/components/upload/Upload.js?");

/***/ })

}]);