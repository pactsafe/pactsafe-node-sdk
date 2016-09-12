
#pactsafe-node

A Node.js client for the [PactSafe](https://www.pactsafe.com) Activity API. Integrate into any application for secure legal record-keeping.

## Installation

```bash
$ npm install --save pactsafe-node
```

## Initialization

Require the `pactsafe-node` module and initialize the Activity client, passing your PactSafe Site's `access_id` as the first argument.
```javascript
var Activty = require('pactsafe-node');
var activity = new Activity('YOUR_ACCESS_ID');
```

## Configuration

The second argument to the `Activity` constructor is an optional object of properties and parameters for the Activity client.
```javascript
var activity = new Activity('YOUR_ACCESS_ID', {
  test_mode: true
});
```

The third argument is an optional object of configuration settings.
```javascript
var activity = new Activity('YOUR_ACCESS_ID', {
  test_mode: true
},
{
  host: 'http://localhost:3000',
  debug: true
});
```

## Parameters

Every Action sent to the PactSafe Activity API is built from the parameters stored on the Activity client. These parameter values can be set or retrieved at any point using the following functions.
```javascript
activity.set('page_title', 'Registration Page');
```
```javascript
var title = activity.get('page_title');
```

## Load

The `load` method lets you load the properties and content of a clickwrap Group by key.

Optionally, you can pass a custom `render_data` object as the second argument -- allowing you to alter the content each time the Group is loaded. For this reason, every response from the `load` request provides a unique `render_id` to use for activity tracking.

The callback is passed two arguments: an error and the Group object.
```javascript
activity.load('GROUP_KEY', {
  order_id: '123abc',
  company_name: 'Example LLC'
},
function(err, group) {
  if (err) console.error(err);
});
```

## Retrieve

The `retrieve` method lets you load a Signer's acceptance history for a given set of Contract IDs.

Providing a `signer_id` and an array of `contracts`, the response will contain a dictionary of each Contract ID and its most recently accepted Version ID, `true` if a Revision has been accepted, or `false` if the Contract has never been accepted by this Signer.

The callback is passed two arguments: an error and the JSON response.
```javascript
activity.retrieve('SIGNER_ID', [ 3, 10, 15 ], function(err, data) {
  if (err) console.error(err);
});
```

## Latest

The `latest` method tells you if a Signer has accepted the latest Version for a given set of Contract IDs.

This method is similar to the `retrieve` method, but instead of providing the actual Version ID that was last accepted, the response contains a boolean `true` or `false` for each contract ID.

The callback is passed two arguments: an error and the JSON response.
```javascript
activity.latest('SIGNER_ID', [ 3, 10, 15 ], function(err, data) {
  if (err) console.error(err);
});
```

## Send

The `send` method lets you track a Signer Action by sending data to the PactSafe Activity API.

Provide an `event_type`, as well as any parameters to save on the Action. The `signer_id` parameter is required for most event types.

The callback is passed an error if the `send` request was unsuccessful.
```javascript
activity.send('updated', {
  signer_id: 'john@example.com',
  custom_data: {
    first_name: 'John',
    last_name: 'Smith',
    title: 'Developer'
  }
},
function(err) {
  if (err) console.error(err);
});
```

## Agreed

The `agreed` method sends a Signer Action to the PactSafe Activity API with the event type `agreed`.

Provide a `signer_id`, as well as any parameters to save on the Action. If the content being accepted was assigned a `render_id`, be sure to include that same `render_id` in the Action parameters.

The callback is passed an error if the `agreed` request was unsuccessful.
```javascript
activity.agreed('john@example.com', {
  render_id: '57d17a38dce301647dd86e12',
  page_title: 'Order Checkout',
  custom_data: {
    order_id: '123abc',
    sku: '7771984a'
  }
},
function(err) {
  if (err) console.error(err);
});
```

## Disagreed

The `disagreed` method sends a Signer Action to the PactSafe Activity API with the event type `disagreed`.

Provide a `signer_id`, as well as any parameters to save on the Action. If the content being denied was assigned a `render_id`, be sure to include that same `render_id` in the Action parameters.

The callback is passed an error if the `disagreed` request was unsuccessful.
```javascript
activity.disagreed('john@example.com', {
  render_id: '57d17a38dce301647dd86e12',
  page_title: 'Order Checkout',
  custom_data: {
    order_id: '345def',
    sku: '7771984a'
  }
},
function(err) {
  if (err) console.error(err);
});
```

## Development

For development, you can enable the `test_mode` parameter when the client is initialized. Any Signers or Actions created within test mode can be easily cleared from your account.
```javascript
var activity = new Activity('YOUR_ACCESS_ID', {
  test_mode: true
});
```

## Documentation

Documentation is available at [https://www.pactsafe.com/libraries/node](https://www.pactsafe.com/libraries/node).


Copyright &copy; 2016 PactSafe, Inc. \<engineering@pactsafe.com\>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
