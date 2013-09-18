google-app-script-jsonrpc
=========================

An implementation of JSON-RPC 2.0 specification http://www.jsonrpc.org/specification

A few online examples
====
* rpc call with positional parameters:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op={"jsonrpc": "2.0", "method": "jsonRpcTest.substract", "params": [42, 23], "id": 4}

* rpc call with named parameters:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op={"jsonrpc": "2.0", "method": "jsonRpcTest.substract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}

* rpc call of non-existent method:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op={"jsonrpc": "2.0", "method": "foobar", "id": "1"}

* rpc call with invalid JSON:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op={"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]

* rpc call with invalid Request object:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op={"jsonrpc": "2.0", "method": 1, "params": "bar"}

* rpc call Batch, invalid JSON:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op=[{"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},{"jsonrpc": "2.0", "method"]

* rpc call with an empty Array:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op=[]

* rpc call with an invalid Batch (but not empty):

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op=[1]

* rpc call with invalid Batch:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op=[1,2,3]

* rpc call Batch:

        https://script.google.com/macros/s/AKfycbwXJjoFuW-VdkcmuYOOnIFbhC3Xx7r1JUqQgZVVkVyNARt2kos/exec?op=[{"jsonrpc":"2.0","method":"jsonRpcTest.test","id":"1"},{"jsonrpc": "2.0", "method": "jsonRpcTest.substract", "params": {"subtrahend": 23, "minuend": 42}, "id": 2}]
