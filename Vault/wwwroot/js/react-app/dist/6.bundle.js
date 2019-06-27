(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[6],{

/***/ "./app/components/list/List.js":
/*!*************************************!*\
  !*** ./app/components/list/List.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sweetalert/with-react */ \"./node_modules/@sweetalert/with-react/dist/sweetalert.js\");\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../info/ActionAlert */ \"./app/components/info/ActionAlert.js\");\n/* harmony import */ var _topbar_Pathbar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../topbar/Pathbar */ \"./app/components/topbar/Pathbar.js\");\n/* harmony import */ var _Folder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Folder */ \"./app/components/list/Folder.js\");\n/* harmony import */ var _File__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./File */ \"./app/components/list/File.js\");\n/* harmony import */ var _Sortbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Sortbar */ \"./app/components/list/Sortbar.js\");\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../App.css */ \"./app/App.css\");\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_App_css__WEBPACK_IMPORTED_MODULE_7__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\n\n\n\n\n\n\nvar signalR = __webpack_require__(/*! @aspnet/signalr */ \"./node_modules/@aspnet/signalr/dist/esm/index.js\");\n\nvar List =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(List, _React$Component);\n\n  function List(props) {\n    var _this;\n\n    _classCallCheck(this, List);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(List).call(this, props)); // Setup our states...\n\n    _this.state = {\n      error: null,\n      finished: false,\n      response: null,\n      shouldScroll: false,\n      offset: 0\n    };\n    return _this;\n  }\n\n  _createClass(List, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      var _this2 = this;\n\n      /////////////////////////////////////////////////////\n      // SignalR setup...\n      /////////////////////////////////////////////////////\n      // Setup our signalR connection...\n      this.connection = new signalR.HubConnectionBuilder().withUrl(\"notifications\").configureLogging(signalR.LogLevel.Information).build(); // Capture our update listing command...\n\n      this.connection.on(\"UpdatePathBar\", function () {\n        return _this2.updatePathBar();\n      });\n      this.connection.on(\"UpdateListing\", function (folderId) {\n        return _this2.updateListing(folderId);\n      });\n      this.connection.on(\"UpdateFolder\", function (obj) {\n        return _this2.updateObject(obj, 'FOLDER');\n      });\n      this.connection.on(\"UpdateFile\", function (obj) {\n        return _this2.updateObject(obj, 'FILE');\n      }); // Capture our onclose event...\n\n      this.connection.onclose(function () {\n        // State that the connection has been lost...\n        console.log(\"Lost connection...\"); // Attempt to reconnect...\n\n        _this2.connectToSignalR();\n      }); // Start our connection and attempt to catch any errors...\n\n      this.connectToSignalR(); /////////////////////////////////////////////////////\n      // Request our list...\n\n      this.requestList(); /////////////////////////////////////////////////////\n\n      window.onscroll = function (e) {\n        var scrollOffset = window.innerHeight + window.pageYOffset;\n        if (_this2.state.shouldScroll && scrollOffset >= document.body.offsetHeight * 0.8) _this2.requestList();\n      };\n    }\n  }, {\n    key: \"updateObject\",\n    value: function updateObject(object, type) {\n      // Setup our response...\n      var response = this.state.response; // Check if our response exists...\n\n      if (!response) return; // Setup our response objects depending whether file or folder...\n\n      var responseObjects = type === 'FILE' ? response.files : response.folders; // Attempt to find our file...\n\n      var index = responseObjects.findIndex(function (x) {\n        return x.id === object.id && x.folder === response.current;\n      }); // Check if index exists...\n\n      if (index !== -1) {\n        // UPDATE operation...\n        if (object.folder === response.current) // Copy the new object to our folders list...\n          responseObjects[index] = object; // REMOVE operation...\n        else // Splice our file listing...\n          responseObjects.splice(index, 1); // Update our state...\n\n        this.setState({\n          response: response\n        }); // Update our search if it is set...\n\n        if (this.props.updateSearch) this.props.updateSearch();\n      } // ADD operation...\n      else if (object.folder === response.current) {\n          // Place our added item to the top of the list...\n          responseObjects.push(object); // Update our state...\n\n          this.setState({\n            response: response\n          }); // Update our search if it is set...\n\n          if (this.props.updateSearch) this.props.updateSearch();\n        }\n    }\n    /**\r\n     * Updates the pathbar...\r\n     */\n\n  }, {\n    key: \"updatePathBar\",\n    value: function updatePathBar() {\n      var _this3 = this;\n\n      fetch(\"process/getpathbar\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        }\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're logged out...\n        if (!result.success) {\n          // Show an error dialog...\n          new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, result.reason)); // Return here...\n\n          return;\n        } // Update our pathbar...\n\n\n        _this3.state.response.path = result.path; // Set state accordingly...\n\n        _this3.setState({\n          response: _this3.state.response\n        });\n      }, function (error) {\n        // Show an error dialog...\n        new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error.message));\n      });\n    }\n  }, {\n    key: \"updateListing\",\n    value: function updateListing(folderId) {\n      // Check if were responsible for this...\n      if (!this.state.response || this.state.response.current !== folderId) return; // Update our list...\n\n      this.requestList(true);\n    }\n    /**\r\n     * Attempts to reconnect to our signalR server... \r\n     */\n\n  }, {\n    key: \"connectToSignalR\",\n    value: function connectToSignalR() {\n      this.connection.start()[\"catch\"](function (err) {\n        // Log our errors...\n        console.error(err.toString()); // Recall our method in 3 seconds...\n\n        setTimeout(this.reconnectToSignalR(), 3000);\n      });\n    }\n    /**\r\n     * Requests the list of files and folders...\r\n     * @param {any} reset Prevents concatting...\r\n     */\n\n  }, {\n    key: \"requestList\",\n    value: function requestList() {\n      var _this4 = this;\n\n      var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;\n      // Disable loading while we request for a list...\n      this.setState({\n        shouldScroll: false\n      }); // Check if reset is enabled...\n\n      if (reset) {\n        // Uh oh, modify our stale copy of the state...\n        this.state.response = null;\n        this.state.offset = 0;\n      }\n\n      fetch(\"process/list\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"offset=\".concat(encodeURIComponent(this.state.offset))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're logged out...\n        if (!result.success) {\n          // Set our state accordingly...\n          _this4.setState({\n            response: null,\n            error: result.reason,\n            finished: true\n          }); // Return here...\n\n\n          return;\n        } // Setup our relative offset...\n\n\n        var offset = _this4.state.offset + result.files.length; // If our response is already set, then concat the new files...\n\n        if (_this4.state.response) {\n          // Filter repeating items...\n          var filteredResult = result.files.filter(function (o1) {\n            return !_this4.state.response.files.some(function (o2) {\n              return o1.id === o2.id;\n            });\n          }); // Concat our filtered result...\n\n          _this4.state.response.files = _this4.state.response.files.concat(filteredResult);\n        } // Increment our file offset and set our state...\n\n\n        _this4.setState({\n          response: _this4.state.response ? _this4.state.response : result,\n          offset: offset,\n          shouldScroll: offset !== result.totalFiles\n        }); // Setup a timeout to update our finished state if it isn't set...\n\n\n        if (!_this4.state.finished) setTimeout(function () {\n          return _this4.setState({\n            finished: true\n          });\n        }, 300);\n      }, function (error) {\n        // Set our state accordingly that we have recieved an error...\n        _this4.setState({\n          finished: true,\n          error: error.message\n        });\n      });\n    }\n    /**\r\n     * Goes to a folder...\r\n     * @param {any} folderId The folder's id number...\r\n     */\n\n  }, {\n    key: \"gotoFolder\",\n    value: function gotoFolder(folderId) {\n      var _this5 = this;\n\n      // Fetch our new result...\n      fetch(\"process/goto\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"folderid=\".concat(encodeURIComponent(folderId))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're logged out...\n        if (!result.success) {\n          // Set our state accordingly...\n          _this5.setState({\n            response: null,\n            error: result.reason,\n            finished: true\n          }); // Return here...\n\n\n          return;\n        } // Close our search if it is set...\n\n\n        if (_this5.props.closeSearch) _this5.props.closeSearch(); // Set state accordingly...\n\n        _this5.setState({\n          response: result,\n          offset: result.files.length,\n          shouldScroll: result.files.length !== result.totalFiles\n        });\n      }, function (error) {\n        _this5.setState({\n          error: error.message\n        });\n      });\n    }\n    /**\r\n     * Opens the folder that a file is located in...\r\n     * @param {any} fileId The id of the file...\r\n     */\n\n  }, {\n    key: \"openFileLocation\",\n    value: function openFileLocation(fileId) {\n      var _this6 = this;\n\n      // Show a loading dialog...\n      new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"center\", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: \"loader\"\n      }))); // Attempt to update the sorting...\n\n      fetch(\"process/openfilelocation\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"fileid=\".concat(encodeURIComponent(fileId))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're logged out...\n        if (!result.success) {\n          // Show an error dialog...\n          new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, result.reason)); // Return here...\n\n          return;\n        } // Close our search if it is set...\n\n\n        if (_this6.props.closeSearch) _this6.props.closeSearch(); // Set state accordingly...\n\n        _this6.setState({\n          response: result,\n          offset: result.files.length,\n          shouldScroll: result.files.length !== result.totalFiles\n        }); // Close our dialog...\n\n\n        _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default.a.close();\n      }, function (error) {\n        // Show an error dialog...\n        new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error.message));\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var _this7 = this;\n\n      // Setup our state variables...\n      var _this$state = this.state,\n          error = _this$state.error,\n          finished = _this$state.finished,\n          response = _this$state.response; /////////////////////////////////////////////////////\n      // Our introduction box...\n\n      var introBox = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_7___default.a[\"intro-box\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        src: \"images/ui/logo.svg\"\n      })); /////////////////////////////////////////////////////\n      // Check if there is an error loading our files...\n\n      if (error) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error); // Check if our content is still loading...\n      else if (!finished) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", null, introBox); // Check if our request was unsuccessful...\n\n      if (!response.success) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, response.reason); // Check if we have an empty homepage...\n\n      if (response.isHome && response.files.length === 0 && response.folders.length === 0) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"center\", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_7___default.a[\"wind\"],\n        src: \"images/ui/wind.png\"\n      })); /////////////////////////////////////////////////////\n\n      var recycleBin = response.folders.find(function (folder) {\n        return folder.isRecycleBin;\n      }); // Setup our previous folder...\n\n      var previousFolder = response.isHome ? null : {\n        id: response.previous,\n        name: \"...\",\n        icon: \"images/file/folder-icon.svg\",\n        style: \"\",\n        isRecycleBin: false,\n        isSharing: false,\n        isPrevious: true\n      }; // Setup our file listing...\n\n      var fileListing = response.files.length ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_7___default.a[\"file-listing\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Sortbar__WEBPACK_IMPORTED_MODULE_6__[\"Sortbar\"], {\n        sort: response.sort\n      }), response.files.map(function (file, i) {\n        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_File__WEBPACK_IMPORTED_MODULE_5__[\"File\"], {\n          key: file.id,\n          file: file,\n          openViewer: _this7.props.openViewer\n        });\n      })) : null; // Setup our folder listing...\n\n      var folderListing = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_7___default.a[\"folder-listing\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Folder__WEBPACK_IMPORTED_MODULE_4__[\"Folder\"], {\n        folder: previousFolder,\n        gotoFolder: this.gotoFolder.bind(this)\n      }), response.folders.map(function (folder) {\n        if (!folder.isRecycleBin) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Folder__WEBPACK_IMPORTED_MODULE_4__[\"Folder\"], {\n          key: folder.id,\n          folder: folder,\n          gotoFolder: _this7.gotoFolder.bind(_this7)\n        });\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Folder__WEBPACK_IMPORTED_MODULE_4__[\"Folder\"], {\n        folder: recycleBin,\n        gotoFolder: this.gotoFolder.bind(this)\n      })); // Otherwise render all our items...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_7___default.a[\"items\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_topbar_Pathbar__WEBPACK_IMPORTED_MODULE_3__[\"Pathbar\"], {\n        path: response.path,\n        gotoFolder: this.gotoFolder.bind(this)\n      }), folderListing, fileListing);\n    }\n  }]);\n\n  return List;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (List);\n\n//# sourceURL=webpack:///./app/components/list/List.js?");

/***/ }),

/***/ "./app/components/list/Sortbar.js":
/*!****************************************!*\
  !*** ./app/components/list/Sortbar.js ***!
  \****************************************/
/*! exports provided: Sortbar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Sortbar\", function() { return Sortbar; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sweetalert/with-react */ \"./node_modules/@sweetalert/with-react/dist/sweetalert.js\");\n/* harmony import */ var _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../App.css */ \"./app/App.css\");\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_App_css__WEBPACK_IMPORTED_MODULE_2__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\nvar Sortbar =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(Sortbar, _React$Component);\n\n  function Sortbar() {\n    _classCallCheck(this, Sortbar);\n\n    return _possibleConstructorReturn(this, _getPrototypeOf(Sortbar).apply(this, arguments));\n  }\n\n  _createClass(Sortbar, [{\n    key: \"getSelectedStyle\",\n\n    /**\r\n     * Gets the styling for each option...\r\n     * @param {any} id The id of the option...\r\n     * @returns {any} Style struct...\r\n     */\n    value: function getSelectedStyle(id) {\n      // Setup our sort variable from our props...\n      var sort = this.props.sort; // Return our selected style...\n\n      return Math.abs(sort) === id ? {\n        fontWeight: \"600\"\n      } : {};\n    }\n    /**\r\n     * Requests to sort by...\r\n     * @param {any} sortBy The number you wish to sort by...\r\n     * @param {any} override Wether to disable auto flipping of the signs...\r\n     */\n\n  }, {\n    key: \"setSort\",\n    value: function setSort(sortBy, override) {\n      // Setup our sort variable from our props...\n      var sort = this.props.sort; // Setup a loading dialog...\n\n      _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default()(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"center\", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"loader\"]\n      })), {\n        buttons: false,\n        closeOnClickOutside: false\n      }); // Attempt to update the sorting...\n\n      fetch(\"process/sortby\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"sortby=\".concat(encodeURIComponent(override ? sortBy : Math.sign(sort) * sortBy))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default.a.close();\n      }, function (error) {\n        _sweetalert_with_react__WEBPACK_IMPORTED_MODULE_1___default()(error.message, {\n          buttons: false\n        });\n      });\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      // Setup our sort variable from our props...\n      var sort = this.props.sort;\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sort-box\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"a\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-option-left\"],\n        style: this.getSelectedStyle(2),\n        onClick: this.setSort.bind(this, 2, false)\n      }, \"Name\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        className: sort >= 0 ? _App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-arrow\"] : _App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-arrow-down\"],\n        onClick: this.setSort.bind(this, -sort, true),\n        src: \"images/ui/arrow.svg\"\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"a\", {\n        className: \"\".concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-option\"], \" \").concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"option-1\"]),\n        style: this.getSelectedStyle(1),\n        onClick: this.setSort.bind(this, 1, false)\n      }, \"Size\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"a\", {\n        className: \"\".concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-option\"], \" \").concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"option-2\"]),\n        style: this.getSelectedStyle(3),\n        onClick: this.setSort.bind(this, 3, false)\n      }, \"Date\"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"a\", {\n        className: \"\".concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"sorting-option\"], \" \").concat(_App_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"option-2\"]),\n        style: this.getSelectedStyle(4),\n        onClick: this.setSort.bind(this, 4, false)\n      }, \"Type\"));\n    }\n  }]);\n\n  return Sortbar;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n//# sourceURL=webpack:///./app/components/list/Sortbar.js?");

/***/ }),

/***/ "./app/components/topbar/Pathbar.js":
/*!******************************************!*\
  !*** ./app/components/topbar/Pathbar.js ***!
  \******************************************/
/*! exports provided: Pathbar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Pathbar\", function() { return Pathbar; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../App.css */ \"./app/App.css\");\n/* harmony import */ var _App_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_App_css__WEBPACK_IMPORTED_MODULE_1__);\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\nvar Pathbar =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(Pathbar, _React$Component);\n\n  function Pathbar() {\n    _classCallCheck(this, Pathbar);\n\n    return _possibleConstructorReturn(this, _getPrototypeOf(Pathbar).apply(this, arguments));\n  }\n\n  _createClass(Pathbar, [{\n    key: \"render\",\n    value: function render() {\n      var _this = this;\n\n      var path = this.props.path;\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _App_css__WEBPACK_IMPORTED_MODULE_1___default.a['folder-path']\n      }, path.map(function (item, i) {\n        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", {\n          key: item.id,\n          onClick: _this.props.gotoFolder.bind(_this, item.id)\n        }, item.name, \" / \");\n      }));\n    }\n  }]);\n\n  return Pathbar;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n//# sourceURL=webpack:///./app/components/topbar/Pathbar.js?");

/***/ })

}]);