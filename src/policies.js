export const policyPages = {
  '/promise': {
    title: 'The JulesFPV Promise',
    intro: 'Choosing parts for a build should feel exciting, not uncertain. We are here to make every step from choosing gear to getting it in the air feel clearer.',
    sections: [
      ['Pilot-picked gear', 'We choose parts with real FPV builds in mind. Our catalog focuses on gear that has a clear purpose, dependable performance, and a place in the kind of flying our community loves.'],
      ['Advice from people who fly', 'Every build is different. Tell us what you are building, where you fly, or what you are trying to solve, and we will help you make a considered choice.'],
      ['Care from Kigali', 'Your gear is packed with care and prepared for delivery or pickup. We will help you understand the available options and keep you informed as your order moves forward.'],
      ['Here when you need us', 'Questions before or after your order? Reach out to our team. We want you to feel supported, make confident decisions, and get back to the part that matters: flying.']
    ],
    shopCta: true
  },
  '/terms': {
    title: 'Terms of Service',
    intro: 'These terms explain the basic rules for using JulesFPV and placing an order.',
    sections: [
      ['Accounts', 'Keep your account details accurate and protect your password. Activity made through your signed-in account is associated with you. Contact JulesFPV if you believe someone else accessed your account.'],
      ['Products and prices', 'Product availability and prices are shown in Rwandan francs (RWF). Availability can change before an order is verified. The store will contact you if an item becomes unavailable or an order detail needs clarification.'],
      ['Orders and payment', 'Submitting an order and payment screenshot creates an order awaiting review. The order is confirmed for fulfillment only after the store verifies the payment. Please submit a clear, genuine proof of payment.'],
      ['Delivery and pickup', 'Choose delivery or customer pickup at checkout. Delivery requires a usable address. The store will confirm delivery arrangements or pickup instructions after reviewing your order.'],
      ['Contact', 'For questions about an order or these terms, contact uwayezurw@gmail.com.']
    ]
  },
  '/privacy': {
    title: 'Privacy Policy',
    intro: 'This policy describes the information JulesFPV uses to run the store, handle orders, and provide customer support.',
    sections: [
      ['Information we collect', 'Account details, contact information, delivery address when delivery is selected, order contents, payment screenshots, and messages you send through customer support. Support messages are associated with your account. Passwords are stored as secure password hashes, not readable passwords.'],
      ['How we use information', 'We use this information to manage your account, review payment, prepare orders, arrange delivery or pickup, and respond to your support messages.'],
      ['Service providers and storage', 'Account, order, and support conversation records are stored using Firebase/Firestore. Payment proof images are stored as private media in Cloudinary and can be viewed by authorized store administrators. These providers process data to provide the store services.'],
      ['Sharing and retention', 'JulesFPV does not sell customer information. Information is shared with service providers needed to operate the store and retained while needed to manage orders, accounts, support conversations, and applicable recordkeeping.'],
      ['Your choices', 'For a copy or correction of your account information, or a privacy request, contact uwayezurw@gmail.com.']
    ]
  },
  '/about': {
    title: 'About JulesFPV',
    intro: 'Gear up. Fly further.',
    sections: [
      ['Built for FPV builders', 'JulesFPV is an FPV parts shop based in Kigali, Rwanda. We bring together frames, motors, electronics, video systems, and batteries for people building and flying FPV drones.'],
      ['Find your next part', 'Browse the catalog, compare the available options, and reach out if you need help choosing parts for a build. Orders can be delivered or collected by the customer.'],
      ['Get in touch', 'Questions about a product or an order? Email uwayezurw@gmail.com.']
    ]
  },
  '/delivery-payment': {
    title: 'Delivery & Payment Policy',
    intro: 'Choose how to receive your order at checkout. Payment is reviewed by the JulesFPV team before fulfillment.',
    sections: [
      ['Delivery', 'Select Delivery and enter a complete address at checkout. The store will confirm the delivery arrangement, any applicable charge, and timing when reviewing the order.'],
      ['Customer pickup', 'Select I’ll pick it up at checkout. No delivery address is needed. Pickup instructions and collection timing will be confirmed after payment review.'],
      ['Payment methods', 'Choose the Mobile Money number, Mobile Money code, or Bank of Kigali account shown at checkout. All accounts are registered to Jules UWAYEZU. Upload a clear screenshot of the completed payment; the order remains pending until the team verifies it.'],
      ['Payment instructions', '<div id="policyPaymentInstructions" class="policy-payment-details">Choose a payment method at checkout to view its details.</div>'],
      ['Questions', 'For help with delivery, pickup, or payment, contact uwayezurw@gmail.com.']
    ],
    loadPaymentInstructions: true
  }
};

export function renderInfoPage(root, page) {
  root.innerHTML = `<a class="info-back" href="/">← Back to JulesFPV</a><article class="info-document"><span class="eyebrow">JULESFPV · INFORMATION</span><h1>${escapeHtml(page.title)}</h1><p class="info-intro">${escapeHtml(page.intro)}</p><div class="info-sections">${page.sections.map(([heading, body]) => `<section><h2>${escapeHtml(heading)}</h2>${heading === 'Payment instructions' ? body : `<p>${escapeHtml(body)}</p>`}</section>`).join('')}</div>${page.shopCta ? `<div class="promise-shop-cta"><a class="button button-dark" href="/shop">Go to the shop and explore <span>→</span></a></div>` : ''}</article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
