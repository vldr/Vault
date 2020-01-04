(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[14],{

/***/ "./app/components/share/ShareViewer.js":
/*!*********************************************!*\
  !*** ./app/components/share/ShareViewer.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../app/App.css */ \"./app/app/App.css\");\n/* harmony import */ var _app_App_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_app_App_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../info/ActionAlert */ \"./app/components/info/ActionAlert.js\");\n/* harmony import */ var _viewer_PhotoView__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../viewer/PhotoView */ \"./app/components/viewer/PhotoView.js\");\n/* harmony import */ var _viewer_AudioView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../viewer/AudioView */ \"./app/components/viewer/AudioView.js\");\n/* harmony import */ var _viewer_VideoView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../viewer/VideoView */ \"./app/components/viewer/VideoView.js\");\n/* harmony import */ var _action_DownloadEncryptedFile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../action/DownloadEncryptedFile */ \"./app/components/action/DownloadEncryptedFile.js\");\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\n\n\n\n\nvar PDFView = react__WEBPACK_IMPORTED_MODULE_0___default.a.lazy(function () {\n  return Promise.all(/*! import() */[__webpack_require__.e(5), __webpack_require__.e(6)]).then(__webpack_require__.bind(null, /*! ../viewer/PDFView */ \"./app/components/viewer/PDFView.js\"));\n});\n\nvar ShareViewer =\n/*#__PURE__*/\nfunction (_React$Component) {\n  _inherits(ShareViewer, _React$Component);\n\n  function ShareViewer(props) {\n    var _this;\n\n    _classCallCheck(this, ShareViewer);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(ShareViewer).call(this, props)); // Setup our states...\n\n    _this.state = {\n      isOpen: false,\n      isLoading: false,\n      response: null\n    };\n    return _this;\n  }\n\n  _createClass(ShareViewer, [{\n    key: \"componentDidMount\",\n    value: function componentDidMount() {\n      if (this.props.id) this.onOpenWithShareId(this.props.id);\n    }\n  }, {\n    key: \"onOpen\",\n    value: function onOpen(fileId) {\n      var _this2 = this;\n\n      // Close our search if it is open...\n      if (this.props.closeSearch) this.props.closeSearch(); // Set our state to be started...\n\n      this.setState({\n        isOpen: true,\n        isLoading: true\n      }); // Fetch our delete file request...\n\n      fetch(\"process/viewer\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"fileid=\".concat(encodeURIComponent(fileId))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're not logged in or something...\n        if (!result.success) {\n          // Stop our loading state...\n          _this2.setState({\n            isLoading: false\n          }); // Render a action alert...\n\n\n          new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, result.reason)); // Close our overlay...\n\n          _this2.close();\n        } // Set our response and turn off isLoading...\n        else _this2.setState({\n            response: result,\n            isLoading: false\n          });\n      }, function (error) {\n        // Stop our loading state...\n        _this2.setState({\n          isLoading: false\n        }); // Render a action alert...\n\n\n        new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error.message)); // Close our overlay...\n\n        _this2.close();\n      });\n    }\n  }, {\n    key: \"onOpenWithShareId\",\n    value: function onOpenWithShareId(shareId) {\n      var _this3 = this;\n\n      // Set our state to be started...\n      this.setState({\n        isOpen: true,\n        isLoading: true\n      }); // Fetch our delete file request...\n\n      fetch(\"viewer\", {\n        method: 'POST',\n        credentials: 'same-origin',\n        headers: {\n          'Content-Type': 'application/x-www-form-urlencoded'\n        },\n        body: \"shareid=\".concat(encodeURIComponent(shareId))\n      }).then(function (res) {\n        return res.json();\n      }).then(function (result) {\n        // Check if we're not logged in or something...\n        if (!result.success) {\n          // Stop our loading state...\n          _this3.setState({\n            isLoading: false\n          }); // Render a action alert...\n\n\n          new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, result.reason));\n        } // Set our response and turn off isLoading...\n        else _this3.setState({\n            response: result,\n            isLoading: false\n          });\n      }, function (error) {\n        // Stop our loading state...\n        _this3.setState({\n          isLoading: false\n        }); // Render a action alert...\n\n\n        new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, error.message));\n      });\n    }\n  }, {\n    key: \"downloadEncryptedFile\",\n    value: function downloadEncryptedFile() {\n      // Render an action alert...\n      new _info_ActionAlert__WEBPACK_IMPORTED_MODULE_2__[\"ActionAlert\"](react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_action_DownloadEncryptedFile__WEBPACK_IMPORTED_MODULE_6__[\"DownloadEncryptedFile\"], {\n        action: this.state.response.relativeURL + this.state.response.url\n      }));\n    }\n  }, {\n    key: \"downloadFile\",\n    value: function downloadFile() {\n      // Setup a form...\n      var form = document.createElement(\"form\");\n      form.method = \"POST\";\n      form.action = this.state.response.relativeURL + this.state.response.url; // Append it to the document...\n\n      document.body.appendChild(form); // Submit it...\n\n      form.submit(); // Remove it from the document...\n\n      document.body.removeChild(form);\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      // Setup a variable to track if everything has loaded...\n      var hasLoaded = !this.state.isLoading && this.state.response; // Setup our loader bar...\n\n      var loaderBar = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['loader']\n      }); // Setup our intro box...\n\n      var introBox = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a[\"intro-box\"]\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        src: \"../images/ui/logo.svg\"\n      })); // Setup our viewer content...\n\n      var topbar = hasLoaded ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['share-overlay-topbar']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"img\", {\n        src: this.state.response.relativeURL + this.state.response.icon\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay-topbar-text']\n      }, this.state.response.name), this.state.response.isEncrypted && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['file-locked']\n      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay-topbar-right']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['btn-download-viewer'],\n        onClick: this.state.response.isEncrypted ? this.downloadEncryptedFile.bind(this) : this.downloadFile.bind(this)\n      }))) : null; // Setup our view...\n\n      var view = hasLoaded ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['overlay-message']\n      }, \"No preview available\", this.state.response.isEncrypted && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"span\", null, \" - due to encryption\")) : null; // Check if our view has loaded...\n\n      if (hasLoaded && !this.state.response.isEncrypted) // Perform a switch to choose our...\n        switch (this.state.response.action) {\n          // PhotoView\n          case \"1\":\n            view = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_viewer_PhotoView__WEBPACK_IMPORTED_MODULE_3__[\"PhotoView\"], {\n              view: this.state.response\n            });\n            break;\n          // VideoView\n\n          case \"2\":\n            view = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_viewer_VideoView__WEBPACK_IMPORTED_MODULE_5__[\"VideoView\"], {\n              view: this.state.response\n            });\n            break;\n          // PDFView\n\n          case \"3\":\n            view = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(PDFView, {\n              view: this.state.response\n            });\n            break;\n          // AudioView\n\n          case \"4\":\n            view = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_viewer_AudioView__WEBPACK_IMPORTED_MODULE_4__[\"AudioView\"], {\n              view: this.state.response\n            });\n            break;\n        } // Render our entire share view system...\n\n      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['share-overlay']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n        className: _app_App_css__WEBPACK_IMPORTED_MODULE_1___default.a['share-view']\n      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Suspense, {\n        fallback: loaderBar\n      }, topbar, hasLoaded && view)));\n    }\n  }]);\n\n  return ShareViewer;\n}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (ShareViewer);\n\n//# sourceURL=webpack:///./app/components/share/ShareViewer.js?");

/***/ })

}]);