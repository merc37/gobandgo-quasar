import Vue from 'vue';

const script = document.createElement('script');
script.onload = () => {
  // eslint-disable-next-line no-undef
  Vue.prototype.$paypal = paypal;
  script.parentNode.removeChild(script);
};
script.onerror = () => {
  console.error('Error loading Paypal SDK');
};
script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID}`;
document.head.appendChild(script);