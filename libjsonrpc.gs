/*
* libjsonrpc.gs: Implements JSON-RPC 2.0 specification. For details refer to
* http://www.jsonrpc.org/specification
*
*
* (C) Copyright 2013 Michal Liu <michalliu@foxmail.com>
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice (including the next
* paragraph) shall be included in all copies or substantial portions of the
* Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS
* IN THE SOFTWARE.
*
*/


/*
* code      message                   meaning
* -32700    Parse error               Invalid JSON was received by the server.
*                                     An error occurred on the server while parsing the JSON text.
* -32600    Invalid Request           The JSON sent is not a valid Request object.
* -32601    Method not found          The method does not exist / is not available.
* -32602    Invalid params            Invalid method parameter(s).
* -32603    Internal error            Internal JSON-RPC error.
* -32000 to -32099    Server error    Reserved for implementation-defined server-errors.
*/

/*globals ContentService*/
/*jslint unused:false*/
;(function jsonrpc_init(exports,undefined) {
  'use strict';
  /**
  * @param method    A String containing the name of the method to be invoked. 
  *                  Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46) are 
  *                  reserved for rpc-internal methods and extensions and MUST NOT be used for anything else.
  * @param params    A Structured value that holds the parameter values to be used during the invocation of the method. This member MAY be omitted.
  * @param id        An identifier established by the Client that MUST contain a String, Number, or NULL value if included. 
  *                  If it is not included it is assumed to be a notification. 
  *                  The value SHOULD normally not be Null [1] and Numbers SHOULD NOT contain fractional parts
  * @return json-rpc result
  **/
  function doJsonRpc(jsonRpcObj) {
    var jsonRpcResult;
    var fn;
    var namespace;

    var id = jsonRpcObj.id;
    var method=jsonRpcObj.method;
    var params = jsonRpcObj.params;

    if (jsonRpcObj.jsonrpc === undefined) {
      return jsonRpcError(-32600,'Invalid Request, missing parameter jsonrpc.',id);
    }else if (typeof jsonRpcObj.jsonrpc !== 'string') {
      return jsonRpcError(-32600,'Invalid Request, jsonrpc should be string.',id);
    } else if (jsonRpcObj.jsonrpc !== '2.0') {
      return jsonRpcError(-32600,'Invalid Request, jsonrpc must be exactly "2.0".',id);
    }

    if (id===undefined) {
      id=null;
    }

    if (typeof id !== 'string' && !isInteger(id) && id!==null) {
      return jsonRpcError(-32600,'Illegal id',id);
    }

    if (method===undefined) {
      return jsonRpcErrorMethodNotFound(id);
    }

    if (typeof method !== 'string') {
      return jsonRpcError(-32600,'Invalid Request',id);
    } else if (method.match(/^rpc\./) || method.match(/^doGet$/) || method.match(/^doPost$/)) {
      return jsonRpcError(-32600,'Invalid Request, ' + method + ' is reserved',id);
    }

    namespace = method.split('.');
    fn = exports;

    for (var i=0,l=namespace.length;i<l;i++) {
      fn=fn[namespace[i]];
      if (!fn) {
        return jsonRpcError(-32601,'Method not found',id);
      }
    }

    if (typeof fn === 'function') {
      /*
      *  If present, parameters for the rpc call MUST be provided as a Structured value.
      *  Either by-position through an Array or by-name through an Object.
      *
      *  by-position: params MUST be an Array, containing the values in the Server expected order.
      *
      *  by-name:     params MUST be an Object, with member names that match the Server expected parameter names.
      *               The absence of expected names MAY result in an error being generated. 
      *               The names MUST match exactly, including case, to the method's expected parameters.
      */
      if (!Array.isArray(params) &&          // array is allowed
          typeof params !== 'object' &&      // object is allowed
          params !== undefined &&     // undefined is allowed
          params !== null) {          // null is allowed
        return jsonRpcError(-32602,'Invalid params, params accepts an Array or an Object, but can\'t be "' + typeof params + '"',id);
      }
      try {
        if (params === undefined || params === null) {
          jsonRpcResult = fn();
        } else {
          jsonRpcResult = fn(params);
        }
      } catch (e) {
        return jsonRpcError(-32603,'Internal error ' + e,id);
      }
      return jsonRpcSuccess(jsonRpcResult, id);
    }

    return jsonRpcError(-32000,'Invalid Method',id);
  }

  function jsonRpc(request) {
    // the request object should be provided by the framework
    if (!request) {
      return exitWith(jsonRpcError(-32603,'Internal error'),null);
    }

    var op=request.parameters.op;
    var jsonRpcObj, response;

    if (op === undefined) {
      return exitWith(jsonRpcError(-32600,'Invalid Request, missing op',null));
    }

    try {
      jsonRpcObj=JSON.parse(op.toString());
    } catch (JSONParseError) {
      return exitWith(jsonRpcError(-32700,'Parse error, ' + JSONParseError,null));
    }

    // batch request
    if (Array.isArray(jsonRpcObj)) {
      if (jsonRpcObj.length===0) {
        return exitWith(jsonRpcError(-32600,'Invalid Request',null));
      }
      return exitWith(jsonRpcObj.map(function processJsonRpcRequest(detail) {
        return doJsonRpc(detail);
      }));
    } else if (typeof jsonRpcObj === 'object'){ // single request
      return exitWith(doJsonRpc(jsonRpcObj));
    }

    return exitWith(jsonRpcError(-32600,'Invalid Request, invalid op',null));
  }

  function isInteger(n) {
    return typeof n === 'number' && n % 1 === 0;
  }

  function jsonRpcErrorMethodNotFound(id){
    return jsonRpcError(-3260,'Method not found',id);
  }

  /**
  * @param code    A Number that indicates the error type that occurred.
  *                This MUST be an integer.
  * @param message A String providing a short description of the error.
  *                The message SHOULD be limited to a concise single sentence.
  * @param data    A Primitive or Structured value that contains additional information about the error.
  *                This may be omitted.
  *                The value of this member is defined by the Server (e.g. detailed error information, nested errors etc.).
  * @return json-rpc result
  **/
  function jsonRpcError(code, message/*a concise single sentence*/, id /*optinal*/, data/*optional*/){
    var ret={};

    if (!isInteger(code)) {
      throw 'json-rpc error code must be an integer';
    }

    message = message || '';

    ret.error={
      'code': code,
      'message': message
    };

    if (data) {
      ret.data=data;
    }

    // If there was an error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it MUST be Null.
    if (id !== undefined){
      ret.id=id;
    }

    return generateJSONResponse(ret);
  }

  /**
  * @param result    The value of this member is determined by the method invoked on the Server.
  * @param id        It MUST be the same as the value of the id member in the Request Object.
  *                  If there was an error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it MUST be Null.
  * @return json-rpc result
  **/
  function jsonRpcSuccess(result,id) {
    var ret = {};
    if (result === undefined) {
      throw 'json-rpc result is required on succes';
    }
    ret.result = result;
    ret.id=id;
    return generateJSONResponse(ret);
  }

  function generateJSONResponse (responseObj) {
    responseObj.jsonrpc='2.0';
    return responseObj;
  }

  function exitWith(responseObj) {
    var reponseText=JSON.stringify(responseObj);
    return ContentService.createTextOutput(reponseText).setMimeType(ContentService.MimeType.JSON);
  }

  exports.jsonRpc = jsonRpc;

}(this));

function doGet(request) {
  /*globals jsonRpc*/
  return jsonRpc(request);
}

var jsonRpcTest={
  test: function () {
    return 'it\'s working';
  },
  substract: function (params) {
    if (Array.isArray(params)) {
      return params[0] - params[1];
    }
    return params.minuend - params.subtrahend;
  }
};
