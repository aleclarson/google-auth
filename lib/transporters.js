/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
// tslint:disable-next-line
var pkg = require('../package.json');
var RequestError = (function (_super) {
    __extends(RequestError, _super);
    function RequestError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RequestError;
}(Error));
exports.RequestError = RequestError;
var DefaultTransporter = (function () {
    function DefaultTransporter() {
    }
    /**
     * Makes a request with given options and invokes callback.
     * @param {object} opts Options.
     * @param {Function=} callback Optional callback.
     * @return {Request} Request object
     */
    DefaultTransporter.prototype.request = function (url, opts) {
        if (!opts) opts = {};
        // set transporter user agent
        opts.headers = opts.headers || {};
        if (!opts.headers['User-Agent']) {
            opts.headers['User-Agent'] = DefaultTransporter.USER_AGENT;
        }
        else if (opts.headers['User-Agent'].indexOf(DefaultTransporter.USER_AGENT) ===
            -1) {
            opts.headers['User-Agent'] =
                opts.headers['User-Agent'] + ' ' + DefaultTransporter.USER_AGENT;
        }
        return request(url, opts).then(function(res) {
            // Only application/json responses should be decoded
            // back to JSON, but there are cases where the API
            // responds without proper content-type.
            try {
                var json = res.json;
            }
            catch(e) {
                res.json = null;
            }
            var error;
            if (json && json.error && res.status !== 200) {
                if (typeof json.error === 'string') {
                    error = new RequestError(json.error);
                    error.code = res.status;
                    throw error;
                }
                if (Array.isArray(json.error.errors)) {
                    error = new RequestError(json.error.errors.map(function (err2) { return err2.message; }).join('\n'));
                    error.code = json.error.code;
                    error.errors = json.error.errors;
                    throw error;
                }
                error = new RequestError(json.error.message);
                error.code = json.error.code || res.status;
                throw error;
            }
            else if (res.status >= 400) {
                // Consider all 4xx and 5xx responses errors.
                error = new RequestError(body);
                error.code = res.status;
                throw error;
            }
            return res;
        });
    };
    return DefaultTransporter;
}());
/**
 * Default user agent.
 */
DefaultTransporter.USER_AGENT = 'google-api-nodejs-client/' + pkg.version;
exports.DefaultTransporter = DefaultTransporter;
