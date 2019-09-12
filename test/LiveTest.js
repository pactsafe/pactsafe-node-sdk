const assert = require('assert');
const Activity = require('../lib');

const PACTSAFE_ACCESS_ID = '';
const PACTSAFE_GROUP_KEY = '';
const PACTSAFE_SIGNER_ID = '';

assert(PACTSAFE_ACCESS_ID, 'AccessID required for live test');
assert(PACTSAFE_GROUP_KEY, 'Group Key for published group required for live test');
assert(PACTSAFE_SIGNER_ID, 'SignerID required for live test');

const activity = new Activity(PACTSAFE_ACCESS_ID, { test_mode: true });

const PAGE_TITLE = 'Registration Page';
activity.set({page_title: PAGE_TITLE});
const title = activity.get('page_title');
assert(PAGE_TITLE, title);

const renderData = {
  order_id: '123abc',
  company_name: 'Example LLC'
};

const checkAcceptance = (contracts, cb) => {
  activity.retrieve(PACTSAFE_SIGNER_ID, contracts, function(err, data) {
    if (err) console.error(err);
    console.log(data);

    activity.latest(PACTSAFE_SIGNER_ID, contracts, function(err, data) {
      if (err) console.error(err);
      console.log(data);

      if (typeof cb === 'function') cb();
    });
  });
};

activity.load(PACTSAFE_GROUP_KEY, renderData, (err, group) => {
  if (err) console.error(err);
  const renderId = group.get('render_id');
  const contracts = group.get('contracts');
  const payload = {
    render_id: renderId,
    page_title: 'Order Checkout',
    custom_data: { order_id: '123abc', sku: '7771984a' }
  };

  checkAcceptance(contracts, () => {
    activity.agreed(PACTSAFE_SIGNER_ID, payload, (err) => {
      if (err) console.error(err);

      checkAcceptance(contracts, () => {
        activity.disagreed(PACTSAFE_SIGNER_ID, payload, (err) => {
          if (err) console.error(err);

          checkAcceptance(contracts);
        });
      });
    });
  });
});