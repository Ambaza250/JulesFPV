export const policyPages = {
  '/build-advice': {
    title: 'FPV Build Advice',
    intro: 'A practical walkthrough for planning, assembling, and checking your FPV quad. Parts vary between builds, so use each component’s manual and compatibility notes as your final reference.',
    sections: [
      ['1. Plan a compatible build', 'Choose a frame size and intended flying style first. Match the motor size and KV, propeller size, battery cell count, and flight controller/ESC ratings to that frame and to one another. Check connector types, mounting patterns, physical clearance, and whether your video transmitter works with your goggles and antennas. If a part’s limits are unclear, ask before powering it.'],
      ['2. Prepare your workspace', 'Gather the frame, motors, flight controller and ESC, receiver, video system, battery and matching charger, props, fasteners, soldering iron, solder, heat-shrink, and basic hex drivers. Work on a clean, well-lit, nonconductive surface. Keep the battery disconnected while assembling and soldering; remove propellers during every bench setup and test.'],
      ['3. Build the frame and fit the motors', 'Assemble the frame loosely first, checking the frame maker’s orientation and screw lengths. Mount each motor to an arm with screws that do not reach or press against the motor windings. Route motor wires neatly toward the ESC, away from propellers and sharp edges, then secure them without pinching.'],
      ['4. Install and wire the electronics', 'Mount the ESC and flight controller with the supplied soft mounts and the correct orientation. Confirm the board pinout before soldering: connect the battery leads to the ESC, motors to the ESC, and the flight controller to the ESC harness or pads. Then connect the receiver and video system using their documented voltage, ground, signal, and UART connections. Insulate exposed joints and add strain relief.'],
      ['5. Configure before fitting propellers', 'Connect to your flight controller configurator with props removed. Confirm board orientation, receiver protocol and channel order, arming behavior, motor order and direction, failsafe, and video settings. Use the configurator’s motor test carefully with the battery secured and people clear. Reverse motor direction in software when supported, or follow the ESC maker’s procedure.'],
      ['6. Inspect, then make a cautious first flight', 'Check every fastener, solder joint, wire route, antenna mount, and battery strap. Verify that no wire can touch a motor or propeller and that the battery voltage and cell count are correct. Fit the correct propellers only after bench checks pass, with each prop’s orientation matched to the configured motor direction. Make the first hover in a clear, open area, land promptly, and check for loose parts or unusual heat.'],
      ['Need a hand choosing parts?', 'Send us your frame size, flying style, and the parts you already have. We can help check fit and compatibility before you order. Email uwayezurw@gmail.com or message JulesFPV Support.']
    ],
    shopCta: true
  },
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
      ['Incorrect item received', 'If you receive the wrong product, contact JulesFPV Support immediately and return the item in good condition within 48 hours of delivery.'],
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
