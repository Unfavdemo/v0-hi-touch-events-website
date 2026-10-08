export const VENDOR_AGREEMENT_VERSION = "2026-09";

export const VENDOR_AGREEMENT_TITLE = "HiTouch Vendor Agreement";

export const VENDOR_AGREEMENT_EFFECTIVE = "September 2026";

export interface AgreementSection {
  heading: string;
  body: string;
}

export const VENDOR_AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    heading: "1. Independent contractor",
    body: "You work with HiTouch Solutions as an independent contractor, not as an employee, partner, or agent. You are responsible for your own taxes, insurance, equipment, and how you complete booked work. Nothing in this agreement creates an employment relationship.",
  },
  {
    heading: "2. Tax forms",
    body: "Before you can apply to opportunities or be hired, you must upload a current IRS Form W-9. HiTouch and you can always open it. Partners can open your W-9 and certificate of insurance after they hire you for an opportunity. Other files stay with HiTouch. You agree the information on your W-9 is accurate and that you will upload a new form if your tax details change.",
  },
  {
    heading: "3. Bookings and pay",
    body: "An invite or application is not a booking. You are booked only when a partner or HiTouch hires you for a specific opportunity. Pay is the amount on that booking, paid after the opportunity according to HiTouch’s payout schedule. You are not guaranteed a minimum number of opportunities.",
  },
  {
    heading: "4. Your work",
    body: "Show up on time for setup, perform the work professionally, follow venue and client rules, and stay through breakdown unless the partner releases you. Bring the crew, gear, and licenses you said you would. You may not subcontract a booked opportunity without HiTouch’s written okay.",
  },
  {
    heading: "5. Conduct and confidentiality",
    body: "Treat clients, guests, and other vendors with respect. Do not use client or guest information, photos, or opportunity details for your own marketing without permission. Do not contact partners off-platform to undercut a HiTouch booking.",
  },
  {
    heading: "6. Cancellation",
    body: "If you cannot make a booked opportunity, tell HiTouch as soon as you know. Repeated no-shows or last-minute cancellations can lead to fewer invitations or removal from the network. If a partner cancels, HiTouch will tell you and handle any cancellation pay according to the opportunity terms.",
  },
  {
    heading: "7. Ratings and standing",
    body: "After each completed opportunity, HiTouch and the client may rate your work. Those ratings affect matching. HiTouch may pause or remove vendors whose ratings or conduct fall below our standards.",
  },
  {
    heading: "8. Changes",
    body: "HiTouch may update this agreement. When we do, we will ask you to accept the new version before you can apply to new opportunities. Continuing to use the vendor portal after you accept means you agree to the version shown here.",
  },
];
